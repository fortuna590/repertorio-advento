import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Music } from "lucide-react";

type Musica = {
  id?: number;
  titulo: string;
  artista: string;
  tom: string;
  linkCifra: string;
  linkYoutube: string;
  momento: string;
};

const MOMENTOS_MISSA = [
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

const TONS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

export default function CriarRepertorioPersonalizado() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  const isEdicao = !!id;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [musicas, setMusicas] = useState<Musica[]>([]);

  // Buscar repertório se for edição
  const { data: repertorio, isLoading } = trpc.repertoriosPersonalizados.buscarPorId.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isEdicao }
  );

  useEffect(() => {
    if (repertorio) {
      setNome(repertorio.nome);
      setDescricao(repertorio.descricao || "");
      setMusicas(
        repertorio.musicas.map((m) => ({
          id: m.id,
          titulo: m.titulo,
          artista: m.artista || "",
          tom: m.tom || "",
          linkCifra: m.linkCifra || "",
          linkYoutube: m.linkYoutube || "",
          momento: m.momento,
        }))
      );
    }
  }, [repertorio]);

  const criarRepertorioMutation = trpc.repertoriosPersonalizados.criar.useMutation();
  const atualizarRepertorioMutation = trpc.repertoriosPersonalizados.atualizar.useMutation();
  const adicionarMusicaMutation = trpc.repertoriosPersonalizados.adicionarMusica.useMutation();
  const atualizarMusicaMutation = trpc.repertoriosPersonalizados.atualizarMusica.useMutation();
  const excluirMusicaMutation = trpc.repertoriosPersonalizados.excluirMusica.useMutation();

  const handleAdicionarMusica = () => {
    setMusicas([
      ...musicas,
      {
        titulo: "",
        artista: "",
        tom: "",
        linkCifra: "",
        linkYoutube: "",
        momento: "Entrada",
      },
    ]);
  };

  const handleRemoverMusica = async (index: number) => {
    const musica = musicas[index];
    
    if (musica.id && isEdicao) {
      try {
        await excluirMusicaMutation.mutateAsync({
          id: musica.id,
          repertorioId: parseInt(id!),
        });
        toast.success("Música excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir música");
        return;
      }
    }

    setMusicas(musicas.filter((_, i) => i !== index));
  };

  const handleAtualizarMusica = (index: number, campo: keyof Musica, valor: string) => {
    const novasMusicas = [...musicas];
    novasMusicas[index] = { ...novasMusicas[index], [campo]: valor };
    setMusicas(novasMusicas);
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error("Nome do repertório é obrigatório");
      return;
    }

    if (musicas.length === 0) {
      toast.error("Adicione pelo menos uma música ao repertório");
      return;
    }

    // Validar músicas
    for (const musica of musicas) {
      if (!musica.titulo.trim()) {
        toast.error("Todas as músicas devem ter um título");
        return;
      }
    }

    try {
      let repertorioId = id ? parseInt(id) : null;

      // Criar ou atualizar repertório
      if (isEdicao) {
        await atualizarRepertorioMutation.mutateAsync({
          id: parseInt(id!),
          nome,
          descricao,
        });
      } else {
        const resultado = await criarRepertorioMutation.mutateAsync({
          nome,
          descricao,
        });
        repertorioId = resultado.repertorioId;
      }

      // Salvar músicas
      for (const musica of musicas) {
        if (musica.id && isEdicao) {
          // Atualizar música existente
          await atualizarMusicaMutation.mutateAsync({
            id: musica.id,
            repertorioId: parseInt(id!),
            titulo: musica.titulo,
            artista: musica.artista,
            tom: musica.tom,
            linkCifra: musica.linkCifra,
            linkYoutube: musica.linkYoutube,
            momento: musica.momento,
          });
        } else {
          // Adicionar nova música
          await adicionarMusicaMutation.mutateAsync({
            repertorioId: repertorioId!,
            titulo: musica.titulo,
            artista: musica.artista,
            tom: musica.tom,
            linkCifra: musica.linkCifra,
            linkYoutube: musica.linkYoutube,
            momento: musica.momento,
          });
        }
      }

      toast.success(`Repertório ${isEdicao ? "atualizado" : "criado"} com sucesso!`);

      setLocation("/meus-repertorios");
    } catch (error) {
      toast.error(`Erro ao ${isEdicao ? "atualizar" : "criar"} repertório`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/meus-repertorios")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdicao ? "Editar Repertório" : "Criar Novo Repertório"}
            </h1>
            <p className="text-muted-foreground">
              {isEdicao
                ? "Atualize as informações do seu repertório"
                : "Monte seu repertório personalizado com músicas ilimitadas"}
            </p>
          </div>
        </div>

        {/* Informações do Repertório */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Repertório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Repertório *</Label>
              <Input
                id="nome"
                placeholder="Ex: Missa Domingo 15/02"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição / Notas (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Adicione observações, notas ou detalhes sobre este repertório..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Músicas */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Músicas ({musicas.length})
              </CardTitle>
              <Button onClick={handleAdicionarMusica} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Música
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {musicas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma música adicionada ainda</p>
                <p className="text-sm">Clique em "Adicionar Música" para começar</p>
              </div>
            ) : (
              musicas.map((musica, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 relative bg-card/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg">Música {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverMusica(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Título da Música *</Label>
                      <Input
                        placeholder="Ex: Vem Espírito Santo"
                        value={musica.titulo}
                        onChange={(e) =>
                          handleAtualizarMusica(index, "titulo", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Artista / Compositor</Label>
                      <Input
                        placeholder="Ex: Comunidade Católica Shalom"
                        value={musica.artista}
                        onChange={(e) =>
                          handleAtualizarMusica(index, "artista", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Tom</Label>
                      <Select
                        value={musica.tom}
                        onValueChange={(valor) =>
                          handleAtualizarMusica(index, "tom", valor)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tom" />
                        </SelectTrigger>
                        <SelectContent>
                          {TONS.map((tom) => (
                            <SelectItem key={tom} value={tom}>
                              {tom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Momento da Missa *</Label>
                      <Select
                        value={musica.momento}
                        onValueChange={(valor) =>
                          handleAtualizarMusica(index, "momento", valor)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MOMENTOS_MISSA.map((momento) => (
                            <SelectItem key={momento} value={momento}>
                              {momento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Link da Cifra</Label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={musica.linkCifra}
                        onChange={(e) =>
                          handleAtualizarMusica(index, "linkCifra", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Link do YouTube</Label>
                      <Input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={musica.linkYoutube}
                        onChange={(e) =>
                          handleAtualizarMusica(index, "linkYoutube", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => setLocation("/meus-repertorios")}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={criarRepertorioMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {criarRepertorioMutation.isPending
              ? "Salvando..."
              : isEdicao
              ? "Salvar Alterações"
              : "Criar Repertório"}
          </Button>
        </div>
      </div>
    </div>
  );
}
