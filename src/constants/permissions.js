export const ROLES = ['ADMIN', 'MANAGER', 'COUNSELOR', 'TELECALLER'];

export const ROLE_PERMISSIONS = {
  ADMIN: [
    'view_all_leads',
    'create_lead',
    'assign_leads',
    'bulk_import',
    'view_all_reports',
    'manage_users',
    'manage_courses',
    'delete_leads',
    'export_data',
    'follow_up',
    're_engage',
    'manage_campaigns',
    'manage_feature_flags',
  ],
  MANAGER: [
    'view_all_leads',
    'create_lead',
    'assign_leads',
    'bulk_import',
    'view_team_reports',
    'manage_courses',
    'export_data',
    'follow_up',
    're_engage',
    'manage_campaigns',
  ],
  COUNSELOR: ['view_own_leads', 'create_lead', 'view_own_reports', 'export_own_data', 'follow_up', 're_engage'],
  TELECALLER: ['view_own_leads', 'create_lead', 'follow_up'],
};

export const PERMISSION_LABELS = {
  view_all_leads: 'View all leads',
  view_own_leads: 'View assigned leads',
  create_lead: 'Create leads',
  assign_leads: 'Assign leads to counselors',
  bulk_import: 'Bulk import leads',
  view_all_reports: 'View all reports',
  view_team_reports: 'View team reports',
  view_own_reports: 'View own reports',
  manage_users: 'Manage users',
  manage_courses: 'Manage courses & intakes',
  delete_leads: 'Delete leads',
  export_data: 'Export all data',
  export_own_data: 'Export own data',
  follow_up: 'Manage follow-ups',
  re_engage: 'Re-engage failed leads',
  manage_campaigns: 'Manage campaigns & templates',
  manage_feature_flags: 'Manage feature flags',
};

export const ACCESS_LABELS = {
  'all': 'All leads',
  'team': 'Team leads',
  'own': 'Assigned to me',
  'manage': 'Full access',
  '✓': 'Yes',
  '✗': 'No',
};

export const ROLE_MATRIX = [
  {
    capability: 'Dashboard',
    detail: 'KPIs, charts, recent leads and follow-ups',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✓', TELECALLER: '✓' },
  },
  {
    capability: 'All Leads',
    detail: 'View lead list & profile',
    access: { ADMIN: 'all', MANAGER: 'all', COUNSELOR: 'own', TELECALLER: 'own' },
  },
  {
    capability: 'Add Lead',
    detail: 'Create new leads',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✓', TELECALLER: '✓' },
  },
  {
    capability: 'Assign Counselor',
    detail: 'Assign leads to counselors / telecallers',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✗', TELECALLER: '✗' },
  },
  {
    capability: 'Export Leads',
    detail: 'Download leads as CSV',
    access: { ADMIN: 'all', MANAGER: 'all', COUNSELOR: 'own', TELECALLER: '✗' },
  },
  {
    capability: 'Follow-ups',
    detail: 'Schedule & complete follow-ups',
    access: { ADMIN: 'all', MANAGER: 'all', COUNSELOR: 'own', TELECALLER: 'own' },
  },
  {
    capability: 'Failed Leads',
    detail: 'View failed leads list',
    access: { ADMIN: 'all', MANAGER: 'all', COUNSELOR: 'own', TELECALLER: 'own' },
  },
  {
    capability: 'Re-engagement',
    detail: 'Re-engage failed leads',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: 'own', TELECALLER: '✗' },
  },
  {
    capability: 'Course Catalogue',
    detail: 'View the course catalogue',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✓', TELECALLER: '✓' },
  },
  {
    capability: 'Manage Courses & Intakes',
    detail: 'Add / edit courses and intakes',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✗', TELECALLER: '✗' },
  },
  {
    capability: 'Applications',
    detail: 'View & manage applications',
    access: { ADMIN: 'all', MANAGER: 'all', COUNSELOR: 'own', TELECALLER: 'own' },
  },
  {
    capability: 'Users',
    detail: 'Create / edit / deactivate users',
    access: { ADMIN: '✓', MANAGER: '✗', COUNSELOR: '✗', TELECALLER: '✗' },
  },
  {
    capability: 'Campaigns & Templates',
    detail: 'Marketing campaigns & message templates',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✗', TELECALLER: '✗' },
  },
  {
    capability: 'Feature Flags',
    detail: 'Toggle feature availability from Settings',
    access: { ADMIN: '✓', MANAGER: '✗', COUNSELOR: '✗', TELECALLER: '✗' },
  },
  {
    capability: 'Reports',
    detail: 'Analytics & performance reports',
    access: { ADMIN: 'all', MANAGER: 'team', COUNSELOR: 'own', TELECALLER: '✗' },
  },
  {
    capability: 'Settings',
    detail: 'Profile, appearance, notifications, security',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✓', TELECALLER: '✓' },
  },
  {
    capability: 'AI Features',
    detail: 'AI insights, scoring, recommendations & chatbot (plan-gated)',
    access: { ADMIN: '✓', MANAGER: '✓', COUNSELOR: '✓', TELECALLER: '✓' },
  },
];
