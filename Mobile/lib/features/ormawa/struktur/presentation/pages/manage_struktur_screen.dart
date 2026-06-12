import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_division.dart';

class ManageStrukturScreen extends StatefulWidget {
  const ManageStrukturScreen({super.key});

  @override
  State<ManageStrukturScreen> createState() => _ManageStrukturScreenState();
}

class _ManageStrukturScreenState extends State<ManageStrukturScreen> {
  final _divisionNameController = TextEditingController();
  final _bphSearchController = TextEditingController();
  bool _isSearchingStudent = false;

  @override
  void dispose() {
    _divisionNameController.dispose();
    _bphSearchController.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<OrmawaProvider>();
    final members = provider.members;
    final divisions = provider.divisions;

    final bphMembers = members.where((m) {
      final r = m.role.toLowerCase();
      return r.contains('ketua') || r.contains('wakil') || r.contains('sekretaris') || r.contains('bendahara') || r.contains('pembina');
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Kelola Struktur Organisasi',
          style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('INFORMASI KABINET', Icons.info_outline_rounded),
                  const SizedBox(height: 16),
                  _buildTextField('Nama Kabinet', provider.orgName, Icons.badge_rounded, enabled: false),
                  const SizedBox(height: 16),
                  _buildTextField('Periode', provider.academicYear, Icons.calendar_month_rounded, enabled: false),
                  
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSectionHeader('PIMPINAN INTI (BPH)', Icons.stars_rounded),
                      TextButton.icon(
                        onPressed: () => _showManageBphBottomSheet(context, provider),
                        icon: const Icon(Icons.group_add_rounded, size: 18),
                        label: const Text('Kelola Pengurus BPH', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (bphMembers.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('Belum ada pengurus BPH', style: TextStyle(color: Colors.grey)),
                    )
                  else
                    ...bphMembers.map((m) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildEditableMemberCard(m.role, m.name, 'UBAH', () => _showManageBphBottomSheet(context, provider, m)),
                        )),
                  
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSectionHeader('DEPARTEMEN / DIVISI', Icons.account_tree_rounded),
                      TextButton.icon(
                        onPressed: () => _showAddDivisionDialog(context, provider),
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                        label: const Text('Tambah Dept', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (divisions.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('Belum ada divisi', style: TextStyle(color: Colors.grey)),
                    )
                  else
                    ...divisions.map((d) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildDeptEditCard(d, members.where((m) => m.division == d.name).length, provider),
                        )),
                  
                  const SizedBox(height: 50),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 18),
        const SizedBox(width: 8),
        Text(
          title,
          style: AppTextStyles.labelSm.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(String label, String hint, IconData icon, {bool enabled = true}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: enabled ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: TextField(
            enabled: enabled,
            controller: TextEditingController(text: !enabled ? hint : null),
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: enabled ? AppColors.neutral800 : AppColors.outline),
            decoration: InputDecoration(
              hintText: enabled ? hint : null,
              hintStyle: AppTextStyles.bodyMd.copyWith(color: const Color(0xFFCBD5E1)),
              prefixIcon: Icon(icon, color: AppColors.primary.withAlpha(150), size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEditableMemberCard(String role, String currentName, String action, VoidCallback onPressed) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF64748B).withAlpha(10),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primary.withAlpha(20), AppColors.primary.withAlpha(5)],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_rounded, color: AppColors.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(role, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(currentName, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF1F5F9),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: Text(action, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildDeptEditCard(OrmawaDivision dept, int memberCount, OrmawaProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF64748B).withAlpha(8),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 20, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 20,
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(dept.name, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary, letterSpacing: 0.5)),
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.red.withAlpha(15),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: Text('Hapus Divisi', style: AppTextStyles.titleMd),
                              content: const Text('Apakah Anda yakin ingin menghapus divisi ini? Anggota di dalamnya tidak akan terhapus.'),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    provider.deleteDivision(dept.id);
                                  },
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red, elevation: 0),
                                  child: const Text('Hapus', style: TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          );
                        },
                        icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.people_outline_rounded, size: 14, color: AppColors.outline),
                      const SizedBox(width: 6),
                      Text('$memberCount Anggota Terdaftar', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAddDivisionDialog(BuildContext context, OrmawaProvider provider) {
    _divisionNameController.clear();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Tambah Divisi', style: AppTextStyles.titleMd),
        content: TextField(
          controller: _divisionNameController,
          decoration: InputDecoration(
            hintText: 'Nama Divisi',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () {
              if (_divisionNameController.text.trim().isNotEmpty) {
                provider.createDivisionInline(_divisionNameController.text.trim());
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Simpan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showManageBphBottomSheet(BuildContext context, OrmawaProvider provider, [OrmawaMember? existingMember]) {
    String selectedRole = existingMember?.role ?? 'Sekretaris';
    String? selectedStudentId;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          return Container(
            height: MediaQuery.of(ctx).size.height * 0.85,
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 20),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: Colors.grey.withAlpha(50), borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(existingMember != null ? 'Ubah Jabatan BPH' : 'Kelola Pengurus BPH', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
                      if (existingMember != null)
                        IconButton(
                          onPressed: () {
                            provider.deleteMember(existingMember.id);
                            Navigator.pop(ctx);
                          },
                          icon: const Icon(Icons.delete_outline, color: Colors.red),
                        )
                    ],
                  ),
                ),
                const Divider(height: 32),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (existingMember == null) ...[
                          Text('Pilih Mahasiswa', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _bphSearchController,
                            decoration: InputDecoration(
                              hintText: 'Cari nama atau NIM...',
                              prefixIcon: const Icon(Icons.search),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onChanged: (val) {
                              setModalState(() {
                                _isSearchingStudent = true;
                              });
                            },
                          ),
                          if (_isSearchingStudent && _bphSearchController.text.isNotEmpty)
                            Container(
                              margin: const EdgeInsets.only(top: 8),
                              constraints: const BoxConstraints(maxHeight: 150),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.grey.withAlpha(50)),
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10)],
                              ),
                              child: ListView(
                                shrinkWrap: true,
                                children: provider.members
                                    .where((m) => m.name.toLowerCase().contains(_bphSearchController.text.toLowerCase()) ||
                                                  m.nim.toLowerCase().contains(_bphSearchController.text.toLowerCase()))
                                    .take(5)
                                    .map((m) => ListTile(
                                          title: Text(m.name),
                                          subtitle: Text(m.nim),
                                          onTap: () {
                                            setModalState(() {
                                              selectedStudentId = m.mahasiswaId.toString();
                                              _bphSearchController.text = m.name;
                                              _isSearchingStudent = false;
                                            });
                                          },
                                        ))
                                    .toList(),
                              ),
                            ),
                          const SizedBox(height: 24),
                        ],
                        Text('Jabatan BPH', style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          initialValue: selectedRole,
                          items: ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Pembina']
                              .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedRole = val);
                          },
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: ElevatedButton(
                    onPressed: () {
                      if (existingMember != null) {
                        provider.updateMember(existingMember.id, {'Role': selectedRole, 'Divisi': ''});
                        Navigator.pop(ctx);
                      } else {
                        if (selectedStudentId != null) {
                          provider.addMember({
                            'MahasiswaID': int.tryParse(selectedStudentId!),
                            'Role': selectedRole,
                            'Divisi': '',
                          });
                          Navigator.pop(ctx);
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('SIMPAN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    ).whenComplete(() {
      _bphSearchController.clear();
      _isSearchingStudent = false;
    });
  }
}
