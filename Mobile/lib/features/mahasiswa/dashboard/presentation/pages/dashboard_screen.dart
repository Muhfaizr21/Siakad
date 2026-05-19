import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

// Modular Widgets
import 'package:bkuhub_mobile/features/mahasiswa/dashboard/presentation/widgets/today_schedule_card.dart';
import 'package:bkuhub_mobile/features/mahasiswa/dashboard/presentation/widgets/student_service_grid.dart';
import 'package:bkuhub_mobile/features/mahasiswa/dashboard/presentation/widgets/student_status_grid.dart';
import 'package:bkuhub_mobile/features/mahasiswa/dashboard/presentation/widgets/student_agenda_list.dart';

import 'package:bkuhub_mobile/core/providers/navigation_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/notifications/presentation/pages/notifications_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _simulateLoading();
  }

  Future<void> _simulateLoading() async {
    await Future.delayed(const Duration(milliseconds: 1200));
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final navProvider = context.read<NavigationProvider>();
    final name = student.name;
    final totalMissions = student.missions.length;
    final completedMissions = student.missions.where((m) => m.isCompleted).length;
    final totalAchievements = student.achievements.length;
    final latestHealth = student.latestHealthRecord;
    final appliedScholarships = student.scholarships.where((s) => s.applicationStatus != null).length;

    return Scaffold(
      backgroundColor: Colors.white,
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        color: AppColors.primary,
        backgroundColor: Colors.white,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            BkuAppBar(
              title: name,
              subtitle: 'SELAMAT DATANG KEMBALI',
              info: '${student.nim} • SEMESTER ${student.semester}',
              variant: AppBarVariant.student,
              expandedHeight: 180,
              showProfileOnCollapse: true,
              profileImage: const Icon(Icons.person_rounded, color: AppColors.primary, size: 28),
              showNotification: true,
              onNotificationTap: (context, _) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const StudentNotificationsScreen()),
                );
              },
              onProfileTap: () => navProvider.setIndex(4),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    const TodayScheduleCard(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Layanan Mahasiswa'),
                    const SizedBox(height: 12),
                    const StudentServiceGrid(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Status Kamu'),
                    const SizedBox(height: 16),
                    StudentStatusGrid(
                      isLoading: _isLoading,
                      completedMissions: completedMissions,
                      totalMissions: totalMissions,
                      totalAchievements: totalAchievements,
                      appliedScholarships: appliedScholarships,
                      latestHealth: latestHealth,
                    ),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Berita Kampus'),
                    const SizedBox(height: 16),
                    const StudentAgendaList(),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleLg.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w900,
        color: AppColors.primary,
      ),
    );
  }
}
