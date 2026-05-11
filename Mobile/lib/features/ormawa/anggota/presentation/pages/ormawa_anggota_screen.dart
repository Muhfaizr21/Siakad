import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/data/repositories/ormawa_repository_impl.dart';

class OrmawaAnggotaScreen extends StatefulWidget {
  const OrmawaAnggotaScreen({super.key});

  @override
  State<OrmawaAnggotaScreen> createState() => _OrmawaAnggotaScreenState();
}

class _OrmawaAnggotaScreenState extends State<OrmawaAnggotaScreen> {
  String _searchQuery = '';
  String _selectedFilterRole = 'SEMUA';
  String _selectedFilterDivisi = 'SEMUA';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().refreshData();
    });
  }

  List<OrmawaMember> _getFilteredMembers(List<OrmawaMember> members) {
    return members.where((m) {
      final matchesSearch = m.name.toLowerCase().contains(_searchQuery) || m.nim.toLowerCase().contains(_searchQuery);
      final matchesRole = _selectedFilterRole == 'SEMUA' || m.role.toUpperCase() == _selectedFilterRole;
      final matchesDivisi = _selectedFilterFilterDivisi == 'SEMUA' || m.division.toUpperCase() == _selectedFilterFilterDivisi;
      return matchesSearch && matchesRole && matchesDivisi;
    }).toList();
  }

  String get _selectedFilterFilterDivisi => _selectedFilterDivisi;

  void _showFilterSheet(List<OrmawaMember> members) {
    final roles = ['SEMUA', ...members.map((m) => m.role.toUpperCase()).toSet()];
    final divisions = ['SEMUA', ...members.map((m) => m.division.toUpperCase()).toSet()];

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('FILTER ANGGOTA', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 20),
              Text('JABATAN', style: AppTextStyles.labelSm.copyWith(color: Colors.grey, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: roles.map((r) => ChoiceChip(
                  label: Text(r),
                  selected: _selectedFilterRole == r,
                  onSelected: (selected) {
                    setModalState(() => _selectedFilterRole = r);
                    setState(() {});
                  },
                )).toList(),
              ),
              const SizedBox(height: 20),
              Text('DIVISI', style: AppTextStyles.labelSm.copyWith(color: Colors.grey, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: divisions.map((d) => ChoiceChip(
                  label: Text(d),
                  selected: _selectedFilterDivisi == d,
                  onSelected: (selected) {
                    setModalState(() => _selectedFilterDivisi = d);
                    setState(() {});
                  },
                )).toList(),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.all(16)),
                  child: const Text('TERAPKAN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final filteredMembers = _getFilteredMembers(provider.members);

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
              if (provider.isLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSummaryGrid(provider),
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
                              onPressed: () => _showFilterSheet(provider.members),
                              icon: const Icon(Icons.filter_list_rounded, size: 18),
                              label: const Text('Filter'),
                              style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildSearchField(),
                        const SizedBox(height: 20),
                        if (filteredMembers.isEmpty)
                          _buildEmptyState()
                        else
                          ListView.separated(
                            shrinkWrap: true,
                            padding: EdgeInsets.zero,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: filteredMembers.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final member = filteredMembers[index];
                              return _buildMemberCard(context, member);
                            },
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
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.person_search_rounded, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Anggota tidak ditemukan', style: AppTextStyles.bodyMd.copyWith(color: Colors.grey[500])),
            if (_searchQuery.isNotEmpty || _selectedFilterRole != 'SEMUA')
              TextButton(
                onPressed: () => setState(() {
                  _searchQuery = '';
                  _selectedFilterRole = 'SEMUA';
                  _selectedFilterDivisi = 'SEMUA';
                }),
                child: const Text('Reset Filter'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryGrid(OrmawaProvider provider) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _buildStatCard('Total Anggota', provider.members.length.toString(), Icons.groups_rounded, Colors.blue),
        _buildStatCard('Aktif', provider.members.where((m) => m.status.toLowerCase() == 'aktif').length.toString(), Icons.check_circle_rounded, Colors.green),
        _buildStatCard('Pengurus', provider.members.where((m) => m.role != 'ANGGOTA').length.toString(), Icons.badge_rounded, Colors.indigo),
        _buildStatCard('Divisi', provider.members.map((m) => m.division).toSet().length.toString(), Icons.account_tree_rounded, Colors.purple),
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
              onChanged: (val) => setState(() => _searchQuery = val.toLowerCase()),
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

  Widget _buildMemberCard(BuildContext context, OrmawaMember member) {
    Color posColor = _getPositionColor(member.role);
    
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrmawaAnggotaDetailScreen(member: member),
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
              backgroundColor: posColor.withAlpha(20),
              child: Text(member.initial, style: TextStyle(color: posColor, fontWeight: FontWeight.bold)),
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
                      PopupMenuButton(
                        icon: const Icon(Icons.more_vert_rounded, size: 18, color: Color(0xFF94A3B8)),
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(children: [Icon(Icons.edit_rounded, size: 18), SizedBox(width: 8), Text('Edit Anggota')]),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(children: [Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red), SizedBox(width: 8), Text('Hapus Anggota', style: TextStyle(color: Colors.red))]),
                          ),
                        ],
                        onSelected: (val) {
                          if (val == 'edit') {
                            _showEditMember(context, member);
                          } else if (val == 'delete') {
                            _confirmDelete(context, member);
                          }
                        },
                      ),
                    ],
                  ),
                  Text(member.nim, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 11)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: posColor.withAlpha(10), borderRadius: BorderRadius.circular(6)),
                        child: Text(member.role, style: AppTextStyles.labelSm.copyWith(color: posColor, fontWeight: FontWeight.w900, fontSize: 8)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                        child: Text(member.division, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 8)),
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

  void _confirmDelete(BuildContext context, OrmawaMember member) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Anggota'),
        content: Text('Apakah Anda yakin ingin menghapus ${member.name} dari keanggotaan?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          TextButton(
            onPressed: () {
              context.read<OrmawaProvider>().deleteMember(member.id);
              Navigator.pop(context);
            },
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Color _getPositionColor(String role) {
    switch (role.toUpperCase()) {
      case 'KETUA':
        return Colors.indigo;
      case 'SEKRETARIS':
        return Colors.purple;
      case 'BENDAHARA':
        return Colors.green;
      case 'WAKIL KETUA':
        return Colors.blue;
      default:
        return Colors.blueGrey;
    }
  }

  void _showAddMember(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OrmawaFormAnggotaScreen()),
    );
  }

  void _showEditMember(BuildContext context, OrmawaMember member) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OrmawaFormAnggotaScreen(initialMember: member),
      ),
    );
  }
}

