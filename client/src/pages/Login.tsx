import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { APP_LOGO, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Login() {
  const handleLogin = () => {
    // Redireciona para o portal OAuth do Manus
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt="LouvaMais" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Bem-vindo de volta!</CardTitle>
          <p className="text-purple-200 mt-2">
            Entre para acessar suas músicas favoritas e repertórios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 text-lg flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Manus
          </Button>

          <div className="bg-purple-900/30 rounded-lg p-4">
            <p className="text-purple-200 text-sm text-center">
              O Manus oferece login seguro via Google, Facebook e outras opções
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-purple-500/20">
            <p className="text-purple-200 text-sm">
              Não tem uma conta?{" "}
              <Link href="/cadastro">
                <a className="text-pink-400 hover:text-pink-300 font-medium">
                  Cadastre-se gratuitamente
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
