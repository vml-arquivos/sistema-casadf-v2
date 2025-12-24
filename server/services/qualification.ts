import { invokeLLM, OutputSchema } from "../_core/llm";
import { LeadQualification, LeadSource, LeadTransactionInterest, LeadUrgencyLevel, LeadBuyerProfile } from "@shared/types";

// ============================================
// 1. DEFINIÇÃO DO SCHEMA DE SAÍDA PARA A IA
// ============================================

const qualificationSchema: OutputSchema = {
  name: "LeadQualification",
  schema: {
    type: "object",
    properties: {
      qualification: {
        type: "string",
        description: "Classificação do lead: 'quente' (pronto para comprar/alugar), 'morno' (interessado, mas não urgente), 'frio' (apenas pesquisando) ou 'nao_qualificado'.",
        enum: ["quente", "morno", "frio", "nao_qualificado"],
      },
      buyerProfile: {
        type: "string",
        description: "Perfil do comprador: 'investidor', 'primeira_casa', 'upgrade', 'curioso', 'indeciso', 'proprietario'.",
        enum: ["investidor", "primeira_casa", "upgrade", "curioso", "indeciso", "proprietario"],
      },
      urgencyLevel: {
        type: "string",
        description: "Nível de urgência: 'baixa', 'media', 'alta', 'urgente'.",
        enum: ["baixa", "media", "alta", "urgente"],
      },
      transactionInterest: {
        type: "string",
        description: "Tipo de transação de interesse: 'venda', 'locacao' ou 'ambos'.",
        enum: ["venda", "locacao", "ambos"],
      },
      budgetMin: {
        type: "number",
        description: "Orçamento mínimo estimado (em reais). Se não for possível estimar, use 0.",
      },
      budgetMax: {
        type: "number",
        description: "Orçamento máximo estimado (em reais). Se não for possível estimar, use 0.",
      },
      preferredNeighborhoods: {
        type: "string",
        description: "Lista de bairros preferidos, separados por vírgula. Se não houver, use string vazia.",
      },
      preferredPropertyTypes: {
        type: "string",
        description: "Lista de tipos de imóveis preferidos (ex: 'casa', 'apartamento', 'cobertura'), separados por vírgula. Se não houver, use string vazia.",
      },
      notes: {
        type: "string",
        description: "Resumo da intenção do lead em uma frase, para ser adicionado às notas do lead.",
      }
    },
    required: ["qualification", "buyerProfile", "urgencyLevel", "transactionInterest", "budgetMin", "budgetMax", "preferredNeighborhoods", "preferredPropertyTypes", "notes"],
  },
  strict: true,
};

// ============================================
// 2. FUNÇÃO DE QUALIFICAÇÃO
// ============================================

export type LeadQualificationInput = {
  message: string;
  source: LeadSource;
  interestedPropertyId?: number;
};

export type LeadQualificationResult = {
  qualification: LeadQualification;
  buyerProfile: LeadBuyerProfile;
  urgencyLevel: LeadUrgencyLevel;
  transactionInterest: LeadTransactionInterest;
  budgetMin: number; // Em centavos
  budgetMax: number; // Em centavos
  preferredNeighborhoods: string;
  preferredPropertyTypes: string;
  notes: string;
};

/**
 * Utiliza o LLM para analisar a mensagem inicial do lead e preencher os campos de qualificação.
 * @param input Dados iniciais do lead, incluindo a mensagem.
 * @returns Um objeto com os campos de qualificação preenchidos.
 */
export async function qualifyLead(input: LeadQualificationInput): Promise<LeadQualificationResult> {
  const systemPrompt = `Você é um Analista de CRM Imobiliário de elite. Sua tarefa é analisar a mensagem inicial de um novo lead e extrair o máximo de informações possível para qualificar o cliente.
  
  Com base na mensagem, preencha o JSON de saída com as seguintes regras:
  1. **qualification**: Avalie o quão pronto para a compra/aluguel o lead está.
  2. **buyerProfile**: Identifique o perfil principal do cliente.
  3. **urgencyLevel**: Estime a urgência do negócio.
  4. **transactionInterest**: Identifique se o interesse é em 'venda', 'locacao' ou 'ambos'.
  5. **budgetMin/budgetMax**: Estime o orçamento em Reais. Se a mensagem indicar valores em milhares (ex: 'R$ 500 mil'), converta para o valor total (ex: 500000). Se não houver informação, use 0.
  6. **preferredNeighborhoods/preferredPropertyTypes**: Extraia os bairros e tipos de imóveis mencionados.
  7. **notes**: Crie um resumo conciso da intenção do lead.
  
  Aja com precisão e use apenas os valores permitidos no schema.`;

  const userMessage = `Mensagem do Lead (Fonte: ${input.source}): "${input.message}"
  ${input.interestedPropertyId ? `O lead demonstrou interesse inicial no imóvel ID: ${input.interestedPropertyId}.` : ''}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      outputSchema: qualificationSchema,
    });

    // O resultado do LLM com outputSchema é uma string JSON
    const jsonString = result.choices[0].message.content as string;
    const aiData = JSON.parse(jsonString);

    // Converte os valores de orçamento para centavos (inteiros) para consistência com o banco de dados
    const budgetMinCents = Math.round(aiData.budgetMin * 100);
    const budgetMaxCents = Math.round(aiData.budgetMax * 100);

    return {
      qualification: aiData.qualification as LeadQualification,
      buyerProfile: aiData.buyerProfile as LeadBuyerProfile,
      urgencyLevel: aiData.urgencyLevel as LeadUrgencyLevel,
      transactionInterest: aiData.transactionInterest as LeadTransactionInterest,
      budgetMin: budgetMinCents,
      budgetMax: budgetMaxCents,
      preferredNeighborhoods: aiData.preferredNeighborhoods,
      preferredPropertyTypes: aiData.preferredPropertyTypes,
      notes: aiData.notes,
    };
  } catch (error) {
    console.error("Erro ao qualificar lead com LLM:", error);
    // Retorna valores padrão em caso de falha da IA
    return {
      qualification: "nao_qualificado" as LeadQualification,
      buyerProfile: "curioso" as LeadBuyerProfile,
      urgencyLevel: "baixa" as LeadUrgencyLevel,
      transactionInterest: "venda" as LeadTransactionInterest,
      budgetMin: 0,
      budgetMax: 0,
      preferredNeighborhoods: "",
      preferredPropertyTypes: "",
      notes: `Falha na qualificação automática. Mensagem original: ${input.message}`,
    };
  }
}
