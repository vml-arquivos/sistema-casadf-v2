import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { createValuationInsertData } from "../services/valuation";

// ============================================
// VALUATION ROUTER
// ============================================

export const valuationRouter = router({
  
  // Rota pública para simular e salvar a avaliação de imóvel
  simulateAndSave: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Nome é obrigatório"),
      phone: z.string().min(8, "Telefone é obrigatório"),
      email: z.string().email("Email inválido"),
      
      // Dados do Imóvel
      propertyType: z.string().min(1, "Tipo de imóvel é obrigatório"),
      neighborhood: z.string().min(1, "Bairro é obrigatório"),
      totalArea: z.number().min(1, "Área total é obrigatória"),
      bedrooms: z.number().min(0).optional(),
      bathrooms: z.number().min(0).optional(),
      condition: z.enum(["excelente", "bom", "regular", "necessita_reforma"], {
        required_error: "Condição do imóvel é obrigatória",
      }),
    }))
    .mutation(async ({ input }) => {
      
      // 1. Simular a avaliação e obter os dados de inserção
      const valuationData = createValuationInsertData({
        ...input,
        bedrooms: input.bedrooms || 0,
        bathrooms: input.bathrooms || 0,
      });

      // 2. Criar o registro da avaliação no banco de dados
      const newValuation = await db.createPropertyValuation(valuationData);

      // 3. Criar um Lead a partir da avaliação (se não existir)
      let lead = await db.getLeadByPhone(input.phone);

      if (!lead) {
        lead = await db.createLead({
          name: input.name,
          phone: input.phone,
          email: input.email,
          whatsapp: input.phone,
          source: "calculadora_avaliacao",
          stage: "novo",
          qualification: "quente", // Leads de avaliação são quentes (proprietários)
          notes: `Avaliação de Imóvel - Tipo: ${input.propertyType}, Bairro: ${input.input.neighborhood}, Valor Estimado: R$${(newValuation.estimatedValueMin / 100).toLocaleString('pt-BR')} - R$${(newValuation.estimatedValueMax / 100).toLocaleString('pt-BR')}`,
        });
      } else {
        // Se o lead já existe, apenas adiciona uma interação
        await db.createInteraction({
          leadId: lead.id,
          type: "avaliacao",
          subject: "Avaliação de Imóvel",
          description: `Nova avaliação: Tipo ${input.propertyType}, Bairro ${input.neighborhood}, Valor Estimado: R$${(newValuation.estimatedValueMin / 100).toLocaleString('pt-BR')} - R$${(newValuation.estimatedValueMax / 100).toLocaleString('pt-BR')}`,
          metadata: JSON.stringify(newValuation),
        });
      }

      // 4. Retornar o resultado da avaliação
      return {
        ...newValuation,
        estimatedValueMin: newValuation.estimatedValueMin,
        estimatedValueMax: newValuation.estimatedValueMax,
      };
    }),
});
