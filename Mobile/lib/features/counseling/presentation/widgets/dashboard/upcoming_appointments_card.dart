import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class UpcomingAppointmentsCard extends StatelessWidget {
  final List<Map<String, dynamic>> bookings;

  const UpcomingAppointmentsCard({super.key, this.bookings = const []});

  @override
  Widget build(BuildContext context) {
    final displayBookings = bookings.length > 5 ? bookings.sublist(0, 5) : bookings;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 20,
            offset: const Offset(0, 10),
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
                      style: AppTextStyles.labelMd.copyWith(
                        color: AppColors.outline,
                      ),
                    ),
                    Text(
                      _todayDate(),
                      style: AppTextStyles.titleMd.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => context.push(AppRoutes.scheduleManagement),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month_rounded, size: 16, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Lihat Semua',
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
          const Divider(height: 1, indent: 20, endIndent: 20),
          if (displayBookings.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.event_busy_rounded, size: 40, color: Colors.grey[300]),
                    const SizedBox(height: 8),
                    Text('Tidak ada jadwal hari ini', style: AppTextStyles.labelMd.copyWith(color: Colors.grey)),
                  ],
                ),
              ),
            )
          else
            ...displayBookings.asMap().entries.map((entry) {
              final i = entry.key;
              final booking = entry.value;
              final isLast = i == displayBookings.length - 1;
              return _AppointmentItem(
                name: booking['name'] ?? '-',
                id: booking['nim'] ?? '',
                time: booking['time'] ?? '-',
                reason: booking['issue'] ?? '-',
                isActive: booking['status'] == 'Dikonfirmasi',
                isLast: isLast,
              );
            }),
        ],
      ),
    );
  }

  String _todayDate() {
    final now = DateTime.now();
    final days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return '${days[now.weekday - 1]}, ${now.day} ${months[now.month - 1]}';
  }
}

class _AppointmentItem extends StatelessWidget {
  final String name;
  final String id;
  final String time;
  final String reason;
  final bool isActive;
  final bool isLast;

  const _AppointmentItem({
    required this.name,
    required this.id,
    required this.time,
    required this.reason,
    required this.isActive,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        border: isLast ? null : Border(bottom: BorderSide(color: Colors.grey.withAlpha(20))),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (isActive ? const Color(0xFF003399) : Colors.blueGrey).withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isActive ? Icons.videocam_rounded : Icons.person_rounded,
              color: isActive ? const Color(0xFF003399) : Colors.blueGrey,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.bodyLg.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                Text(
                  'NIM: $id • $time',
                  style: AppTextStyles.labelMd.copyWith(
                    color: const Color(0xFF64748B),
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  reason,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF003399),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (isActive)
            ElevatedButton(
              onPressed: () {
                final uri = Uri(
                  path: AppRoutes.sessionNote,
                  queryParameters: {'name': name, 'id': id},
                );
                context.push(uri.toString());
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              child: const Text('Mulai'),
            )
          else
            const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
        ],
      ),
    );
  }
}