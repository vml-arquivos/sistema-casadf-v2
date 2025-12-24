import { Tool } from "../_core/llm";
import * as db from "../db";
import { LeadTransactionInterest } from "@shared/types";

// ============================================
// 1. DEFINIÇÃO DA TOOL PARA O LLM
// ============================================

export const propertySearchTool: Tool = {
  type: "function",
  function: {
    name: "searchProperties",
    description: "Busca imóveis disponíveis no banco de dados com base nos critérios do cliente (orçamento, tipo, localização, etc.). Use esta ferramenta para responder a perguntas sobre imóveis específicos ou para sugerir opções.",
    parameters: {
      type: "object",
      properties: {
        transactionType: {
          type: "string",
          description: "Tipo de transação: 'venda', 'locacao' ou 'ambos'.",
          enum: ["venda", "locacao", "ambos"],
        },
        propertyType: {
          type: "string",
          description: "Tipo de imóvel: 'casa', 'apartamento', 'cobertura', 'terreno', 'comercial', 'rural', 'lancamento'.",
        },
        neighborhood: {
          type: "string",
          description: "Bairro ou região de interesse.",
        },
        minPrice: {
          type: "number",
          description: "Preço mínimo (em Reais).",
        },
        maxPrice: {
          type: "number",
          description: "Preço máximo (em Reais).",
        },
        bedrooms: {
          type: "number",
          description: "Número mínimo de quartos.",
        },
      },
      required: ["transactionType"],
    },
  },
};

// ============================================
// 2. FUNÇÃO DE EXECUÇÃO DA TOOL
// ============================================

export type SearchPropertiesArgs = {
  transactionType: LeadTransactionInterest;
  propertyType?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
};

/**
 * Executa a busca de imóveis no banco de dados.
 * @param args Argumentos da busca fornecidos pelo LLM.
 * @returns Uma string formatada com os resultados da busca.
 */
export async function searchProperties(args: SearchPropertiesArgs): Promise<string> {
  // Converte os preços de Reais para centavos (o db.getAllProperties espera centavos)
  const minPriceCents = args.minPrice ? Math.round(args.minPrice * 100) : undefined;
  const maxPriceCents = args.maxPrice ? Math.round(args.maxPrice * 100) : undefined;

  const filters = {
    transactionType: args.transactionType,
    propertyType: args.propertyType,
    neighborhood: args.neighborhood,
    minPrice: minPriceCents,
    maxPrice: maxPriceCents,
    bedrooms: args.bedrooms,
    status: 'disponivel', // Apenas imóveis disponíveis
  };

  try {
    // Reutiliza a função de listagem de imóveis do leadsRouter (que chama db.getAllProperties)
    const properties = await db.getAllProperties(filters);

    if (properties.length === 0) {
      return "Nenhum imóvel encontrado com os critérios fornecidos.";
    }

    // Formata os resultados para o LLM
    const formattedResults = properties.slice(0, 3).map(prop => ({
      id: prop.id,
      title: prop.title,
      referenceCode: prop.referenceCode,
      propertyType: prop.propertyType,
      transactionType: prop.transactionType,
      neighborhood: prop.neighborhood,
      city: prop.city,
      price: prop.salePrice ? `R$ ${(prop.salePrice / 100).toLocaleString('pt-BR')}` : prop.rentPrice ? `R$ ${(prop.rentPrice / 100).toLocaleString('pt-BR')}/mês` : 'Preço sob consulta',
      bedrooms: prop.bedrooms,
      url: `/imovel/${prop.slug || prop.id}`,
    }));

    return JSON.stringify({
      count: properties.length,
      results: formattedResults,
      message: `Encontrados ${properties.length} imóveis. Exibindo os 3 primeiros.`,
    });

  } catch (error) {
    console.error("Erro ao executar searchProperties:", error);
    return "Ocorreu um erro ao buscar os imóveis. Tente novamente mais tarde.";
  }
}

// ============================================
// 3. MAPA DE TOOLS
// ============================================

export const aiTools = {
  searchProperties: {
    definition: propertySearchTool,
    executor: searchProperties,
  },
};
