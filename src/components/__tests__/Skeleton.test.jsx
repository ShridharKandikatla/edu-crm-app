import { render } from '@testing-library/react';
import { SkeletonBlock, SkeletonCard, SkeletonTable } from '../Skeleton';

describe('SkeletonBlock', () => {
  it('renders with default styles', () => {
    const { container } = render(<SkeletonBlock />);
    const el = container.firstChild;
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ width: '100%', height: '20px' });
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<SkeletonBlock width="50%" height="40px" />);
    const el = container.firstChild;
    expect(el).toHaveStyle({ width: '50%', height: '40px' });
  });
});

describe('SkeletonCard', () => {
  it('renders', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SkeletonTable', () => {
  it('renders correct number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} cols={2} />);
    const rows = container.querySelectorAll('.flex.gap-4.items-center');
    expect(rows.length).toBe(3);
  });
});
