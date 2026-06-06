import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_schedule_provider.dart';

class TkAddScheduleScreen extends StatefulWidget {
  const TkAddScheduleScreen({super.key});

  @override
  State<TkAddScheduleScreen> createState() => _TkAddScheduleScreenState();
}

class _TkAddScheduleScreenState extends State<TkAddScheduleScreen> {
  final _formKey = GlobalKey<FormState>();

  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 11, minute: 0);
  int _kuota = 5;
  String _lokasi = '';
  String _tipeLayanan = 'Pemeriksaan Umum';
  String _catatan = '';
  bool _isSaving = false;

  final List<String> _tipeLayananOptions = [
    'Pemeriksaan Umum',
    'Konsultasi Gizi',
    'Screening Khusus',
    'Lainnya',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Buat Jadwal Baru',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            // Tanggal
            _buildSectionLabel('Tanggal Praktik'),
            const SizedBox(height: 8),
            _buildDatePicker(),
            const SizedBox(height: 20),

            // Jam
            _buildSectionLabel('Jam Praktik'),
            const SizedBox(height: 8),
            _buildTimePicker(),
            const SizedBox(height: 20),

            // Kuota
            _buildSectionLabel('Kuota Peserta'),
            const SizedBox(height: 8),
            _buildKuotaSelector(),
            const SizedBox(height: 20),

            // Lokasi
            _buildSectionLabel('Lokasi'),
            const SizedBox(height: 8),
            TextFormField(
              decoration: InputDecoration(
                hintText: 'Contoh: Klinik Kampus Lt.1',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
                prefixIcon: const Icon(Icons.location_on_rounded, color: AppColors.neutral500),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Lokasi harus diisi';
                }
                return null;
              },
              onSaved: (value) => _lokasi = value ?? '',
            ),
            const SizedBox(height: 20),

            // Tipe Layanan
            _buildSectionLabel('Tipe Layanan'),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _tipeLayanan,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
              ),
              items: _tipeLayananOptions.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(type),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _tipeLayanan = value ?? 'Pemeriksaan Umum';
                });
              },
            ),
            const SizedBox(height: 20),

            // Catatan
            _buildSectionLabel('Catatan (Opsional)'),
            const SizedBox(height: 8),
            TextFormField(
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Tambahkan catatan untuk mahasiswa...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.neutral200),
                ),
              ),
              onSaved: (value) => _catatan = value ?? '',
            ),
            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Simpan Jadwal',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: AppTextStyles.labelSm.copyWith(
        color: AppColors.neutral600,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildDatePicker() {
    return GestureDetector(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: _selectedDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
        );
        if (date != null) {
          setState(() => _selectedDate = date);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.neutral200),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.primary),
            const SizedBox(width: 12),
            Text(
              _formatDate(_selectedDate),
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right_rounded, color: AppColors.neutral400),
          ],
        ),
      ),
    );
  }

  Widget _buildTimePicker() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: _startTime,
              );
              if (time != null) {
                setState(() => _startTime = time);
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Jam Mulai',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        _formatTime(_startTime),
                        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Text('-', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        Expanded(
          child: GestureDetector(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: _endTime,
              );
              if (time != null) {
                setState(() => _endTime = time);
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Jam Selesai',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        _formatTime(_endTime),
                        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildKuotaSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Row(
        children: [
          const Icon(Icons.people_rounded, color: AppColors.primary),
          const SizedBox(width: 12),
          const Text('Kuota:', style: TextStyle(fontWeight: FontWeight.w500)),
          const Spacer(),
          IconButton(
            onPressed: _kuota > 1 ? () => setState(() => _kuota--) : null,
            icon: const Icon(Icons.remove_circle_outline_rounded),
            color: AppColors.primary,
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$_kuota',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _kuota++),
            icon: const Icon(Icons.add_circle_outline_rounded),
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return '${days[date.weekday - 1]}, ${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatTime(TimeOfDay time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    _formKey.currentState!.save();

    final provider = context.read<TkScheduleProvider>();
    final success = await provider.createSchedule(
      tanggal: _selectedDate.toIso8601String().split('T')[0],
      jamMulai: _formatTime(_startTime),
      jamSelesai: _formatTime(_endTime),
      kuota: _kuota,
      lokasi: _lokasi,
      tipeLayanan: _tipeLayanan,
      catatan: _catatan.isNotEmpty ? _catatan : null,
    );

    setState(() => _isSaving = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Jadwal berhasil dibuat'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Gagal membuat jadwal'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }
}
