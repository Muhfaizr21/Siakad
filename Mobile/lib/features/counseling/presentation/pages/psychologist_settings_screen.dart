import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class PsychologistSettingsScreen extends StatefulWidget {
  final bool showBackButton;
  const PsychologistSettingsScreen({super.key, this.showBackButton = true});

  @override
  State<PsychologistSettingsScreen> createState() => _PsychologistSettingsScreenState();
}

class _PsychologistSettingsScreenState extends State<PsychologistSettingsScreen> {
  bool _is2FAEnabled = true;
  bool _isBiometricEnabled = true;
  String _autoLogoutTime = '15 Menit';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: RefreshIndicator(
        onRefresh: () async => await Future.delayed(const Duration(seconds: 1)),
        color: AppColors.primary,
        backgroundColor: Colors.white,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            BkuAppBar(
              title: 'PENGATURAN',
              subtitle: 'KEAMANAN & PROFIL',
              variant: AppBarVariant.psychologist,
              showBackButton: widget.showBackButton,
              expandedHeight: 160,
              isExpandable: false,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    _buildRoleCard(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Keamanan Akun'),
                    const SizedBox(height: 16),
                    _buildSecurityCard(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Sistem & Sesi'),
                    const SizedBox(height: 16),
                    _buildSystemCard(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Akses & Data'),
                    const SizedBox(height: 16),
                    _buildDataAccessCard(),
                    const SizedBox(height: 40),
                    _buildLogoutButton(),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Section Title ────────────────────────────────────────────────────────

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleLg.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w900,
        color: AppColors.primary,
      ),
    );
  }

  // ─── Role Card ────────────────────────────────────────────────────────────

  Widget _buildRoleCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF003399)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withAlpha(60), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(color: Colors.white.withAlpha(40), borderRadius: BorderRadius.circular(18)),
            child: const Icon(Icons.psychology_rounded, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Dr. Sarah Sp.Psi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Psikolog Klinis • BKU Care', style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 12)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withAlpha(40), borderRadius: BorderRadius.circular(8)),
                  child: const Text('Read/Write EHR • Scheduling', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const Icon(Icons.verified_rounded, color: Colors.white, size: 28),
        ],
      ),
    );
  }

  // ─── Security Card ────────────────────────────────────────────────────────

  Widget _buildSecurityCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          _buildSwitchTile(
            Icons.enhanced_encryption_rounded,
            'Autentikasi 2 Faktor (2FA)',
            'Kode SMS/Email saat login',
            const Color(0xFFE0E7FF), const Color(0xFF4338CA),
            _is2FAEnabled,
            (val) => setState(() => _is2FAEnabled = val),
          ),
          Divider(height: 1, indent: 20, color: Colors.grey.withAlpha(30)),
          _buildSwitchTile(
            Icons.fingerprint_rounded,
            'Biometric Unlock',
            'Sidik Jari atau Face ID',
            const Color(0xFFD1FAE5), const Color(0xFF065F46),
            _isBiometricEnabled,
            (val) => setState(() => _isBiometricEnabled = val),
          ),
          Divider(height: 1, indent: 20, color: Colors.grey.withAlpha(30)),
          _buildActionTile(
            Icons.password_rounded,
            'Ubah Password Sesi',
            'Password khusus untuk akses EHR',
            const Color(0xFFFCE7F3), const Color(0xFFBE185D),
          ),
        ],
      ),
    );
  }

  // ─── System Card ──────────────────────────────────────────────────────────

  Widget _buildSystemCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          _buildDropdownTile(
            Icons.timer_off_rounded,
            'Auto-Logout Sesi',
            'Keluar otomatis setelah idle',
            const Color(0xFFFEF3C7), const Color(0xFFB45309),
            _autoLogoutTime,
            ['5 Menit', '15 Menit', '30 Menit', '1 Jam'],
            (val) => setState(() => _autoLogoutTime = val!),
          ),
          Divider(height: 1, indent: 20, color: Colors.grey.withAlpha(30)),
          _buildActionTile(
            Icons.history_rounded,
            'Log Aktivitas Sesi',
            'Riwayat akses & perubahan data',
            const Color(0xFFE0E7FF), const Color(0xFF4338CA),
          ),
          Divider(height: 1, indent: 20, color: Colors.grey.withAlpha(30)),
          _buildActionTile(
            Icons.notifications_rounded,
            'Notifikasi & Reminder',
            'Atur pengingat sebelum sesi dimulai',
            const Color(0xFFD1FAE5), const Color(0xFF065F46),
          ),
        ],
      ),
    );
  }

  // ─── Data Access Card ─────────────────────────────────────────────────────

  Widget _buildDataAccessCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          _buildActionTile(
            Icons.download_rounded,
            'Ekspor Data EHR',
            'Unduh laporan dalam format PDF/CSV',
            const Color(0xFFE0E7FF), const Color(0xFF4338CA),
          ),
          Divider(height: 1, indent: 20, color: Colors.grey.withAlpha(30)),
          _buildActionTile(
            Icons.policy_rounded,
            'Kebijakan Kerahasiaan',
            'Syarat & ketentuan akses data pasien',
            const Color(0xFFFEF3C7), const Color(0xFFB45309),
          ),
        ],
      ),
    );
  }

  // ─── Tile Builders ────────────────────────────────────────────────────────

  Widget _buildSwitchTile(IconData icon, String title, String subtitle, Color bg, Color color, bool value, Function(bool) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        trailing: Switch(value: value, onChanged: onChanged, activeColor: AppColors.primary),
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String title, String subtitle, Color bg, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$title sedang dalam pengembangan'),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDropdownTile(IconData icon, String title, String subtitle, Color bg, Color color, String value, List<String> items, Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        trailing: DropdownButton<String>(
          value: value,
          underline: const SizedBox(),
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 13)))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.red.withAlpha(10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.red.withAlpha(50)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: Colors.red.withAlpha(20), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.logout_rounded, color: Colors.red, size: 20),
        ),
        title: const Text('Keluar Aplikasi', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        subtitle: Text('Anda akan keluar dari sesi ini', style: AppTextStyles.labelSm.copyWith(color: Colors.red.withAlpha(150))),
        trailing: const Icon(Icons.chevron_right_rounded, color: Colors.red),
        onTap: () => _showLogoutDialog(),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(28),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.logout_rounded, color: Colors.red, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              'Keluar Aplikasi?',
              style: AppTextStyles.titleLg.copyWith(
                fontWeight: FontWeight.w900,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Sesi Anda akan diakhiri. Pastikan semua catatan sudah tersimpan sebelum keluar.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, height: 1.5),
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      side: BorderSide(color: Colors.grey.withAlpha(60)),
                    ),
                    child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
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
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: const Text('Keluar', style: TextStyle(fontWeight: FontWeight.bold)),
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
