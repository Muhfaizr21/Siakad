import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_health_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_bap_model.dart';
import 'package:intl/intl.dart';

class TkBapScreen extends StatefulWidget {
  const TkBapScreen({super.key});

  @override
  State<TkBapScreen> createState() => _TkBapScreenState();
}

class _TkBapScreenState extends State<TkBapScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkHealthProvider>().fetchBAPs();
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
          'BAP Kesehatan',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/tk/bap/form'),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ),
      body: Consumer<TkHealthProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.baps.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.baps.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchBAPs(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.baps.length,
              itemBuilder: (context, index) {
                final bap = provider.baps[index];
                return _buildBapCard(context, bap);
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
          Icon(Icons.assignment_rounded, size: 64, color: AppColors.neutral300),
          const SizedBox(height: 16),
          Text(
            'Belum ada BAP Kesehatan',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
          ),
        ],
      ),
    );
  }

  Widget _buildBapCard(BuildContext context, TkBapModel bap) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.neutral200),
      ),
      child: InkWell(
        onTap: () => context.push('/tk/bap/form', extra: bap),
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
                      bap.namaKegiatan,
                      style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusBadge(bap.status),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.neutral400),
                  const SizedBox(width: 6),
                  Text(
                    DateFormat('dd MMM yyyy').format(bap.tanggalPelaksanaan),
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral600),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.location_on_rounded, size: 14, color: AppColors.neutral400),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      bap.tempat,
                      style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatItem('Peserta', bap.jumlahPeserta.toString()),
                  _buildStatItem('Diperiksa', bap.jumlahDiperiksa.toString()),
                  _buildStatItem('Layak', bap.totalLayak.toString(), color: AppColors.success),
                  _buildStatItem('Tdk Layak', bap.totalTidakLayak.toString(), color: AppColors.error),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, {Color? color}) {
    return Column(
      children: [
        Text(
          value,
          style: AppTextStyles.titleSm.copyWith(
            fontWeight: FontWeight.bold,
            color: color ?? AppColors.neutral800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(color: AppColors.neutral500),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    if (status == 'FINAL') {
      bgColor = AppColors.successContainer;
      textColor = AppColors.onSuccessContainer;
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
}
