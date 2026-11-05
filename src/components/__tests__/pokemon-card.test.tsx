import { fireEvent, render, screen } from '@testing-library/react-native';

import { formatPokemonName } from '@/utils/format';

import { PokemonCard } from '../pokemon-card';

const bulbasaur = { id: 1, name: 'bulbasaur', spriteUrl: 'https://sprites.test/1.png' };

describe('PokemonCard', () => {
  it('shows the number and the name as in Figma', async () => {
    await render(<PokemonCard pokemon={bulbasaur} onPress={jest.fn()} />);
    expect(screen.getByText('001')).toBeOnTheScreen();
    expect(screen.getByText('Bulbasaur')).toBeOnTheScreen();
    expect(screen.getByTestId('pokemon-sprite')).toBeOnTheScreen();
  });

  it('calls onPress with the Pokémon', async () => {
    const onPress = jest.fn();
    await render(<PokemonCard pokemon={bulbasaur} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Bulbasaur, number 001' }));
    expect(onPress).toHaveBeenCalledWith(bulbasaur);
  });

  it('shows a placeholder when the sprite does not exist', async () => {
    await render(<PokemonCard pokemon={{ ...bulbasaur, id: 10265 }} onPress={jest.fn()} />);
    await fireEvent(screen.getByTestId('pokemon-sprite'), 'error', { nativeEvent: { error: 'not found' } });
    // The Poké Ball is decorative (hidden from screen readers), so the query must include hidden elements.
    expect(await screen.findByTestId('poke-ball-outline', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByTestId('pokemon-sprite')).toBeNull();
  });
});

describe('formatPokemonName', () => {
  it('capitalises and turns dashes into spaces', () => {
    expect(formatPokemonName('bulbasaur')).toBe('Bulbasaur');
    expect(formatPokemonName('deoxys-attack')).toBe('Deoxys attack');
  });
});
