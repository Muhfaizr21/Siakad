import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class PsychologistBookingsScreen extends StatefulWidget {
  const PsychologistBookingsScreen({super.key});

  @override
  State<PsychologistBookingsScreen> createState() => _PsychologistBookingsScreenState();
}

class _PsychologistBookingsScreenState extends State<PsychologistBookingsScreen> {
  int _selectedTabIndex = 0;

  final List<String> _tabs = ['Semua', 'Menunggu', 'Dikonfirmasi', 'Selesai', 'Ditolak'];

  final List<Map<String, dynamic>> _bookings = [
    {
      'name': 'Ahmad Rizki Pratama',
      'nim': '2021310001',
      'date': 'Senin, 12 Mei 2026',
      'time': '09:00 - 10:00',
      'issue': 'Stres Akademik',
      'status': 'Menunggu',
      'avatar': 'AR',
      'avatarColor': Color(0xFF3B82F6),
      'note': 'Mahasiswa mengalami tekanan tinggi menjelang UAS dan kesulitan mengatur waktu belajar.',
    },
    {
      'name': 'Siti Rahayu Putri',
      'nim': '2022310042',
      'date': 'Senin, 12 Mei 2026',
      'time': '10:30 - 11:30',
      'issue': 'Kecemasan (Anxiety)',
      'status': 'Dikonfirmasi',
      'avatar': 'SR',
      'avatarColor': Color(0xFF10B981),
      'note': 'Merasa cemas berlebihan saat presentasi di depan kelas dan berinteraksi dengan orang baru.',
    },
    {
      'name': 'Budi Santoso',
      'nim': '2020310087',
      'date': 'Selasa, 13 Mei 2026',
      'time': '13:00 - 14:00',
      'issue': 'Masalah Keluarga',
      'status': 'Menunggu',
      'avatar': 'BS',
      'avatarColor': Color(0xFF8B5CF6),
      'note': 'Konflik dengan orang tua terkait pilihan jurusan kuliah yang berdampak pada motivasi belajar.',
    },
    {
      'name': 'Dewi Lestari',
      'nim': '2021310055',
      'date': 'Rabu, 14 Mei 2026',
      'time': '14:30 - 15:30',
      'issue': 'Krisis Identitas',
      'status': 'Dikonfirmasi',
      'avatar': 'DL',
      'avatarColor': Color(0xFFF59E0B),
      'note': 'Kebingungan tentang tujuan hidup dan arah karir setelah lulus.',
    },
    {
      'name': 'Fajar Nugroho',
      'nim': '2022310019',
      'date': 'Rabu, 14 Mei 2026',
      'time': '16:00 - 17:00',
      'issue': 'Stres Akademik',
      'status': 'Selesai',
      'avatar': 'FN',
      'avatarColor': Color(0xFFEF4444),
      'note': 'Sudah ditangani. Follow-up minggu depan direkomendasikan.',
    },
  ];

