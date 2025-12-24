import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Building2, 
  Users, 
  TrendingUp, 
  Phone, 
  Mail,
  MapPin,
  CheckCircle2,
  Star
} from "lucide-react";

export default function About() {
  const achievements = [
    { icon: Building2, value: "500+", label: "Imóveis Vendidos" },
    { icon: Users, value: "1000+", label: "Clientes Satisfeitos" },
    { icon: TrendingUp, value: "R$ 2B+", label: "Em Transações" },
    { icon: Award, value: "15+", label: "Anos de Experiência" },
  ];

  const certifications = [
    "CRECI-DF [Número do CRECI]",
    "Especialista em Imóveis de Luxo",
    "Certificação Internacional em Negociação Imobiliária",
    "Membro da Associação Brasileira de Imóveis de Alto Padrão",
  ];

  const values = [
    {
      title: "Exclusividade",
      description: "Trabalhamos apenas com imóveis de alto padrão em Brasília, garantindo atendimento personalizado e exclusivo para cada cliente.",
    },
    {
      title: "Transparência",
      description: "Todas as informações sobre os imóveis são apresentadas de forma clara e honesta, sem surpresas ou custos ocultos.",
    },
    {
      title: "Expertise",
      description: "Mais de 15 anos de experiência no mercado de luxo de Brasília, conhecendo profundamente cada bairro nobre da capital.",
    },
    {
      title: "Resultados",
      description: "Foco em resultados concretos, com estratégias personalizadas para venda ou compra do imóvel dos seus sonhos.",
    },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      text: "Hernani foi fundamental na compra da minha mansão no Lago Sul. Profissionalismo e atenção aos detalhes impecáveis!",
      rating: 5,
    },
    {
      name: "Carlos Eduardo",
      role: "Investidor",
      text: "Vendi minha cobertura em tempo recorde graças ao trabalho excepcional do Hernani. Recomendo sem ressalvas!",
      rating: 5,
    },
    {
      name: "Ana Paula",
      role: "Médica",
      text: "Encontrei o imóvel perfeito para minha família. O atendimento foi personalizado e superou todas as expectativas.",
      rating: 5,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Quem Somos - Hernani Muniz | Corretor de Imóveis de Luxo em Brasília</title>
        <meta 
          name="description" 
          content="Conheça Hernani Muniz, especialista em imóveis de luxo em Brasília com mais de 15 anos de experiência. CRECI-DF, atendimento personalizado e resultados comprovados." 
        />
        <meta property="og:title" content="Quem Somos - Hernani Muniz | Corretor de Imóveis de Luxo" />
        <meta property="og:description" content="Mais de 15 anos de experiência no mercado de imóveis de luxo em Brasília. Especialista em Lago Sul, Lago Norte e Park Way." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Mais de 15 anos de experiência
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Hernani Muniz
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Especialista em Imóveis de Luxo em Brasília
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Mais de uma década dedicada a conectar pessoas aos imóveis dos seus sonhos. 
                Especializado em mansões, coberturas e propriedades exclusivas nos bairros mais 
                nobres de Brasília.
              </p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Biography */}
        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="/ernani-nunes-photo.jpg"
                  alt="Hernani Muniz - Corretor de Imóveis de Luxo"
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Trajetória Profissional
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Iniciou sua carreira no mercado imobiliário de Brasília há mais de 15 anos, 
                    rapidamente se especializando no segmento de alto padrão. Sua paixão por 
                    arquitetura e design, aliada ao profundo conhecimento do mercado local, 
                    tornaram-no referência em imóveis de luxo na capital federal.
                  </p>
                  <p>
                    Ao longo de sua carreira, Hernani intermediou a venda de algumas das 
                    propriedades mais exclusivas de Brasília, incluindo mansões no Lago Sul, 
                    coberturas panorâmicas e fazendas no Park Way. Seu diferencial está no 
                    atendimento personalizado e na capacidade de entender exatamente o que 
                    cada cliente busca.
                  </p>
                  <p>
                    Com formação continuada em negociação imobiliária e marketing digital, 
                    Hernani combina tradição e inovação para oferecer o melhor serviço aos 
                    seus clientes. Sua abordagem consultiva e transparente conquistou a 
                    confiança de centenas de famílias e investidores.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Certificações e Credenciais</h3>
                  <ul className="space-y-2">
                    {certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nossos Valores
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Princípios que guiam nosso trabalho e garantem a satisfação dos nossos clientes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                O Que Dizem Nossos Clientes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Depoimentos reais de clientes satisfeitos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para Encontrar Seu Imóvel dos Sonhos?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Entre em contato e descubra como posso ajudá-lo a realizar o melhor negócio da sua vida.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="gap-2" asChild>
                  <a href="https://wa.me/5561999999999" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="/contato">
                    <Mail className="w-5 h-5" />
                    Enviar Mensagem
                  </a>
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Telefone</div>
                    <a href="tel:+556132544464" className="text-muted-foreground hover:text-primary">
                      (61) 3254-4464
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Email</div>
                    <a href="mailto:ernaniSimiao@hotmail.com" className="text-muted-foreground hover:text-primary">
                      ernaniSimiao@hotmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Localização</div>
                    <span className="text-muted-foreground">
                      Brasília - DF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
