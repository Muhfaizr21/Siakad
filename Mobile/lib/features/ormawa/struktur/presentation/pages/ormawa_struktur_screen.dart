import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/ormawa/struktur/presentation/pages/manage_struktur_screen.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_member_model.dart';

class OrmawaStrukturScreen extends StatefulWidget {
  const OrmawaStrukturScreen({super.key});

  @override
  State<OrmawaStrukturScreen> createState() => _OrmawaStrukturScreenState();
}

class _OrmawaStrukturScreenState extends State<OrmawaStrukturScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().refreshData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final members = ormawaProvider.members;
    
    // Core members
    final ketua = members.firstWhere(
      (m) => m.role.toUpperCase() == 'KETUA UMUM' || m.role.toUpperCase() == 'KETUA', 
      orElse: () => OrmawaMemberModel(id: '', mahasiswaId: '', name: '-', nim: '-', role: 'Ketua Umum', division: 'BPH', status: 'Aktif')
    );
    final wakil = members.firstWhere(
      (m) => m.role.toUpperCase().contains('WAKIL KETUA'), 
      orElse: () => OrmawaMemberModel(id: '', mahasiswaId: '', name: '-', nim: '-', role: 'Wakil Ketua Umum', division: 'BPH', status: 'Aktif')
    );
    
    final sekretaris = members.where((m) => m.role.toUpperCase().contains('SEKRETARIS')).toList();
    final bendahara = members.where((m) => m.role.toUpperCase().contains('BENDAHARA')).toList();

    // Group others by division
    final Map<String, List<OrmawaMember>> departments = {};
    for (var m in members) {
      if (m.division != 'BPH' && m.division != '-' && m.division.isNotEmpty) {
        if (!departments.containsKey(m.division)) {
          departments[m.division] = [];
        }
        departments[m.division]!.add(m);
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'STRUKTUR ORGANISASI',
            subtitle: ormawaProvider.orgName,
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
                  _buildCabinetInfo(ormawaProvider.academicYear),
                  const SizedBox(height: 32),
                  
                  // 1. Pimpinan Inti
                  _buildSectionTitle('PIMPINAN INTI'),
                  const SizedBox(height: 16),
                  _buildPrimaryMemberCard(
                    ketua.name,
                    ketua.role,
                    'BPH',
                    Icons.stars_rounded,
                  ),
                  const SizedBox(height: 12),
                  _buildSecondaryMemberCard(
                    wakil.name,
                    wakil.role,
                    Icons.shield_rounded,
                  ),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('BADAN PENGURUS HARIAN'),
                  const SizedBox(height: 16),
                  
                  // Sekretaris & Bendahara Row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: sekretaris.map((m) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _buildStaffTile(m.name, m.role, m.nim, isHead: false),
                          )).toList(),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          children: bendahara.map((m) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _buildStaffTile(m.name, m.role, m.nim, isHead: false),
                          )).toList(),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // 2. Departments
                  if (departments.isNotEmpty) ...[
                    _buildSectionTitle('DIVISI & DEPARTEMEN'),
                    const SizedBox(height: 16),
                    ...departments.entries.map((dept) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _buildDepartmentCard(dept.key, [
                        ...dept.value.map((m) => _buildStaffTile(
                          m.name, 
                          m.role, 
                          m.nim,
                          isHead: m.role.toUpperCase().contains('KEPALA') || m.role.toUpperCase().contains('KADEP') || m.role.toUpperCase().contains('KOORDINATOR'),
                        )),
                      ]),
                    )),
                  ],
                  
                  if (members.isEmpty && !ormawaProvider.isLoading) 
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Text('Data pengurus belum tersedia'),
                      ),
                    ),
                  
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: _buildFab(context, ormawaProvider),
    );
  }

  Widget? _buildFab(BuildContext context, OrmawaProvider provider) {
    if (!provider.hasPermission('MANAJEMEN_STRUKTUR')) return null;
    
    return FloatingActionButton.extended(
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
    );
  }

  Widget _buildCabinetInfo(String year) {
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
                    'Struktur Kepengurusan',
                    style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Periode $year',
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
