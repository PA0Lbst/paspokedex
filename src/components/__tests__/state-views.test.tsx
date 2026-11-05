import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState, ErrorView, LoadingView } from '../state-views';
import { TypeBadge } from '../type-badge';

describe('LoadingView', () => {
  it('shows the default message', async () => {
    await render(<LoadingView />);
    expect(screen.getByText('Loading Pokémon…')).toBeOnTheScreen();
  });
});

describe('ErrorView', () => {
  it('shows the error and calls onRetry when Try again is pressed', async () => {
    const onRetry = jest.fn();
    await render(<ErrorView onRetry={onRetry} />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows a custom message', async () => {
    await render(<ErrorView message="Pokémon not found." onRetry={jest.fn()} />);
    expect(screen.getByText('Pokémon not found.')).toBeOnTheScreen();
  });
});

describe('EmptyState', () => {
  it('shows the title and message', async () => {
    await render(<EmptyState title="No favorites yet" message="Add one from a card." />);
    expect(screen.getByText('No favorites yet')).toBeOnTheScreen();
    expect(screen.getByText('Add one from a card.')).toBeOnTheScreen();
  });
});

describe('TypeBadge', () => {
  it('shows the capitalised type with its colour', async () => {
    await render(<TypeBadge type="grass" />);
    expect(screen.getByText('Grass')).toBeOnTheScreen();
    expect(screen.getByTestId('type-dot')).toHaveStyle({ backgroundColor: '#64BC55' });
  });
});
