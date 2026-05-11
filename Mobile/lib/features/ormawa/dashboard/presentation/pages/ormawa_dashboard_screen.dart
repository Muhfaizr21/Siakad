import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:intl/intl.dart';

// Modular Widgets
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/widgets/ormawa_quick_stats.dart';
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/widgets/ormawa_service_grid.dart';
import 'package:bkuhub_mobile/features/ormawa/dashboard/presentation/widgets/ormawa_proposal_list.dart';
import 'package:bkuhub_mobile/features/ormawa/proposal/presentation/pages/ormawa_proposal_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/kalender/presentation/pages/ormawa_kalender_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/kalender/presentation/pages/ormawa_agenda_detail_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/notifications/presentation/pages/ormawa_notification_screen.dart';

class OrmawaDashboardScreen extends StatefulWidget {
  const OrmawaDashboardScreen({super.key});

  @override
  State<OrmawaDashboardScreen> createState() => _OrmawaDashboardScreenState();
}

class _OrmawaDashboardScreenState extends State<OrmawaDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().refreshData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<OrmawaProvider>().refreshData();
        },
        color: AppColors.primary,
        backgroundColor: Colors.white,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          slivers: [
            BkuAppBar(
              title: context.watch<OrmawaProvider>().orgName,
              subtitle: 'PORTAL ADMINISTRATOR',
              info: 'TAHUN AKADEMIK ${context.watch<OrmawaProvider>().academicYear}',
              variant: AppBarVariant.ormawa,
              expandedHeight: 200.0,
              showProfileOnCollapse: true,
              profileImage: Icon(Icons.groups_rounded, color: Colors.white, size: 28),
              isExpandable: true,
              notificationCount: context.watch<OrmawaProvider>().unreadNotificationsCount,
              onNotificationTap: (context, variant) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const OrmawaNotificationScreen()),
                );
              },
              actions: [],
            ),
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  const OrmawaQuickStats(),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildSectionTitle('Layanan Administrasi'),
                  ),
                  const SizedBox(height: 10),
                  const OrmawaServiceGrid(),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildSectionHeader('Proposal Terbaru', () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const OrmawaProposalScreen()),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  const OrmawaProposalList(),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildSectionHeader('Agenda Kegiatan', () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const OrmawaKalenderScreen()),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: context.watch<OrmawaProvider>().agendas.isEmpty
                        ? _buildEmptyState('Belum ada agenda terdekat')
                        : Column(
                            children: context
                                .watch<OrmawaProvider>()
                                .agendas
                                .take(2)
                                .map((agenda) => _buildAgendaCard(agenda))
                                .toList(),
                          ),
                  ),
                  const SizedBox(height: 120),
                ],
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
        color: const Color(0xFF1E293B),
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: AppTextStyles.labelSm.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF64748B),
            letterSpacing: 1.1,
          ),
        ),
        GestureDetector(
          onTap: onTap,
          child: Text(
            'LIHAT SEMUA',
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAgendaCard(OrmawaAgenda agenda) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrmawaAgendaDetailScreen(agenda: agenda),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.blue.withAlpha(10),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.event_available_rounded, color: Colors.blue, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    agenda.title,
                    style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900),
                  ),
                  Text(
                    '${DateFormat('dd MMM').format(agenda.date)} • ${DateFormat('HH:mm').format(agenda.date)} - ${DateFormat('HH:mm').format(agenda.endDate)}',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.blue.withAlpha(20),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                agenda.status,
                style: AppTextStyles.labelSm.copyWith(color: Colors.blue, fontSize: 8, fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(Icons.event_note_rounded, color: AppColors.outline.withAlpha(50), size: 40),
          const SizedBox(height: 12),
          Text(
            message,
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.outline.withAlpha(150),
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
