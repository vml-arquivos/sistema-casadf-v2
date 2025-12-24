import { InsertFinanceSimulation } from "../../drizzle/schema";

// Taxa de juros anual média (exemplo)
const ANNUAL_INTEREST_RATE = 0.08; // 8% ao ano

/**
 * Calcula a estimativa da parcela mensal usando a fórmula de amortização Price.
 * @param loanAmount Valor do financiamento (em centavos).
 * @param termMonths Prazo em meses.
 * @param annualInterestRate Taxa de juros anual (decimal).
 * @returns Valor da parcela mensal (em centavos).
 */
function calculateMonthlyPayment(loanAmount: number, termMonths: number, annualInterestRate: number): number {
  if (loanAmount <= 0 || termMonths <= 0) {
    return 0;
  }

  // Taxa de juros mensal
  const monthlyInterestRate = annualInterestRate / 12;

  // Fórmula da Tabela Price: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const powerTerm = Math.pow(1 + monthlyInterestRate, termMonths);
  const monthlyPayment = loanAmount * (monthlyInterestRate * powerTerm) / (powerTerm - 1);

  return Math.round(monthlyPayment);
}

/**
 * Simula o financiamento e retorna os dados completos.
 * @param data Dados de entrada da simulação.
 * @returns Dados completos da simulação, incluindo a estimativa da parcela.
 */
export function simulateFinancing(data: {
  propertyValue: number; // em centavos
  downPayment: number; // em centavos
  termMonths: number;
}): Omit<InsertFinanceSimulation, 'id' | 'name' | 'phone' | 'email' | 'propertyType' | 'propertyLocation' | 'status' | 'assignedTo' | 'createdAt' | 'updatedAt'> {
  
  const loanAmount = data.propertyValue - data.downPayment;
  
  if (loanAmount <= 0) {
    return {
      propertyValue: data.propertyValue,
      downPayment: data.downPayment,
      loanAmount: 0,
      interestRate: ANNUAL_INTEREST_RATE,
      termMonths: data.termMonths,
      monthlyPaymentEstimate: 0,
      propertyId: undefined,
    };
  }

  const monthlyPaymentEstimate = calculateMonthlyPayment(
    loanAmount,
    data.termMonths,
    ANNUAL_INTEREST_RATE
  );

  return {
    propertyValue: data.propertyValue,
    downPayment: data.downPayment,
    loanAmount: loanAmount,
    interestRate: ANNUAL_INTEREST_RATE,
    termMonths: data.termMonths,
    monthlyPaymentEstimate: monthlyPaymentEstimate,
    propertyId: undefined,
  };
}
