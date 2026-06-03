import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

// Screens
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/finance/presentation/pages/ormawa_finance_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_absensi_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/pkkmb/presentation/pages/ormawa_pkkmb_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/anggota/presentation/pages/ormawa_anggota_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/staff/presentation/pages/ormawa_staff_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/kalender/presentation/pages/ormawa_kalender_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/laporan/presentation/pages/ormawa_laporan_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/aspirasi/presentation/pages/ormawa_aspirasi_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/pengumuman/presentation/pages/ormawa_pengumuman_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/notifications/presentation/pages/ormawa_notifications_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/settings/presentation/pages/ormawa_settings_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/struktur/presentation/pages/ormawa_struktur_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/rbac/presentation/pages/ormawa_role_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/notifications/presentation/pages/ormawa_notification_screen.dart';

class OrmawaServiceGrid extends StatelessWidget {
  const OrmawaServiceGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: GridView.count(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 4,
        mainAxisSpacing: 10,
        crossAxisSpacing: 0,
        childAspectRatio: 1.0,
        children: [
          _ServiceIcon(
            title: 'Proposal',
            icon: Icons.description_rounded,
            color: Colors.blue,
            delay: 0.5,
            target: const OrmawaProposalScreen(),
          ),
          _ServiceIcon(
            title: 'Keuangan',
            icon: Icons.payments_rounded,
            color: Colors.green,
            delay: 0.55,
            target: const OrmawaFinanceScreen(),
          ),
          _ServiceIcon(
            title: 'Absensi',
            icon: Icons.qr_code_scanner_rounded,
            color: Colors.teal,
            delay: 0.6,
            target: const OrmawaAbsensiScreen(),
          ),
          _ServiceIcon(
            title: 'PKKMB',
            icon: Icons.auto_awesome_rounded,
            color: Colors.orange,
            delay: 0.65,
            target: const OrmawaPKKMBScreen(),
          ),
          _ServiceIcon(
            title: 'Anggota',
            icon: Icons.groups_rounded,
            color: Colors.purple,
            delay: 0.7,
            target: const OrmawaAnggotaScreen(),
          ),
          _ServiceIcon(
            title: 'Kalender',
            icon: Icons.event_rounded,
            color: Colors.orange,
            delay: 0.75,
            target: const OrmawaKalenderScreen(),
          ),
          _ServiceIcon(
            title: 'Laporan',
            icon: Icons.assignment_rounded,
            color: Colors.red,
            delay: 0.8,
            target: const OrmawaLaporanScreen(),
          ),
          _ServiceIcon(
            title: 'Lainnya',
            icon: Icons.grid_view_rounded,
            color: Colors.blueGrey,
            delay: 0.85,
            isMore: true,
          ),
        ],
      ),
    );
  }
}

class _ServiceIcon extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final double delay;
  final Widget? target;
  final bool isMore;

  const _ServiceIcon({
    required this.title,
    required this.icon,
    required this.color,
    required this.delay,
    this.target,
    this.isMore = false,
  });

  @override
  Widget build(BuildContext context) {
    return FadeInAnimation(
      delay: delay,
      child: GestureDetector(
        onTap: () {
          if (isMore) {
            _showMoreServices(context);
          } else if (target != null) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => target!),
            );
          }
        },
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.labelSm.copyWith(
                color: AppColors.neutral600,  // Muted gray — not competing with primary
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMoreServices(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.65,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Semua Layanan Admin',
              style: AppTextStyles.titleLg.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.count(
                crossAxisCount: 4,
                mainAxisSpacing: 24,
                crossAxisSpacing: 0,
                childAspectRatio: 0.85,
                children: [
                  _ServiceIcon(
                    title: 'Proposal',
                    icon: Icons.description_rounded,
                    color: Colors.blue,
                    delay: 0,
                    target: const OrmawaProposalScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Keuangan',
                    icon: Icons.payments_rounded,
                    color: Colors.green,
                    delay: 0,
                    target: const OrmawaFinanceScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Absensi',
                    icon: Icons.qr_code_scanner_rounded,
                    color: Colors.teal,
                    delay: 0,
                    target: const OrmawaAbsensiScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Laporan',
                    icon: Icons.assignment_rounded,
                    color: Colors.red,
                    delay: 0,
                    target: const OrmawaLaporanScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Anggota',
                    icon: Icons.groups_rounded,
                    color: Colors.purple,
                    delay: 0,
                    target: const OrmawaAnggotaScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Struktur',
                    icon: Icons.account_tree_rounded,
                    color: Colors.indigo,
                    delay: 0,
                    target: const OrmawaStrukturScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Notifikasi',
                    icon: Icons.notifications_active_rounded,
                    color: Colors.blueGrey,
                    delay: 0,
                    target: const OrmawaNotificationScreen(),
                  ),
                  if (context.watch<OrmawaProvider>().hasPermission('MANAJEMEN_ANGGOTA'))
                    _ServiceIcon(
                      title: 'Manaj. Staf',
                      icon: Icons.person_add_alt_1_rounded,
                      color: Colors.blue,
                      delay: 0,
                      target: const OrmawaStaffScreen(),
                    ),
                  if (context.watch<OrmawaProvider>().hasPermission('ADMIN_PANEL'))
                    _ServiceIcon(
                      title: 'Hak Akses',
                      icon: Icons.admin_panel_settings_rounded,
                      color: Colors.blueGrey,
                      delay: 0,
                      target: const OrmawaRoleScreen(),
                    ),
                  _ServiceIcon(
                    title: 'Kalender',
                    icon: Icons.event_rounded,
                    color: Colors.orange,
                    delay: 0,
                    target: const OrmawaKalenderScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Pengumuman',
                    icon: Icons.campaign_rounded,
                    color: Colors.purple,
                    delay: 0,
                    target: const OrmawaPengumumanScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Aspirasi',
                    icon: Icons.campaign_rounded,
                    color: Colors.pink,
                    delay: 0,
                    target: const OrmawaAspirasiScreen(),
                  ),
                  _ServiceIcon(
                    title: 'PKKMB',
                    icon: Icons.auto_awesome_rounded,
                    color: Colors.orange,
                    delay: 0,
                    target: const OrmawaPKKMBScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Notifikasi',
                    icon: Icons.notifications_rounded,
                    color: Colors.amber,
                    delay: 0,
                    target: const OrmawaNotificationsScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Pengaturan',
                    icon: Icons.settings_rounded,
                    color: Colors.grey,
                    delay: 0,
                    target: const OrmawaSettingsScreen(),
                  ),
                  _ServiceIcon(
                    title: 'Keluar',
                    icon: Icons.logout_rounded,
                    color: Colors.red,
                    delay: 0,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
