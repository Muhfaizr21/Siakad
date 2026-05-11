import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/scholarship.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class ApplyScholarshipScreen extends StatefulWidget {
  final Scholarship scholarship;

  const ApplyScholarshipScreen({super.key, required this.scholarship});

  @override
  State<ApplyScholarshipScreen> createState() => _ApplyScholarshipScreenState();
}

class _ApplyScholarshipScreenState extends State<ApplyScholarshipScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _nimController;
  late TextEditingController _ipkController;
  final _reasonController = TextEditingController();
  bool _isAgreed = false;

  @override
  void initState() {
    super.initState();
    final student = context.read<StudentProvider>();
    _nameController = TextEditingController(text: student.name);
    _nimController = TextEditingController(text: student.nim);
    _ipkController = TextEditingController(text: '3.85');
    
    // Jika statusnya sudah Applied, kita isi datanya (simulasi Edit)
    if (widget.scholarship.status == 'Applied') {
      _reasonController.text = 'Saya ingin mengembangkan diri dan berkontribusi lebih bagi kampus melalui program beasiswa ini. Saya memiliki rekam jejak akademik yang stabil dan aktif di organisasi kemahasiswaan.';
      _isAgreed = true;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _nimController.dispose();
    _ipkController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Form Pendaftaran', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FadeInAnimation(delay: 0.1, child: _buildScholarshipInfo()),
              const SizedBox(height: 32),
              
              FadeInAnimation(delay: 0.2, child: _buildSectionTitle('Data Akademik')),
              const SizedBox(height: 16),
              
              FadeInAnimation(delay: 0.3, child: _buildLabel('Nama Lengkap')),
              FadeInAnimation(delay: 0.35, child: _buildTextField(_nameController, 'Masukkan nama lengkap')),
              const SizedBox(height: 20),
              
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FadeInAnimation(delay: 0.4, child: _buildLabel('NIM')),
                        FadeInAnimation(delay: 0.45, child: _buildTextField(_nimController, 'Masukkan NIM')),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FadeInAnimation(delay: 0.5, child: _buildLabel('IPK Terakhir')),
                        FadeInAnimation(delay: 0.55, child: _buildTextField(_ipkController, 'Contoh: 3.85')),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              FadeInAnimation(delay: 0.6, child: _buildSectionTitle('Motivasi & Alasan')),
              const SizedBox(height: 12),
              FadeInAnimation(delay: 0.65, child: _buildTextArea(_reasonController, 'Jelaskan mengapa kamu layak menerima beasiswa ini...')),
              
              const SizedBox(height: 32),
              FadeInAnimation(delay: 0.7, child: _buildSectionTitle('Dokumen Pendukung')),
              const SizedBox(height: 16),
              FadeInAnimation(delay: 0.75, child: _buildUploadItem('KTM & KTP', Icons.badge_rounded)),
              FadeInAnimation(delay: 0.8, child: _buildUploadItem('Sertifikat Prestasi', Icons.emoji_events_rounded)),
              FadeInAnimation(delay: 0.85, child: _buildUploadItem('Transkrip Nilai', Icons.description_rounded)),
              
              const SizedBox(height: 32),
              FadeInAnimation(delay: 0.9, child: _buildAgreementCheckbox()),
              
              const SizedBox(height: 40),
              FadeInAnimation(delay: 1.0, child: _buildSubmitButton()),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScholarshipInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(15)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 10)]),
            child: const Icon(Icons.school_rounded, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.scholarship.title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                Text(widget.scholarship.provider, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary));
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(text, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Data ini wajib diisi' : null,
    );
  }

  Widget _buildTextArea(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      maxLines: 5,
      style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        contentPadding: const EdgeInsets.all(20),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Mohon isi alasan kamu' : null,
    );
  }

  Widget _buildUploadItem(String label, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.primary.withAlpha(5), shape: BoxShape.circle), child: Icon(icon, color: AppColors.primary, size: 20)),
                const SizedBox(width: 16),
                Text(label, style: AppTextStyles.labelMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                const Spacer(),
                const Icon(Icons.cloud_upload_outlined, color: AppColors.outline, size: 22),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAgreementCheckbox() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surfaceVariant.withAlpha(20), borderRadius: BorderRadius.circular(18)),
      child: InkWell(
        onTap: () => setState(() => _isAgreed = !_isAgreed),
        borderRadius: BorderRadius.circular(12),
        child: Row(
          children: [
            Checkbox(
              value: _isAgreed,
              onChanged: (val) => setState(() => _isAgreed = val!),
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Saya menyatakan bahwa semua data yang saya lampirkan adalah benar.',
                style: AppTextStyles.labelSm.copyWith(color: AppColors.onSurfaceVariant, height: 1.4, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: !_isAgreed ? null : () => _submitForm(),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.surfaceVariant,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: _isAgreed ? 4 : 0,
        ),
        child: Text(
          widget.scholarship.status == 'Applied' ? 'Simpan Perubahan' : 'Kirim Pendaftaran', 
          style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: Colors.white)
        ),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      context.read<StudentProvider>().applyForScholarship(widget.scholarship.id);
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.green.withAlpha(15), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 72),
            ),
            const SizedBox(height: 24),
            Text(
              widget.scholarship.status == 'Applied' ? 'Perubahan Disimpan!' : 'Pendaftaran Terkirim!', 
              style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)
            ),
            const SizedBox(height: 12),
            Text(
              widget.scholarship.status == 'Applied' 
                ? 'Data pendaftaran kamu telah berhasil diperbarui.'
                : 'Aplikasi beasiswa kamu telah masuk tahap Review Berkas. Pantau terus statusnya di menu Beasiswa.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.w500, height: 1.5),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
