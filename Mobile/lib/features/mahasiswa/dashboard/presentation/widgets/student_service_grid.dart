import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/coming_soon_screen.dart';

// Screens
import 'package:bkuhub_mobile/features/mahasiswa/health/presentation/pages/health_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/student_voice/presentation/pages/student_voice_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/counseling/presentation/pages/counseling_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/kencana_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/achievement/presentation/pages/achievement_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/scholarship/presentation/pages/scholarship_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/organisasi_screen.dart';

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
          label: 'Lainnya',
          icon: Icons.grid_view_rounded,
          color: Colors.blueGrey,
          isMore: true,
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
  final bool isMore;

  const _ServiceIcon({
    required this.label,
    required this.icon,
    required this.color,
    this.target,
    this.isMore = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (isMore) {
          _showMoreServices(context);
        } else if (target != null) {
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

  void _showMoreServices(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
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
            const SizedBox(height: 32),
            Text(
              'Semua Layanan BKU',
              style: AppTextStyles.titleLg.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.count(
                crossAxisCount: 4,
                mainAxisSpacing: 24,
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
                    label: 'Keuangan',
                    icon: Icons.payments_rounded,
                    color: Colors.amber,
                    target: const ComingSoonScreen(featureName: 'Layanan Keuangan'),
                  ),
                  _ServiceIcon(
                    label: 'Perpustakaan',
                    icon: Icons.menu_book_rounded,
                    color: Colors.brown,
                    target: const ComingSoonScreen(featureName: 'Layanan Perpustakaan'),
                  ),
                  _ServiceIcon(
                    label: 'Akademik',
                    icon: Icons.library_books_rounded,
                    color: Colors.indigo,
                    target: const ComingSoonScreen(featureName: 'Layanan Akademik'),
                  ),
                  _ServiceIcon(
                    label: 'Fasilitas',
                    icon: Icons.apartment_rounded,
                    color: Colors.blueGrey,
                    target: const ComingSoonScreen(featureName: 'Layanan Fasilitas'),
                  ),
                  _ServiceIcon(
                    label: 'E-Learning',
                    icon: Icons.computer_rounded,
                    color: Colors.lightBlue,
                    target: const ComingSoonScreen(featureName: 'Layanan E-Learning'),
                  ),
                  _ServiceIcon(
                    label: 'Alumni',
                    icon: Icons.history_edu_rounded,
                    color: Colors.deepOrange,
                    target: const ComingSoonScreen(featureName: 'Layanan Alumni'),
                  ),
                  _ServiceIcon(
                    label: 'Kalender',
                    icon: Icons.event_note_rounded,
                    color: Colors.pink,
                    target: const ComingSoonScreen(featureName: 'Kalender Kampus'),
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

// Fix for typo in original screen
class Coming_soon_Screen extends StatelessWidget {
  final String featureName;
  const Coming_soon_Screen({super.key, required this.featureName});

  @override
  Widget build(BuildContext context) {
    return ComingSoonScreen(featureName: featureName);
  }
}
