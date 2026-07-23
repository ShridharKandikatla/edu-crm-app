import { render, screen } from '@testing-library/react';
import ChartCard from '../ChartCard';

describe('ChartCard', () => {
  it('renders title', () => {
    render(<ChartCard title="Revenue Chart" />);
    expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<ChartCard title="Revenue" subtitle="Last 12 months" />);
    expect(screen.getByText('Last 12 months')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<ChartCard title="Revenue" />);
    expect(screen.queryByText(/last 12/i)).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <ChartCard title="Chart">
        <div>Chart content here</div>
      </ChartCard>
    );
    expect(screen.getByText('Chart content here')).toBeInTheDocument();
  });
});
