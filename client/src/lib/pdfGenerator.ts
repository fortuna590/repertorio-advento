import { jsPDF } from "jspdf";

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  momento?: string;
}

interface RepertorioData {
  nome: string;
  descricao?: string;
  notas?: string;
  dataCelebracao?: string;
  musicas: Musica[];
  createdAt?: string;
}

export function generateRepertorioPDF(repertorio: RepertorioData) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Cores
  const primaryColor: [number, number, number] = [147, 51, 234]; // Purple
  const secondaryColor: [number, number, number] = [236, 72, 153]; // Pink
  const textColor: [number, number, number] = [30, 41, 59]; // Slate

  // Cabeçalho com gradiente simulado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Repertório Católico", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Advento Sagrado", pageWidth / 2, 30, { align: "center" });

  yPosition = 55;

  // Nome do Repertório
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(repertorio.nome, margin, yPosition);
  yPosition += 10;

  // Data da celebração
  if (repertorio.dataCelebracao) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dataFormatada = new Date(repertorio.dataCelebracao).toLocaleDateString("pt-BR");
    doc.text(`Data: ${dataFormatada}`, margin, yPosition);
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
  yPosition += 10;

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
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Título do momento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(momento, margin, yPosition);
    yPosition += 8;

    // Músicas do momento
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);

    musicas.forEach((musica, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      const numero = `${index + 1}.`;
      doc.setFont("helvetica", "bold");
      doc.text(numero, margin + 5, yPosition);
      
      doc.setFont("helvetica", "normal");
      doc.text(musica.titulo, margin + 15, yPosition);
      
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`- ${musica.artista}`, margin + 15, yPosition + 5);
      
      doc.setTextColor(...textColor);
      yPosition += 12;
    });

    yPosition += 5;
  });

  // Notas (se houver)
  if (repertorio.notas) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setDrawColor(...secondaryColor);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

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
    const rodape = `Gerado por Repertório Católico - Advento Sagrado em ${dataGeracao}`;
    doc.text(rodape, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Salvar PDF
  const nomeArquivo = `${repertorio.nome.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
  doc.save(nomeArquivo);
}
