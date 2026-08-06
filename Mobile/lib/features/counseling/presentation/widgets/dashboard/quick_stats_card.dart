import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class QuickStatsCard extends StatelessWidget {
  final int totalAppointments;
  final String finishedToday;
  final String waiting;
  final String newAppointments;
  final String finishedMonth;

  const QuickStatsCard({
    super.key,
    required this.totalAppointments,
    required this.finishedToday,
    required this.waiting,
    required this.newAppointments,
    required this.finishedMonth,
  });

  String _todayLabel() {
    try {
      final now = DateTime.now();
      const dayNames = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Minggu',
      ];
      const monthNames = [
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
      final day = dayNames[now.weekday - 1];
      final month = monthNames[now.month - 1];
      return '$day, ${now.day} $month ${now.year}'.toUpperCase();
    } catch (_) {
      return DateTime.now().toString().substring(0, 10).toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF001A54), Color(0xFF003399), Color(0xFF0044BB)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF001A54).withAlpha(40),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _todayLabel(),
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white.withAlpha(120),
                        fontWeight: FontWeight.w900,
                        fontSize: 9,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Janji Temu Hari Ini & Mendatang',
                      style: AppTextStyles.labelMd.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      totalAppointments.toString(),
                      style: AppTextStyles.titleLg.copyWith(
                        color: Colors.white,
                        fontSize: 44,
                        fontWeight: FontWeight.w900,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'sesi konseling hari ini dan yang akan datang',
                      style: AppTextStyles.labelSm.copyWith(
                        color: Colors.white.withAlpha(150),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.event_available_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 1,
            width: double.infinity,
            color: Colors.white.withAlpha(30),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryItem(
                Icons.task_alt_rounded,
                finishedToday,
                'Selesai\nHari Ini',
                const Color(0xFF10B981),
              ),
              _buildSummaryItem(
                Icons.pending_actions_rounded,
                waiting,
                'Menunggu',
                Colors.amber,
              ),
              _buildSummaryItem(
                Icons.notification_important_rounded,
                newAppointments,
                'Baru\nHari Ini',
                const Color(0xFFF43F5E),
              ),
              _buildSummaryItem(
                Icons.calendar_month_rounded,
                finishedMonth,
                'Selesai\nBulan Ini',
                const Color(0xFF60A5FA),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(
    IconData icon,
    String value,
    String label,
    Color iconColor,
  ) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(40),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 16),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleMd.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: Colors.white.withAlpha(150),
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
