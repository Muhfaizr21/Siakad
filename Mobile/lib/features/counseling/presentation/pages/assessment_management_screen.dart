import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class AssessmentManagementScreen extends StatefulWidget {
  const AssessmentManagementScreen({super.key});

  @override
  State<AssessmentManagementScreen> createState() =>
      _AssessmentManagementScreenState();
}

class _AssessmentManagementScreenState
    extends State<AssessmentManagementScreen> {
  String _selectedCategory = 'Semua';
  final List<String> _categories = [
    'Semua',
    'Kesehatan Mental',
    'Kepribadian',
    'Minat Bakat',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadAssessments();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final data = provider.assessments;
        final submissions = data['submissions'] as List? ?? [];
        final categories = data['categories'] as List? ?? [];
        final mentalScore = data['mental_score'] as int? ?? 0;

        final filtered =
            _selectedCategory == 'Semua'
                ? submissions
                : submissions
                    .where((s) => (s as Map)['category'] == _selectedCategory)
                    .toList();

        // Stats: total & urgent
        final urgent =
            submissions.where((s) {
              final score = (s as Map)['score']?.toString() ?? '';
              return score == 'Tinggi' ||
                  score == 'Berat' ||
                  score == 'Mendesak';
            }).length;

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _showCreateAssessmentDialog(provider),
            backgroundColor: AppColors.primary,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: const Text(
              'Buat Asesmen',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          body: CustomScrollView(
            slivers: [
              const BkuAppBar(
                title: 'Manajemen Asesmen',
                info: 'Hasil tes psikologi & screening mahasiswa',
                isExpandable: false,
                variant: AppBarVariant.psychologist,
                showBackButton: true,
              ),
              SliverToBoxAdapter(
                child:
                    provider.assessmentsLoading
                        ? const Padding(
                          padding: EdgeInsets.symmetric(vertical: 80),
                          child: Center(child: CircularProgressIndicator()),
                        )
                        : Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildStatsRow(
                                submissions.length,
                                urgent,
                                mentalScore,
                              ),
                              const SizedBox(height: 32),
                              _buildSectionHeader('Kategori Asesmen'),
                              const SizedBox(height: 12),
                              _buildCategoryCards(categories),
                              const SizedBox(height: 32),
                              _buildSectionHeader('Filter'),
                              const SizedBox(height: 12),
                              _buildCategoryFilter(),
                              const SizedBox(height: 24),
                              _buildSectionHeader('Hasil Asesmen'),
                              const SizedBox(height: 16),
                              filtered.isEmpty
                                  ? _buildEmpty()
                                  : Column(
                                    children:
                                        filtered
                                            .map(
                                              (a) => _buildAssessmentCard(
                                                a as Map<String, dynamic>,
                                              ),
                                            )
                                            .toList(),
                                  ),
                              const SizedBox(height: 100),
                            ],
                          ),
                        ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatsRow(int total, int urgent, int mentalScore) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Total Asesmen',
            '$total',
            Icons.assignment_rounded,
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Butuh Atensi',
            '$urgent',
            Icons.warning_amber_rounded,
            Colors.red,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Skor Mental',
            '$mentalScore%',
            Icons.psychology_rounded,
            Colors.green,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleMd.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
            ),
          ),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF64748B),
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCards(List categories) {
    if (categories.isEmpty) return const SizedBox.shrink();
    final colors = [
      AppColors.primary,
      Colors.purple,
      Colors.teal,
      Colors.orange,
    ];
    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, i) {
          final cat = categories[i] as Map<String, dynamic>;
          final color = colors[i % colors.length];
          return Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: color.withAlpha(10),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withAlpha(30)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${cat['count'] ?? 0}',
                  style: AppTextStyles.titleMd.copyWith(
                    fontWeight: FontWeight.w900,
                    color: color,
                  ),
                ),
                Text(
                  cat['name']?.toString() ?? '',
                  style: AppTextStyles.labelSm.copyWith(
                    color: color,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final cat = _categories[index];
          final isSelected = _selectedCategory == cat;
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = cat),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color:
                      isSelected
                          ? AppColors.primary
                          : Colors.grey.withAlpha(30),
                ),
              ),
              child: Center(
                child: Text(
                  cat,
                  style: AppTextStyles.labelSm.copyWith(
                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmpty() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.assignment_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Belum ada asesmen',
              style: AppTextStyles.bodyMd.copyWith(
                color: const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssessmentCard(Map<String, dynamic> a) {
    final score = a['score']?.toString() ?? '-';
    final status = a['status']?.toString() ?? '-';
    final name = a['name']?.toString() ?? '-';
    final assessment = a['assessment']?.toString() ?? '-';
    final category = a['category']?.toString() ?? '-';
    final date = a['date']?.toString() ?? '-';

    Color scoreColor = Colors.green;
    if (score == 'Sedang' || score == 'Netral') scoreColor = Colors.orange;
    if (score == 'Tinggi' || score == 'Berat' || score == 'Mendesak') {
      scoreColor = Colors.red;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primary.withAlpha(10),
                child: const Icon(
                  Icons.person_outline_rounded,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      '$assessment • $date',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: scoreColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  score,
                  style: TextStyle(
                    color: scoreColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInfoChip(Icons.category_rounded, category),
              _buildInfoChip(Icons.info_outline_rounded, status),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: Colors.grey[500]),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        fontWeight: FontWeight.w900,
        color: const Color(0xFF0F172A),
      ),
    );
  }

  void _showCreateAssessmentDialog(CounselingProvider provider) {
    final nameCtrl = TextEditingController();
    String selectedCategory = 'Kesehatan Mental';
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder:
          (ctx) => StatefulBuilder(
            builder:
                (ctx, setDialogState) => AlertDialog(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  title: const Text(
                    'Buat Asesmen Baru',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: nameCtrl,
                        decoration: InputDecoration(
                          labelText: 'Nama Asesmen',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: selectedCategory,
                        decoration: InputDecoration(
                          labelText: 'Kategori',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        items:
                            [
                                  'Kesehatan Mental',
                                  'Kepribadian',
                                  'Minat Bakat',
                                  'Lainnya',
                                ]
                                .map(
                                  (e) => DropdownMenuItem(
                                    value: e,
                                    child: Text(e),
                                  ),
                                )
                                .toList(),
                        onChanged:
                            (v) => setDialogState(() => selectedCategory = v!),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: descCtrl,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Deskripsi',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Batal'),
                    ),
                    ElevatedButton(
                      onPressed: () async {
                        if (nameCtrl.text.trim().isEmpty) return;
                        Navigator.pop(ctx);
                        final success = await provider.createAssessment({
                          'nama': nameCtrl.text.trim(),
                          'kategori': selectedCategory,
                          'deskripsi': descCtrl.text.trim(),
                        });
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                success
                                    ? 'Asesmen berhasil dibuat!'
                                    : 'Gagal membuat asesmen.',
                              ),
                              backgroundColor:
                                  success ? AppColors.primary : Colors.red,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Simpan'),
                    ),
                  ],
                ),
          ),
    );
  }
}
