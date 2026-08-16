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

let cached = null;

export const FEATURE_FLAG_LABELS = {
  AI_INSIGHTS: 'AI Insights',
  AI_RECOMMENDATIONS: 'AI Recommendations',
  AI_SCORE: 'AI Lead Scoring',
  AI_CHATBOT: 'AI Chatbot',
  AI_BULK_RECOMMENDATIONS: 'Bulk AI Recommendations',
  WHATSAPP: 'WhatsApp Integration',
  CAMPAIGNS: 'Campaigns',
  ADVANCED_REPORTS: 'Advanced Reports',
  APPLICATIONS: 'Applications',
};

export async function loadFeatures({ force = false } = {}) {
  if (cached && !force) return cached;
  try {
    const res = await api.features.getAll();
    if (res?.success && res.data) {
      cached = { ...res.data };
      return cached;
    }
  } catch {
    /* keep defaults */
  }
  return { ...DEFAULT_FEATURES };
}
