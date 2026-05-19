import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/scholarship.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/services/api_gate.dart';

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
  
  String? _ktmKtpPath;
  String? _sertifikatPath;
  String? _transkripPath;

  Future<void> _pickFile(String type) async {
    try {
      FocusScope.of(context).unfocus();
      debugPrint('Picking file for type: $type');
      FilePickerResult? result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      if (result != null && result.files.single.path != null) {
        setState(() {
          if (type == 'ktm_ktp') {
            _ktmKtpPath = result.files.single.path;
          } else if (type == 'sertifikat') {
            _sertifikatPath = result.files.single.path;
          } else if (type == 'transkrip') {
            _transkripPath = result.files.single.path;
          }
        });
      }
    } catch (e) {
      debugPrint('Error picking file: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    final student = context.read<StudentProvider>();
    _nameController = TextEditingController(text: student.name);
    _nimController = TextEditingController(text: student.nim);
    _ipkController = TextEditingController(text: student.ipk.toString());
    
    // Jika statusnya sudah Applied, kita isi datanya dari database
    if (widget.scholarship.status == 'Applied') {
      _reasonController.text = widget.scholarship.motivasi ?? '';
      _isAgreed = true;
      _ktmKtpPath = widget.scholarship.ktmKtpUrl;
      _sertifikatPath = widget.scholarship.sertifikatUrl;
      _transkripPath = widget.scholarship.transkripUrl;
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
              FadeInAnimation(delay: 0.75, child: _buildUploadItem('KTM & KTP', Icons.badge_rounded, _ktmKtpPath, 'ktm_ktp')),
              FadeInAnimation(delay: 0.8, child: _buildUploadItem('Sertifikat Prestasi', Icons.emoji_events_rounded, _sertifikatPath, 'sertifikat')),
              FadeInAnimation(delay: 0.85, child: _buildUploadItem('Transkrip Nilai', Icons.description_rounded, _transkripPath, 'transkrip')),
              
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

  void _viewDocument(String label, String filePath) {
    final isNetwork = filePath.startsWith('/uploads');
    final cleanPath = isNetwork
        ? '${ApiGate.baseUrl.replaceAll('/api', '')}$filePath'
        : filePath;
    final ext = filePath.split('.').last.toLowerCase();
    final isImage = ['jpg', 'jpeg', 'png'].contains(ext);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      label, 
                      style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, fontSize: 16),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.5,
                maxWidth: MediaQuery.of(context).size.width * 0.85,
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: isImage
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: isNetwork
                            ? Image.network(
                                cleanPath,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(20.0),
                                    child: Text('Gagal memuat gambar dari server', textAlign: TextAlign.center),
                                  ),
                                ),
                              )
                            : Image.file(
                                File(cleanPath),
                                fit: BoxFit.contain,
                              ),
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.picture_as_pdf_rounded, size: 80, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(
                            filePath.split('/').last, 
                            textAlign: TextAlign.center, 
                            style: AppTextStyles.labelSm.copyWith(color: AppColors.onSurfaceVariant),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Dokumen PDF tidak dapat ditampilkan langsung. Ketuk "Ganti Dokumen" jika ingin mengubah berkas.', 
                            textAlign: TextAlign.center,
                            style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showActionSheet(String label, String type, String filePath) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                child: Text(
                  label,
                  style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.visibility_outlined, color: AppColors.primary),
                title: Text('Lihat Dokumen', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(context);
                  _viewDocument(label, filePath);
                },
              ),
              ListTile(
                leading: const Icon(Icons.cached_rounded, color: Colors.blue),
                title: Text('Ganti Dokumen', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(context);
                  _pickFile(type);
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                title: Text('Hapus Dokumen', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w600, color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    if (type == 'ktm_ktp') {
                      _ktmKtpPath = null;
                    } else if (type == 'sertifikat') {
                      _sertifikatPath = null;
                    } else if (type == 'transkrip') {
                      _transkripPath = null;
                    }
                  });
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  Widget _buildUploadItem(String label, IconData icon, String? filePath, String type) {
    final fileName = filePath != null ? filePath.replaceAll('\\', '/').split('/').last : null;
    final ext = filePath != null ? filePath.split('.').last.toLowerCase() : '';
    final isImage = filePath != null && ['jpg', 'jpeg', 'png'].contains(ext);
    final isNetwork = filePath != null && filePath.startsWith('/uploads');
    final cleanPath = filePath != null && isNetwork
        ? '${ApiGate.baseUrl.replaceAll('/api', '')}$filePath'
        : filePath;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: filePath != null ? Colors.green.shade200 : AppColors.surfaceVariant, 
          width: 1.5
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (filePath != null) {
              _showActionSheet(label, type, filePath);
            } else {
              _pickFile(type);
            }
          },
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Thumbnail or Icon Container
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: filePath != null 
                      ? (isImage ? Colors.grey.shade100 : Colors.red.withOpacity(0.05))
                      : AppColors.primary.withAlpha(5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: filePath != null ? Colors.grey.shade200 : Colors.transparent,
                      width: 1
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: filePath != null
                      ? (isImage
                          ? (isNetwork
                              ? Image.network(
                                  cleanPath!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image_rounded, color: Colors.grey),
                                )
                              : Image.file(
                                  File(cleanPath!),
                                  fit: BoxFit.cover,
                                ))
                          : const Icon(Icons.picture_as_pdf_rounded, color: Colors.red, size: 28))
                      : Icon(icon, color: AppColors.primary, size: 24),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(label, style: AppTextStyles.labelMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      if (fileName != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          fileName,
                          style: AppTextStyles.labelSm.copyWith(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.w500),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ] else ...[
                        const SizedBox(height: 4),
                        Text(
                          'Ketuk untuk mengunggah dokumen',
                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 11),
                        ),
                      ],
                    ],
                  ),
                ),
                if (filePath != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle_rounded, color: Colors.green.shade700, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'Selesai',
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.green.shade700,
                            fontWeight: FontWeight.bold,
                            fontSize: 10
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                Icon(
                  filePath != null ? Icons.more_vert_rounded : Icons.cloud_upload_outlined, 
                  color: filePath != null ? Colors.grey : AppColors.outline, 
                  size: 22
                ),
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

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      // Tampilkan loading overlay
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );

      try {
        await context.read<StudentProvider>().applyForScholarship(
          widget.scholarship.id, 
          _reasonController.text,
          ktmKtpPath: _ktmKtpPath,
          sertifikatPath: _sertifikatPath,
          transkripPath: _transkripPath,
        );
        
        // Tutup loading overlay
        if (mounted) Navigator.pop(context);
        
        // Tampilkan dialog sukses
        _showSuccessDialog();
      } catch (e) {
        // Tutup loading overlay
        if (mounted) Navigator.pop(context);
        
        // Tampilkan pesan error
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gagal: ${e.toString().replaceAll('Exception: ', '')}'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          );
        }
      }
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
