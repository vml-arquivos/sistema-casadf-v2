import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { calculateValuation } from "../services/valuation";
import { PropertyType, PropertyCondition } from "../../drizzle/schema"; // Importa os tipos do schema
import * as db from "../db";

// Schema de validação para a entrada da avaliação
const valuationInputSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  
  propertyType: z.enum(PropertyType.enumValues, {
    required_error: "Tipo de imóvel é obrigatório",
  }),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  totalArea: z.number().min(10, "Área total mínima de 10m²"),
  bedrooms: z.number().min(0, "Mínimo de 0 quartos"),
  bathrooms: z.number().min(0, "Mínimo de 0 banheiros"),
  condition: z.enum(PropertyCondition.enumValues, {
    required_error: "Condição do imóvel é obrigatória",
  }),
});

export const valuationRouter = router({
  simulateAndSave: publicProcedure
    .input(valuationInputSchema)
    .mutation(async ({ input }) => {
      // 1. Chama o serviço de cálculo e persistência (que também salva a avaliação)
      const result = await calculateValuation(input);

      // 2. Criar ou atualizar o Lead (Proprietário)
      let lead = await db.getLeadByPhone(input.phone);

      // O valor da avaliação é retornado em centavos
      const estimatedValueMinReais = result.estimatedValueMin / 100;
      const estimatedValueMaxReais = result.estimatedValueMax / 100;

      const notes = `Nova Avaliação de Imóvel: ${input.propertyType} em ${input.neighborhood}. Valor Estimado: R$${estimatedValueMinReais.toLocaleString('pt-BR')} - R$${estimatedValueMaxReais.toLocaleString('pt-BR')}`;

      if (!lead) {
        // Cria um novo lead (Proprietário)
        lead = await db.createLead({
          name: input.name,
          phone: input.phone,
          email: input.email,
          whatsapp: input.phone,
          source: "calculadora_avaliacao",
          stage: "novo",
          qualification: "quente", // Leads de avaliação são quentes (proprietários)
          buyerProfile: "proprietario",
          notes: notes,
        });
      } else {
        // Se o lead já existe, apenas adiciona uma interação
        await db.createInteraction({
          leadId: lead.id,
          type: "avaliacao",
          subject: "Nova Avaliação de Imóvel",
          description: notes,
          metadata: JSON.stringify(input),
        });
      }

      // 3. Retorna a faixa de valor estimada (em centavos)
      return result;
    }),
});
