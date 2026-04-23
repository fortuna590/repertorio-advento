export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-white/10 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">Página não encontrada</h2>
      <p className="text-white/50 mb-8">A página que você procura não existe ou foi movida.</p>
      <a href="/" className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{background:"linear-gradient(to right,#9333ea,#ec4899)"}}>
        Voltar ao início
      </a>
    </div>
  );
}
