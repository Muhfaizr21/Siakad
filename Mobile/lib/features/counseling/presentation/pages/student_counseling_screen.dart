import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';

class StudentCounselingScreen extends StatefulWidget {
  const StudentCounselingScreen({super.key});

  @override
  State<StudentCounselingScreen> createState() => _StudentCounselingScreenState();
}

class _StudentCounselingScreenState extends State<StudentCounselingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<StudentCounselingProvider>();
      p.loadPsychologists();
      p.loadMyBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'BKU Care',
            subtitle: 'KONSELING & KESEHATAN MENTAL',
            variant: AppBarVariant.student,
            showBackButton: true,
            expandedHeight: 160,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildGreeting(),
                  const SizedBox(height: 24),
                  _buildUrgentCard(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Menu Layanan'),
                  const SizedBox(height: 16),
                  _buildServiceGrid(context),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Jadwal Saya'),
                  const SizedBox(height: 16),
                  _buildMyAppointments(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Psikolog Tersedia'),
                  const SizedBox(height: 16),
                  _buildPsychologistList(context),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildGreeting() {
    final name = context.watch<StudentProvider>().name;
    final firstName = name.split(' ').first;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Halo, $firstName 👋',
            style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
        Text('Apa yang kamu rasakan hari ini? Kami di sini untuk mendengarkan.',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
      ],
    );
  }

  Widget _buildUrgentCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.red.withAlpha(30)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
            child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Butuh bantuan segera?',
                    style: AppTextStyles.bodyLg.copyWith(color: Colors.red[900], fontWeight: FontWeight.bold)),
                Text('Klik untuk hubungi hotline darurat 24/7',
                    style: AppTextStyles.labelMd.copyWith(color: Colors.red[700])),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, color: Colors.red, size: 16),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(title,
        style: AppTextStyles.titleMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900));
  }

  Widget _buildServiceGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.2,
      children: [
        _buildServiceCard(context, 'Booking Sesi', Icons.event_available_rounded, Colors.blue, AppRoutes.counselingBooking),
        _buildServiceCard(context, 'Riwayat Saya', Icons.history_rounded, Colors.orange, null, onTap: () => _showMyBookings(context)),
        _buildServiceCard(context, 'Rekam Medis', Icons.medical_information_rounded, Colors.teal, null, onTap: () => _showMedicalRecord(context)),
      ],
    );
  }

  Widget _buildServiceCard(BuildContext context, String title, IconData icon, Color color, String? route, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap ?? (route != null ? () => context.push(route) : null),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: color.withAlpha(15), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withAlpha(20), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildMyAppointments() {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        if (provider.myBookingsLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        final bookings = provider.myBookings;
        if (bookings.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Center(
              child: Text('Belum ada jadwal konseling',
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
            ),
          );
        }

        // Tampilkan booking terbaru yang aktif
        final active = bookings.firstWhere(
          (b) => b['status'] == 'Menunggu' || b['status'] == 'Dikonfirmasi',
          orElse: () => bookings.first,
        );

        final psikolog = active['psychologist'] as Map<String, dynamic>?;
        final psikologName = psikolog?['name']?.toString() ?? '-';
        final displayDate = active['display_date']?.toString() ?? '-';
        final start = active['start']?.toString() ?? '-';
        final status = active['status']?.toString() ?? '-';
        final topic = active['topic']?.toString() ?? '-';

        Color statusColor = AppColors.primary;
        if (status == 'Menunggu') statusColor = Colors.orange;
        if (status == 'Selesai') statusColor = Colors.green;
        if (status == 'Ditolak' || status == 'Dibatalkan') statusColor = Colors.red;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: statusColor.withAlpha(30)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(displayDate.split(' ').first,
                        style: AppTextStyles.titleMd.copyWith(color: statusColor, fontWeight: FontWeight.bold)),
                    Text(displayDate.split(' ').skip(1).join(' '),
                        style: AppTextStyles.labelSm.copyWith(color: statusColor)),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(topic, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                    Text('$psikologName • $start WIB',
                        style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(status,
                    style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPsychologistList(BuildContext context) {
    return Consumer<StudentCounselingProvider>(
      builder: (context, provider, _) {
        if (provider.psychologistsLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (provider.psychologistsError != null) {
          return Center(
            child: Text(provider.psychologistsError!,
                style: AppTextStyles.bodyMd.copyWith(color: Colors.red)),
          );
        }
        final psychologists = provider.psychologists;
        if (psychologists.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Center(
              child: Text('Belum ada psikolog tersedia',
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
            ),
          );
        }
        return Column(
          children: psychologists.map((p) => _buildPsychologistCard(context, p)).toList(),
        );
      },
    );
  }

  Widget _buildPsychologistCard(BuildContext context, Map<String, dynamic> p) {
    final name = p['name']?.toString() ?? '-';
    final spec = p['specialization']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';
    final isActive = p['is_active'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isActive ? Colors.green.withAlpha(30) : Colors.grey.withAlpha(30)),
      ),
      child: Row(
        children: [
          Stack(
            children: [
              const CircleAvatar(
                radius: 28,
                backgroundColor: Color(0xFFF1F5F9),
                child: Icon(Icons.person_rounded, color: AppColors.outline),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: isActive ? Colors.green : Colors.grey,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                Text(spec, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                const SizedBox(height: 4),
                Text(
                  isActive ? 'Tersedia' : 'Tidak Tersedia',
                  style: TextStyle(
                    color: isActive ? Colors.green : Colors.grey,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: isActive
                ? () => context.push('${AppRoutes.counselingBooking}?psikolog_id=$id')
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey.withAlpha(50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: const Text('Book'),
          ),
        ],
      ),
    );
  }

  void _showMyBookings(BuildContext context) {
    final provider = context.read<StudentCounselingProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MyBookingsSheet(provider: provider),
    );
  }

  void _showMedicalRecord(BuildContext context) {
    final provider = context.read<StudentCounselingProvider>();
    provider.loadMyMedicalRecord();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MedicalRecordSheet(provider: provider),
    );
  }
}

// ─── My Bookings Sheet ────────────────────────────────────────────────────────

class _MyBookingsSheet extends StatelessWidget {
  final StudentCounselingProvider provider;
  const _MyBookingsSheet({required this.provider});

  void _handleCancelBooking(BuildContext context, String bookingId) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Batalkan Booking?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin membatalkan jadwal konseling ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Kembali', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(dialogCtx);
              final success = await provider.cancelBooking(bookingId);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Booking berhasil dibatalkan' : 'Gagal membatalkan booking'),
                    backgroundColor: success ? Colors.green : Colors.red,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Ya, Batalkan'),
          ),
        ],
      ),
    );
  }

  void _handleReschedule(BuildContext context, Map<String, dynamic> booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _RescheduleSheet(
        provider: provider,
        booking: booking,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 48, height: 5,
              decoration: BoxDecoration(color: Colors.grey.withAlpha(50), borderRadius: BorderRadius.circular(10))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text('Riwayat Booking',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900)),
          ),
          Expanded(
            child: ChangeNotifierProvider.value(
              value: provider,
              child: Consumer<StudentCounselingProvider>(
                builder: (context, p, _) {
                  if (p.myBookingsLoading) return const Center(child: CircularProgressIndicator());
                  if (p.myBookings.isEmpty) {
                    return Center(child: Text('Belum ada booking',
                        style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)));
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: p.myBookings.length,
                    itemBuilder: (context, i) {
                      final b = p.myBookings[i];
                      final psikolog = b['psychologist'] as Map<String, dynamic>?;
                      final status = b['status']?.toString() ?? '-';
                      final mode = b['mode']?.toString() ?? 'Tatap Muka';
                      final linkMeeting = b['link_meeting']?.toString() ?? '';
                      final isOnline = mode == 'Online';
                      final isDikonfirmasi = status == 'Dikonfirmasi';

                      Color statusColor = AppColors.primary;
                      if (status == 'Menunggu') statusColor = Colors.orange;
                      if (status == 'Selesai') statusColor = Colors.green;
                      if (status == 'Ditolak' || status == 'Dibatalkan') statusColor = Colors.red;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: statusColor.withAlpha(30)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(b['topic']?.toString() ?? '-',
                                          style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                                      Text('${psikolog?['name'] ?? '-'} • ${b['display_date'] ?? '-'}',
                                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                                      Text('${b['start'] ?? '-'} - ${b['end'] ?? '-'}',
                                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                      color: statusColor.withAlpha(15), borderRadius: BorderRadius.circular(8)),
                                  child: Text(status,
                                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Badge mode
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isOnline ? Colors.blue.withAlpha(20) : Colors.teal.withAlpha(20),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isOnline ? Icons.videocam_rounded : Icons.location_on_rounded,
                                        size: 11,
                                        color: isOnline ? Colors.blue : Colors.teal,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        mode,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: isOnline ? Colors.blue : Colors.teal,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            // Link meeting — tampil kalau Online + Dikonfirmasi + ada link
                            if (isOnline && isDikonfirmasi && linkMeeting.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              GestureDetector(
                                onTap: () async {
                                  final uri = Uri.parse(linkMeeting);
                                  try {
                                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Gagal membuka link meeting'),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withAlpha(10),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.blue.withAlpha(40)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.videocam_rounded, color: Colors.blue, size: 18),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Link Meeting Tersedia',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.blue,
                                              ),
                                            ),
                                            Text(
                                              linkMeeting,
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: Colors.blue.withAlpha(180),
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.open_in_new_rounded, color: Colors.blue, size: 16),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                            // Actions (Reschedule & Cancel)
                            if (status == 'Menunggu' || status == 'Dikonfirmasi') ...[
                              const Divider(height: 24, thickness: 1),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  OutlinedButton(
                                    onPressed: () => _handleCancelBooking(context, b['id'].toString()),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.red,
                                      side: BorderSide(color: Colors.red.withAlpha(100)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    ),
                                    child: const Text('Batalkan Sesi', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () => _handleReschedule(context, b),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      elevation: 0,
                                    ),
                                    child: const Text('Reschedule', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Reschedule Sheet ────────────────────────────────────────────────────────

class _RescheduleSheet extends StatefulWidget {
  final StudentCounselingProvider provider;
  final Map<String, dynamic> booking;

  const _RescheduleSheet({required this.provider, required this.booking});

  @override
  State<_RescheduleSheet> createState() => _RescheduleSheetState();
}

class _RescheduleSheetState extends State<_RescheduleSheet> {
  DateTime? _selectedDate;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    // Parse current date and times if possible to pre-populate
    try {
      final rawDate = widget.booking['tanggal'] ?? widget.booking['date'];
      if (rawDate != null) {
        _selectedDate = DateTime.parse(rawDate.toString());
      }
    } catch (_) {}

    try {
      final startStr = widget.booking['start']?.toString() ?? '';
      if (startStr.contains(':')) {
        final parts = startStr.split(':');
        _startTime = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
      }
    } catch (_) {}

    try {
      final endStr = widget.booking['end']?.toString() ?? '';
      if (endStr.contains(':')) {
        final parts = endStr.split(':');
        _endTime = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
      }
    } catch (_) {}
  }

  Future<void> _selectDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate != null && _selectedDate!.isAfter(now) ? _selectedDate! : now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: Color(0xFF1E293B),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _selectStartTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _startTime ?? const TimeOfDay(hour: 9, minute: 0),
    );
    if (picked != null) {
      setState(() {
        _startTime = picked;
        // Auto end time = start time + 1 hour if not set
        if (_endTime == null) {
          int endHour = picked.hour + 1;
          if (endHour > 23) endHour = 23;
          _endTime = TimeOfDay(hour: endHour, minute: picked.minute);
        }
      });
    }
  }

  Future<void> _selectEndTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _endTime ?? const TimeOfDay(hour: 10, minute: 0),
    );
    if (picked != null) {
      setState(() => _endTime = picked);
    }
  }

  String _formatTimeOfDay(TimeOfDay? time) {
    if (time == null) return '-';
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Future<void> _submit() async {
    if (_selectedDate == null || _startTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih tanggal dan jam mulai rescheduling')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate!);
    final startStr = _formatTimeOfDay(_startTime);
    final endStr = _formatTimeOfDay(_endTime);
    final bookingId = widget.booking['id'].toString();

    final success = await widget.provider.rescheduleBooking(
      bookingId: bookingId,
      date: formattedDate,
      start: startStr,
      end: endStr,
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        Navigator.pop(context); // Close Reschedule Sheet
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Berhasil menjadwalkan ulang! Menunggu konfirmasi ulang dari psikolog.'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.provider.rescheduleError ?? 'Gagal melakukan reschedule. Coba lagi.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final psikolog = widget.booking['psychologist'] as Map<String, dynamic>?;
    final psikologName = psikolog?['name']?.toString() ?? '-';
    final topic = widget.booking['topic']?.toString() ?? '-';

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 24,
        right: 24,
        top: 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Reschedule Konseling',
            style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary),
          ),
          const SizedBox(height: 8),
          Text(
            'Untuk sesi dengan $psikologName\nTopik: $topic',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline),
          ),
          const SizedBox(height: 24),
          // Date Field
          _buildPickerField(
            label: 'Tanggal Baru',
            value: _selectedDate == null ? 'Pilih Tanggal' : DateFormat('dd MMMM yyyy').format(_selectedDate!),
            icon: Icons.calendar_today_rounded,
            onTap: _selectDate,
          ),
          const SizedBox(height: 16),
          // Start & End Time Fields
          Row(
            children: [
              Expanded(
                child: _buildPickerField(
                  label: 'Jam Mulai',
                  value: _startTime == null ? 'Pilih Jam' : _formatTimeOfDay(_startTime),
                  icon: Icons.access_time_rounded,
                  onTap: _selectStartTime,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildPickerField(
                  label: 'Jam Selesai',
                  value: _endTime == null ? 'Pilih Jam' : _formatTimeOfDay(_endTime),
                  icon: Icons.access_time_rounded,
                  onTap: _selectEndTime,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.orange.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.withAlpha(30)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: Colors.orange, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Setelah reschedule dikirim, status booking akan kembali ke Menunggu dan psikolog perlu menyetujui jadwal baru.',
                    style: TextStyle(color: Colors.orange[800], fontSize: 11, height: 1.3),
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
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Kirim Reschedule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPickerField({
    required String label,
    required String value,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF475569)),
        ),
        const SizedBox(height: 6),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Icon(icon, size: 18, color: AppColors.outline),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    value,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: value.startsWith('Pilih') ? AppColors.outline.withAlpha(150) : const Color(0xFF1E293B),
                      fontWeight: value.startsWith('Pilih') ? FontWeight.normal : FontWeight.bold,
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
}

// ─── Medical Record Sheet ─────────────────────────────────────────────────────

class _MedicalRecordSheet extends StatelessWidget {
  final StudentCounselingProvider provider;
  const _MedicalRecordSheet({required this.provider});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(width: 48, height: 5,
              decoration: BoxDecoration(color: Colors.grey.withAlpha(50), borderRadius: BorderRadius.circular(10))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text('Rekam Medis Saya',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900)),
          ),
          Expanded(
            child: ChangeNotifierProvider.value(
              value: provider,
              child: Consumer<StudentCounselingProvider>(
                builder: (context, p, _) {
                  if (p.medicalRecordLoading) return const Center(child: CircularProgressIndicator());
                  final records = p.myMedicalRecord['records'] as List? ?? [];
                  final summary = p.myMedicalRecord['summary'] as Map<String, dynamic>? ?? {};
                  if (records.isEmpty) {
                    return Center(child: Text('Belum ada catatan sesi',
                        style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)));
                  }
                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Summary card
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withAlpha(30)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.summarize_rounded, color: AppColors.primary),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Total: ${summary['total_records'] ?? 0} catatan',
                                    style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                                Text('Status terkini: ${summary['latest_status'] ?? '-'}',
                                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      ...records.map((r) {
                        final rec = r as Map<String, dynamic>;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(rec['display_date']?.toString() ?? '-',
                                      style: AppTextStyles.labelSm.copyWith(
                                          color: AppColors.outline, fontWeight: FontWeight.bold)),
                                  Text(rec['type']?.toString() ?? '-',
                                      style: AppTextStyles.labelSm.copyWith(
                                          color: AppColors.primary, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              if ((rec['complaint']?.toString() ?? '').isNotEmpty)
                                Text('Keluhan: ${rec['complaint']}',
                                    style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF475569))),
                              if ((rec['recommendation']?.toString() ?? '').isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text('Rekomendasi: ${rec['recommendation']}',
                                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
                              ],
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _buildChip('Mood: ${rec['mood'] ?? '-'}', Colors.blue),
                                  const SizedBox(width: 8),
                                  _buildChip(rec['status']?.toString() ?? '-', Colors.green),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