  List<Map<String, dynamic>> get _filteredBookings {
    if (_selectedTabIndex == 0) return _bookings;
    final statusFilter = _tabs[_selectedTabIndex];
    return _bookings.where((b) => b['status'] == statusFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final waiting = _bookings.where((b) => b['status'] == 'Menunggu').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Booking Masuk',
            info: 'Kelola & konfirmasi permintaan sesi konseling',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (waiting > 0) ...[
                  const SizedBox(height: 16),
                  _buildPendingBanner(waiting),
                ],
                const SizedBox(height: 16),
                _buildTabs(),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    '${_filteredBookings.length} Permintaan',
                    style: AppTextStyles.titleMd.copyWith(
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                _buildBookingList(),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingBanner(int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [const Color(0xFFF59E0B).withAlpha(30), const Color(0xFFF59E0B).withAlpha(10)],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF59E0B).withAlpha(80)),
        ),
        child: Row(
          children: [
            const Icon(Icons.pending_actions_rounded, color: Color(0xFFF59E0B), size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '$count permintaan booking menunggu konfirmasi kamu!',
                style: AppTextStyles.labelMd.copyWith(
                  color: const Color(0xFF92400E),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        physics: const BouncingScrollPhysics(),
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTabIndex = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.grey.withAlpha(50),
                ),
                boxShadow: isSelected
                    ? [BoxShadow(color: AppColors.primary.withAlpha(50), blurRadius: 8, offset: const Offset(0, 4))]
                    : null,
              ),
              alignment: Alignment.center,
              child: Text(
                _tabs[index],
                style: AppTextStyles.labelMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookingList() {
    final list = _filteredBookings;
    if (list.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text('Tidak ada booking', style: AppTextStyles.bodyMd.copyWith(color: Colors.grey)),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) => _buildBookingCard(list[index]),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final status = booking['status'] as String;
    final isWaiting = status == 'Menunggu';
    final isDone = status == 'Selesai';

    Color statusColor;
    IconData statusIcon;
    if (isWaiting) {
      statusColor = const Color(0xFFF59E0B);
      statusIcon = Icons.hourglass_empty_rounded;
    } else if (isDone) {
      statusColor = const Color(0xFF10B981);
      statusIcon = Icons.check_circle_outline_rounded;
    } else {
      statusColor = AppColors.primary;
      statusIcon = Icons.event_available_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isWaiting ? const Color(0xFFF59E0B).withAlpha(80) : Colors.grey.withAlpha(30)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 26,
                  backgroundColor: (booking['avatarColor'] as Color).withAlpha(30),
                  child: Text(
                    booking['avatar'],
                    style: TextStyle(
                      color: booking['avatarColor'] as Color,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking['name'],
                        style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        booking['nim'],
                        style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 12, color: statusColor),
                      const SizedBox(width: 4),
                      Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.withAlpha(30)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildInfoChip(Icons.calendar_today_rounded, booking['date']),
                    const SizedBox(width: 12),
                    _buildInfoChip(Icons.access_time_rounded, booking['time']),
                  ],
                ),
                const SizedBox(height: 8),
                _buildInfoChip(Icons.psychology_rounded, booking['issue'], color: AppColors.primary),
                const SizedBox(height: 8),
                Text(
                  booking['note'],
                  style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), height: 1.5),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (isWaiting) ...[
            Divider(height: 1, color: Colors.grey.withAlpha(30)),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showActionDialog(booking, false),
                      icon: const Icon(Icons.close_rounded, size: 16),
                      label: const Text('Tolak', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFEF4444),
                        side: const BorderSide(color: Color(0xFFEF4444)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: () => _showActionDialog(booking, true),
                      icon: const Icon(Icons.check_rounded, size: 16),
                      label: const Text('Konfirmasi', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, {Color? color}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color ?? Colors.grey[500]),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: color ?? Colors.grey[600],
            fontWeight: color != null ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  void _showActionDialog(Map<String, dynamic> booking, bool isConfirm) {
    // Capture messenger dari konteks layar (bukan dialog) sebelum showDialog dibuka
    final messenger = ScaffoldMessenger.of(context);

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Icon(
              isConfirm ? Icons.event_available_rounded : Icons.event_busy_rounded,
              color: isConfirm ? AppColors.primary : const Color(0xFFEF4444),
              size: 56,
            ),
            const SizedBox(height: 16),
            Text(
              isConfirm ? 'Konfirmasi Booking?' : 'Tolak Booking?',
              style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              isConfirm
                  ? 'Mahasiswa ${booking['name']} akan mendapat notifikasi bahwa booking-nya dikonfirmasi.'
                  : 'Mahasiswa ${booking['name']} akan mendapat notifikasi bahwa booking-nya ditolak.',
              textAlign: TextAlign.center,
              style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF64748B), height: 1.5),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: BorderSide(color: Colors.grey.withAlpha(100)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      final name = booking['name'];
                      setState(() {
                        booking['status'] = isConfirm ? 'Dikonfirmasi' : 'Ditolak';
                      });
                      Navigator.pop(dialogContext);
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text(isConfirm
                              ? 'Booking $name berhasil dikonfirmasi!'
                              : 'Booking $name berhasil ditolak.'),
                          backgroundColor: isConfirm ? AppColors.primary : const Color(0xFFEF4444),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: isConfirm ? AppColors.primary : const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      isConfirm ? 'Konfirmasi' : 'Ya, Tolak',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                      maxLines: 1,
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
