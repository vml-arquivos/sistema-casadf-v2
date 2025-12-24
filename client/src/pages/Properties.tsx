import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bed, Bath, Car, Ruler, MapPin, SlidersHorizontal, X } from "lucide-react";

export default function Properties() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    propertyType: "",
    transactionType: "",
    neighborhood: "",
    minPrice: "",
    maxPrice: "",
  });
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  // Ler query params da URL ao carregar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters(prev => ({
      ...prev,
      transactionType: params.get("finalidade") || "",
      propertyType: params.get("tipo") || "",
      neighborhood: params.get("bairro") || "",
    }));
  }, [location]);

  const { data: properties, isLoading } = trpc.properties.list.useQuery();

  // Filtrar e ordenar imóveis
  const filteredAndSortedProperties = properties
    ? properties
        .filter((property) => {
          if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
          if (filters.transactionType && property.transactionType !== filters.transactionType) return false;
          if (filters.neighborhood && property.neighborhood !== filters.neighborhood) return false;
          
          const price = property.salePrice || property.rentPrice || 0;
          if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
          if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;
          
          return true;
        })
        .sort((a, b) => {
          const priceA = a.salePrice || a.rentPrice || 0;
          const priceB = b.salePrice || b.rentPrice || 0;
          
          if (sortBy === "price_asc") return priceA - priceB;
          if (sortBy === "price_desc") return priceB - priceA;
          return b.id - a.id; // newest
        })
    : [];

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      transactionType: "",
      neighborhood: "",
      minPrice: "",
      maxPrice: "",
    });
    setLocation("/imoveis");
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Extrair bairros únicos dos imóveis
  const neighborhoods = properties
    ? Array.from(new Set(properties.map((p) => p.neighborhood).filter(Boolean)))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-16">
          <div className="container">
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Imóveis Disponíveis
            </h1>
            <p className="text-xl text-gray-300">
              Explore nossa seleção exclusiva de propriedades de alto padrão
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 bg-gray-50 border-b">
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Filtros</h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={filters.transactionType}
                onValueChange={(value) => {
                  setFilters({ ...filters, transactionType: value });
                  // Atualizar URL
                  const params = new URLSearchParams(window.location.search);
                  if (value) params.set("finalidade", value);
                  else params.delete("finalidade");
                  setLocation(`/imoveis?${params.toString()}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Finalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="locacao">Locação</SelectItem>
                  <SelectItem value="venda_locacao">Venda/Locação</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.propertyType}
                onValueChange={(value) => {
                  setFilters({ ...filters, propertyType: value });
                  // Atualizar URL
                  const params = new URLSearchParams(window.location.search);
                  if (value) params.set("tipo", value);
                  else params.delete("tipo");
                  setLocation(`/imoveis?${params.toString()}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="cobertura">Cobertura</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.neighborhood}
                onValueChange={(value) => {
                  setFilters({ ...filters, neighborhood: value });
                  // Atualizar URL
                  const params = new URLSearchParams(window.location.search);
                  if (value) params.set("bairro", value);
                  else params.delete("bairro");
                  setLocation(`/imoveis?${params.toString()}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bairro" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood || ""}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-center flex items-center justify-center bg-white rounded-md border px-4">
                <span className="text-sm font-medium">
                  {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? "imóvel" : "imóveis"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Listagem de Imóveis */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredAndSortedProperties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600 mb-4">
                  Nenhum imóvel encontrado com os filtros selecionados
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedProperties.map((property) => (
                  <Link key={property.id} href={`/imovel/${property.id}`}>
                    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                      <div
                        className="relative h-64 bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: property.mainImage
                            ? `url(${property.mainImage})`
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge variant="secondary" className="bg-white/90">
                            {property.transactionType === "venda"
                              ? "Venda"
                              : property.transactionType === "locacao"
                              ? "Locação"
                              : "Venda/Locação"}
                          </Badge>
                          <Badge variant="outline" className="bg-white/90">
                            {property.propertyType === "casa"
                              ? "Casa"
                              : property.propertyType === "apartamento"
                              ? "Apartamento"
                              : property.propertyType === "cobertura"
                              ? "Cobertura"
                              : property.propertyType}
                          </Badge>
                        </div>

                        <div className="absolute bottom-4 left-4 text-white">
                          <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {property.salePrice && property.salePrice > 0
                              ? `R$ ${property.salePrice.toLocaleString("pt-BR")}`
                              : property.rentPrice && property.rentPrice > 0
                              ? `R$ ${property.rentPrice.toLocaleString("pt-BR")}/mês`
                              : "Consulte"}
                          </span>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {property.neighborhood}, {property.city}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {property.bedrooms && property.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" /> {property.bedrooms}
                            </span>
                          )}
                          {property.bathrooms && property.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" /> {property.bathrooms}
                            </span>
                          )}
                          {property.parkingSpaces && property.parkingSpaces > 0 && (
                            <span className="flex items-center gap-1">
                              <Car className="h-4 w-4" /> {property.parkingSpaces}
                            </span>
                          )}
                          {property.totalArea && property.totalArea > 0 && (
                            <span className="flex items-center gap-1">
                              <Ruler className="h-4 w-4" /> {property.totalArea}m²
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
