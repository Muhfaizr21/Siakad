import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/achievement.dart';

class ReportAchievementScreen extends StatefulWidget {
  const ReportAchievementScreen({super.key});

  @override
  State<ReportAchievementScreen> createState() => _ReportAchievementScreenState();
}

class _ReportAchievementScreenState extends State<ReportAchievementScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _organizerController = TextEditingController();
  String _selectedLevel = 'Nasional';
  String _selectedRank = 'Juara 1';
  DateTime _selectedDate = DateTime.now();

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
        title: Text('Lapor Prestasi Baru', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildInfoBanner(),
              const SizedBox(height: 32),
              _buildLabel('Nama Prestasi / Judul Kegiatan'),
              _buildTextField(_titleController, 'Contoh: Juara 1 Lomba Karya Tulis Ilmiah'),
              const SizedBox(height: 24),
              _buildLabel('Penyelenggara'),
              _buildTextField(_organizerController, 'Contoh: Universitas Indonesia / Kemdikbud'),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(child: _buildDropdown('Tingkat', ['Internasional', 'Nasional', 'Provinsi', 'Kampus'], (val) => setState(() => _selectedLevel = val!))),
                  const SizedBox(width: 16),
                  Expanded(child: _buildDropdown('Peringkat', ['Juara 1', 'Juara 2', 'Juara 3', 'Harapan', 'Finalis', 'Peserta'], (val) => setState(() => _selectedRank = val!))),
                ],
              ),
              const SizedBox(height: 24),
              _buildLabel('Tanggal Perolehan'),
              _buildDatePicker(),
              const SizedBox(height: 32),
              _buildLabel('Lampiran Sertifikat (Foto/PDF)'),
              _buildUploadSection(),
              const SizedBox(height: 48),
              _buildSubmitButton(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.sync_rounded, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Data yang kamu input akan otomatis disinkronkan ke sistem Simkatmawa setelah divalidasi oleh Admin.',
              style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(text, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.onSurface)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Data ini wajib diisi' : null,
    );
  }

  Widget _buildDropdown(String label, List<String> items, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        DropdownButtonFormField<String>(
          value: items.contains(_selectedLevel) && label == 'Tingkat' ? _selectedLevel : (label == 'Peringkat' ? _selectedRank : items[0]),
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: AppTextStyles.labelMd))).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.surfaceVariant)),
          ),
        ),
      ],
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(context: context, initialDate: _selectedDate, firstDate: DateTime(2020), lastDate: DateTime.now());
        if (date != null) setState(() => _selectedDate = date);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.surfaceVariant),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}', style: AppTextStyles.labelMd),
            const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant, style: BorderStyle.solid),
      ),
      child: Column(
        children: [
          const Icon(Icons.file_upload_outlined, size: 48, color: AppColors.outline),
          const SizedBox(height: 12),
          Text('Upload Sertifikat / Piagam', style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant)),
          Text('Maks 5MB (PDF, JPG, PNG)', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton(
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            final newAchievement = Achievement(
              id: 'A${DateTime.now().millisecondsSinceEpoch}',
              title: _titleController.text,
              organizer: _organizerController.text,
              level: _selectedLevel,
              rank: _selectedRank,
              date: _selectedDate,
              status: 'Pending',
              isSynced: false,
            );
            context.read<StudentProvider>().addAchievement(newAchievement);
            _showSuccessDialog();
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 0,
        ),
        child: Text('Kirim Laporan Prestasi', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            Text('Laporan Terkirim!', style: AppTextStyles.titleLg),
            const SizedBox(height: 12),
            Text(
              'Laporan prestasi kamu telah masuk antrean validasi Admin. Kamu akan menerima notifikasi jika status berubah.',
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
                child: const Text('Kembali ke Portofolio'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
