import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class OrmawaNotificationsScreen extends StatefulWidget {
  const OrmawaNotificationsScreen({super.key});

  @override
  State<OrmawaNotificationsScreen> createState() => _OrmawaNotificationsScreenState();
}

class _OrmawaNotificationsScreenState extends State<OrmawaNotificationsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
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
                onPressed: () {},
                child: Text(
                  'Baca Semua',
                  style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildTabBar(),
                const SizedBox(height: 16),
                _buildNotificationList(),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1),
        ),
      ),
      child: TabBar(
        controller: _tabController,
        isScrollable: false,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        indicator: BoxDecoration(
          color: AppColors.primary.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelStyle: AppTextStyles.labelMd.copyWith(
          fontWeight: FontWeight.w900,
          letterSpacing: 0.5,
          fontSize: 12,
        ),
        unselectedLabelStyle: AppTextStyles.labelMd.copyWith(
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
        unselectedLabelColor: const Color(0xFF94A3B8),
        labelColor: AppColors.primary,
        tabs: const [
          Tab(text: 'Semua'),
          Tab(text: 'Proposal'),
          Tab(text: 'Keuangan'),
          Tab(text: 'Aspirasi'),
        ],
      ),
    );
  }

  Widget _buildNotificationList() {
    final notifications = [
      {
        'title': 'Proposal Disetujui',
        'desc': 'Proposal "Festival Mahasiswa 2026" telah disetujui oleh Kemahasiswaan.',
        'time': '10 Menit Lalu',
        'icon': Icons.check_circle_rounded,
        'color': Colors.green,
        'isUnread': true,
      },
      {
        'title': 'Aspirasi Baru Masuk',
        'desc': 'Ada 1 keluhan baru mengenai fasilitas sekretariat dari anggota.',
        'time': '2 Jam Lalu',
        'icon': Icons.campaign_rounded,
        'color': Colors.orange,
        'isUnread': true,
      },
      {
        'title': 'Pemasukan Kas',
        'desc': 'Bendahara mencatat pemasukan sebesar Rp 5.000.000 dari iuran anggota.',
        'time': '5 Jam Lalu',
        'icon': Icons.payments_rounded,
        'color': Colors.blue,
        'isUnread': false,
      },
      {
        'title': 'Deadline Laporan LPJ',
        'desc': 'Batas akhir pengunggahan LPJ kegiatan Seminar Nasional tinggal 2 hari lagi.',
        'time': 'Kemarin',
        'icon': Icons.warning_amber_rounded,
        'color': Colors.red,
        'isUnread': false,
      },
      {
        'title': 'Anggota Baru',
        'desc': 'Selamat! Ada 5 pendaftar baru yang ingin bergabung ke organisasi.',
        'time': '2 Hari Lalu',
        'icon': Icons.person_add_rounded,
        'color': Colors.purple,
        'isUnread': false,
      },
    ];

    return ListView.builder(
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final item = notifications[index];
        return _buildNotificationCard(
          item['title'] as String,
          item['desc'] as String,
          item['time'] as String,
          item['icon'] as IconData,
          item['color'] as Color,
          item['isUnread'] as bool,
        );
      },
    );
  }

  Widget _buildNotificationCard(String title, String desc, String time, IconData icon, Color color, bool isUnread) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isUnread ? color.withAlpha(5) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isUnread ? color.withAlpha(20) : const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(2),
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
            decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(14)),
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
                    Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
                    if (isUnread)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(desc, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), height: 1.4)),
                const SizedBox(height: 12),
                Text(time, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
