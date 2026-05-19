import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_shimmer.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/health_record.dart';

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
    IconData healthIcon = Icons.favorite_rounded;
    Color healthColor = Colors.redAccent;
    String healthStatus = 'Normal';
    String healthSub = 'Ketuk untuk skrining';

    if (latestHealth != null && latestHealth is HealthRecord) {
      final HealthRecord record = latestHealth;
      final bmi = record.bmi;
      final bmiStatus = record.bmiStatus;

      // Default values based on BMI
      healthStatus = bmiStatus;
      healthSub = 'Skor BMI: ${bmi.toStringAsFixed(1)}';

      if (bmiStatus == 'Underweight') {
        healthIcon = Icons.health_and_safety_rounded;
        healthColor = Colors.blue;
      } else if (bmiStatus == 'Normal') {
        healthIcon = Icons.spa_rounded;
        healthColor = Colors.green;
      } else if (bmiStatus == 'Overweight') {
        healthIcon = Icons.directions_run_rounded;
        healthColor = Colors.orange;
      } else {
        healthIcon = Icons.warning_amber_rounded;
        healthColor = Colors.red;
      }

      // Check for realistic screening JSON notes
      if (record.notes.isNotEmpty) {
        try {
          if (record.notes.startsWith('{') && record.notes.endsWith('}')) {
            final data = jsonDecode(record.notes) as Map<String, dynamic>;
            if (data['is_screening_realistis'] == true) {
              final stres = data['tingkat_stres'] ?? 3;
              final mood = data['mood'] ?? 'Baik';
              final keluhan = data['daftar_keluhan'] as List?;
              final hasKeluhan = keluhan != null && keluhan.isNotEmpty;

              if (stres >= 8 || record.bmiStatus == 'Obese' || hasKeluhan) {
                healthStatus = 'Perlu Perhatian';
                healthSub = hasKeluhan ? keluhan.first.toString() : 'Stres: $stres/10';
                healthIcon = Icons.warning_amber_rounded;
                healthColor = Colors.red;
              } else if (stres >= 5 || record.bmiStatus == 'Overweight') {
                healthStatus = 'Waspada';
                healthSub = 'Stres: $stres/10 • Mood: $mood';
                healthIcon = Icons.monitor_heart_rounded;
                healthColor = Colors.orange;
              } else {
                healthStatus = 'Sangat Fit';
                healthSub = 'Tidur Cukup • Mood: $mood';
                healthIcon = Icons.spa_rounded;
                healthColor = Colors.teal;
              }
            }
          }
        } catch (_) {
          // Not JSON, fallback to BMI defaults
        }
      }
    }

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
            value: healthStatus,
            subValue: healthSub,
            icon: healthIcon,
            color: healthColor,
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
