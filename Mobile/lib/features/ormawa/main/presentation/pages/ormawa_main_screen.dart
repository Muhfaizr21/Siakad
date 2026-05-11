import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/pages/ormawa_dashboard_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/presentation/widgets/ormawa_bottom_nav_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/finance/presentation/pages/ormawa_finance_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/pkkmb/presentation/pages/ormawa_pkkmb_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/settings/presentation/pages/ormawa_settings_screen.dart';

class OrmawaMainScreen extends StatefulWidget {
  const OrmawaMainScreen({super.key});

  @override
  State<OrmawaMainScreen> createState() => _OrmawaMainScreenState();
}

class _OrmawaMainScreenState extends State<OrmawaMainScreen> {
  int _currentIndex = 0;

  Widget _buildScreen(int index) {
    switch (index) {
      case 0:
        return const OrmawaDashboardScreen(key: PageStorageKey('ormawa_dash'));
      case 1:
        return const OrmawaProposalScreen(key: PageStorageKey('ormawa_proposal'), showBackButton: false);
      case 2:
        return const OrmawaPKKMBScreen(key: PageStorageKey('ormawa_pkkmb'), showBackButton: false);
      case 3:
        return const OrmawaFinanceScreen(key: PageStorageKey('ormawa_finance'), showBackButton: false);
      case 4:
        return const OrmawaSettingsScreen(key: PageStorageKey('ormawa_settings'), showBackButton: false);
      default:
        return const OrmawaDashboardScreen();
    }
  }

  void _onNavigate(int index) {
    if (index == _currentIndex) return;
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildScreen(_currentIndex),
      bottomNavigationBar: OrmawaBottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onNavigate,
      ),
      extendBody: true,
    );
  }
}
