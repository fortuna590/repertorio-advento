import PDFDocument from "pdfkit";

// Mapeamento dos momentos para exibição em português
const MOMENTOS: Record<string, string> = {
  ENTRADA: "Entrada",
  ATO_PENITENCIAL: "Ato Penitencial",
  GLORIA: "Glória",
  SALMO: "Salmo Responsorial",
  ACLAMACAO: "Aclamação ao Evangelho",
  OFERTORIO: "Ofertório",
  SANTO: "Santo",
  COMUNHAO: "Comunhão",
  FINAL: "Canto Final",
  OUTROS: "Outros",
};

// Ordem litúrgica dos momentos
const ORDEM_MOMENTOS = [
  "ENTRADA",
  "ATO_PENITENCIAL",
  "GLORIA",
  "SALMO",
  "ACLAMACAO",
  "OFERTORIO",
  "SANTO",
  "COMUNHAO",
  "FINAL",
  "OUTROS",
];

interface MusicaPDF {
  id: number;
  titulo: string;
  artista?: string | null;
  tom?: string | null;
  momento: string;
  youtube?: string | null;
  cifra?: string | null;
  letra?: string | null;
}

interface RepertorioPDF {
  titulo: string;
  descricao?: string | null;
  musicas: MusicaPDF[];
  nomeUsuario?: string;
}

export function gerarPDFRepertorio(dados: RepertorioPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: dados.titulo,
        Author: "LouvaMais",
        Subject: "Repertório Litúrgico",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100; // margem esquerda + direita
    const ROXO = "#7c3aed";
    const ROXO_CLARO = "#ede9fe";
    const CINZA_ESCURO = "#1e1b4b";
    const CINZA_MEDIO = "#6b7280";
    const BRANCO = "#ffffff";

    // ─── Cabeçalho ────────────────────────────────────────────────────────────
    // Fundo roxo no topo
    doc.rect(0, 0, doc.page.width, 110).fill(ROXO);

    // Logo / nome do app
    doc
      .fillColor(BRANCO)
      .fontSize(11)
      .font("Helvetica")
      .text("LouvaMais", 50, 22, { align: "left" });

    // Título do repertório
    doc
      .fillColor(BRANCO)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(dados.titulo, 50, 42, { width: pageWidth, align: "left" });

    // Descrição (se houver)
    if (dados.descricao) {
      doc
        .fillColor("#c4b5fd")
        .fontSize(10)
        .font("Helvetica")
        .text(dados.descricao, 50, 72, { width: pageWidth, align: "left" });
    }

    // Data de geração e nome do usuário
    const dataGeracao = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const rodapeCabecalho = dados.nomeUsuario
      ? `Gerado em ${dataGeracao} por ${dados.nomeUsuario}`
      : `Gerado em ${dataGeracao}`;

    doc
      .fillColor("#c4b5fd")
      .fontSize(9)
      .font("Helvetica")
      .text(rodapeCabecalho, 50, 90, { width: pageWidth, align: "right" });

    // ─── Corpo ────────────────────────────────────────────────────────────────
    doc.moveDown(2.5);

    // Agrupar músicas por momento
    const grupos: Record<string, MusicaPDF[]> = {};
    for (const musica of dados.musicas) {
      const momento = musica.momento || "OUTROS";
      if (!grupos[momento]) grupos[momento] = [];
      grupos[momento].push(musica);
    }

    // Ordenar momentos conforme liturgia
    const momentosPresentes = ORDEM_MOMENTOS.filter((m) => grupos[m]);
    const momentosExtras = Object.keys(grupos).filter(
      (m) => !ORDEM_MOMENTOS.includes(m)
    );
    const momentosOrdenados = [...momentosPresentes, ...momentosExtras];

    if (momentosOrdenados.length === 0) {
      doc
        .fillColor(CINZA_MEDIO)
        .fontSize(11)
        .font("Helvetica")
        .text("Nenhuma música adicionada a este repertório.", 50, doc.y, {
          width: pageWidth,
          align: "center",
        });
    }

    for (const momento of momentosOrdenados) {
      const musicas = grupos[momento];
      const nomeExibicao = MOMENTOS[momento] || momento;

      // Verificar se cabe na página (pelo menos o cabeçalho + 1 música)
      if (doc.y > doc.page.height - 160) {
        doc.addPage();
      }

      // Cabeçalho do momento — fundo roxo claro
      const yMomento = doc.y;
      doc.rect(50, yMomento, pageWidth, 22).fill(ROXO_CLARO);
      doc
        .fillColor(ROXO)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(nomeExibicao.toUpperCase(), 58, yMomento + 6, {
          width: pageWidth - 16,
        });

      doc.moveDown(0.2);

      // Músicas do momento
      for (let i = 0; i < musicas.length; i++) {
        const m = musicas[i];

        // Verificar quebra de página
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        const yMusica = doc.y + 6;
        const isUltima = i === musicas.length - 1;

        // Número da música
        doc
          .fillColor(ROXO)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(`${i + 1}.`, 50, yMusica, { width: 20 });

        // Título
        doc
          .fillColor(CINZA_ESCURO)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(m.titulo, 72, yMusica, { width: pageWidth - 22 });

        // Artista e tom
        const subtitulo = [m.artista, m.tom ? `Tom: ${m.tom}` : null]
          .filter(Boolean)
          .join("  ·  ");

        if (subtitulo) {
          doc
            .fillColor(CINZA_MEDIO)
            .fontSize(9)
            .font("Helvetica")
            .text(subtitulo, 72, doc.y + 1, { width: pageWidth - 22 });
        }

        // Links
        const links: string[] = [];
        if (m.youtube) links.push("YouTube");
        if (m.cifra) links.push("Cifra");
        if (m.letra) links.push("Letra");

        if (links.length > 0) {
          doc
            .fillColor("#9ca3af")
            .fontSize(8)
            .font("Helvetica")
            .text(`🔗 ${links.join("  ·  ")}`, 72, doc.y + 1, {
              width: pageWidth - 22,
            });
        }

        // Linha divisória (exceto na última música do grupo)
        if (!isUltima) {
          doc
            .moveTo(72, doc.y + 5)
            .lineTo(50 + pageWidth, doc.y + 5)
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();
        }

        doc.moveDown(0.5);
      }

      doc.moveDown(0.8);
    }

    // ─── Rodapé ───────────────────────────────────────────────────────────────
    const totalMusicas = dados.musicas.length;
    const totalMomentos = momentosOrdenados.length;

    // Linha separadora
    doc
      .moveTo(50, doc.page.height - 55)
      .lineTo(50 + pageWidth, doc.page.height - 55)
      .strokeColor("#e5e7eb")
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(CINZA_MEDIO)
      .fontSize(8)
      .font("Helvetica")
      .text(
        `${totalMusicas} música${totalMusicas !== 1 ? "s" : ""} em ${totalMomentos} momento${totalMomentos !== 1 ? "s" : ""}  ·  louvamais-repertorios.manus.space`,
        50,
        doc.page.height - 42,
        { width: pageWidth, align: "center" }
      );

    doc.end();
  });
}
