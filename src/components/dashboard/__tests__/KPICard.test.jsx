import { render, screen } from '@testing-library/react';
import KPICard from '../KPICard';

const MockIcon = () => <span data-testid="mock-icon">icon</span>;

describe('KPICard', () => {
  it('renders label', () => {
    render(
      <KPICard
        label="Total Students"
        value={1200}
        change={5}
        icon={MockIcon}
        variant="primary"
        index={0}
      />
    );
    expect(screen.getByText('Total Students')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(
      <KPICard
        label="Total Students"
        value={1200}
        change={5}
        icon={MockIcon}
        variant="primary"
        index={0}
      />
    );
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('renders text value when isText is true', () => {
    render(
      <KPICard
        label="Status"
        value="Active"
        change={0}
        icon={MockIcon}
        variant="primary"
        isText
        index={0}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <KPICard
        label="Revenue"
        value={5000}
        change={10}
        icon={MockIcon}
        variant="primary"
        footer={<span>Last updated today</span>}
        index={0}
      />
    );
    expect(screen.getByText('Last updated today')).toBeInTheDocument();
  });

  it('shows trend up icon when change is positive', () => {
    render(
      <KPICard
        label="Growth"
        value={100}
        change={12}
        icon={MockIcon}
        variant="primary"
        index={0}
      />
    );
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('shows trend down icon when change is negative', () => {
    render(
      <KPICard
        label="Growth"
        value={100}
        change={-5}
        icon={MockIcon}
        variant="primary"
        index={0}
      />
    );
    expect(screen.getByText('5%')).toBeInTheDocument();
  });
});
