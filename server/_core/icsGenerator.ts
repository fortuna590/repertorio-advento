/**
 * Gerador de arquivos .ics para exportação de eventos para Google Calendar
 */

interface EventoICS {
  titulo: string;
  descricao?: string;
  local?: string;
  dataInicio: Date;
  dataFim: Date;
  organizador?: string;
  participantes?: string[];
}

/**
 * Formata data para formato ICS (YYYYMMDDTHHMMSSZ)
 */
function formatarDataICS(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const hora = String(data.getUTCHours()).padStart(2, '0');
  const minuto = String(data.getUTCMinutes()).padStart(2, '0');
  const segundo = String(data.getUTCSeconds()).padStart(2, '0');
  
  return `${ano}${mes}${dia}T${hora}${minuto}${segundo}Z`;
}

/**
 * Escapa caracteres especiais para formato ICS
 */
function escaparTextoICS(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Gera conteúdo de arquivo .ics para um único evento
 */
export function gerarArquivoICS(evento: EventoICS): string {
  const agora = new Date();
  const timestamp = formatarDataICS(agora);
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@louvamais.com`;
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LouvaMais//Sistema de Escalas//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Escalas LouvaMais',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatarDataICS(evento.dataInicio)}`,
    `DTEND:${formatarDataICS(evento.dataFim)}`,
    `SUMMARY:${escaparTextoICS(evento.titulo)}`,
  ];

  if (evento.descricao) {
    ics.push(`DESCRIPTION:${escaparTextoICS(evento.descricao)}`);
  }

  if (evento.local) {
    ics.push(`LOCATION:${escaparTextoICS(evento.local)}`);
  }

  if (evento.organizador) {
    ics.push(`ORGANIZER;CN=${escaparTextoICS(evento.organizador)}:mailto:noreply@louvamais.com`);
  }

  if (evento.participantes && evento.participantes.length > 0) {
    evento.participantes.forEach(participante => {
      ics.push(`ATTENDEE;CN=${escaparTextoICS(participante)}:mailto:noreply@louvamais.com`);
    });
  }

  ics.push('STATUS:CONFIRMED');
  ics.push('SEQUENCE:0');
  ics.push('END:VEVENT');
  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Gera conteúdo de arquivo .ics para múltiplos eventos
 */
export function gerarArquivoICSMultiplo(eventos: EventoICS[]): string {
  const agora = new Date();
  const timestamp = formatarDataICS(agora);
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LouvaMais//Sistema de Escalas//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Escalas LouvaMais',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  eventos.forEach(evento => {
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@louvamais.com`;
    
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${timestamp}`);
    ics.push(`DTSTART:${formatarDataICS(evento.dataInicio)}`);
    ics.push(`DTEND:${formatarDataICS(evento.dataFim)}`);
    ics.push(`SUMMARY:${escaparTextoICS(evento.titulo)}`);

    if (evento.descricao) {
      ics.push(`DESCRIPTION:${escaparTextoICS(evento.descricao)}`);
    }

    if (evento.local) {
      ics.push(`LOCATION:${escaparTextoICS(evento.local)}`);
    }

    if (evento.organizador) {
      ics.push(`ORGANIZER;CN=${escaparTextoICS(evento.organizador)}:mailto:noreply@louvamais.com`);
    }

    if (evento.participantes && evento.participantes.length > 0) {
      evento.participantes.forEach(participante => {
        ics.push(`ATTENDEE;CN=${escaparTextoICS(participante)}:mailto:noreply@louvamais.com`);
      });
    }

    ics.push('STATUS:CONFIRMED');
    ics.push('SEQUENCE:0');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Converte data e hora em string para objeto Date
 */
export function parseDataHora(data: string, hora?: string): Date {
  const [ano, mes, dia] = data.split('-').map(Number);
  
  if (hora) {
    const [h, m] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m, 0);
  }
  
  // Se não tiver hora, usa 9h como padrão
  return new Date(ano, mes - 1, dia, 9, 0, 0);
}

/**
 * Adiciona duração padrão ao evento (2 horas)
 */
export function calcularDataFim(dataInicio: Date, duracaoHoras: number = 2): Date {
  const dataFim = new Date(dataInicio);
  dataFim.setHours(dataFim.getHours() + duracaoHoras);
  return dataFim;
}
