import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class StudentNotificationsScreen extends StatefulWidget {
  const StudentNotificationsScreen({super.key});

  @override
  State<StudentNotificationsScreen> createState() => _StudentNotificationsScreenState();
}

class _StudentNotificationsScreenState extends State<StudentNotificationsScreen> {
  String _selectedFilter = 'Semua';

  final List<Map<String, dynamic>> _notifications = [
    {
      'title': 'Aspirasi Ditanggapi',
      'desc': 'Aspirasi kamu mengenai fasilitas Lab Komputer telah dibalas oleh pihak Sarpras.',
      'time': '10 Menit yang lalu',
      'type': 'Info',
      'icon': Icons.campaign_rounded,
      'color': Colors.blue,
      'isRead': false,
    },
    {
      'title': 'Jadwal Konseling Besok',
      'desc': 'Jangan lupa sesi konseling kamu dengan Ibu Dr. Siti besok jam 10:00 WIB.',
      'time': '2 Jam yang lalu',
      'type': 'Penting',
      'icon': Icons.calendar_today_rounded,
      'color': Colors.orange,
      'isRead': false,
    },
    {
      'title': 'Beasiswa Validasi',
      'desc': 'Selamat! Berkas pendaftaran Beasiswa Alumni kamu telah lolos tahap administrasi.',
      'time': 'Kemarin',
      'type': 'Penting',
      'icon': Icons.verified_rounded,
      'color': Colors.green,
      'isRead': true,
    },
    {
      'title': 'Update Data Kesehatan',
      'desc': 'Sudah satu bulan sejak terakhir kamu update data kesehatan. Yuk update sekarang!',
      'time': '2 Hari yang lalu',
      'type': 'Info',
      'icon': Icons.monitor_heart_rounded,
      'color': Colors.red,
      'isRead': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredNotifications = _notifications.where((n) => 
      _selectedFilter == 'Semua' || n['type'] == _selectedFilter
    ).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
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
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFilterChips(),
                  const SizedBox(height: 24),
                  if (filteredNotifications.isEmpty)
                    _buildEmptyState()
                  else
                    ...List.generate(filteredNotifications.length, (index) => 
                      FadeInAnimation(
                        delay: 0.1 + (index * 0.1),
                        child: _buildNotificationCard(filteredNotifications[index]),
                      ),
                    ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    final filters = ['Semua', 'Info', 'Penting'];
    return Row(
      children: filters.map((f) {
        final isSelected = _selectedFilter == f;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: ChoiceChip(
            label: Text(f),
            selected: isSelected,
            onSelected: (selected) {
              if (selected) setState(() => _selectedFilter = f);
            },
            selectedColor: AppColors.primary,
            labelStyle: TextStyle(
              color: isSelected ? Colors.white : AppColors.outline,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
            backgroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: isSelected ? Colors.transparent : AppColors.surfaceVariant),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: notification['isRead'] ? Colors.white : notification['color'].withAlpha(5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: notification['isRead'] ? AppColors.surfaceVariant : notification['color'].withAlpha(20),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: notification['color'].withAlpha(15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(notification['icon'], color: notification['color'], size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      notification['title'],
                      style: AppTextStyles.labelMd.copyWith(
                        fontWeight: FontWeight.w900,
                        color: notification['isRead'] ? AppColors.onSurface : AppColors.primary,
                      ),
                    ),
                    if (!notification['isRead'])
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: notification['color'], shape: BoxShape.circle),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  notification['desc'],
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  notification['time'],
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.outline.withAlpha(150),
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 60),
          Icon(Icons.notifications_none_rounded, size: 64, color: AppColors.outline.withAlpha(50)),
          const SizedBox(height: 16),
          Text('Belum ada notifikasi', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
        ],
      ),
    );
  }
}
