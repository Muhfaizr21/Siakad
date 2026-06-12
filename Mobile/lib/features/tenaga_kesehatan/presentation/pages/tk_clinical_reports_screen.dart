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
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkHealthProvider>().fetchClinicalReports();
    });
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

          if (provider.isLoading && isListEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (isListEmpty) {
            return _buildEmptyState();
          }

          final records = provider.clinicalReports!.records;

          return RefreshIndicator(
            onRefresh: () => provider.fetchClinicalReports(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: records.length,
              itemBuilder: (context, index) {
                final report = records[index];
                return _buildReportCard(context, report);
              },
            ),
          );
        },
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
