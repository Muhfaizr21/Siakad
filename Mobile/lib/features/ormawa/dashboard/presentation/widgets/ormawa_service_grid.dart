import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

// Screens
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/finance/presentation/pages/ormawa_finance_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_absensi_screen.dart';
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
import 'package:bkuhub_mobile/features/ormawa/recruitment/presentation/pages/ormawa_recruitment_screen.dart';

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
        children: const [
          _ServiceIcon(
            title: 'Proposal',
            icon: Icons.assignment_rounded,
            color: Colors.blue,
            delay: 0.5,
            target: OrmawaProposalScreen(),
          ),
          _ServiceIcon(
            title: 'Anggota',
            icon: Icons.groups_rounded,
            color: Colors.purple,
            delay: 0.55,
            target: OrmawaAnggotaScreen(),
          ),
          _ServiceIcon(
            title: 'Keuangan',
            icon: Icons.account_balance_wallet_rounded,
            color: Colors.green,
            delay: 0.6,
            target: OrmawaFinanceScreen(),
          ),
          _ServiceIcon(
            title: 'Absensi',
            icon: Icons.qr_code_scanner_rounded,
            color: Colors.teal,
            delay: 0.65,
            target: OrmawaAbsensiScreen(),
          ),
          _ServiceIcon(
            title: 'Kalender',
            icon: Icons.event_rounded,
            color: Colors.indigo,
            delay: 0.7,
            target: OrmawaKalenderScreen(),
          ),
          _ServiceIcon(
            title: 'LPJ',
            icon: Icons.description_rounded,
            color: Colors.red,
            delay: 0.75,
            target: OrmawaLaporanScreen(),
          ),
          _ServiceIcon(
            title: 'Pengumuman',
            icon: Icons.campaign_rounded,
            color: Colors.purple,
            delay: 0.8,
            target: OrmawaPengumumanScreen(),
          ),
          _ServiceIcon(
            title: 'Lainy',
            icon: Icons.menu_rounded,
            color: Colors.blueGrey,
            delay: 0.85,
            isMore: true,
          ),
        ],
      ),
    );
  }
}

/// Modal content untuk Menu Lainnya - bisa di-reuse di MainScreen
class OrmawaServiceGridModal extends StatelessWidget {
  const OrmawaServiceGridModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
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
          'Lainy',
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
              _ModalServiceIcon(
                title: 'Struktur',
                icon: Icons.account_tree_rounded,
                color: Colors.indigo,
                target: const OrmawaStrukturScreen(),
              ),
              _ModalServiceIcon(
                title: 'Open Recruitment',
                icon: Icons.person_add_rounded,
                color: Colors.cyan,
                target: const OrmawaRecruitmentScreen(),
              ),
              _ModalServiceIcon(
                title: 'Aspirasi',
                icon: Icons.chat_bubble_outline_rounded,
                color: Colors.pink,
                target: const OrmawaAspirasiScreen(),
              ),
              _ModalServiceIcon(
                title: 'Notifikasi',
                icon: Icons.notifications_rounded,
                color: Colors.amber,
                target: const OrmawaNotificationsScreen(),
              ),
              _ModalServiceIcon(
                title: 'Manaj. Staf',
                icon: Icons.person_add_alt_1_rounded,
                color: Colors.blue,
                target: const OrmawaStaffScreen(),
              ),
              _ModalServiceIcon(
                title: 'Hak Akses',
                icon: Icons.admin_panel_settings_rounded,
                color: Colors.blueGrey,
                target: const OrmawaRoleScreen(),
              ),
              _ModalServiceIcon(
                title: 'Pengaturan',
                icon: Icons.settings_rounded,
                color: Colors.grey,
                target: const OrmawaSettingsScreen(),
              ),
              _ModalServiceIcon(
                title: 'Keluar',
                icon: Icons.logout_rounded,
                color: Colors.red,
                onTap: () => _showLogoutDialog(context),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder:
          (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            contentPadding: const EdgeInsets.all(28),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.dangerContainer,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.logout_rounded,
                    color: AppColors.danger,
                    size: 36,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Keluar Portal?',
                  style: AppTextStyles.titleLg.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Sesi administrasi Anda akan diakhiri. Pastikan semua data laporan sudah tersimpan.',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMd.copyWith(
                    color: AppColors.onSurfaceVariant,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          side: BorderSide(color: AppColors.outline),
                        ),
                        child: Text(
                          'Batal',
                          style: AppTextStyles.labelLg.copyWith(
                            color: AppColors.onSurface,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          Navigator.pop(context);
                          context.go(AppRoutes.login);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.danger,
                          foregroundColor: AppColors.onDanger,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          'Keluar',
                          style: AppTextStyles.labelLg.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
    );
  }
}

class _ModalServiceIcon extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final Widget? target;
  final VoidCallback? onTap;

  const _ModalServiceIcon({
    required this.title,
    required this.icon,
    required this.color,
    this.target,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (onTap != null) {
          onTap!();
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
              color: AppColors.neutral600,
              fontWeight: FontWeight.bold,
              fontSize: 10,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
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
                color: AppColors.neutral600,
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
      builder:
          (context) => Container(
            height: MediaQuery.of(context).size.height * 0.65,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            ),
            padding: const EdgeInsets.all(24),
            child: const OrmawaServiceGridModal(),
          ),
    );
  }
}
