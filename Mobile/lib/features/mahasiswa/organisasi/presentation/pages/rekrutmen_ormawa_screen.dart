import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/daftar_ormawa_screen.dart';

class RekrutmenOrmawaScreen extends StatefulWidget {
  const RekrutmenOrmawaScreen({super.key});

  @override
  State<RekrutmenOrmawaScreen> createState() => _RekrutmenOrmawaScreenState();
}

class _RekrutmenOrmawaScreenState extends State<RekrutmenOrmawaScreen> {
  List<Map<String, dynamic>> _ormawaList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final list = await context.read<StudentProvider>().getOrmawaList();
      if (mounted) {
        setState(() {
          _ormawaList = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Rekrutmen Ormawa', style: AppTextStyles.h3.copyWith(color: AppColors.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _ormawaList.isEmpty
              ? Center(
                  child: Text('Tidak ada pendaftaran ormawa saat ini.', style: AppTextStyles.labelMd.copyWith(color: AppColors.textTertiary)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: _ormawaList.length,
                  itemBuilder: (context, index) {
                    final ormawa = _ormawaList[index];
                    return _buildOrmawaCard(ormawa);
                  },
                ),
    );
  }

  Widget _buildOrmawaCard(Map<String, dynamic> ormawa) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.diversity_3_rounded, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(ormawa['nama'] ?? 'Unknown', style: AppTextStyles.titleLg.copyWith(fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(ormawa['kategori'] ?? 'Kategori', style: AppTextStyles.labelSm.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              ormawa['deskripsi'] ?? 'Tidak ada deskripsi',
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.textSecondary),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DaftarOrmawaScreen(
                        ormawaId: ormawa['id'].toString(),
                        namaOrmawa: ormawa['nama'] ?? 'Ormawa',
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary.withAlpha(10),
                  foregroundColor: AppColors.primary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Daftar Sekarang', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
