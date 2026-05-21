import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class StudentNotificationsScreen extends StatefulWidget {
  const StudentNotificationsScreen({super.key});

  @override
  State<StudentNotificationsScreen> createState() => _StudentNotificationsScreenState();
}

class _StudentNotificationsScreenState extends State<StudentNotificationsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'Notifikasi Kamu',
            subtitle: 'INFORMASI TERBARU',
            variant: AppBarVariant.student,
            expandedHeight: 140.0,
            showBackButton: true,
            showNotification: false,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'HARI INI',
                        style: AppTextStyles.labelSm.copyWith(
                          color: const Color(0xFF64748B),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Tandai Semua Dibaca'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildNotificationItem(
                    title: 'Beasiswa Diterima!',
                    desc: 'Selamat! Pendaftaran beasiswa "Cendekia BKU" kamu telah disetujui.',
                    time: '12 Menit Lalu',
                    icon: Icons.celebration_rounded,
                    color: Colors.orange,
                    isUnread: true,
                  ),
                  const SizedBox(height: 12),
                  _buildNotificationItem(
                    title: 'Misi Baru PKKMB',
                    desc: 'Ada misi baru "Unggah Foto Twibbon" yang harus kamu selesaikan.',
                    time: '2 Jam Lalu',
                    icon: Icons.auto_awesome_rounded,
                    color: Colors.blue,
                    isUnread: true,
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'KEMARIN',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF64748B),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildNotificationItem(
                    title: 'Aspirasi Ditanggapi',
                    desc: 'Aspirasi kamu mengenai "Fasilitas Kantin" telah ditanggapi oleh admin.',
                    time: 'Yesterday, 14:20',
                    icon: Icons.campaign_rounded,
                    color: Colors.red,
                    isUnread: false,
                  ),
                  const SizedBox(height: 12),
                  _buildNotificationItem(
                    title: 'Update Akademik',
                    desc: 'Jadwal UTS Semester Genap sudah tersedia di portal akademik.',
                    time: 'Yesterday, 09:00',
                    icon: Icons.library_books_rounded,
                    color: Colors.green,
                    isUnread: false,
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

  Widget _buildNotificationItem({
    required String title,
    required String desc,
    required String time,
    required IconData icon,
    required Color color,
    required bool isUnread,
  }) {
    return FadeInAnimation(
      delay: 0.1,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isUnread ? color.withAlpha(5) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isUnread ? color.withAlpha(20) : const Color(0xFFF1F5F9)),
          boxShadow: isUnread ? [
            BoxShadow(color: color.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4)),
          ] : [],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withAlpha(10),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(title, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                      if (isUnread)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), height: 1.4),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    time,
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
