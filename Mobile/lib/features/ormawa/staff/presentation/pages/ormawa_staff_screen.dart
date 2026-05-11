import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';

class OrmawaStaffScreen extends StatefulWidget {
  const OrmawaStaffScreen({super.key});

  @override
  State<OrmawaStaffScreen> createState() => _OrmawaStaffScreenState();
}

class _OrmawaStaffScreenState extends State<OrmawaStaffScreen> {
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final ormawaProvider = context.watch<OrmawaProvider>();
    final members = ormawaProvider.members.where((m) {
      final nameLower = m.name.toLowerCase();
      final roleLower = m.role.toLowerCase();
      final queryLower = _searchQuery.toLowerCase();
      return nameLower.contains(queryLower) || roleLower.contains(queryLower);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'MANAJEMEN STAF',
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
                  _buildStatsSection(ormawaProvider),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Daftar Staf Aktif (${members.length})',
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF475569),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSearchField(),
                  const SizedBox(height: 20),
                  if (members.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Text('Tidak ada staf yang ditemukan.', style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline)),
                      ),
                    ),
                  ...members.map((member) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _buildStaffCard(
                      context,
                      member,
                      _getRoleColor(member.role),
                    ),
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: ormawaProvider.hasPermission('MANAJEMEN_ANGGOTA') 
        ? FloatingActionButton.extended(
            onPressed: () => _showAddStaff(context),
            backgroundColor: AppColors.primary,
            icon: const Icon(Icons.add_moderator_rounded, color: Colors.white),
            label: const Text('Tambah Staf', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          )
        : null,
    );
  }

  Color _getRoleColor(String role) {
    final r = role.toUpperCase();
    if (r.contains('KETUA')) return const Color(0xFF1E293B);
    if (r.contains('SEKRETARIS')) return Colors.blue[800]!;
    if (r.contains('BENDAHARA')) return Colors.green[800]!;
    if (r.contains('KEPALA') || r.contains('KADEP')) return Colors.indigo[800]!;
    return Colors.purple[800]!;
  }

  Widget _buildStatsSection(OrmawaProvider provider) {
    final Map<String, int> divMap = {};
    for (var m in provider.members) {
      if (m.division.isNotEmpty && m.division != '-') {
        divMap[m.division] = (divMap[m.division] ?? 0) + 1;
      }
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(provider.members.length.toString(), 'Total Staf', Icons.badge_rounded, Colors.blue),
          Container(width: 1, height: 40, color: const Color(0xFFF1F5F9)),
          _buildStatItem(divMap.length.toString(), 'Divisi', Icons.account_tree_rounded, Colors.indigo),
          Container(width: 1, height: 40, color: const Color(0xFFF1F5F9)),
          _buildStatItem(provider.members.where((m) => m.role.toUpperCase().contains('PANITIA')).length.toString(), 'Panitia', Icons.assignment_ind_rounded, Colors.teal),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 8),
        Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
      ],
    );
  }

  Widget _buildSearchField() {
    return Container(
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
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: 'Cari nama atau jabatan staf...',
                hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                border: InputBorder.none,
              ),
            ),
          ),
          if (_searchQuery.isNotEmpty)
            GestureDetector(
              onTap: () {
                _searchController.clear();
                setState(() {
                  _searchQuery = '';
                });
              },
              child: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8), size: 20),
            ),
        ],
      ),
    );
  }

  Widget _buildStaffCard(BuildContext context, OrmawaMember member, Color roleColor) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrmawaStaffDetailScreen(
              name: member.name,
              role: member.role,
              division: member.division,
              initial: member.initial,
              roleColor: roleColor,
              nim: member.nim,
              email: member.email ?? '-',
              phone: member.phone ?? '-',
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [roleColor.withAlpha(200), roleColor]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(child: Text(member.initial, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(member.name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900)),
                      const Icon(Icons.verified_user_rounded, size: 16, color: Colors.blue),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(member.role, style: AppTextStyles.labelSm.copyWith(color: roleColor, fontWeight: FontWeight.bold, fontSize: 11)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.corporate_fare_rounded, size: 12, color: Color(0xFF94A3B8)),
                      const SizedBox(width: 6),
                      Text(member.division, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFFE2E8F0)),
          ],
        ),
      ),
    );
  }

  void _showAddStaff(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateStaffScreen()),
    );
  }
}

