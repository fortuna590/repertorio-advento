import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, GripVertical, FileDown, Edit, Trash2, ArrowLeft, Music } from "lucide-react";
import { VoltarPainelAdminButton } from "@/components/VoltarPainelAdminButton";
import { toast } from "sonner";
import { AdicionarMusicaModal } from "@/components/AdicionarMusicaModal";
import { EditarMusicaModal } from "@/components/EditarMusicaModal";
import { ReordenarMusicasModal } from "@/components/ReordenarMusicasModal";
import { BulkImportMusicasModal } from "@/components/BulkImportMusicasModal";

// Dados dos repertórios base
import { repertoriosBase } from "@/data/repertoriosBase";

export default function RepertorioBaseAdmin() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const repertorioId = params.id as string;

  const [modalAberto, setModalAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalReordenarAberto, setModalReordenarAberto] = useState(false);
  const [modalBulkImportAberto, setModalBulkImportAberto] = useState(false);
  
  const [momentoSelecionado, setMomentoSelecionado] = useState<{ id: string; titulo: string } | null>(null);
  const [musicaSelecionada, setMusicaSelecionada] = useState<any>(null);

  // Buscar dados do repertório base
  const repertorioBase = repertoriosBase.find((r: any) => r.id === repertorioId);

  // Buscar músicas adicionais do banco
  const { data: musicasAdicionais = [], refetch, isLoading, error } = trpc.musicasBase.listar.useQuery(
    {
      repertorioId: repertorioId || "",
    },
    {
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );



  // Mutation de remoção
  const removerMutation = trpc.musicasBase.remover.useMutation({
    onSuccess: () => {
      toast.success("Música removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao remover música: ${error.message}`);
    },
  });

  if (!repertorioBase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-white">Repertório não encontrado</p>
          <Button onClick={() => setLocation("/repertorio-admin")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const handleRemoverMusica = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta música?")) {
      removerMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/repertorio-admin")}
              className="text-purple-200 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Repertórios
            </Button>
            <VoltarPainelAdminButton />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {repertorioBase.titulo}
          </h1>
          <p className="text-purple-200">
            Gerencie as músicas dos momentos litúrgicos deste repertório
          </p>
        </div>

        {/* Lista de Momentos */}
        <div className="space-y-8">
          {repertorioBase.momentos.map((momento: any) => {
            // Filtrar músicas adicionais deste momento
            const musicasMomento = musicasAdicionais.filter(
              (m: any) => m.momentoId === momento.id
            );

            return (
              <Card key={momento.id} className="bg-slate-900/80 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-400" />
                        {momento.numero} {momento.titulo}
                      </CardTitle>
                      <CardDescription className="text-purple-300">
                        {musicasMomento.length} música(s) adicionada(s)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                        onClick={() => {
                          setMomentoSelecionado({ id: momento.id, titulo: momento.titulo });
                          setModalAberto(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Música
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                        onClick={() => {
                          setMomentoSelecionado({ id: momento.id, titulo: momento.titulo });
                          setModalReordenarAberto(true);
                        }}
                      >
                        <GripVertical className="w-4 h-4" />
                        Reordenar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                        onClick={() => {
                          setMomentoSelecionado({ id: momento.id, titulo: momento.titulo });
                          setModalBulkImportAberto(true);
                        }}
                      >
                        <FileDown className="w-4 h-4" />
                        Importar CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {musicasMomento.length === 0 ? (
                    <p className="text-purple-300 text-sm">
                      Nenhuma música adicionada ainda. Clique em "Adicionar Música" para começar.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {musicasMomento.map((musica: any) => (
                        <div
                          key={musica.id}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-purple-500/10"
                        >
                          <div>
                            <p className="text-white font-medium">{musica.titulo}</p>
                            <p className="text-purple-300 text-sm">{musica.artista}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-purple-300 hover:text-white"
                              onClick={() => {
                                setMusicaSelecionada(musica);
                                setModalEditarAberto(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleRemoverMusica(musica.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modals */}
        {momentoSelecionado && (
          <>
            <AdicionarMusicaModal
              open={modalAberto}
              onOpenChange={setModalAberto}
              repertorioId={repertorioId}
              momentoId={momentoSelecionado.id}
              momentoTitulo={momentoSelecionado.titulo}
              onSuccess={() => refetch()}
            />
            <ReordenarMusicasModal
              open={modalReordenarAberto}
              onClose={() => setModalReordenarAberto(false)}
              repertorioId={repertorioId}
              momentoId={momentoSelecionado.id}
              momentoTitulo={momentoSelecionado.titulo}
              onSuccess={() => refetch()}
            />
            <BulkImportMusicasModal
              open={modalBulkImportAberto}
              onClose={() => setModalBulkImportAberto(false)}
              repertorioId={repertorioId}
              momentoId={momentoSelecionado.id}
              momentoTitulo={momentoSelecionado.titulo}
              onSuccess={() => refetch()}
            />
          </>
        )}
        {musicaSelecionada && (
          <EditarMusicaModal
            open={modalEditarAberto}
            onClose={() => setModalEditarAberto(false)}
            musica={musicaSelecionada}
            onSuccess={() => {
              refetch();
              setMusicaSelecionada(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
