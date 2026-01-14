import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Music, BookOpen, ShoppingBag, BarChart3, Info, User, LogIn, UserPlus, Heart, ListMusic, Settings, LogOut, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Início", href: "/", icon: <Home className="w-4 h-4" /> },
  { label: "Repertório", href: "/repertorios", icon: <Music className="w-4 h-4" /> },
  { label: "Blog", href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Loja", href: "/loja", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Estatísticas", href: "/estatisticas", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Sobre", href: "/sobre", icon: <Info className="w-4 h-4" /> },
];

export default function ModernHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  
  const { data: user } = trpc.auth.me.useQuery();
  const { data: adminCheck } = trpc.admin.checkSuperAdmin.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const isActive = (href: string) => location === href;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 to-slate-900/95 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
              <span className="text-white font-bold hidden sm:inline">LouvaMais</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.href)
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-purple-200 hover:text-white hover:bg-purple-600/30"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-600/30">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-600/30">
                    {user.foto ? (
                      <img src={user.foto} alt={user.name || "Usuário"} className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    {user.name || "Meu Perfil"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-purple-500/30">
                  <DropdownMenuLabel className="text-purple-200">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem onClick={() => navigate("/perfil")} className="text-purple-100 focus:bg-purple-600/30 focus:text-white cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/minhas-favoritas")} className="text-purple-100 focus:bg-purple-600/30 focus:text-white cursor-pointer">
                    <Heart className="w-4 h-4 mr-2" />
                    Minhas Favoritas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/meus-repertorios")} className="text-purple-100 focus:bg-purple-600/30 focus:text-white cursor-pointer">
                    <ListMusic className="w-4 h-4 mr-2" />
                    Meus Repertórios
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/escalas")} className="text-purple-100 focus:bg-purple-600/30 focus:text-white cursor-pointer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Escalas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="text-purple-100 focus:bg-purple-600/30 focus:text-white cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  {adminCheck?.isSuperAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-purple-500/20" />
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="text-yellow-400 focus:bg-yellow-600/30 focus:text-yellow-300 cursor-pointer">
                        <Shield className="w-4 h-4 mr-2" />
                        Administração
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-600/30 focus:text-red-300 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-600/30 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.href)
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:text-white hover:bg-purple-600/30"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
            
            <div className="border-t border-purple-500/20 pt-2 mt-2">
              {!user ? (
                <>
                  <Link href="/login">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </a>
                  </Link>
                  <Link href="/cadastro">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-200 flex items-center gap-2 mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Cadastrar
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/perfil">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </a>
                  </Link>
                  <Link href="/minhas-favoritas">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Minhas Favoritas
                    </a>
                  </Link>
                  <Link href="/meus-repertorios">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <ListMusic className="w-4 h-4" />
                      Meus Repertórios
                    </a>
                  </Link>
                  <Link href="/escalas">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Escalas
                    </a>
                  </Link>
                  <Link href="/configuracoes">
                    <a
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </a>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600/30 transition-all duration-200 flex items-center gap-2 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
