import { api } from '../services/api';

export const DEFAULT_FEATURES = {
  AI_INSIGHTS: false,
  AI_RECOMMENDATIONS: false,
  AI_SCORE: false,
  AI_CHATBOT: false,
  AI_BULK_RECOMMENDATIONS: false,
  WHATSAPP: false,
  CAMPAIGNS: false,
  ADVANCED_REPORTS: false,
};

let loaded = false;

export async function loadFeatures() {
  if (loaded) return DEFAULT_FEATURES;
  try {
    const res = await api.features.getAll();
    if (res?.success && res.data) {
      return { ...res.data };
    }
  } catch {
    /* keep defaults */
  }
  return { ...DEFAULT_FEATURES };
}
