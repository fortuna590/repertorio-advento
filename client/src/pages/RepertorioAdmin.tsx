import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "@/components/ColorPicker";
import { trpc } from "@/lib/trpc";
import { Music, Plus, Edit2, Trash2, Eye, Save, Settings } from "lucide-react";
import { VoltarPainelAdminButton } from "@/components/VoltarPainelAdminButton";

interface RepertorioForm {
  nome: string;
  descricao: string;
  tempoLiturgico: string;
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  imagemCapa: string;
}

interface MomentoForm {
  nome: string;
  descricao: string;
  ordem: number;
  icone: string;
}

interface MusicaForm {
  titulo: string;
  artista: string;
  descricao: string;
  momentoId: string; // ID do momento litúrgico
  linkYoutube: string;
  linkCifra: string;
  linkLetra: string;
  tom: string;
  tags: string;
  comentario: string;
  ordem: number;
}

export function RepertorioAdmin() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState<RepertorioForm>({
    nome: "",
    descricao: "",
    tempoLiturgico: "Personalizado",
    corPrimaria: "#7c3aed",
    corSecundaria: "#d946ef",
    corFundo: "#1e1b4b",
    corTexto: "#ffffff",
    imagemCapa: "",
  });

  const [momentoForm, setMomentoForm] = useState<MomentoForm>({
    nome: "",
    descricao: "",
    ordem: 1,
    icone: "",
  });

  const [musicaForm, setMusicaForm] = useState<MusicaForm>({
    titulo: "",
    artista: "",
    descricao: "",
    momentoId: "", // Momento selecionado
    linkYoutube: "",
    linkCifra: "",
    linkLetra: "",
    tom: "",
    tags: "",
    comentario: "",
    ordem: 1,
  });

  const [editingMomentoId, setEditingMomentoId] = useState<number | null>(null);
  const [editingMusicaId, setEditingMusicaId] = useState<number | null>(null);

  // Queries
  const repertoriosQuery = (trpc as any).repertorio.list.useQuery({ incluirOcultos: true });
  const momentosQuery = (trpc as any).repertorio.listMomentos.useQuery(
    { repertorioId: editingId || 0 },
    { enabled: !!editingId }
  );
  const musicasQuery = (trpc as any).musicasBase.listar.useQuery(
    { repertorioId: editingId || 0 },
    { enabled: !!editingId }
  );

  const repertorios = repertoriosQuery.data || [];
  const momentos = momentosQuery.data || [];
  const musicas = musicasQuery.data || [];

  // Mutations
  const createMutation = (trpc as any).repertorio.create.useMutation();
  const updateMutation = (trpc as any).repertorio.update.useMutation();
  const deleteMutation = (trpc as any).repertorio.delete.useMutation();
  const createMomentoMutation = (trpc as any).repertorio.createMomento.useMutation();
  const updateMomentoMutation = (trpc as any).repertorio.updateMomento.useMutation();
  const deleteMomentoMutation = (trpc as any).repertorio.deleteMomento.useMutation();
  const createMusicaMutation = (trpc as any).musicasBase.adicionar.useMutation();
  const updateMusicaMutation = (trpc as any).musicasBase.atualizar.useMutation();
  const deleteMusicaMutation = (trpc as any).musicasBase.remover.useMutation();
  const toggleVisibilidadeMutation = (trpc as any).repertorio.toggleVisibilidade.useMutation();

  const handleSaveRepertorio = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...form,
        });
      } else {
        await createMutation.mutateAsync(form);
      }
      resetForm();
      await repertoriosQuery.refetch();
    } catch (error) {
      console.error("Erro ao salvar repertório:", error);
    }
  };

  const handleDeleteRepertorio = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este repertório?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        await repertoriosQuery.refetch();
      } catch (error) {
        console.error("Erro ao deletar repertório:", error);
      }
    }
  };

  const handleAddMomento = async () => {
    if (!editingId || !momentoForm.nome) return;
    try {
      if (editingMomentoId) {
        await updateMomentoMutation.mutateAsync({
          id: editingMomentoId,
          ...momentoForm,
        });
        setEditingMomentoId(null);
      } else {
        await createMomentoMutation.mutateAsync({
          repertorioId: editingId,
          ...momentoForm,
        });
      }
      setMomentoForm({ nome: "", descricao: "", ordem: 1, icone: "" });
      await momentosQuery.refetch();
    } catch (error) {
      console.error("Erro ao salvar momento:", error);
    }
  };

  const handleDeleteMomento = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este momento e todas as suas músicas?")) {
      try {
        await deleteMomentoMutation.mutateAsync({ id });
        await momentosQuery.refetch();
        await musicasQuery.refetch();
      } catch (error) {
        console.error("Erro ao deletar momento:", error);
      }
    }
  };

  const handleEditMomento = (momento: any) => {
    setMomentoForm({
      nome: momento.nome,
      descricao: momento.descricao || "",
      ordem: momento.ordem,
      icone: momento.icone || "",
    });
    setEditingMomentoId(momento.id);
  };

  const handleAddMusica = async () => {
    if (!editingId || !musicaForm.titulo) {
      alert("Preencha o título da música");
      return;
    }
    if (!musicaForm.momentoId) {
      alert("Selecione o momento litúrgico");
      return;
    }
    try {
      const momento = momentos[0];
      if (editingMusicaId) {
        await updateMusicaMutation.mutateAsync({
          id: editingMusicaId.toString(),
          titulo: musicaForm.titulo,
          artista: musicaForm.artista,
          youtube: musicaForm.linkYoutube,
          cifra: musicaForm.linkCifra,
          letra: musicaForm.linkLetra,
          tom: musicaForm.tom,
          tags: musicaForm.tags,
          observacao: musicaForm.comentario,
          ordem: musicaForm.ordem,
        });
        setEditingMusicaId(null);
      } else {
        await createMusicaMutation.mutateAsync({
          repertorioId: editingId.toString(),
          momentoId: musicaForm.momentoId,
          titulo: musicaForm.titulo,
          artista: musicaForm.artista,
          youtube: musicaForm.linkYoutube,
          cifra: musicaForm.linkCifra,
          letra: musicaForm.linkLetra,
          tom: musicaForm.tom,
          tags: musicaForm.tags,
          observacao: musicaForm.comentario,
          ordem: musicaForm.ordem,
        });
      }
      setMusicaForm({
        titulo: "",
        artista: "",
        descricao: "",
        momentoId: "",
        linkYoutube: "",
        linkCifra: "",
        linkLetra: "",
        tom: "",
        tags: "",
        comentario: "",
        ordem: 1,
      });
      await musicasQuery.refetch();
    } catch (error) {
      console.error("Erro ao salvar música:", error);
    }
  };

  const handleDeleteMusica = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta música?")) {
      try {
        await deleteMusicaMutation.mutateAsync({ id: id.toString() });
        await musicasQuery.refetch();
      } catch (error) {
        console.error("Erro ao deletar música:", error);
      }
    }
  };

  const handleEditMusica = (musica: any) => {
    setMusicaForm({
      titulo: musica.titulo,
      artista: musica.artista || "",
      descricao: "",
      momentoId: musica.momentoId || "",
      linkYoutube: musica.youtube || "",
      linkCifra: musica.cifra || "",
      linkLetra: musica.letra || "",
      tom: musica.tom || "",
      tags: musica.tags || "",
      comentario: musica.observacao || "",
      ordem: musica.ordem,
    });
    setEditingMusicaId(musica.id);
  };

  const resetForm = () => {
    setForm({
      nome: "",
      descricao: "",
      tempoLiturgico: "Personalizado",
      corPrimaria: "#7c3aed",
      corSecundaria: "#d946ef",
      corFundo: "#1e1b4b",
      corTexto: "#ffffff",
      imagemCapa: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredRepertorios = repertorios.filter((r: any) =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gerenciador de Repertórios</h1>
            <p className="text-muted-foreground">
              Crie e organize repertórios litúrgicos com momentos da missa e músicas
            </p>
          </div>
          <VoltarPainelAdminButton />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Repertórios</TabsTrigger>
          <TabsTrigger value="editar" disabled={!editingId}>
            Editar Repertório
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!editingId}>
            Preview
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: LISTA DE REPERTÓRIOS */}
        <TabsContent value="lista" className="space-y-4">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Buscar repertório..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Repertório
            </Button>
          </div>

          {showForm && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>{editingId ? "Editar Repertório" : "Novo Repertório"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      placeholder="Ex: Advento 2025"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Imagem de Capa</label>
                    <Input
                      value={form.imagemCapa}
                      onChange={(e) => setForm({ ...form, imagemCapa: e.target.value })}
                      placeholder="URL da imagem"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Descreva o repertório..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tempo Litúrgico</label>
                  <select
                    value={form.tempoLiturgico}
                    onChange={(e) => setForm({ ...form, tempoLiturgico: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="Personalizado">Personalizado</option>
                    <option value="Advento">Advento</option>
                    <option value="Natal">Natal</option>
                    <option value="Quaresma">Quaresma</option>
                    <option value="Páscoa">Páscoa</option>
                    <option value="Tempo Comum">Tempo Comum</option>
                    <option value="Especiais">Celebrações Especiais</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    value={form.corPrimaria}
                    onChange={(cor) => setForm({ ...form, corPrimaria: cor })}
                    label="Cor Primária"
                  />
                  <ColorPicker
                    value={form.corSecundaria}
                    onChange={(cor) => setForm({ ...form, corSecundaria: cor })}
                    label="Cor Secundária"
                  />
                  <ColorPicker
                    value={form.corFundo}
                    onChange={(cor) => setForm({ ...form, corFundo: cor })}
                    label="Cor de Fundo"
                  />
                  <ColorPicker
                    value={form.corTexto}
                    onChange={(cor) => setForm({ ...form, corTexto: cor })}
                    label="Cor do Texto"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveRepertorio} className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Repertório
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredRepertorios.map((repertorio: any) => (
              <Card key={repertorio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5" style={{ color: repertorio.corPrimaria }} />
                        {repertorio.nome}
                      </CardTitle>
                      <CardDescription>{repertorio.descricao}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={repertorio.publicado === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={async () => {
                          try {
                            await toggleVisibilidadeMutation.mutateAsync({ id: repertorio.id });
                            await repertoriosQuery.refetch();
                          } catch (error) {
                            console.error("Erro ao alternar visibilidade:", error);
                          }
                        }}
                        className="gap-1"
                        title={repertorio.publicado === 1 ? "Ocultar do site" : "Tornar visível no site"}
                      >
                        <Eye className="w-4 h-4" />
                        {repertorio.publicado === 1 ? "Visível" : "Oculto"}
                      </Button>
                      {/* Botão de gerenciar músicas para repertórios base */}
                      {["Advento", "Quaresma", "Páscoa", "Natal", "Tempo Comum", "Celebrações Especiais", "Celebrações Marianas"].includes(repertorio.tempoLiturgico) && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            const idMap: Record<string, string> = {
                              "Advento": "advento",
                              "Quaresma": "quaresma",
                              "Páscoa": "pascoa",
                              "Natal": "natal",
                              "Tempo Comum": "tempo-comum",
                              "Celebrações Especiais": "especiais",
                              "Celebrações Marianas": "maria",
                            };
                            const baseId = idMap[repertorio.tempoLiturgico];
                            setLocation(`/repertorio-base-admin/${baseId}`);
                          }}
                          className="gap-1"
                        >
                          <Settings className="w-4 h-4" />
                          Gerenciar Músicas
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(repertorio.id);
                          setForm({
                            nome: repertorio.nome,
                            descricao: repertorio.descricao || "",
                            tempoLiturgico: repertorio.tempoLiturgico || "Personalizado",
                            corPrimaria: repertorio.corPrimaria,
                            corSecundaria: repertorio.corSecundaria,
                            corFundo: repertorio.corFundo,
                            corTexto: repertorio.corTexto,
                            imagemCapa: repertorio.imagemCapa || "",
                          });
                          setActiveTab("editar");
                        }}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRepertorio(repertorio.id)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: repertorio.corPrimaria }}
                      title="Cor Primária"
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: repertorio.corSecundaria }}
                      title="Cor Secundária"
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: repertorio.corFundo }}
                      title="Cor de Fundo"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA 2: EDITAR REPERTÓRIO */}
        {editingId && (
          <TabsContent value="editar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Momentos da Missa</CardTitle>
                <CardDescription>Organize os momentos litúrgicos do seu repertório</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome do momento (ex: Entrada)"
                    value={momentoForm.nome}
                    onChange={(e) => setMomentoForm({ ...momentoForm, nome: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Ordem"
                    value={momentoForm.ordem}
                    onChange={(e) =>
                      setMomentoForm({ ...momentoForm, ordem: parseInt(e.target.value) })
                    }
                  />
                  <Button onClick={handleAddMomento} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2">
                  {momentos.map((momento: any) => (
                    <Card key={momento.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{momento.nome}</p>
                          <p className="text-sm text-muted-foreground">Ordem: {momento.ordem}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMomento(momento)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMomento(momento.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Músicas do Repertório</CardTitle>
                <CardDescription>Adicione músicas para cada momento da missa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Título da música"
                    value={musicaForm.titulo}
                    onChange={(e) => setMusicaForm({ ...musicaForm, titulo: e.target.value })}
                  />
                  <Input
                    placeholder="Artista"
                    value={musicaForm.artista}
                    onChange={(e) => setMusicaForm({ ...musicaForm, artista: e.target.value })}
                  />
                  <Select
                    value={musicaForm.momentoId}
                    onValueChange={(value) => setMusicaForm({ ...musicaForm, momentoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o momento" />
                    </SelectTrigger>
                    <SelectContent>
                      {momentos.map((momento: any) => (
                        <SelectItem key={momento.id} value={momento.id.toString()}>
                          {momento.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Link YouTube"
                    value={musicaForm.linkYoutube}
                    onChange={(e) => setMusicaForm({ ...musicaForm, linkYoutube: e.target.value })}
                  />
                  <Input
                    placeholder="Link Cifra"
                    value={musicaForm.linkCifra}
                    onChange={(e) => setMusicaForm({ ...musicaForm, linkCifra: e.target.value })}
                  />
                  <Input
                    placeholder="Link Letra (letras.mus.br)"
                    value={musicaForm.linkLetra}
                    onChange={(e) => setMusicaForm({ ...musicaForm, linkLetra: e.target.value })}
                  />
                  <Input
                    placeholder="Tom (ex: C, Dm, F#)"
                    value={musicaForm.tom}
                    onChange={(e) => setMusicaForm({ ...musicaForm, tom: e.target.value })}
                  />
                  <Input
                    placeholder="Tags (separadas por vírgula)"
                    value={musicaForm.tags}
                    onChange={(e) => setMusicaForm({ ...musicaForm, tags: e.target.value })}
                  />
                  <Textarea
                    placeholder="Comentário ou observação"
                    value={musicaForm.comentario}
                    onChange={(e) => setMusicaForm({ ...musicaForm, comentario: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <Button onClick={handleAddMusica} className="gap-2 w-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Música
                </Button>

                <div className="space-y-2">
                  {musicas.map((musica: any) => (
                    <Card key={musica.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{musica.titulo}</p>
                          <p className="text-sm text-muted-foreground">{musica.artista}</p>
                          <div className="flex gap-2 mt-2">
                            {musica.linkYoutube && (
                              <a
                                href={musica.linkYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                YouTube
                              </a>
                            )}
                            {musica.linkCifra && (
                              <a
                                href={musica.linkCifra}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Cifra
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMusica(musica)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMusica(musica.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ABA 3: PREVIEW */}
        {editingId && (
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview do Repertório</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-lg p-8 text-white"
                  style={{
                    backgroundColor: form.corFundo,
                    color: form.corTexto,
                  }}
                >
                  <h2 className="text-3xl font-bold mb-2">{form.nome}</h2>
                  <p className="mb-6 opacity-90">{form.descricao}</p>

                  <div className="space-y-4">
                    {momentos.map((momento: any) => (
                      <div key={momento.id}>
                        <h3
                          className="text-xl font-semibold mb-2"
                          style={{ color: form.corPrimaria }}
                        >
                          {momento.nome}
                        </h3>
                        <div className="space-y-2 ml-4">
                          {musicas
                            .filter((m: any) => m.momentoId === momento.id)
                            .map((musica: any) => (
                              <div
                                key={musica.id}
                                className="p-2 rounded"
                                style={{ backgroundColor: form.corSecundaria + "20" }}
                              >
                                <p className="font-medium">{musica.titulo}</p>
                                <p className="text-sm opacity-75">{musica.artista}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