class OrmawaCreateStaffScreen extends StatelessWidget {
  const OrmawaCreateStaffScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'TAMBAH STAF BARU',
            subtitle: 'REGISTRASI STAF',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Registrasi Staf & Ahli', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text('Tentukan jabatan dan wewenang untuk staf baru ini.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 32),
                  _buildDropdownField('Pilih Mahasiswa', 'Pilih dari database...', Icons.person_search_rounded),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildDropdownField('Jabatan', 'Contoh: Pembina', Icons.military_tech_rounded)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField('Divisi', 'Nama divisi...', Icons.business_center_rounded)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInputField('Email Resmi', 'email@bku.ac.id', Icons.email_rounded),
                  const SizedBox(height: 16),
                  _buildInputField('Nomor WhatsApp', '08xx-xxxx-xxxx', Icons.phone_android_rounded),
                  const SizedBox(height: 40),
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
                      child: const Text('Simpan Data Staf', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, String hint, IconData icon, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 12 : 0),
                child: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  maxLines: maxLines,
                  decoration: InputDecoration(
                    hintText: hint,
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

  Widget _buildDropdownField(String label, String hint, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(hint, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              ),
              const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8), size: 20),
            ],
          ),
        ),
      ],
    );
  }
}
class OrmawaStaffDetailScreen extends StatelessWidget {
  final String name;
  final String role;
  final String division;
  final String initial;
  final Color roleColor;
  final String nim;
  final String email;
  final String phone;

  const OrmawaStaffDetailScreen({
    super.key,
    required this.name,
    required this.role,
    required this.division,
    required this.initial,
    required this.roleColor,
    required this.nim,
    required this.email,
    required this.phone,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'DETAIL PROFIL STAF',
            subtitle: 'INFORMASI PERSONAL',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
            actions: [
              IconButton(onPressed: () {}, icon: const Icon(Icons.edit_outlined, color: Colors.white)),
            ],
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 20),
            // Header Profile
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [roleColor.withAlpha(200), roleColor]),
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(color: roleColor.withAlpha(50), blurRadius: 20, offset: const Offset(0, 10)),
                      ],
                    ),
                    child: Center(child: Text(initial, style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold))),
                  ),
                  const SizedBox(height: 16),
                  Text(name, style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900, fontSize: 24)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: roleColor.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                    child: Text(role, style: AppTextStyles.labelSm.copyWith(color: roleColor, fontWeight: FontWeight.w900)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            // Quick Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildActionCircle(Icons.call_rounded, 'Telepon', Colors.green),
                const SizedBox(width: 24),
                _buildActionCircle(Icons.chat_bubble_rounded, 'WhatsApp', Colors.blue),
                const SizedBox(width: 24),
                _buildActionCircle(Icons.email_rounded, 'Email', Colors.red),
              ],
            ),
            const SizedBox(height: 40),
            // Information List
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Text('Informasi Personal', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  const SizedBox(height: 16),
                  _buildInfoItem(Icons.badge_rounded, 'NIM / ID Staf', nim),
                  _buildInfoItem(Icons.corporate_fare_rounded, 'Divisi Utama', division),
                  _buildInfoItem(Icons.email_rounded, 'Email Institusi', email),
                  _buildInfoItem(Icons.phone_android_rounded, 'Nomor HP', phone),
                  const SizedBox(height: 32),
                   Text('Statistik Performa', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  const SizedBox(height: 16),
                  _buildPerfCard('Partisipasi Agenda', '98%', Colors.green),
                  _buildPerfCard('Tugas Diselesaikan', '24/25', Colors.blue),
                ],
              ),
            ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCircle(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(color: color.withAlpha(10), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
              Text(value, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPerfCard(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
          Text(value, style: AppTextStyles.bodyMd.copyWith(color: color, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
