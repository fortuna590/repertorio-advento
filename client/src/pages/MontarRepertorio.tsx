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
  Plus,
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";

// Dados das músicas do Advento organizadas por momento
const musicasPorMomento = {
  Entrada: [
    { id: "entrada-1", titulo: "Vem, Senhor Jesus", artista: "Ministério Adoração e Vida" },
    { id: "entrada-2", titulo: "Maranata", artista: "Comunidade Católica Shalom" },
    { id: "entrada-3", titulo: "Preparai o Caminho", artista: "Comunidade Católica Shalom" },
    { id: "entrada-4", titulo: "Vem, Vem, Senhor", artista: "Ministério Adoração e Vida" },
    { id: "entrada-5", titulo: "Desperta, Jerusalém", artista: "Comunidade Católica Shalom" },
  ],
  "Ato Penitencial": [
    { id: "ato-penitencial-1", titulo: "Senhor, Piedade (Advento)", artista: "Pe. Zezinho" },
    { id: "ato-penitencial-2", titulo: "Kyrie Eleison", artista: "Taizé" },
  ],
  Salmo: [
    { id: "salmo-1", titulo: "Salmo 24 - A Vós, Senhor", artista: "Ir. Miria Kolling" },
    { id: "salmo-2", titulo: "Salmo 84 - Mostrai-nos", artista: "Pe. José Weber" },
  ],
  Aclamação: [
    { id: "aclamacao-1", titulo: "Aleluia (Advento)", artista: "Comunidade Católica Shalom" },
    { id: "aclamacao-2", titulo: "Vem, Senhor, Vem!", artista: "Ministério Adoração e Vida" },
  ],
  Ofertório: [
    { id: "ofertorio-1", titulo: "Aceita, Senhor", artista: "Pe. Zezinho" },
    { id: "ofertorio-2", titulo: "Oferta de Amor", artista: "Comunidade Católica Shalom" },
  ],
  Santo: [
    { id: "santo-1", titulo: "Santo (Advento)", artista: "Pe. José Weber" },
    { id: "santo-2", titulo: "Hosana nas Alturas", artista: "Ministério Adoração e Vida" },
  ],
  Paz: [
    { id: "paz-1", titulo: "Paz Sobre a Terra", artista: "Comunidade Católica Shalom" },
    { id: "paz-2", titulo: "A Paz Esteja Convosco", artista: "Pe. Zezinho" },
  ],
  Cordeiro: [
    { id: "cordeiro-1", titulo: "Cordeiro de Deus (Advento)", artista: "Pe. José Weber" },
    { id: "cordeiro-2", titulo: "Cordeiro Manso", artista: "Ministério Adoração e Vida" },
  ],
  Comunhão: [
    { id: "comunhao-1", titulo: "Vinde, Fiéis", artista: "Tradicional" },
    { id: "comunhao-2", titulo: "Ó Vinde, Adoremos", artista: "Tradicional" },
    { id: "comunhao-3", titulo: "Pão da Vida", artista: "Comunidade Católica Shalom" },
    { id: "comunhao-4", titulo: "Eu Vim Para Que Todos", artista: "Pe. Zezinho" },
  ],
  "Ação de Graças": [
    { id: "acao-gracas-1", titulo: "Magnificat", artista: "Ir. Miria Kolling" },
    { id: "acao-gracas-2", titulo: "Graças e Louvores", artista: "Ministério Adoração e Vida" },
  ],
  Final: [
    { id: "final-1", titulo: "Ide Por Todo o Mundo", artista: "Pe. Zezinho" },
    { id: "final-2", titulo: "Maria de Nazaré", artista: "Pe. Zezinho" },
    { id: "final-3", titulo: "Virgem do Silêncio", artista: "Comunidade Católica Shalom" },
    { id: "final-4", titulo: "Ave Maria (Advento)", artista: "Tradicional" },
  ],
};

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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-800/50 border-purple-500/20">
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

          {/* Seleção de Músicas */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(musicasPorMomento).map(([momento, musicas]) => (
              <Card
                key={momento}
                className="bg-slate-800/50 border-purple-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    {momento}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {musicas.map((musica) => {
                      const isSelected = musicasSelecionadas.includes(musica.id);
                      return (
                        <div
                          key={musica.id}
                          onClick={() => handleToggleMusica(musica.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-600/20 border-purple-500/50"
                              : "bg-purple-900/20 border-purple-500/20 hover:border-purple-500/40"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMusica(musica.id)}
                            className="border-purple-400"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {musica.titulo}
                            </p>
                            <p className="text-purple-300 text-sm truncate">
                              {musica.artista}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                          )}
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
