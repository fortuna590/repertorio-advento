import { describe, it, expect } from 'vitest';
import { MOMENTOS_FIXOS, type MomentoFixoId } from '../shared/const';

describe('MOMENTOS_FIXOS', () => {
  it('deve conter exatamente 9 momentos', () => {
    expect(MOMENTOS_FIXOS).toHaveLength(9);
  });

  it('deve conter todos os momentos obrigatórios na ordem correta', () => {
    const ids = MOMENTOS_FIXOS.map((m) => m.id);
    expect(ids).toEqual([
      'ENTRADA',
      'ATO_PENITENCIAL',
      'GLORIA',
      'SALMO',
      'ACLAMACAO',
      'OFERTORIO',
      'SANTO',
      'COMUNHAO',
      'FINAL',
    ]);
  });

  it('cada momento deve ter id e label definidos', () => {
    for (const momento of MOMENTOS_FIXOS) {
      expect(momento.id).toBeTruthy();
      expect(momento.label).toBeTruthy();
      expect(typeof momento.id).toBe('string');
      expect(typeof momento.label).toBe('string');
    }
  });

  it('deve simular a estrutura de resposta da API ao criar repertório', () => {
    const momentosEstruturados = MOMENTOS_FIXOS.map((momento) => ({
      id: momento.id,
      label: momento.label,
      musica: null,
    }));

    expect(momentosEstruturados).toHaveLength(9);
    expect(momentosEstruturados[0]).toEqual({
      id: 'ENTRADA',
      label: 'Entrada',
      musica: null,
    });
    expect(momentosEstruturados[8]).toEqual({
      id: 'FINAL',
      label: 'Final',
      musica: null,
    });

    // Todos os momentos devem ter musica: null ao criar
    for (const m of momentosEstruturados) {
      expect(m.musica).toBeNull();
    }
  });

  it('deve simular agrupamento de músicas por momento ao buscar repertório', () => {
    const musicasMock = [
      { momento: 'ENTRADA', titulo: 'Música 1', artista: 'CNBB' },
      { momento: 'ENTRADA', titulo: 'Música 2', artista: 'CNBB' },
      { momento: 'COMUNHAO', titulo: 'Música 3', artista: 'CNBB' },
    ];

    const momentos = MOMENTOS_FIXOS.map((momento) => ({
      id: momento.id,
      label: momento.label,
      musicas: musicasMock.filter((m) => m.momento === momento.id),
    }));

    const entrada = momentos.find((m) => m.id === 'ENTRADA');
    const comunhao = momentos.find((m) => m.id === 'COMUNHAO');
    const gloria = momentos.find((m) => m.id === 'GLORIA');

    expect(entrada?.musicas).toHaveLength(2);
    expect(comunhao?.musicas).toHaveLength(1);
    expect(gloria?.musicas).toHaveLength(0);
  });
});
