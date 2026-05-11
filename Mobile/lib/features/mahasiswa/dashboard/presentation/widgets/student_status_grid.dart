import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_shimmer.dart';

// Screens
import 'package:bkuhub_mobile/features/mahasiswa/health/presentation/pages/health_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/kencana_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/achievement/presentation/pages/achievement_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/scholarship/presentation/pages/scholarship_screen.dart';

class StudentStatusGrid extends StatelessWidget {
  final bool isLoading;
  final int completedMissions;
  final int totalMissions;
  final int totalAchievements;
  final int appliedScholarships;
  final dynamic latestHealth;

  const StudentStatusGrid({
    super.key,
    required this.isLoading,
    required this.completedMissions,
    required this.totalMissions,
    required this.totalAchievements,
    required this.appliedScholarships,
    required this.latestHealth,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      padding: EdgeInsets.zero,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.8,
      children: [
        if (isLoading) ...[
          BkuShimmer(
            width: MediaQuery.of(context).size.width,
            height: 100,
            borderRadius: const BorderRadius.all(Radius.circular(24)),
          ),
          BkuShimmer(
            width: MediaQuery.of(context).size.width,
            height: 100,
            borderRadius: const BorderRadius.all(Radius.circular(24)),
          ),
          BkuShimmer(
            width: MediaQuery.of(context).size.width,
            height: 100,
            borderRadius: const BorderRadius.all(Radius.circular(24)),
          ),
          BkuShimmer(
            width: MediaQuery.of(context).size.width,
            height: 100,
            borderRadius: const BorderRadius.all(Radius.circular(24)),
          ),
        ] else ...[
          _StatusItem(
            label: 'PKKMB',
            value: '$completedMissions/$totalMissions Misi',
            subValue: 'Progres Kamu',
            icon: Icons.auto_awesome_rounded,
            color: Colors.orange,
            target: const KencanaScreen(),
          ),
          _StatusItem(
            label: 'Prestasi',
            value: '$totalAchievements Sertifikat',
            subValue: 'Capaian Kamu',
            icon: Icons.emoji_events_rounded,
            color: Colors.blue,
            target: const AchievementScreen(),
          ),
          _StatusItem(
            label: 'Beasiswa',
            value: '$appliedScholarships Aktif',
            subValue: 'Pendaftaran',
            icon: Icons.school_rounded,
            color: Colors.green,
            target: const ScholarshipScreen(),
          ),
          _StatusItem(
            label: 'Kesehatan',
            value: latestHealth?.bmiStatus ?? 'Normal',
            subValue: 'Skor BMI: ${latestHealth?.bmi.toStringAsFixed(1) ?? "0.0"}',
            icon: Icons.favorite_rounded,
            color: Colors.redAccent,
            target: const HealthScreen(),
          ),
        ],
      ],
    );
  }
}

class _StatusItem extends StatelessWidget {
  final String label;
  final String value;
  final String subValue;
  final IconData icon;
  final Color color;
  final Widget target;

  const _StatusItem({
    required this.label,
    required this.value,
    required this.subValue,
    required this.icon,
    required this.color,
    required this.target,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => target),
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.surfaceVariant),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.outline,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: AppTextStyles.labelMd.copyWith(
                      fontWeight: FontWeight.w900,
                      fontSize: 13,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subValue,
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.outline,
                      fontSize: 8,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
