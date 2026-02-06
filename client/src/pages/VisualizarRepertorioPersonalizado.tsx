import { useParams, useLocation } from "wouter";
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
} from "lucide-react";
import jsPDF from "jspdf";

const MOMENTOS_ORDEM = [
  "Entrada",
  "Glória",
  "Aclamação",
  "Ofertório",
  "Santo",
  "Cordeiro",
  "Comunhão",
  "Final",
  "Outro",
];

export default function VisualizarRepertorioPersonalizado() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Detectar se é um shareId (UUID) ou ID numérico
  const isShareId = id.includes("-"); // UUIDs contêm hífens

  // Usar endpoint apropriado baseado no tipo de ID
  const { data: repertorio, isLoading } = isShareId
    ? trpc.repertoriosPersonalizados.buscarPorShareId.useQuery({ shareId: id })
    : trpc.repertoriosPersonalizados.buscarPorId.useQuery({ id: parseInt(id) });

  const gerarPDF = () => {
    if (!repertorio) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Título
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(repertorio.nome, 20, yPos);
      yPos += 10;

      // Descrição
      if (repertorio.descricao) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(repertorio.descricao, 170);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 5 + 5;
      }

      // Linha divisória
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Agrupar músicas por momento
      const musicasPorMomento: Record<string, typeof repertorio.musicas> = {};
      repertorio.musicas.forEach((musica) => {
        if (!musicasPorMomento[musica.momento]) {
          musicasPorMomento[musica.momento] = [];
        }
        musicasPorMomento[musica.momento].push(musica);
      });

      // Renderizar músicas por momento
      MOMENTOS_ORDEM.forEach((momento) => {
        const musicas = musicasPorMomento[momento];
        if (!musicas || musicas.length === 0) return;

        // Verificar se precisa de nova página
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Título do momento
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(momento, 20, yPos);
        yPos += 8;

        // Músicas do momento
        doc.setFontSize(10);
        musicas.forEach((musica, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${musica.titulo}`, 25, yPos);
          yPos += 5;

          doc.setFont("helvetica", "normal");
          
          if (musica.artista) {
            doc.text(`   Artista: ${musica.artista}`, 25, yPos);
            yPos += 5;
          }

          if (musica.tom) {
            doc.text(`   Tom: ${musica.tom}`, 25, yPos);
            yPos += 5;
          }

          if (musica.linkCifra) {
            doc.setTextColor(0, 0, 255);
            doc.text(`   Cifra: ${musica.linkCifra}`, 25, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 5;
          }

          if (musica.linkYoutube) {
            doc.setTextColor(255, 0, 0);
            doc.text(`   YouTube: ${musica.linkYoutube}`, 25, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 5;
          }

          yPos += 3; // Espaço entre músicas
        });

        yPos += 5; // Espaço entre momentos
      });

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} - Página ${i} de ${totalPages}`,
          20,
          285
        );
      }

      // Salvar PDF
      doc.save(`${repertorio.nome}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
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
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/meus-repertorios")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={gerarPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={() => setLocation(`/repertorio-personalizado/${id}/editar`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
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

                      {(musica.linkCifra || musica.linkYoutube) && (
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
    </div>
  );
}
