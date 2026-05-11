import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

class PsychologistAnalyticsScreen extends StatefulWidget {
  const PsychologistAnalyticsScreen({super.key});

  @override
  State<PsychologistAnalyticsScreen> createState() => _PsychologistAnalyticsScreenState();
}

class _PsychologistAnalyticsScreenState extends State<PsychologistAnalyticsScreen> {
  String _selectedPeriod = 'Bulan Ini';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          const BkuAppBar(
            title: 'Analitik Konseling',
            info: 'Statistik & tren sesi konseling mahasiswa',
            variant: AppBarVariant.psychologist,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  _buildFilterSection(),
                  const SizedBox(height: 24),
                  _buildSummaryCards(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Tren Kasus Bulanan'),
                  const SizedBox(height: 16),
                  _buildTrendChart(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Distribusi Masalah (Top 5)'),
                  const SizedBox(height: 16),
                  _buildIssueDistribution(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Rekomendasi Sistem'),
                  const SizedBox(height: 16),
                  _buildActionableInsights(),
                  const SizedBox(height: 32),
                  _buildExportButton(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: const Color(0xFF0F172A),
        fontWeight: FontWeight.w900,
      ),
    );
  }

  Widget _buildSummaryCards() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            title: 'Total Sesi',
            value: '124',
            trend: '+12% bulan ini',
            icon: Icons.groups_rounded,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            title: 'Kasus Selesai',
            value: '89',
            trend: '+5% bulan ini',
            icon: Icons.check_circle_rounded,
            color: const Color(0xFF10B981),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String trend,
    required IconData icon,
    required Color color,
  }) {
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
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withAlpha(15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            trend,
            style: AppTextStyles.labelSm.copyWith(
              color: Colors.green,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendChart() {
    // Custom simple bar chart
    final data = [
      {'label': 'Jan', 'value': 0.4},
      {'label': 'Feb', 'value': 0.6},
      {'label': 'Mar', 'value': 0.5},
      {'label': 'Apr', 'value': 0.8},
      {'label': 'Mei', 'value': 1.0},
      {'label': 'Jun', 'value': 0.3},
    ];

    return Container(
      height: 200,
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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: data.map((d) {
          final height = (d['value'] as double) * 100;
          final isMax = d['value'] == 1.0;
          return Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (isMax)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('Peak', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                ),
              AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                width: 32,
                height: height,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      AppColors.primary,
                      isMax ? const Color(0xFF3B82F6) : AppColors.primary.withAlpha(150),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                d['label'] as String,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildIssueDistribution() {
    final issues = [
      {'title': 'Stres Akademik', 'percentage': 45, 'color': const Color(0xFFEF4444)},
      {'title': 'Kecemasan (Anxiety)', 'percentage': 25, 'color': const Color(0xFFF59E0B)},
      {'title': 'Masalah Keluarga', 'percentage': 15, 'color': const Color(0xFF3B82F6)},
      {'title': 'Krisis Identitas', 'percentage': 10, 'color': const Color(0xFF8B5CF6)},
      {'title': 'Lainnya', 'percentage': 5, 'color': const Color(0xFF94A3B8)},
    ];

    return Container(
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
        children: issues.map((issue) {
          final color = issue['color'] as Color;
          final perc = issue['percentage'] as int;
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text(
                    issue['title'] as String,
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF475569),
                    ),
                  ),
                ),
                Expanded(
                  flex: 5,
                  child: Stack(
                    children: [
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      FractionallySizedBox(
                        widthFactor: perc / 100,
                        child: Container(
                          height: 8,
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 36,
                  child: Text(
                    '$perc%',
                    style: AppTextStyles.labelSm.copyWith(
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1E293B),
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFilterSection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Periode Data',
          style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
        ),
        GestureDetector(
          onTap: () {
            setState(() {
              _selectedPeriod = _selectedPeriod == 'Bulan Ini' ? 'Tahun Ini' : 'Bulan Ini';
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Menampilkan data untuk $_selectedPeriod')),
            );
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.withAlpha(50)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Text(
                  _selectedPeriod,
                  style: AppTextStyles.labelSm.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: AppColors.primary),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionableInsights() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary.withAlpha(15), AppColors.primary.withAlpha(5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.lightbulb_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Saran Tindakan',
                  style: AppTextStyles.bodyLg.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
                ),
                const SizedBox(height: 8),
                Text(
                  'Kasus "Stres Akademik" meningkat 12% dibanding bulan lalu. Disarankan untuk menjadwalkan webinar manajemen waktu & stres sebelum masa UTS.',
                  style: AppTextStyles.labelMd.copyWith(color: const Color(0xFF475569), height: 1.5),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Draft agenda webinar ditambahkan ke kalender!')),
                    );
                  },
                  icon: const Icon(Icons.event_note_rounded, size: 16),
                  label: const Text('Buat Agenda', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExportButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: OutlinedButton.icon(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Menyiapkan dokumen laporan PDF...')),
          );
        },
        icon: const Icon(Icons.download_rounded),
        label: const Text('Ekspor Laporan Analitik (PDF)', style: TextStyle(fontWeight: FontWeight.w900)),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
