import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/ormawa/struktur/presentation/pages/manage_struktur_screen.dart';

class OrmawaStrukturScreen extends StatelessWidget {
  const OrmawaStrukturScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        slivers: [
          BkuAppBar(
            title: 'STRUKTUR ORGANISASI',
            subtitle: 'MANAJEMEN INTERNAL',
            variant: AppBarVariant.ormawa,
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
                  _buildCabinetInfo(),
                  const SizedBox(height: 32),
                  
                  // 1. Pimpinan Inti Section
                  _buildSectionTitle('Pimpinan Inti'),
                  const SizedBox(height: 16),
                  _buildPrimaryMemberCard('Ahmad Fauzi', 'Ketua Umum', 'Teknik Informatika', Icons.stars_rounded),
                  const SizedBox(height: 12),
                  _buildPrimaryMemberCard('Siti Nurhaliza', 'Wakil Ketua Umum', 'Farmasi', Icons.verified_user_rounded),
                  
                  const SizedBox(height: 32),
                  
                  // 2. Sekretariat & Bendahara Section
                  _buildSectionTitle('Sekretariat & Bendahara'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildSecondaryMemberCard('Budi Santoso', 'Sekretaris', Icons.edit_document)),
                      const SizedBox(width: 12),
                      Expanded(child: _buildSecondaryMemberCard('Lestari Putri', 'Bendahara', Icons.payments_rounded)),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // 3. Departments
                  _buildDepartmentCard('Departemen Pengembangan SDM', [
                    _buildStaffTile('Rizky Ramadhan', 'Kepala Departemen', 'Psikologi', isHead: true),
                    _buildStaffTile('Dewi Sartika', 'Staff Ahli', 'Hukum'),
                    _buildStaffTile('Andi Wijaya', 'Staff Muda', 'Sosiologi'),
                  ]),
                  
                  const SizedBox(height: 16),
                  
                  _buildDepartmentCard('Departemen Minat & Bakat', [
                    _buildStaffTile('Gilang Dirga', 'Kepala Departemen', 'Ilmu Komunikasi', isHead: true),
                    _buildStaffTile('Maya Sofia', 'Staff Ahli', 'Seni Rupa'),
                  ]),
                  
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ManageStrukturScreen()),
          );
        },
        backgroundColor: AppColors.primary,
        elevation: 8,
        icon: const Icon(Icons.auto_fix_high_rounded, color: Colors.white),
        label: const Text('Kelola Struktur', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
      ),
    );
  }

  Widget _buildCabinetInfo() {
    return FadeInAnimation(
      delay: 0.2,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(10),
              blurRadius: 30,
              offset: const Offset(0, 15),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [AppColors.primary.withAlpha(20), AppColors.primary.withAlpha(5)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.account_tree_rounded, color: AppColors.primary, size: 28),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Kabinet Digital Era',
                    style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Periode Kepengurusan 2026/2027',
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: AppTextStyles.labelSm.copyWith(
          color: const Color(0xFF475569),
          fontWeight: FontWeight.w900,
          letterSpacing: 1.5,
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildPrimaryMemberCard(String name, String position, String major, IconData icon) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF003399), Color(0xFF001A4D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF003399).withAlpha(40),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withAlpha(20), shape: BoxShape.circle),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.bodyLg.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                ),
                const SizedBox(height: 2),
                Text(
                  position.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withAlpha(15), borderRadius: BorderRadius.circular(8)),
            child: Text(
              major,
              style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecondaryMemberCard(String name, String position, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppColors.primary.withAlpha(10), shape: BoxShape.circle),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            name,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 14),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            position,
            style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildDepartmentCard(String title, List<Widget> members) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            child: Row(
              children: [
                Container(
                  width: 3,
                  height: 18,
                  decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Color(0xFFF8FAFC), height: 1, thickness: 1),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(children: members),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffTile(String name, String position, String major, {bool isHead = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: isHead ? const Color(0xFFF8FAFC) : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isHead ? AppColors.primary : const Color(0xFFF1F5F9),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                name[0],
                style: TextStyle(
                  color: isHead ? Colors.white : AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: isHead ? FontWeight.w900 : FontWeight.w700,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                Text(
                  position,
                  style: AppTextStyles.labelSm.copyWith(
                    color: const Color(0xFF94A3B8),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Text(
            major,
            style: AppTextStyles.labelSm.copyWith(color: const Color(0xFFCBD5E1), fontSize: 9, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