class OrmawaFormAnggotaScreen extends StatefulWidget {
  final OrmawaMember? initialMember;
  const OrmawaFormAnggotaScreen({super.key, this.initialMember});

  @override
  State<OrmawaFormAnggotaScreen> createState() => _OrmawaFormAnggotaScreenState();
}

class _OrmawaFormAnggotaScreenState extends State<OrmawaFormAnggotaScreen> {
  final _divisionController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  
  Map<String, dynamic>? _selectedStudent;
  List<Map<String, dynamic>> _students = [];
  bool _isLoadingStudents = false;
  String _selectedRole = 'ANGGOTA';
  String _selectedStatus = 'Aktif';

  final List<String> _roles = ['KETUA', 'WAKIL KETUA', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA', 'KADIV'];
  final List<String> _statuses = ['Aktif', 'Non-Aktif', 'Alumni', 'Cuti'];

  @override
  void initState() {
    super.initState();
    if (widget.initialMember != null) {
      _divisionController.text = widget.initialMember!.division;
      _selectedRole = widget.initialMember!.role.toUpperCase();
      _selectedStatus = widget.initialMember!.status;
      _emailController.text = widget.initialMember!.email ?? '';
      _phoneController.text = widget.initialMember!.phone ?? '';
    } else {
      _fetchStudents();
    }
  }

  Future<void> _fetchStudents() async {
    setState(() => _isLoadingStudents = true);
    try {
      final repo = OrmawaRepositoryImpl();
      final students = await repo.getStudents();
      setState(() => _students = students);
    } catch (e) {
      debugPrint('Error fetching students: $e');
    } finally {
      setState(() => _isLoadingStudents = false);
    }
  }

  void _submit() async {
    if (widget.initialMember == null && _selectedStudent == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih mahasiswa terlebih dahulu')));
      return;
    }

    final rawId = widget.initialMember != null ? widget.initialMember!.mahasiswaId : _selectedStudent!['id'];
    final mahasiswaId = int.tryParse(rawId.toString());

    final data = {
      'MahasiswaID': mahasiswaId,
      'Role': _selectedRole,
      'Divisi': _divisionController.text,
      'Status': _selectedStatus,
    };

    try {
      if (widget.initialMember != null) {
        await context.read<OrmawaProvider>().updateMember(widget.initialMember!.id, data);
      } else {
        await context.read<OrmawaProvider>().addMember(data);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.initialMember != null;
    
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          BkuAppBar(
            title: isEdit ? 'EDIT DATA ANGGOTA' : 'TAMBAH ANGGOTA BARU',
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
                  _buildSectionHeader(isEdit),
                  const SizedBox(height: 32),
                  _buildStudentSelector(isEdit),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildRoleDropdown()),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInputField('Divisi', 'Humas, IT, dll', Icons.account_tree_rounded, controller: _divisionController)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildStatusDropdown(),
                  const SizedBox(height: 16),
                  _buildInputField('Email Kampus (Opsional)', 'Email untuk sinkronisasi', Icons.email_rounded, controller: _emailController),
                  const SizedBox(height: 16),
                  _buildInputField('Nomor HP (Opsional)', 'Nomor aktif WA', Icons.phone_android_rounded, controller: _phoneController),
                  const SizedBox(height: 40),
                  _buildSubmitButton(isEdit),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(bool isEdit) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(isEdit ? 'Pembaruan Data' : 'Registrasi Anggota', style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Text(isEdit ? 'Update informasi fungsionaris ormawa.' : 'Daftarkan mahasiswa sebagai anggota aktif ormawa.', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
      ],
    );
  }

  Widget _buildStudentSelector(bool isEdit) {
    if (isEdit) {
      return _buildInputField('Mahasiswa', widget.initialMember!.name, Icons.person_rounded, controller: TextEditingController(text: widget.initialMember!.name), enabled: false);
    }
    return _buildStudentDropdown();
  }

  Widget _buildSubmitButton(bool isEdit) {
    final isLoading = context.watch<OrmawaProvider>().isLoading;
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isLoading ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 8,
          shadowColor: AppColors.primary.withAlpha(50),
        ),
        child: isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(isEdit ? 'Perbarui Data' : 'Simpan Anggota', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
      ),
    );
  }

  Widget _buildStudentDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Pilih Mahasiswa', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<Map<String, dynamic>>(
              isExpanded: true,
              hint: Text(_isLoadingStudents ? 'Memuat mahasiswa...' : 'Cari mahasiswa...', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8))),
              value: _selectedStudent,
              icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8)),
              items: _students.map((student) {
                return DropdownMenuItem<Map<String, dynamic>>(
                  value: student,
                  child: Text('${student['nama']} (${student['nim']})', style: AppTextStyles.bodyMd),
                );
              }).toList(),
              onChanged: (val) {
                setState(() => _selectedStudent = val);
                if (val != null) {
                  _emailController.text = val['email_kampus'] ?? '';
                  _phoneController.text = val['no_hp'] ?? '';
                }
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRoleDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Jabatan', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedRole,
              icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8)),
              items: _roles.map((role) {
                return DropdownMenuItem<String>(
                  value: role,
                  child: Text(role, style: AppTextStyles.bodyMd),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedRole = val!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Status Keanggotaan', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedStatus,
              icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF94A3B8)),
              items: _statuses.map((status) {
                return DropdownMenuItem<String>(
                  value: status,
                  child: Text(status, style: AppTextStyles.bodyMd),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedStatus = val!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInputField(String label, String hint, IconData icon, {required TextEditingController controller, int maxLines = 1, bool enabled = true}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: enabled ? const Color(0xFFF8FAFC) : Colors.grey[100],
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
                  controller: controller,
                  maxLines: maxLines,
                  enabled: enabled,
                  style: AppTextStyles.bodyMd,
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
}

class OrmawaAnggotaDetailScreen extends StatelessWidget {
  final OrmawaMember member;

  const OrmawaAnggotaDetailScreen({
    super.key,
    required this.member,
  });

  @override
  Widget build(BuildContext context) {
    final posColor = _getPositionColor(member.role);
    
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
                          backgroundColor: posColor.withAlpha(10),
                          child: Text(member.initial, style: TextStyle(color: posColor, fontSize: 32, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 16),
                        Text(member.name, style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.w900)),
                        Text(member.nim, style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: posColor.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                              child: Text(member.role, style: AppTextStyles.labelSm.copyWith(color: posColor, fontWeight: FontWeight.w900)),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                              child: Text(member.division, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
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
                        _buildDetailRow(Icons.email_outlined, 'Email', member.email ?? 'Tidak tersedia'),
                        _buildDetailRow(Icons.phone_android_outlined, 'Nomor HP', member.phone ?? 'Tidak tersedia'),
                        _buildDetailRow(Icons.calendar_today_outlined, 'Bergabung Pada', member.joinedAt?.toString().split(' ')[0] ?? '-'),
                        const SizedBox(height: 32),
                        _buildSectionTitle('STATUS KEANGGOTAAN'),
                        const SizedBox(height: 16),
                        _buildActivityItem('Status Saat Ini', member.status.toUpperCase(), member.status.toLowerCase() == 'aktif' ? Colors.green : Colors.red),
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

  Color _getPositionColor(String role) {
    switch (role.toUpperCase()) {
      case 'KETUA':
        return Colors.indigo;
      case 'SEKRETARIS':
        return Colors.purple;
      case 'BENDAHARA':
        return Colors.green;
      case 'WAKIL KETUA':
        return Colors.blue;
      default:
        return Colors.blueGrey;
    }
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
