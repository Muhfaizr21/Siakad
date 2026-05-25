import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';

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
                    const SizedBox(height: 24),
                    _buildSectionTitle('Profil Saya'),
                    const SizedBox(height: 16),
                    _buildProfileCard(),
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

  // ─── Profile Card ─────────────────────────────────────────────────────────

  Widget _buildProfileCard() {
    final profile = context.watch<PsychologistDashboardProvider>().profile;
    final name = profile?.name ?? '-';
    final spec = profile?.specialization ?? '-';
    final initials = name.trim().isEmpty ? 'P'
        : name.trim().split(' ').take(2).map((w) => w[0].toUpperCase()).join();

    return GestureDetector(
      onTap: () => _showProfileBottomSheet(profile),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.withAlpha(30)),
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFF0044BB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: AppTextStyles.bodyLg.copyWith(
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1E293B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    spec.isNotEmpty && spec != '-' ? spec : 'Tap untuk lihat & edit profil',
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Arrow
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.chevron_right_rounded, color: AppColors.primary, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  void _showProfileBottomSheet(dynamic profile) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ProfileBottomSheet(profile: profile),
    );
  }

  // ─── Role Card ────────────────────────────────────────────────────────────

  Widget _buildRoleCard() {
    final profile = context.watch<PsychologistDashboardProvider>().profile;
    final name = profile?.name ?? 'Psikolog';
    final spec = profile?.specialization ?? 'Psikolog';
    final nidn = profile?.nidn ?? '-';

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
                Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                Text('$spec • BKU Care', style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 12)),
                const SizedBox(height: 4),
                Text('NIDN: $nidn', style: TextStyle(color: Colors.white.withAlpha(150), fontSize: 11)),
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
          _buildChangePwTile(),
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

  // ─── Change Password Tile ─────────────────────────────────────────────────

  Widget _buildChangePwTile() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: const Color(0xFFFCE7F3),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.password_rounded, color: Color(0xFFBE185D), size: 20),
        ),
        title: Text('Ubah Password', style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
        subtitle: Text('Ganti password akun Anda', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
        onTap: () => _showChangePwSheet(),
      ),
    );
  }

  void _showChangePwSheet() {
    final provider = context.read<PsychologistDashboardProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ChangePwBottomSheet(provider: provider),
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

// ─── Change Password Bottom Sheet ────────────────────────────────────────────

class _ChangePwBottomSheet extends StatefulWidget {
  final PsychologistDashboardProvider provider;
  const _ChangePwBottomSheet({required this.provider});

  @override
  State<_ChangePwBottomSheet> createState() => _ChangePwBottomSheetState();
}

class _ChangePwBottomSheetState extends State<_ChangePwBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _showOld = false;
  bool _showNew = false;
  bool _showConfirm = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _oldCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      await widget.provider.changePassword(
        _oldCtrl.text.trim(),
        _newCtrl.text.trim(),
        _confirmCtrl.text.trim(),
      );
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Password berhasil diubah!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      // Parse pesan error dari DioException
      String msg = 'Gagal mengubah password';
      if (e is DioException) {
        final data = e.response?.data;
        if (data is Map) {
          msg = data['message']?.toString() ?? data['error']?.toString() ?? msg;
        } else if (data is String && data.isNotEmpty) {
          msg = data;
        }
      } else {
        final raw = e.toString();
        if (raw.contains('salah')) {
          msg = 'Password saat ini salah';
        } else if (raw.contains('minimal')) {
          msg = 'Password baru minimal 8 karakter';
        } else if (raw.contains('sama')) {
          msg = 'Konfirmasi password tidak sama';
        }
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withAlpha(60),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFCE7F3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.lock_rounded, color: Color(0xFFBE185D), size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ubah Password',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      Text(
                        'Minimal 8 karakter',
                        style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Password lama
              _buildPwField(
                controller: _oldCtrl,
                label: 'Password Saat Ini',
                show: _showOld,
                onToggle: () => setState(() => _showOld = !_showOld),
                validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 14),

              // Password baru
              _buildPwField(
                controller: _newCtrl,
                label: 'Password Baru',
                show: _showNew,
                onToggle: () => setState(() => _showNew = !_showNew),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Wajib diisi';
                  if (v.length < 8) return 'Minimal 8 karakter';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              // Konfirmasi
              _buildPwField(
                controller: _confirmCtrl,
                label: 'Konfirmasi Password Baru',
                show: _showConfirm,
                onToggle: () => setState(() => _showConfirm = !_showConfirm),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Wajib diisi';
                  if (v != _newCtrl.text) return 'Password tidak sama';
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Submit
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Text(
                          'Simpan Password',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPwField({
    required TextEditingController controller,
    required String label,
    required bool show,
    required VoidCallback onToggle,
    required String? Function(String?) validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: !show,
      validator: validator,
      style: const TextStyle(fontSize: 14, color: Color(0xFF1E293B)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
        prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 20),
        suffixIcon: IconButton(
          icon: Icon(
            show ? Icons.visibility_off_rounded : Icons.visibility_rounded,
            color: const Color(0xFF94A3B8),
            size: 20,
          ),
          onPressed: onToggle,
        ),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Colors.red),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}

// ─── Profile Bottom Sheet ─────────────────────────────────────────────────────

class _ProfileBottomSheet extends StatelessWidget {
  final dynamic profile;
  const _ProfileBottomSheet({required this.profile});

  @override
  Widget build(BuildContext context) {
    final name = profile?.name ?? '-';
    final email = profile?.email ?? '-';
    final phone = profile?.phone ?? '-';
    final spec = profile?.specialization ?? '-';
    final location = profile?.location ?? '-';
    final languages = profile?.languages ?? '-';
    final bio = profile?.bio ?? '';
    final nidn = profile?.nidn ?? '-';
    final initials = name.trim().isEmpty ? 'P'
        : name.trim().split(' ').take(2).map((w) => w[0].toUpperCase()).join();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 20),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withAlpha(60),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Avatar + nama
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, Color(0xFF0044BB)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withAlpha(60),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            spec != '-' ? spec : 'Psikolog',
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'NIDN: $nidn',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Info list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                _infoTile(Icons.email_rounded, 'Email', email, const Color(0xFFD1FAE5), const Color(0xFF065F46)),
                _infoTile(Icons.phone_rounded, 'No. HP', phone, const Color(0xFFFEF3C7), const Color(0xFFB45309)),
                _infoTile(Icons.location_on_rounded, 'Lokasi', location, const Color(0xFFE0E7FF), const Color(0xFF4338CA)),
                _infoTile(Icons.language_rounded, 'Bahasa', languages, const Color(0xFFFCE7F3), const Color(0xFFBE185D)),
                if (bio.isNotEmpty)
                  _infoTile(Icons.notes_rounded, 'Bio', bio, const Color(0xFFF0FDF4), const Color(0xFF16A34A)),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Edit button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  context.push(AppRoutes.psychologistEditProfile);
                },
                icon: const Icon(Icons.edit_rounded, size: 18),
                label: const Text(
                  'Edit Profil',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value, Color bg, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                Text(
                  value.isNotEmpty ? value : '-',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E293B),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
