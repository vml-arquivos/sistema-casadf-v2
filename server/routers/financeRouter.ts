import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { simulateFinancing } from "../services/finance";

// ============================================
// FINANCE ROUTER
// ============================================

export const financeRouter = router({
  
  // Rota pública para simular e salvar a simulação de financiamento
  simulateAndSave: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Nome é obrigatório"),
      phone: z.string().min(8, "Telefone é obrigatório"),
      email: z.string().email("Email inválido"),
      
      // Dados do Imóvel
      propertyId: z.number().optional(),
      propertyType: z.string().optional(),
      propertyLocation: z.string().optional(),
      propertyValue: z.number().min(100000, "Valor do imóvel deve ser no mínimo R$ 100.000"), // em centavos
      
      // Dados da Simulação
      downPayment: z.number().min(0, "Valor de entrada não pode ser negativo"), // em centavos
      termMonths: z.number().min(12, "Prazo mínimo de 12 meses"),
    }))
    .mutation(async ({ input }) => {
      
      // 1. Simular o financiamento
      const simulationResult = simulateFinancing({
        propertyValue: input.propertyValue,
        downPayment: input.downPayment,
        termMonths: input.termMonths,
      });

      // 2. Criar o registro da simulação no banco de dados
      const newSimulation = await db.createFinanceSimulation({
        ...input,
        ...simulationResult,
        loanAmount: simulationResult.loanAmount, // Garantir que o loanAmount esteja correto
        status: "novo",
      });

      // 3. Criar um Lead a partir da simulação (se não existir)
      let lead = await db.getLeadByPhone(input.phone);

      if (!lead) {
        lead = await db.createLead({
          name: input.name,
          phone: input.phone,
          email: input.email,
          whatsapp: input.phone,
          source: "simulador_financiamento",
          stage: "novo",
          qualification: "morno", // Leads de simulação são mornos por padrão
          notes: `Simulação de Financiamento - Imóvel: R$${(input.propertyValue / 100).toLocaleString('pt-BR')}, Entrada: R$${(input.downPayment / 100).toLocaleString('pt-BR')}, Parcela Estimada: R$${(simulationResult.monthlyPaymentEstimate / 100).toLocaleString('pt-BR')}`,
        });
      } else {
        // Se o lead já existe, apenas adiciona uma interação
        await db.createInteraction({
          leadId: lead.id,
          type: "simulacao",
          subject: "Simulação de Financiamento",
          description: `Nova simulação: Imóvel R$${(input.propertyValue / 100).toLocaleString('pt-BR')}, Entrada R$${(input.downPayment / 100).toLocaleString('pt-BR')}, Parcela Estimada R$${(simulationResult.monthlyPaymentEstimate / 100).toLocaleString('pt-BR')}`,
          metadata: JSON.stringify(newSimulation),
        });
      }

      // 4. Retornar o resultado da simulação
      return {
        ...newSimulation,
        monthlyPaymentEstimate: simulationResult.monthlyPaymentEstimate,
        loanAmount: simulationResult.loanAmount,
      };
    }),
});
