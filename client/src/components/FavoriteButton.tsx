import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface FavoriteButtonProps {
  musicaId: string;
  musicaTitulo: string;
  musicaArtista: string;
  className?: string;
}

export default function FavoriteButton({
  musicaId,
  musicaTitulo,
  musicaArtista,
  className = "",
}: FavoriteButtonProps) {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const { data: isFavorite, isLoading } = trpc.favoritos.isFavorite.useQuery(
    { musicaId },
    { enabled: !!user }
  );

  const addMutation = trpc.favoritos.add.useMutation({
    onSuccess: () => {
      toast.success("Música adicionada aos favoritos! ❤️");
      utils.favoritos.isFavorite.invalidate({ musicaId });
      utils.favoritos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar favorito");
    },
  });

  const removeMutation = trpc.favoritos.remove.useMutation({
    onSuccess: () => {
      toast.success("Música removida dos favoritos");
      utils.favoritos.isFavorite.invalidate({ musicaId });
      utils.favoritos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover favorito");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Faça login para salvar músicas favoritas", {
        action: {
          label: "Entrar",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    if (isFavorite) {
      removeMutation.mutate({ musicaId });
    } else {
      addMutation.mutate({
        musicaId,
        musicaTitulo,
        musicaArtista,
      });
    }
  };

  const isProcessing = addMutation.isPending || removeMutation.isPending;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 hover:bg-pink-500/10 ${className}`}
      onClick={handleClick}
      disabled={isProcessing || isLoading}
    >
      <Heart
        className={`w-4 h-4 transition-all ${
          isFavorite
            ? "fill-pink-500 text-pink-500"
            : "text-purple-400 hover:text-pink-400"
        } ${isProcessing ? "animate-pulse" : ""}`}
      />
    </Button>
  );
}
