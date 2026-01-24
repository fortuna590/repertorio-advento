import { drizzle } from "drizzle-orm/mysql2";
import { repertoriosAdmin } from "../../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const repertoriosBase = [
  {
    nome: "Advento",
    slug: "advento",
    descricao: "Repertório litúrgico para o Tempo do Advento - preparação para o Natal",
    tempoLiturgico: "Advento",
    corPrimaria: "#7c3aed",
    corSecundaria: "#d946ef",
    corFundo: "#1e1b4b",
    corTexto: "#ffffff",
    imagemCapa: "/og-repertorio-principal.jpg",
    publicado: 1,
  },
  {
    nome: "Missa do Galo",
    slug: "missa-do-galo",
    descricao: "Repertório especial para a Missa do Galo - celebração da noite de Natal",
    tempoLiturgico: "Natal",
    corPrimaria: "#fbbf24",
    corSecundaria: "#f59e0b",
    corFundo: "#1e3a8a",
    corTexto: "#ffffff",
    imagemCapa: "/og-missa-do-galo.jpg",
    publicado: 1,
  },
  {
    nome: "Tempo do Natal",
    slug: "tempo-do-natal",
    descricao: "Repertório litúrgico para o Tempo do Natal - do Natal à Epifania",
    tempoLiturgico: "Natal",
    corPrimaria: "#fbbf24",
    corSecundaria: "#f59e0b",
    corFundo: "#1e3a8a",
    corTexto: "#ffffff",
    imagemCapa: "/og-tempo-do-natal.jpg",
    publicado: 1,
  },
  {
    nome: "Quaresma",
    slug: "quaresma",
    descricao: "Repertório litúrgico para o Tempo da Quaresma - preparação para a Páscoa",
    tempoLiturgico: "Quaresma",
    corPrimaria: "#7c2d12",
    corSecundaria: "#9a3412",
    corFundo: "#1c1917",
    corTexto: "#ffffff",
    imagemCapa: "/og-quaresma.jpg",
    publicado: 1,
  },
  {
    nome: "Páscoa",
    slug: "pascoa",
    descricao: "Repertório litúrgico para o Tempo Pascal - celebração da Ressurreição",
    tempoLiturgico: "Páscoa",
    corPrimaria: "#f8fafc",
    corSecundaria: "#e2e8f0",
    corFundo: "#0f172a",
    corTexto: "#ffffff",
    imagemCapa: "/og-pascoa.jpg",
    publicado: 1,
  },
  {
    nome: "Tempo Comum",
    slug: "tempo-comum",
    descricao: "Repertório litúrgico para o Tempo Comum - celebrações ordinárias do ano litúrgico",
    tempoLiturgico: "Tempo Comum",
    corPrimaria: "#059669",
    corSecundaria: "#10b981",
    corFundo: "#064e3b",
    corTexto: "#ffffff",
    imagemCapa: "/og-tempo-comum.jpg",
    publicado: 1,
  },
  {
    nome: "Celebrações Especiais",
    slug: "celebracoes-especiais",
    descricao: "Repertório para celebrações especiais - casamentos, batizados, primeira comunhão",
    tempoLiturgico: "Celebrações",
    corPrimaria: "#ec4899",
    corSecundaria: "#f472b6",
    corFundo: "#831843",
    corTexto: "#ffffff",
    imagemCapa: "/og-celebracoes.jpg",
    publicado: 1,
  },
];

async function seed() {
  console.log("🌱 Iniciando seed de repertórios base...");

  for (const rep of repertoriosBase) {
    try {
      const existing = await db
        .select()
        .from(repertoriosAdmin)
        .where(eq(repertoriosAdmin.slug, rep.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`✅ Repertório "${rep.nome}" já existe (slug: ${rep.slug})`);
        continue;
      }

      await db.insert(repertoriosAdmin).values(rep);
      console.log(`✅ Repertório "${rep.nome}" criado com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao criar repertório "${rep.nome}":`, error);
    }
  }

  console.log("🎉 Seed concluído!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro fatal no seed:", error);
  process.exit(1);
});
