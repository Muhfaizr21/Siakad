import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/organization_history.dart';
import 'package:intl/intl.dart';

class AddOrganisasiScreen extends StatefulWidget {
  final OrganizationHistory? organization;

  const AddOrganisasiScreen({super.key, this.organization});

  @override
  State<AddOrganisasiScreen> createState() => _AddOrganisasiScreenState();
}

class _AddOrganisasiScreenState extends State<AddOrganisasiScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _namaController = TextEditingController();
  final _jabatanController = TextEditingController();
  final _deskripsiController = TextEditingController();
  final _apresiasiController = TextEditingController();
  
  String _tipe = 'Internal';
  DateTime? _periodeMulai;
  DateTime? _periodeSelesai;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.organization != null) {
      _namaController.text = widget.organization!.namaOrganisasi;
      _jabatanController.text = widget.organization!.jabatan;
      _deskripsiController.text = widget.organization!.deskripsiKegiatan;
      if (widget.organization!.apresiasi != null) {
        _apresiasiController.text = widget.organization!.apresiasi!;
      }
      _tipe = widget.organization!.tipe;
      
      try {
        _periodeMulai = DateTime.parse(widget.organization!.periodeMulai);
      } catch (_) {}
      
      if (widget.organization!.periodeSelesai != null) {
        try {
          _periodeSelesai = DateTime.parse(widget.organization!.periodeSelesai!);
        } catch (_) {}
      }
    }
  }

  @override
  void dispose() {
    _namaController.dispose();
    _jabatanController.dispose();
    _deskripsiController.dispose();
    _apresiasiController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final initialDate = isStart 
        ? (_periodeMulai ?? DateTime.now()) 
        : (_periodeSelesai ?? _periodeMulai ?? DateTime.now());
        
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _periodeMulai = picked;
          if (_periodeSelesai != null && _periodeSelesai!.isBefore(picked)) {
            _periodeSelesai = null;
          }
        } else {
          _periodeSelesai = picked;
        }
      });
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    if (_periodeMulai == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Periode Mulai harus diisi')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final dateFormat = DateFormat('yyyy-MM-dd');
      final org = OrganizationHistory(
        id: widget.organization?.id ?? 'ORG${DateTime.now().millisecondsSinceEpoch}',
        namaOrganisasi: _namaController.text,
        tipe: _tipe,
        jabatan: _jabatanController.text,
        periodeMulai: dateFormat.format(_periodeMulai!),
        periodeSelesai: _periodeSelesai != null ? dateFormat.format(_periodeSelesai!) : null,
        deskripsiKegiatan: _deskripsiController.text,
        apresiasi: _apresiasiController.text.isNotEmpty ? _apresiasiController.text : null,
        statusVerifikasi: widget.organization?.statusVerifikasi ?? 'Menunggu',
        achievements: widget.organization?.achievements ?? [],
      );

      final provider = context.read<StudentProvider>();
      if (widget.organization == null) {
        await provider.addOrganizationHistory(org);
      } else {
        await provider.updateOrganizationHistory(org.id, org);
      }

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
              Text('Berhasil!', style: AppTextStyles.h3),
              const SizedBox(height: 8),
              Text(
                widget.organization == null 
                    ? 'Riwayat organisasi berhasil ditambahkan.' 
                    : 'Riwayat organisasi berhasil diperbarui.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog
                    Navigator.pop(context); // Go back to list
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Kembali'),
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
        title: Text(
          widget.organization == null ? 'Tambah Organisasi' : 'Edit Organisasi', 
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimary)
        ),
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
              _buildSectionTitle('Informasi Organisasi'),
              const SizedBox(height: 16),
              
              _buildTextField(
                controller: _namaController,
                label: 'Nama Organisasi',
                hint: 'Masukkan nama organisasi',
                icon: Icons.business_rounded,
                validator: (value) => value!.isEmpty ? 'Nama organisasi wajib diisi' : null,
              ),
              const SizedBox(height: 16),
              
              _buildDropdown(
                label: 'Tipe Organisasi',
                value: _tipe,
                items: const ['Internal', 'Eksternal', 'Kepanitiaan'],
                onChanged: (val) {
                  if (val != null) setState(() => _tipe = val);
                },
                icon: Icons.category_rounded,
              ),
              const SizedBox(height: 16),
              
              _buildTextField(
                controller: _jabatanController,
                label: 'Jabatan/Peran',
                hint: 'Contoh: Ketua, Anggota, dsb',
                icon: Icons.person_rounded,
                validator: (value) => value!.isEmpty ? 'Jabatan wajib diisi' : null,
              ),
              const SizedBox(height: 24),
              
              _buildSectionTitle('Periode Jabatan'),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildDatePicker(
                      label: 'Mulai',
                      date: _periodeMulai,
                      onTap: () => _selectDate(context, true),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildDatePicker(
                      label: 'Selesai',
                      date: _periodeSelesai,
                      onTap: () => _selectDate(context, false),
                      hint: 'Sekarang',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              _buildSectionTitle('Detail Kegiatan'),
              const SizedBox(height: 16),
              
              _buildTextField(
                controller: _deskripsiController,
                label: 'Deskripsi Kegiatan',
                hint: 'Ceritakan apa saja yang dilakukan',
                icon: Icons.description_rounded,
                maxLines: 4,
                validator: (value) => value!.isEmpty ? 'Deskripsi wajib diisi' : null,
              ),
              const SizedBox(height: 16),
              
              _buildTextField(
                controller: _apresiasiController,
                label: 'Apresiasi/Penghargaan (Opsional)',
                hint: 'Contoh: Best Staff, dsb',
                icon: Icons.emoji_events_rounded,
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
                        'Simpan', 
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.h4.copyWith(color: AppColors.textPrimary),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      style: AppTextStyles.bodyMd,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.textTertiary),
        prefixIcon: maxLines == 1 
            ? Icon(icon, color: AppColors.textTertiary, size: 20) 
            : Padding(
                padding: const EdgeInsets.only(bottom: 60),
                child: Icon(icon, color: AppColors.textTertiary, size: 20),
              ),
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
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required void Function(String?) onChanged,
    required IconData icon,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: AppTextStyles.bodyMd))).toList(),
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.textTertiary, size: 20),
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
      ),
    );
  }

  Widget _buildDatePicker({
    required String label,
    required DateTime? date,
    required VoidCallback onTap,
    String hint = 'Pilih Tanggal',
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.surfaceVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    date != null ? DateFormat('dd MMM yyyy').format(date) : hint,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: date != null ? AppColors.textPrimary : AppColors.textTertiary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
