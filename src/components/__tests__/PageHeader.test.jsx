import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Dashboard" subtitle="Overview of your data" />);
    expect(screen.getByText('Overview of your data')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText(/overview/i)).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <PageHeader title="Dashboard">
        <button>Action</button>
      </PageHeader>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
