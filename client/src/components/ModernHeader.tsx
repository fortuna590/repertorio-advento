import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Music, BookOpen, ShoppingBag, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Início", href: "/", icon: <Home className="w-4 h-4" /> },
  { label: "Repertório", href: "/repertorio", icon: <Music className="w-4 h-4" /> },
  { label: "Blog", href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Loja", href: "/loja", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Estatísticas", href: "/estatisticas", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Sobre", href: "/sobre", icon: <Info className="w-4 h-4" /> },
];

export default function ModernHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => location === href;

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
          </nav>
        )}
      </div>
    </header>
  );
}
