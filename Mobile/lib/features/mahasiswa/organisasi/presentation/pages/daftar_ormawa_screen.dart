import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';

class DaftarOrmawaScreen extends StatefulWidget {
  final String ormawaId;
  final String namaOrmawa;

  const DaftarOrmawaScreen({
    super.key,
    required this.ormawaId,
    required this.namaOrmawa,
  });

  @override
  State<DaftarOrmawaScreen> createState() => _DaftarOrmawaScreenState();
}

class _DaftarOrmawaScreenState extends State<DaftarOrmawaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _alasanController = TextEditingController();
  
  bool _isSubmitting = false;
  String? _lampiranPath;
  String? _lampiranName;

  @override
  void dispose() {
    _alasanController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      );

      if (result != null && result.files.single.path != null) {
        setState(() {
          _lampiranPath = result.files.single.path;
          _lampiranName = result.files.single.name;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal memilih file')),
        );
      }
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);

    try {
      await context.read<StudentProvider>().daftarOrmawa(
        widget.ormawaId,
        _alasanController.text,
        _lampiranPath,
      );
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 48),
              ),
              const SizedBox(height: 24),
              Text('Pendaftaran Berhasil!', style: AppTextStyles.h3),
              const SizedBox(height: 8),
              Text(
                'Anda berhasil mendaftar untuk ${widget.namaOrmawa}.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog
                    Navigator.pop(context); // Go back
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Tutup'),
                ),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Daftar ${widget.namaOrmawa}', style: AppTextStyles.h3.copyWith(color: AppColors.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Mengapa Anda ingin bergabung dengan ${widget.namaOrmawa}?',
                style: AppTextStyles.h4.copyWith(color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _alasanController,
                maxLines: 5,
                validator: (value) => value!.isEmpty ? 'Alasan wajib diisi' : null,
                decoration: InputDecoration(
                  hintText: 'Tuliskan motivasi dan alasan Anda...',
                  hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.textTertiary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: AppColors.surfaceVariant),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: AppColors.surfaceVariant),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Lampiran Pendukung (CV/Portofolio)',
                style: AppTextStyles.h4.copyWith(color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.surfaceVariant, style: BorderStyle.solid),
                ),
                child: Column(
                  children: [
                    Icon(Icons.file_upload_outlined, size: 40, color: AppColors.outline.withAlpha(50)),
                    const SizedBox(height: 12),
                    Text('Maksimal 10MB (PDF/JPG/PNG)', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline.withAlpha(50), fontSize: 10)),
                    if (_lampiranName != null) ...[
                      const SizedBox(height: 12),
                      Text('File terpilih: $_lampiranName', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary)),
                    ],
                    const SizedBox(height: 16),
                    InkWell(
                      onTap: _pickFile,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(_lampiranName == null ? 'Pilih File' : 'Ganti File', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 58,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    elevation: 4,
                  ),
                  child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        'Kirim Pendaftaran', 
                        style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.white)
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
