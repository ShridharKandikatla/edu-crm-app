import { useEffect } from 'react';

export function useKeyboardShortcut(key, callback, { ctrl = false, shift = false, alt = false } = {}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt
      ) {
        e.preventDefault();
        callback();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, shift, alt]);
}
