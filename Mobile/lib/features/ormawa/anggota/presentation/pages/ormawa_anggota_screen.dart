import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class OrmawaAnggotaScreen extends StatefulWidget {
  const OrmawaAnggotaScreen({super.key});

  @override
  State<OrmawaAnggotaScreen> createState() => _OrmawaAnggotaScreenState();
}

class _OrmawaAnggotaScreenState extends State<OrmawaAnggotaScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'MANAJEMEN ANGGOTA',
            subtitle: 'DATABASE KEANGGOTAAN',
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'DAFTAR ANGGOTA',
                        style: AppTextStyles.labelMd.copyWith(
                          color: const Color(0xFF475569),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.filter_list_rounded, size: 18),
                        label: const Text('Filter'),
                        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSearchField(),
                  const SizedBox(height: 20),
                  _buildMemberCard(
                    context,
                    'Mahasiswa Farmasi',
                    '231FF01001',
                    'KETUA',
                    'Inti',
                    'MF',
                    Colors.indigo,
                  ),
                  const SizedBox(height: 12),
                  _buildMemberCard(
                    context,
                    'Siti Aminah',
                    '231FF01005',
                    'SEKRETARIS',
                    'Administrasi',
                    'SA',
                    Colors.purple,
                  ),
                  const SizedBox(height: 12),
                  _buildMemberCard(
                    context,
                    'Budi Darmawan',
                    '231FF01012',
                    'BENDAHARA',
                    'Keuangan',
                    'BD',
                    Colors.green,
                  ),
                  const SizedBox(height: 12),
                  _buildMemberCard(
                    context,
                    'Dewi Sartika',
                    '231FF01045',
                    'ANGGOTA',
                    'Humas',
                    'DS',
                    Colors.blue,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddMember(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('Tambah Anggota', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildSummaryGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _buildStatCard('Total Anggota', '156', Icons.groups_rounded, Colors.blue),
        _buildStatCard('Aktif', '142', Icons.check_circle_rounded, Colors.green),
        _buildStatCard('Laki-laki', '68', Icons.male_rounded, Colors.indigo),
        _buildStatCard('Perempuan', '88', Icons.female_rounded, Colors.pink),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 8),
              Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
        ],
      ),
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
              decoration: InputDecoration(
                hintText: 'Cari nama atau NIM...',
                hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMemberCard(BuildContext context, String name, String nim, String position, String division, String initial, Color posColor) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrmawaAnggotaDetailScreen(
              name: name,
              nim: nim,
              position: position,
              division: division,
              initial: initial,
              posColor: posColor,
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
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primary.withAlpha(10),
              child: Text(initial, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900)),
                      const Icon(Icons.more_vert_rounded, size: 18, color: Color(0xFF94A3B8)),
                    ],
                  ),
                  Text(nim, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: posColor.withAlpha(10), borderRadius: BorderRadius.circular(6)),
                        child: Text(position, style: AppTextStyles.labelSm.copyWith(color: posColor, fontWeight: FontWeight.w900, fontSize: 8)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                        child: Text(division, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 8)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddMember(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaCreateAnggotaScreen()),
    );
  }
}

class OrmawaCreateAnggotaScreen extends StatelessWidget {
  const OrmawaCreateAnggotaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'TAMBAH ANGGOTA BARU',
            subtitle: 'REGISTRASI ANGGOTA',
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
                  Text('Registrasi Anggota', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text('Daftarkan mahasiswa sebagai anggota aktif ormawa.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 32),
                  _buildDropdownField('Pilih Mahasiswa', 'Cari mahasiswa...', Icons.person_search_rounded),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildDropdownField('Jabatan', 'Pilih Jabatan', Icons.badge_rounded)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField('Divisi', 'Misal: Humas, IT, dll', Icons.account_tree_rounded)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInputField('Catatan / Keterangan', 'Tambahkan informasi tambahan...', Icons.notes_rounded, maxLines: 3),
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
                      child: const Text('Simpan Anggota', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
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
class OrmawaAnggotaDetailScreen extends StatelessWidget {
  final String name;
  final String nim;
  final String position;
  final String division;
  final String initial;
  final Color posColor;

  const OrmawaAnggotaDetailScreen({
    super.key,
    required this.name,
    required this.nim,
    required this.position,
    required this.division,
    required this.initial,
    required this.posColor,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: 'PROFIL ANGGOTA',
            subtitle: 'INFORMASI MAHASISWA',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 32),
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primary.withAlpha(10),
                    child: Text(initial, style: const TextStyle(color: AppColors.primary, fontSize: 32, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),
                  Text(name, style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900)),
                  Text(nim, style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: posColor.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                        child: Text(position, style: AppTextStyles.labelSm.copyWith(color: posColor, fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                        child: Text(division, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('KONTAK & DATA'),
                  const SizedBox(height: 16),
                  _buildDetailRow(Icons.email_outlined, 'Email', 'mahasiswa@bku.ac.id'),
                  _buildDetailRow(Icons.phone_android_outlined, 'Nomor HP', '0812-xxxx-xxxx'),
                  _buildDetailRow(Icons.location_on_outlined, 'Alamat', 'Bandung, Jawa Barat'),
                  const SizedBox(height: 32),
                  _buildSectionTitle('AKTIVITAS ORGANISASI'),
                  const SizedBox(height: 16),
                  _buildActivityItem('Kehadiran Rapat', '92%', Colors.green),
                  _buildActivityItem('Kontribusi Event', '15 Event', Colors.blue),
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
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

  Widget _buildActivityItem(String label, String value, Color color) {
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
