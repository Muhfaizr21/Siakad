import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';

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
      body: RefreshIndicator(
        onRefresh: () => context.read<OrmawaProvider>().refreshData(),
        child: CustomScrollView(
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
                  OrmawaListHeader(
                    title: 'Daftar Staf Aktif (${members.length})',
                    searchHint: 'Cari nama atau jabatan staf...',
                    searchController: _searchController,
                    onRefresh: () => context.read<OrmawaProvider>().refreshData(),
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
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

class OrmawaCreateStaffScreen extends StatefulWidget {
  const OrmawaCreateStaffScreen({super.key});

  @override
  State<OrmawaCreateStaffScreen> createState() => _OrmawaCreateStaffScreenState();
}

class _OrmawaCreateStaffScreenState extends State<OrmawaCreateStaffScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  String? _selectedMahasiswaId;
  String? _selectedMahasiswaName;
  String? _selectedJabatan;
  String? _selectedDivisi;

  bool _isLoading = false;

  final List<String> _jabatanOptions = [
    'Pembina',
    'Ketua',
    'Wakil Ketua',
    'Sekretaris',
    'Bendahara',
    'Kepala Divisi',
    'Staff',
  ];

  final List<String> _divisiOptions = [
    'Inti',
    'Kesekretariatan',
    'Humas',
    'Pengembangan Organisasi',
    'Kerohanian',
    'Olahraga',
    'Seni dan Budaya',
    'Sosial Masyarakat',
    'Ilmu Pengetahuan dan Teknologi',
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveStaff() async {
    if (_selectedMahasiswaId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih mahasiswa terlebih dahulu'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_selectedJabatan == null || _selectedDivisi == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lengkapi semua field'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await context.read<OrmawaProvider>().addMember({
        'mahasiswa_id': _selectedMahasiswaId,
        'jabatan': _selectedJabatan,
        'divisi': _selectedDivisi,
        'email': _emailController.text,
        'phone': _phoneController.text,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Staf berhasil ditambahkan'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menambahkan staf: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
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
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Registrasi Staf & Ahli',
                      style: AppTextStyles.titleLg.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tentukan jabatan dan wewenang untuk staf baru ini.',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF94A3B8),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Pilih Mahasiswa
                    _buildDropdownField(
                      label: 'Pilih Mahasiswa',
                      hint: _selectedMahasiswaName ?? 'Pilih dari database...',
                      icon: Icons.person_search_rounded,
                      onTap: () => _showMahasiswaSelector(),
                    ),
                    const SizedBox(height: 16),

                    // Jabatan & Divisi Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildDropdownField(
                            label: 'Jabatan',
                            hint: _selectedJabatan ?? 'Pilih jabatan...',
                            icon: Icons.military_tech_rounded,
                            onTap: () => _showJabatanSelector(),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildDropdownField(
                            label: 'Divisi',
                            hint: _selectedDivisi ?? 'Pilih divisi...',
                            icon: Icons.business_center_rounded,
                            onTap: () => _showDivisiSelector(),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Email
                    _buildInputField(
                      controller: _emailController,
                      label: 'Email Resmi',
                      hint: 'email@bku.ac.id',
                      icon: Icons.email_rounded,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),

                    // WhatsApp
                    _buildInputField(
                      controller: _phoneController,
                      label: 'Nomor WhatsApp',
                      hint: '08xx-xxxx-xxxx',
                      icon: Icons.phone_android_rounded,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 40),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _saveStaff,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                          shadowColor: AppColors.primary.withAlpha(50),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Simpan Data Staf',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMahasiswaSelector() {
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
        padding: const EdgeInsets.all(24),
        child: Column(
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
              'Pilih Mahasiswa',
              style: AppTextStyles.titleLg.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Consumer<OrmawaProvider>(
                builder: (context, provider, child) {
                  // Ambil mahasiswa yang belum jadi staf
                  final availableMembers = provider.members
                      .where((m) => m.role.toLowerCase() == 'anggota' || m.role.toLowerCase() == '-')
                      .toList();

                  if (availableMembers.isEmpty) {
                    return Center(
                      child: Text(
                        'Tidak ada mahasiswa tersedia',
                        style: AppTextStyles.bodyMd.copyWith(
                          color: AppColors.neutral600,
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    itemCount: availableMembers.length,
                    itemBuilder: (context, index) {
                      final member = availableMembers[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primary.withAlpha(15),
                          child: Text(
                            member.initial,
                            style: TextStyle(color: AppColors.primary),
                          ),
                        ),
                        title: Text(member.name),
                        subtitle: Text(member.nim),
                        onTap: () {
                          setState(() {
                            _selectedMahasiswaId = member.id;
                            _selectedMahasiswaName = member.name;
                          });
                          Navigator.pop(context);
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showJabatanSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
              'Pilih Jabatan',
              style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...List.generate(_jabatanOptions.length, (index) {
              final jabatan = _jabatanOptions[index];
              return ListTile(
                leading: Icon(
                  Icons.military_tech_rounded,
                  color: AppColors.primary,
                ),
                title: Text(jabatan),
                onTap: () {
                  setState(() => _selectedJabatan = jabatan);
                  Navigator.pop(context);
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  void _showDivisiSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
              'Pilih Divisi',
              style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: _divisiOptions.length,
                itemBuilder: (context, index) {
                  final divisi = _divisiOptions[index];
                  return ListTile(
                    leading: Icon(
                      Icons.business_center_rounded,
                      color: AppColors.primary,
                    ),
                    title: Text(divisi),
                    onTap: () {
                      setState(() => _selectedDivisi = divisi);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: keyboardType,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
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

  Widget _buildDropdownField({
    required String label,
    required String hint,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Icon(icon, color: const Color(0xFF94A3B8), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    hint,
                    style: AppTextStyles.labelSm.copyWith(
                      color: hint.startsWith('Pilih')
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF1E293B),
                    ),
                  ),
                ),
                const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8), size: 20),
              ],
            ),
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
