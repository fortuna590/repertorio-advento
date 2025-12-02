import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { APP_LOGO } from "@/const";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export default function PageHeader({ title, description, showBackButton = true }: PageHeaderProps) {
  const [location] = useLocation();

  return (
    <header className="border-b border-purple-500/20 bg-gradient-to-r from-slate-900/80 to-purple-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Logo e Home */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-white hidden sm:inline">LouvaMais</span>
          </Link>

          {/* Navegação e Botões */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <Link href="/repertorio" className={`transition ${location === "/repertorio" ? "text-purple-400 font-semibold" : "text-purple-200 hover:text-white"}`}>
                Repertório
              </Link>
              <Link href="/blog" className={`transition ${location === "/blog" ? "text-purple-400 font-semibold" : "text-purple-200 hover:text-white"}`}>
                Blog
              </Link>
              <Link href="/produtos" className={`transition ${location === "/produtos" ? "text-purple-400 font-semibold" : "text-purple-200 hover:text-white"}`}>
                Produtos
              </Link>
            </nav>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              {showBackButton && location !== "/" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-purple-200 hover:text-white hover:bg-purple-500/20"
                  title="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Voltar</span>
                </Button>
              )}

              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-200 hover:text-white hover:bg-purple-500/20"
                  title="Ir para Home"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Título e Descrição */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
          {description && <p className="text-purple-200">{description}</p>}
        </div>
      </div>
    </header>
  );
}
