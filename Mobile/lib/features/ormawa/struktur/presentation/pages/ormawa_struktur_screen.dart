import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/ormawa/struktur/presentation/pages/manage_struktur_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/anggota/presentation/pages/ormawa_anggota_screen.dart';
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
                  _buildSectionTitle(
                    'PIMPINAN INTI',
                    action: TextButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ManageStrukturScreen()),
                        );
                      },
                      icon: const Icon(Icons.group_add_rounded, size: 14),
                      label: const Text('Kelola Pengurus BPH', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10)),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        backgroundColor: AppColors.primary.withAlpha(20),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildPrimaryMemberCard(
                    context,
                    ketua,
                    Icons.stars_rounded,
                  ),
                  const SizedBox(height: 12),
                  _buildSecondaryMemberCard(
                    context,
                    wakil,
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
                            child: _buildStaffTile(context, m, isHead: false),
                          )).toList(),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          children: bendahara.map((m) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _buildStaffTile(context, m, isHead: false),
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
                          context,
                          m, 
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
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withAlpha(50), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(12),
              blurRadius: 40,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary.withAlpha(30), AppColors.primary.withAlpha(10)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
              ),
              child: const Icon(Icons.account_tree_rounded, color: AppColors.primary, size: 32),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Struktur Kepengurusan',
                    style: AppTextStyles.titleLg.copyWith(fontSize: 19, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Periode $year',
                      style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {Widget? action}) {
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 16,
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF334155),
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          if (action != null) action,
        ],
      ),
    );
  }

  Widget _buildPrimaryMemberCard(BuildContext context, OrmawaMember member, IconData icon) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => OrmawaAnggotaDetailScreen(member: member)));
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFF003399)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF003399).withAlpha(40),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(20),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withAlpha(30), width: 1.5),
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.name,
                      style: AppTextStyles.bodyLg.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      member.role.toUpperCase(),
                      style: AppTextStyles.labelSm.copyWith(color: Colors.white.withAlpha(200), fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withAlpha(20)),
                ),
                child: Text(
                  'BPH',
                  style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSecondaryMemberCard(BuildContext context, OrmawaMember member, IconData icon) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => OrmawaAnggotaDetailScreen(member: member)));
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF64748B).withAlpha(5),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(15), 
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.name,
                      style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900, fontSize: 18, color: const Color(0xFF1E293B), letterSpacing: 0.5),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      member.role,
                      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDepartmentCard(String title, List<Widget> members) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF64748B).withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC).withAlpha(150),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 20,
                  decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 14, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(children: members),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffTile(BuildContext context, OrmawaMember member, {bool isHead = false}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => OrmawaAnggotaDetailScreen(member: member)));
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.only(bottom: 4),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: isHead ? const Color(0xFFF8FAFC) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: isHead ? Border.all(color: const Color(0xFFE2E8F0), width: 1) : null,
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: isHead 
                    ? LinearGradient(colors: [AppColors.primary, AppColors.primary.withAlpha(200)])
                    : null,
                  color: isHead ? null : const Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                  boxShadow: isHead ? [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(40),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ] : null,
                ),
                child: Center(
                  child: Text(
                    member.initial.isNotEmpty ? member.initial[0] : '?',
                    style: TextStyle(
                      color: isHead ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.name,
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: isHead ? FontWeight.w900 : FontWeight.w700,
                        color: const Color(0xFF1E293B),
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      member.role,
                      style: AppTextStyles.labelSm.copyWith(
                        color: isHead ? AppColors.primary : const Color(0xFF94A3B8),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  member.nim,
                  style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
