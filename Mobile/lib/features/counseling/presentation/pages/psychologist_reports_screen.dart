import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class PsychologistReportsScreen extends StatefulWidget {
  const PsychologistReportsScreen({super.key});

  @override
  State<PsychologistReportsScreen> createState() => _PsychologistReportsScreenState();
}

class _PsychologistReportsScreenState extends State<PsychologistReportsScreen> {
  int _selectedTabIndex = 0;

  final List<Map<String, dynamic>> _reports = [
    {
      'title': 'Laporan Konseling Bulanan - Mei 2026',
      'date': '01 Mei 2026',
      'type': 'Laporan Bulanan',
      'size': '2.4 MB',
      'status': 'Selesai',
    },
    {
      'title': 'Rekap Kasus Kecemasan Semester Ganjil',
      'date': '15 Apr 2026',
      'type': 'Laporan Kasus',
      'size': '4.1 MB',
      'status': 'Selesai',
    },
    {
      'title': 'Laporan Konseling Bulanan - April 2026',
      'date': '01 Apr 2026',
      'type': 'Laporan Bulanan',
      'size': '2.2 MB',
      'status': 'Selesai',
    },
    {
      'title': 'Draft: Evaluasi Program Mentoring',
      'date': '20 Mei 2026',
      'type': 'Evaluasi',
      'size': '1.0 MB',
      'status': 'Draft',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push(AppRoutes.createPsychologistReport);
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_chart_rounded, color: Colors.white),
        label: const Text('Buat Laporan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Laporan Psikolog',
            info: 'Kelola dan unduh dokumen pelaporan',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                _buildTabs(),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    'Riwayat Laporan',
                    style: AppTextStyles.titleMd.copyWith(
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                _buildReportList(),
                const SizedBox(height: 80), // Padding for FAB
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    final tabs = ['Semua Laporan', 'Bulanan', 'Kasus', 'Draft'];
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        physics: const BouncingScrollPhysics(),
        itemCount: tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedTabIndex = index;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.grey.withAlpha(50),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(50),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : null,
              ),
              alignment: Alignment.center,
              child: Text(
                tabs[index],
                style: AppTextStyles.labelMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : const Color(0xFF64748B),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReportList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _reports.length,
      itemBuilder: (context, index) {
        final report = _reports[index];
        final isDraft = report['status'] == 'Draft';
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.withAlpha(30)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(5),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDraft ? Colors.grey.withAlpha(30) : AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  isDraft ? Icons.edit_document : Icons.picture_as_pdf_rounded,
                  color: isDraft ? Colors.grey : const Color(0xFFEF4444),
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report['title'],
                      style: AppTextStyles.titleMd.copyWith(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF1E293B),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.calendar_today_rounded, size: 12, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          report['date'],
                          style: AppTextStyles.labelSm.copyWith(color: Colors.grey[600], fontSize: 10),
                        ),
                        const SizedBox(width: 12),
                        Icon(Icons.sd_storage_rounded, size: 12, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          report['size'],
                          style: AppTextStyles.labelSm.copyWith(color: Colors.grey[600], fontSize: 10),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDraft ? Colors.orange.withAlpha(30) : const Color(0xFF10B981).withAlpha(20),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        report['status'],
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: isDraft ? Colors.orange : const Color(0xFF10B981),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(isDraft ? 'Melanjutkan edit draft...' : 'Mengunduh ${report['title']}...')),
                      );
                    },
                    icon: Icon(
                      isDraft ? Icons.edit_rounded : Icons.download_rounded,
                      color: isDraft ? AppColors.primary : const Color(0xFF10B981),
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: isDraft ? AppColors.primary.withAlpha(20) : const Color(0xFF10B981).withAlpha(20),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
