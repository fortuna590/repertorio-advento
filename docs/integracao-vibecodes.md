# Documento Técnico de Integração - LouvaMais × VibeCodes

## 1. Objetivo da Integração
Disponibilizar repertórios litúrgicos organizados por momento da missa, com acesso rápido à cifra completa e a referências de áudio no YouTube, usando fallback automático para evitar links quebrados.

## 2. Modelo de Dados

```json
{
  "id": "string",
  "titulo": "string",
  "momento": "Entrada | Glória | Comunhão | Final | etc",
  "tom": "string",
  "categoria": "string",
  "cifraResumo": "string",
  "linkCifraCompleta": "string | null",
  "linkYoutube": "string | null",
  "observacoes": "string | null",
  "ordem": number
}
```

## 3. Interface Esperada

Cada música deve ser exibida em formato de card, com título, momento litúrgico, tom e dois botões de ação:

1. **Cifra** – abre o link da cifra completa (quando existir)
2. **Ouvir** – abre YouTube com fallback automático

## 4. Lógica do Botão Ouvir (Fallback)

A lógica deve priorizar links salvos, mas garantir funcionamento mesmo sem eles:

```javascript
function abrirOuvir(musica) {
  const termo = encodeURIComponent(musica.titulo + " canto litúrgico católico");
  const url = musica.linkYoutube && musica.linkYoutube.trim() !== ""
    ? musica.linkYoutube
    : `https://www.youtube.com/results?search_query=${termo}`;
  try {
    window.open(url, "_blank");
  } catch {
    window.open(`https://www.google.com/search?q=${termo}`, "_blank");
  }
}
```

## 5. Boas Práticas

1. Não embutir vídeos do YouTube (direitos autorais)
2. Abrir links sempre em nova aba
3. Interface mobile-first
4. Não exigir conhecimento litúrgico do front-end

---

Documento preparado para orientar a equipe de desenvolvimento da VibeCodes na integração correta da plataforma LouvaMais.
