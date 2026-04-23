import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Music2, User, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/repertorios", label: "Repertórios" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre", label: "Sobre" },
];

export default function ModernHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}>
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">Louva<span className="gradient-text">Mais</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === n.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              {n.label}
            </Link>
          ))}
          {/* Link admin visível apenas para admins/moderadores */}
          {isAdmin && (
            <Link href="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                location === "/admin" ? "bg-purple-600/30 text-purple-300" : "text-purple-400/80 hover:text-purple-300 hover:bg-purple-600/10"
              }`}>
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth button (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {!loading && (
            isAuthenticated ? (
              <Link href="/minha-area"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === "/minha-area" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span>Minha Área</span>
              </Link>
            ) : (
              <a href={getLoginUrl()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all">
                <LogIn className="w-4 h-4" />
                Entrar
              </a>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 py-3" style={{ background: "rgba(10,10,15,0.95)" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                location === n.href ? "text-white bg-white/5" : "text-white/60 hover:text-white"
              }`}>
              {n.label}
            </Link>
          ))}
          {/* Admin link mobile */}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                location === "/admin" ? "text-purple-300 bg-purple-600/10" : "text-purple-400/80 hover:text-purple-300"
              }`}>
              <Shield className="w-4 h-4" />
              Painel Admin
            </Link>
          )}
          {/* Auth mobile */}
          {!loading && (
            isAuthenticated ? (
              <Link href="/minha-area" onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-t border-white/5 mt-2 pt-4 ${
                  location === "/minha-area" ? "text-white" : "text-purple-300 hover:text-white"
                }`}>
                <User className="w-4 h-4" />
                Minha Área
              </Link>
            ) : (
              <a href={getLoginUrl()} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-purple-300 hover:text-white transition-colors border-t border-white/5 mt-2 pt-4">
                <LogIn className="w-4 h-4" />
                Entrar
              </a>
            )
          )}
        </div>
      )}
    </header>
  );
}
