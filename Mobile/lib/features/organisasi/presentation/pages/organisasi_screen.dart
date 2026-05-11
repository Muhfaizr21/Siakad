import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';

class OrganisasiScreen extends StatelessWidget {
  const OrganisasiScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildSliverAppBar(context),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    const FadeInAnimation(delay: 0.2, child: _OrganizationBanner()),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.4,
                      child: Text('Riwayat Organisasi', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    ),
                    const SizedBox(height: 16),
                    FadeInAnimation(
                      delay: 0.5,
                      child: _buildOrgCard(
                        'BEM KBM Bhakti Kencana',
                        'Badan Eksekutif Mahasiswa',
                        'Anggota Aktif',
                        '2022 - 2023',
                        ['Ketua Pelaksana Seminar Nasional', 'Inisiator Program Desa Binaan'],
                        Icons.groups_rounded,
                        const Color(0xFF2563EB),
                      ),
                    ),
                    const SizedBox(height: 16),
                    FadeInAnimation(
                      delay: 0.6,
                      child: _buildOrgCard(
                        'HIMA Keperawatan',
                        'Himpunan Mahasiswa Prodi',
                        'Ketua Divisi PSDM',
                        '2021 - 2022',
                        ['Penyelenggara LDK Mahasiswa', 'Koordinator Kaderisasi'],
                        Icons.diversity_3_rounded,
                        const Color(0xFF9333EA),
                      ),
                    ),
                    const SizedBox(height: 24),
                    FadeInAnimation(delay: 0.7, child: _buildAddButton()),
                    const SizedBox(height: 32),
                    FadeInAnimation(
                      delay: 0.8,
                      child: Text('Dokumentasi Kegiatan', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    ),
                    const SizedBox(height: 16),
                    FadeInAnimation(delay: 0.9, child: _buildGalleryGrid()),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 140.0,
      pinned: true,
      elevation: 0,
      backgroundColor: AppColors.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: true,
        titlePadding: EdgeInsets.zero,
        title: LayoutBuilder(
          builder: (context, constraints) {
            final isCollapsed = constraints.biggest.height <= kToolbarHeight + MediaQuery.of(context).padding.top + 10;
            return AnimatedPadding(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.only(bottom: isCollapsed ? 16 : 48),
              child: Text(
                'Organisasi',
                style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            );
          },
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary, AppColors.primaryContainer],
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: 10,
                child: Icon(Icons.groups_rounded, size: 120, color: Colors.white.withAlpha(15)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrgCard(String name, String type, String role, String period, List<String> achievements, IconData icon, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(2), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: iconColor.withAlpha(10), borderRadius: BorderRadius.circular(16)),
                child: Icon(icon, color: iconColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    Text(type, style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(5),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.primary.withAlpha(10)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('PERAN', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 8, fontWeight: FontWeight.w900)),
                      Text(role, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 13)),
                    ],
                  ),
                ),
                Container(width: 1.5, height: 30, color: AppColors.primary.withAlpha(15)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('PERIODE', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 8, fontWeight: FontWeight.w900)),
                      Text(period, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Pencapaian Utama:', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 12, color: AppColors.primary)),
          const SizedBox(height: 12),
          ...achievements.map((a) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Icon(Icons.check_circle_rounded, size: 14, color: iconColor),
                const SizedBox(width: 10),
                Expanded(child: Text(a, style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontSize: 12, fontWeight: FontWeight.w500))),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildAddButton() {
    return Container(
      width: double.infinity,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(30), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: ElevatedButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.add_circle_outline_rounded, size: 20),
        label: Text('Tambah Riwayat Organisasi', style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _buildGalleryGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: List.generate(4, (index) => Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(24),
          image: const DecorationImage(
            image: NetworkImage('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80'),
            fit: BoxFit.cover,
          ),
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black.withAlpha(180)],
            ),
          ),
          padding: const EdgeInsets.all(16),
          alignment: Alignment.bottomLeft,
          child: Text('Kegiatan ${index + 1}', style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11)),
        ),
      )),
    );
  }
}

class _OrganizationBanner extends StatelessWidget {
  const _OrganizationBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(50), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withAlpha(40), borderRadius: BorderRadius.circular(8)),
            child: Text('LEADERSHIP PORTFOLIO', style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
          ),
          const SizedBox(height: 16),
          Text('Jejak Kontribusi\n& Kepemimpinan', style: AppTextStyles.headlineMd.copyWith(color: Colors.white, fontSize: 22, height: 1.2, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text('Catat setiap pengalaman organisasimu untuk masa depan.', style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
