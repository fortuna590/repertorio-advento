import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Readable } from "stream";
import * as fs from "fs";
import * as path from "path";

interface Musica {
  id: string;
  titulo: string;
  artista: string;
  momento: string;
  tom?: string;
  cifraResumo?: string;
  linkYouTube?: string;
  linkCifra?: string;
}

interface RepertorioData {
  nome: string;
  descricao?: string;
  musicas: Musica[];
  dataCelebracao?: string;
  notas?: string;
}

export async function gerarPDFRepertorio(data: RepertorioData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Verificar se a logo existe
      const logoPath = path.join(process.cwd(), "client/public/logo.png");
      const logoExists = fs.existsSync(logoPath);

      // Header com logo
      if (logoExists) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }
      
      doc.fontSize(24).font("Helvetica-Bold").text("LouvaMais", logoExists ? 120 : 50, 50);
      doc.fontSize(10).font("Helvetica").fillColor("#666").text("Louve com Excelência", logoExists ? 120 : 50, 75);

      // Título do repertório
      doc.moveDown(2);
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#000").text(data.nome, { align: "center" });

      // Descrição
      if (data.descricao) {
        doc.moveDown(0.5);
        doc.fontSize(12).font("Helvetica").fillColor("#666").text(data.descricao, { align: "center" });
      }

      // Data da celebração
      if (data.dataCelebracao) {
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#888").text(`Data: ${new Date(data.dataCelebracao).toLocaleDateString("pt-BR")}`, { align: "center" });
      }

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#ddd");
      doc.moveDown(1);

      // Agrupar músicas por momento
      const musicasPorMomento: Record<string, Musica[]> = {};
      data.musicas.forEach((musica) => {
        const momento = musica.momento || "Outros";
        if (!musicasPorMomento[momento]) {
          musicasPorMomento[momento] = [];
        }
        musicasPorMomento[momento].push(musica);
      });

      // Renderizar músicas agrupadas
      for (const [momento, musicas] of Object.entries(musicasPorMomento)) {
        // Verificar se precisa de nova página
        if (doc.y > 700) {
          doc.addPage();
        }

        // Título do momento
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#8B5CF6").text(momento.toUpperCase());
        doc.moveDown(0.5);

        for (const musica of musicas) {
          // Verificar se precisa de nova página
          if (doc.y > 650) {
            doc.addPage();
          }

          const startY = doc.y;

          // Título da música
          doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text(musica.titulo);
          
          // Artista
          doc.fontSize(10).font("Helvetica").fillColor("#666").text(musica.artista);

          // Tom
          if (musica.tom) {
            doc.fontSize(9).fillColor("#888").text(`Tom: ${musica.tom}`);
          }

          // Cifra resumida
          if (musica.cifraResumo) {
            doc.moveDown(0.3);
                doc.fontSize(9).font("Courier").fillColor("#444").text(musica.cifraResumo, {
          width: 350,
                });
              }

          // QR Codes (YouTube e Cifra)
          const qrX = 450;
          let qrY = startY;

          if (musica.linkYouTube) {
            try {
              const qrYouTube = await QRCode.toDataURL(musica.linkYouTube, { width: 60, margin: 1 });
              doc.image(qrYouTube, qrX, qrY, { width: 50 });
              doc.fontSize(7).fillColor("#888").text("YouTube", qrX + 5, qrY + 52);
              qrY += 70;
            } catch (err) {
              console.error("Erro ao gerar QR Code YouTube:", err);
            }
          }

          if (musica.linkCifra) {
            try {
              const qrCifra = await QRCode.toDataURL(musica.linkCifra, { width: 60, margin: 1 });
              doc.image(qrCifra, qrX, qrY, { width: 50 });
              doc.fontSize(7).fillColor("#888").text("Cifra", qrX + 10, qrY + 52);
            } catch (err) {
              console.error("Erro ao gerar QR Code Cifra:", err);
            }
          }

          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#eee");
          doc.moveDown(0.5);
        }

        doc.moveDown(0.5);
      }

      // Notas (se houver)
      if (data.notas) {
        if (doc.y > 650) {
          doc.addPage();
        }
        doc.moveDown(1);
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#8B5CF6").text("OBSERVAÇÕES");
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica").fillColor("#444").text(data.notas);
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#aaa").text(
          `Gerado por LouvaMais - Página ${i + 1} de ${pageCount}`,
          50,
          doc.page.height - 30,
          { align: "center" }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
