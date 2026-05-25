import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class PsychologistAnalyticsScreen extends StatefulWidget {
  const PsychologistAnalyticsScreen({super.key});

  @override
  State<PsychologistAnalyticsScreen> createState() =>
      _PsychologistAnalyticsScreenState();
}

class _PsychologistAnalyticsScreenState
    extends State<PsychologistAnalyticsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadAnalytics();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final analytics = provider.analytics;
        final stats = analytics['stats'] as List? ?? [];
        final monthly = analytics['monthly'] as List? ?? List.filled(12, 0);
        final topIssues = analytics['top_issues'] as List? ?? [];
        final recommendations = analytics['recommendations'] as List? ?? [];

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
                child: provider.analyticsLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 80),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 24),
                            if (stats.isNotEmpty) ...[
                              _buildSectionTitle('Ringkasan'),
                              const SizedBox(height: 12),
                              _buildSummaryCards(stats),
                              const SizedBox(height: 28),
                            ],
                            _buildSectionTitle('Tren Sesi Bulanan'),
                            const SizedBox(height: 12),
                            _buildTrendChart(monthly),
                            const SizedBox(height: 28),
                            _buildSectionTitle('Distribusi Masalah'),
                            const SizedBox(height: 12),
                            _buildIssueDistribution(topIssues),
                            const SizedBox(height: 28),
                            _buildSectionTitle('Rekomendasi Sistem'),
                            const SizedBox(height: 12),
                            _buildRecommendations(recommendations),
                            const SizedBox(height: 40),
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

  // ─── Section Title ────────────────────────────────────────────────────────

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        color: const Color(0xFF0F172A),
        fontWeight: FontWeight.w900,
      ),
    );
  }

  // ─── Summary Cards ────────────────────────────────────────────────────────
  // Pakai Row 2x2 manual, bukan GridView, biar height bisa auto

  Widget _buildSummaryCards(List stats) {
    final colors = [
      AppColors.primary,
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
      Colors.purple,
    ];
    final icons = [
      Icons.groups_rounded,
      Icons.check_circle_rounded,
      Icons.warning_amber_rounded,
      Icons.star_rounded,
    ];

    final count = stats.length > 4 ? 4 : stats.length;
    final rows = <Widget>[];

    for (int r = 0; r < count; r += 2) {
      final rowItems = <Widget>[];
      for (int c = r; c < r + 2 && c < count; c++) {
        final s = stats[c] as Map<String, dynamic>;
        final color = colors[c % colors.length];
        final isPositive = s['isPositive'] == true;
        rowItems.add(
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withAlpha(18),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icons[c % icons.length], color: color, size: 18),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '${s['value'] ?? 0}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    s['label']?.toString() ?? '',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (s['trend'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      s['trend'].toString(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isPositive ? Colors.green : Colors.red,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
        if (c + 1 < r + 2 && c + 1 < count) {
          rowItems.add(const SizedBox(width: 12));
        }
      }
      // Kalau jumlah ganjil, isi dengan spacer
      if (count % 2 != 0 && r + 1 >= count) {
        rowItems.add(const Expanded(child: SizedBox()));
      }
      rows.add(Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: rowItems,
      ));
      if (r + 2 < count) rows.add(const SizedBox(height: 12));
    }

    return Column(children: rows);
  }

  // ─── Trend Chart ──────────────────────────────────────────────────────────

  Widget _buildTrendChart(List monthly) {
    final nums = monthly.map((e) => (e as num).toDouble()).toList();
    final maxVal = nums.fold<double>(1.0, (prev, e) => e > prev ? e : prev);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sesi per Bulan',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: LayoutBuilder(
              builder: (context, constraints) {
                const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(12, (i) {
                    final val = nums[i];
                    final ratio = maxVal > 0 ? val / maxVal : 0.0;
                    final barH = (ratio * 80).clamp(4.0, 80.0);
                    final isMax = ratio >= 1.0 && val > 0;

                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (isMax)
                              Container(
                                margin: const EdgeInsets.only(bottom: 3),
                                padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  '${val.toInt()}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 7,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 500),
                              height: barH,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: isMax
                                      ? [AppColors.primary, const Color(0xFF3B82F6)]
                                      : [AppColors.primary.withAlpha(180), AppColors.primary.withAlpha(80)],
                                ),
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              monthLabels[i],
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ─── Issue Distribution ───────────────────────────────────────────────────

  Widget _buildIssueDistribution(List topIssues) {
    if (topIssues.isEmpty) {
      return _buildEmptyCard('Belum ada data distribusi masalah');
    }

    final colors = [
      const Color(0xFFEF4444),
      const Color(0xFFF59E0B),
      const Color(0xFF3B82F6),
      const Color(0xFF8B5CF6),
      const Color(0xFF94A3B8),
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: topIssues.asMap().entries.map((entry) {
          final i = entry.key;
          final issue = entry.value as Map<String, dynamic>;
          final color = colors[i % colors.length];
          final perc = ((issue['percentage'] as num?)?.toDouble() ?? 0.0).clamp(0.0, 100.0);
          final percInt = perc.toInt();

          return Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        issue['name']?.toString() ?? '-',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$percInt%',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: perc / 100,
                    minHeight: 7,
                    backgroundColor: const Color(0xFFF1F5F9),
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // ─── Recommendations ──────────────────────────────────────────────────────

  Widget _buildRecommendations(List recommendations) {
    if (recommendations.isEmpty) {
      return _buildEmptyCard('Belum ada rekomendasi sistem');
    }

    return Column(
      children: recommendations.map((r) {
        final rec = r as Map<String, dynamic>;
        final isWarning = rec['type'] == 'warning';
        final color = isWarning ? const Color(0xFFF59E0B) : const Color(0xFF10B981);
        final bgColor = isWarning ? const Color(0xFFFFFBEB) : const Color(0xFFF0FDF4);
        final borderColor = isWarning ? const Color(0xFFFDE68A) : const Color(0xFFBBF7D0);

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isWarning ? Icons.warning_amber_rounded : Icons.lightbulb_rounded,
                  color: color,
                  size: 16,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rec['title']?.toString() ?? '',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      rec['description']?.toString() ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF475569),
                        height: 1.4,
                      ),
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // ─── Empty Card ───────────────────────────────────────────────────────────

  Widget _buildEmptyCard(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.withAlpha(30)),
      ),
      child: Column(
        children: [
          Icon(Icons.bar_chart_rounded, size: 40, color: Colors.grey[300]),
          const SizedBox(height: 8),
          Text(
            message,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF94A3B8),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
