import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_dashboard_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/pages/tk_main_screen.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';

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
          backgroundColor: const Color(0xFFF5F7FA),
          body: RefreshIndicator(
            onRefresh: () => context.read<TkDashboardProvider>().loadDashboard(),
            color: const Color(0xFF1A3BAA),
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                // App Bar
                BkuAppBar(
                  title: name,
                  subtitle: 'SELAMAT DATANG',
                  info: provider.profile?.spesialisasi ?? 'TENAGA KESEHATAN',
                  variant: AppBarVariant.nakes,
                  expandedHeight: 210,
                  showProfileOnCollapse: true,
                  showNotification: true,
                  onNotificationTap: (context, variant) =>
                      context.push('/notifications/tk'),
                  profileImage: imageUrl.isNotEmpty
                      ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _buildInitialsAvatar(initials),
                        )
                      : _buildInitialsAvatar(initials),
                  child: _buildAvailabilityToggle(provider),
                ),

                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── HERO CARD (Ringkasan Hari Ini) ──
                        _buildHeroCard(provider),
                        const SizedBox(height: 24),

                        // ── LAYANAN UTAMA ──
                        const Text(
                          'Layanan Utama',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildServiceGrid(context),
                        const SizedBox(height: 24),

                        // ── JADWAL MENDATANG ──
                        _buildSectionRow(
                          'Jadwal Mendatang',
                          _formatTodayDateLabel(),
                          onTap: () {
                            final mainState = context
                                .findAncestorStateOfType<TkMainScreenState>();
                            if (mainState != null) {
                              mainState.setSelectedIndex(1);
                            } else {
                              context.go('/tenagakes?tab=1');
                            }
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildBookingHorizontalScroll(provider),
                        const SizedBox(height: 24),

                        // ── MAHASISWA PERLU PERHATIAN ──
                        if (provider.alerts.isNotEmpty) ...[
                          _buildSectionRow('Perlu Perhatian', null),
                          const SizedBox(height: 12),
                          _buildAlertList(provider),
                          const SizedBox(height: 24),
                        ],

                        // ── GRAFIK ANALITIK ──
                        if (provider.chartKondisi.isNotEmpty ||
                            provider.chartFakultas.isNotEmpty ||
                            provider.chartTren.isNotEmpty) ...[
                          const Text(
                            'Analitik Kesehatan',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 12),
                          if (provider.chartKondisi.isNotEmpty) ...[
                            _buildChartCard(
                              title: 'Sebaran Kondisi',
                              icon: Icons.pie_chart_rounded,
                              child: _buildPieChartKondisi(provider),
                            ),
                            const SizedBox(height: 12),
                          ],
                          if (provider.chartFakultas.isNotEmpty) ...[
                            _buildChartCard(
                              title: 'Distribusi Fakultas',
                              icon: Icons.bar_chart_rounded,
                              child: _buildBarChartFakultas(provider),
                            ),
                            const SizedBox(height: 12),
                          ],
                          if (provider.chartTren.isNotEmpty) ...[
                            _buildChartCard(
                              title: 'Tren Kunjungan (7 Hari)',
                              icon: Icons.show_chart_rounded,
                              child: _buildLineChartTren(provider),
                            ),
                            const SizedBox(height: 12),
                          ],
                        ],

                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HERO CARD
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildHeroCard(TkDashboardProvider provider) {
    final today = DateFormat('EEEE, dd MMM yyyy', 'id_ID').format(DateTime.now()).toUpperCase();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A3BAA), Color(0xFF0D2676)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1A3BAA).withAlpha(70),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Decorative circle
          Positioned(
            right: -20,
            top: -30,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withAlpha(12),
              ),
            ),
          ),
          Positioned(
            right: 40,
            bottom: -20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withAlpha(8),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date + Calendar Icon row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      today,
                      style: TextStyle(
                        color: Colors.white.withAlpha(178),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.calendar_month_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Booking Hari Ini & Mendatang',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${provider.bookingHariIniCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 52,
                    fontWeight: FontWeight.w900,
                    height: 1.0,
                  ),
                ),
                const Text(
                  'sesi booking hari ini',
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 16),
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 16),
                // Four stats
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildHeroStat(
                      icon: Icons.check_circle_outline_rounded,
                      value: '${provider.totalDiperiksaHariIni}',
                      label: 'Selesai\nHari Ini',
                      color: const Color(0xFF4ADE80),
                    ),
                    _buildHeroDivider(),
                    _buildHeroStat(
                      icon: Icons.pending_actions_rounded,
                      value: '${provider.belumScreening}',
                      label: 'Menunggu',
                      color: const Color(0xFFFBBF24),
                    ),
                    _buildHeroDivider(),
                    _buildHeroStat(
                      icon: Icons.notifications_active_rounded,
                      value: '${provider.perluPerhatian}',
                      label: 'Baru\nHari Ini',
                      color: const Color(0xFFF87171),
                    ),
                    _buildHeroDivider(),
                    _buildHeroStat(
                      icon: Icons.event_available_rounded,
                      value: '${provider.bookingHariIniCount}',
                      label: 'Booking\nAktif',
                      color: const Color(0xFF60A5FA),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroStat({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withAlpha(40),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white60,
            fontSize: 10,
            height: 1.3,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildHeroDivider() {
    return Container(
      width: 1,
      height: 50,
      color: Colors.white.withAlpha(38),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SERVICE GRID (Squircle Style)
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildServiceGrid(BuildContext context) {
    final services = [
      _ServiceItem(
        icon: Icons.calendar_month_rounded,
        label: 'Jadwal',
        bg: const Color(0xFFE8EEFF),
        iconColor: const Color(0xFF1A3BAA),
        onTap: () {
          final s = context.findAncestorStateOfType<TkMainScreenState>();
          s != null ? s.setSelectedIndex(1) : context.go('/tenagakes?tab=1');
        },
      ),
      _ServiceItem(
        icon: Icons.assignment_turned_in_rounded,
        label: 'Booking',
        bg: const Color(0xFFE6FAF0),
        iconColor: const Color(0xFF10B981),
        onTap: () {
          final s = context.findAncestorStateOfType<TkMainScreenState>();
          s != null ? s.setSelectedIndex(2) : context.go('/tenagakes?tab=2');
        },
      ),
      _ServiceItem(
        icon: Icons.people_alt_rounded,
        label: 'Pasien',
        bg: const Color(0xFFF0EEFF),
        iconColor: const Color(0xFF7C3AED),
        onTap: () {
          final s = context.findAncestorStateOfType<TkMainScreenState>();
          s != null ? s.setSelectedIndex(3) : context.go('/tenagakes?tab=3');
        },
      ),
      _ServiceItem(
        icon: Icons.send_rounded,
        label: 'Rujukan',
        bg: const Color(0xFFFFF4E6),
        iconColor: const Color(0xFFF59E0B),
        onTap: () => context.push('/tk/reports'),
      ),
      _ServiceItem(
        icon: Icons.qr_code_scanner_rounded,
        label: 'Scan QR',
        bg: const Color(0xFFE8EEFF),
        iconColor: const Color(0xFF1A3BAA),
        onTap: () => context.push('/tk/qr-scan'),
      ),
      _ServiceItem(
        icon: Icons.shield_rounded,
        label: 'Asuransi',
        bg: const Color(0xFFE6FAF0),
        iconColor: const Color(0xFF10B981),
        onTap: () => context.push('/tk/insurance-claims'),
      ),
      _ServiceItem(
        icon: Icons.article_rounded,
        label: 'BAP',
        bg: const Color(0xFFFFF4E6),
        iconColor: const Color(0xFFF59E0B),
        onTap: () => context.push('/tk/bap'),
      ),
      _ServiceItem(
        icon: Icons.bar_chart_rounded,
        label: 'Lap. Klinis',
        bg: const Color(0xFFF0EEFF),
        iconColor: const Color(0xFF7C3AED),
        onTap: () => context.push('/tk/reports'),
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: services.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 8,
        childAspectRatio: 0.85,
      ),
      itemBuilder: (context, i) {
        final s = services[i];
        return _buildServiceItem(s);
      },
    );
  }

  Widget _buildServiceItem(_ServiceItem s) {
    return GestureDetector(
      onTap: s.onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: s.bg,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(s.icon, color: s.iconColor, size: 26),
          ),
          const SizedBox(height: 6),
          Text(
            s.label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Color(0xFF475569),
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOOKING HORIZONTAL SCROLL
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildBookingHorizontalScroll(TkDashboardProvider provider) {
    if (provider.bookings.isEmpty) {
      return Container(
        height: 120,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.event_busy_rounded,
                  size: 36, color: AppColors.neutral300),
              const SizedBox(height: 8),
              Text(
                'Tidak ada jadwal hari ini',
                style: TextStyle(
                  color: AppColors.neutral400,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SizedBox(
      height: 155,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.only(right: 4),
        itemCount: provider.bookings.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) =>
            _buildBookingCard(provider.bookings[index]),
      ),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final name = booking['name']?.toString() ?? '-';
    final nim = booking['nim']?.toString() ?? '-';
    final time = booking['time']?.toString() ?? '-';
    final status = booking['status']?.toString() ?? '-';
    final keluhan = booking['keluhan']?.toString() ?? 'Pemeriksaan Umum';

    final parts = name.trim().split(' ');
    final avatar = parts.length >= 2
        ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
        : name.isNotEmpty
            ? name[0].toUpperCase()
            : '?';

    Color statusColor;
    if (status == 'Dikonfirmasi') {
      statusColor = const Color(0xFF10B981);
    } else if (status == 'Menunggu Konfirmasi') {
      statusColor = const Color(0xFFF59E0B);
    } else {
      statusColor = AppColors.neutral400;
    }

    return Container(
      width: 180,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFFE8EEFF),
                child: Text(
                  avatar,
                  style: const TextStyle(
                    color: Color(0xFF1A3BAA),
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    color: Color(0xFF1E293B),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'NIM: $nim',
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.access_time_rounded,
                  size: 12, color: Color(0xFF94A3B8)),
              const SizedBox(width: 4),
              Text(
                time,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF475569),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            keluhan,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF64748B),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(20),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              status == 'Menunggu Konfirmasi' ? 'Menunggu' : status,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALERT LIST
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildAlertList(TkDashboardProvider provider) {
    return ListView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: provider.alerts.length.clamp(0, 3),
      itemBuilder: (context, index) =>
          _buildAlertItem(provider.alerts[index]),
    );
  }

  Widget _buildAlertItem(Map<String, dynamic> alert) {
    final name = alert['nama']?.toString() ?? '-';
    final nim = alert['nim']?.toString() ?? '-';
    final event = alert['event']?.toString() ?? '-';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECACA)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              color: Color(0xFFEF4444),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$name ($nim)',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  event,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFEF4444),
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            style: TextButton.styleFrom(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              backgroundColor: const Color(0xFFFEE2E2),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              final mahasiswaId = alert['mahasiswa_id'];
              if (mahasiswaId != null) {
                context.read<TkPatientProvider>().clearSelection();
                context.push('/tk/patient/$mahasiswaId');
              }
            },
            child: const Text(
              'Detail',
              style: TextStyle(
                  fontSize: 11,
                  color: Color(0xFFEF4444),
                  fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHARTS
  // ─────────────────────────────────────────────────────────────────────────
  Widget _buildChartCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8EEFF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: const Color(0xFF1A3BAA), size: 18),
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildPieChartKondisi(TkDashboardProvider provider) {
    final total = provider.chartKondisi
        .fold(0, (sum, item) => sum + ((item['value'] as num?)?.toInt() ?? 0));
    if (total == 0) return const SizedBox.shrink();

    final colors = [
      const Color(0xFF1A3BAA),
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
      const Color(0xFFEF4444),
      const Color(0xFF7C3AED),
      const Color(0xFF06B6D4),
    ];

    int colorIdx = 0;
    final sections = provider.chartKondisi.map((item) {
      final v = ((item['value'] as num?)?.toInt() ?? 0).toDouble();
      final c = colors[colorIdx % colors.length];
      colorIdx++;
      return PieChartSectionData(
        color: c,
        value: v,
        title: '${(v / total * 100).toStringAsFixed(0)}%',
        radius: 55,
        titleStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      );
    }).toList();

    return Column(
      children: [
        SizedBox(
          height: 180,
          child: PieChart(
            PieChartData(
              sectionsSpace: 3,
              centerSpaceRadius: 36,
              sections: sections,
            ),
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 14,
          runSpacing: 8,
          alignment: WrapAlignment.center,
          children: List.generate(provider.chartKondisi.length, (i) {
            final item = provider.chartKondisi[i];
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: colors[i % colors.length],
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  '${item['name']} (${item['value']})',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            );
          }),
        ),
      ],
    );
  }

  Widget _buildBarChartFakultas(TkDashboardProvider provider) {
    double maxCount = provider.chartFakultas
        .fold(0.0, (m, item) {
          final v = ((item['value'] as num?)?.toInt() ?? 0).toDouble();
          return v > m ? v : m;
        });
    if (maxCount == 0) maxCount = 1;

    return SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: maxCount + (maxCount * 0.25),
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final name = provider.chartFakultas[groupIndex]['name']?.toString() ?? '';
                return BarTooltipItem(
                  '$name\n${rod.toY.toInt()}',
                  const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                );
              },
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final i = value.toInt();
                  if (i >= 0 && i < provider.chartFakultas.length) {
                    final full =
                        provider.chartFakultas[i]['name']?.toString() ?? '';
                    final words = full.split(' ');
                    final abbr = words
                        .map((w) => w.isNotEmpty ? w[0] : '')
                        .join()
                        .toUpperCase();
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        abbr.length > 4 ? abbr.substring(0, 4) : abbr,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            leftTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxCount / 4,
            getDrawingHorizontalLine: (v) => FlLine(
              color: const Color(0xFFE2E8F0),
              strokeWidth: 1,
            ),
          ),
          borderData: FlBorderData(show: false),
          barGroups: List.generate(provider.chartFakultas.length, (i) {
            final val = ((provider.chartFakultas[i]['value'] as num?)
                        ?.toInt() ??
                    0)
                .toDouble();
            return BarChartGroupData(
              x: i,
              barRods: [
                BarChartRodData(
                  toY: val,
                  gradient: const LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [Color(0xFF1A3BAA), Color(0xFF4A6FE3)],
                  ),
                  width: 20,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(6)),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildLineChartTren(TkDashboardProvider provider) {
    double maxCount = provider.chartTren
        .fold(0.0, (m, item) {
          final v = ((item['value'] as num?)?.toInt() ?? 0).toDouble();
          return v > m ? v : m;
        });
    if (maxCount == 0) maxCount = 1;

    final spots = List.generate(provider.chartTren.length, (i) {
      final v = ((provider.chartTren[i]['value'] as num?)?.toInt() ?? 0)
          .toDouble();
      return FlSpot(i.toDouble(), v);
    });

    return SizedBox(
      height: 200,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxCount / 4 > 0 ? maxCount / 4 : 1,
            getDrawingHorizontalLine: (v) => FlLine(
              color: const Color(0xFFE2E8F0),
              strokeWidth: 1,
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: 1,
                getTitlesWidget: (value, meta) {
                  final i = value.toInt();
                  if (i >= 0 && i < provider.chartTren.length) {
                    final dateStr =
                        provider.chartTren[i]['name']?.toString() ?? '';
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        dateStr,
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            leftTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(
                sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          minX: 0,
          maxX: (provider.chartTren.length - 1).toDouble(),
          minY: 0,
          maxY: maxCount + (maxCount * 0.2),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              curveSmoothness: 0.3,
              gradient: const LinearGradient(
                colors: [Color(0xFF1A3BAA), Color(0xFF4A6FE3)],
              ),
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, bar, index) =>
                    FlDotCirclePainter(
                  radius: 4,
                  color: Colors.white,
                  strokeWidth: 2,
                  strokeColor: const Color(0xFF1A3BAA),
                ),
              ),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF1A3BAA).withAlpha(40),
                    const Color(0xFF1A3BAA).withAlpha(0),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────
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
            const Icon(Icons.swap_horiz_rounded,
                color: Colors.white, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionRow(String title, String? subtitle,
      {VoidCallback? onTap}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1E293B),
              ),
            ),
            if (subtitle != null)
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF94A3B8),
                ),
              ),
          ],
        ),
        if (onTap != null)
          GestureDetector(
            onTap: onTap,
            child: const Text(
              'Lihat Semua',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A3BAA),
              ),
            ),
          ),
      ],
    );
  }

  String _formatTodayDateLabel() {
    return DateFormat('EEEE, dd MMM', 'id_ID').format(DateTime.now());
  }
}

// ─── Helper Model ───────────────────────────────────────────────────────────
class _ServiceItem {
  final IconData icon;
  final String label;
  final Color bg;
  final Color iconColor;
  final VoidCallback onTap;

  const _ServiceItem({
    required this.icon,
    required this.label,
    required this.bg,
    required this.iconColor,
    required this.onTap,
  });
}
