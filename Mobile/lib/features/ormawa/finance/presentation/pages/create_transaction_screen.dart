import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';

class CreateTransactionScreen extends StatefulWidget {
  const CreateTransactionScreen({super.key});

  @override
  State<CreateTransactionScreen> createState() => _CreateTransactionScreenState();
}

class _CreateTransactionScreenState extends State<CreateTransactionScreen> {
  String _transactionType = 'Pemasukan';

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
          'Catat Transaksi Baru',
          style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Jenis Transaksi'),
            const SizedBox(height: 16),
            _buildTypeSelector(),
            const SizedBox(height: 24),
            
            _buildSectionTitle('Detail Transaksi'),
            const SizedBox(height: 16),
            _buildTextField('Keterangan', 'Contoh: Iuran anggota bulan Mei', Icons.edit_note_rounded),
            const SizedBox(height: 16),
            _buildTextField('Jumlah Nominal', 'Rp 0', Icons.payments_rounded, keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            _buildTextField('Tanggal Transaksi', '07 Mei 2026', Icons.calendar_today_rounded, isReadOnly: true),
            const SizedBox(height: 16),
            _buildTextField('Kategori Kas', 'Kas Umum', Icons.account_balance_wallet_rounded, isReadOnly: true),
            
            const SizedBox(height: 40),
            _buildSubmitButton(),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelMd.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildTypeSelector() {
    return Row(
      children: [
        _buildTypeOption('Pemasukan', Colors.green, Icons.arrow_downward_rounded),
        const SizedBox(width: 12),
        _buildTypeOption('Pengeluaran', Colors.red, Icons.arrow_upward_rounded),
      ],
    );
  }

  Widget _buildTypeOption(String type, Color color, IconData icon) {
    final isSelected = _transactionType == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _transactionType = type),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? color.withAlpha(20) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? color : const Color(0xFFE2E8F0),
              width: 2,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? color : const Color(0xFF94A3B8), size: 24),
              const SizedBox(height: 8),
              Text(
                type,
                style: AppTextStyles.labelSm.copyWith(
                  color: isSelected ? color : const Color(0xFF64748B),
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, String hint, IconData icon, {bool isReadOnly = false, int maxLines = 1, TextInputType keyboardType = TextInputType.text}) {
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
            readOnly: isReadOnly,
            maxLines: maxLines,
            keyboardType: keyboardType,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.outline.withAlpha(100)),
              prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 4,
          shadowColor: AppColors.primary.withAlpha(100),
        ),
        child: Text(
          'SIMPAN TRANSAKSI',
          style: AppTextStyles.labelMd.copyWith(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
    );
  }
}
