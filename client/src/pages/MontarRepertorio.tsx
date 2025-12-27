import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import {
  Music,
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  CheckCircle2,
  Youtube,
  Guitar,
  Sparkles,
  Zap,
  Search,
  X,
  Eye,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import { repertorioCompleto } from "@/data/repertorioCompleto";
import { templatesRepertorio, type TemplateRepertorio } from "@/data/templatesRepertorio";

export default function MontarRepertorio() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataCelebracao, setDataCelebracao] = useState("");
  const [musicasSelecionadas, setMusicasSelecionadas] = useState<string[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [repertorioFiltro, setRepertorioFiltro] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filtrar m\u00fasicas com base no termo de busca e repert\u00f3rio
  const momentosFiltrados = useMemo(() => {
    let filtered = repertorioCompleto;

    // Filtrar por repert\u00f3rio
    if (repertorioFiltro) {
      filtered = filtered.filter((momento) => momento.id.startsWith(repertorioFiltro));
    }

    // Filtrar por termo de busca
    if (termoBusca.trim()) {
      const termoLower = termoBusca.toLowerCase();
      filtered = filtered
        .map((momento) => ({
          ...momento,
          musicas: momento.musicas.filter(
            (musica) =>
              musica.titulo.toLowerCase().includes(termoLower) ||
              musica.artista.toLowerCase().includes(termoLower) ||
              momento.titulo.toLowerCase().includes(termoLower)
          ),
        }))
        .filter((momento) => momento.musicas.length > 0);
    }

    return filtered;
  }, [termoBusca, repertorioFiltro]);

  // Contar total de m\u00fasicas filtradas
  const totalMusicasFiltradas = useMemo(() => {
    return momentosFiltrados.reduce(
      (total: number, momento) => total + momento.musicas.length,
      0
    );
  }, [momentosFiltrados]);

  // Agrupar m\u00fasicas selecionadas por momento para preview
  const musicasAgrupadas = useMemo(() => {
    const grupos: Record<string, { momento: typeof repertorioCompleto[0], musicas: typeof repertorioCompleto[0]['musicas'] }> = {};
    
    musicasSelecionadas.forEach((musicaId) => {
      // Encontrar o momento que cont\u00e9m esta m\u00fasica
      for (const momento of repertorioCompleto) {
        const musica = momento.musicas.find((m) => `${momento.id}-${m.numero}` === musicaId);
        if (musica) {
          if (!grupos[momento.id]) {
            grupos[momento.id] = { momento, musicas: [] };
          }
          grupos[momento.id].musicas.push(musica);
          break;
        }
      }
    });
    
    return Object.values(grupos);
  }, [musicasSelecionadas]);

  const createMutation = trpc.repertorios.create.useMutation({
    onSuccess: (data) => {
      toast.success("Repert\u00f3rio criado com sucesso!");
      navigate(`/repertorio/${data.repertorioId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Redirect para login se n\u00e3o autenticado
  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleToggleMusica = (musicaId: string) => {
    setMusicasSelecionadas((prev) =>
      prev.includes(musicaId)
        ? prev.filter((id) => id !== musicaId)
        : [...prev, musicaId]
    );
  };

  const handleAplicarTemplate = (template: TemplateRepertorio) => {
    setNome(template.nome);
    setDescricao(template.descricao);
    setMusicasSelecionadas(template.musicasSelecionadas);
    toast.success(`Template "${template.nome}" aplicado com sucesso!`);
  };

  const handleLimparSelecao = () => {
    setMusicasSelecionadas([]);
    toast.success("Sele\u00e7\u00e3o limpa!");
  };

  const handleSalvar = () => {
    if (!nome.trim()) {
      toast.error("Por favor, dê um nome ao repertório");
      return;
    }

    if (musicasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma música");
      return;
    }

    createMutation.mutate({
      nome,
      descricao,
      musicas: musicasSelecionadas,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/meus-repertorios">
              <a className="text-purple-300 hover:text-purple-200 flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Criar Novo Repertório</h1>
              <p className="text-purple-200">
                Selecione as músicas para sua celebração
              </p>
            </div>
          </div>
          <Button
            onClick={handleSalvar}
            disabled={createMutation.isPending || musicasSelecionadas.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Salvando..." : "Salvar Repertório"}
          </Button>
        </div>

        {/* Templates Rápidos */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Templates Rápidos
            </CardTitle>
            <p className="text-purple-200 text-sm mt-1">
              Comece com um repertório pré-configurado e personalize conforme necessário
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {templatesRepertorio.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleAplicarTemplate(template)}
                  className="group relative bg-slate-800/70 hover:bg-slate-700/70 border border-purple-500/30 hover:border-purple-400/50 rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">
                        {template.nome}
                      </h3>
                      <p className="text-purple-300 text-xs line-clamp-2">
                        {template.descricao}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                          {template.musicasSelecionadas.length} músicas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-800/50 border-purple-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Nome do Repertório *
                  </label>
                  <Input
                    placeholder="Ex: Missa de Advento - 1º Domingo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Descrição (opcional)
                  </label>
                  <Textarea
                    placeholder="Adicione uma descrição..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Data da Celebração (opcional)
                  </label>
                  <Input
                    type="date"
                    value={dataCelebracao}
                    onChange={(e) => setDataCelebracao(e.target.value)}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>

                {/* Resumo */}
                <div className="pt-4 border-t border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between text-purple-200">
                    <span className="text-sm">M\u00fasicas selecionadas:</span>
                    <span className="font-bold text-lg text-white">
                      {musicasSelecionadas.length}
                    </span>
                  </div>
                  
                  {musicasSelecionadas.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setShowPreview(true)}
                        variant="outline"
                        className="w-full bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/30 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Preview
                      </Button>
                      <Button
                        onClick={handleLimparSelecao}
                        variant="outline"
                        className="w-full bg-red-600/20 border-red-500/50 hover:bg-red-600/30 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Sele\u00e7\u00e3o
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seleção de Músicas - Usando dados de todos os repertórios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campo de Busca */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, artista ou momento litúrgico..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10 bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                </div>
                {(termoBusca || repertorioFiltro) && (
                  <p className="text-purple-300 text-sm mt-2">
                    {totalMusicasFiltradas} {totalMusicasFiltradas === 1 ? 'm\u00fasica encontrada' : 'm\u00fasicas encontradas'}
                  </p>
                )}
                
                {/* Filtros por Repert\u00f3rio */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-200">Filtrar por repert\u00f3rio:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRepertorioFiltro(null)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        repertorioFiltro === null
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-purple-300 hover:bg-slate-600'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setRepertorioFiltro('advento')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        repertorioFiltro === 'advento'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-purple-300 hover:bg-slate-600'
                      }`}
                    >
                      \ud83d\udd6f\ufe0f Advento
                    </button>
                    <button
                      onClick={() => setRepertorioFiltro('missa-galo')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        repertorioFiltro === 'missa-galo'
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-700 text-orange-300 hover:bg-slate-600'
                      }`}
                    >
                      \ud83c\udf84 Missa do Galo
                    </button>
                    <button
                      onClick={() => setRepertorioFiltro('tempo-natal')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        repertorioFiltro === 'tempo-natal'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-cyan-300 hover:bg-slate-600'
                      }`}
                    >
                      \u2b50 Tempo do Natal
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {momentosFiltrados.map((momento) => (
              <Card
                key={momento.id}
                className="bg-slate-800/50 border-purple-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">{momento.numero}</span>
                    {momento.titulo}
                  </CardTitle>
                  {momento.observacao && (
                    <p className="text-purple-300 text-sm mt-1">
                      {momento.observacao}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {momento.musicas.map((musica) => {
                      const musicaId = `${momento.id}-${musica.numero}`;
                      const isSelected = musicasSelecionadas.includes(musicaId);
                      return (
                        <div
                          key={musicaId}
                          onClick={() => handleToggleMusica(musicaId)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-600/20 border-purple-500/50"
                              : "bg-purple-900/20 border-purple-500/20 hover:border-purple-500/40"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMusica(musicaId)}
                            className="border-purple-400"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">
                              {musica.titulo}
                            </p>
                            <p className="text-purple-300 text-sm">
                              {musica.artista}
                            </p>
                            {musica.observacao && (
                              <p className="text-purple-400 text-xs mt-1">
                                {musica.observacao}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {musica.youtube && (
                              <a
                                href={musica.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
                                title="Ver no YouTube"
                              >
                                <Youtube className="w-4 h-4 text-red-400" />
                              </a>
                            )}
                            {musica.cifra && (
                              <a
                                href={musica.cifra}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full bg-orange-600/20 hover:bg-orange-600/40 transition-colors"
                                title="Ver cifra"
                              >
                                <Guitar className="w-4 h-4 text-orange-400" />
                              </a>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Preview do Repert\u00f3rio
            </DialogTitle>
            <DialogDescription className="text-purple-300">
              Revise as m\u00fasicas selecionadas antes de salvar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Informa\u00e7\u00f5es do Repert\u00f3rio */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-2">{nome || "Sem nome"}</h3>
              {descricao && <p className="text-purple-300 text-sm">{descricao}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-purple-200">
                <span>Total: {musicasSelecionadas.length} m\u00fasicas</span>
                {dataCelebracao && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(dataCelebracao + 'T00:00').toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* M\u00fasicas Agrupadas por Momento */}
            {musicasAgrupadas.length === 0 ? (
              <p className="text-purple-300 text-center py-8">Nenhuma m\u00fasica selecionada</p>
            ) : (
              musicasAgrupadas.map((grupo, idx) => (
                <div key={idx} className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">{grupo.momento.numero}</span>
                    {grupo.momento.titulo}
                  </h4>
                  <div className="space-y-2">
                    {grupo.musicas.map((musica, musicaIdx) => (
                      <div
                        key={musicaIdx}
                        className="flex items-center justify-between bg-slate-700/30 rounded p-3"
                      >
                        <div>
                          <p className="text-white font-medium">{musica.titulo}</p>
                          <p className="text-purple-300 text-sm">{musica.artista}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {musica.youtube && (
                            <a
                              href={musica.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
                            >
                              <Youtube className="w-4 h-4 text-red-400" />
                            </a>
                          )}
                          {musica.cifra && (
                            <a
                              href={musica.cifra}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-orange-600/20 hover:bg-orange-600/40 transition-colors"
                            >
                              <Guitar className="w-4 h-4 text-orange-400" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Bot\u00f5es de A\u00e7\u00e3o */}
            <div className="flex gap-3 pt-4 border-t border-purple-500/20">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1 bg-slate-700 border-purple-500/30 hover:bg-slate-600 text-white"
              >
                Voltar para Edi\u00e7\u00e3o
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleSalvar();
                }}
                disabled={createMutation.isPending || musicasSelecionadas.length === 0 || !nome.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "Salvando..." : "Confirmar e Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
