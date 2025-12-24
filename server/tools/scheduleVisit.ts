import { Tool } from "../_core/llm";
import * as db from "../db";

/**
 * Simula o agendamento de uma visita e retorna uma confirmação.
 * Esta função é chamada pelo Agente de IA quando o cliente solicita agendar uma visita.
 * @param propertyId ID do imóvel.
 * @param date Data e hora da visita.
 * @param leadPhone Telefone do lead.
 * @returns Mensagem de confirmação.
 */
export async function scheduleVisit(propertyId: number, date: string, leadPhone: string): Promise<string> {
  const lead = await db.getLeadByPhone(leadPhone);

  if (!lead) {
    return "Erro: Não foi possível encontrar o lead com o telefone fornecido. Peça ao cliente para confirmar o telefone.";
  }

  const property = await db.getPropertyById(propertyId);

  if (!property) {
    return `Erro: Imóvel com ID ${propertyId} não encontrado. Por favor, verifique o ID.`;
  }

  // 1. Cria uma interação no CRM
  await db.createInteraction({
    leadId: lead.id,
    type: "visita_agendada",
    subject: `Visita Agendada para ${property.title}`,
    description: `Visita agendada para o imóvel ${property.title} (${property.referenceCode}) em ${date}.`,
    metadata: JSON.stringify({ propertyId, date }),
  });

  // 2. Atualiza o estágio do lead
  await db.updateLead(lead.id, { stage: "visita_agendada" });

  // 3. Retorna a mensagem de confirmação para o Agente de IA
  return `Visita agendada com sucesso para o imóvel "${property.title}" em ${date}. O corretor responsável entrará em contato para confirmar os detalhes.`;
}

/**
 * Definição da Tool para o LLM.
 */
export const scheduleVisitTool: Tool = {
  type: "function",
  function: {
    name: "scheduleVisit",
    description: "Agenda uma visita a um imóvel para um lead. Use esta função quando o cliente solicitar explicitamente agendar uma visita.",
    parameters: {
      type: "object",
      properties: {
        propertyId: {
          type: "number",
          description: "O ID do imóvel que o cliente deseja visitar. Deve ser obtido de uma busca anterior (searchProperties)."
        },
        date: {
          type: "string",
          description: "A data e hora sugerida para a visita no formato 'YYYY-MM-DD HH:MM'."
        },
        leadPhone: {
          type: "string",
          description: "O número de telefone do lead (cliente) que está solicitando o agendamento."
        }
      },
      required: ["propertyId", "date", "leadPhone"],
    },
  },
};

export const aiTools = [scheduleVisitTool];
