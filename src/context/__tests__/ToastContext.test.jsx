import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

function TestComponent() {
  const { toast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => toast.success('It worked!')}>
        Show Toast
      </button>
      {toasts.map((t) => (
        <div key={t.id} role="status">{t.message}</div>
      ))}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );
}

describe('ToastContext', () => {
  it('provides toast function', () => {
    render(<App />);
    expect(screen.getByText('Show Toast')).toBeInTheDocument();
  });

  it('toast appears after calling toast.success()', () => {
    render(<App />);
    act(() => {
      screen.getByText('Show Toast').click();
    });
    expect(screen.getByText('It worked!')).toBeInTheDocument();
  });

  it('toast disappears after timeout', () => {
    vi.useFakeTimers();
    render(<App />);

    act(() => {
      screen.getByText('Show Toast').click();
    });
    expect(screen.getByText('It worked!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('It worked!')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
