import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';

class CreateProposalScreen extends StatefulWidget {
  final OrmawaProposal? initialProposal;
  const CreateProposalScreen({super.key, this.initialProposal});

  @override
  State<CreateProposalScreen> createState() => _CreateProposalScreenState();
}

class _CreateProposalScreenState extends State<CreateProposalScreen> {
  final _nameController = TextEditingController();
  final _budgetController = TextEditingController();
  final _descController = TextEditingController();

  final _landasanController = TextEditingController();
  final _bentukController = TextEditingController();
  final _mitraController = TextEditingController();
  final _pjController = TextEditingController();
  final _jadwalController = TextEditingController();
  final _sasaranController = TextEditingController();
  final _indikatorController = TextEditingController();
  final _sumberDanaController = TextEditingController();
  final _latarBelakangController = TextEditingController();
  final _tujuanController = TextEditingController();

  bool _isSubmitting = false;
  DateTime _selectedDate = DateTime.now();
  PlatformFile? _selectedFile;

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
      );

      if (result != null) {
        setState(() {
          _selectedFile = result.files.first;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal memilih file'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.initialProposal != null) {
      final p = widget.initialProposal!;
      _nameController.text = p.title;
      _budgetController.text = _formatNumber(p.budget.toInt().toString());
      _selectedDate = p.date;
      _descController.text = p.description ?? '';
      _landasanController.text = p.landasanKegiatan ?? '';
      _bentukController.text = p.bentukKegiatan ?? '';
      _mitraController.text = p.mitra ?? '';
      _pjController.text = p.pjKegiatan ?? '';
      _jadwalController.text = p.jadwalPelaksanaan ?? '';
      _sasaranController.text = p.sasaranKegiatan ?? '';
      _indikatorController.text = p.indikatorKeberhasilan ?? '';
      _sumberDanaController.text = p.sumberDana ?? '';
      _latarBelakangController.text = p.latarBelakang ?? '';
      _tujuanController.text = p.tujuanKegiatan ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _budgetController.dispose();
    _descController.dispose();
    _landasanController.dispose();
    _bentukController.dispose();
    _mitraController.dispose();
    _pjController.dispose();
    _jadwalController.dispose();
    _sasaranController.dispose();
    _indikatorController.dispose();
    _sumberDanaController.dispose();
    _latarBelakangController.dispose();
    _tujuanController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama kegiatan tidak boleh kosong'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    
    final provider = Provider.of<OrmawaProvider>(context, listen: false);
    final isEdit = widget.initialProposal != null;

    String? uploadedUrl = isEdit ? widget.initialProposal!.fileUrl : null;
    
    if (_selectedFile != null && _selectedFile!.path != null) {
      uploadedUrl = await provider.uploadFile(_selectedFile!.path!);
      if (uploadedUrl == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal mengunggah file. Silakan coba lagi.'), backgroundColor: Colors.red),
          );
          setState(() => _isSubmitting = false);
        }
        return;
      }
    }

    final proposal = OrmawaProposal(
      id: isEdit ? widget.initialProposal!.id : '',
      ormawaId: isEdit ? widget.initialProposal!.ormawaId : provider.ormawaId,
      mahasiswaId: isEdit ? widget.initialProposal!.mahasiswaId : provider.mahasiswaId,
      fakultasId: isEdit ? widget.initialProposal!.fakultasId : provider.fakultasId,
      title: _nameController.text,
      code: isEdit ? widget.initialProposal!.code : '',
      status: isEdit ? widget.initialProposal!.status : 'diajukan',
      date: _selectedDate,
      budget: double.tryParse(_budgetController.text.replaceAll('.', '')) ?? 0,
      description: _descController.text,
      landasanKegiatan: _landasanController.text,
      bentukKegiatan: _bentukController.text,
      mitra: _mitraController.text,
      pjKegiatan: _pjController.text,
      jadwalPelaksanaan: _jadwalController.text,
      sasaranKegiatan: _sasaranController.text,
      indikatorKeberhasilan: _indikatorController.text,
      sumberDana: _sumberDanaController.text,
      latarBelakang: _latarBelakangController.text,
      tujuanKegiatan: _tujuanController.text,
      fileUrl: uploadedUrl,
    );

    try {
      if (isEdit) {
        await provider.updateProposal(proposal);
      } else {
        await provider.addProposal(proposal);
      }
      
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isEdit ? 'Proposal berhasil diperbarui!' : 'Proposal berhasil diajukan ke Pihak Kampus!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      String errMsg = e.toString();
      if (e is DioException && e.response?.data != null) {
        final data = e.response!.data;
        if (data is Map && (data.containsKey('message') || data.containsKey('Message'))) {
          errMsg = (data['message'] ?? data['Message']).toString();
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan proposal: $errMsg'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: widget.initialProposal != null ? 'EDIT PROPOSAL' : 'BUAT PROPOSAL BARU',
            variant: AppBarVariant.ormawa,
            showBackButton: true,
            isExpandable: false,
            showNotification: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Informasi Dasar'),
                  const SizedBox(height: 16),
                  _buildTextField('Nama Kegiatan', 'Contoh: Seminar Nasional IT 2026', Icons.event_rounded, controller: _nameController),
                  const SizedBox(height: 16),
                  _buildTextField('Landasan Kegiatan', 'Contoh: Program Kerja Himpunan 2026', Icons.foundation_rounded, controller: _landasanController),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildTextField('Bentuk Kegiatan', 'Kompetisi, Seminar...', Icons.category_rounded, controller: _bentukController)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField('PJ Kegiatan', 'Nama penanggung jawab', Icons.person_rounded, controller: _pjController)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  _buildSectionTitle('Pelaksanaan'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextField('Tanggal Kegiatan', '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}', Icons.calendar_today_rounded, isReadOnly: true, onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2101),
                          );
                          if (picked != null) {
                            setState(() => _selectedDate = picked);
                          }
                        }),
                      ),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField('Jadwal Pelaksanaan', 'Contoh: 08:00 - Selesai', Icons.access_time_rounded, controller: _jadwalController)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildTextField('Mitra', 'Contoh: Seluruh LK dan UKM KEMA', Icons.handshake_rounded, controller: _mitraController),
                  const SizedBox(height: 16),
                  _buildTextField('Sasaran Kegiatan', 'Contoh: Mahasiswa Aktif Fakultas', Icons.group_rounded, controller: _sasaranController),
                  const SizedBox(height: 24),

                  _buildSectionTitle('Detail Khusus'),
                  const SizedBox(height: 16),
                  _buildTextField('Latar Belakang', 'Uraikan latar belakang...', Icons.subject_rounded, maxLines: 4, controller: _latarBelakangController),
                  const SizedBox(height: 16),
                  _buildTextField('Tujuan Kegiatan', 'Uraikan tujuan...', Icons.track_changes_rounded, maxLines: 3, controller: _tujuanController),
                  const SizedBox(height: 16),
                  _buildTextField('Indikator Keberhasilan', 'Uraikan target keberhasilan...', Icons.analytics_rounded, maxLines: 3, controller: _indikatorController),
                  const SizedBox(height: 16),
                  _buildTextField('Deskripsi Kegiatan', 'Jelaskan gambaran umum kegiatan...', Icons.description_rounded, maxLines: 4, controller: _descController),
                  const SizedBox(height: 24),
                  
                  _buildSectionTitle('Anggaran & Berkas'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildTextField('Total Anggaran', '0', Icons.payments_rounded, keyboardType: TextInputType.number, controller: _budgetController, isPrice: true)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField('Sumber Dana', 'Contoh: Kas Himpunan & Fakultas', Icons.account_balance_wallet_rounded, controller: _sumberDanaController)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildFileUploadBox(),
                  
                  const SizedBox(height: 32),
                  _buildSubmitButton(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: AppTextStyles.labelMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 4),
        Container(width: 40, height: 3, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
      ],
    );
  }

  Widget _buildTextField(String label, String hint, IconData icon, {bool isReadOnly = false, int maxLines = 1, TextInputType keyboardType = TextInputType.text, TextEditingController? controller, VoidCallback? onTap, bool isPrice = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: EdgeInsets.only(
                    left: 16,
                    top: maxLines > 1 ? 16 : 14,
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 20),
                ),
                Expanded(
                  child: TextField(
                    controller: controller,
                    enabled: !isReadOnly,
                    maxLines: maxLines,
                    keyboardType: keyboardType,
                    inputFormatters: isPrice ? [ThousandsSeparatorInputFormatter()] : null,
                    style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.outline.withAlpha(100)),
                      prefixText: isPrice ? 'Rp ' : null,
                      prefixStyle: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: Colors.black),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.only(
                        left: 12,
                        right: 16,
                        top: maxLines > 1 ? 16 : 12,
                        bottom: maxLines > 1 ? 16 : 12,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFileUploadBox() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upload Dokumen (Opsional)',
          style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickFile,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withAlpha(30), style: BorderStyle.solid),
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_upload_outlined, color: AppColors.primary, size: 32),
                const SizedBox(height: 12),
                Text(
                  _selectedFile != null ? _selectedFile!.name : (widget.initialProposal?.fileUrl != null && widget.initialProposal!.fileUrl!.isNotEmpty ? 'File sudah terunggah (Ketuk untuk ganti)' : 'Ketuk untuk pilih file'),
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (_selectedFile == null && (widget.initialProposal?.fileUrl == null || widget.initialProposal!.fileUrl!.isEmpty))
                  Text(
                    'Maksimal ukuran file: 10MB (PDF/DOC)',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _handleSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 4,
          shadowColor: AppColors.primary.withAlpha(100),
        ),
        child: _isSubmitting 
          ? const CircularProgressIndicator(color: Colors.white)
            : Text(
                widget.initialProposal != null ? 'SIMPAN PERUBAHAN' : 'AJUKAN PROPOSAL',
                style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
      ),
    );
  }
}

String _formatNumber(String value) {
  String cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
  if (cleaned.isEmpty) return '';
  final buffer = StringBuffer();
  for (int i = 0; i < cleaned.length; i++) {
    if (i > 0 && (cleaned.length - i) % 3 == 0) {
      buffer.write('.');
    }
    buffer.write(cleaned[i]);
  }
  return buffer.toString();
}

class ThousandsSeparatorInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }

    String cleanedText = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanedText.isEmpty) {
      return newValue.copyWith(text: '');
    }

    final buffer = StringBuffer();
    for (int i = 0; i < cleanedText.length; i++) {
      if (i > 0 && (cleanedText.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(cleanedText[i]);
    }

    final newText = buffer.toString();
    return newValue.copyWith(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }
}
