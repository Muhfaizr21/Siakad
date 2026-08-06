import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class ModuleDetailScreen extends StatelessWidget {
  final Mission mission;

  const ModuleDetailScreen({super.key, required this.mission});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'MATERI MODUL',
            info: mission.title?.toUpperCase() ?? '',
            variant: AppBarVariant.student,
            showBackButton: true,
            isExpandable: false,
            showNotification: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Video/Image Placeholder
                  Container(
                    width: double.infinity,
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(24),
                      image: const DecorationImage(
                        image: NetworkImage('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000'),
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: const Icon(Icons.play_arrow_rounded, color: AppColors.primary, size: 40),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    mission.title ?? '',
                    style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Diposting oleh Panitia PKKMB Kencana',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 24),
                  Text(
                    'Pendahuluan',
                    style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Selamat datang di materi ${mission.title}. Dalam modul ini, kamu akan mempelajari hal-hal mendasar yang sangat penting bagi mahasiswa baru di Universitas Bhakti Kencana.\n\nMemahami aturan dan tata tertib adalah langkah awal untuk menjadi mahasiswa yang berintegritas dan profesional. Kami sangat menghimbau agar setiap poin dalam modul ini dibaca dengan seksama.',
                    style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline, height: 1.6),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Poin-poin Penting',
                    style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _buildBulletPoint('Visi dan Misi Universitas Bhakti Kencana.'),
                  _buildBulletPoint('Budaya Akademik di lingkungan kampus.'),
                  _buildBulletPoint('Hak dan Kewajiban Mahasiswa.'),
                  _buildBulletPoint('Prosedur Administrasi Akademik.'),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<StudentProvider>().toggleMission(mission.id);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Materi telah diselesaikan!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Tandai Selesai Belajar', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Icon(Icons.circle, size: 6, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline),
            ),
          ),
        ],
      ),
    );
  }
}
