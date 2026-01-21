/**
 * Gera um link para adicionar evento ao Google Calendar
 * Não requer autenticação, totalmente gratuito
 */
export function gerarLinkGoogleCalendar(params: {
  titulo: string;
  descricao?: string;
  local?: string;
  dataInicio: string; // formato: YYYY-MM-DD
  horaInicio?: string; // formato: HH:MM
  dataFim?: string; // formato: YYYY-MM-DD
  horaFim?: string; // formato: HH:MM
}): string {
  const { titulo, descricao, local, dataInicio, horaInicio, dataFim, horaFim } = params;

  // Converter data e hora para formato do Google Calendar (YYYYMMDDTHHmmss)
  const formatarDataHora = (data: string, hora?: string): string => {
    const [ano, mes, dia] = data.split("-");
    if (hora) {
      const [h, m] = hora.split(":");
      return `${ano}${mes}${dia}T${h}${m}00`;
    }
    return `${ano}${mes}${dia}`;
  };

  const inicio = formatarDataHora(dataInicio, horaInicio);
  
  // Se não tiver hora de fim, adiciona 1 hora à hora de início
  let fim: string;
  if (dataFim && horaFim) {
    fim = formatarDataHora(dataFim, horaFim);
  } else if (horaInicio) {
    const [h, m] = horaInicio.split(":");
    const horaFimCalculada = `${String(parseInt(h) + 1).padStart(2, "0")}:${m}`;
    fim = formatarDataHora(dataInicio, horaFimCalculada);
  } else {
    // Evento de dia inteiro
    fim = inicio;
  }

  // Construir URL do Google Calendar
  const params_url = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${inicio}/${fim}`,
  });

  if (descricao) {
    params_url.append("details", descricao);
  }

  if (local) {
    params_url.append("location", local);
  }

  return `https://calendar.google.com/calendar/render?${params_url.toString()}`;
}

/**
 * Abre o link do Google Calendar em uma nova aba
 */
export function adicionarAoGoogleCalendar(params: Parameters<typeof gerarLinkGoogleCalendar>[0]): void {
  const link = gerarLinkGoogleCalendar(params);
  window.open(link, "_blank");
}
