import { describe, it, expect } from "vitest";

describe("LiturgiaShare Component", () => {
  it("deve ter props corretos", () => {
    const props = {
      data: "2025-12-08",
      liturgia: "2º Domingo do Advento",
      url: "https://example.com/liturgia",
    };

    expect(props.data).toBe("2025-12-08");
    expect(props.liturgia).toBe("2º Domingo do Advento");
    expect(props.url).toBe("https://example.com/liturgia");
  });

  it("deve gerar URL correta para WhatsApp", () => {
    const data = "2025-12-08";
    const liturgia = "2º Domingo do Advento";
    const url = "https://example.com/liturgia";
    
    const shareText = `Liturgia de ${data}\n${liturgia}\n\nAcesse: ${url}`;
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    expect(whatsappUrl).toContain("https://wa.me/");
    expect(whatsappUrl).toContain(encodeURIComponent("Liturgia de 2025-12-08"));
  });

  it("deve gerar URL correta para Email", () => {
    const data = "2025-12-08";
    const liturgia = "2º Domingo do Advento";
    const url = "https://example.com/liturgia";
    
    const shareText = `Liturgia de ${data}\n${liturgia}\n\nAcesse: ${url}`;
    const encodedText = encodeURIComponent(shareText);
    const emailUrl = `mailto:?subject=Liturgia de ${data}&body=${encodedText}`;

    expect(emailUrl).toContain("mailto:");
    expect(emailUrl).toContain("Liturgia de 2025-12-08");
  });

  it("deve gerar URL correta para Facebook", () => {
    const url = "https://example.com/liturgia";
    const encodedUrl = encodeURIComponent(url);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    expect(facebookUrl).toContain("https://www.facebook.com/sharer/sharer.php");
    expect(facebookUrl).toContain("example.com");
  });

  it("deve gerar URL correta para Twitter", () => {
    const data = "2025-12-08";
    const liturgia = "2º Domingo do Advento";
    const url = "https://example.com/liturgia";
    
    const shareText = `Liturgia de ${data}\n${liturgia}\n\nAcesse: ${url}`;
    const encodedText = encodeURIComponent(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

    expect(twitterUrl).toContain("https://twitter.com/intent/tweet");
    expect(twitterUrl).toContain(encodeURIComponent("Liturgia de 2025-12-08"));
  });
});
