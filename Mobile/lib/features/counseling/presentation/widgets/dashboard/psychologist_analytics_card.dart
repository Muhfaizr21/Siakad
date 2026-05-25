import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class PsychologistAnalyticsCard extends StatelessWidget {
  const PsychologistAnalyticsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final weekTrends = provider.analytics['week_trends'] as List? ?? [];
        final isLoading = provider.analyticsLoading;

        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFF003399)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withAlpha(60),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Tren Keluhan Minggu Ini',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.push(AppRoutes.psychologistAnalytics),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(40),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Lihat Detail',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              isLoading
                  ? const Center(
                      child: SizedBox(
                        height: 80,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      ),
                    )
                  : weekTrends.isEmpty
                      ? _buildEmpty()
                      : _buildBars(weekTrends),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmpty() {
    return SizedBox(
      height: 80,
      child: Center(
        child: Text(
          'Belum ada data minggu ini',
          style: TextStyle(color: Colors.white.withAlpha(150), fontSize: 12),
        ),
      ),
    );
  }

  Widget _buildBars(List weekTrends) {
    // Ambil max 4 topik
    final items = weekTrends.take(4).toList();
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: items.map((t) {
        final trend = t as Map<String, dynamic>;
        final label = trend['name']?.toString() ?? '-';
        final val = (trend['val'] as num?)?.toDouble() ?? 0.0;
        // Potong label panjang
        final shortLabel = label.length > 8 ? '${label.substring(0, 7)}..' : label;
        return _SimpleBar(label: shortLabel, val: val.clamp(0.0, 1.0));
      }).toList(),
    );
  }
}

class _SimpleBar extends StatelessWidget {
  final String label;
  final double val;

  const _SimpleBar({required this.label, required this.val});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 80,
          width: 8,
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(30),
            borderRadius: BorderRadius.circular(4),
          ),
          child: FractionallySizedBox(
            heightFactor: val > 0 ? val : 0.05,
            alignment: Alignment.bottomCenter,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 10)),
      ],
    );
  }
}
