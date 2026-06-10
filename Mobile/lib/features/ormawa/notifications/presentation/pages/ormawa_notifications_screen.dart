import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_notification.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:intl/intl.dart';

class OrmawaNotificationsScreen extends StatefulWidget {
  const OrmawaNotificationsScreen({super.key});

  @override
  State<OrmawaNotificationsScreen> createState() => _OrmawaNotificationsScreenState();
}

class _OrmawaNotificationsScreenState extends State<OrmawaNotificationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedTabIndex = 0;

  final List<String> _tabs = ['Semua', 'Proposal', 'Keuangan', 'Aspirasi'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_onTabChanged);
    _loadNotifications();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    setState(() {
      _selectedTabIndex = _tabController.index;
    });
  }

  Future<void> _loadNotifications() async {
    await context.read<OrmawaProvider>().fetchNotifications();
  }

  Future<void> _markAllAsRead() async {
    await context.read<OrmawaProvider>().markAllAsRead();
  }

  List<OrmawaNotification> _getFilteredNotifications(List<OrmawaNotification> all) {
    if (_selectedTabIndex == 0) return all;

    final typeMap = {
      1: 'proposal',
      2: 'finance',
      3: 'aspiration',
    };

    final type = typeMap[_selectedTabIndex];
    if (type == null) return all;

    return all.where((n) => n.type.toLowerCase() == type).toList();
  }

  IconData _getNotificationIcon(String type, String title) {
    final typeLower = type.toLowerCase();
    if (typeLower == 'proposal' || title.toLowerCase().contains('proposal')) {
      if (title.toLowerCase().contains('setuju')) return Icons.check_circle_rounded;
      if (title.toLowerCase().contains('tolak')) return Icons.cancel_rounded;
      return Icons.description_rounded;
    }
    if (typeLower == 'finance' || title.toLowerCase().contains('kas') || title.toLowerCase().contains('uang')) {
      return Icons.payments_rounded;
    }
    if (typeLower == 'aspiration' || title.toLowerCase().contains('aspirasi')) {
      return Icons.campaign_rounded;
    }
    if (title.toLowerCase().contains('anggota') || title.toLowerCase().contains('daftar')) {
      return Icons.person_add_rounded;
    }
    if (title.toLowerCase().contains('deadline') || title.toLowerCase().contains('lpj')) {
      return Icons.warning_amber_rounded;
    }
    return Icons.notifications_rounded;
  }

  Color _getNotificationColor(String type, String title) {
    final typeLower = type.toLowerCase();
    if (title.toLowerCase().contains('setuju') || title.toLowerCase().contains('lulus')) {
      return Colors.green;
    }
    if (title.toLowerCase().contains('tolak') || title.toLowerCase().contains('gagal')) {
      return Colors.red;
    }
    if (typeLower == 'proposal' || title.toLowerCase().contains('proposal')) {
      return Colors.blue;
    }
    if (typeLower == 'finance' || title.toLowerCase().contains('kas')) {
      return Colors.teal;
    }
    if (typeLower == 'aspiration' || title.toLowerCase().contains('aspirasi')) {
      return Colors.orange;
    }
    if (title.toLowerCase().contains('anggota')) {
      return Colors.purple;
    }
    return AppColors.primary;
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'Baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes} Menit Lalu';
    if (diff.inHours < 24) return '${diff.inHours} Jam Lalu';
    if (diff.inDays < 7) return '${diff.inDays} Hari Lalu';
    return DateFormat('dd MMM yyyy').format(date);
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          slivers: [
            BkuAppBar(
              title: 'NOTIFIKASI ADMIN',
              subtitle: 'INFORMASI TERBARU',
              variant: AppBarVariant.ormawa,
              expandedHeight: 140.0,
              showBackButton: true,
              showNotification: false,
              isExpandable: false,
              actions: [
                TextButton(
                  onPressed: _markAllAsRead,
                  child: Text(
                    'Baca Semua',
                    style: AppTextStyles.labelSm.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  _buildTabBar(),
                  const SizedBox(height: 16),
                  _buildNotificationList(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TabBar(
        controller: _tabController,
        isScrollable: false,
        padding: const EdgeInsets.all(6),
        indicator: BoxDecoration(
          color: AppColors.primary.withAlpha(15),
          borderRadius: BorderRadius.circular(12),
        ),
        indicatorSize: TabBarIndicatorSize.label,
        dividerColor: Colors.transparent,
        labelStyle: AppTextStyles.labelSm.copyWith(
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
        unselectedLabelStyle: AppTextStyles.labelSm.copyWith(
          fontWeight: FontWeight.w500,
          fontSize: 11,
        ),
        unselectedLabelColor: AppColors.neutral600,
        labelColor: AppColors.primary,
        tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
      ),
    );
  }

  Widget _buildNotificationList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.notifications.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(40),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final filteredNotifications = _getFilteredNotifications(provider.notifications);

        if (filteredNotifications.isEmpty) {
          return _buildEmptyState();
        }

        return ListView.builder(
          shrinkWrap: true,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredNotifications.length,
          itemBuilder: (context, index) {
            final notification = filteredNotifications[index];
            return _buildNotificationCard(notification);
          },
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_rounded,
            size: 64,
            color: AppColors.neutral300,
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada notifikasi',
            style: AppTextStyles.bodyMd.copyWith(
              color: AppColors.neutral600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Notifikasi akan muncul di sini',
            style: AppTextStyles.labelMd.copyWith(
              color: AppColors.neutral400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(OrmawaNotification notification) {
    final color = _getNotificationColor(notification.type, notification.title);
    final icon = _getNotificationIcon(notification.type, notification.title);

    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: () => _showNotificationDetail(notification),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 24),
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
                        notification.title,
                        style: AppTextStyles.bodyMd.copyWith(
                          fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.w900,
                          color: const Color(0xFF1E293B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!notification.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.only(left: 8),
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  notification.message,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF64748B),
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Text(
                  _formatTime(notification.createdAt),
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
    );
  }

  void _showNotificationDetail(OrmawaNotification notification) {
    final color = _getNotificationColor(notification.type, notification.title);
    final icon = _getNotificationIcon(notification.type, notification.title);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withAlpha(15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: color, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notification.title,
                        style: AppTextStyles.titleMd.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatTime(notification.createdAt),
                        style: AppTextStyles.labelSm.copyWith(
                          color: AppColors.neutral500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  notification.message,
                  style: AppTextStyles.bodyMd.copyWith(
                    height: 1.6,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Navigate based on notification type
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Tutup',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );

    // Mark as read
    if (!notification.isRead) {
      context.read<OrmawaProvider>().markAsRead(notification.id);
    }
  }
}