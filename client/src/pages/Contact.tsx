import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    paroquia: "",
    mensagem: "",
  });

  const sendEmailMutation = trpc.contact.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso!", {
        description: "Entraremos em contato em breve.",
      });
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        paroquia: "",
        mensagem: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem", {
        description: error.message || "Tente novamente mais tarde.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.mensagem) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha nome, email e mensagem.",
      });
      return;
    }

    sendEmailMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Repertório
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Entre em Contato
              </h1>
              <p className="text-muted-foreground mt-1">
                Estamos prontos para ajudar sua comunidade
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Formulário de Contato
              </CardTitle>
              <CardDescription>
                Preencha o formulário abaixo e entraremos em contato em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paroquia">Paróquia / Comunidade</Label>
                  <Input
                    id="paroquia"
                    name="paroquia"
                    value={formData.paroquia}
                    onChange={handleChange}
                    placeholder="Nome da sua paróquia ou comunidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">
                    Mensagem <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conte-nos como podemos ajudar..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={sendEmailMutation.isPending}
                    className="gap-2"
                  >
                    {sendEmailMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                  
                  {sendEmailMutation.isSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enviado com sucesso!</span>
                    </div>
                  )}
                  
                  {sendEmailMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>Erro ao enviar</span>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/30">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email Direto</h3>
                  <a
                    href="mailto:louvamais590@gmail.com"
                    className="text-primary hover:underline"
                  >
                    louvamais590@gmail.com
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você também pode nos enviar um email diretamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Uma produção de{" "}
                <span className="font-semibold text-primary">LouvaMais - Church Solutions</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                © 2025 LouvaMais. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
