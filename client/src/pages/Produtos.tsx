import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Book, Star, CheckCircle2, Sparkles, Clock, Bell } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Produtos() {
  const [emailInteresse, setEmailInteresse] = useState("");
  const [nomeInteresse, setNomeInteresse] = useState("");
  
  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  const produtos = [
    {
      id: 1,
      titulo: "Catecismo da Igreja Católica",
      descricao: "Obra fundamental que apresenta de forma completa e sistemática o ensinamento da Igreja Católica. Referência essencial para aprofundar a fé e compreender a doutrina católica.",
      preco: "Consultar no Mercado Livre",
      destaque: true,
      disponivel: true,
      linkExterno: "https://mercadolivre.com/sec/1L32bE3",
      beneficios: [
        "Ensinamento completo da Igreja Católica",
        "Organizado em 4 partes principais",
        "Referência para catequese e formação",
        "Citações da Sagrada Escritura",
        "Aprovado pelo Magistério da Igreja"
      ],
    },
    {
      id: 2,
      titulo: "Missal Romano",
      descricao: "Livro litúrgico oficial da Igreja Católica que contém as orações, leituras e ritos para a celebração da Santa Missa. Essencial para sacerdotes, ministros e fiéis que desejam acompanhar a liturgia.",
      preco: "Consultar no Mercado Livre",
      destaque: true,
      disponivel: true,
      linkExterno: "https://mercadolivre.com/sec/2uS2z1T",
      beneficios: [
        "Livro litúrgico oficial da Igreja",
        "Orações e ritos da Santa Missa",
        "Leituras para todo o ano litúrgico",
        "Referência para celebrações",
        "Aprovado pela CNBB"
      ],
    },
    {
      id: 3,
      titulo: "Guia Completo de Repertório Litúrgico",
      descricao: "E-book completo com repertórios para todo o ano litúrgico: Advento, Natal, Quaresma, Páscoa e Tempo Comum. Mais de 200 músicas organizadas com links e cifras.",
      preco: "R$ 47,00",
      destaque: true,
      beneficios: [
        "Repertórios para todo o ano litúrgico",
        "Mais de 200 músicas católicas",
        "Links para YouTube e cifras",
        "Sugestões de momentos da missa",
        "Atualizações gratuitas"
      ],
    },
    {
      id: 4,
      titulo: "Curso de Ministério de Música",
      descricao: "Aprenda a liderar o ministério de música da sua paróquia com técnicas práticas, teoria musical básica e organização de equipes.",
      preco: "R$ 97,00",
      destaque: false,
      beneficios: [
        "10 módulos em vídeo",
        "Certificado de conclusão",
        "Grupo exclusivo de suporte",
        "Materiais complementares em PDF",
        "Acesso vitalício"
      ],
    },
    {
      id: 5,
      titulo: "Pack de Partituras Litúrgicas",
      descricao: "Coleção de partituras profissionais para coral e instrumentos. Ideal para grupos musicais que desejam elevar a qualidade das celebrações.",
      preco: "R$ 67,00",
      destaque: false,
      beneficios: [
        "50+ partituras em PDF",
        "Arranjos para coral SATB",
        "Partes para violão, teclado e flauta",
        "Áudios de referência",
        "Direitos de execução inclusos"
      ],
    }
  ];

  const handleManifestInteresse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInteresse.trim()) {
      toast.error("Por favor, digite seu email");
      return;
    }

    try {
      await newsletterMutation.mutateAsync({
        email: emailInteresse,
        nome: nomeInteresse || undefined,
      });

      toast.success("Obrigado! Você será avisado quando os produtos estiverem disponíveis! 🎉");
      setEmailInteresse("");
      setNomeInteresse("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar interesse");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-bold text-lg text-foreground">Repertório Católico</div>
                  <div className="text-xs text-muted-foreground">LouvaMais Solutions</div>
                </div>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">Início</Button>
              </Link>
              <Link href="/sobre">
                <Button variant="ghost" size="sm">Sobre</Button>
              </Link>
              <Link href="/contato">
                <Button variant="ghost" size="sm">Contato</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Em Breve</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Produtos e E-books
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Estamos preparando materiais exclusivos para elevar o ministério de música da sua paróquia
            </p>
          </div>
        </div>
      </section>

      {/* Produtos Grid */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-8 md:gap-10 max-w-6xl mx-auto">
          {produtos.map((produto) => (
            <Card 
              key={produto.id}
              className={`group transition-all duration-500 ${
                produto.destaque 
                  ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5' 
                  : 'border-border/50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        produto.destaque ? 'bg-primary/20' : 'bg-accent'
                      }`}>
                        <Book className={`w-6 h-6 ${
                          produto.destaque ? 'text-primary' : 'text-accent-foreground'
                        }`} />
                      </div>
                      {produto.destaque && !produto.disponivel && (
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Mais Aguardado
                        </Badge>
                      )}
                      {produto.disponivel ? (
                        <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Em Breve
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">
                      {produto.titulo}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {produto.descricao}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {produto.preco}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">previsão</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Benefícios */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      O que você vai receber:
                    </h4>
                    <ul className="space-y-2">
                      {produto.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status / Ação */}
                  <div className="pt-4 border-t border-border/50">
                    {produto.disponivel && produto.linkExterno ? (
                      <a 
                        href={produto.linkExterno} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full gap-2" size="lg">
                          🛍️ Comprar no Mercado Livre
                        </Button>
                      </a>
                    ) : (
                      <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Produto em desenvolvimento
                        </p>
                      <p className="text-xs text-muted-foreground">
                        Deixe seu email abaixo para ser avisado do lançamento
                      </p>
                    </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulário de Interesse */}
        <div className="max-w-3xl mx-auto mt-16">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Seja o Primeiro a Saber!
              </CardTitle>
              <CardDescription className="text-base">
                Cadastre-se para receber notificação quando os produtos estiverem disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManifestInteresse} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Seu nome (opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Digite seu nome"
                    value={nomeInteresse}
                    onChange={(e) => setNomeInteresse(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Seu email *
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={emailInteresse}
                    onChange={(e) => setEmailInteresse(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={newsletterMutation.isPending}
                >
                  <Bell className="w-5 h-5" />
                  {newsletterMutation.isPending ? "Cadastrando..." : "Quero ser Avisado!"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Não se preocupe, não enviamos spam. Apenas notificaremos sobre o lançamento dos produtos.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Garantia */}
        <div className="max-w-3xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 border border-primary/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Garantia de Qualidade
            </h3>
            <p className="text-muted-foreground">
              Todos os nossos produtos terão garantia de 7 dias. Se você não ficar satisfeito, 
              devolvemos 100% do seu dinheiro. Sem perguntas, sem complicações.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={APP_LOGO} alt="LouvaMais" className="w-8 h-8" />
              <span className="text-lg font-semibold text-foreground">LouvaMais - Church Solutions</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>© 2025 LouvaMais - Church Solutions. Todos os direitos reservados.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 pt-4 border-t border-border/30 mt-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Para a maior glória de Deus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
