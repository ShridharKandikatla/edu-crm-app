import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS, ROLE_MATRIX, ROLES, PERMISSION_LABELS } from '../permissions';

describe('ROLE_PERMISSIONS', () => {
  it('defines all four roles', () => {
    expect(ROLES).toEqual(['ADMIN', 'MANAGER', 'COUNSELOR', 'TELECALLER']);
  });

  it('ADMIN has every capability', () => {
    const admin = ROLE_PERMISSIONS.ADMIN;
    for (const key of ['view_all_leads', 'create_lead', 'assign_leads', 'view_all_reports', 'manage_users', 'manage_courses', 'delete_leads', 'export_data', 'follow_up', 're_engage', 'manage_campaigns', 'manage_feature_flags']) {
      expect(admin).toContain(key);
    }
  });

  it('MANAGER can assign, export, manage courses and campaigns but not users', () => {
    const m = ROLE_PERMISSIONS.MANAGER;
    expect(m).toContain('assign_leads');
    expect(m).toContain('export_data');
    expect(m).toContain('manage_courses');
    expect(m).toContain('manage_campaigns');
    expect(m).toContain('re_engage');
    expect(m).not.toContain('manage_users');
    expect(m).not.toContain('delete_leads');
    expect(m).not.toContain('manage_feature_flags');
  });

  it('COUNSELOR sees own data and can re-engage', () => {
    const c = ROLE_PERMISSIONS.COUNSELOR;
    expect(c).toContain('view_own_leads');
    expect(c).toContain('view_own_reports');
    expect(c).toContain('export_own_data');
    expect(c).toContain('follow_up');
    expect(c).toContain('re_engage');
    expect(c).not.toContain('assign_leads');
    expect(c).not.toContain('manage_courses');
    expect(c).not.toContain('manage_campaigns');
  });

  it('TELECALLER has minimal access only', () => {
    const t = ROLE_PERMISSIONS.TELECALLER;
    expect(t).toContain('view_own_leads');
    expect(t).toContain('create_lead');
    expect(t).toContain('follow_up');
    expect(t).not.toContain('re_engage');
    expect(t).not.toContain('export_data');
    expect(t).not.toContain('export_own_data');
    expect(t).not.toContain('view_own_reports');
    expect(t).not.toContain('manage_campaigns');
    expect(t).not.toContain('manage_users');
    expect(t).not.toContain('manage_feature_flags');
  });

  it('every permission has at least one role', () => {
    const allGranted = new Set(Object.values(ROLE_PERMISSIONS).flat());
    for (const label of Object.keys(PERMISSION_LABELS)) {
      expect(allGranted.has(label), `permission "${label}" unused by every role`).toBe(true);
    }
  });
});

describe('ROLE_MATRIX', () => {
  it('covers every role column', () => {
    for (const row of ROLE_MATRIX) {
      for (const role of ROLES) {
        expect(row.access, `${row.capability} missing role ${role}`).toHaveProperty(role);
      }
    }
  });

  it('every capability has at least one role with access', () => {
    for (const row of ROLE_MATRIX) {
      const hasAccess = ROLES.some((role) => row.access[role] !== '✗');
      expect(hasAccess, `${row.capability} is denied for every role`).toBe(true);
    }
  });

  it('matrix access values are all understood', () => {
    const known = new Set(['✓', '✗', 'all', 'team', 'own', 'manage']);
    for (const row of ROLE_MATRIX) {
      for (const role of ROLES) {
        expect(known.has(row.access[role]), `${row.capability}/${role} has unknown value ${row.access[role]}`).toBe(true);
      }
    }
  });
});
