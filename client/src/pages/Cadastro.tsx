import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { APP_LOGO, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Cadastro() {
  const handleSignup = () => {
    // O mesmo fluxo OAuth serve para login e cadastro
    // O Manus detecta automaticamente se é novo usuário
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt="LouvaMais" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Crie sua conta</CardTitle>
          <p className="text-purple-200 mt-2">
            Cadastre-se gratuitamente e desbloqueie recursos exclusivos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Benefits */}
          <div className="bg-purple-900/30 rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-3">Com sua conta você pode:</h3>
            <ul className="space-y-2 text-purple-200 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">✓</span>
                <span>Salvar suas músicas favoritas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">✓</span>
                <span>Criar repertórios personalizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">✓</span>
                <span>Receber newsletter com novas músicas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">✓</span>
                <span>Sugestões personalizadas de repertório</span>
              </li>
            </ul>
          </div>

          {/* Single Signup Button */}
          <Button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 text-lg flex items-center justify-center gap-3"
          >
            <UserPlus className="w-5 h-5" />
            Cadastrar com Manus
          </Button>

          <div className="bg-purple-900/30 rounded-lg p-4">
            <p className="text-purple-200 text-sm text-center">
              Login rápido e seguro via Google, Facebook ou email através do Manus
            </p>
          </div>

          {/* Terms */}
          <p className="text-purple-300 text-xs text-center">
            Ao se cadastrar, você concorda com nossos{" "}
            <a href="#" className="text-pink-400 hover:text-pink-300">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-pink-400 hover:text-pink-300">
              Política de Privacidade
            </a>
          </p>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-purple-500/20">
            <p className="text-purple-200 text-sm">
              Já tem uma conta?{" "}
              <Link href="/login">
                <a className="text-pink-400 hover:text-pink-300 font-medium">
                  Faça login
                </a>
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <a className="text-purple-300 hover:text-purple-200 text-sm">
                ← Voltar para o site
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
