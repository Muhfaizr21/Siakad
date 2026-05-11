import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class QuickStatsCard extends StatelessWidget {
  final int totalAppointments;
  final String finished;
  final String waiting;
  final String newAppointments;
  final String rating;

  const QuickStatsCard({
    super.key,
    required this.totalAppointments,
    required this.finished,
    required this.waiting,
    required this.newAppointments,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF001A54), Color(0xFF003399), Color(0xFF0044BB)],
        ),
        borderRadius: BorderRadius.circular(32),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Jumat, 08 Mei 2026'.toUpperCase(),
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.white.withAlpha(120),
                      fontWeight: FontWeight.w900,
                      fontSize: 9,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Janji Temu Hari Ini',
                    style: AppTextStyles.labelMd.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    totalAppointments.toString(),
                    style: AppTextStyles.titleLg.copyWith(
                      color: Colors.white,
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'sesi konseling terjadwal untuk hari ini',
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.white.withAlpha(150),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(
                  Icons.event_available_rounded,
                  color: Colors.white,
                  size: 40,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            height: 1,
            width: double.infinity,
            color: Colors.white.withAlpha(30),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSummaryItem(Icons.task_alt_rounded, finished, 'Selesai', const Color(0xFF10B981)),
              _buildSummaryItem(Icons.pending_actions_rounded, waiting, 'Menunggu', Colors.amber),
              _buildSummaryItem(Icons.notification_important_rounded, newAppointments, 'Baru', const Color(0xFFF43F5E)),
              _buildSummaryItem(Icons.star_rounded, rating, 'Rating', Colors.orangeAccent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(IconData icon, String value, String label, Color iconColor) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(40),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: 12),
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
          ),
        ],
      ),
    );
  }
}
