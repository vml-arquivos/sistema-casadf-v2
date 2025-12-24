import { InsertFinanceSimulation } from "../../drizzle/schema";

// ============================================
// 1. DADOS DE MERCADO (TAXAS DE JUROS)
// ============================================

// Taxa Referencial (TR) mensal fictícia para simulação (TR real varia)
const TR_MONTHLY = 0.0015; // 0.15% ao mês

export const BANK_RATES = [
  { name: "Caixa Econômica Federal", annualRate: 0.0850, tr: TR_MONTHLY }, // 8.50% a.a. + TR
  { name: "Banco do Brasil", annualRate: 0.0829, tr: TR_MONTHLY }, // 8.29% a.a. + TR
  { name: "Itaú Unibanco", annualRate: 0.0745, tr: TR_MONTHLY }, // 7.45% a.a. + TR
  { name: "Bradesco", annualRate: 0.0730, tr: TR_MONTHLY }, // 7.30% a.a. + TR
  { name: "Santander", annualRate: 0.0799, tr: TR_MONTHLY }, // 7.99% a.a. + TR
];

// ============================================
// 2. FÓRMULAS DE AMORTIZAÇÃO
// ============================================

/**
 * Calcula a parcela mensal usando a Tabela Price (Parcelas Constantes).
 * @param loanAmount Valor do financiamento (em centavos).
 * @param monthlyRate Taxa de juros mensal (decimal).
 * @param termMonths Prazo em meses.
 * @returns Valor da parcela mensal (em centavos).
 */
function calculatePricePayment(loanAmount: number, monthlyRate: number, termMonths: number): number {
  if (loanAmount <= 0 || termMonths <= 0 || monthlyRate <= 0) {
    return 0;
  }

  // Fórmula da Tabela Price: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const powerTerm = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = loanAmount * (monthlyRate * powerTerm) / (powerTerm - 1);

  return Math.round(monthlyPayment);
}

/**
 * Calcula a primeira parcela mensal usando a Tabela SAC (Amortização Constante).
 * A parcela é decrescente, então retornamos a primeira parcela (a maior).
 * @param loanAmount Valor do financiamento (em centavos).
 * @param monthlyRate Taxa de juros mensal (decimal).
 * @param termMonths Prazo em meses.
 * @returns Valor da primeira parcela mensal (em centavos).
 */
function calculateSACFirstPayment(loanAmount: number, monthlyRate: number, termMonths: number): number {
  if (loanAmount <= 0 || termMonths <= 0) {
    return 0;
  }

  // Amortização Constante (A)
  const amortization = loanAmount / termMonths;

  // Juros da primeira parcela (J1)
  const firstInterest = loanAmount * monthlyRate;

  // Primeira Parcela (P1) = A + J1
  const firstPayment = amortization + firstInterest;

  return Math.round(firstPayment);
}

// ============================================
// 3. LÓGICA DE SIMULAÇÃO AVANÇADA
// ============================================

export type AmortizationSystem = "price" | "sac";

export interface BankSimulationResult {
  bankName: string;
  system: AmortizationSystem;
  annualRate: number;
  monthlyRate: number;
  firstPaymentEstimate: number; // Primeira parcela (maior)
  loanAmount: number;
}

/**
 * Simula o financiamento para todos os bancos e sistemas de amortização.
 * @param data Dados de entrada da simulação.
 * @returns Array de resultados de simulação por banco e sistema.
 */
export function simulateAdvancedFinancing(data: {
  propertyValue: number; // em centavos
  downPayment: number; // em centavos
  termMonths: number;
}): BankSimulationResult[] {
  
  const loanAmount = data.propertyValue - data.downPayment;
  
  if (loanAmount <= 0) {
    return [];
  }

  const results: BankSimulationResult[] = [];

  BANK_RATES.forEach(bank => {
    // Taxa de juros mensal (Anual / 12)
    const monthlyRate = bank.annualRate / 12;
    
    // Taxa de juros efetiva mensal (Juros + TR)
    const effectiveMonthlyRate = monthlyRate + bank.tr;

    // Simulação Price
    const pricePayment = calculatePricePayment(loanAmount, effectiveMonthlyRate, data.termMonths);
    results.push({
      bankName: bank.name,
      system: "price",
      annualRate: bank.annualRate,
      monthlyRate: effectiveMonthlyRate,
      firstPaymentEstimate: pricePayment,
      loanAmount: loanAmount,
    });

    // Simulação SAC
    const sacFirstPayment = calculateSACFirstPayment(loanAmount, effectiveMonthlyRate, data.termMonths);
    results.push({
      bankName: bank.name,
      system: "sac",
      annualRate: bank.annualRate,
      monthlyRate: effectiveMonthlyRate,
      firstPaymentEstimate: sacFirstPayment,
      loanAmount: loanAmount,
    });
  });

  return results.sort((a, b) => a.firstPaymentEstimate - b.firstPaymentEstimate);
}

/**
 * Salva a simulação no banco de dados (usando o melhor resultado como base).
 * @param data Dados de entrada da simulação.
 * @param bestResult O melhor resultado da simulação (menor parcela).
 * @returns Objeto de inserção para o banco de dados.
 */
export function createFinanceSimulationInsertData(data: {
  name: string;
  phone: string;
  email: string;
  propertyValue: number; // em centavos
  downPayment: number; // em centavos
  termMonths: number;
}, bestResult: BankSimulationResult): InsertFinanceSimulation {
  
  const loanAmount = data.propertyValue - data.downPayment;

  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    propertyValue: data.propertyValue,
    downPayment: data.downPayment,
    loanAmount: loanAmount,
    interestRate: bestResult.annualRate, // Salva a taxa anual do melhor banco
    termMonths: data.termMonths,
    monthlyPaymentEstimate: bestResult.firstPaymentEstimate,
    propertyId: undefined,
    propertyType: undefined,
    propertyLocation: undefined,
    status: "novo",
    assignedTo: undefined,
  };
}
