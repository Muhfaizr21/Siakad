import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/organization_history.dart';

class OrganisasiScreen extends StatelessWidget {
  const OrganisasiScreen({super.key});

  void _showAddOrgBottomSheet(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final typeController = TextEditingController();
    final roleController = TextEditingController();
    final startYearController = TextEditingController();
    final endYearController = TextEditingController();
    final descController = TextEditingController();
    final achievementsController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          padding: const EdgeInsets.all(24),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
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
                  Text(
                    'Tambah Riwayat Organisasi',
                    style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameController,
                    decoration: InputDecoration(
                      labelText: 'Nama Organisasi',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      prefixIcon: const Icon(Icons.business_rounded),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Nama organisasi wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: typeController,
                    decoration: InputDecoration(
                      labelText: 'Tipe Organisasi (e.g. BEM, HIMA, UKM)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      prefixIcon: const Icon(Icons.category_rounded),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Tipe organisasi wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: roleController,
                    decoration: InputDecoration(
                      labelText: 'Jabatan (Peran)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      prefixIcon: const Icon(Icons.person_rounded),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Jabatan wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: startYearController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Tahun Mulai',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          validator: (v) => v == null || v.isEmpty ? 'Wajib' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: endYearController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Tahun Selesai (Opsional)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: descController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: 'Deskripsi Kegiatan',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      prefixIcon: const Icon(Icons.description_rounded),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: achievementsController,
                    decoration: InputDecoration(
                      labelText: 'Pencapaian Utama (pisahkan dengan koma)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      prefixIcon: const Icon(Icons.star_rounded),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          final studentProvider = Provider.of<StudentProvider>(context, listen: false);
                          final achievementsList = achievementsController.text.isNotEmpty
                              ? achievementsController.text.split(',').map((s) => s.trim()).toList()
                              : <String>[];
                          final startYear = int.tryParse(startYearController.text) ?? 2023;
                          final endYear = int.tryParse(endYearController.text);

                          final org = OrganizationHistory(
                            id: '',
                            namaOrganisasi: nameController.text,
                            tipe: typeController.text,
                            jabatan: roleController.text,
                            periodeMulai: startYear,
                            periodeSelesai: endYear,
                            deskripsiKegiatan: descController.text,
                            apresiasi: achievementsList.isNotEmpty ? achievementsList.first : 'Partisipasi aktif',
                            statusVerifikasi: 'Menunggu',
                            achievements: achievementsList.isNotEmpty ? achievementsList : ['Anggota aktif kepengurusan'],
                          );

                          try {
                            await studentProvider.addOrganizationHistory(org);
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text('Riwayat organisasi berhasil ditambahkan!'),
                                  backgroundColor: AppColors.primary,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Gagal menambah riwayat organisasi: $e'),
                                  backgroundColor: Colors.red,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              );
                            }
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      child: const Text('Simpan Riwayat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

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
                    Consumer<StudentProvider>(
                      builder: (context, provider, child) {
                        final orgList = provider.organizationHistory;
                        if (orgList.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 32),
                              child: Column(
                                children: [
                                  Icon(Icons.groups_outlined, size: 64, color: AppColors.outline.withAlpha(80)),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Belum ada riwayat organisasi',
                                    style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Daftarkan riwayat organisasi Anda di bawah ini.',
                                    style: AppTextStyles.labelSm.copyWith(color: AppColors.outline),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: orgList.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 16),
                          itemBuilder: (context, index) {
                            final org = orgList[index];
                            final isBEM = org.tipe.toLowerCase().contains('bem');
                            return FadeInAnimation(
                              delay: 0.3 + (index * 0.1),
                              child: _buildOrgCard(
                                org.namaOrganisasi,
                                org.tipe,
                                org.jabatan,
                                "${org.periodeMulai} - ${org.periodeSelesai ?? 'Sekarang'}",
                                org.achievements,
                                isBEM ? Icons.groups_rounded : Icons.diversity_3_rounded,
                                isBEM ? const Color(0xFF2563EB) : const Color(0xFF9333EA),
                              ),
                            );
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    FadeInAnimation(delay: 0.7, child: _buildAddButton(context)),
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

  Widget _buildAddButton(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(30), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: ElevatedButton.icon(
        onPressed: () => _showAddOrgBottomSheet(context),
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
