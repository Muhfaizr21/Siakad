import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_health_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_clinical_report_model.dart';
import 'package:intl/intl.dart';

class TkClinicalReportsScreen extends StatefulWidget {
  const TkClinicalReportsScreen({super.key});

  @override
  State<TkClinicalReportsScreen> createState() => _TkClinicalReportsScreenState();
}

class _TkClinicalReportsScreenState extends State<TkClinicalReportsScreen> {
  String _selectedFilter = '30 Hari';
  DateTimeRange? _customDateRange;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _applyFilter();
    });
  }

  void _applyFilter() {
    final now = DateTime.now();
    String? startDate;
    String? endDate = DateFormat('yyyy-MM-dd').format(now);

    if (_selectedFilter == 'Hari Ini') {
      startDate = DateFormat('yyyy-MM-dd').format(now);
    } else if (_selectedFilter == '7 Hari') {
      startDate = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 7)));
    } else if (_selectedFilter == '30 Hari') {
      startDate = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 30)));
    } else if (_selectedFilter == 'Custom' && _customDateRange != null) {
      startDate = DateFormat('yyyy-MM-dd').format(_customDateRange!.start);
      endDate = DateFormat('yyyy-MM-dd').format(_customDateRange!.end);
    } else if (_selectedFilter == 'Custom') {
      return; // Wait for user to select dates
    }

    context.read<TkHealthProvider>().fetchClinicalReports(
      startDate: startDate,
      endDate: endDate,
    );
  }

  Future<void> _selectCustomDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      initialDateRange: _customDateRange,
    );
    if (picked != null) {
      setState(() {
        _selectedFilter = 'Custom';
        _customDateRange = picked;
      });
      _applyFilter();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.neutral900),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Laporan Klinis',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: Consumer<TkHealthProvider>(
        builder: (context, provider, child) {
          final isListEmpty = provider.clinicalReports?.records.isEmpty ?? true;

          return RefreshIndicator(
            onRefresh: () async {
              _applyFilter();
            },
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      _buildFilterSection(),
                      if (provider.clinicalReports != null) 
                        _buildSummaryCards(provider.clinicalReports!.summary),
                      if (provider.clinicalReports != null)
                        _buildChartCards(provider.clinicalReports!.summary),
                    ],
                  ),
                ),
                if (provider.isLoading && isListEmpty)
                  const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (isListEmpty)
                  SliverFillRemaining(
                    child: _buildEmptyState(),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final report = provider.clinicalReports!.records[index];
                          return _buildReportCard(context, report);
                        },
                        childCount: provider.clinicalReports!.records.length,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.filter_list_rounded, size: 18, color: AppColors.neutral600),
              const SizedBox(width: 8),
              Text(
                'Filter Periode',
                style: AppTextStyles.titleSm.copyWith(color: AppColors.neutral700, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('Hari Ini'),
                _buildFilterChip('7 Hari'),
                _buildFilterChip('30 Hari'),
                _buildFilterChip('Custom', isCustom: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, {bool isCustom = false}) {
    final isSelected = _selectedFilter == label;
    String displayLabel = label;

    if (isCustom && _customDateRange != null && isSelected) {
      final start = DateFormat('dd MMM').format(_customDateRange!.start);
      final end = DateFormat('dd MMM').format(_customDateRange!.end);
      displayLabel = '$start - $end';
    }

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () {
          if (isCustom) {
            _selectCustomDateRange();
          } else {
            setState(() {
              _selectedFilter = label;
            });
            _applyFilter();
          }
        },
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.neutral100,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            displayLabel,
            style: AppTextStyles.bodySm.copyWith(
              color: isSelected ? Colors.white : AppColors.neutral700,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCards(TkClinicalReportStats stats) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              title: 'Total Diperiksa',
              value: stats.totalDiperiksa.toString(),
              icon: Icons.people_alt_rounded,
              color: AppColors.primary,
              bgColor: AppColors.primary.withOpacity(0.1),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              title: 'Layak',
              value: stats.layak.toString(),
              icon: Icons.check_circle_rounded,
              color: AppColors.success,
              bgColor: AppColors.successContainer,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              title: 'Perlu Perhatian',
              value: stats.perluPerhatian.toString(),
              icon: Icons.warning_rounded,
              color: AppColors.warning,
              bgColor: AppColors.warningContainer,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatCard(
              title: 'Tidak Layak',
              value: stats.tidakLayak.toString(),
              icon: Icons.cancel_rounded,
              color: AppColors.error,
              bgColor: AppColors.errorContainer,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold),
          ),
          Text(
            title,
            style: AppTextStyles.caption.copyWith(color: AppColors.neutral500),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildChartCards(TkClinicalReportStats stats) {
    final total = stats.totalDiperiksa > 0 ? stats.totalDiperiksa : 1; // prevent division by zero
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildCircularChart(
              title: 'Layak',
              percent: stats.layak / total,
              color: AppColors.success,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildCircularChart(
              title: 'Pantauan',
              percent: stats.perluPerhatian / total,
              color: AppColors.warning,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildCircularChart(
              title: 'Tidak Layak',
              percent: stats.tidakLayak / total,
              color: AppColors.error,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircularChart({
    required String title,
    required double percent,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  value: percent,
                  strokeWidth: 6,
                  backgroundColor: AppColors.neutral200,
                  color: color,
                ),
              ),
              Text(
                '${(percent * 100).toStringAsFixed(0)}%',
                style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: AppTextStyles.bodySm.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.library_books_rounded, size: 64, color: AppColors.neutral300),
          const SizedBox(height: 16),
          Text(
            'Belum ada Laporan Klinis',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
          ),
        ],
      ),
    );
  }

  Widget _buildReportCard(BuildContext context, TkClinicalReportRecord report) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.neutral200),
      ),
      child: InkWell(
        onTap: () => _showReportDetail(context, report),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      report.namaMahasiswa,
                      style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusBadge(report.hasil),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${report.nim} • ${report.prodi}',
                style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
              ),
              const Divider(height: 16),
              Row(
                children: [
                  Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.neutral400),
                  const SizedBox(width: 6),
                  Text(
                    DateFormat('dd MMM yyyy').format(report.tanggal),
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral600),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.medical_services_rounded, size: 14, color: AppColors.neutral400),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      report.namaPemeriksa,
                      style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    if (status.toUpperCase() == 'LAYAK' || status.toUpperCase() == 'SEHAT') {
      bgColor = AppColors.successContainer;
      textColor = AppColors.onSuccessContainer;
    } else if (status.toUpperCase() == 'TIDAK LAYAK' || status.toUpperCase() == 'SAKIT') {
      bgColor = AppColors.errorContainer;
      textColor = AppColors.onErrorContainer;
    } else {
      bgColor = AppColors.warningContainer;
      textColor = AppColors.onWarningContainer;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: AppTextStyles.caption.copyWith(
          color: textColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showReportDetail(BuildContext context, TkClinicalReportRecord report) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.only(left: 20, right: 20, top: 24, bottom: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Detail Laporan Klinis',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              _buildDetailItem('Hasil Pemeriksaan', report.hasil),
              _buildDetailItem('Catatan Medis', report.catatan),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Tutup', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.neutral500)),
          const SizedBox(height: 4),
          Text(value.isEmpty ? '-' : value, style: AppTextStyles.bodyMd),
        ],
      ),
    );
  }
}
