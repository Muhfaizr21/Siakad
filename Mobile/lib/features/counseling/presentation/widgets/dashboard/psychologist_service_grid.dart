import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/coming_soon_screen.dart';

class PsychologistServiceGrid extends StatelessWidget {
  const PsychologistServiceGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: GridView.count(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 0,
        childAspectRatio: 0.8,
        children: [
          _ServiceItem(
            title: 'Jadwal',
            icon: Icons.calendar_month_rounded,
            color: const Color(0xFF003399),
            onTap: () => context.push(AppRoutes.scheduleManagement),
          ),
          _ServiceItem(
            title: 'Booking',
            icon: Icons.event_note_rounded,
            color: const Color(0xFF06B6D4),
            onTap: () => context.push(AppRoutes.psychologistBookings),
          ),
          _ServiceItem(
            title: 'Pasien',
            icon: Icons.people_rounded,
            color: const Color(0xFF10B981),
            onTap: () => context.push(AppRoutes.patientList),
          ),
          _ServiceItem(
            title: 'Tindak Lanjut',
            icon: Icons.send_rounded,
            color: const Color(0xFF6366F1),
            onTap: () => context.push(AppRoutes.referralManagement),
          ),
          _ServiceItem(
            title: 'Analitik',
            icon: Icons.analytics_rounded,
            color: const Color(0xFFF59E0B),
            onTap: () => context.push(AppRoutes.psychologistAnalytics),
          ),
          _ServiceItem(
            title: 'Lainnya',
            icon: Icons.grid_view_rounded,
            color: const Color(0xFF64748B),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ComingSoonScreen(featureName: 'Lainnya'))),
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
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF1E293B),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
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
