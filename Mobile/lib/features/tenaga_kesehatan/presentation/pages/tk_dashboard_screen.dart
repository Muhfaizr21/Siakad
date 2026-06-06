import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_dashboard_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/widgets/tk_stat_card.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/pages/tk_main_screen.dart';

class TkDashboardScreen extends StatefulWidget {
  const TkDashboardScreen({super.key});

  @override
  State<TkDashboardScreen> createState() => _TkDashboardScreenState();
}

class _TkDashboardScreenState extends State<TkDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkDashboardProvider>().loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TkDashboardProvider>(
      builder: (context, provider, child) {
        final name = provider.profile?.nama ?? 'Tenaga Kesehatan';
        final imageUrl = provider.profile?.fotoURL ?? '';
        final initials = provider.profile?.initials ?? 'TK';

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            slivers: [
              // App Bar with profile - Consistent with Psychologist
              BkuAppBar(
                title: name,
                subtitle: 'SELAMAT DATANG',
                info: provider.profile?.spesialisasi ?? 'TENAGA KESEHATAN',
                variant: AppBarVariant.nakes,
                expandedHeight: 210,
                showProfileOnCollapse: true,
                showNotification: false,
                profileImage: imageUrl.isNotEmpty
                    ? Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildInitialsAvatar(initials),
                      )
                    : _buildInitialsAvatar(initials),
                child: _buildAvailabilityToggle(provider),
              ),

              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20, top: 18, bottom: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section: Quick Stats - Consistent Card Style
                      _buildSectionHeader('Ringkasan Hari Ini'),
                      const SizedBox(height: 8),
                      _buildStatsGrid(provider),
                      const SizedBox(height: 14),

                      // Section: Quick Actions - Consistent with Psychologist
                      _buildSectionHeader('Layanan Utama'),
                      const SizedBox(height: 8),
                      _buildQuickActionsGrid(context),
                      const SizedBox(height: 14),

                      // Section: Booking Hari Ini
                      _buildSectionHeader('Booking Hari Ini'),
                      const SizedBox(height: 8),
                      _buildBookingList(provider),
                      const SizedBox(height: 14),

                      // Section: Alert
                      if (provider.alerts.isNotEmpty) ...[
                        _buildSectionHeader('Mahasiswa Perlu Perhatian'),
                        const SizedBox(height: 8),
                        _buildAlertList(provider),
                        const SizedBox(height: 14),
                      ],

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

  Widget _buildInitialsAvatar(String initials) {
    return Container(
      color: const Color(0xFF001A4D),
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }

  Widget _buildAvailabilityToggle(TkDashboardProvider provider) {
    return GestureDetector(
      onTap: () => provider.toggleAvailability(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(40),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: provider.isAvailable ? Colors.green : Colors.red,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              provider.isAvailable ? 'Tersedia' : 'Tidak Tersedia',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.swap_horiz_rounded, color: Colors.white, size: 18),
          ],
        ),
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

  Widget _buildStatsGrid(TkDashboardProvider provider) {
    return GridView.count(
      padding: EdgeInsets.zero,
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.34,
      children: [
        TkStatCard(
          label: 'Diperiksa Hari Ini',
          value: '${provider.totalDiperiksaHariIni}',
          icon: Icons.medical_services_rounded,
          color: AppColors.success,
          tag: 'SELESAI',
        ),
        TkStatCard(
          label: 'Belum Screening',
          value: '${provider.belumScreening}',
          icon: Icons.group_rounded,
          color: AppColors.primary,
          tag: 'MAHASISWA',
        ),
        TkStatCard(
          label: 'Perlu Perhatian',
          value: '${provider.perluPerhatian}',
          icon: Icons.warning_amber_rounded,
          color: AppColors.danger,
          tag: 'KRITIS',
          showPulse: provider.perluPerhatian > 0,
        ),
        TkStatCard(
          label: 'Booking Hari Ini',
          value: '${provider.bookingHariIniCount}',
          icon: Icons.event_note_rounded,
          color: AppColors.info,
          tag: 'AKTIF',
        ),
      ],
    );
  }

  Widget _buildQuickActionsGrid(BuildContext context) {
    return Column(
      children: [
        // Row 1: 3 items
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: _buildQuickAction(
                icon: Icons.schedule_rounded,
                label: 'Jadwal',
                color: AppColors.primary,
                onTap: () {
                  final mainState = context.findAncestorStateOfType<TkMainScreenState>();
                  if (mainState != null) {
                    mainState.setSelectedIndex(1);
                  } else {
                    context.go('/tenagakes?tab=1');
                  }
                },
              ),
            ),
            Expanded(
              child: _buildQuickAction(
                icon: Icons.event_available_rounded,
                label: 'Booking',
                color: AppColors.success,
                onTap: () {
                  final mainState = context.findAncestorStateOfType<TkMainScreenState>();
                  if (mainState != null) {
                    mainState.setSelectedIndex(2);
                  } else {
                    context.go('/tenagakes?tab=2');
                  }
                },
              ),
            ),
            Expanded(
              child: _buildQuickAction(
                icon: Icons.people_rounded,
                label: 'Pasien',
                color: AppColors.info,
                onTap: () {
                  final mainState = context.findAncestorStateOfType<TkMainScreenState>();
                  if (mainState != null) {
                    mainState.setSelectedIndex(3);
                  } else {
                    context.go('/tenagakes?tab=3');
                  }
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Row 2: 2 items centered
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildQuickAction(
              icon: Icons.qr_code_scanner_rounded,
              label: 'Scan QR',
              color: const Color(0xFF001A4D),
              onTap: () => context.push('/tk/qr-scan'),
              isHighlighted: true,
            ),
            const SizedBox(width: 16),
            _buildQuickAction(
              icon: Icons.settings_rounded,
              label: 'Settings',
              color: AppColors.neutral500,
              onTap: () {
                final mainState = context.findAncestorStateOfType<TkMainScreenState>();
                if (mainState != null) {
                  mainState.setSelectedIndex(4);
                } else {
                  context.go('/tenagakes?tab=4');
                }
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    bool isHighlighted = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        splashColor: color.withAlpha(30),
        highlightColor: color.withAlpha(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: EdgeInsets.all(isHighlighted ? 14 : 12),
                decoration: BoxDecoration(
                  color: isHighlighted
                      ? const Color(0xFF001A4D)
                      : color.withAlpha(20),
                  borderRadius: BorderRadius.circular(16),
                  border: isHighlighted
                      ? Border.all(color: const Color(0xFF001A4D).withAlpha(60))
                      : null,
                  boxShadow: isHighlighted
                      ? [
                          BoxShadow(
                            color: const Color(0xFF001A4D).withAlpha(40),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  icon,
                  color: isHighlighted ? Colors.white : color,
                  size: isHighlighted ? 26 : 24,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: AppTextStyles.labelSm.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isHighlighted ? const Color(0xFF001A4D) : AppColors.neutral500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBookingList(TkDashboardProvider provider) {
    final bookings = provider.bookings;

    if (bookings.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.neutral200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.event_available_rounded, size: 48, color: AppColors.neutral300),
              const SizedBox(height: 12),
              Text(
                'Tidak ada booking hari ini',
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: bookings.length.clamp(0, 3),
      itemBuilder: (context, index) => _buildBookingItem(bookings[index]),
    );
  }

  Widget _buildBookingItem(Map<String, dynamic> booking) {
    final name = booking['name']?.toString() ?? '-';
    final nim = booking['nim']?.toString() ?? '-';
    final status = booking['status']?.toString() ?? '-';
    final date = booking['date']?.toString() ?? '-';
    final time = booking['time']?.toString() ?? '-';

    Color statusColor;
    if (status == 'Dikonfirmasi') {
      statusColor = AppColors.success;
    } else if (status == 'Menunggu Konfirmasi') {
      statusColor = AppColors.warning;
    } else {
      statusColor = AppColors.neutral500;
    }

    final parts = name.trim().split(' ');
    final avatar = parts.length >= 2
        ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
        : name.isNotEmpty
            ? name[0].toUpperCase()
            : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: status == 'Menunggu Konfirmasi'
              ? AppColors.warning.withAlpha(80)
              : Colors.grey.withAlpha(30),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: AppColors.primary.withAlpha(30),
            child: Text(
              avatar,
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$nim',
                  style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 12, color: AppColors.neutral500),
                    const SizedBox(width: 4),
                    Text(
                      date,
                      style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.access_time_rounded, size: 12, color: AppColors.neutral500),
                    const SizedBox(width: 4),
                    Text(
                      time,
                      style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  status == 'Dikonfirmasi'
                      ? Icons.check_circle_outline_rounded
                      : Icons.hourglass_empty_rounded,
                  size: 12,
                  color: statusColor,
                ),
                const SizedBox(width: 4),
                Text(
                  status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertList(TkDashboardProvider provider) {
    return ListView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: provider.alerts.length.clamp(0, 3),
      itemBuilder: (context, index) => _buildAlertItem(provider.alerts[index]),
    );
  }

  Widget _buildAlertItem(Map<String, dynamic> alert) {
    final name = alert['nama']?.toString() ?? '-';
    final nim = alert['nim']?.toString() ?? '-';
    final event = alert['event']?.toString() ?? '-';
    final status = alert['status']?.toString() ?? '-';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.danger.withAlpha(10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.danger.withAlpha(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.danger.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$name ($nim)',
                  style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  '$event - Status: $status',
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.danger),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              // Navigate to patient detail
            },
            child: const Text('Detail'),
          ),
        ],
      ),
    );
  }
}
