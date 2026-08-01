const FEATURE_NAMES = {
  WHATSAPP: 'WhatsApp Integration',
  CAMPAIGNS: 'Marketing Campaigns & Cost Tracking',
  ADVANCED_REPORTS: 'Advanced Reports',
  AI_INSIGHTS: 'AI Insights',
  AI_RECOMMENDATIONS: 'AI Recommendations',
  AI_SCORE: 'AI Scoring',
  AI_CHATBOT: 'AI Chatbot',
  AI_BULK_RECOMMENDATIONS: 'Bulk AI Recommendations',
};

export function FeatureLocked({ feature }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔒</div>
      <div className="empty-state-title">Feature Not Available</div>
      <div className="empty-state-message">
        {FEATURE_NAMES[feature] || feature} is not available on your current plan.
        Contact your administrator to upgrade.
      </div>
    </div>
  );
}
