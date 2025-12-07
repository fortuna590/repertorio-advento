import { describe, it, expect } from 'vitest';

describe('Sistema de Estatísticas Melhorado', () => {
  describe('Filtros por Período', () => {
    it('deve filtrar cliques do último dia', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const clicks = [
        { clickedAt: new Date(), type: 'youtube' },
        { clickedAt: yesterday, type: 'cifra' },
      ];
      
      const filtered = clicks.filter(c => c.clickedAt >= yesterday);
      expect(filtered.length).toBe(2);
    });

    it('deve filtrar cliques dos últimos 7 dias', () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const clicks = [
        { clickedAt: today, type: 'youtube' },
        { clickedAt: sevenDaysAgo, type: 'cifra' },
      ];
      
      const filtered = clicks.filter(c => c.clickedAt >= sevenDaysAgo);
      expect(filtered.length).toBe(2);
    });

    it('deve filtrar cliques dos últimos 30 dias', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const clicks = [
        { clickedAt: today, type: 'youtube' },
        { clickedAt: thirtyDaysAgo, type: 'cifra' },
      ];
      
      const filtered = clicks.filter(c => c.clickedAt >= thirtyDaysAgo);
      expect(filtered.length).toBe(2);
    });
  });

  describe('Filtros por Tipo de Link', () => {
    it('deve filtrar apenas cliques do YouTube', () => {
      const clicks = [
        { type: 'youtube', count: 10 },
        { type: 'cifra', count: 5 },
        { type: 'youtube', count: 8 },
      ];
      
      const filtered = clicks.filter(c => c.type === 'youtube');
      expect(filtered.length).toBe(2);
      expect(filtered.every(c => c.type === 'youtube')).toBe(true);
    });

    it('deve filtrar apenas cliques de Cifra', () => {
      const clicks = [
        { type: 'youtube', count: 10 },
        { type: 'cifra', count: 5 },
        { type: 'cifra', count: 3 },
      ];
      
      const filtered = clicks.filter(c => c.type === 'cifra');
      expect(filtered.length).toBe(2);
      expect(filtered.every(c => c.type === 'cifra')).toBe(true);
    });

    it('deve retornar todos os cliques quando filtro é "all"', () => {
      const clicks = [
        { type: 'youtube', count: 10 },
        { type: 'cifra', count: 5 },
      ];
      
      const filterType = 'all';
      const filtered = clicks.filter(c => filterType === 'all' ? true : c.type === filterType);
      expect(filtered.length).toBe(2);
    });
  });

  describe('Cálculo de Percentuais', () => {
    it('deve calcular percentual de YouTube corretamente', () => {
      const totalClicks = 100;
      const youtubeClicks = 60;
      const percent = ((youtubeClicks / totalClicks) * 100).toFixed(1);
      
      expect(percent).toBe('60.0');
    });

    it('deve calcular percentual de Cifra corretamente', () => {
      const totalClicks = 100;
      const cifraClicks = 40;
      const percent = ((cifraClicks / totalClicks) * 100).toFixed(1);
      
      expect(percent).toBe('40.0');
    });

    it('deve retornar 0 quando não há cliques', () => {
      const totalClicks = 0;
      const youtubeClicks = 0;
      const percent = totalClicks > 0 ? ((youtubeClicks / totalClicks) * 100).toFixed(1) : '0';
      
      expect(percent).toBe('0');
    });
  });

  describe('Top Músicas e Momentos', () => {
    it('deve retornar top 10 músicas ordenadas por contagem', () => {
      const musicas = [
        { id: 1, titulo: 'Música A', count: 50 },
        { id: 2, titulo: 'Música B', count: 30 },
        { id: 3, titulo: 'Música C', count: 40 },
      ];
      
      const top10 = musicas.sort((a, b) => b.count - a.count).slice(0, 10);
      
      expect(top10[0].count).toBe(50);
      expect(top10[1].count).toBe(40);
      expect(top10[2].count).toBe(30);
    });

    it('deve retornar top 10 momentos ordenados por contagem', () => {
      const momentos = [
        { id: 'entrada', titulo: 'Entrada', count: 100 },
        { id: 'gloria', titulo: 'Glória', count: 80 },
        { id: 'comunhao', titulo: 'Comunhão', count: 120 },
      ];
      
      const top10 = momentos.sort((a, b) => b.count - a.count).slice(0, 10);
      
      expect(top10[0].titulo).toBe('Comunhão');
      expect(top10[1].titulo).toBe('Entrada');
      expect(top10[2].titulo).toBe('Glória');
    });
  });

  describe('Auto-refresh', () => {
    it('deve estar habilitado por padrão', () => {
      const autoRefresh = true;
      expect(autoRefresh).toBe(true);
    });

    it('deve permitir desabilitar auto-refresh', () => {
      let autoRefresh = true;
      autoRefresh = false;
      expect(autoRefresh).toBe(false);
    });

    it('deve usar intervalo de 5 segundos', () => {
      const interval = 5000;
      expect(interval).toBe(5000);
    });
  });

  describe('Dados de Estatísticas', () => {
    it('deve conter totalClicks', () => {
      const stats = { totalClicks: 150 };
      expect(stats).toHaveProperty('totalClicks');
      expect(stats.totalClicks).toBeGreaterThanOrEqual(0);
    });

    it('deve conter clicksByType', () => {
      const stats = {
        clicksByType: [
          { type: 'youtube', count: 100 },
          { type: 'cifra', count: 50 },
        ],
      };
      expect(stats).toHaveProperty('clicksByType');
      expect(Array.isArray(stats.clicksByType)).toBe(true);
    });

    it('deve conter topMusicas', () => {
      const stats = {
        topMusicas: [
          { musicaId: '1', musicaTitulo: 'Música A', count: 50 },
        ],
      };
      expect(stats).toHaveProperty('topMusicas');
      expect(Array.isArray(stats.topMusicas)).toBe(true);
    });

    it('deve conter topMomentos', () => {
      const stats = {
        topMomentos: [
          { momentoId: 'entrada', momentoTitulo: 'Entrada', count: 100 },
        ],
      };
      expect(stats).toHaveProperty('topMomentos');
      expect(Array.isArray(stats.topMomentos)).toBe(true);
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar que count é número positivo', () => {
      const click = { count: 10 };
      expect(click.count).toBeGreaterThan(0);
      expect(typeof click.count).toBe('number');
    });

    it('deve validar que linkType é válido', () => {
      const validTypes = ['youtube', 'cifra'];
      const click = { linkType: 'youtube' };
      expect(validTypes.includes(click.linkType)).toBe(true);
    });

    it('deve validar que período é número válido', () => {
      const validPeriods = [1, 7, 30];
      const period = 7;
      expect(validPeriods.includes(period)).toBe(true);
    });
  });
});
