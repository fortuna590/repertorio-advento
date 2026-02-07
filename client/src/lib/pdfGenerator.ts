import { jsPDF } from "jspdf";

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom?: string;
  momento?: string;
  linkCifra?: string;
  linkYoutube?: string;
}

interface RepertorioData {
  nome: string;
  descricao?: string;
  notas?: string;
  dataCelebracao?: string;
  musicas: Musica[];
  createdAt?: string;
  tipoTemplate?: string;
  tags?: string[];
}

interface PDFOptions {
  incluirLinks?: boolean;
}

export function generateRepertorioPDF(repertorio: RepertorioData, options: PDFOptions = {}) {
  const { incluirLinks = true } = options;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Cores
  const primaryColor: [number, number, number] = [147, 51, 234]; // Purple
  const secondaryColor: [number, number, number] = [236, 72, 153]; // Pink
  const textColor: [number, number, number] = [30, 41, 59]; // Slate
  const linkColor: [number, number, number] = [59, 130, 246]; // Blue

  // Cabeçalho com gradiente simulado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("LouvaMais", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Repertórios Litúrgicos", pageWidth / 2, 32, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Organizados por tempo da Igreja", pageWidth / 2, 42, { align: "center" });

  yPosition = 65;

  // Nome do Repertório
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(repertorio.nome, margin, yPosition);
  yPosition += 10;

  // Tipo de Template
  if (repertorio.tipoTemplate) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const tipoLabel = repertorio.tipoTemplate === "missa" ? "Missa" : 
                      repertorio.tipoTemplate === "grupo_oracao" ? "Grupo de Oração" : "Livre";
    doc.text(`Tipo: ${tipoLabel}`, margin, yPosition);
    yPosition += 6;
  }

  // Data da celebração
  if (repertorio.dataCelebracao) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dataFormatada = new Date(repertorio.dataCelebracao).toLocaleDateString("pt-BR");
    doc.text(`Data: ${dataFormatada}`, margin, yPosition);
    yPosition += 6;
  }

  // Tags
  if (repertorio.tags && repertorio.tags.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(`Tags: ${repertorio.tags.join(", ")}`, margin, yPosition);
    yPosition += 8;
  }

  // Descrição
  if (repertorio.descricao) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(repertorio.descricao, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPosition);
    yPosition += descLines.length * 5 + 5;
  }

  // Linha separadora
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // Agrupar músicas por momento
  const musicasPorMomento: { [key: string]: Musica[] } = {};
  
  repertorio.musicas.forEach((musica) => {
    const momento = musica.momento || "Outras";
    if (!musicasPorMomento[momento]) {
      musicasPorMomento[momento] = [];
    }
    musicasPorMomento[momento].push(musica);
  });

  // Renderizar músicas por momento
  Object.entries(musicasPorMomento).forEach(([momento, musicas]) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    // Título do momento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(momento, margin, yPosition);
    yPosition += 10;

    // Músicas do momento
    musicas.forEach((musica, index) => {
      const alturaMusica = incluirLinks ? 25 : 15;
      
      if (yPosition > pageHeight - alturaMusica - 10) {
        doc.addPage();
        yPosition = margin;
      }

      // Número da música
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      const numero = `${index + 1}.`;
      doc.text(numero, margin + 2, yPosition);
      
      // Título da música
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(musica.titulo, margin + 12, yPosition);
      yPosition += 5;
      
      // Artista e Tom
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      let artistaInfo = musica.artista;
      if (musica.tom) {
        artistaInfo += ` • Tom: ${musica.tom}`;
      }
      doc.text(artistaInfo, margin + 12, yPosition);
      yPosition += 5;
      
      // Links (se incluirLinks estiver ativo)
      if (incluirLinks) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...linkColor);
        
        if (musica.linkCifra) {
          doc.textWithLink("🎸 Cifra", margin + 12, yPosition, { url: musica.linkCifra });
          yPosition += 4;
        }
        
        if (musica.linkYoutube) {
          doc.textWithLink("▶️ YouTube", margin + 12, yPosition, { url: musica.linkYoutube });
          yPosition += 4;
        }
        
        yPosition += 2;
      }
      
      doc.setTextColor(...textColor);
      yPosition += 6;
    });

    yPosition += 4;
  });

  // Notas (se houver)
  if (repertorio.notas) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setDrawColor(...secondaryColor);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Observações:", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    const notasLines = doc.splitTextToSize(repertorio.notas, pageWidth - 2 * margin);
    doc.text(notasLines, margin, yPosition);
    yPosition += notasLines.length * 5 + 10;
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    
    const dataGeracao = new Date().toLocaleDateString("pt-BR");
    const rodape = `Gerado por LouvaMais em ${dataGeracao}`;
    doc.text(rodape, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Salvar PDF
  const nomeArquivo = `${repertorio.nome.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
  doc.save(nomeArquivo);
}
