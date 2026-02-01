import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Music, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Users, 
  Shield,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Moderador() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-purple-300">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "moderator" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-red-700/30 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <CardTitle className="text-red-300">Acesso Negado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-200 mb-4">
              Você não tem permissão para acessar o painel de moderadores.
            </p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Voltar para Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recursos = [
    {
      titulo: "Escalas",
      descricao: "Gerenciar todas as escalas do sistema",
      icone: Calendar,
      link: "/escalas",
      cor: "from-purple-600 to-pink-600",
    },
    {
      titulo: "Repertórios Base",
      descricao: "Adicionar e editar músicas nos repertórios litúrgicos",
      icone: Music,
      link: "/repertorio-base-admin/1",
      cor: "from-blue-600 to-purple-600",
    },
    {
      titulo: "Depoimentos",
      descricao: "Moderar depoimentos de usuários",
      icone: MessageSquare,
      link: "/admin",
      cor: "from-green-600 to-teal-600",
    },
    {
      titulo: "Blog",
      descricao: "Criar e publicar artigos no blog",
      icone: FileText,
      link: "/blog-admin",
      cor: "from-orange-600 to-red-600",
    },
    {
      titulo: "Estatísticas",
      descricao: "Visualizar métricas e estatísticas do site",
      icone: BarChart3,
      link: "/escalas/estatisticas",
      cor: "from-indigo-600 to-purple-600",
    },
    {
      titulo: "Usuários",
      descricao: "Visualizar usuários e suspender contas (com justificativa)",
      icone: Users,
      link: "/admin/usuarios",
      cor: "from-pink-600 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-xl">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-10 h-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Painel de Moderador
                </h1>
              </div>
              <p className="text-purple-300">
                Bem-vindo, <span className="font-semibold">{user.name}</span>
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-purple-600/30 text-purple-300 hover:bg-purple-600/10">
                Voltar para o Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Informações de Acesso */}
        <Card className="bg-slate-800/50 border-purple-700/30 mb-8">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Suas Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">✓ Você pode:</h4>
                <ul className="space-y-1 text-purple-200">
                  <li>• Gerenciar todas as escalas</li>
                  <li>• Editar repertórios base</li>
                  <li>• Moderar depoimentos</li>
                  <li>• Gerenciar blog</li>
                  <li>• Visualizar estatísticas</li>
                  <li>• Suspender usuários (com justificativa)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">✗ Você não pode:</h4>
                <ul className="space-y-1 text-purple-200">
                  <li>• Excluir usuários</li>
                  <li>• Alterar permissões de usuários</li>
                  <li>• Acessar logs de auditoria completos</li>
                  <li>• Enviar emails em massa</li>
                  <li>• Exportar dados sensíveis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recursos.map((recurso) => {
            const Icone = recurso.icone;
            return (
              <Link key={recurso.titulo} href={recurso.link}>
                <Card className="bg-slate-800/50 border-purple-700/30 hover:border-purple-600/50 transition-all hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${recurso.cor} flex items-center justify-center mb-3`}>
                      <Icone className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-purple-200">{recurso.titulo}</CardTitle>
                    <CardDescription className="text-purple-300">
                      {recurso.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
                      Acessar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Nota de Rodapé */}
        <Card className="bg-slate-800/30 border-purple-700/20 mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-300 text-center">
              <Shield className="w-4 h-4 inline mr-2" />
              Todas as suas ações são registradas nos logs de auditoria do sistema.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
