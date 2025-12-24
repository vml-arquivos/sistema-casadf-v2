import { InsertPropertyValuation } from "../../drizzle/schema";

// Fatores de ajuste baseados em análise de mercado simplificada
const BASE_PRICE_PER_SQM = 500000; // R$ 5.000 por m² (em centavos)
const CONDITION_MULTIPLIER = {
  "excelente": 1.2,
  "bom": 1.0,
  "regular": 0.8,
  "necessita_reforma": 0.6,
};
const BEDROOM_BONUS = 5000000; // R$ 50.000 por quarto (em centavos)
const BATHROOM_BONUS = 3000000; // R$ 30.000 por banheiro (em centavos)

/**
 * Simula a avaliação de um imóvel com base em fatores simplificados.
 * O modelo do QuintoAndar é complexo (Machine Learning), esta é uma aproximação.
 * @param data Dados de entrada da avaliação.
 * @returns Estimativa de valor mínimo e máximo (em centavos).
 */
export function simulateValuation(data: {
  propertyType: string;
  neighborhood: string;
  totalArea: number; // em m²
  bedrooms: number;
  bathrooms: number;
  condition: "excelente" | "bom" | "regular" | "necessita_reforma";
}): { estimatedValueMin: number; estimatedValueMax: number } {
  
  // 1. Valor Base pela Área
  let baseValue = data.totalArea * BASE_PRICE_PER_SQM;

  // 2. Ajuste pela Condição
  const conditionMultiplier = CONDITION_MULTIPLIER[data.condition] || 1.0;
  baseValue *= conditionMultiplier;

  // 3. Bônus por Quartos e Banheiros
  baseValue += data.bedrooms * BEDROOM_BONUS;
  baseValue += data.bathrooms * BATHROOM_BONUS;

  // 4. Ajuste por Localização (Simplificado: apenas um bônus se for um bairro "premium")
  const locationBonus = data.neighborhood.toLowerCase().includes("lago sul") || data.neighborhood.toLowerCase().includes("asa sul") ? 1.1 : 1.0;
  baseValue *= locationBonus;

  // 5. Faixa de Valor (Margem de 10% para min/max)
  const estimatedValueMin = Math.round(baseValue * 0.95);
  const estimatedValueMax = Math.round(baseValue * 1.05);

  return {
    estimatedValueMin,
    estimatedValueMax,
  };
}

/**
 * Cria o objeto de inserção para o banco de dados.
 * @param data Dados de entrada da avaliação.
 * @returns Objeto completo para inserção.
 */
export function createValuationInsertData(data: {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  neighborhood: string;
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  condition: "excelente" | "bom" | "regular" | "necessita_reforma";
}): InsertPropertyValuation {
  
  const valuationResult = simulateValuation(data);

  return {
    ...data,
    ...valuationResult,
    status: "novo",
  };
}
