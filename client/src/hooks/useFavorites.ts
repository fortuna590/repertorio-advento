import { useState, useEffect } from 'react';

interface Favorite {
  momentoId: string;
  musicaNumero: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Carregar favoritos do LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('repertorio-favoritos');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
      }
    }
  }, []);

  // Salvar favoritos no LocalStorage
  const saveFavorites = (newFavorites: Favorite[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('repertorio-favoritos', JSON.stringify(newFavorites));
  };

  // Verificar se uma música está nos favoritos
  const isFavorite = (momentoId: string, musicaNumero: number) => {
    return favorites.some(
      f => f.momentoId === momentoId && f.musicaNumero === musicaNumero
    );
  };

  // Adicionar aos favoritos
  const addFavorite = (momentoId: string, musicaNumero: number) => {
    if (!isFavorite(momentoId, musicaNumero)) {
      const newFavorites = [...favorites, { momentoId, musicaNumero }];
      saveFavorites(newFavorites);
    }
  };

  // Remover dos favoritos
  const removeFavorite = (momentoId: string, musicaNumero: number) => {
    const newFavorites = favorites.filter(
      f => !(f.momentoId === momentoId && f.musicaNumero === musicaNumero)
    );
    saveFavorites(newFavorites);
  };

  // Toggle favorito
  const toggleFavorite = (momentoId: string, musicaNumero: number) => {
    if (isFavorite(momentoId, musicaNumero)) {
      removeFavorite(momentoId, musicaNumero);
    } else {
      addFavorite(momentoId, musicaNumero);
    }
  };

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
}
