import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class AssessmentManagementScreen extends StatefulWidget {
  const AssessmentManagementScreen({super.key});

  @override
  State<AssessmentManagementScreen> createState() =>
      _AssessmentManagementScreenState();
}

class _AssessmentManagementScreenState
    extends State<AssessmentManagementScreen> {
  String selectedTest = 'DASS-21';
  final List<String> testTypes = [
    'DASS-21',
    'SRQ-20',
    'Kuesioner MBTI',
    'Tes Minat Bakat',
  ];

  final List<Map<String, dynamic>> assessments = [
    {
      'name': 'Andi Wijaya',
      'nim': '20220101',
      'date': '08 Mei 2026',
      'scores': {'Depresi': 'Normal', 'Kecemasan': 'Sedang', 'Stres': 'Ringan'},
      'status': 'Selesai',
      'color': Colors.orange,
    },
    {
      'name': 'Siti Aminah',
      'nim': '20220512',
      'date': '07 Mei 2026',
      'scores': {
        'Depresi': 'Berat',
        'Kecemasan': 'Sangat Berat',
        'Stres': 'Berat',
      },
      'status': 'Perlu Tindakan',
      'color': Colors.red,
    },
    {
      'name': 'Budi Santoso',
      'nim': '20220988',
      'date': '05 Mei 2026',
      'scores': {'Depresi': 'Normal', 'Kecemasan': 'Normal', 'Stres': 'Normal'},
      'status': 'Normal',
      'color': Colors.green,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
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
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatsRow(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Filter Jenis Tes'),
                  const SizedBox(height: 12),
                  _buildTestFilter(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Hasil Asesmen Terbaru'),
                  const SizedBox(height: 16),
                  ...assessments.map((a) => _buildAssessmentCard(a)),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Total Tes',
            '124',
            Icons.assignment_rounded,
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Butuh Atensi',
            '12',
            Icons.warning_amber_rounded,
            Colors.red,
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
            ),
          ),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestFilter() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: testTypes.length,
        itemBuilder: (context, index) {
          final type = testTypes[index];
          final isSelected = selectedTest == type;
          return GestureDetector(
            onTap: () => setState(() => selectedTest = type),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : Colors.grey.withAlpha(30),
                ),
              ),
              child: Center(
                child: Text(
                  type,
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

  Widget _buildAssessmentCard(Map<String, dynamic> a) {
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
                      a['name'],
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      'NIM: ${a['nim']} • ${a['date']}',
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
                  color: (a['color'] as Color).withAlpha(15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  a['status'],
                  style: TextStyle(
                    color: a['color'] as Color,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(height: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: (a['scores'] as Map<String, String>).entries
                .map((e) => _buildScoreItem(e.key, e.value))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreItem(String label, String value) {
    Color scoreColor = Colors.green;
    if (value == 'Sedang' || value == 'Ringan') scoreColor = Colors.orange;
    if (value == 'Berat' || value == 'Sangat Berat') scoreColor = Colors.red;

    return Column(
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF94A3B8),
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.bodyMd.copyWith(
            color: scoreColor,
            fontWeight: FontWeight.bold,
          ),
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
}
