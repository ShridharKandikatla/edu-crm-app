import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

function TestComponent() {
  const { theme, resolvedTheme, isDark, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="isDark">{String(isDark)}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
}

function mockMatchMedia(matches) {
  const listeners = [];
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn((type, cb) => { listeners.push({ type, cb }); }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  return { listeners };
}

describe('ThemeContext', () => {
  let originalMatchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      delete window.matchMedia;
    }
  });

  it('defaults to system theme', () => {
    mockMatchMedia(false);
    render(<App />);
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('resolves dark from system preference', () => {
    mockMatchMedia(true);
    render(<App />);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
  });

  it('setTheme persists to localStorage and applies the dark class', () => {
    mockMatchMedia(false);
    render(<App />);
    act(() => {
      screen.getByText('Set Dark').click();
    });
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('reads a persisted theme from localStorage on load', () => {
    localStorage.setItem('theme', 'dark');
    mockMatchMedia(false);
    render(<App />);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('system theme follows OS preference changes', () => {
    const { listeners } = mockMatchMedia(false);
    render(<App />);
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    act(() => {
      listeners.forEach(({ type, cb }) => {
        if (type === 'change') cb({ matches: true });
      });
    });
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('light theme ignores OS preference', () => {
    const { listeners } = mockMatchMedia(true);
    render(<App />);
    act(() => {
      screen.getByText('Set Light').click();
    });
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      listeners.forEach(({ type, cb }) => {
        if (type === 'change') cb({ matches: true });
      });
    });
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });
});
