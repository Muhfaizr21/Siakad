import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/navigation_provider.dart';
import 'package:bkuhub_mobile/core/widgets/custom_bottom_nav_bar.dart';
import 'package:bkuhub_mobile/features/mahasiswa/dashboard/presentation/pages/dashboard_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/kencana/presentation/pages/kencana_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/achievement/presentation/pages/achievement_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/scholarship/presentation/pages/scholarship_screen.dart';
import 'package:bkuhub_mobile/features/profile/presentation/pages/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  // Kita buat fungsi biar layarnya dibuat baru tiap kali dibutuhin (menghindari duplikat element)
  Widget _buildScreen(int index) {
    switch (index) {
      case 0: return const DashboardScreen(key: PageStorageKey('dash_v1'));
      case 1: return const KencanaScreen(key: PageStorageKey('kencana_v1'));
      case 2: return const AchievementScreen(key: PageStorageKey('achieve_v1'));
      case 3: return const ScholarshipScreen(key: PageStorageKey('scholar_v1'));
      case 4: return const ProfileScreen(key: PageStorageKey('profile_v1'));
      default: return const DashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final navProvider = context.watch<NavigationProvider>();
    final currentIndex = navProvider.currentIndex;

    return Scaffold(
      body: _buildScreen(currentIndex),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: currentIndex,
        onTap: (index) => navProvider.setIndex(index),
      ),
      extendBody: true,
    );
  }
}
