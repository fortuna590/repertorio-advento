import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Home, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";

export default function DonationSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-10 pb-8 text-center space-y-6">
          {/* Ícone de Sucesso */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Mensagem de Agradecimento */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Doação Realizada! 🎉
            </h1>
            <p className="text-muted-foreground">
              Muito obrigado pelo seu apoio ao projeto LouvaMais!
            </p>
          </div>

          {/* Informações */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Sua doação foi processada com sucesso
                </p>
                <p className="text-sm text-muted-foreground">
                  Você receberá um email de confirmação com os detalhes da transação.
                </p>
              </div>
            </div>

            {sessionId && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  ID da transação: <span className="font-mono">{sessionId.substring(0, 20)}...</span>
                </p>
              </div>
            )}
          </div>

          {/* Mensagem de Impacto */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-lg p-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Sua generosidade</span> nos ajuda a continuar 
              oferecendo ferramentas gratuitas para igrejas e comunidades católicas em todo o Brasil. 
              Que Deus abençoe você abundantemente! 🙏
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setLocation("/")}
            >
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => setLocation("/sobre")}
            >
              Conheça o Projeto
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Logo */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-3">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="text-left">
                <p className="font-semibold text-foreground">LouvaMais</p>
                <p className="text-xs text-muted-foreground">Church Solutions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
