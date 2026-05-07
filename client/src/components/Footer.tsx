import { Link } from "wouter";
import { Music2, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 mt-10" style={{ background: "rgba(10,10,15,0.9)" }}>
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}>
              <Music2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-black text-white">Louva<span className="gradient-text">Mais</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/repertorios" className="hover:text-white transition-colors">Repertórios</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link>
            <Link href="/politica-privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </nav>
          <p className="text-xs text-white/25 flex items-center gap-1.5">
            Feito com <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
}
