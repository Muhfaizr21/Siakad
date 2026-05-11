import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class OrmawaAspirasiScreen extends StatefulWidget {
  const OrmawaAspirasiScreen({super.key});

  @override
  State<OrmawaAspirasiScreen> createState() => _OrmawaAspirasiScreenState();
}

class _OrmawaAspirasiScreenState extends State<OrmawaAspirasiScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'ASPIRASI ORGANISASI',
            subtitle: 'PUSAT ASPIRASI',
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryGrid(),
                  const SizedBox(height: 32),
                  _buildHeaderActions(),
                  const SizedBox(height: 20),
                  _buildAspirasiList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryGrid() {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.1,
      children: [
        _buildStatCard('Masuk', '42', Icons.inbox_rounded, Colors.blue),
        _buildStatCard('Diproses', '12', Icons.sync_rounded, Colors.orange),
        _buildStatCard('Selesai', '28', Icons.done_all_rounded, Colors.green),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
          Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 9)),
        ],
      ),
    );
  }

  Widget _buildHeaderActions() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'REKAPITULASI ASPIRASI',
              style: AppTextStyles.labelMd.copyWith(
                color: const Color(0xFF475569),
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sort_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text('Urutkan', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Cari topik aspirasi...',
                    hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAspirasiList() {
    final aspirasiData = [
      {
        'topic': 'Fasilitas Laboratorium',
        'content': 'Mohon dilakukan pembaharuan pada alat praktikum kimia di lab 3 karena sudah banyak yang rusak.',
        'sender': 'Anonim',
        'date': '2 jam yang lalu',
        'status': 'Baru',
        'color': Colors.blue,
      },
      {
        'topic': 'Jadwal Perkuliahan',
        'content': 'Sering terjadi bentrok antara jadwal matkul farmakologi dengan praktikum di hari Selasa.',
        'sender': 'Budi Santoso',
        'date': '1 hari yang lalu',
        'status': 'Diproses',
        'color': Colors.orange,
      },
      {
        'topic': 'Kebersihan Kantin',
        'content': 'Kantin lantai 2 kurang terjaga kebersihannya, mohon koordinasi dengan pihak pengelola.',
        'sender': 'Siti Aminah',
        'date': '3 hari yang lalu',
        'status': 'Selesai',
        'color': Colors.green,
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: aspirasiData.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = aspirasiData[index];
        return _buildAspirasiCard(
          item['topic'] as String,
          item['content'] as String,
          item['sender'] as String,
          item['date'] as String,
          item['status'] as String,
          item['color'] as Color,
        );
      },
    );
  }

  Widget _buildAspirasiCard(String topic, String content, String sender, String date, String status, Color color) {
    return GestureDetector(
      onTap: () => _showAspirasiDetail(topic, content, sender, date, status, color),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(8)),
                  child: Text(status, style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
                ),
                Text(date, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
              ],
            ),
            const SizedBox(height: 12),
            Text(topic, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
            const SizedBox(height: 8),
            Text(
              content,
              style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF64748B), height: 1.4),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 10,
                  backgroundColor: AppColors.primary.withAlpha(10),
                  child: const Icon(Icons.person_rounded, size: 12, color: AppColors.primary),
                ),
                const SizedBox(width: 8),
                Text(sender, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
                const Spacer(),
                const Icon(Icons.chevron_right_rounded, color: Color(0xFFE2E8F0)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAspirasiDetail(String topic, String content, String sender, String date, String status, Color color) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                  child: Text(status, style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900)),
                ),
                Text(date, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              ],
            ),
            const SizedBox(height: 24),
            Text(topic, style: AppTextStyles.titleLg.copyWith(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 16, color: Color(0xFF94A3B8)),
                const SizedBox(width: 8),
                Text('Dari: $sender', style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
              ],
            ),
            const SizedBox(height: 32),
            Text('ISI ASPIRASI', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  content,
                  style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF475569), height: 1.6, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Text('TANGGAPAN ADMIN', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TextField(
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Tulis tanggapan atau solusi...',
                  hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 8,
                  shadowColor: AppColors.primary.withAlpha(50),
                ),
                child: const Text('Kirim Tanggapan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
