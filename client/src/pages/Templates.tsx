import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { EscalasNavigation } from "@/components/EscalasNavigation";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Templates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  // Form state
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");
  const [funcoes, setFuncoes] = useState<Array<{ nome: string; descricao: string; ordem: number }>>([
    { nome: "", descricao: "", ordem: 0 },
  ]);

  // Queries e Mutations
  const { data: templates, isLoading, refetch } = trpc.escalas.listarTemplates.useQuery(
    { userId: user?.openId || "" },
    { enabled: !!user }
  );

  const criarTemplate = trpc.escalas.criarTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      refetch();
      resetForm();
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });

  const atualizarTemplate = trpc.escalas.atualizarTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado com sucesso!");
      refetch();
      resetForm();
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });

  const deletarTemplate = trpc.escalas.deletarTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTipo("musicos");
    setFuncoes([{ nome: "", descricao: "", ordem: 0 }]);
    setEditingTemplate(null);
  };

  const handleOpenDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setNome(template.nome);
      setDescricao(template.descricao || "");
      setTipo(template.tipo);
      setFuncoes(template.funcoes || [{ nome: "", descricao: "", ordem: 0 }]);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    const funcoesValidas = funcoes.filter(f => f.nome.trim());
    if (funcoesValidas.length === 0) {
      toast.error("Adicione pelo menos uma função");
      return;
    }

    const data = {
      userId: user?.openId || "",
      nome,
      descricao,
      tipo,
      funcoes: funcoesValidas.map((f, idx) => ({ ...f, ordem: idx })),
    };

    if (editingTemplate) {
      atualizarTemplate.mutate({ id: editingTemplate.id, ...data });
    } else {
      criarTemplate.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      deletarTemplate.mutate({ id });
    }
  };

  const addFuncao = () => {
    setFuncoes([...funcoes, { nome: "", descricao: "", ordem: funcoes.length }]);
  };

  const removeFuncao = (index: number) => {
    setFuncoes(funcoes.filter((_, i) => i !== index));
  };

  const updateFuncao = (index: number, field: "nome" | "descricao", value: string) => {
    const updated = [...funcoes];
    updated[index][field] = value;
    setFuncoes(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <EscalasNavigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-white">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <EscalasNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/escalas")}
              className="bg-slate-800/50 border-purple-500/30 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white">Meus Templates</h1>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Lista de Templates */}
        {templates && templates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: any) => (
              <Card key={template.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{template.nome}</h3>
                    <p className="text-sm text-purple-300 capitalize">{template.tipo.replace("_", " ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(template)}
                      className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                      className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {template.descricao && (
                  <p className="text-purple-200 text-sm mb-4">{template.descricao}</p>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-purple-300">Funções:</p>
                  <ul className="text-sm text-purple-200 space-y-1">
                    {template.funcoes.map((funcao: any, idx: number) => (
                      <li key={idx}>• {funcao.nome}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <p className="text-center text-purple-300 text-lg">
              Nenhum template criado ainda. Crie seu primeiro template para agilizar a criação de escalas!
            </p>
          </Card>
        )}

        {/* Dialog de Criar/Editar Template */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Missa Dominical"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva quando usar este template"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musicos">Músicos</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="grupo_oracao">Grupo de Oração</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Funções *</Label>
                  <Button size="sm" onClick={addFuncao} variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Função
                  </Button>
                </div>

                <div className="space-y-3">
                  {funcoes.map((funcao, index) => (
                    <Card key={index} className="p-4 bg-slate-50">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nome da função (ex: Violão)"
                            value={funcao.nome}
                            onChange={(e) => updateFuncao(index, "nome", e.target.value)}
                          />
                          <Input
                            placeholder="Descrição (opcional)"
                            value={funcao.descricao}
                            onChange={(e) => updateFuncao(index, "descricao", e.target.value)}
                          />
                        </div>
                        {funcoes.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFuncao(index)}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
