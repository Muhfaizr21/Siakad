import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/widgets/unified_bottom_nav_bar.dart';
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/pages/ormawa_dashboard_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/absensi/presentation/pages/ormawa_absensi_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/finance/presentation/pages/ormawa_finance_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/widgets/ormawa_service_grid.dart';

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
        return const OrmawaAbsensiScreen(key: PageStorageKey('ormawa_absensi'), showBackButton: false);
      case 3:
        return const OrmawaFinanceScreen(key: PageStorageKey('ormawa_finance'), showBackButton: false);
      case 4:
        // Menu Lainnya - tampilkan dashboard dengan modal overlay
        return const OrmawaDashboardScreen(key: PageStorageKey('ormawa_dash'));
      default:
        return const OrmawaDashboardScreen();
    }
  }

  void _onNavigate(int index) {
    if (index == _currentIndex && index != 4) return;

    if (index == 4) {
      // Menu Lainnya - tampilkan modal
      _showMoreServicesModal();
      return;
    }

    setState(() {
      _currentIndex = index;
    });
  }

  void _showMoreServicesModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.65,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: const OrmawaServiceGridModal(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildScreen(_currentIndex),
      bottomNavigationBar: UnifiedBottomNavBar.ormawa(
        currentIndex: _currentIndex,
        onTap: _onNavigate,
      ),
      extendBody: true,
    );
  }
}
