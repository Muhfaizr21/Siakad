import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/scholarship.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:bkuhub_mobile/features/mahasiswa/scholarship/presentation/pages/apply_scholarship_screen.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/bku_shimmer.dart';

String _formatDeadline(String rawDeadline) {
  try {
    final parsed = DateTime.tryParse(rawDeadline);
    if (parsed == null) return rawDeadline;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return '${parsed.day} ${months[parsed.month - 1]} ${parsed.year}';
  } catch (_) {
    return rawDeadline;
  }
}

class ScholarshipScreen extends StatefulWidget {
  const ScholarshipScreen({super.key});

  @override
  State<ScholarshipScreen> createState() => _ScholarshipScreenState();
}

class _ScholarshipScreenState extends State<ScholarshipScreen> {
  String _selectedCategory = 'Semua';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<StudentProvider>().loadAllData();
      if (mounted) {
        setState(() => _isLoading = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>();
    final appliedScholarships = student.scholarships.where((s) => s.status == 'Applied').toList();
    final availableScholarships = student.scholarships.where((s) => 
      (_selectedCategory == 'Semua' || s.category == _selectedCategory) && s.status == 'Open'
    ).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          BkuAppBar(
            title: 'BEASISWA & BANTUAN',
            subtitle: 'PROGRAM KAMPUS',
            variant: AppBarVariant.student,
            expandedHeight: 160,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  FadeInAnimation(
                    delay: 0.2, 
                    child: _QuickStatsRow(
                      appliedCount: appliedScholarships.length,
                      openCount: availableScholarships.length,
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  if (_isLoading) ...[
                    FadeInAnimation(
                      delay: 0.4,
                      child: _buildSectionHeader('Memuat Data...', Icons.sync_rounded),
                    ),
                    const SizedBox(height: 12),
                    const BkuShimmerList(itemCount: 3, itemHeight: 120),
                  ] else ...[
                    if (appliedScholarships.isNotEmpty) ...[
                      FadeInAnimation(
                        delay: 0.4,
                        child: _buildSectionHeader('Pendaftaran Aktif', Icons.pending_actions_rounded),
                      ),
                      const SizedBox(height: 12),
                      ...List.generate(appliedScholarships.length, (index) => 
                        FadeInAnimation(
                          delay: 0.5 + (index * 0.1),
                          child: _buildAppliedCard(appliedScholarships[index]),
                        )
                      ),
                      const SizedBox(height: 32),
                    ],

                    FadeInAnimation(
                      delay: 0.6,
                      child: _buildSectionHeader('Katalog Beasiswa', Icons.grid_view_rounded),
                    ),
                    const SizedBox(height: 16),
                    FadeInAnimation(delay: 0.7, child: _buildCategoryFilter()),
                    const SizedBox(height: 16),
                    
                    if (availableScholarships.isEmpty)
                      FadeInAnimation(delay: 0.8, child: _buildEmptyState())
                    else
                      ...List.generate(availableScholarships.length, (index) => 
                        FadeInAnimation(
                          delay: 0.8 + (index * 0.1),
                          child: _buildScholarshipCard(availableScholarships[index]),
                        )
                      ),
                  ],
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: AppColors.primary.withAlpha(15), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, size: 18, color: AppColors.primary),
        ),
        const SizedBox(width: 12),
        Text(title, style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
      ],
    );
  }

  Widget _buildCategoryFilter() {
    final categories = ['Semua', 'Internal', 'Alumni', 'Eksternal'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.map((category) {
          bool isSelected = _selectedCategory == category;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(category),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) setState(() => _selectedCategory = category);
              },
              selectedColor: AppColors.primary,
              labelStyle: AppTextStyles.labelSm.copyWith(
                color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: isSelected ? Colors.transparent : AppColors.surfaceVariant),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              elevation: isSelected ? 4 : 0,
              pressElevation: 0,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAppliedCard(Scholarship scholarship) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(20)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(4), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: InkWell(
        onTap: () => _showScholarshipDetail(context, scholarship),
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.primary.withAlpha(15), borderRadius: BorderRadius.circular(10)),
                    child: Text(scholarship.category, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 9)),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: Colors.green.withAlpha(15), borderRadius: BorderRadius.circular(10)),
                    child: Text('TERDAFTAR', style: AppTextStyles.labelSm.copyWith(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 9)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(scholarship.title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 15)),
              Text(scholarship.provider, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
              const SizedBox(height: 24),
              _buildTimeline(scholarship.applicationStatus ?? 'Review Berkas'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeline(String currentStatus) {
    final stages = ['Berkas', 'Wawancara', 'Evaluasi', 'Hasil'];
    int currentIndex = _getStageIndex(currentStatus);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(stages.length, (index) {
        bool isDone = index <= currentIndex;
        bool isCurrent = index == currentIndex;
        bool isLast = index == stages.length - 1;

        return Expanded(
          child: Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDone ? Colors.green : AppColors.surfaceVariant,
                      border: isCurrent ? Border.all(color: Colors.green.withAlpha(50), width: 5) : null,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(stages[index], style: AppTextStyles.labelSm.copyWith(fontSize: 9, fontWeight: isDone ? FontWeight.bold : FontWeight.normal, color: isDone ? Colors.green : AppColors.outline)),
                ],
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    height: 2,
                    margin: const EdgeInsets.only(bottom: 22),
                    color: isDone ? Colors.green : AppColors.surfaceVariant,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  int _getStageIndex(String status) {
    if (status.contains('Berkas')) return 0;
    if (status.contains('Wawancara')) return 1;
    if (status.contains('Evaluasi')) return 2;
    if (status.contains('Hasil') || status.contains('Lulus')) return 3;
    return 0;
  }

  Widget _buildScholarshipCard(Scholarship scholarship) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.surfaceVariant, width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showScholarshipDetail(context, scholarship),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getCategoryColor(scholarship.category).withAlpha(15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(Icons.school_rounded, color: _getCategoryColor(scholarship.category), size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            scholarship.category.toUpperCase(),
                            style: AppTextStyles.labelSm.copyWith(color: _getCategoryColor(scholarship.category), fontWeight: FontWeight.w900, fontSize: 9, letterSpacing: 0.8),
                          ),
                          Text(scholarship.coverAmount, style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(scholarship.title, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, fontSize: 14)),
                      Text(scholarship.provider, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline)),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.timer_outlined, size: 14, color: AppColors.error),
                              const SizedBox(width: 4),
                              Text(_formatDeadline(scholarship.deadline), style: AppTextStyles.labelSm.copyWith(color: AppColors.error, fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          SizedBox(
                            height: 36,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context, 
                                  MaterialPageRoute(
                                    builder: (context) => ApplyScholarshipScreen(scholarship: scholarship),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                              ),
                              child: const Text('Daftar', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Internal': return AppColors.primary;
      case 'Alumni': return const Color(0xFF6366F1);
      case 'Eksternal': return const Color(0xFF10B981);
      default: return AppColors.primary;
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: AppColors.outline.withAlpha(50)),
            const SizedBox(height: 16),
            Text('Beasiswa tidak ditemukan', style: AppTextStyles.labelMd.copyWith(color: AppColors.outline)),
          ],
        ),
      ),
    );
  }

  void _showScholarshipDetail(BuildContext context, Scholarship scholarship) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(2))),
            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(color: _getCategoryColor(scholarship.category).withAlpha(15), borderRadius: BorderRadius.circular(12)),
                                child: Text(scholarship.category.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: _getCategoryColor(scholarship.category), fontWeight: FontWeight.w900)),
                              ),
                              Text(scholarship.coverAmount, style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontSize: 18, fontWeight: FontWeight.w900)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(scholarship.title, style: AppTextStyles.display.copyWith(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.primary)),
                          const SizedBox(height: 8),
                          Text(scholarship.provider, style: AppTextStyles.titleLg.copyWith(color: AppColors.outline, fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 32),
                          _buildDetailInfoTile(Icons.calendar_month_rounded, 'Batas Pendaftaran', _formatDeadline(scholarship.deadline), color: AppColors.error),
                          const SizedBox(height: 32),
                          const Divider(),
                          const SizedBox(height: 32),
                          Text('Deskripsi Program', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 16),
                          Text(
                            scholarship.description,
                            style: AppTextStyles.bodyMd.copyWith(color: AppColors.outline, height: 1.6),
                          ),
                          const SizedBox(height: 32),
                          Text('Persyaratan Umum', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 16),
                          _buildRequirementItem('Mahasiswa Aktif Universitas Bhakti Kencana'),
                          _buildRequirementItem('IPK Minimal 3.00 (Skala 4.00)'),
                          _buildRequirementItem('Tidak sedang menerima beasiswa lain'),
                          _buildRequirementItem('Berkelakuan baik & aktif berorganisasi'),
                          const SizedBox(height: 32),
                          Text('Cakupan Beasiswa', style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(color: AppColors.primary.withAlpha(5), borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.primary.withAlpha(10))),
                            child: Row(
                              children: [
                                const Icon(Icons.stars_rounded, color: Colors.amber, size: 24),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(scholarship.coverAmount, style: AppTextStyles.labelMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  if (scholarship.status == 'Applied') ...[
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => ApplyScholarshipScreen(scholarship: scholarship)),
                          );
                        },
                        icon: const Icon(Icons.edit_note_rounded),
                        label: const Text('Ubah Data Pendaftaran', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: TextButton.icon(
                        onPressed: () => _showCancelConfirmation(context, scholarship),
                        icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                        label: const Text('Batalkan Pendaftaran', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.error, width: 1.5)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Tutup', style: TextStyle(color: AppColors.outline, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ] else ...[
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 56,
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(context),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                side: const BorderSide(color: AppColors.surfaceVariant, width: 2),
                              ),
                              child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 2,
                          child: SizedBox(
                            height: 56,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => ApplyScholarshipScreen(scholarship: scholarship)),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: const Text('Daftar Sekarang', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCancelConfirmation(BuildContext context, Scholarship scholarship) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Batalkan Pendaftaran?', style: TextStyle(fontWeight: FontWeight.w900)),
        content: const Text('Semua data pendaftaran yang telah kamu isi akan dihapus permanen.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Kembali', style: TextStyle(color: AppColors.outline, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<StudentProvider>().cancelScholarshipApplication(scholarship.id);
              Navigator.pop(dialogContext); // Close dialog
              Navigator.pop(context); // Close modal
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Pendaftaran berhasil dibatalkan'), behavior: SnackBarBehavior.floating),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('Ya, Batalkan', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailInfoTile(IconData icon, String label, String value, {Color? color}) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: (color ?? AppColors.primary).withAlpha(10), borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: color ?? AppColors.primary, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontWeight: FontWeight.bold)),
            Text(value, style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      ],
    );
  }

  Widget _buildRequirementItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline_rounded, color: Colors.green, size: 18),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: AppTextStyles.labelMd.copyWith(color: AppColors.outline))),
        ],
      ),
    );
  }
}

class _QuickStatsRow extends StatelessWidget {
  final int appliedCount;
  final int openCount;

  const _QuickStatsRow({
    required this.appliedCount,
    required this.openCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(20)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStat(appliedCount.toString(), 'Pendaftaran Aktif'),
          Container(width: 1, height: 30, color: AppColors.primary.withAlpha(30)),
          _buildStat(openCount.toString(), 'Peluang Terbuka'),
        ],
      ),
    );
  }

  Widget _buildStat(String value, String label) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.titleLg.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 24)),
        Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.outline, fontSize: 10)),
      ],
    );
  }
}
