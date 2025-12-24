import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bed, Bath, Maximize, MapPin, TrendingUp, Award, Users, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { PropertyFilter } from "@/components/PropertyFilter";
import { PropertyCard } from "@/components/PropertyCard";

// --- Funções Auxiliares (Assumindo que ReviewsSection, AboutSection, ContactSection são necessárias) ---

// Função para renderizar a seção de Reviews (Mantida do original)
function ReviewsSection() {
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery();

  if (isLoading || !reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4" style={{fontFamily: 'montserrat'}}>O que dizem nossos clientes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja a satisfação de quem realizou o sonho da casa própria com a Casa DF.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {review.clientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{review.clientName}</p>
                  <p className="text-sm text-muted-foreground">{review.propertyAddress}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/depoimentos">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Ver Todos os Depoimentos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Função para renderizar a seção Sobre (Mantida do original)
function AboutSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6">Casa DF: Inteligência Imobiliária</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Somos a primeira imobiliária do Distrito Federal a integrar inteligência artificial em todos os processos.
              Nossa missão é simplificar a compra, venda e aluguel de imóveis, oferecendo a melhor experiência com a máxima eficiência.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-xl">Análise de Mercado Inteligente</h3>
                  <p className="text-muted-foreground">Nossa IA avalia o mercado em tempo real para garantir o melhor negócio.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Award className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-xl">Atendimento 24/7 com Agentes de IA</h3>
                  <p className="text-muted-foreground">Agentes de IA prontos para qualificar leads e agendar visitas a qualquer hora.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-xl">Foco no Cliente</h3>
                  <p className="text-muted-foreground">Tecnologia a serviço da sua satisfação e segurança jurídica.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/sobre">
                <Button size="lg">Saiba Mais Sobre Nós</Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <img src="/images/about-us.jpg" alt="Sobre a Casa DF" className="rounded-lg shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Função para renderizar a seção de Contato (Mantida do original)
function ContactSection() {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container text-center">
        <h2 className="text-4xl font-serif font-bold mb-4">Pronto para Encontrar Seu Imóvel?</h2>
        <p className="text-xl mb-8">Fale com um de nossos especialistas ou use nosso simulador.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/contato">
            <Button size="lg" variant="secondary">Fale Conosco</Button>
          </Link>
          <Link href="/simulador">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Simule Seu Financiamento
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENTE PRINCIPAL HOME
// ============================================

export default function Home() {
  const [location, navigate] = useLocation();
  const [filters, setFilters] = useState({
    transactionType: 'venda',
    propertyType: '',
    neighborhood: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });

  // Chama a rota tRPC com os filtros
  const { data: properties, isLoading } = trpc.properties.list.useQuery(filters);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Seção Hero com Filtro de Busca (Estilo QuintoAndar) */}
        <section className="relative h-[60vh] flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(/images/hero-bg.jpg)'}}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white p-4 max-w-6xl mx-auto">
            <h1 className="text-5xl font-serif font-bold mb-4">Casa DF - Inteligência Imobiliária</h1>
            <p className="text-xl mb-8">Encontre o imóvel perfeito com a ajuda da nossa IA.</p>
            
            {/* Componente de Filtro */}
            <PropertyFilter onFilterChange={handleFilterChange} />

          </div>
        </section>
        
        {/* Seção de Vitrine de Imóveis */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">Imóveis Encontrados</h2>
            
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-lg text-muted-foreground">Buscando imóveis...</p>
              </div>
            )}

            {!isLoading && properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property as any} />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">Nenhum imóvel encontrado com os filtros aplicados.</p>
                </div>
              )
            )}
          </div>
        </section>

        <ReviewsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
