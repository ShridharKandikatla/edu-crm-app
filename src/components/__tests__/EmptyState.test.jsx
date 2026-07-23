import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders text when provided', () => {
    render(<EmptyState title="Empty" text="Nothing to show here" />);
    expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
  });

  it('does not render text when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/nothing to show/i)).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState title="Empty" action={<button>Add Item</button>} />
    );
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });
});
