import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class ManageStrukturScreen extends StatefulWidget {
  const ManageStrukturScreen({super.key});

  @override
  State<ManageStrukturScreen> createState() => _ManageStrukturScreenState();
}

class _ManageStrukturScreenState extends State<ManageStrukturScreen> {
  @override
  Widget build(BuildContext context) {
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('INFORMASI KABINET', Icons.info_outline_rounded),
            const SizedBox(height: 16),
            _buildTextField('Nama Kabinet', 'Contoh: Kabinet Digital Era', Icons.badge_rounded),
            const SizedBox(height: 16),
            _buildTextField('Periode', 'Contoh: 2026/2027', Icons.calendar_month_rounded),
            
            const SizedBox(height: 40),
            _buildSectionHeader('PIMPINAN INTI', Icons.stars_rounded),
            const SizedBox(height: 16),
            _buildEditableMemberCard('Ketua Umum', 'Ahmad Fauzi', 'Pilih dari Anggota'),
            const SizedBox(height: 12),
            _buildEditableMemberCard('Wakil Ketua Umum', 'Siti Nurhaliza', 'Pilih dari Anggota'),
            
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSectionHeader('DEPARTEMEN', Icons.account_tree_rounded),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                  label: const Text('Tambah Dept', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildDeptEditCard('Departemen Pengembangan SDM'),
            const SizedBox(height: 12),
            _buildDeptEditCard('Departemen Minat & Bakat'),
            
            const SizedBox(height: 50),
            _buildSaveButton(),
            const SizedBox(height: 20),
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

  Widget _buildTextField(String label, String hint, IconData icon) {
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
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: TextField(
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: hint,
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

  Widget _buildEditableMemberCard(String role, String currentName, String action) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: AppColors.primary.withAlpha(20), shape: BoxShape.circle),
            child: const Icon(Icons.person_rounded, color: AppColors.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(role, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10, fontWeight: FontWeight.bold)),
                Text(currentName, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900)),
              ],
            ),
          ),
          TextButton(
            onPressed: () {},
            child: Text('UBAH', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildDeptEditCard(String deptName) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(deptName, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.primary)),
              ),
              Row(
                children: [
                  IconButton(onPressed: () {}, icon: const Icon(Icons.edit_outlined, size: 20, color: Colors.orange)),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.red)),
                ],
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('3 Anggota Terdaftar', style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
              TextButton(
                onPressed: () {},
                child: const Text('Kelola Anggota', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return Container(
      width: double.infinity,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(60),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () => Navigator.pop(context),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          elevation: 0,
        ),
        child: Text(
          'SIMPAN PERUBAHAN',
          style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
    );
  }
}
