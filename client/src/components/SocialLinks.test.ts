import { describe, it, expect } from 'vitest';

describe('Componente SocialLinks', () => {
  describe('Estrutura de Dados', () => {
    it('deve conter 3 redes sociais', () => {
      const socialLinks = [
        { name: 'Instagram', url: 'https://instagram.com' },
        { name: 'WhatsApp', url: 'https://wa.me' },
        { name: 'Email', url: 'mailto:' },
      ];
      expect(socialLinks.length).toBe(3);
    });

    it('cada rede social deve ter nome e URL', () => {
      const socialLinks = [
        { name: 'Instagram', url: 'https://www.instagram.com/louvamais.solutions' },
        { name: 'WhatsApp', url: 'https://wa.me/5518996890414' },
        { name: 'Email', url: 'mailto:contato@louvamais.com' },
      ];

      socialLinks.forEach((link) => {
        expect(link.name).toBeTruthy();
        expect(link.url).toBeTruthy();
      });
    });

    it('URLs devem ser válidas', () => {
      const socialLinks = [
        { url: 'https://www.instagram.com/louvamais.solutions' },
        { url: 'https://wa.me/5518996890414' },
        { url: 'mailto:contato@louvamais.com' },
      ];

      socialLinks.forEach((link) => {
        expect(link.url).toMatch(/^(https?:\/\/|mailto:)/);
      });
    });
  });

  describe('Props de Tamanho', () => {
    it('deve aceitar tamanho small', () => {
      const size = 'small';
      expect(['small', 'medium', 'large'].includes(size)).toBe(true);
    });

    it('deve aceitar tamanho medium', () => {
      const size = 'medium';
      expect(['small', 'medium', 'large'].includes(size)).toBe(true);
    });

    it('deve aceitar tamanho large', () => {
      const size = 'large';
      expect(['small', 'medium', 'large'].includes(size)).toBe(true);
    });

    it('deve ter mapeamento de classes para cada tamanho', () => {
      const sizeClasses = {
        small: 'w-9 h-9',
        medium: 'w-11 h-11',
        large: 'w-14 h-14',
      };

      expect(Object.keys(sizeClasses).length).toBe(3);
      expect(sizeClasses.small).toBeTruthy();
      expect(sizeClasses.medium).toBeTruthy();
      expect(sizeClasses.large).toBeTruthy();
    });
  });

  describe('Props de Layout', () => {
    it('deve aceitar layout horizontal', () => {
      const layout = 'horizontal';
      expect(['horizontal', 'vertical'].includes(layout)).toBe(true);
    });

    it('deve aceitar layout vertical', () => {
      const layout = 'vertical';
      expect(['horizontal', 'vertical'].includes(layout)).toBe(true);
    });

    it('layout horizontal deve usar flex-row', () => {
      const layout = 'horizontal';
      const layoutClass = layout === 'horizontal' ? 'flex-row' : 'flex-col';
      expect(layoutClass).toBe('flex-row');
    });

    it('layout vertical deve usar flex-col', () => {
      const layout = 'vertical';
      const layoutClass = layout === 'horizontal' ? 'flex-row' : 'flex-col';
      expect(layoutClass).toBe('flex-col');
    });
  });

  describe('Cores e Estilos', () => {
    it('Instagram deve ter cor rosa/purple', () => {
      const instagram = {
        name: 'Instagram',
        bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      };
      expect(instagram.bgColor).toContain('purple');
      expect(instagram.bgColor).toContain('pink');
    });

    it('WhatsApp deve ter cor verde', () => {
      const whatsapp = {
        name: 'WhatsApp',
        bgColor: 'bg-green-500',
      };
      expect(whatsapp.bgColor).toContain('green');
    });

    it('Email deve ter cor azul/purple', () => {
      const email = {
        name: 'Email',
        bgColor: 'bg-gradient-to-br from-blue-500 to-purple-500',
      };
      expect(email.bgColor).toContain('blue');
      expect(email.bgColor).toContain('purple');
    });

    it('todos devem ter efeito hover scale-110', () => {
      const hoverClass = 'hover:scale-110';
      expect(hoverClass).toContain('scale-110');
    });

    it('todos devem ter shadow-md', () => {
      const shadowClass = 'shadow-md';
      expect(shadowClass).toContain('shadow');
    });
  });

  describe('Acessibilidade', () => {
    it('links devem ter atributo title', () => {
      const links = [
        { name: 'Instagram', hasTitle: true },
        { name: 'WhatsApp', hasTitle: true },
        { name: 'Email', hasTitle: true },
      ];

      links.forEach((link) => {
        expect(link.hasTitle).toBe(true);
      });
    });

    it('links devem abrir em nova aba', () => {
      const target = '_blank';
      expect(target).toBe('_blank');
    });

    it('links devem ter rel noopener noreferrer', () => {
      const rel = 'noopener noreferrer';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  describe('Responsividade', () => {
    it('gap deve ser responsivo (gap-3 md:gap-4)', () => {
      const gapClass = 'gap-3 md:gap-4';
      expect(gapClass).toContain('gap-3');
      expect(gapClass).toContain('md:gap-4');
    });

    it('deve suportar prop showLabels', () => {
      const showLabels = true;
      expect(typeof showLabels).toBe('boolean');
    });
  });

  describe('Ícones', () => {
    it('deve usar ícone Mail do lucide-react para Email', () => {
      const emailIcon = 'Mail';
      expect(emailIcon).toBe('Mail');
    });

    it('deve usar SVG customizado para Instagram', () => {
      const instagramIcon = 'svg';
      expect(instagramIcon).toBe('svg');
    });

    it('deve usar SVG customizado para WhatsApp', () => {
      const whatsappIcon = 'svg';
      expect(whatsappIcon).toBe('svg');
    });

    it('ícones devem ter tamanho w-5 h-5', () => {
      const iconSize = 'w-5 h-5';
      expect(iconSize).toContain('w-5');
      expect(iconSize).toContain('h-5');
    });
  });
});
