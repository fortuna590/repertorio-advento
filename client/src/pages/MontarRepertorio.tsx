import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

  const createMutation = trpc.repertorios.create.useMutation({
    onSuccess: (data) => {
      toast.success("Repertório criado com sucesso!");
      navigate(`/repertorio/${data.repertorioId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Redirect para login se não autenticado
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
                <div className="pt-4 border-t border-purple-500/20">
                  <div className="flex items-center justify-between text-purple-200">
                    <span className="text-sm">Músicas selecionadas:</span>
                    <span className="font-bold text-lg text-white">
                      {musicasSelecionadas.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seleção de Músicas - Usando dados de todos os repertórios */}
          <div className="lg:col-span-2 space-y-6">
            {repertorioCompleto.map((momento) => (
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
    </div>
  );
}
