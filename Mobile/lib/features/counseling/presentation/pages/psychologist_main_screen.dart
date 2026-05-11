import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_dashboard_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/counseling_bottom_nav_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/patient_list_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_settings_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';

class PsychologistMainScreen extends StatefulWidget {
  const PsychologistMainScreen({super.key});

  @override
  State<PsychologistMainScreen> createState() => _PsychologistMainScreenState();
}

class _PsychologistMainScreenState extends State<PsychologistMainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const PsychologistDashboardScreen(),
    const PatientListScreen(showBackButton: false),
    const PsychologistSettingsScreen(showBackButton: false),
  ];

  @override
  void initState() {
    super.initState();
    // Load dashboard data after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PsychologistDashboardProvider>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: CounselingBottomNavBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
      ),
    );
  }
}
