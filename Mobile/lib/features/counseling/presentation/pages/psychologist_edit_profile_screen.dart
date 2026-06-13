import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';

class PsychologistEditProfileScreen extends StatefulWidget {
  const PsychologistEditProfileScreen({super.key});

  @override
  State<PsychologistEditProfileScreen> createState() =>
      _PsychologistEditProfileScreenState();
}

class _PsychologistEditProfileScreenState
    extends State<PsychologistEditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSaving = false;

  late TextEditingController _namaCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _spesialisasiCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _lokasiCtrl;
  late TextEditingController _bahasaCtrl;

  @override
  void initState() {
    super.initState();
    final profile = context.read<PsychologistDashboardProvider>().profile;
    _namaCtrl = TextEditingController(text: profile?.name ?? '');
    _emailCtrl = TextEditingController(text: profile?.email ?? '');
    _phoneCtrl = TextEditingController(text: profile?.phone ?? '');
    _spesialisasiCtrl = TextEditingController(text: profile?.specialization ?? '');
    _bioCtrl = TextEditingController(text: profile?.bio ?? '');
    _lokasiCtrl = TextEditingController(text: profile?.location ?? '');
    _bahasaCtrl = TextEditingController(text: profile?.languages ?? '');
  }

  @override
  void dispose() {
    _namaCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _spesialisasiCtrl.dispose();
    _bioCtrl.dispose();
    _lokasiCtrl.dispose();
    _bahasaCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final provider = context.read<PsychologistDashboardProvider>();
    try {
      await provider.updateProfileData({
        'nama': _namaCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'no_hp': _phoneCtrl.text.trim(),
        'spesialisasi': _spesialisasiCtrl.text.trim(),
        'bio': _bioCtrl.text.trim(),
        'lokasi': _lokasiCtrl.text.trim(),
        'bahasa': _bahasaCtrl.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Profil berhasil diperbarui!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memperbarui profil: $e'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
    if (mounted) setState(() => _isSaving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Edit Profil',
            info: 'Perbarui informasi profil Anda',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar
                    Center(
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, Color(0xFF003399)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
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
                            _namaCtrl.text.trim().isEmpty ? 'P'
                                : _namaCtrl.text.trim().split(' ').take(2).map((w) => w.isNotEmpty ? w[0].toUpperCase() : '').join(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    _buildSectionLabel('Informasi Dasar'),
                    const SizedBox(height: 12),
                    _buildCard([
                      _buildField(
                        controller: _namaCtrl,
                        label: 'Nama Lengkap',
                        icon: Icons.person_rounded,
                        validator: (v) => v == null || v.isEmpty ? 'Nama wajib diisi' : null,
                      ),
                      _buildDivider(),
                      _buildField(
                        controller: _emailCtrl,
                        label: 'Email',
                        icon: Icons.email_rounded,
                        keyboardType: TextInputType.emailAddress,
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Email wajib diisi';
                          if (!v.contains('@')) return 'Format email tidak valid';
                          return null;
                        },
                      ),
                      _buildDivider(),
                      _buildField(
                        controller: _phoneCtrl,
                        label: 'No. HP',
                        icon: Icons.phone_rounded,
                        keyboardType: TextInputType.phone,
                      ),
                    ]),

                    const SizedBox(height: 24),
                    _buildSectionLabel('Informasi Profesional'),
                    const SizedBox(height: 12),
                    _buildCard([
                      _buildField(
                        controller: _spesialisasiCtrl,
                        label: 'Spesialisasi',
                        icon: Icons.workspace_premium_rounded,
                        hint: 'Contoh: Psikologi Klinis',
                      ),
                      _buildDivider(),
                      _buildField(
                        controller: _lokasiCtrl,
                        label: 'Lokasi / Ruangan',
                        icon: Icons.location_on_rounded,
                        hint: 'Contoh: Ruang Konseling A',
                      ),
                      _buildDivider(),
                      _buildField(
                        controller: _bahasaCtrl,
                        label: 'Bahasa',
                        icon: Icons.language_rounded,
                        hint: 'Contoh: Indonesia, Inggris',
                      ),
                    ]),

                    const SizedBox(height: 24),
                    _buildSectionLabel('Bio / Deskripsi'),
                    const SizedBox(height: 12),
                    _buildCard([
                      _buildField(
                        controller: _bioCtrl,
                        label: 'Bio',
                        icon: Icons.notes_rounded,
                        maxLines: 4,
                        hint: 'Ceritakan sedikit tentang diri Anda...',
                      ),
                    ]),

                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              )
                            : const Text(
                                'Simpan Perubahan',
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                              ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: AppTextStyles.titleMd.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 12, offset: const Offset(0, 4))],
        border: Border.all(color: Colors.grey.withAlpha(20)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDivider() => Divider(height: 1, indent: 56, color: Colors.grey.withAlpha(25));

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: validator,
        style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF1E293B)),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey.withAlpha(120), fontSize: 13),
          labelStyle: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          errorBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }
}
