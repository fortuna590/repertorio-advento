import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music, Check, X, Eye, Save, Mail, Printer, ArrowLeft, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import { repertorio, type Musica } from "@/data/repertorio";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MontarRepertorio() {
  const [, setLocation] = useLocation();
  const [musicasSelecionadas, setMusicasSelecionadas] = useState<Musica[]>([]);
  const [nomeRepertorio, setNomeRepertorio] = useState("");
  const [descricaoRepertorio, setDescricaoRepertorio] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailDestinatario, setEmailDestinatario] = useState("");
  const [nomeDestinatario, setNomeDestinatario] = useState("");

  const criarRepertorioMutation = trpc.repertorios.create.useMutation();
  const enviarEmailMutation = trpc.repertorios.sendByEmail.useMutation();

  const toggleMusica = (musica: Musica) => {
    const jaAdicionada = musicasSelecionadas.some(m => m.id === musica.id);
    
    if (jaAdicionada) {
      setMusicasSelecionadas(musicasSelecionadas.filter(m => m.id !== musica.id));
    } else {
      setMusicasSelecionadas([...musicasSelecionadas, musica]);
    }
  };

  const isMusicaSelecionada = (musicaId: string | undefined) => {
    if (!musicaId) return false;
    return musicasSelecionadas.some(m => m.id === musicaId);
  };

  const handleSalvarRepertorio = async () => {
    if (!nomeRepertorio.trim()) {
      toast.error("Por favor, dê um nome ao repertório");
      return;
    }

    if (musicasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma música");
      return;
    }

    try {
      await criarRepertorioMutation.mutateAsync({
        nome: nomeRepertorio,
        descricao: descricaoRepertorio,
        musicas: musicasSelecionadas,
      });

      toast.success("Repertório salvo com sucesso!");
      
      // Resetar formulário
      setNomeRepertorio("");
      setDescricaoRepertorio("");
      setMusicasSelecionadas([]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar repertório");
    }
  };

  const handleEnviarEmail = async () => {
    if (!emailDestinatario.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    if (musicasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma música");
      return;
    }

    try {
      // Primeiro salvar o repertório
      const repertorioResult = await criarRepertorioMutation.mutateAsync({
        nome: nomeRepertorio || "Repertório Personalizado",
        descricao: descricaoRepertorio,
        musicas: musicasSelecionadas,
        emailUsuario: emailDestinatario,
        nomeUsuario: nomeDestinatario,
      });

      // Depois enviar por email
      await enviarEmailMutation.mutateAsync({
        repertorioId: repertorioResult.repertorioId,
        destinatarioEmail: emailDestinatario,
        destinatarioNome: nomeDestinatario,
      });

      toast.success("Repertório enviado por email!");
      setShowEmailDialog(false);
      setEmailDestinatario("");
      setNomeDestinatario("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email");
    }
  };

  const handleImprimir = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl print:hidden">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-bold text-lg text-foreground">Montar Repertório</div>
                  <div className="text-xs text-muted-foreground">Crie seu repertório personalizado</div>
                </div>
              </button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Painel de Seleção de Músicas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Selecione as Músicas
              </h2>
              <Badge variant="secondary" className="text-base px-4 py-2">
                {musicasSelecionadas.length} selecionada(s)
              </Badge>
            </div>

            {repertorio.map((momento) => (
              <div key={momento.id} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">{momento.numero}</span>
                  {momento.titulo}
                </h3>
                
                <div className="grid gap-3">
                  {momento.musicas.map((musica) => {
                    const selecionada = isMusicaSelecionada(musica.id);
                    
                    return (
                      <Card
                        key={musica.id}
                        className={`cursor-pointer transition-all duration-300 ${
                          selecionada 
                            ? 'border-primary bg-primary/5 shadow-lg' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => toggleMusica({ ...musica, momento: momento.titulo })}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Music className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">{musica.titulo}</span>
                              </CardTitle>
                              <CardDescription className="text-sm truncate">
                                {musica.artista}
                              </CardDescription>
                            </div>
                            <div className={`p-2 rounded-full ${
                              selecionada ? 'bg-primary' : 'bg-muted'
                            }`}>
                              {selecionada ? (
                                <Check className="w-5 h-5 text-primary-foreground" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Painel Lateral - Resumo e Ações */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Resumo */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Seu Repertório
                  </CardTitle>
                  <CardDescription>
                    {musicasSelecionadas.length} música(s) selecionada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome do Repertório
                    </label>
                    <Input
                      placeholder="Ex: Missa de Natal 2025"
                      value={nomeRepertorio}
                      onChange={(e) => setNomeRepertorio(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Descrição (opcional)
                    </label>
                    <Textarea
                      placeholder="Ex: Repertório para a Missa do Galo"
                      value={descricaoRepertorio}
                      onChange={(e) => setDescricaoRepertorio(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {musicasSelecionadas.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mb-3">
                        Músicas selecionadas:
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {musicasSelecionadas.map((musica, index) => (
                          <div key={musica.id} className="text-sm flex items-start gap-2">
                            <span className="text-primary font-medium">{index + 1}.</span>
                            <span className="flex-1">{musica.titulo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="space-y-3">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setShowPreview(true)}
                  disabled={musicasSelecionadas.length === 0}
                >
                  <Eye className="w-5 h-5" />
                  Visualizar Prévia
                </Button>

                <Button
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                  onClick={handleSalvarRepertorio}
                  disabled={musicasSelecionadas.length === 0 || criarRepertorioMutation.isPending}
                >
                  <Save className="w-5 h-5" />
                  {criarRepertorioMutation.isPending ? "Salvando..." : "Salvar Repertório"}
                </Button>

                <Button
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                  onClick={handleImprimir}
                  disabled={musicasSelecionadas.length === 0}
                >
                  <Printer className="w-5 h-5" />
                  Imprimir
                </Button>

                <Button
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowEmailDialog(true)}
                  disabled={musicasSelecionadas.length === 0}
                >
                  <Mail className="w-5 h-5" />
                  Enviar por Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Prévia */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {nomeRepertorio || "Repertório Personalizado"}
            </DialogTitle>
            {descricaoRepertorio && (
              <DialogDescription className="text-base">
                {descricaoRepertorio}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {musicasSelecionadas.map((musica, index) => (
              <Card key={musica.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-primary">{index + 1}.</span>
                    {musica.titulo}
                  </CardTitle>
                  <CardDescription>{musica.artista}</CardDescription>
                  <Badge variant="outline" className="w-fit mt-2">
                    {musica.momento}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {musica.youtube && (
                    <a
                      href={musica.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      🎵 YouTube: {musica.youtube}
                    </a>
                  )}
                  {musica.cifra && (
                    <a
                      href={musica.cifra}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      🎸 Cifra: {musica.cifra}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Envio por Email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Repertório por Email</DialogTitle>
            <DialogDescription>
              Digite o email do destinatário para enviar o repertório
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nome do destinatário (opcional)
              </label>
              <Input
                placeholder="Ex: Padre João"
                value={nomeDestinatario}
                onChange={(e) => setNomeDestinatario(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email do destinatário *
              </label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={emailDestinatario}
                onChange={(e) => setEmailDestinatario(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEmailDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleEnviarEmail}
                disabled={enviarEmailMutation.isPending}
              >
                <Mail className="w-4 h-4" />
                {enviarEmailMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
