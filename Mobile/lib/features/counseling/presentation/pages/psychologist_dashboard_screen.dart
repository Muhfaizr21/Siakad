import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/availability_toggle.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/quick_stats_card.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/psychologist_service_grid.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/upcoming_appointments_card.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/psychologist_analytics_card.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/widgets/dashboard/psychologist_security_card.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';

class PsychologistDashboardScreen extends StatefulWidget {
  const PsychologistDashboardScreen({super.key});

  @override
  State<PsychologistDashboardScreen> createState() => _PsychologistDashboardScreenState();
}

class _PsychologistDashboardScreenState extends State<PsychologistDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PsychologistDashboardProvider>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PsychologistDashboardProvider>(
      builder: (context, provider, child) {
        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            slivers: [
              _buildAppBar(context, provider),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('Ringkasan Hari Ini'),
                      const SizedBox(height: 16),
                      QuickStatsCard(
                        totalAppointments: provider.upcomingBookings.length,
                        finished: provider.stats.length > 1 ? '${provider.stats[1]['value'] ?? 0}' : '0',
                        waiting: '${provider.waitingCount}',
                        newAppointments: '${provider.waitingCount}',
                        rating: '${provider.confirmedCount > 0 ? 92 : 0}%',
                      ),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Layanan Utama'),
                      const SizedBox(height: 8),
                      const PsychologistServiceGrid(),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Jadwal Mendatang'),
                      const SizedBox(height: 16),
                      UpcomingAppointmentsCard(
                        bookings: provider.upcomingBookings,
                      ),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Analitik & Tren'),
                      const SizedBox(height: 16),
                      const PsychologistAnalyticsCard(),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Keamanan & Sistem'),
                      const SizedBox(height: 16),
                      const PsychologistSecurityCard(),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAppBar(BuildContext context, PsychologistDashboardProvider provider) {
    return BkuAppBar(
      title: provider.profile?.name ?? 'DR. SARAH SP.PSI',
      subtitle: 'SELAMAT DATANG',
      info: 'NIDN: ${provider.profile?.nidn ?? '-'} • ${provider.profile?.specialization ?? 'PSIKOLOG'}',
      variant: AppBarVariant.psychologist,
      expandedHeight: 210,
      showProfileOnCollapse: true,
      profileImage: Image.network(
        provider.profile?.profileImageUrl ?? 'https://ui-avatars.com/api/?name=P&background=003399&color=fff&size=128',
        fit: BoxFit.cover,
      ),
      child: AvailabilityToggle(
        isAvailable: provider.isAvailable,
        onToggle: (value) => provider.toggleAvailability(),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}