import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class SessionNoteScreen extends StatefulWidget {
  final String studentName;
  final String studentId;
  final String? bookingId;
  final int? sessionNumber;

  const SessionNoteScreen({
    super.key,
    required this.studentName,
    required this.studentId,
    this.bookingId,
    this.sessionNumber,
  });

  @override
  State<SessionNoteScreen> createState() => _SessionNoteScreenState();
}

class _SessionNoteScreenState extends State<SessionNoteScreen> {
  final _complaintCtrl = TextEditingController();
  final _observationCtrl = TextEditingController();
  final _recommendationCtrl = TextEditingController();
  String _selectedMood = 'Netral';
  String _selectedType = 'Konseling Baru';
  String _selectedStatus = 'Aktif';
  bool _isSaving = false;

  final List<String> _moods = ['Baik', 'Netral', 'Cemas', 'Sedih', 'Stres', 'Marah'];
  final List<String> _types = ['Konseling Baru', 'Konseling Lanjutan', 'Krisis', 'Evaluasi'];
  final List<String> _statuses = ['Aktif', 'Stabil', 'Pemulihan', 'Membaik', 'Perlu Perhatian'];

  @override
  void dispose() {
    _complaintCtrl.dispose();
    _observationCtrl.dispose();
    _recommendationCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'CATATAN SESI',
            subtitle: 'ELECTRONIC HEALTH RECORD',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            expandedHeight: 160,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildConfidentialBanner(),
                  const SizedBox(height: 24),
                  _buildStudentInfo(),
                  const SizedBox(height: 24),
                  _buildInputSection('Keluhan Utama', 'Tuliskan keluhan yang disampaikan mahasiswa...', _complaintCtrl, 4),
                  const SizedBox(height: 20),
                  _buildInputSection('Observasi & Catatan Sesi', 'Tuliskan observasi dan poin-poin utama sesi...', _observationCtrl, 6),
                  const SizedBox(height: 20),
                  _buildInputSection('Rekomendasi & Tindak Lanjut', 'Apa langkah selanjutnya untuk mahasiswa ini?', _recommendationCtrl, 4),
                  const SizedBox(height: 24),
                  _buildDropdownSection('Mood Mahasiswa', _moods, _selectedMood, (v) => setState(() => _selectedMood = v!)),
                  const SizedBox(height: 16),
                  _buildDropdownSection('Jenis Sesi', _types, _selectedType, (v) => setState(() => _selectedType = v!)),
                  const SizedBox(height: 16),
                  _buildDropdownSection('Status Pasien', _statuses, _selectedStatus, (v) => setState(() => _selectedStatus = v!)),
                  const SizedBox(height: 40),
                  _buildSaveButton(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfidentialBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withAlpha(10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.security_rounded, color: Colors.red, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'DOKUMEN RAHASIA: Catatan ini hanya dapat diakses oleh Psikolog yang berwenang.',
              style: AppTextStyles.labelSm.copyWith(color: Colors.red[800], fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentInfo() {
    final sessionNum = widget.sessionNumber ?? '?';
    final today = DateTime.now();
    final dateStr = '${today.day.toString().padLeft(2, '0')} '
        '${_monthName(today.month)} ${today.year}';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primary,
            child: Icon(Icons.person_rounded, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.studentName,
                    style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold)),
                Text('NIM: ${widget.studentId}',
                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Sesi #$sessionNum',
                  style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.primary, fontWeight: FontWeight.bold)),
              Text(dateStr,
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputSection(String label, String hint, TextEditingController ctrl, int lines) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: AppTextStyles.bodyMd.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary)),
        const SizedBox(height: 12),
        TextField(
          controller: ctrl,
          maxLines: lines,
          style: AppTextStyles.bodyMd,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline.withAlpha(100)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(20),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownSection(String label, List<String> items, String value, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: AppTextStyles.bodyMd.copyWith(
                fontWeight: FontWeight.bold, color: AppColors.primary)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
              items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _isSaving ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
        child: _isSaving
            ? const SizedBox(
                height: 24, width: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.enhanced_encryption_rounded),
                  const SizedBox(width: 12),
                  Text('Simpan & Enkripsi Catatan',
                      style: AppTextStyles.bodyLg.copyWith(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_complaintCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Keluhan utama wajib diisi'), backgroundColor: Colors.red),
      );
      return;
    }
    setState(() => _isSaving = true);
    final provider = context.read<CounselingProvider>();
    final data = {
      'complaint': _complaintCtrl.text.trim(),
      'observation': _observationCtrl.text.trim(),
      'recommendation': _recommendationCtrl.text.trim(),
      'mood': _selectedMood,
      'type': _selectedType,
      'status': _selectedStatus,
      if (widget.bookingId != null && widget.bookingId!.isNotEmpty)
        'booking_id': int.tryParse(widget.bookingId!) ?? 0,
    };
    final success = await provider.createSessionNote(widget.studentId, data);
    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Catatan sesi berhasil disimpan!'
              : 'Gagal menyimpan catatan. Coba lagi.'),
          backgroundColor: success ? AppColors.primary : Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      if (success) {
        // Reload medical record
        provider.loadMedicalRecord(widget.studentId);
        Navigator.pop(context);
      }
    }
  }

  String _monthName(int month) {
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return months[month - 1];
  }
}
