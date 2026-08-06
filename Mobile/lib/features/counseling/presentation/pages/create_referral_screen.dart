import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/referral_provider.dart';

class CreateReferralScreen extends StatefulWidget {
  final String? studentId;

  const CreateReferralScreen({super.key, this.studentId});

  @override
  State<CreateReferralScreen> createState() => _CreateReferralScreenState();
}

class _CreateReferralScreenState extends State<CreateReferralScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonCtrl = TextEditingController();
  final _targetCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  int? _selectedStudentId;
  String _selectedType = 'Medis';
  final List<String> _referralTypes = ['Medis', 'Akademik'];

  @override
  void initState() {
    super.initState();
    if (widget.studentId != null) {
      _selectedStudentId = int.tryParse(widget.studentId!);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final counselingProvider = context.read<CounselingProvider>();
      if (counselingProvider.patients.isEmpty) {
        counselingProvider.loadPatients();
      }
    });
  }

  @override
  void dispose() {
    _reasonCtrl.dispose();
    _targetCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      bottomNavigationBar: _buildBottomActions(),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Buat Rujukan Baru',
            info: 'Isi detail surat rujukan mahasiswa di bawah ini',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionTitle('Pilih Pasien'),
                    const SizedBox(height: 16),
                    _buildStudentSelector(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Detail Rujukan'),
                    const SizedBox(height: 16),
                    _buildDropdownField('Tipe Rujukan', _referralTypes),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'Alasan Rujukan',
                      hint:
                          'Tulis deskripsi klinis singkat dan alasan perlunya rujukan...',
                      controller: _reasonCtrl,
                      maxLines: 5,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Alasan rujukan wajib diisi';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'Pihak Tujuan',
                      hint: 'Contoh: RS Jiwa Dr. Soeharto Heerdjan',
                      controller: _targetCtrl,
                      icon: Icons.business_rounded,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Pihak tujuan wajib diisi';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      label: 'Email Tujuan',
                      hint: 'Contoh: rujukan@rsj.com',
                      controller: _emailCtrl,
                      icon: Icons.email_rounded,
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Email tujuan wajib diisi';
                        }
                        final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
                        if (!emailRegex.hasMatch(value.trim())) {
                          return 'Format email tidak valid';
                        }
                        return null;
                      },
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: const Color(0xFF0F172A),
        fontWeight: FontWeight.w900,
      ),
    );
  }

  Widget _buildStudentSelector() {
    return Consumer<CounselingProvider>(
      builder: (context, provider, child) {
        if (provider.patientsLoading) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
          );
        }

        final patients = provider.patients;
        if (patients.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.withAlpha(10),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.red.withAlpha(30)),
            ),
            child: Text(
              'Tidak ada mahasiswa aktif untuk dirujuk.',
              style: AppTextStyles.bodyMd.copyWith(color: Colors.red[800]),
            ),
          );
        }

        // Check if preselected student exists in list
        final hasPreselected =
            widget.studentId != null &&
            patients.any((p) => p['id'].toString() == widget.studentId);

        if (hasPreselected) {
          final patient = patients.firstWhere(
            (p) => p['id'].toString() == widget.studentId,
          );
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.withAlpha(40)),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: Icon(Icons.person_rounded, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        patient['name']?.toString() ?? '',
                        style: AppTextStyles.bodyLg.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'NIM: ${patient['nim']?.toString() ?? ''}',
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.lock_rounded, color: Colors.grey, size: 18),
              ],
            ),
          );
        }

        return DropdownButtonFormField<int>(
          value: _selectedStudentId,
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppColors.primary,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            prefixIcon: const Icon(
              Icons.person_outline_rounded,
              color: AppColors.primary,
              size: 20,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
          ),
          hint: Text(
            'Pilih Pasien',
            style: AppTextStyles.bodyMd.copyWith(
              color: const Color(0xFF94A3B8),
            ),
          ),
          validator: (value) {
            if (value == null) {
              return 'Harap pilih mahasiswa';
            }
            return null;
          },
          items:
              patients.map((patient) {
                final id = int.tryParse(patient['id'].toString()) ?? 0;
                final name = patient['name']?.toString() ?? '';
                final nim = patient['nim']?.toString() ?? '';
                return DropdownMenuItem<int>(
                  value: id,
                  child: Text(
                    '$name ($nim)',
                    style: AppTextStyles.bodyMd.copyWith(
                      color: const Color(0xFF1E293B),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
          onChanged: (value) {
            setState(() {
              _selectedStudentId = value;
            });
          },
        );
      },
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    required TextEditingController controller,
    IconData? icon,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMd.copyWith(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF1E293B)),
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.bodyMd.copyWith(
              color: const Color(0xFF94A3B8),
            ),
            filled: true,
            fillColor: Colors.white,
            prefixIcon:
                icon != null
                    ? Icon(icon, color: AppColors.primary, size: 20)
                    : null,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField(String label, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMd.copyWith(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedType,
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppColors.primary,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            prefixIcon: const Icon(
              Icons.category_rounded,
              color: AppColors.primary,
              size: 20,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(50)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
          ),
          items:
              items.map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(
                    value,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: const Color(0xFF1E293B),
                    ),
                  ),
                );
              }).toList(),
          onChanged: (newValue) {
            if (newValue != null) {
              setState(() {
                _selectedType = newValue;
              });
            }
          },
        ),
      ],
    );
  }

  Widget _buildBottomActions() {
    return Consumer<ReferralProvider>(
      builder: (context, provider, child) {
        final isLoading = provider.isCreating;
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(10),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  flex: 1,
                  child: OutlinedButton(
                    onPressed: isLoading ? null : () => context.pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(
                        color: AppColors.primary,
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Batal',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child:
                        isLoading
                            ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                            : const Text(
                              'Simpan Rujukan',
                              style: TextStyle(fontWeight: FontWeight.w900),
                            ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedStudentId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Harap pilih mahasiswa terlebih dahulu'),
          ),
        );
        return;
      }

      final provider = context.read<ReferralProvider>();
      final success = await provider.createReferral(
        mahasiswaId: _selectedStudentId!,
        tipe: _selectedType,
        alasan: _reasonCtrl.text.trim(),
        pihakTujuan: _targetCtrl.text.trim(),
        emailTujuan: _emailCtrl.text.trim(),
      );

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Rujukan berhasil dibuat!'),
              backgroundColor: AppColors.primary,
            ),
          );
          context.pop();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                provider.error ?? 'Gagal membuat rujukan. Silakan coba lagi.',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
}
