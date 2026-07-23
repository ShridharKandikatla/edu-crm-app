import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';

const STORAGE_KEY = 'notificationPreferences';

const DEFAULT_PREFS = {
  newLeadAssigned: true,
  followUpReminders: true,
  leadConverted: true,
  escalationAlerts: true,
  dailyDigest: false,
  weeklyReport: true,
};

const TYPE_MAP = {
  LEAD_ASSIGNED: 'newLeadAssigned',
  FOLLOW_UP_REMINDER: 'followUpReminders',
  LEAD_CONVERTED: 'leadConverted',
  ESCALATION: 'escalationAlerts',
  LEAD_FAILED: 'escalationAlerts',
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_PREFS };
}

function saveLocal(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState(loadLocal);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;

    (async () => {
      let merged = loadLocal();
      try {
        const res = await api.notificationPreferences.get();
        if (!cancelled && res?.success && res.data?.preferences) {
          merged = { ...DEFAULT_PREFS, ...res.data.preferences };
        }
      } catch { /* backend not available, keep localStorage values */ }
      if (!cancelled) {
        setPreferences(merged);
        saveLocal(merged);
        loadedRef.current = true;
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      saveLocal(next);
      api.notificationPreferences.update(next).catch(() => { /* sync next time */ });
      return next;
    });
  }, []);

  const isAllowed = useCallback((notificationType) => {
    const key = TYPE_MAP[notificationType];
    return key ? preferences[key] !== false : true;
  }, [preferences]);

  return { preferences, updatePreferences, isAllowed, loading };
}
