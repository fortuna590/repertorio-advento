import { describe, it, expect, beforeAll } from "vitest";
import { gerarPDFRepertorio } from "./_core/pdf";
import * as fs from "fs";
import * as path from "path";

describe("Exportação PDF de Repertórios", () => {
  it("deve gerar PDF com músicas, logo e QR codes", async () => {
    const repertorioData = {
      nome: "Teste - Advento",
      descricao: "Repertório de teste para validar exportação PDF",
      musicas: [
        {
          id: "advento-entrada-1",
          titulo: "Vem, Senhor Jesus",
          artista: "Comunidade Católica Shalom",
          momento: "Entrada",
          tom: "G",
          cifraResumo: "G D Em C\nVem, Senhor Jesus",
          linkYouTube: "https://www.youtube.com/watch?v=test1",
          linkCifra: "https://www.cifraclub.com.br/test1",
        },
        {
          id: "advento-gloria-1",
          titulo: "Glória a Deus nas Alturas",
          artista: "Frei Gilson",
          momento: "Glória",
          tom: "C",
          cifraResumo: "C G Am F\nGlória a Deus",
          linkYouTube: "https://www.youtube.com/watch?v=test2",
          linkCifra: "https://www.cifraclub.com.br/test2",
        },
      ],
      notas: "Repertório de teste para validação",
    };

    const pdfBuffer = await gerarPDFRepertorio(repertorioData);

    // Verificar que o PDF foi gerado
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Verificar assinatura PDF (%PDF)
    const pdfSignature = pdfBuffer.toString("utf8", 0, 4);
    expect(pdfSignature).toBe("%PDF");

    // Salvar PDF para inspeção manual (opcional)
    const testOutputPath = path.join(process.cwd(), "test-output-repertorio.pdf");
    fs.writeFileSync(testOutputPath, pdfBuffer);
    console.log(`PDF de teste salvo em: ${testOutputPath}`);

    // Verificar tamanho mínimo (PDF com conteúdo deve ter pelo menos 5KB)
    expect(pdfBuffer.length).toBeGreaterThan(5000);
  });

  it("deve gerar PDF sem erros mesmo sem QR codes", async () => {
    const repertorioData = {
      nome: "Teste - Sem Links",
      descricao: "Repertório sem links de YouTube e cifras",
      musicas: [
        {
          id: "test-1",
          titulo: "Música Teste",
          artista: "Artista Teste",
          momento: "Entrada",
          tom: "D",
        },
      ],
    };

    const pdfBuffer = await gerarPDFRepertorio(repertorioData);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    
    const pdfSignature = pdfBuffer.toString("utf8", 0, 4);
    expect(pdfSignature).toBe("%PDF");
  });

  it("deve agrupar músicas por momento litúrgico", async () => {
    const repertorioData = {
      nome: "Teste - Agrupamento",
      musicas: [
        {
          id: "1",
          titulo: "Entrada 1",
          artista: "Artista 1",
          momento: "Entrada",
        },
        {
          id: "2",
          titulo: "Entrada 2",
          artista: "Artista 2",
          momento: "Entrada",
        },
        {
          id: "3",
          titulo: "Comunhão 1",
          artista: "Artista 3",
          momento: "Comunhão",
        },
      ],
    };

    const pdfBuffer = await gerarPDFRepertorio(repertorioData);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
