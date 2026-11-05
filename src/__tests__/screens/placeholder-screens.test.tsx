import { render, screen } from '@testing-library/react-native';

import FavoritesScreen from '@/app/favorites';
import PokemonListScreen from '@/app/index';

describe('placeholder screens', () => {
  it('renders the Pokémons tab', async () => {
    await render(<PokemonListScreen />);
    expect(screen.getByText('All Pokémon')).toBeOnTheScreen();
  });

  it('renders the Favorites tab', async () => {
    await render(<FavoritesScreen />);
    expect(screen.getByText('My favorites')).toBeOnTheScreen();
  });
});
