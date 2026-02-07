import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Musica = {
  id?: number;
  titulo: string;
  artista: string;
  tom: string;
  linkCifra: string;
  linkYoutube: string;
  momento: string;
};

interface MusicasRecentesSectionProps {
  onReutilizar: (musica: Musica) => void;
}

export function MusicasRecentesSection({ onReutilizar }: MusicasRecentesSectionProps) {
  const { data: musicasRecentes, isLoading } = trpc.musicasRecentes.listarRecentes.useQuery();

  if (isLoading || !musicasRecentes || musicasRecentes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Músicas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {musicasRecentes.slice(0, 6).map((musica, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-sm truncate">{musica.titulo}</p>
                <p className="text-xs text-muted-foreground truncate">{musica.artista}</p>
                <div className="flex gap-2 mt-1">
                  {musica.tom && (
                    <Badge variant="outline" className="text-xs">
                      Tom: {musica.tom}
                    </Badge>
                  )}
                  {musica.momento && (
                    <Badge variant="secondary" className="text-xs">
                      {musica.momento}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReutilizar({
                  titulo: musica.titulo,
                  artista: musica.artista || "",
                  tom: musica.tom || "",
                  linkCifra: musica.linkCifra || "",
                  linkYoutube: musica.linkYoutube || "",
                  momento: musica.momento,
                })}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
