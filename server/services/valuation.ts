import * as db from "../db";
import { PropertyValuation, PropertyType, PropertyCondition, InsertPropertyValuation } from "../../drizzle/schema";

// Fatores de Multiplicação Simplificados (Baseado em uma análise de mercado fictícia do DF)
const BASE_PRICE_PER_SQM: Record<PropertyType, number> = {
  apartamento: 8000, // R$ 8.000/m²
  casa: 6500,        // R$ 6.500/m²
  cobertura: 12000,  // R$ 12.000/m²
  terreno: 3000,     // R$ 3.000/m²
  comercial: 9000,   // R$ 9.000/m²
};

const CONDITION_MULTIPLIER: Record<PropertyCondition, number> = {
  excelente: 1.15, // +15%
  bom: 1.0,        // Base
  regular: 0.85,   // -15%
  necessita_reforma: 0.70, // -30%
};

// Fatores de Localização (Exemplo simplificado para o DF)
const NEIGHBORHOOD_FACTOR: Record<string, number> = {
  'asa sul': 1.3,
  'asa norte': 1.25,
  'lago sul': 1.5,
  'sudoeste': 1.4,
  'aguas claras': 1.1,
  'guara': 1.0,
  'taguatinga': 0.9,
  'ceilandia': 0.8,
};

// Fatores de Quartos/Banheiros (Exemplo)
const ROOM_FACTOR = 1.05; // +5% por quarto/banheiro adicional (além de 2/1)

interface ValuationInput {
  name: string;
  phone: string;
  email: string;
  propertyType: PropertyType;
  neighborhood: string;
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  condition: PropertyCondition;
}

interface ValuationResult {
  estimatedValueMin: number;
  estimatedValueMax: number;
}

/**
 * Simula a avaliação de um imóvel com base em fatores de mercado.
 * O resultado é uma faixa de valor (min/max) para simular a complexidade do Quinto Andar.
 */
export async function calculateValuation(input: ValuationInput): Promise<ValuationResult> {
  const { propertyType, neighborhood, totalArea, bedrooms, bathrooms, condition } = input;

  // 1. Preço Base por m²
  const basePricePerSqm = BASE_PRICE_PER_SQM[propertyType] || BASE_PRICE_PER_SQM.apartamento;

  // 2. Fator de Localização
  const neighborhoodKey = neighborhood.toLowerCase().trim();
  const locationFactor = NEIGHBORHOOD_FACTOR[neighborhoodKey] || 1.0; // 1.0 se não estiver na lista

  // 3. Fator de Condição
  const conditionFactor = CONDITION_MULTIPLIER[condition] || 1.0;

  // 4. Fator de Tamanho/Comodidades
  const roomBonus = Math.max(0, (bedrooms - 2) * 0.05) + Math.max(0, (bathrooms - 1) * 0.05);
  const totalFactor = locationFactor * conditionFactor * (1 + roomBonus);

  // 5. Cálculo do Valor Base
  let estimatedValue = basePricePerSqm * totalArea * totalFactor;

  // 6. Geração da Faixa de Valor (Simulação Quinto Andar)
  // Faixa de 5% para baixo e 5% para cima
  const estimatedValueMin = Math.round(estimatedValue * 0.95);
  const estimatedValueMax = Math.round(estimatedValue * 1.05);

  // 7. Persistência dos Dados
  const valuationData: Omit<InsertPropertyValuation, 'id' | 'createdAt'> = {
    name: input.name,
    phone: input.phone,
    email: input.email,
    propertyType: propertyType,
    neighborhood: neighborhood,
    totalArea: totalArea,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    condition: condition,
    estimatedValueMin: estimatedValueMin * 100, // Salva em centavos
    estimatedValueMax: estimatedValueMax * 100, // Salva em centavos
    notes: `Avaliação automática gerada pelo sistema. Fatores: Localização (${locationFactor.toFixed(2)}), Condição (${conditionFactor.toFixed(2)}).`,
  };

  await db.createPropertyValuation(valuationData);

  // Retorna o resultado em Reais para o Frontend
  return {
    estimatedValueMin: estimatedValueMin * 100,
    estimatedValueMax: estimatedValueMax * 100,
  };
}
