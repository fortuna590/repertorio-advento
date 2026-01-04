import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Trash2, Eye, Save, ArrowLeft, Search } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageUpload } from "@/components/ImageUpload";

export default function BlogAdmin() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemCapa, setImagemCapa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tags, setTags] = useState("");
  const [autorNome, setAutorNome] = useState("LouvaMais");
  
  // Campos SEO
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: artigos, refetch } = trpc.artigos.getAll.useQuery({ includeRascunhos: true });
  const criarMutation = trpc.artigos.create.useMutation();
  const atualizarMutation = trpc.artigos.update.useMutation();
  const deletarMutation = trpc.artigos.delete.useMutation();

  // Calcular tempo de leitura (média 200 palavras por minuto)
  const tempoLeitura = useMemo(() => {
    const palavras = conteudo.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(palavras / 200);
  }, [conteudo]);

  // Gerar slug otimizado
  const gerarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Auto-gerar meta descrição se vazia
  const metaDescricaoAuto = metaDescricao || resumo.substring(0, 160);

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
    setMetaDescricao("");
    setMetaKeywords("");
    setEditingId(null);
    setShowForm(false);
    setPreviewMode(false);
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
    setMetaDescricao(artigo.metaDescricao || "");
    setMetaKeywords(artigo.metaKeywords || "");
    setShowForm(true);
    setPreviewMode(false);
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

  // Filtrar artigos por busca
  const artigosFiltrados = useMemo(() => {
    if (!artigos) return [];
    if (!searchQuery) return artigos;
    
    const query = searchQuery.toLowerCase();
    return artigos.filter((a: any) => 
      a.titulo.toLowerCase().includes(query) ||
      a.categoria?.toLowerCase().includes(query) ||
      a.tags?.some((t: string) => t.toLowerCase().includes(query))
    );
  }, [artigos, searchQuery]);

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

          {/* Formulário com Tabs */}
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
              <CardContent>
                <Tabs defaultValue={previewMode ? "preview" : "editor"} onValueChange={(v) => setPreviewMode(v === "preview")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="editor">Editar</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  {/* Aba Editor */}
                  <TabsContent value="editor" className="space-y-4 mt-4">
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
                      <label className="text-sm font-medium mb-2 block">Conteúdo * ({tempoLeitura} min de leitura)</label>
                      <RichTextEditor
                        content={conteudo}
                        onChange={setConteudo}
                        placeholder="Escreva o conteúdo completo do artigo aqui..."
                      />
                    </div>

                    <ImageUpload
                      value={imagemCapa}
                      onChange={setImagemCapa}
                      label="Imagem de Capa"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Categoria</label>
                        <Input
                          placeholder="Ex: Advento, Liturgia, Dicas"
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tags (separadas por vírgula)</label>
                        <Input
                          placeholder="música, liturgia, advento"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Nome do Autor</label>
                      <Input
                        placeholder="Seu nome"
                        value={autorNome}
                        onChange={(e) => setAutorNome(e.target.value)}
                      />
                    </div>

                    {/* SEO Fields */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-sm mb-4 text-primary">Otimização SEO</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Meta Descrição ({metaDescricaoAuto.length}/160)</label>
                          <Textarea
                            placeholder="Descrição que aparece nos resultados do Google"
                            value={metaDescricao}
                            onChange={(e) => setMetaDescricao(e.target.value)}
                            rows={2}
                            maxLength={160}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {metaDescricao ? "Personalizada" : "Auto-gerada do resumo"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Meta Keywords (separadas por vírgula)</label>
                          <Input
                            placeholder="música litúrgica, advento, repertório"
                            value={metaKeywords}
                            onChange={(e) => setMetaKeywords(e.target.value)}
                          />
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                          <p><strong>URL Canônica:</strong> <code className="text-xs bg-background px-2 py-1 rounded">/blog/{slug || "seu-slug"}</code></p>
                          <p><strong>Tempo de Leitura:</strong> {tempoLeitura} minuto{tempoLeitura !== 1 ? "s" : ""}</p>
                        </div>
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
                  </TabsContent>

                  {/* Aba Preview */}
                  <TabsContent value="preview" className="mt-4">
                    <div className="space-y-6">
                      {/* Preview SEO */}
                      <div className="border rounded-lg p-4 bg-white dark:bg-slate-900">
                        <h3 className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-300">Preview no Google</h3>
                        <div className="space-y-2">
                          <div className="text-blue-600 dark:text-blue-400 text-sm">
                            {slug ? `louvamais.com.br/blog/${slug}` : "louvamais.com.br/blog/seu-slug"}
                          </div>
                          <div className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
                            {titulo || "Seu Título Aqui"}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {metaDescricaoAuto}
                          </div>
                        </div>
                      </div>

                      {/* Preview do Artigo */}
                      <div className="border rounded-lg p-6 bg-card">
                        <div className="space-y-4">
                          {imagemCapa && (
                            <img src={imagemCapa} alt={titulo} className="w-full h-64 object-cover rounded-lg" />
                          )}
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {categoria && <Badge>{categoria}</Badge>}
                            <span className="text-xs text-muted-foreground">
                              {tempoLeitura} min de leitura
                            </span>
                          </div>

                          <h1 className="text-3xl font-bold">{titulo || "Seu Título Aqui"}</h1>
                          
                          <div className="text-sm text-muted-foreground">
                            Por <strong>{autorNome}</strong>
                          </div>

                          <div className="prose dark:prose-invert max-w-none">
                            {conteudo ? (
                              <div dangerouslySetInnerHTML={{ __html: conteudo }} />
                            ) : (
                              <p className="text-muted-foreground">Seu conteúdo aparecerá aqui...</p>
                            )}
                          </div>

                          {tags && (
                            <div className="flex gap-2 flex-wrap pt-4 border-t">
                              {tags.split(",").map((tag, i) => (
                                <Badge key={i} variant="secondary">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Lista de Artigos */}
          {!showForm && artigos && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, categoria ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {artigosFiltrados.length > 0 ? (
                <div className="grid gap-4">
                  {artigosFiltrados.map((artigo) => (
                    <Card key={artigo.id} className="group hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {artigo.categoria && (
                                <Badge variant="secondary" className="text-xs">
                                  {artigo.categoria}
                                </Badge>
                              )}
                              <Badge variant={artigo.publicado === 1 ? "default" : "outline"} className="text-xs">
                                {artigo.publicado === 1 ? "Publicado" : "Rascunho"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {artigo.visualizacoes || 0} visualizações
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{artigo.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{artigo.resumo}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditar(artigo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletar(artigo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {searchQuery ? "Nenhum artigo encontrado com essa busca" : "Nenhum artigo criado ainda"}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
