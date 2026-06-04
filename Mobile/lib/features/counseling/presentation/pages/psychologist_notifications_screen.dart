import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class PsychologistNotificationsScreen extends StatefulWidget {
  const PsychologistNotificationsScreen({super.key});

  @override
  State<PsychologistNotificationsScreen> createState() =>
      _PsychologistNotificationsScreenState();
}

class _PsychologistNotificationsScreenState
    extends State<PsychologistNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final notifications = provider.notifications;
        final unread = notifications.where((n) => n['unread'] == true).length;

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              BkuAppBar(
                title: 'Notifikasi',
                info: unread > 0 ? '$unread belum dibaca' : 'Semua sudah dibaca',
                variant: AppBarVariant.psychologist,
                showBackButton: true,
                showNotification: false,
                isExpandable: false,
                actions: [
                  if (unread > 0)
                    IconButton(
                      icon: const Icon(Icons.done_all_rounded, color: Colors.white),
                      tooltip: 'Tandai semua dibaca',
                      onPressed: () => provider.markAllNotificationsRead(),
                    ),
                ],
              ),
              SliverToBoxAdapter(
                child: provider.notificationsLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 80),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : notifications.isEmpty
                        ? _buildEmpty()
                        : _buildList(notifications, provider),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmpty() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.notifications_none_rounded, size: 72, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Belum ada notifikasi',
              style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 8),
            Text(
              'Notifikasi booking dan update akan muncul di sini',
              style: AppTextStyles.labelMd.copyWith(color: const Color(0xFFCBD5E1)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<Map<String, dynamic>> notifications, CounselingProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
      child: Column(
        children: notifications.map((notif) {
          return _buildNotifCard(notif, provider);
        }).toList(),
      ),
    );
  }

  Widget _buildNotifCard(Map<String, dynamic> notif, CounselingProvider provider) {
    final id = notif['id']?.toString() ?? '';
    final title = notif['title']?.toString() ?? '-';
    final desc = notif['desc']?.toString() ?? '';
    final time = notif['time']?.toString() ?? '-';
    final type = notif['type']?.toString() ?? 'info';
    final isUnread = notif['unread'] == true;

    // Icon dan warna berdasarkan tipe
    IconData icon;
    Color color;
    switch (type) {
      case 'booking':
        icon = Icons.event_available_rounded;
        color = AppColors.primary;
        break;
      case 'assessment':
        icon = Icons.quiz_rounded;
        color = Colors.purple;
        break;
      case 'report':
        icon = Icons.picture_as_pdf_rounded;
        color = Colors.red;
        break;
      case 'warning':
        icon = Icons.warning_amber_rounded;
        color = Colors.orange;
        break;
      default:
        icon = Icons.notifications_rounded;
        color = Colors.teal;
    }

    return Dismissible(
      key: Key(id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.red.withAlpha(20),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.red),
      ),
      onDismissed: (_) {
        provider.deleteNotification(id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Notifikasi dihapus'),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      },
      child: GestureDetector(
        onTap: () {
          if (isUnread) provider.markNotificationRead(id);
          
          switch (type) {
            case 'booking':
              context.push(AppRoutes.psychologistBookings);
              break;
            case 'assessment':
              context.push(AppRoutes.patientList);
              break;
            case 'report':
              context.push(AppRoutes.psychologistAnalytics);
              break;
            case 'warning':
              context.push(AppRoutes.psychologistBookings);
              break;
            default:
              break;
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isUnread ? color.withAlpha(8) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isUnread ? color.withAlpha(60) : Colors.grey.withAlpha(30),
              width: isUnread ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(isUnread ? 8 : 4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withAlpha(15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 14),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: AppTextStyles.bodyMd.copyWith(
                              fontWeight: isUnread ? FontWeight.w900 : FontWeight.w600,
                              color: const Color(0xFF1E293B),
                            ),
                          ),
                        ),
                        if (isUnread)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    if (desc.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        desc,
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF64748B),
                          height: 1.5,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.access_time_rounded, size: 11, color: Colors.grey[400]),
                        const SizedBox(width: 4),
                        Text(
                          time,
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.grey[400],
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
