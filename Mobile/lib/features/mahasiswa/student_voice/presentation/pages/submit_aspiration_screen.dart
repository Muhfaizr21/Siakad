import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/aspiration.dart';

class SubmitAspirationScreen extends StatefulWidget {
  const SubmitAspirationScreen({super.key});

  @override
  State<SubmitAspirationScreen> createState() => _SubmitAspirationScreenState();
}

class _SubmitAspirationScreenState extends State<SubmitAspirationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedCategory = 'Fasilitas';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Sampaikan Aspirasi', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('Pilih Kategori'),
              const SizedBox(height: 12),
              _buildCategorySelector(),
              const SizedBox(height: 32),
              _buildSectionTitle('Apa yang ingin kamu sampaikan?'),
              const SizedBox(height: 12),
              _buildLabel('Judul Aspirasi'),
              _buildTextField(_titleController, 'Contoh: Kerusakan Kursi di Kantin'),
              const SizedBox(height: 20),
              _buildLabel('Detail Aspirasi'),
              _buildTextArea(_descController, 'Ceritakan lebih detail mengenai saran atau keluhanmu...'),
              const SizedBox(height: 32),
              _buildSectionTitle('Lampirkan Bukti (Opsional)'),
              const SizedBox(height: 12),
              _buildUploadSection(),
              const SizedBox(height: 48),
              _buildSubmitButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.titleLg.copyWith(fontSize: 18));
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(text, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildCategorySelector() {
    final categories = ['Fasilitas', 'Akademik', 'Organisasi', 'Lainnya'];
    return Wrap(
      spacing: 8,
      children: categories.map((cat) {
        bool isSelected = _selectedCategory == cat;
        return ChoiceChip(
          label: Text(cat),
          selected: isSelected,
          onSelected: (selected) {
            if (selected) setState(() => _selectedCategory = cat);
          },
          selectedColor: AppColors.primary,
          labelStyle: AppTextStyles.labelSm.copyWith(
            color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSelected ? Colors.transparent : AppColors.surfaceVariant)),
        );
      }).toList(),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      style: AppTextStyles.labelMd,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Mohon isi judul' : null,
    );
  }

  Widget _buildTextArea(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      maxLines: 6,
      style: AppTextStyles.labelMd,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Mohon isi detail aspirasi' : null,
    );
  }

  Widget _buildUploadSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant, style: BorderStyle.solid),
      ),
      child: Column(
        children: [
          Icon(Icons.add_a_photo_rounded, size: 40, color: AppColors.outline.withAlpha(50)),
          const SizedBox(height: 12),
          Text('Klik untuk unggah Foto atau Video', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
          const SizedBox(height: 4),
          Text('Maksimal 10MB', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline.withAlpha(50), fontSize: 10)),
          const SizedBox(height: 16),
          InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Membuka Kamera/Galeri...')),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text('Pilih File', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton(
        onPressed: () => _submitForm(),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 4,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.send_rounded, size: 20, color: Colors.white),
            const SizedBox(width: 12),
            Text('Kirim Aspirasi', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final newAsp = Aspiration(
        id: 'ASP${DateTime.now().millisecondsSinceEpoch}',
        category: _selectedCategory,
        title: _titleController.text,
        description: _descController.text,
        date: DateTime.now(),
        status: 'Pending',
      );
      context.read<StudentProvider>().addAspiration(newAsp);
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            Text('Aspirasi Terkirim!', style: AppTextStyles.titleLg),
            const SizedBox(height: 12),
            Text(
              'Terima kasih! Suaramu sangat berharga untuk BKU yang lebih baik. Kami akan segera meninjau aspirasimu.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Kembali', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
