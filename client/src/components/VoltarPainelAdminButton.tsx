import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function VoltarPainelAdminButton() {
  return (
    <Link href="/admin">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Painel Admin
      </Button>
    </Link>
  );
}
