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
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';
import 'package:bkuhub_mobile/core/services/local_notification_service.dart';

class PsychologistDashboardScreen extends StatefulWidget {
  const PsychologistDashboardScreen({super.key});

  @override
  State<PsychologistDashboardScreen> createState() =>
      _PsychologistDashboardScreenState();
}

class _PsychologistDashboardScreenState
    extends State<PsychologistDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<PsychologistDashboardProvider>().loadDashboardData();
      if (mounted) {
        _checkAndTriggerSessionReminders();
      }
      // Load notifikasi untuk badge count
      if (mounted) {
        context.read<CounselingProvider>().loadNotifications();
      }
      // Load analytics untuk card tren
      if (mounted) {
        context.read<CounselingProvider>().loadAnalytics();
      }
    });
  }

  Future<void> _checkAndTriggerSessionReminders() async {
    final dashboardProvider = context.read<PsychologistDashboardProvider>();
    final bookings = dashboardProvider.upcomingBookings;
    if (bookings.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final bool enabled = prefs.getBool('pref_session_reminder') ?? true;
    if (!enabled) return;

    final int reminderMinutes = prefs.getInt('pref_session_reminder_minutes') ?? 15;
    final now = DateTime.now();

    for (final booking in bookings) {
      final String timeStr = booking['time'] ?? '';
      if (timeStr.isEmpty) continue;

      final parts = timeStr.split('-');
      if (parts.isEmpty) continue;
      final startStr = parts[0].trim();
      final startParts = startStr.split(':');
      if (startParts.length < 2) continue;

      final int? startHour = int.tryParse(startParts[0]);
      final int? startMinute = int.tryParse(startParts[1]);
      if (startHour == null || startMinute == null) continue;

      final bookingTime = DateTime(now.year, now.month, now.day, startHour, startMinute);
      final diffMinutes = bookingTime.difference(now).inMinutes;

      if (diffMinutes >= 0 && diffMinutes <= reminderMinutes) {
        final bookingId = booking['id']?.toString() ?? booking['nim']?.toString() ?? '';
        if (bookingId.isEmpty) continue;

        final List<String> shownIds = prefs.getStringList('pref_shown_reminder_ids') ?? [];
        if (shownIds.contains(bookingId)) continue;

        shownIds.add(bookingId);
        await prefs.setStringList('pref_shown_reminder_ids', shownIds);

        final studentName = booking['name'] ?? 'Mahasiswa';
        final message = 'Sesi konseling dengan $studentName akan dimulai dalam $diffMinutes menit lagi! Siapkan ruang konseling online Anda.';

        if (mounted) {
          final counselingProvider = context.read<CounselingProvider>();
          counselingProvider.addLocalNotification({
            'id': 'auto_$bookingId',
            'title': 'Pengingat Sesi Konseling',
            'desc': message,
            'time': 'Baru Saja',
            'type': 'booking',
            'unread': true,
          });

          // Trigger OS-level system tray notification
          LocalNotificationService.showNotification(
            id: bookingId.hashCode,
            title: 'Pengingat Sesi Konseling',
            body: message,
          );

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Color(0xFFE0E7FF),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.notifications_active_rounded, color: Color(0xFF4338CA), size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Pengingat Sesi Konseling',
                          style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          message,
                          style: AppTextStyles.labelSm.copyWith(color: Colors.white.withAlpha(200)),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              behavior: SnackBarBehavior.floating,
              backgroundColor: const Color(0xFF1E293B),
              duration: const Duration(seconds: 5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              action: SnackBarAction(
                label: 'CEK',
                textColor: const Color(0xFF818CF8),
                onPressed: () {
                  context.push(AppRoutes.psychologistNotifications);
                },
              ),
            ),
          );
        }
      }
    }
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
                        totalAppointments: provider.upcomingAppointments,
                        finishedToday: '${provider.completedToday}',
                        waiting: '${provider.waitingCount}',
                        newAppointments: '${provider.newToday}',
                        finishedMonth: '${provider.completedThisMonth}',
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

  Widget _buildAppBar(
    BuildContext context,
    PsychologistDashboardProvider provider,
  ) {
    final name = provider.profile?.name ?? 'Psikolog';
    final imageUrl = provider.profile?.profileImageUrl ?? '';
    final initials =
        name.trim().isEmpty
            ? 'P'
            : name
                .trim()
                .split(' ')
                .take(2)
                .map((w) => w[0].toUpperCase())
                .join();
    final unreadCount = context.watch<CounselingProvider>().unreadCount;

    return BkuAppBar(
      title: name,
      subtitle: 'SELAMAT DATANG',
      info:
          'NIDN: ${provider.profile?.nidn ?? '-'} • ${provider.profile?.specialization ?? 'PSIKOLOG'}',
      variant: AppBarVariant.psychologist,
      expandedHeight: 210,
      showProfileOnCollapse: true,
      notificationCount: unreadCount,
      profileImage:
          imageUrl.isNotEmpty
              ? Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _buildInitialsAvatar(initials),
                loadingBuilder:
                    (_, child, progress) =>
                        progress == null
                            ? child
                            : _buildInitialsAvatar(initials),
              )
              : _buildInitialsAvatar(initials),
      child: AvailabilityToggle(
        isAvailable: provider.isAvailable,
        onToggle: (value) => provider.toggleAvailability(),
      ),
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
