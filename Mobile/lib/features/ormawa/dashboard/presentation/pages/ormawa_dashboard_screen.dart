import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:intl/intl.dart';

// Unified Core Widgets
import 'package:bkuhub_mobile/core/widgets/unified_section_header.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';

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
      backgroundColor: const Color(0xFFF8FAFC),
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
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: UnifiedSectionHeader(title: 'Layanan Administrasi'),
                  ),
                  const SizedBox(height: 10),
                  const OrmawaServiceGrid(),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: UnifiedSectionHeader(
                      title: 'Proposal Terbaru',
                      onSeeAll: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const OrmawaProposalScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  const OrmawaProposalList(),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: UnifiedSectionHeader(
                      title: 'Agenda Kegiatan',
                      onSeeAll: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const OrmawaKalenderScreen()),
                        );
                      },
                    ),
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

  // Removed local section header methods

  Widget _buildAgendaCard(OrmawaAgenda agenda) {
    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrmawaAgendaDetailScreen(agenda: agenda),
          ),
        );
      },
      child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.event_outlined, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    agenda.title,
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${DateFormat('dd MMM').format(agenda.date)} • ${DateFormat('HH:mm').format(agenda.date)} - ${DateFormat('HH:mm').format(agenda.endDate)}',
                    style: AppTextStyles.labelMd.copyWith(color: AppColors.neutral600),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                agenda.status,
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.primary.withOpacity(0.9), 
                  fontSize: 10, 
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ),
      );
  }

  Widget _buildEmptyState(String message) {
    return UnifiedCard(
      child: Column(
        children: [
          Icon(Icons.event_note_rounded, color: AppColors.neutral400, size: 40),
          const SizedBox(height: 12),
          Text(
            message,
            style: AppTextStyles.bodyMd.copyWith(
              color: AppColors.neutral600,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
