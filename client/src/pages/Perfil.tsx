import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Church, Image, FileText, Save } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Perfil() {
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const [nome, setNome] = useState(user?.name || "");
  const [paroquia, setParoquia] = useState("");
  const [bio, setBio] = useState("");

  // Redirect if not logged in
  if (!isLoading && !user) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    // TODO: Implement profile update mutation
    toast.success("Perfil atualizado com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
        <ModernHeader />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-700 rounded-lg"></div>
            <div className="h-64 bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Meu Perfil</h1>
          <p className="text-xl text-purple-200">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Card */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={user.name || "Usuário"}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-600/30">
                  <Image className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
                <p className="text-purple-300 text-sm mt-2">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-purple-200 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-purple-200 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-purple-300 border border-slate-600 cursor-not-allowed"
              />
              <p className="text-purple-400 text-sm mt-1">
                Email vinculado à sua conta OAuth
              </p>
            </div>

            {/* Paróquia */}
            <div>
              <label className="block text-purple-200 mb-2 flex items-center gap-2">
                <Church className="w-4 h-4" />
                Paróquia / Ministério (opcional)
              </label>
              <input
                type="text"
                value={paroquia}
                onChange={(e) => setParoquia(e.target.value)}
                placeholder="Ex: Paróquia São José, Ministério de Música Louva Deus"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-purple-200 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Biografia (opcional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você e seu ministério..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-purple-300 text-sm">Método de Login</p>
                <p className="text-white font-medium">{user?.loginMethod || "OAuth"}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">Membro desde</p>
                <p className="text-white font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">Último acesso</p>
                <p className="text-white font-medium">
                  {user?.lastSignedIn
                    ? new Date(user.lastSignedIn).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">Tipo de Conta</p>
                <p className="text-white font-medium capitalize">{user?.role || "Usuário"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
