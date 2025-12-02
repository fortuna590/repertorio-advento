import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Book, Star, CheckCircle2, Clock, Bell } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
            <Clock className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-purple-200">Em Breve</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Produtos e E-books
          </h1>
          <p className="text-xl text-purple-200">
            Estamos preparando materiais exclusivos para elevar o ministério de música da sua paróquia
          </p>
        </div>

        {/* Produtos Grid */}
        <div className="grid gap-8 md:gap-10 mb-12">
          {produtos.map((produto) => (
            <Card 
              key={produto.id}
              className={`group transition-all duration-500 ${
                produto.destaque 
                  ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/50' 
                  : 'bg-slate-800 border-purple-500/20'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        produto.destaque ? 'bg-purple-500/30' : 'bg-purple-500/20'
                      }`}>
                        <Book className={`w-6 h-6 ${
                          produto.destaque ? 'text-purple-300' : 'text-purple-400'
                        }`} />
                      </div>
                      {produto.destaque && !produto.disponivel && (
                        <Badge className="bg-purple-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Mais Aguardado
                        </Badge>
                      )}
                      {produto.disponivel ? (
                        <Badge className="bg-green-500/30 text-green-200 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Em Breve
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-2 text-white">
                      {produto.titulo}
                    </CardTitle>
                    <CardDescription className="text-base text-purple-200">
                      {produto.descricao}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-pink-400">
                      {produto.preco}
                    </div>
                    <p className="text-xs text-purple-300 mt-1">previsão</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Benefícios */}
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-pink-400" />
                      O que você vai receber:
                    </h4>
                    <ul className="space-y-2">
                      {produto.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-start gap-2 text-purple-200">
                          <CheckCircle2 className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                          <span>{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status / Ação */}
                  <div className="pt-4 border-t border-purple-500/20">
                    {produto.disponivel && produto.linkExterno ? (
                      <a 
                        href={produto.linkExterno} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full gap-2 size-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                          🛍️ Comprar no Mercado Livre
                        </Button>
                      </a>
                    ) : (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white mb-1">
                          Produto em desenvolvimento
                        </p>
                        <p className="text-xs text-purple-300">
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
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/30 mx-auto mb-4">
                <Bell className="w-8 h-8 text-purple-300" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-white">
                Seja o Primeiro a Saber!
              </CardTitle>
              <CardDescription className="text-base text-purple-200">
                Cadastre-se para receber notificação quando os produtos estiverem disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManifestInteresse} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Seu nome (opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Digite seu nome"
                    value={nomeInteresse}
                    onChange={(e) => setNomeInteresse(e.target.value)}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Seu email *
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={emailInteresse}
                    onChange={(e) => setEmailInteresse(e.target.value)}
                    required
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  disabled={newsletterMutation.isPending}
                >
                  <Bell className="w-5 h-5" />
                  {newsletterMutation.isPending ? "Cadastrando..." : "Quero ser Avisado!"}
                </Button>
                
                <p className="text-xs text-purple-300 text-center">
                  Não se preocupe, não enviamos spam. Apenas notificaremos sobre o lançamento dos produtos.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Garantia */}
        <div className="max-w-3xl mx-auto mb-12 p-8 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/30 mb-4">
              <CheckCircle2 className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Garantia de Qualidade
            </h3>
            <p className="text-purple-200">
              Todos os nossos produtos terão garantia de 7 dias. Se você não ficar satisfeito, 
              devolvemos 100% do seu dinheiro. Sem perguntas, sem complicações.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">Repertório Católico</span>
              </div>
              <p className="text-purple-200 text-sm">
                Músicas litúrgicas para enriquecer suas celebrações
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </Link>
                <Link href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                  Blog
                </Link>
                <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
            <p>© 2025 LouvaMais - Repertório Católico. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
