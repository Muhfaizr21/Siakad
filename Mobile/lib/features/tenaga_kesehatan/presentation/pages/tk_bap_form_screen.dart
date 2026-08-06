import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_health_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_bap_model.dart';
import 'package:intl/intl.dart';

class TkBapFormScreen extends StatefulWidget {
  final TkBapModel? existingBap;

  const TkBapFormScreen({super.key, this.existingBap});

  @override
  State<TkBapFormScreen> createState() => _TkBapFormScreenState();
}

class _TkBapFormScreenState extends State<TkBapFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  late TextEditingController _namaController;
  late TextEditingController _tempatController;
  late TextEditingController _waktuMulaiController;
  late TextEditingController _waktuSelesaiController;
  late TextEditingController _pesertaController;
  late TextEditingController _diperiksaController;
  late TextEditingController _layakController;
  late TextEditingController _pantauanController;
  late TextEditingController _tdkLayakController;

  DateTime _selectedDate = DateTime.now();
  String _status = 'DRAFT';

  @override
  void initState() {
    super.initState();
    final bap = widget.existingBap;
    
    _namaController = TextEditingController(text: bap?.namaKegiatan ?? '');
    _tempatController = TextEditingController(text: bap?.tempat ?? '');
    _waktuMulaiController = TextEditingController(text: bap?.waktuMulai ?? '');
    _waktuSelesaiController = TextEditingController(text: bap?.waktuSelesai ?? '');
    _pesertaController = TextEditingController(text: bap?.jumlahPeserta.toString() ?? '');
    _diperiksaController = TextEditingController(text: bap?.jumlahDiperiksa.toString() ?? '');
    _layakController = TextEditingController(text: bap?.totalLayak.toString() ?? '');
    _pantauanController = TextEditingController(text: bap?.totalPantauan.toString() ?? '');
    _tdkLayakController = TextEditingController(text: bap?.totalTidakLayak.toString() ?? '');

    if (bap != null) {
      _selectedDate = bap.tanggalPelaksanaan;
      _status = bap.status;
    }
  }

  @override
  void dispose() {
    _namaController.dispose();
    _tempatController.dispose();
    _waktuMulaiController.dispose();
    _waktuSelesaiController.dispose();
    _pesertaController.dispose();
    _diperiksaController.dispose();
    _layakController.dispose();
    _pantauanController.dispose();
    _tdkLayakController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final data = {
      'nama_kegiatan': _namaController.text,
      'tempat': _tempatController.text,
      'waktu_mulai': _waktuMulaiController.text,
      'waktu_selesai': _waktuSelesaiController.text,
      'jumlah_peserta': int.tryParse(_pesertaController.text) ?? 0,
      'jumlah_diperiksa': int.tryParse(_diperiksaController.text) ?? 0,
      'total_layak': int.tryParse(_layakController.text) ?? 0,
      'total_pantauan': int.tryParse(_pantauanController.text) ?? 0,
      'total_tidak_layak': int.tryParse(_tdkLayakController.text) ?? 0,
      'status': _status,
      'tanggal_pelaksanaan': DateFormat('yyyy-MM-dd').format(_selectedDate),
    };

    final provider = context.read<TkHealthProvider>();
    bool success;

    if (widget.existingBap == null) {
      success = await provider.createBAP(data);
    } else {
      success = await provider.updateBAP(widget.existingBap!.id, data);
    }

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('BAP berhasil disimpan')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFinal = _status == 'FINAL';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.neutral900),
          onPressed: () => context.pop(),
        ),
        title: Text(
          widget.existingBap == null ? 'Buat BAP Baru' : 'Edit BAP',
          style: AppTextStyles.titleMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900),
        ),
        actions: [
          if (widget.existingBap != null && !isFinal)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppColors.error),
              onPressed: () => _confirmDelete(),
            )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildInput('Nama Kegiatan', _namaController, isFinal, isRequired: true),
              const SizedBox(height: 16),
              _buildInput('Tempat', _tempatController, isFinal),
              const SizedBox(height: 16),
              _buildDatePicker(isFinal),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildInput('Waktu Mulai', _waktuMulaiController, isFinal)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildInput('Waktu Selesai', _waktuSelesaiController, isFinal)),
                ],
              ),
              const SizedBox(height: 24),
              Text('Statistik Pemeriksaan', style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildNumberInput('Jml Peserta', _pesertaController, isFinal)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildNumberInput('Jml Diperiksa', _diperiksaController, isFinal)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildNumberInput('Layak', _layakController, isFinal)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildNumberInput('Pantauan', _pantauanController, isFinal)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildNumberInput('Tdk Layak', _tdkLayakController, isFinal)),
                ],
              ),
              const SizedBox(height: 24),
              if (!isFinal) ...[
                SwitchListTile(
                  title: Text('Tandai sebagai FINAL', style: AppTextStyles.bodyMd),
                  subtitle: Text('BAP yang sudah FINAL tidak bisa diubah lagi', style: AppTextStyles.caption.copyWith(color: AppColors.error)),
                  value: _status == 'FINAL',
                  onChanged: (val) {
                    setState(() => _status = val ? 'FINAL' : 'DRAFT');
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Simpan BAP', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, bool readOnly, {bool isRequired = false}) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: readOnly ? AppColors.neutral100 : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (val) {
        if (isRequired && (val == null || val.isEmpty)) {
          return '$label wajib diisi';
        }
        return null;
      },
    );
  }

  Widget _buildNumberInput(String label, TextEditingController controller, bool readOnly) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: readOnly ? AppColors.neutral100 : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildDatePicker(bool readOnly) {
    return InkWell(
      onTap: readOnly ? null : () async {
        final date = await showDatePicker(
          context: context,
          initialDate: _selectedDate,
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
        );
        if (date != null) {
          setState(() => _selectedDate = date);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: readOnly ? AppColors.neutral100 : Colors.white,
          border: Border.all(color: AppColors.neutral400),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tanggal Pelaksanaan', style: AppTextStyles.caption.copyWith(color: AppColors.neutral600)),
                const SizedBox(height: 4),
                Text(DateFormat('dd MMMM yyyy').format(_selectedDate), style: AppTextStyles.bodyMd),
              ],
            ),
            Icon(Icons.calendar_today, color: AppColors.neutral500),
          ],
        ),
      ),
    );
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus BAP?'),
        content: const Text('Data yang dihapus tidak bisa dikembalikan.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isSubmitting = true);
              final success = await context.read<TkHealthProvider>().deleteBAP(widget.existingBap!.id);
              if (success && mounted) {
                context.pop();
              }
              setState(() => _isSubmitting = false);
            },
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
