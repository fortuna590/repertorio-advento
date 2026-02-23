/**
 * Utilitário para validação de URLs de músicas
 */

export interface URLValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida se a URL é um YouTube válido
 */
export function validateYoutubeUrl(url: string): URLValidationResult {
  if (!url || url.trim() === "") {
    return { isValid: true }; // Campo opcional
  }

  try {
    const urlObj = new URL(url);
    const isYoutube =
      urlObj.hostname.includes("youtube.com") ||
      urlObj.hostname.includes("youtu.be");

    if (!isYoutube) {
      return {
        isValid: false,
        error: "URL deve ser do YouTube (youtube.com ou youtu.be)",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "URL do YouTube inválida",
    };
  }
}

/**
 * Valida se a URL é uma cifra válida (CifraClub)
 */
export function validateCifraUrl(url: string): URLValidationResult {
  if (!url || url.trim() === "") {
    return { isValid: true }; // Campo opcional
  }

  try {
    const urlObj = new URL(url);
    const isCifraClub = urlObj.hostname.includes("cifraclub.com.br");

    if (!isCifraClub) {
      return {
        isValid: false,
        error: "URL deve ser do CifraClub (cifraclub.com.br)",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "URL da Cifra inválida",
    };
  }
}

/**
 * Valida se a URL é uma letra válida (letras.mus.br)
 */
export function validateLetraUrl(url: string): URLValidationResult {
  if (!url || url.trim() === "") {
    return { isValid: true }; // Campo opcional
  }

  try {
    const urlObj = new URL(url);
    const isLetras = urlObj.hostname.includes("letras.mus.br");

    if (!isLetras) {
      return {
        isValid: false,
        error: "URL deve ser de letras.mus.br",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "URL da Letra inválida",
    };
  }
}

/**
 * Valida todas as URLs de uma música
 */
export function validateMusicaUrls(
  youtube?: string,
  cifra?: string,
  letra?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (youtube) {
    const youtubeValidation = validateYoutubeUrl(youtube);
    if (!youtubeValidation.isValid) {
      errors.youtube = youtubeValidation.error || "URL inválida";
    }
  }

  if (cifra) {
    const cifraValidation = validateCifraUrl(cifra);
    if (!cifraValidation.isValid) {
      errors.cifra = cifraValidation.error || "URL inválida";
    }
  }

  if (letra) {
    const letraValidation = validateLetraUrl(letra);
    if (!letraValidation.isValid) {
      errors.letra = letraValidation.error || "URL inválida";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
