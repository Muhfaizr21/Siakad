import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:intl/intl.dart';

class OrmawaNotificationScreen extends StatefulWidget {
  const OrmawaNotificationScreen({super.key});

  @override
  State<OrmawaNotificationScreen> createState() => _OrmawaNotificationScreenState();
}

class _OrmawaNotificationScreenState extends State<OrmawaNotificationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final notifications = provider.notifications;

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              BkuAppBar(
                variant: AppBarVariant.ormawa,
                title: 'NOTIFIKASI PORTAL',
                subtitle: 'SISTEM INBOX',
                expandedHeight: 160.0,
                showBackButton: true,
                isExpandable: false,
                actions: [
                  if (notifications.any((n) => !n.isRead))
                    IconButton(
                      icon: const Icon(Icons.done_all_rounded, color: Colors.white),
                      tooltip: 'Tandai Semua Dibaca',
                      onPressed: () async {
                        await provider.markAllAsRead();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Semua notifikasi ditandai sebagai dibaca'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      },
                    ),
                ],
              ),
              if (provider.isLoading && notifications.isEmpty)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (notifications.isEmpty)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.notifications_none_rounded,
                          size: 72,
                          color: Colors.grey[300],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Belum ada notifikasi masuk',
                          style: AppTextStyles.labelMd.copyWith(
                            color: const Color(0xFF94A3B8),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final notif = notifications[index];
                        final isUnread = !notif.isRead;
                        final dateStr = DateFormat('dd MMM yyyy, HH:mm').format(notif.createdAt);

                        IconData notifIcon;
                        Color notifColor;
                        switch (notif.type.toLowerCase()) {
                          case 'approval':
                            notifIcon = Icons.assignment_turned_in_rounded;
                            notifColor = Colors.green;
                            break;
                          case 'proposal':
                            notifIcon = Icons.article_rounded;
                            notifColor = Colors.blue;
                            break;
                          case 'finance':
                            notifIcon = Icons.account_balance_wallet_rounded;
                            notifColor = Colors.orange;
                            break;
                          case 'event':
                            notifIcon = Icons.event_available_rounded;
                            notifColor = Colors.indigo;
                            break;
                          default:
                            notifIcon = Icons.notifications_active_rounded;
                            notifColor = AppColors.primary;
                        }

                        return Dismissible(
                          key: Key(notif.id),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 24),
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(Icons.delete_sweep_rounded, color: Colors.white, size: 28),
                          ),
                          onDismissed: (direction) {
                            provider.removeNotification(notif.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Notifikasi dihapus'),
                                duration: Duration(seconds: 1),
                              ),
                            );
                          },
                          child: GestureDetector(
                            onTap: () {
                              if (isUnread) {
                                provider.markAsRead(notif.id);
                              }
                            },
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: isUnread ? Colors.white : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isUnread ? AppColors.primary.withAlpha(20) : const Color(0xFFE2E8F0),
                                  width: isUnread ? 1.5 : 1,
                                ),
                                boxShadow: isUnread
                                    ? [
                                        BoxShadow(
                                          color: AppColors.primary.withAlpha(5),
                                          blurRadius: 12,
                                          offset: const Offset(0, 4),
                                        )
                                      ]
                                    : null,
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: notifColor.withAlpha(10),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(notifIcon, color: notifColor, size: 22),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                notif.title,
                                                style: AppTextStyles.bodyMd.copyWith(
                                                  fontWeight: isUnread ? FontWeight.w900 : FontWeight.bold,
                                                  color: const Color(0xFF1E293B),
                                                ),
                                              ),
                                            ),
                                            if (isUnread)
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: const BoxDecoration(
                                                  color: AppColors.primary,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          notif.message,
                                          style: AppTextStyles.labelSm.copyWith(
                                            color: const Color(0xFF64748B),
                                            height: 1.4,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          dateStr,
                                          style: AppTextStyles.labelSm.copyWith(
                                            color: const Color(0xFF94A3B8),
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: notifications.length,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
