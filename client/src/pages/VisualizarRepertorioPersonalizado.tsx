import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Download,
  Music,
  User,
  Link as LinkIcon,
  Youtube,
  ExternalLink,
  Share,
  Check,
  FileText,
} from "lucide-react";
import { generateRepertorioPDF } from "@/lib/pdfGenerator";

const MOMENTOS_ORDEM = [
  // Momentos da Missa
  "Entrada",
  "Ato Penitencial",
  "Glória",
  "Aclamação",
  "Ofertório",
  "Santo",
  "Cordeiro",
  "Comunhão",
  "Final",
  // Momentos do Grupo de Oração
  "Acolhida",
  "Animação",
  "Oração/Entrega",
  "Espírito Santo",
  "Palavra",
  "Louvor",
  "Outro",
];

export default function VisualizarRepertorioPersonalizado() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Detectar se é um shareId (UUID) ou ID numérico
  const isShareId = id.includes("-"); // UUIDs contêm hífens
  const isPublicView = isShareId; // Visualização pública via link compartilhado

  // Usar endpoint apropriado baseado no tipo de ID
  const { data: repertorio, isLoading } = isShareId
    ? trpc.repertoriosPersonalizados.buscarPorShareId.useQuery({ shareId: id })
    : trpc.repertoriosPersonalizados.buscarPorId.useQuery({ id: parseInt(id) });

  const [linkCopiado, setLinkCopiado] = useState(false);

  const copiarLinkCompartilhamento = async () => {
    if (!repertorio?.shareId) {
      toast.error("Repertório não está público");
      return;
    }
    
    const linkPublico = `${window.location.origin}/repertorio-personalizado/${repertorio.shareId}`;
    
    try {
      await navigator.clipboard.writeText(linkPublico);
      setLinkCopiado(true);
      toast.success("Link copiado para área de transferência!");
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  const gerarPDF = (incluirLinks: boolean = true) => {
    if (!repertorio) return;

    try {
      generateRepertorioPDF(
        {
          nome: repertorio.nome,
          descricao: repertorio.descricao || undefined,
          notas: (repertorio as any).notas || undefined,
          dataCelebracao: (repertorio as any).dataCelebracao || undefined,
          tipoTemplate: repertorio.tipoTemplate || undefined,
          tags: repertorio.tags ? JSON.parse(repertorio.tags) : [],
          musicas: repertorio.musicas.map((m: any) => ({
            id: m.id.toString(),
            titulo: m.titulo,
            artista: m.artista || "",
            tom: m.tom || undefined,
            momento: m.momento || undefined,
            linkCifra: m.linkCifra || undefined,
            linkYoutube: m.linkYoutube || undefined,
            linkLetra: m.linkLetra || undefined,
          })),
        },
        { incluirLinks }
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const gerarPDFSemLinks = () => {
    gerarPDF(false);
  };

  const gerarPDFComLinks = () => {
    gerarPDF(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando repertório...</p>
        </div>
      </div>
    );
  }

  if (!repertorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Repertório não encontrado</h2>
          <Button onClick={() => setLocation("/meus-repertorios")}>
            Voltar para Meus Repertórios
          </Button>
        </div>
      </div>
    );
  }

  // Agrupar músicas por momento
  const musicasPorMomento: Record<string, typeof repertorio.musicas> = {};
  repertorio.musicas.forEach((musica) => {
    if (!musicasPorMomento[musica.momento]) {
      musicasPorMomento[musica.momento] = [];
    }
    musicasPorMomento[musica.momento].push(musica);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Cabeçalho público */}
      {isPublicView && (
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="LouvaMais" className="h-8 w-8" />
              <span className="font-semibold text-lg">LouvaMais</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              Criar meu repertório
            </Button>
          </div>
        </div>
      )}
      
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-1">
            {!isPublicView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/meus-repertorios")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{repertorio.nome}</h1>
              {repertorio.descricao && (
                <p className="text-muted-foreground mt-2">{repertorio.descricao}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span>{repertorio.musicas.length} música(s)</span>
              </div>
            </div>
          </div>
          {!isPublicView && (
            <div className="flex flex-col sm:flex-row gap-2">
              {repertorio.shareId && (
                <Button 
                  variant="outline" 
                  onClick={copiarLinkCompartilhamento}
                  size="sm"
                  className={linkCopiado ? "bg-green-500/10 border-green-500 text-green-600" : ""}
                >
                  {linkCopiado ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Share className="w-4 h-4 mr-2" />
                      Compartilhar
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={gerarPDFComLinks}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button size="sm" onClick={() => setLocation(`/repertorio-personalizado/${id}/editar`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          )}
          {isPublicView && (
            <Button variant="outline" onClick={gerarPDFComLinks}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          )}
        </div>

        {/* Músicas por Momento */}
        <div className="space-y-6">
          {MOMENTOS_ORDEM.map((momento) => {
            const musicas = musicasPorMomento[momento];
            if (!musicas || musicas.length === 0) return null;

            return (
              <Card key={momento}>
                <CardHeader>
                  <CardTitle className="text-xl">{momento}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {musicas.map((musica, index) => (
                    <div
                      key={musica.id}
                      className="p-4 border rounded-lg bg-card/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {index + 1}. {musica.titulo}
                          </h3>
                          {musica.artista && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <User className="w-3.5 h-3.5" />
                              {musica.artista}
                            </p>
                          )}
                        </div>
                        {musica.tom && (
                          <Badge variant="secondary" className="shrink-0">
                            Tom: {musica.tom}
                          </Badge>
                        )}
                      </div>

                      {(musica.linkCifra || musica.linkYoutube || musica.linkLetra) && (
                        <div className="flex flex-wrap gap-2">
                          {musica.linkCifra && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-xs"
                            >
                              <a
                                href={musica.linkCifra}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LinkIcon className="w-3.5 h-3.5 mr-2" />
                                Ver Cifra
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          )}
                          {musica.linkYoutube && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-xs text-red-600 hover:text-red-600 border-red-200 hover:border-red-300"
                            >
                              <a
                                href={musica.linkYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Youtube className="w-3.5 h-3.5 mr-2" />
                                Ver no YouTube
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          )}
                          {musica.linkLetra && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-xs text-blue-600 hover:text-blue-600 border-blue-200 hover:border-blue-300"
                            >
                              <a
                                href={musica.linkLetra}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="w-3.5 h-3.5 mr-2" />
                                Ver Letra
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {repertorio.musicas.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Music className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma música adicionada</h3>
              <p className="text-muted-foreground text-center mb-6">
                Adicione músicas a este repertório para começar
              </p>
              <Button onClick={() => setLocation(`/repertorio-personalizado/${id}/editar`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Repertório
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Rodapé público */}
      {isPublicView && (
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-12">
          <div className="container py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="LouvaMais" className="h-6 w-6" />
                <span className="font-semibold">LouvaMais</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Organize seus repertórios litúrgicos com facilidade. Crie, edite e compartilhe suas listas de músicas.
              </p>
              <Button size="lg" onClick={() => setLocation("/")}>
                Criar meu próprio repertório
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
