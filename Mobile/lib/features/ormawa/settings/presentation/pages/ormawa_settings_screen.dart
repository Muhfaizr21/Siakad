import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/ormawa/rbac/presentation/pages/ormawa_role_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/coming_soon_screen.dart';

class OrmawaSettingsScreen extends StatefulWidget {
  final bool showBackButton;
  const OrmawaSettingsScreen({super.key, this.showBackButton = true});

  @override
  State<OrmawaSettingsScreen> createState() => _OrmawaSettingsScreenState();
}

class _OrmawaSettingsScreenState extends State<OrmawaSettingsScreen> {
  bool _notifApproval = true;
  bool _notifFinance = true;
  bool _notifAspiration = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutral100,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'PENGATURAN PORTAL',
            subtitle: 'KONFIGURASI SISTEM',
            expandedHeight: 160.0,
            showBackButton: widget.showBackButton,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                _buildSectionHeader('MANAJEMEN ORGANISASI'),
                _buildSettingTile(
                  Icons.storefront_rounded,
                  'Profil Organisasi',
                  'Nama, Logo, Visi & Misi',
                  Colors.blue,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => const ComingSoonScreen(
                            featureName: 'Profil Organisasi',
                          ),
                    ),
                  ),
                ),
                if (context.watch<OrmawaProvider>().hasPermission(
                  'ADMIN_PANEL',
                ))
                  _buildSettingTile(
                    Icons.admin_panel_settings_rounded,
                    'Hak Akses & Role',
                    'Kelola admin & staf',
                    Colors.indigo,
                    () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const OrmawaRoleScreen(),
                      ),
                    ),
                  ),
                _buildSettingTile(
                  Icons.security_rounded,
                  'Keamanan Portal',
                  'Password & Autentikasi',
                  Colors.teal,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => const ComingSoonScreen(
                            featureName: 'Keamanan Portal',
                          ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),
                _buildSectionHeader('PREFERENSI NOTIFIKASI'),
                _buildSwitchTile(
                  'Approval Proposal',
                  'Terima notifikasi status proposal',
                  _notifApproval,
                  (v) => setState(() => _notifApproval = v),
                ),
                _buildSwitchTile(
                  'Update Keuangan',
                  'Notifikasi setiap mutasi kas masuk',
                  _notifFinance,
                  (v) => setState(() => _notifFinance = v),
                ),
                _buildSwitchTile(
                  'Aspirasi Anggota',
                  'Notifikasi setiap ada keluhan baru',
                  _notifAspiration,
                  (v) => setState(() => _notifAspiration = v),
                ),

                const SizedBox(height: 32),
                _buildSectionHeader('LAINNYA'),
                _buildSettingTile(
                  Icons.help_outline_rounded,
                  'Pusat Bantuan',
                  'Panduan penggunaan portal',
                  Colors.orange,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => const ComingSoonScreen(
                            featureName: 'Pusat Bantuan',
                          ),
                    ),
                  ),
                ),
                _buildSettingTile(
                  Icons.info_outline_rounded,
                  'Tentang BKUhub',
                  'Informasi versi & pengembang',
                  Colors.blueGrey,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => const ComingSoonScreen(
                            featureName: 'Tentang BKUhub',
                          ),
                    ),
                  ),
                ),

                const SizedBox(height: 40),
                _buildLogoutButton(),
                const SizedBox(height: 60),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 12),
      child: Text(
        title,
        style: AppTextStyles.overline.copyWith(
          color: AppColors.neutral500,
        ),
      ),
    );
  }

  Widget _buildSettingTile(
    IconData icon,
    String title,
    String subtitle,
    Color color,
    VoidCallback onTap,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(
          title,
          style: AppTextStyles.titleMd,
        ),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodySm.copyWith(
            color: AppColors.neutral500,
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios_rounded,
          size: 14,
          color: AppColors.neutral400,
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    bool value,
    Function(bool) onChanged,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.titleMd,
                ),
                Text(
                  subtitle,
                  style: AppTextStyles.bodySm.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.primary,
            activeTrackColor: AppColors.primary.withAlpha(50),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: TextButton.icon(
          onPressed: () => _showLogoutDialog(),
          icon: const Icon(Icons.logout_rounded, color: AppColors.danger),
          label: Text(
            'KELUAR PORTAL',
            style: AppTextStyles.labelLg.copyWith(
              color: AppColors.danger,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          style: TextButton.styleFrom(
            backgroundColor: AppColors.dangerContainer,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog() {
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
