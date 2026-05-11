import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
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
  bool _isSubmitting = false;

  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    if (widget.initialProposal != null) {
      _nameController.text = widget.initialProposal!.title;
      _budgetController.text = widget.initialProposal!.budget.toString();
      _selectedDate = widget.initialProposal!.date;
      _descController.text = widget.initialProposal!.description ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _budgetController.dispose();
    _descController.dispose();
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

    final proposal = OrmawaProposal(
      id: isEdit ? widget.initialProposal!.id : '',
      ormawaId: isEdit ? widget.initialProposal!.ormawaId : provider.ormawaId,
      mahasiswaId: isEdit ? widget.initialProposal!.mahasiswaId : provider.mahasiswaId,
      fakultasId: isEdit ? widget.initialProposal!.fakultasId : provider.fakultasId,
      title: _nameController.text,
      code: isEdit ? widget.initialProposal!.code : '',
      status: isEdit ? widget.initialProposal!.status : 'diajukan',
      date: _selectedDate,
      budget: double.tryParse(_budgetController.text) ?? 0,
      description: _descController.text,
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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan proposal: $e'), backgroundColor: Colors.red),
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
      body: Column(
        children: [
          BkuStaticAppBar(
            title: widget.initialProposal != null ? 'EDIT PROPOSAL' : 'BUAT PROPOSAL BARU',
            variant: AppBarVariant.ormawa,
            showBackButton: true,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Informasi Dasar'),
                  const SizedBox(height: 16),
                  _buildTextField('Nama Kegiatan', 'Contoh: Seminar Nasional IT 2026', Icons.event_rounded, controller: _nameController),
                  const SizedBox(height: 16),
                  _buildTextField('Tanggal Kegiatan', '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}', Icons.calendar_today_rounded, isReadOnly: true, onTap: () async {
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
                  const SizedBox(height: 24),
                  
                  _buildSectionTitle('Rencana Anggaran'),
                  const SizedBox(height: 16),
                  _buildTextField('Total Anggaran', 'Rp 0', Icons.payments_rounded, keyboardType: TextInputType.number, controller: _budgetController),
                  const SizedBox(height: 24),
                  
                  _buildSectionTitle('Deskripsi & Dokumen'),
                  const SizedBox(height: 16),
                  _buildTextField('Deskripsi Singkat', 'Jelaskan tujuan kegiatan...', Icons.description_rounded, maxLines: 4, controller: _descController),
                  const SizedBox(height: 16),
                  _buildFileUploadBox(),
                  
                  const SizedBox(height: 40),
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
    return Text(
      title,
      style: AppTextStyles.labelMd.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildTextField(String label, String hint, IconData icon, {bool isReadOnly = false, int maxLines = 1, TextInputType keyboardType = TextInputType.text, TextEditingController? controller, VoidCallback? onTap}) {
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
            child: TextField(
              controller: controller,
              enabled: !isReadOnly,
              maxLines: maxLines,
              keyboardType: keyboardType,
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.outline.withAlpha(100)),
                prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
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
          'Upload Draft Proposal (PDF)',
          style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 32),
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
                'Ketuk untuk pilih file',
                style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              Text(
                'Maksimal ukuran file: 10MB',
                style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
              ),
            ],
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
