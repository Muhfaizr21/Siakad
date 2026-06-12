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

  final List<String> _tabs = ['Semua', 'Agenda', 'LPJ', 'Pengumuman'];

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
    final sorted = List<OrmawaNotification>.from(all)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    if (_selectedTabIndex == 0) return sorted;

    final typeMap = {
      1: 'agenda',
      2: 'lpj',
      3: 'pengumuman',
    };

    final type = typeMap[_selectedTabIndex];
    if (type == null) return sorted;

    return sorted.where((n) {
      final t = n.type.toLowerCase();
      final title = n.title.toLowerCase();
      if (type == 'agenda') return t == 'agenda' || title.contains('agenda') || title.contains('kegiatan');
      if (type == 'lpj') return t == 'lpj' || title.contains('lpj');
      if (type == 'pengumuman') return t == 'announcement' || t == 'pengumuman' || title.contains('pengumuman');
      return false;
    }).toList();
  }

  IconData _getNotificationIcon(String type, String title) {
    final typeLower = type.toLowerCase();
    final titleLower = title.toLowerCase();
    
    if (titleLower.contains('setuju') || titleLower.contains('lulus')) return Icons.check_circle_rounded;
    if (titleLower.contains('tolak') || titleLower.contains('gagal')) return Icons.cancel_rounded;
    if (typeLower == 'proposal' || titleLower.contains('proposal')) return Icons.description_rounded;
    if (typeLower == 'finance' || titleLower.contains('kas') || titleLower.contains('uang')) return Icons.account_balance_wallet_rounded;
    if (typeLower == 'aspiration' || titleLower.contains('aspirasi')) return Icons.forum_rounded;
    if (titleLower.contains('anggota') || titleLower.contains('daftar')) return Icons.person_add_rounded;
    if (titleLower.contains('agenda') || titleLower.contains('kegiatan')) return Icons.event_available_rounded;
    if (titleLower.contains('lpj')) return Icons.assignment_turned_in_rounded;
    if (titleLower.contains('pengumuman')) return Icons.campaign_rounded;
    
    return Icons.notifications_active_rounded;
  }

  Color _getNotificationColor(String type, String title) {
    final typeLower = type.toLowerCase();
    final titleLower = title.toLowerCase();
    
    if (titleLower.contains('setuju') || titleLower.contains('lulus')) return const Color(0xFF10B981); // Emerald
    if (titleLower.contains('tolak') || titleLower.contains('gagal')) return const Color(0xFFEF4444); // Red
    if (typeLower == 'proposal' || titleLower.contains('proposal')) return const Color(0xFF3B82F6); // Blue
    if (typeLower == 'finance' || titleLower.contains('kas')) return const Color(0xFF14B8A6); // Teal
    if (typeLower == 'aspiration' || titleLower.contains('aspirasi')) return const Color(0xFFF97316); // Orange
    if (titleLower.contains('anggota')) return const Color(0xFF8B5CF6); // Purple
    if (titleLower.contains('agenda') || titleLower.contains('kegiatan')) return const Color(0xFF06B6D4); // Cyan
    if (titleLower.contains('lpj')) return const Color(0xFF6366F1); // Indigo
    if (titleLower.contains('pengumuman')) return const Color(0xFFF59E0B); // Amber
    
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
              title: 'NOTIFIKASI',
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
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: List.generate(_tabs.length, (index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () {
              _tabController.animateTo(index);
              setState(() {
                _selectedTabIndex = index;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(60),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : [],
              ),
              child: Text(
                _tabs[index],
                style: AppTextStyles.labelMd.copyWith(
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                ),
              ),
            ),
          );
        }),
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

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: notification.isRead ? Colors.white : color.withAlpha(15),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: notification.isRead ? const Color(0xFFF1F5F9) : color.withAlpha(50)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showNotificationDetail(notification),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withOpacity(0.7), color],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: color.withAlpha(60),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 24),
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
      ),
      ),
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
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [color.withOpacity(0.7), color],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: color.withAlpha(60),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
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