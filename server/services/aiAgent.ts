import { invokeLLM, Message, ToolCall } from "../_core/llm";
import * as db from "../db";
import { aiTools, searchProperties } from "../tools/propertySearch";
import { Lead } from "../../drizzle/schema";

// ============================================
// 1. FUNÇÕES AUXILIARES
// ============================================

/**
 * Converte o histórico de contexto do banco de dados para o formato de mensagens do LLM.
 * @param context Histórico de contexto do banco de dados.
 * @returns Array de mensagens no formato LLM.
 */
function formatContextToMessages(context: { role: string; message: string }[]): Message[] {
  return context.map(item => ({
    role: item.role as Message["role"],
    content: item.message,
  }));
}

/**
 * Converte os dados do Lead para uma mensagem de sistema para o LLM.
 * @param lead Dados do lead.
 * @returns Mensagem de sistema com o perfil do lead.
 */
function formatLeadToSystemMessage(lead: Lead): string {
  const budgetMinFormatted = lead.budgetMin ? (lead.budgetMin / 100).toLocaleString('pt-BR') : 'Não informado';
  const budgetMaxFormatted = lead.budgetMax ? (lead.budgetMax / 100).toLocaleString('pt-BR') : 'Não informado';
  
  return `O lead atual é ${lead.name}.
  Qualificação: ${lead.qualification || 'nao_qualificado'} (Perfil: ${lead.buyerProfile || 'Não definido'}, Urgência: ${lead.urgencyLevel || 'media'}).
  Interesse: ${lead.transactionInterest || 'venda'}.
  Orçamento: R$ ${budgetMinFormatted} a R$ ${budgetMaxFormatted}.
  Bairros Preferidos: ${lead.preferredNeighborhoods || 'Não especificado'}.
  Tipos Preferidos: ${lead.preferredPropertyTypes || 'Não especificado'}.
  Notas: ${lead.notes || 'Sem notas adicionais'}.
  Use estas informações para personalizar a resposta.`;
}

// ============================================
// 2. LÓGICA PRINCIPAL DO AGENTE DE IA
// ============================================

/**
 * Processa uma mensagem de entrada, gera uma resposta da IA e salva o contexto.
 * @param phone Número de telefone do lead.
 * @param incomingMessage Conteúdo da mensagem do lead.
 * @param sessionId ID da sessão (geralmente o número de telefone).
 * @returns A resposta gerada pela IA.
 */
export async function processIncomingMessage(
  phone: string,
  incomingMessage: string,
  sessionId: string = phone
): Promise<string> {
  // 1. Buscar Lead e Histórico
  const lead = await db.getLeadByPhone(phone);
  const history = await db.getAiContextBySessionId(sessionId);

  if (!lead) {
    // Se não houver lead, a IA deve atuar como um captador inicial
    return "Olá! Sou o assistente virtual da imobiliária. Para que eu possa te ajudar melhor, qual é o seu nome e o que você está procurando (comprar, alugar, tipo de imóvel, localização)?";
  }

  // 2. Montar as Mensagens para o LLM
  const systemPrompt = `Você é um Agente de Atendimento Imobiliário (Corretor de IA) amigável e profissional.
  Seu objetivo é qualificar o lead, responder às suas perguntas e sugerir imóveis relevantes.
  Siga as regras:
  1. Mantenha a conversa natural e em português.
  2. Use a ferramenta 'searchProperties' sempre que o lead perguntar sobre imóveis, preços, tipos ou localização.
  3. Use as informações do perfil do lead (abaixo) para personalizar a resposta.
  4. Se a ferramenta retornar resultados, apresente-os de forma clara, incluindo o código de referência e o link (URL).
  5. Se a ferramenta não retornar resultados, sugira ajustar os filtros.
  
  Perfil do Lead:
  ${formatLeadToSystemMessage(lead)}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...formatContextToMessages(history),
    { role: "user", content: incomingMessage },
  ];

  // 3. Invocar o LLM (Primeira Chamada)
  let response = await invokeLLM({
    messages,
    tools: [aiTools.searchProperties.definition],
    toolChoice: "auto",
  });

  // 4. Loop de Execução de Tools (se houver)
  while (response.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    
    // Adicionar a chamada da tool ao histórico
    messages.push({
        role: "assistant",
        content: "",
        tool_calls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      
      if (toolName === "searchProperties") {
        // Executar a Tool
        const toolResult = await searchProperties(toolArgs);
        
        // Adicionar o resultado da tool ao histórico
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      } else {
        // Tratar tool desconhecida
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Erro: Ferramenta desconhecida: ${toolName}`,
        });
      }
    }

    // 5. Invocar o LLM (Segunda Chamada - com resultado da Tool)
    response = await invokeLLM({
      messages,
      tools: [aiTools.searchProperties.definition],
      toolChoice: "auto",
    });
  }

  // 6. Extrair e Salvar a Resposta Final
  const finalResponse = response.choices[0].message.content as string;

  // Salvar a mensagem do usuário e a resposta da IA no contexto
  await db.saveAiContext({
    sessionId,
    phone,
    message: incomingMessage,
    role: "user",
  });
  await db.saveAiContext({
    sessionId,
    phone,
    message: finalResponse,
    role: "assistant",
  });

  return finalResponse;
}
