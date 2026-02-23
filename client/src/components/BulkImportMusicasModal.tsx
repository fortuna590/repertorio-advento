import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";

interface BulkImportMusicasModalProps {
  open: boolean;
  onClose: () => void;
  repertorioId: string;
  momentoId: string;
  momentoTitulo: string;
  onSuccess: () => void;
}

interface MusicaCSV {
  titulo: string;
  artista?: string;
  youtube?: string;
  cifra?: string;
  observacao?: string;
  ordem?: number;
}

export function BulkImportMusicasModal({
  open,
  onClose,
  repertorioId,
  momentoId,
  momentoTitulo,
  onSuccess,
}: BulkImportMusicasModalProps) {
  const [musicas, setMusicas] = useState<MusicaCSV[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [processando, setProcessando] = useState(false);

  const adicionarMutation = trpc.musicasBase.adicionar.useMutation();

  const downloadTemplate = () => {
    const csv = `titulo,artista,youtube,cifra,observacao,ordem
"Exemplo de Música","Nome do Artista","https://youtube.com/watch?v=...","https://cifraclub.com.br/...","Observação opcional",1
"Outra Música","Outro Artista","","","",2`;
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `template_musicas_${momentoId}.csv`;
    link.click();
  };

  const parseCSV = (text: string): MusicaCSV[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Pular header
    const dataLines = lines.slice(1);
    const musicas: MusicaCSV[] = [];

    for (const line of dataLines) {
      // Parse CSV com suporte a aspas
      const regex = /("(?:[^"]|"")*"|[^,]*)/g;
      const values = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[1] !== undefined) {
          values.push(match[1].replace(/^"|"$/g, "").replace(/""/g, '"'));
        }
      }

      if (values.length >= 1 && values[0].trim()) {
        musicas.push({
          titulo: values[0].trim(),
          artista: values[1]?.trim() || "",
          youtube: values[2]?.trim() || "",
          cifra: values[3]?.trim() || "",
          observacao: values[4]?.trim() || "",
          ordem: values[5] ? parseInt(values[5]) : undefined,
        });
      }
    }

    return musicas;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const musicasParsed = parseCSV(text);
        setMusicas(musicasParsed);
        setErros([]);
        
        if (musicasParsed.length === 0) {
          setErros(["Nenhuma música válida encontrada no arquivo"]);
        } else {
          toast.success(`${musicasParsed.length} músicas carregadas`);
        }
      } catch (error) {
        setErros(["Erro ao processar arquivo CSV"]);
        toast.error("Erro ao processar arquivo");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (musicas.length === 0) {
      toast.error("Nenhuma música para importar");
      return;
    }

    setProcessando(true);
    const novosErros: string[] = [];
    let sucessos = 0;

    for (const musica of musicas) {
      try {
        await adicionarMutation.mutateAsync({
          repertorioId,
          momentoId,
          titulo: musica.titulo,
          artista: musica.artista,
          youtube: musica.youtube,
          cifra: musica.cifra,
          ordem: musica.ordem,
        });
        sucessos++;
      } catch (error: any) {
        novosErros.push(`${musica.titulo}: ${error.message}`);
      }
    }

    setProcessando(false);
    setErros(novosErros);

    if (sucessos > 0) {
      toast.success(`${sucessos} música(s) importada(s) com sucesso`);
      onSuccess();
      
      if (novosErros.length === 0) {
        onClose();
      }
    } else {
      toast.error("Nenhuma música foi importada");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Músicas em Lote - {momentoTitulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-200 mb-2">
                Baixe o template CSV para ver o formato correto do arquivo
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4" />
                Baixar Template CSV
              </Button>
            </div>
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecione o arquivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-purple-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </div>

          {/* Preview */}
          {musicas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Preview ({musicas.length} músicas)
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-slate-800 rounded-lg border border-purple-500/20">
                {musicas.map((musica, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm p-2 bg-slate-700/50 rounded"
                  >
                    <span className="text-purple-400 font-mono">#{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {musica.titulo}
                      </div>
                      {musica.artista && (
                        <div className="text-purple-300 text-xs truncate">
                          {musica.artista}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Erros */}
          {erros.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-red-200 mb-2">
                Erros durante a importação:
              </h3>
              <ul className="text-sm text-red-300 space-y-1 max-h-32 overflow-y-auto">
                {erros.map((erro, index) => (
                  <li key={index}>• {erro}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={musicas.length === 0 || processando}
              className="gap-2"
            >
              {processando ? (
                "Importando..."
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar {musicas.length} Música(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
