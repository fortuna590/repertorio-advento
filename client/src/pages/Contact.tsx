import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Entre em Contato</h1>
          <p className="text-xl text-purple-200">
            Estamos prontos para ajudar sua comunidade
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Formulário */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="w-5 h-5 text-purple-400" />
                Formulário de Contato
              </CardTitle>
              <CardDescription className="text-purple-200">
                Preencha o formulário abaixo e entraremos em contato em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-white">
                    Nome Completo <span className="text-pink-400">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email <span className="text-pink-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-white">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paroquia" className="text-white">Paróquia / Comunidade</Label>
                  <Input
                    id="paroquia"
                    name="paroquia"
                    value={formData.paroquia}
                    onChange={handleChange}
                    placeholder="Nome da sua paróquia ou comunidade"
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem" className="text-white">
                    Mensagem <span className="text-pink-400">*</span>
                  </Label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conte-nos como podemos ajudar..."
                    rows={6}
                    required
                    className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={sendEmailMutation.isPending}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enviado com sucesso!</span>
                    </div>
                  )}
                  
                  {sendEmailMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-pink-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Erro ao enviar</span>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Email Direto</h3>
                    <a
                      href="mailto:louvamais590@gmail.com"
                      className="text-purple-300 hover:text-purple-200 transition"
                    >
                      louvamais590@gmail.com
                    </a>
                  </div>
                  <p className="text-sm text-purple-200">
                    Você também pode nos enviar um email diretamente
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Horário de Atendimento */}
            <Card className="bg-slate-800 border-purple-500/20">
              <CardContent className="py-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-white">Horário de Atendimento</h3>
                  <div className="space-y-2 text-purple-200">
                    <p>Segunda a Sexta: 09:00 - 18:00</p>
                    <p>Sábado: 09:00 - 12:00</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">Repertório Católico</span>
              </div>
              <p className="text-purple-200 text-sm">
                Músicas litúrgicas para enriquecer suas celebrações
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </Link>
                <Link href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                  Blog
                </Link>
                <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
            <p>© 2025 LouvaMais - Repertório Católico. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
