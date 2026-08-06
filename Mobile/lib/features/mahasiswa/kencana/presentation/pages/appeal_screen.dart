import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class AppealScreen extends StatefulWidget {
  const AppealScreen({super.key});

  @override
  State<AppealScreen> createState() => _AppealScreenState();
}

class _AppealScreenState extends State<AppealScreen> {
  final TextEditingController _descController = TextEditingController();
  String _selectedCategory = 'Kendala Teknis';
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Pengajuan Banding', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FadeInAnimation(delay: 0.1, child: _buildInfoCard()),
            const SizedBox(height: 32),
            FadeInAnimation(delay: 0.2, child: _buildLabel('Kategori Kendala')),
            const SizedBox(height: 12),
            FadeInAnimation(delay: 0.3, child: _buildCategorySelector()),
            const SizedBox(height: 32),
            FadeInAnimation(delay: 0.4, child: _buildLabel('Detail Penjelasan')),
            const SizedBox(height: 12),
            FadeInAnimation(delay: 0.5, child: _buildDescriptionField()),
            const SizedBox(height: 32),
            FadeInAnimation(delay: 0.6, child: _buildLabel('Lampiran Bukti')),
            const SizedBox(height: 12),
            FadeInAnimation(delay: 0.7, child: _buildUploadSection()),
            const SizedBox(height: 48),
            FadeInAnimation(delay: 0.8, child: _buildSubmitButton()),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 13));
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withAlpha(15)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 10)]),
            child: const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Banding akan ditinjau oleh Admin PKKMB dalam 1-3 hari kerja.',
              style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelector() {
    final categories = ['Kendala Teknis', 'Nilai Tidak Sesuai', 'Tugas Belum Tercatat', 'Lainnya'];
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: categories.map((cat) {
        bool isSelected = _selectedCategory == cat;
        return GestureDetector(
          onTap: () => setState(() => _selectedCategory = cat),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isSelected ? AppColors.primary : AppColors.surfaceVariant, width: 1.5),
              boxShadow: isSelected ? [BoxShadow(color: AppColors.primary.withAlpha(30), blurRadius: 10, offset: const Offset(0, 4))] : [],
            ),
            child: Text(
              cat,
              style: AppTextStyles.labelSm.copyWith(
                color: isSelected ? Colors.white : AppColors.onSurface,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDescriptionField() {
    return TextField(
      controller: _descController,
      maxLines: 6,
      style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
      decoration: InputDecoration(
        hintText: 'Jelaskan secara detail kendala yang kamu alami...',
        hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.surfaceVariant, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        contentPadding: const EdgeInsets.all(20),
      ),
    );
  }

  Widget _buildUploadSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.primary.withAlpha(5), shape: BoxShape.circle),
            child: const Icon(Icons.cloud_upload_outlined, size: 32, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text('Upload Screenshot atau File', style: AppTextStyles.labelMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text('Maks. 5MB (JPG, PNG, PDF)', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _isSubmitting
            ? null
            : () async {
                final desc = _descController.text.trim();
                if (desc.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Detail penjelasan tidak boleh kosong')),
                  );
                  return;
                }

                setState(() => _isSubmitting = true);
                try {
                  final alasan = "[$_selectedCategory] $desc";
                  await context.read<StudentProvider>().submitAppeal(alasan);
                  if (mounted) {
                    _showSuccessBottomSheet();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Gagal mengirim banding: ${e.toString().replaceAll('Exception: ', '')}')),
                    );
                  }
                } finally {
                  if (mounted) {
                    setState(() => _isSubmitting = false);
                  }
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withAlpha(100),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : Text('Kirim Pengajuan Banding', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: Colors.white)),
      ),
    );
  }

  void _showSuccessBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(10))),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.green.withAlpha(15), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 72),
            ),
            const SizedBox(height: 24),
            Text('Banding Terkirim!', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
            const SizedBox(height: 12),
            Text(
              'Pengajuan kamu telah diterima dan sedang dalam antrean peninjauan admin. Cek berkala email atau notifikasi kamu.',
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
                child: const Text('Kembali ke Kencana', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
