import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';

class UpcomingAppointmentsCard extends StatelessWidget {
  final List<Map<String, dynamic>> bookings;

  const UpcomingAppointmentsCard({super.key, this.bookings = const []});

  @override
  Widget build(BuildContext context) {
    // Limit to 4 as requested
    final displayBookings =
        bookings.length > 4 ? bookings.sublist(0, 4) : bookings;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Jadwal Mendatang',
                    style: AppTextStyles.titleMd.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    _todayDate(),
                    style: AppTextStyles.labelMd.copyWith(
                      color: AppColors.outline,
                    ),
                  ),
                ],
              ),
              if (bookings.isNotEmpty)
                TextButton(
                  onPressed: () => context.push(AppRoutes.psychologistBookings),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: EdgeInsets.zero,
                  ),
                  child: const Text(
                    'Lihat Semua',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (displayBookings.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
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
                  Icon(
                    Icons.event_busy_rounded,
                    size: 40,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tidak ada jadwal mendatang',
                    style: AppTextStyles.labelMd.copyWith(color: Colors.grey),
                  ),
                ],
              ),
            ),
          )
        else
          SizedBox(
            height: 160,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              scrollDirection: Axis.horizontal,
              itemCount: displayBookings.length,
              separatorBuilder: (context, index) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final booking = displayBookings[index];
                return _HorizontalAppointmentCard(
                  name: booking['name'] ?? '-',
                  id: booking['nim'] ?? '',
                  time: booking['time'] ?? '-',
                  reason: booking['issue'] ?? '-',
                  isActive: booking['status'] == 'Dikonfirmasi',
                );
              },
            ),
          ),
      ],
    );
  }

  String _todayDate() {
    final now = DateTime.now();
    final days = [
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
      'Minggu',
    ];
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return '${days[now.weekday - 1]}, ${now.day} ${months[now.month - 1]}';
  }
}

class _HorizontalAppointmentCard extends StatelessWidget {
  final String name;
  final String id;
  final String time;
  final String reason;
  final bool isActive;

  const _HorizontalAppointmentCard({
    required this.name,
    required this.id,
    required this.time,
    required this.reason,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color:
              isActive ? AppColors.primary.withAlpha(50) : Colors.transparent,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color:
                isActive
                    ? AppColors.primary.withAlpha(20)
                    : Colors.black.withAlpha(5),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (isActive ? AppColors.primary : Colors.blueGrey)
                      .withAlpha(15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isActive ? Icons.videocam_rounded : Icons.person_rounded,
                  color: isActive ? AppColors.primary : Colors.blueGrey,
                  size: 14,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF1E293B),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      'NIM: $id',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF64748B),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.schedule_rounded, size: 12, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(
                time,
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            reason,
            style: AppTextStyles.labelSm.copyWith(color: Colors.grey[700]),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),
          if (isActive)
            SizedBox(
              width: double.infinity,
              height: 32,
              child: ElevatedButton(
                onPressed: () => context.push(AppRoutes.psychologistBookings),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: EdgeInsets.zero,
                ),
                child: const Text(
                  'Tangani',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            )
          else
            Container(
              width: double.infinity,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.grey.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Menunggu Waktu',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
