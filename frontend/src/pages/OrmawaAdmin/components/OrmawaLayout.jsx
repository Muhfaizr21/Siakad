import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';
import useAuthStore from '../../../store/useAuthStore';

export default function OrmawaLayout() {
  const config = PORTAL_CONFIG.ormawa;
  const location = useLocation();
  const user = useAuthStore(state => state.user);

  const userPermissions = user?.permissions || user?.Permissions || [];
  const isSuperOrAdmin = user?.role === 'super_admin' || user?.role === 'ormawa_admin';

  // Map frontend sidebar permission keys -> backend DB catalog keys
  const hasPermission = (itemPermission) => {
    if (isSuperOrAdmin) return true;
    if (!itemPermission) return true;

    // Check direct match
    if (userPermissions.includes(itemPermission)) return true;

    const permissionMap = {
      'view_dashboard': ['admin.dashboard.view', 'student.dashboard.view', 'kencana.student.dashboard', 'kencana.faculty.dashboard', 'kencana.mentor.dashboard'],
      'view_mahasiswa': ['students.view'],
      'view_psikolog': ['psychologist.view'],
      'view_prodi': ['program_studi.view'],
      'view_pkkmb': ['kencana.faculty.dashboard', 'kencana.period.view', 'kencana.stage.view'],
      'view_organisasi': ['ormawa.view'],
      'view_proposal': ['ormawa.proposals.view', 'ormawa.proposals.create', 'ormawa.proposals.update', 'ormawa.proposals.delete', 'ormawa.proposals.manage'],
      'view_prestasi': ['achievement.view'],
      'view_beasiswa': ['scholarship.view'],
      'view_kesehatan': ['health.view'],
      'view_aspirasi': ['aspiration.view'],
      'manage_rbac': ['rbac.users.view', 'rbac.roles.view', 'rbac.permissions.assign'],
      'view_laporan': ['admin.audit.view', 'psychologist.reports.view', 'psychologist.reports.create', 'psychologist.reports.update', 'psychologist.reports.delete', 'psychologist.reports.manage'],
      'view_pengaturan': ['admin.profile.update'],
      
      // Ormawa sidebar mapping to DB keys (just in case they fall back or use DB roles)
      'view_members': ['ormawa.members.view', 'ormawa.members.create', 'ormawa.members.update', 'ormawa.members.delete', 'ormawa.members.manage'],
      'view_staff': ['ormawa.members.view', 'ormawa.members.create', 'ormawa.members.update', 'ormawa.members.delete', 'ormawa.members.manage'],
      'view_settings': ['ormawa.update'],
      'view_recruitment': ['ormawa.recruitment.view', 'ormawa.recruitment.create', 'ormawa.recruitment.update', 'ormawa.recruitment.delete', 'ormawa.recruitment.manage', 'ormawa.update'],
      'view_calendar': ['ormawa.events.view', 'ormawa.events.create', 'ormawa.events.update', 'ormawa.events.delete', 'ormawa.events.manage'],
      'view_attendance': ['ormawa.events.view', 'ormawa.events.create', 'ormawa.events.update', 'ormawa.events.delete', 'ormawa.events.manage'],
      'view_finance': ['ormawa.finance.view', 'ormawa.finance.create', 'ormawa.finance.update', 'ormawa.finance.delete', 'ormawa.finance.manage'],
      'view_lpj': ['ormawa.lpj.view', 'ormawa.lpj.create', 'ormawa.lpj.update', 'ormawa.lpj.delete', 'ormawa.lpj.manage'],
      'view_aspirations': ['ormawa.aspirations.view', 'ormawa.aspirations.create', 'ormawa.aspirations.update', 'ormawa.aspirations.delete', 'ormawa.aspirations.manage'],
      'view_announcements': ['ormawa.announcements.view', 'ormawa.announcements.create', 'ormawa.announcements.update', 'ormawa.announcements.delete', 'ormawa.announcements.manage'],
      'view_rbac': ['rbac.roles.view', 'ormawa.view'],
      'view_notifications': ['ormawa.view', 'ormawa.announcements.manage']
    };

    const mappedKeys = permissionMap[itemPermission] || [];
    return mappedKeys.some(key => userPermissions.includes(key));
  };

  // Find if current path is a menu item and requires a permission
  const currentPath = location.pathname;
  const allItems = (config.menu || []).flatMap(g => g.items || []);
  const currentItem = allItems.find(item => item.path === currentPath);

  if (currentItem?.permission && !hasPermission(currentItem.permission)) {
    return <Navigate to="/403" replace />;
  }

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}