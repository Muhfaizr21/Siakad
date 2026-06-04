import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/widgets/bku_shimmer.dart';
import 'package:bkuhub_mobile/core/services/notification_service.dart';

class StudentNotificationsScreen extends StatefulWidget {
  const StudentNotificationsScreen({super.key});

  @override
  State<StudentNotificationsScreen> createState() =>
      _StudentNotificationsScreenState();
}

class _StudentNotificationsScreenState
    extends State<StudentNotificationsScreen> {
  final NotificationService _service = NotificationService();

  String _selectedFilter = 'Semua';
  bool _isLoading = true;
  List<NotificationItem> _notifications = [];

  static const _filters = ['Semua', 'beasiswa', 'prestasi', 'kencana', 'health', 'info'];

  static const _filterLabels = {
    'Semua': 'Semua',
    'beasiswa': 'Beasiswa',
    'prestasi': 'Prestasi',
    'kencana': 'PKKMB',
    'health': 'Kesehatan',
    'info': 'Info',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final data = await _service.getNotifications(
      tipe: _selectedFilter == 'Semua' ? null : _selectedFilter,
    );
    if (mounted) {
      setState(() {
        _notifications = data;
        _isLoading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    final ok = await _service.markAllAsRead();
    if (ok && mounted) {
      setState(() {
        _notifications =
            _notifications.map((n) => n.copyWith(isRead: true)).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Semua notifikasi ditandai dibaca'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _markOneRead(NotificationItem notif) async {
    if (notif.isRead) return;
    // Guard: jangan kirim jika id kosong atau tidak valid
    if (notif.id.isEmpty || notif.id == '0') return;
    final ok = await _service.markAsRead(notif.id);
    if (ok && mounted) {
      setState(() {
        final idx = _notifications.indexWhere((n) => n.id == notif.id);
        if (idx != -1) {
          _notifications[idx] = notif.copyWith(isRead: true);
        }
      });
    }
  }

  Future<void> _deleteOne(NotificationItem notif) async {
    final ok = await _service.deleteNotification(notif.id);
    if (ok && mounted) {
      setState(() => _notifications.removeWhere((n) => n.id == notif.id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notifikasi dihapus'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _deleteRead() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Hapus notifikasi?',
            style: TextStyle(fontWeight: FontWeight.w900)),
        content:
            const Text('Semua notifikasi yang sudah dibaca akan dihapus.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal',
                style: TextStyle(color: AppColors.outline)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Hapus',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    final ok = await _service.deleteReadNotifications();
    if (ok && mounted) {
      setState(() =>
          _notifications = _notifications.where((n) => !n.isRead).toList());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notifikasi yang sudah dibaca dihapus'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: Colors.white,
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics()),
          slivers: [
            BkuAppBar(
              title: 'Notifikasi',
              subtitle: 'UPDATE TERBARU',
              variant: AppBarVariant.student,
              expandedHeight: 160,
              showBackButton: true,
              isExpandable: false,
              showNotification: false,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Row: unread badge + aksi
                    Row(
                      children: [
                        if (unreadCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withAlpha(15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '$unreadCount belum dibaca',
                              style: AppTextStyles.labelSm.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        const Spacer(),
                        if (unreadCount > 0)
                          TextButton(
                            onPressed: _markAllRead,
                            child: Text(
                              'Tandai Semua Dibaca',
                              style: AppTextStyles.labelSm.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        PopupMenuButton<String>(
                          icon: const Icon(Icons.more_vert_rounded,
                              color: AppColors.outline),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                          onSelected: (v) {
                            if (v == 'delete_read') _deleteRead();
                          },
                          itemBuilder: (_) => [
                            const PopupMenuItem(
                              value: 'delete_read',
                              child: Row(
                                children: [
                                  Icon(Icons.delete_sweep_rounded,
                                      color: Colors.red, size: 18),
                                  SizedBox(width: 8),
                                  Text('Hapus yang Sudah Dibaca'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Filter chips
                    _buildFilterChips(),
                    const SizedBox(height: 20),

                    // Content
                    if (_isLoading)
                      const BkuShimmerList(itemCount: 4, itemHeight: 88)
                    else if (_notifications.isEmpty)
                      _buildEmptyState()
                    else
                      ...List.generate(
                        _notifications.length,
                        (i) => FadeInAnimation(
                          delay: 0.05 * i,
                          child: _buildNotificationCard(_notifications[i]),
                        ),
                      ),

                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _filters.map((f) {
          final isSelected = _selectedFilter == f;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(_filterLabels[f] ?? f),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  setState(() => _selectedFilter = f);
                  _load();
                }
              },
              selectedColor: AppColors.primary,
              labelStyle: AppTextStyles.labelSm.copyWith(
                color: isSelected ? Colors.white : AppColors.outline,
                fontWeight:
                    isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: isSelected
                      ? Colors.transparent
                      : AppColors.surfaceVariant,
                ),
              ),
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              elevation: isSelected ? 3 : 0,
              pressElevation: 0,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem notif) {
    final color = _getTypeColor(notif.type);
    final icon = _getTypeIcon(notif.type);

    return Dismissible(
      key: Key(notif.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.error.withAlpha(20),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Icon(Icons.delete_outline_rounded,
            color: AppColors.error, size: 24),
      ),
      onDismissed: (_) => _deleteOne(notif),
      child: GestureDetector(
        onTap: () => _markOneRead(notif),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: notif.isRead ? Colors.white : color.withAlpha(6),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: notif.isRead
                  ? AppColors.surfaceVariant
                  : color.withAlpha(30),
              width: notif.isRead ? 1 : 1.5,
            ),
            boxShadow: notif.isRead
                ? []
                : [
                    BoxShadow(
                      color: color.withAlpha(15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withAlpha(15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 20),
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
                            style: AppTextStyles.labelMd.copyWith(
                              fontWeight: FontWeight.w900,
                              color: notif.isRead
                                  ? AppColors.onSurface
                                  : AppColors.primary,
                            ),
                          ),
                        ),
                        if (!notif.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(left: 8, top: 4),
                            decoration: BoxDecoration(
                                color: color, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notif.content,
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.outline,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.access_time_rounded,
                            size: 12, color: AppColors.outline.withAlpha(150)),
                        const SizedBox(width: 4),
                        Text(
                          _formatTime(notif.createdAt),
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.outline.withAlpha(150),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: color.withAlpha(15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _typeLabel(notif.type),
                            style: AppTextStyles.labelSm.copyWith(
                              color: color,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
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

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 60),
        child: Column(
          children: [
            Icon(Icons.notifications_none_rounded,
                size: 72, color: AppColors.outline.withAlpha(50)),
            const SizedBox(height: 16),
            Text(
              'Belum ada notifikasi',
              style: AppTextStyles.labelMd.copyWith(
                color: AppColors.outline,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Semua update dari kampus akan muncul di sini.',
              style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  Color _getTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'beasiswa':
        return Colors.green;
      case 'kencana':
        return Colors.blue;
      case 'kesehatan':
      case 'health':
        return Colors.red;
      case 'prestasi':
      case 'achievement':
        return Colors.purple;
      case 'konseling':
      case 'counseling':
        return Colors.orange;
      default:
        return AppColors.primary;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'beasiswa':
        return Icons.school_rounded;
      case 'kencana':
        return Icons.auto_awesome_rounded;
      case 'kesehatan':
      case 'health':
        return Icons.monitor_heart_rounded;
      case 'prestasi':
      case 'achievement':
        return Icons.emoji_events_rounded;
      case 'konseling':
      case 'counseling':
        return Icons.psychology_rounded;
      default:
        return Icons.campaign_rounded;
    }
  }

  String _typeLabel(String type) {
    switch (type.toLowerCase()) {
      case 'beasiswa':
        return 'BEASISWA';
      case 'kencana':
        return 'PKKMB';
      case 'health':
      case 'kesehatan':
        return 'KESEHATAN';
      case 'prestasi':
        return 'PRESTASI';
      case 'konseling':
        return 'KONSELING';
      default:
        return type.toUpperCase();
    }
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
    if (diff.inHours < 24) return '${diff.inHours} jam lalu';
    if (diff.inDays < 2) return 'Kemarin';
    if (diff.inDays < 7) return '${diff.inDays} hari lalu';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
