import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { repertorio } from '@/data/repertorio';

export async function exportRepertorioPDF() {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  // Título
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repertório Católico - Advento', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('LouvaMais - Church Solutions', margin, yPosition);
  yPosition += 6;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('29 músicas organizadas por momentos da missa', margin, yPosition);
  yPosition += 15;

  // Resetar cor
  pdf.setTextColor(0, 0, 0);

  for (const momento of repertorio) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Título do momento
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(128, 0, 128); // Roxo
    const tituloMomento = `${momento.numero} ${momento.titulo}`;
    pdf.text(tituloMomento, margin, yPosition);
    yPosition += lineHeight;

    if (momento.observacao) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`(${momento.observacao})`, margin, yPosition);
      yPosition += lineHeight;
    }

    pdf.setTextColor(0, 0, 0);
    yPosition += 3;

    // Músicas do momento
    for (const musica of momento.musicas) {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Número e título da música
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${musica.numero}. ${musica.titulo}`, margin + 5, yPosition);
      yPosition += lineHeight;

      // Artista
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(musica.artista, margin + 5, yPosition);
      yPosition += lineHeight;

      // Observação da música
      if (musica.observacao) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text(musica.observacao, margin + 5, yPosition);
        yPosition += lineHeight;
      }

      pdf.setTextColor(0, 0, 0);

      // QR Codes
      const qrSize = 25;
      let qrX = margin + 5;

      try {
        if (musica.youtube) {
          const qrYoutube = await QRCode.toDataURL(musica.youtube, { width: 200 });
          pdf.addImage(qrYoutube, 'PNG', qrX, yPosition, qrSize, qrSize);
          pdf.setFontSize(8);
          pdf.text('YouTube', qrX, yPosition + qrSize + 4);
          qrX += qrSize + 10;
        }

        if (musica.cifra) {
          const qrCifra = await QRCode.toDataURL(musica.cifra, { width: 200 });
          pdf.addImage(qrCifra, 'PNG', qrX, yPosition, qrSize, qrSize);
          pdf.setFontSize(8);
          pdf.text('Cifra', qrX, yPosition + qrSize + 4);
        }

        yPosition += qrSize + 8;
      } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        yPosition += 5;
      }

      yPosition += 5; // Espaço entre músicas
    }

    yPosition += 5; // Espaço entre momentos
  }

  // Footer na última página
  if (yPosition > pageHeight - 30) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('© 2025 LouvaMais - Church Solutions', margin, pageHeight - 20);
  pdf.text('Instagram: @louvamais.solutions | Email: louvamais590@gmail.com', margin, pageHeight - 14);

  // Salvar PDF
  pdf.save('repertorio-advento-louvamais.pdf');
}
