import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';

class CounselingBookingScreen extends StatefulWidget {
  /// Jika diberikan, langsung load jadwal psikolog ini
  final String? psikologId;

  const CounselingBookingScreen({super.key, this.psikologId});

  @override
  State<CounselingBookingScreen> createState() => _CounselingBookingScreenState();
}

class _CounselingBookingScreenState extends State<CounselingBookingScreen> {
  Map<String, dynamic>? _selectedSlot;
  final _complaintCtrl = TextEditingController();
  bool _isSubmitting = false;
  String _selectedMode = 'Tatap Muka';
  String _selectedKategori = 'Stres Akademik';

  static const List<String> _kategoriList = [
    'Stres Akademik',
    'Kecemasan',
    'Masalah Keluarga',
    'Karir & Masa Depan',
    'Hubungan Sosial',
    'Kesehatan Mental',
    'Lainnya',
  ]; // "Tatap Muka" atau "Online"

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<StudentCounselingProvider>();
      if (widget.psikologId != null && widget.psikologId!.isNotEmpty) {
        p.loadPsychologistSchedules(widget.psikologId!);
      } else {
        p.loadAvailableSchedules();
      }
    });
  }

  @override
  void dispose() {
    _complaintCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        final slots = widget.psikologId != null
            ? provider.psychologistSlots
            : provider.availableSchedules;
        final psikologDetail = widget.psikologId != null
            ? provider.psychologistDetail
            : <String, dynamic>{};
        final isLoading = widget.psikologId != null
            ? provider.psychologistDetailLoading
            : provider.schedulesLoading;

        return Scaffold(
          backgroundColor: Colors.white,
          body: RefreshIndicator(
            onRefresh: () async {
              if (widget.psikologId != null && widget.psikologId!.isNotEmpty) {
                await provider.loadPsychologistSchedules(widget.psikologId!);
              } else {
                await provider.loadAvailableSchedules();
              }
            },
            color: AppColors.primary,
            child: CustomScrollView(
              slivers: [
                const SliverToBoxAdapter(
                  child: BkuStaticAppBar(
                    title: 'Booking Konseling',
                    variant: AppBarVariant.student,
                    showBackButton: true,
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (psikologDetail.isNotEmpty) _buildPsychologistBrief(psikologDetail),
                        if (psikologDetail.isNotEmpty) const SizedBox(height: 32),
                        _buildSectionHeader('Pilih Slot Jadwal'),
                        const SizedBox(height: 8),
                        // Info kuota
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(8),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.info_outline_rounded,
                                  size: 16, color: AppColors.primary.withAlpha(180)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Slot abu-abu = penuh atau sudah kamu booking. Tarik ke bawah untuk refresh.',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.primary.withAlpha(180)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : slots.isEmpty
                                ? _buildEmptySlots()
                                : _buildSlotList(slots),
                        const SizedBox(height: 32),
                        _buildSectionHeader('Kategori Konseling'),
                        const SizedBox(height: 12),
                        _buildKategoriSelector(),
                        const SizedBox(height: 28),
                        _buildSectionHeader('Keluhan / Topik'),
                        const SizedBox(height: 12),
                        _buildComplaintField(),
                        const SizedBox(height: 28),
                        _buildSectionHeader('Mode Konseling'),
                        const SizedBox(height: 12),
                        _buildModeSelector(),
                        const SizedBox(height: 40),
                        _buildConfirmButton(provider),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPsychologistBrief(Map<String, dynamic> p) {
    final name = p['name']?.toString() ?? '-';
    final spec = p['specialization']?.toString() ?? '-';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.primary,
            child: Icon(Icons.person_rounded, color: Colors.white, size: 30),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold)),
                Text(spec, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(title,
        style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary));
  }

  Widget _buildEmptySlots() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.event_busy_rounded, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 12),
            Text('Tidak ada jadwal tersedia saat ini',
                style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
          ],
        ),
      ),
    );
  }

  Widget _buildSlotList(List<Map<String, dynamic>> slots) {
    return Column(
      children: slots.map((slot) {
        final isSelected = _selectedSlot?['id'] == slot['id'];
        final hari = slot['hari']?.toString() ?? slot['day']?.toString() ?? '-';
        final start = slot['jam_mulai']?.toString() ?? slot['start']?.toString() ?? '-';
        final end = slot['jam_selesai']?.toString() ?? slot['end']?.toString() ?? '-';
        final lokasi = slot['lokasi']?.toString() ?? slot['location']?.toString() ?? '';
        final kategori = slot['kategori']?.toString() ?? slot['category']?.toString() ?? '';
        // Parse aman — Dio return num bukan int dari JSON
        final sisaKuotaRaw = slot['sisa_kuota'] ?? slot['quota'];
        final sisaKuota = sisaKuotaRaw != null ? (sisaKuotaRaw as num).toInt() : 1;
        final kuotaRaw = slot['kuota'] ?? slot['quota'];
        final kuota = kuotaRaw != null ? (kuotaRaw as num).toInt() : 1;
        final displayDate = slot['display_date']?.toString() ?? '';
        // Penuh = sisa kuota 0 (sudah ada booking sebanyak kuota)
        final isFull = sisaKuota <= 0;
        // Mahasiswa ini sendiri sudah booking slot ini
        final alreadyBooked = slot['already_booked'] == true;
        // Disabled = penuh ATAU sudah dibooking mahasiswa ini
        final isDisabled = isFull || alreadyBooked;

        // Psikolog info (untuk available schedules)
        final psikolog = slot['psychologist'] as Map<String, dynamic>?;
        final psikologName = psikolog?['name']?.toString() ?? '';

        return GestureDetector(
          onTap: isDisabled ? null : () => setState(() => _selectedSlot = isSelected ? null : slot),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDisabled
                  ? Colors.grey.withAlpha(10)
                  : isSelected
                      ? AppColors.primary
                      : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDisabled
                    ? Colors.grey.withAlpha(30)
                    : isSelected
                        ? AppColors.primary
                        : const Color(0xFFE2E8F0),
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [BoxShadow(color: AppColors.primary.withAlpha(40), blurRadius: 12, offset: const Offset(0, 6))]
                  : null,
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDisabled
                        ? Colors.grey.withAlpha(20)
                        : isSelected
                            ? Colors.white.withAlpha(30)
                            : AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    alreadyBooked
                        ? Icons.check_circle_outline_rounded
                        : isFull
                            ? Icons.block_rounded
                            : Icons.schedule_rounded,
                    color: isDisabled ? Colors.grey : isSelected ? Colors.white : AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$hari, $start - $end',
                        style: AppTextStyles.bodyMd.copyWith(
                          fontWeight: FontWeight.w900,
                          color: isDisabled ? Colors.grey : isSelected ? Colors.white : const Color(0xFF1E293B),
                        ),
                      ),
                      if (displayDate.isNotEmpty)
                        Text(displayDate,
                            style: AppTextStyles.labelSm.copyWith(
                                color: isDisabled ? Colors.grey : isSelected ? Colors.white70 : AppColors.outline)),
                      if (psikologName.isNotEmpty)
                        Text(psikologName,
                            style: AppTextStyles.labelSm.copyWith(
                                color: isDisabled ? Colors.grey : isSelected ? Colors.white70 : AppColors.primary,
                                fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          if (kategori.isNotEmpty)
                            _buildChip(kategori, isSelected ? Colors.white : AppColors.primary, isSelected, isDisabled),
                          if (lokasi.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            _buildChip(lokasi, isSelected ? Colors.white : Colors.teal, isSelected, isDisabled),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (alreadyBooked)
                      _buildBadge('Sudah\nDibooking', Colors.blue)
                    else if (isFull)
                      _buildBadge('Penuh', Colors.red)
                    else ...[
                      Text(
                        'Sisa $sisaKuota/$kuota',
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.green,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 48,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: kuota > 0 ? sisaKuota / kuota : 0,
                            backgroundColor: Colors.green.withAlpha(30),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              isSelected ? Colors.white : Colors.green,
                            ),
                            minHeight: 4,
                          ),
                        ),
                      ),
                    ],
                    if (isSelected) ...[
                      const SizedBox(height: 4),
                      const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildChip(String label, Color color, bool isSelected, bool isDisabled) {
    return Container(
      margin: const EdgeInsets.only(top: 4),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isDisabled
            ? Colors.grey.withAlpha(15)
            : isSelected
                ? Colors.white.withAlpha(30)
                : color.withAlpha(15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label,
          style: TextStyle(
              color: isDisabled ? Colors.grey : color,
              fontSize: 9,
              fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          height: 1.2,
        ),
      ),
    );
  }

  Widget _buildKategoriSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pilih kategori yang paling sesuai dengan keluhan Anda',
            style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _kategoriList.map((kategori) {
              final isSelected = _selectedKategori == kategori;
              return GestureDetector(
                onTap: () => setState(() => _selectedKategori = kategori),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Text(
                    kategori,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : const Color(0xFF475569),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildModeSelector() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _selectedMode = 'Tatap Muka'),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              decoration: BoxDecoration(
                color: _selectedMode == 'Tatap Muka' ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _selectedMode == 'Tatap Muka' ? AppColors.primary : const Color(0xFFE2E8F0),
                  width: 2,
                ),
                boxShadow: _selectedMode == 'Tatap Muka'
                    ? [BoxShadow(color: AppColors.primary.withAlpha(40), blurRadius: 10, offset: const Offset(0, 4))]
                    : null,
              ),
              child: Column(
                children: [
                  Icon(Icons.location_on_rounded,
                      color: _selectedMode == 'Tatap Muka' ? Colors.white : Colors.grey,
                      size: 28),
                  const SizedBox(height: 8),
                  Text('Tatap Muka',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: _selectedMode == 'Tatap Muka' ? Colors.white : const Color(0xFF1E293B),
                      )),
                  const SizedBox(height: 4),
                  Text('Hadir langsung\nke ruangan',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        color: _selectedMode == 'Tatap Muka' ? Colors.white70 : Colors.grey,
                      )),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _selectedMode = 'Online'),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              decoration: BoxDecoration(
                color: _selectedMode == 'Online' ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _selectedMode == 'Online' ? AppColors.primary : const Color(0xFFE2E8F0),
                  width: 2,
                ),
                boxShadow: _selectedMode == 'Online'
                    ? [BoxShadow(color: AppColors.primary.withAlpha(40), blurRadius: 10, offset: const Offset(0, 4))]
                    : null,
              ),
              child: Column(
                children: [
                  Icon(Icons.videocam_rounded,
                      color: _selectedMode == 'Online' ? Colors.white : Colors.grey,
                      size: 28),
                  const SizedBox(height: 8),
                  Text('Online',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: _selectedMode == 'Online' ? Colors.white : const Color(0xFF1E293B),
                      )),
                  const SizedBox(height: 4),
                  Text('Via Google Meet\natau Zoom',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        color: _selectedMode == 'Online' ? Colors.white70 : Colors.grey,
                      )),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildComplaintField() {
    return TextField(
      controller: _complaintCtrl,
      maxLines: 4,
      style: AppTextStyles.bodyMd,
      decoration: InputDecoration(
        hintText: 'Ceritakan keluhan atau topik yang ingin kamu diskusikan...',
        hintStyle: AppTextStyles.labelMd.copyWith(color: AppColors.outline.withAlpha(100)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.all(20),
      ),
    );
  }

  Widget _buildConfirmButton(StudentCounselingProvider provider) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: (_selectedSlot == null || _isSubmitting) ? null : () => _submit(provider),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
        child: _isSubmitting
            ? const SizedBox(height: 24, width: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Text('Lanjutkan Booking',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
    );
  }

  Future<void> _submit(StudentCounselingProvider provider) async {
    if (_selectedSlot == null) return;
    setState(() => _isSubmitting = true);

    final slot = _selectedSlot!;
    // Parse aman — Dio return num bukan int dari JSON
    final psikologIdRaw = slot['psikolog_id'];
    final psikologId = psikologIdRaw != null
        ? (psikologIdRaw as num).toInt()
        : int.tryParse(slot['psikolog_id']?.toString() ?? '') ?? 0;
    final slotIdRaw = slot['id'];
    final slotId = slotIdRaw != null
        ? (slotIdRaw as num).toInt()
        : int.tryParse(slot['id']?.toString() ?? '') ?? 0;
    final date = slot['tanggal']?.toString() ?? slot['next_date']?.toString() ?? '';
    final start = slot['jam_mulai']?.toString() ?? slot['start']?.toString() ?? '';
    final end = slot['jam_selesai']?.toString() ?? slot['end']?.toString() ?? '';

    // Show informed consent first
    final agreed = await _showInformedConsent();
    if (!agreed) {
      setState(() => _isSubmitting = false);
      return;
    }

    final success = await provider.createBooking(
      psikologId: psikologId,
      slotId: slotId,
      date: date,
      start: start,
      end: end,
      topic: _selectedKategori,
      complaint: _complaintCtrl.text.trim(),
      mode: _selectedMode,
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        // Reload jadwal agar slot yang sudah dibooking tampil abu-abu
        if (widget.psikologId != null && widget.psikologId!.isNotEmpty) {
          provider.loadPsychologistSchedules(widget.psikologId!);
        } else {
          provider.loadAvailableSchedules();
        }
        setState(() => _selectedSlot = null);
        _showSuccessDialog();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.bookingError ?? 'Gagal membuat booking. Coba lagi.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Future<bool> _showInformedConsent() async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _InformedConsentSheet(
        onAgree: () => Navigator.pop(context, true),
        onCancel: () => Navigator.pop(context, false),
      ),
    );
    return result == true;
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            const Text('Booking Berhasil!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('Jadwal kamu sudah terdaftar. Psikolog akan mengkonfirmasi booking kamu.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Tutup'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Informed Consent Sheet ───────────────────────────────────────────────────

class _InformedConsentSheet extends StatelessWidget {
  final VoidCallback onAgree;
  final VoidCallback onCancel;

  const _InformedConsentSheet({required this.onAgree, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const Icon(Icons.assignment_rounded, color: AppColors.primary, size: 48),
                const SizedBox(height: 24),
                const Text('Informed Consent Digital',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                _buildPoint('Kerahasiaan',
                    'Semua informasi yang kamu sampaikan dalam sesi konseling bersifat rahasia dan dilindungi oleh kode etik psikologi.'),
                _buildPoint('Komitmen Jadwal',
                    'Mohon hadir tepat waktu. Pembatalan harus dilakukan maksimal 24 jam sebelum sesi dimulai.'),
                _buildPoint('Data Keamanan',
                    'Catatan sesi akan disimpan dalam sistem EHR terenkripsi yang hanya bisa diakses oleh psikolog Anda.'),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(16)),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline_rounded, color: Colors.blue),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Dengan menekan setuju, kamu menyatakan telah membaca dan menyetujui aturan konseling di BKU.',
                          style: TextStyle(color: Colors.blue, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: onAgree,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Saya Setuju & Lanjutkan',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: onCancel,
                  child: const Text('Batal', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPoint(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 14)),
        ],
      ),
    );
  }
}
