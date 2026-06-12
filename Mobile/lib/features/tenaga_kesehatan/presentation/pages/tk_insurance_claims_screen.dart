import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_health_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_insurance_claim_model.dart';
import 'package:intl/intl.dart';

class TkInsuranceClaimsScreen extends StatefulWidget {
  const TkInsuranceClaimsScreen({super.key});

  @override
  State<TkInsuranceClaimsScreen> createState() => _TkInsuranceClaimsScreenState();
}

class _TkInsuranceClaimsScreenState extends State<TkInsuranceClaimsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkHealthProvider>().fetchInsuranceClaims();
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
          'Klaim Asuransi',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: Consumer<TkHealthProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.claims.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.claims.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchInsuranceClaims(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.claims.length,
              itemBuilder: (context, index) {
                final claim = provider.claims[index];
                return _buildClaimCard(context, provider, claim);
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
          Icon(Icons.assignment_late_rounded, size: 64, color: AppColors.neutral300),
          const SizedBox(height: 16),
          Text(
            'Belum ada klaim asuransi',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
          ),
        ],
      ),
    );
  }

  Widget _buildClaimCard(BuildContext context, TkHealthProvider provider, TkInsuranceClaimModel claim) {
    final formatCurrency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.neutral200),
      ),
      child: InkWell(
        onTap: () => _showReviewDialog(context, provider, claim),
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
                      claim.mahasiswaName,
                      style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusBadge(claim.status),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${claim.mahasiswaNim} • ${claim.mahasiswaProdi}',
                style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Icon(Icons.local_hospital_rounded, size: 16, color: AppColors.neutral400),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      claim.jenisProvider,
                      style: AppTextStyles.bodySm,
                    ),
                  ),
                  Text(
                    formatCurrency.format(claim.estimasiBiaya),
                    style: AppTextStyles.bodySm.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
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
    String label;

    switch (status) {
      case 'PENDING_VERIFICATION':
        bgColor = AppColors.warningContainer;
        textColor = AppColors.onWarningContainer;
        label = 'Menunggu';
        break;
      case 'APPROVED_TK':
      case 'APPROVED_FINAL':
        bgColor = AppColors.successContainer;
        textColor = AppColors.onSuccessContainer;
        label = 'Disetujui';
        break;
      case 'REJECTED':
        bgColor = AppColors.errorContainer;
        textColor = AppColors.onErrorContainer;
        label = 'Ditolak';
        break;
      default:
        bgColor = AppColors.surfaceContainerHigh;
        textColor = AppColors.onSurfaceVariant;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: textColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showReviewDialog(BuildContext context, TkHealthProvider provider, TkInsuranceClaimModel claim) {
    final noteController = TextEditingController(text: claim.catatanReview ?? '');
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20,
            right: 20,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Review Klaim Asuransi',
                style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text('Deskripsi:', style: AppTextStyles.labelMd),
              const SizedBox(height: 4),
              Text(claim.deskripsi.isEmpty ? '-' : claim.deskripsi, style: AppTextStyles.bodySm),
              const SizedBox(height: 16),
              TextField(
                controller: noteController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Catatan Review',
                  hintText: 'Tulis alasan penolakan/persetujuan',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 24),
              if (claim.status == 'PENDING_VERIFICATION')
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          final success = await provider.updateClaimStatus(
                            claim.id,
                            'REJECTED',
                            catatanReview: noteController.text,
                          );
                          if (success && context.mounted) {
                            context.pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Klaim ditolak')),
                            );
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          side: const BorderSide(color: AppColors.error),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Tolak'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          final success = await provider.updateClaimStatus(
                            claim.id,
                            'APPROVED_TK',
                            catatanReview: noteController.text,
                          );
                          if (success && context.mounted) {
                            context.pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Klaim disetujui')),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Setujui'),
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
