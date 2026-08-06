import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/pkkmb_event.dart';

class TodayScheduleCard extends StatelessWidget {
  const TodayScheduleCard({super.key});

  String _formatDate(DateTime dt) {
    final days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    final months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    String dayName = days[dt.weekday - 1];
    String monthName = months[dt.month - 1];
    String dayNum = dt.day.toString().padLeft(2, '0');
    return '$dayName, $dayNum $monthName';
  }

  void _showWeeklySchedule(BuildContext context, List<PkkmbEvent> events) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Jadwal Kegiatan PKKMB',
                  style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: events.isEmpty
                  ? Center(
                      child: Text(
                        'Belum ada agenda PKKMB terdaftar',
                        style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
                      ),
                    )
                  : ListView.builder(
                      itemCount: events.length,
                      itemBuilder: (context, index) {
                        final event = events[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant.withAlpha(30),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.event_note_rounded, color: AppColors.primary, size: 24),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      event.judul,
                                      style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      event.deskripsi,
                                      style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time_filled_rounded, size: 14, color: AppColors.outline),
                                        const SizedBox(width: 4),
                                        Text(
                                          _formatDate(event.tanggal),
                                          style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                                        ),
                                        const SizedBox(width: 12),
                                        const Icon(Icons.location_on_rounded, size: 14, color: AppColors.outline),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            event.lokasi,
                                            style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final events = student.pkkmbEvents;
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    // Filter events for today or future
    final upcomingEvents = events.where((e) {
      final evDate = DateTime(e.tanggal.year, e.tanggal.month, e.tanggal.day);
      return evDate.isAfter(today) || evDate.isAtSameMomentAs(today);
    }).toList();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(30), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Agenda PKKMB',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.outline,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(now),
                      style: AppTextStyles.labelMd.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => _showWeeklySchedule(context, events),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_rounded,
                          color: AppColors.primary,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Lihat Jadwal',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(color: Colors.grey.withAlpha(30), height: 1),
          const SizedBox(height: 16),
          if (upcomingEvents.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Icon(Icons.event_available_rounded, size: 48, color: AppColors.outline.withAlpha(100)),
                  const SizedBox(height: 12),
                  Text(
                    'Tidak ada kegiatan PKKMB terdekat',
                    style: AppTextStyles.labelMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Semua agenda saat ini sudah terlaksana dengan baik.',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.outline.withAlpha(180)),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ] else ...[
            ...upcomingEvents.take(2).map((event) {
              final isToday = event.tanggal.year == now.year && event.tanggal.month == now.month && event.tanggal.day == now.day;
              return _buildScheduleItem(context, event, isOngoing: isToday);
            }),
          ],
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(BuildContext context, PkkmbEvent event, {
    bool isOngoing = false,
  }) {
    final statusColor = isOngoing ? const Color(0xFF10B981) : AppColors.outline;
    String timeStr = '${event.tanggal.hour.toString().padLeft(2, '0')}:${event.tanggal.minute.toString().padLeft(2, '0')}';
    if (timeStr == '00:00') {
      timeStr = 'Full Day';
    }
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: isOngoing ? statusColor.withAlpha(8) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isOngoing ? statusColor.withAlpha(40) : AppColors.surfaceVariant,
          width: 1.5,
        ),
        boxShadow: isOngoing ? [
          BoxShadow(
            color: statusColor.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ] : null,
      ),
      child: InkWell(
        onTap: () => _showEventDetail(context, event),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 5,
                height: 40,
                decoration: BoxDecoration(
                  color: isOngoing ? statusColor : AppColors.outline.withAlpha(50),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          isOngoing ? 'HARI INI • $timeStr' : _formatDate(event.tanggal),
                          style: AppTextStyles.labelSm.copyWith(
                            color: isOngoing ? statusColor : AppColors.outline,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                        if (isOngoing) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'SEDANG BERJALAN',
                              style: AppTextStyles.labelSm.copyWith(
                                color: Colors.white,
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      event.judul,
                      style: AppTextStyles.labelMd.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_rounded,
                          size: 12,
                          color: AppColors.outline.withAlpha(150),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            event.lokasi,
                            style: AppTextStyles.labelSm.copyWith(
                              color: AppColors.outline,
                              fontSize: 11,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: AppColors.outline.withAlpha(100),
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showEventDetail(BuildContext context, PkkmbEvent event) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.55,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.event_note_rounded, color: AppColors.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Detail Kegiatan PKKMB',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                      ),
                      Text(
                        event.judul,
                        style: AppTextStyles.titleLg.copyWith(
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailInfo(Icons.description_rounded, 'Deskripsi Kegiatan', event.deskripsi),
            _buildDetailInfo(Icons.timer_rounded, 'Waktu Pelaksanaan', _formatDate(event.tanggal)),
            _buildDetailInfo(Icons.location_on_rounded, 'Lokasi / Ruangan', event.lokasi),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailInfo(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.outline.withAlpha(150)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.black87),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
