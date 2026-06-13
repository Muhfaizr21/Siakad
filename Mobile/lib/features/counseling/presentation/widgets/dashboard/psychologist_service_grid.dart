import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class PsychologistServiceGrid extends StatelessWidget {
  const PsychologistServiceGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 116,
      child: ListView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        children: [
          _ServiceItem(
            title: 'Jadwal',
            icon: Icons.calendar_month_rounded,
            color: const Color(0xFF003399),
            onTap: () => context.push(AppRoutes.scheduleManagement),
          ),
          const SizedBox(width: 16),
          _ServiceItem(
            title: 'Booking',
            icon: Icons.event_note_rounded,
            color: const Color(0xFF06B6D4),
            onTap: () => context.push(AppRoutes.psychologistBookings),
          ),
          const SizedBox(width: 16),
          _ServiceItem(
            title: 'Pasien',
            icon: Icons.people_rounded,
            color: const Color(0xFF10B981),
            onTap: () => context.push(AppRoutes.patientList),
          ),
          const SizedBox(width: 16),
          _ServiceItem(
            title: 'Rujukan',
            icon: Icons.send_rounded,
            color: const Color(0xFF6366F1),
            onTap: () => context.push(AppRoutes.referralManagement),
          ),
          const SizedBox(width: 16),
          _ServiceItem(
            title: 'Analitik',
            icon: Icons.analytics_rounded,
            color: const Color(0xFFF59E0B),
            onTap: () => context.push(AppRoutes.psychologistAnalytics),
          ),
        ],
      ),
    );
  }
}

class _ServiceItem extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _ServiceItem({
    required this.title,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        splashColor: color.withAlpha(30),
        highlightColor: color.withAlpha(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF1E293B),
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
