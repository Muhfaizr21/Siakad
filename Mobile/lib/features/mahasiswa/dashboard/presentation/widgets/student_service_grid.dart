import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

// Screens
import 'package:bkuhub_mobile/features/mahasiswa/health/presentation/pages/health_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/student_voice/presentation/pages/student_voice_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/counseling/presentation/pages/counseling_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/kencana_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/achievement/presentation/pages/achievement_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/scholarship/presentation/pages/scholarship_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/organisasi_screen.dart';
import 'package:bkuhub_mobile/features/profile/presentation/pages/profile_screen.dart';

class StudentServiceGrid extends StatelessWidget {
  const StudentServiceGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      padding: EdgeInsets.zero,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      mainAxisSpacing: 16,
      crossAxisSpacing: 0,
      childAspectRatio: 0.85,
      children: [
        _ServiceIcon(
          label: 'Beasiswa',
          icon: Icons.school_rounded,
          color: Colors.green,
          target: const ScholarshipScreen(),
        ),
        _ServiceIcon(
          label: 'Prestasi',
          icon: Icons.emoji_events_rounded,
          color: Colors.blue,
          target: const AchievementScreen(),
        ),
        _ServiceIcon(
          label: 'PKKMB',
          icon: Icons.auto_awesome_rounded,
          color: Colors.orange,
          target: const KencanaScreen(),
        ),
        _ServiceIcon(
          label: 'Konseling',
          icon: Icons.psychology_rounded,
          color: Colors.purple,
          target: const CounselingScreen(),
        ),
        _ServiceIcon(
          label: 'Aspirasi',
          icon: Icons.campaign_rounded,
          color: Colors.red,
          target: const StudentVoiceScreen(),
        ),
        _ServiceIcon(
          label: 'Kesehatan',
          icon: Icons.monitor_heart_rounded,
          color: Colors.teal,
          target: const HealthScreen(),
        ),
        _ServiceIcon(
          label: 'Organisasi',
          icon: Icons.groups_rounded,
          color: Colors.cyan,
          target: const OrganisasiScreen(),
        ),
        _ServiceIcon(
          label: 'Profil',
          icon: Icons.person_rounded,
          color: Colors.blueGrey,
          target: const ProfileScreen(),
        ),
      ],
    );
  }
}

class _ServiceIcon extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Widget? target;

  const _ServiceIcon({
    required this.label,
    required this.icon,
    required this.color,
    this.target,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (target != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => target!),
          );
        }
      },
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppTextStyles.labelSm.copyWith(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
