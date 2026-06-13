import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/organization_history.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/add_organisasi_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/rekrutmen_ormawa_screen.dart';

class OrganisasiScreen extends StatefulWidget {
  const OrganisasiScreen({super.key});

  @override
  State<OrganisasiScreen> createState() => _OrganisasiScreenState();
}

class _OrganisasiScreenState extends State<OrganisasiScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().loadAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final orgHistory = student.organizationHistory;

    return Scaffold(
      backgroundColor: Colors.white,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.picture_as_pdf_rounded, color: Colors.white),
        label: Text('Export Portfolio', style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900)),
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'ORGANISASI & KOMUNITAS',
            subtitle: 'KAMPUS BHAKTI KENCANA',
            variant: AppBarVariant.student,
            expandedHeight: 160,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  const FadeInAnimation(delay: 0.2, child: _OrganizationBanner()),
                  const SizedBox(height: 24),
                  FadeInAnimation(
                    delay: 0.3,
                    child: _buildPortfolioStats(orgHistory),
                  ),
                  const SizedBox(height: 32),
                  FadeInAnimation(
                    delay: 0.4,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Riwayat Organisasi', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        TextButton(onPressed: () {}, child: Text('Lihat Semua', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (student.isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                    )
                  else if (orgHistory.isEmpty)
                    FadeInAnimation(
                      delay: 0.5,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(5),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.surfaceVariant),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Belum ada riwayat organisasi yang sinkron.',
                          style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
                        ),
                      ),
                    )
                  else
                    ...orgHistory.asMap().entries.map((entry) {
                      final index = entry.key;
                      final org = entry.value;
                      final period = org.periodeSelesai != null 
                          ? '${org.periodeMulai} - ${org.periodeSelesai}' 
                          : '${org.periodeMulai} - Sekarang';
                      
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: FadeInAnimation(
                          delay: 0.5 + (index * 0.1),
                          child: _buildOrgCard(
                            context,
                            org.namaOrganisasi,
                            org.tipe,
                            org.jabatan,
                            period,
                            org.achievements,
                            index % 2 == 0 ? Icons.groups_rounded : Icons.diversity_3_rounded,
                            index % 2 == 0 ? const Color(0xFF2563EB) : const Color(0xFF9333EA),
                            org.statusVerifikasi,
                            org.deskripsiKegiatan,
                          ),
                        ),
                      );
                    }),
                  const SizedBox(height: 24),
                  FadeInAnimation(delay: 0.7, child: _buildAddButton(context)),
                  const SizedBox(height: 32),
                  FadeInAnimation(
                    delay: 0.75,
                    child: _buildExploreSection(context),
                  ),
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
        ],
      ),
    );
  }

  Widget _buildOrgCard(
    BuildContext context, 
    String name, 
    String type, 
    String role, 
    String period, 
    List<String> achievements, 
    IconData icon, 
    Color iconColor, 
    String statusVerifikasi,
    String description,
  ) {
    final isVerified = statusVerifikasi.toLowerCase() == 'terverifikasi';
    final isPending = statusVerifikasi.toLowerCase() == 'pending';
    
    Color statusBgColor = Colors.grey.withAlpha(20);
    Color statusTextColor = AppColors.outline;
    
    if (isVerified) {
      statusBgColor = Colors.green.withAlpha(20);
      statusTextColor = Colors.green;
    } else if (isPending) {
      statusBgColor = Colors.orange.withAlpha(20);
      statusTextColor = Colors.orange;
    } else if (statusVerifikasi.toLowerCase() == 'ditolak') {
      statusBgColor = Colors.red.withAlpha(20);
      statusTextColor = Colors.red;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _showOrgDetail(context, name, type, role, period, achievements, icon, iconColor, statusVerifikasi, description),
        borderRadius: BorderRadius.circular(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: iconColor.withAlpha(10), 
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Icon(icon, color: iconColor, size: 30),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        const SizedBox(height: 2),
                        Text(type, style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.bold, fontSize: 11)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      statusVerifikasi.toUpperCase(), 
                      style: AppTextStyles.labelSm.copyWith(
                        color: statusTextColor, 
                        fontSize: 8, 
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(5),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withAlpha(8)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('JABATAN', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                        const SizedBox(height: 2),
                        Text(role, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(width: 1.5, height: 25, color: AppColors.primary.withAlpha(15)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('PERIODE', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                        const SizedBox(height: 2),
                        Text(period, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (achievements.isNotEmpty) ...[
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Pencapaian Utama:', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 12, color: AppColors.primary)),
                    const SizedBox(height: 12),
                    ...achievements.map((a) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(color: iconColor.withAlpha(15), shape: BoxShape.circle),
                            child: Icon(Icons.check_rounded, size: 10, color: iconColor),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(a, style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontSize: 12, fontWeight: FontWeight.w600))),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildPortfolioStats(List<OrganizationHistory> orgHistory) {
    final totalOrg = orgHistory.length.toString();
    final verifiedOrg = orgHistory.where((org) => org.statusVerifikasi.toLowerCase() == 'terverifikasi').length.toString();
    final totalAchievements = orgHistory.fold<int>(0, (sum, org) => sum + org.achievements.length).toString();

    return Row(
      children: [
        _buildStatItem(totalOrg, 'Total Organisasi', Icons.bolt_rounded, Colors.orange),
        const SizedBox(width: 12),
        _buildStatItem(verifiedOrg, 'Terverifikasi', Icons.verified_user_rounded, Colors.blue),
        const SizedBox(width: 12),
        _buildStatItem(totalAchievements, 'Pencapaian', Icons.emoji_events_rounded, Colors.green),
      ],
    );
  }

  Widget _buildStatItem(String count, String label, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.surfaceVariant),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 8),
            Text(count, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.primary)),
            Text(label, textAlign: TextAlign.center, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 8, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildExploreSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Jelajahi Organisasi', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const RekrutmenOrmawaScreen()),
                );
              }, 
              child: Text('Lihat Semua', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold))
            ),
          ],
        ),
        const SizedBox(height: 16),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildExploreCard('UKM Musik', 'Seni & Budaya', 'https://images.unsplash.com/photo-1514320291944-2390231936c1?w=400&q=80'),
              _buildExploreCard('KSR PMI', 'Kemanusiaan', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80'),
              _buildExploreCard('UKM Olahraga', 'Minat Bakat', 'https://images.unsplash.com/photo-1461896756970-8d1744b4d59f?w=400&q=80'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildExploreCard(String name, String category, String imageUrl) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            child: Image.network(
              imageUrl, 
              height: 100, 
              width: 160, 
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                height: 100,
                width: 160,
                color: AppColors.surfaceVariant,
                child: Icon(Icons.broken_image_rounded, color: AppColors.outline),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
                const SizedBox(height: 2),
                Text(category, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 9, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddButton(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const AddOrganisasiScreen()),
        );
      },
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(5),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.primary.withAlpha(30),
            width: 2,
            style: BorderStyle.solid,
          ),
        ),
        child: Column(
          children: [
            Icon(Icons.add_circle_outline_rounded, color: AppColors.primary, size: 28),
            const SizedBox(height: 8),
            Text(
              'Tambah Riwayat Organisasi', 
              style: AppTextStyles.labelMd.copyWith(
                color: AppColors.primary, 
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
          ],
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
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Image.network(
                'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&q=80',
                height: double.infinity,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: AppColors.surfaceVariant,
                  child: Icon(Icons.broken_image_rounded, color: AppColors.outline),
                ),
              ),
            ),
            Container(
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
          ],
        ),
      )),
    );
  }

  void _showOrgDetail(
    BuildContext context, 
    String name, 
    String type, 
    String role, 
    String period, 
    List<String> achievements, 
    IconData icon, 
    Color iconColor, 
    String statusVerifikasi,
    String description,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2))),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: iconColor.withAlpha(15), borderRadius: BorderRadius.circular(20)),
                        child: Icon(icon, color: iconColor, size: 32),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name, style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.primary)),
                            Text(type, style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildDetailSection('Detail Posisi', [
                    _buildDetailRow(Icons.badge_rounded, 'Jabatan', role),
                    _buildDetailRow(Icons.calendar_today_rounded, 'Periode', period),
                    _buildDetailRow(Icons.info_outline_rounded, 'Status Verifikasi', statusVerifikasi),
                  ]),
                  const SizedBox(height: 32),
                  Text('Deskripsi Kontribusi', style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
                  const SizedBox(height: 12),
                  Text(
                    description.isNotEmpty ? description : 'Tidak ada deskripsi kontribusi.',
                    style: AppTextStyles.labelMd.copyWith(color: AppColors.onSurfaceVariant, height: 1.5),
                  ),
                  if (achievements.isNotEmpty) ...[
                    const SizedBox(height: 32),
                    Text('Pencapaian & Impact', style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
                    const SizedBox(height: 16),
                    ...achievements.map((a) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant.withAlpha(30),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.surfaceVariant.withAlpha(50)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.stars_rounded, color: Colors.orange, size: 20),
                          const SizedBox(width: 12),
                          Expanded(child: Text(a, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold, fontSize: 13))),
                        ],
                      ),
                    )),
                  ],
                  const SizedBox(height: 32),
                  Text('Dokumentasi', style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 120,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: 3,
                      itemBuilder: (context, index) => Container(
                        width: 180,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          image: const DecorationImage(
                            image: NetworkImage('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTextStyles.titleLg.copyWith(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(5),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.primary.withAlpha(10)),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 9, fontWeight: FontWeight.bold)),
              Text(value, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.primary)),
            ],
          ),
        ],
      ),
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
