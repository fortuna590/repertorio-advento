import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit, Trash2, Eye, Save, ArrowLeft } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function BlogAdmin() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemCapa, setImagemCapa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tags, setTags] = useState("");
  const [autorNome, setAutorNome] = useState("LouvaMais");

  const { data: artigos, refetch } = trpc.artigos.getAll.useQuery({ includeRascunhos: true });
  const criarMutation = trpc.artigos.create.useMutation();
  const atualizarMutation = trpc.artigos.update.useMutation();
  const deletarMutation = trpc.artigos.delete.useMutation();

  const gerarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTituloChange = (value: string) => {
    setTitulo(value);
    if (!editingId) {
      setSlug(gerarSlug(value));
    }
  };

  const resetForm = () => {
    setTitulo("");
    setSlug("");
    setResumo("");
    setConteudo("");
    setImagemCapa("");
    setCategoria("");
    setTags("");
    setAutorNome("LouvaMais");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditar = (artigo: any) => {
    setEditingId(artigo.id);
    setTitulo(artigo.titulo);
    setSlug(artigo.slug);
    setResumo(artigo.resumo);
    setConteudo(artigo.conteudo);
    setImagemCapa(artigo.imagemCapa || "");
    setCategoria(artigo.categoria || "");
    setTags(artigo.tags ? artigo.tags.join(", ") : "");
    setAutorNome(artigo.autorNome || "LouvaMais");
    setShowForm(true);
  };

  const handleSalvar = async () => {
    if (!titulo.trim() || !slug.trim() || !resumo.trim() || !conteudo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);

      if (editingId) {
        await atualizarMutation.mutateAsync({
          id: editingId,
          titulo,
          slug,
          resumo,
          conteudo,
          imagemCapa: imagemCapa || undefined,
          categoria: categoria || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          autorNome: autorNome || undefined,
          publicado: 1,
        });
        toast.success("Artigo atualizado com sucesso!");
      } else {
        await criarMutation.mutateAsync({
          titulo,
          slug,
          resumo,
          conteudo,
          imagemCapa: imagemCapa || undefined,
          categoria: categoria || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          autorNome: autorNome || undefined,
          publicado: 1,
        });
        toast.success("Artigo criado com sucesso!");
      }

      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar artigo");
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este artigo?")) return;

    try {
      await deletarMutation.mutateAsync({ id });
      toast.success("Artigo deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar artigo");
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
                  <div className="font-bold text-lg text-foreground">Gerenciar Blog</div>
                  <div className="text-xs text-muted-foreground">Criar e editar artigos</div>
                </div>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Blog
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Botão Novo Artigo */}
          {!showForm && (
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-foreground">Meus Artigos</h2>
              <Button onClick={() => setShowForm(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Novo Artigo
              </Button>
            </div>
          )}

          {/* Formulário */}
          {showForm && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  {editingId ? "Editar Artigo" : "Novo Artigo"}
                </CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para {editingId ? "atualizar" : "criar"} seu artigo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título *</label>
                    <Input
                      placeholder="Ex: A Importância da Música no Advento"
                      value={titulo}
                      onChange={(e) => handleTituloChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Slug (URL) *</label>
                    <Input
                      placeholder="importancia-musica-advento"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resumo *</label>
                  <Textarea
                    placeholder="Breve descrição do artigo (1-2 frases)"
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Conteúdo * </label>
                  <Textarea
                    placeholder="Escreva o conteúdo completo do artigo aqui..."
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL da Imagem de Capa</label>
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={imagemCapa}
                      onChange={(e) => setImagemCapa(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Input
                      placeholder="Ex: Advento, Liturgia, Dicas"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags (separadas por vírgula)</label>
                    <Input
                      placeholder="música, liturgia, advento"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome do Autor</label>
                    <Input
                      placeholder="Seu nome"
                      value={autorNome}
                      onChange={(e) => setAutorNome(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSalvar}
                    disabled={criarMutation.isPending || atualizarMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "Atualizar" : "Publicar"} Artigo
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Artigos */}
          {!showForm && artigos && artigos.length > 0 && (
            <div className="grid gap-4">
              {artigos.map((artigo) => (
                <Card key={artigo.id} className="group hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {artigo.categoria && (
                            <Badge variant="secondary" className="text-xs">
                              {artigo.categoria}
                            </Badge>
                          )}
                          <Badge variant={artigo.publicado === 1 ? "default" : "outline"} className="text-xs">
                            {artigo.publicado === 1 ? "Publicado" : "Rascunho"}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {artigo.visualizacoes}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{artigo.titulo}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {artigo.resumo}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditar(artigo)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletar(artigo.id)}
                          disabled={deletarMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Link href={`/blog/${artigo.slug}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {!showForm && (!artigos || artigos.length === 0) && (
            <Card className="border-dashed">
              <CardHeader className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Nenhum artigo criado ainda</CardTitle>
                <CardDescription className="text-base mb-6">
                  Comece criando seu primeiro artigo sobre música litúrgica
                </CardDescription>
                <Button onClick={() => setShowForm(true)} size="lg" className="gap-2 mx-auto">
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Artigo
                </Button>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
