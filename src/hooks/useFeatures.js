import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useFeatures() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useFeatures must be used within AuthProvider');
  return ctx.features;
}
