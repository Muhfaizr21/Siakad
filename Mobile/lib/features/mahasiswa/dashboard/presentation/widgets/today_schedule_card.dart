import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class TodayScheduleCard extends StatelessWidget {
  const TodayScheduleCard({super.key});

  void _showWeeklySchedule(BuildContext context) {
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
                  'Jadwal Kuliah',
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
              child: ListView(
                children: [
                  _buildDaySchedule('Senin', [
                    {'matkul': 'Algoritma & Pemrograman', 'time': '08:00 - 10:30', 'room': 'Lab Komputer 1'},
                    {'matkul': 'Matematika Diskrit', 'time': '13:00 - 15:30', 'room': 'Ruang 302'},
                  ]),
                  _buildDaySchedule('Selasa', [
                    {'matkul': 'Basis Data', 'time': '10:00 - 12:30', 'room': 'Lab Komputer 2'},
                  ]),
                  _buildDaySchedule('Rabu', []),
                  _buildDaySchedule('Kamis', [
                    {'matkul': 'Jaringan Komputer', 'time': '08:00 - 10:30', 'room': 'Lab Komputer 3'},
                    {'matkul': 'Bahasa Inggris', 'time': '11:00 - 12:30', 'room': 'Ruang 101'},
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDaySchedule(String day, List<Map<String, String>> classes) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(
            day,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ),
        if (classes.isEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 12, bottom: 12),
            child: Text('Tidak ada jadwal', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
          )
        else
          ...classes.map((c) => Container(
                margin: const EdgeInsets.only(left: 12, bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant.withAlpha(30),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.book_rounded, color: AppColors.primary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c['matkul']!, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('${c['time']} • ${c['room']}', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
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
                      'Jadwal Hari Ini',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.outline,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Rabu, 06 Mei',
                      style: AppTextStyles.labelMd.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => _showWeeklySchedule(context),
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
          _buildScheduleItem(context,
            time: '08:00 - 10:30',
            subject: 'Algoritma & Pemrograman',
            room: 'Lab Komputer 1',
            isOngoing: false,
          ),
          _buildScheduleItem(context,
            time: '13:00 - 15:30',
            subject: 'Matematika Diskrit',
            room: 'Gedung B - Ruang 302',
            isOngoing: true,
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(BuildContext context, {
    required String time,
    required String subject,
    required String room,
    bool isOngoing = false,
  }) {
    final statusColor = isOngoing ? const Color(0xFF10B981) : AppColors.outline;
    
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
        onTap: () => _showSubjectDetail(context, subject, room, time, isOngoing),
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
                          time,
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
                      subject,
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
                        Text(
                          room,
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.outline,
                            fontSize: 11,
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

  void _showSubjectDetail(BuildContext context, String subject, String room, String time, bool isOngoing) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.5,
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
                  child: const Icon(Icons.book_rounded, color: AppColors.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Detail Mata Kuliah',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                      ),
                      Text(
                        subject,
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
            const SizedBox(height: 32),
            _buildDetailInfo(Icons.person_rounded, 'Dosen Pengampu', 'Dr. Ir. H. Ahmad Fauzi, M.T.'),
            _buildDetailInfo(Icons.timer_rounded, 'Waktu & Durasi', '$time (150 Menit)'),
            _buildDetailInfo(Icons.location_on_rounded, 'Ruangan', room),
            _buildDetailInfo(Icons.layers_rounded, 'Bobot SKS', '3 SKS (Teori & Praktikum)'),
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
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.outline.withAlpha(150)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10),
              ),
              Text(
                value,
                style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, color: Colors.black87),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
