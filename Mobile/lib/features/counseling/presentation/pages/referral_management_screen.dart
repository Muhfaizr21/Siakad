import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/referral_provider.dart';
import 'package:bkuhub_mobile/features/counseling/data/models/counseling_models.dart';
import 'package:bkuhub_mobile/features/counseling/data/repositories/counseling_repository_impl.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:get_it/get_it.dart';

class ReferralManagementScreen extends StatefulWidget {
  const ReferralManagementScreen({super.key});

  @override
  State<ReferralManagementScreen> createState() => _ReferralManagementScreenState();
}

class _ReferralManagementScreenState extends State<ReferralManagementScreen> {
  late ReferralProvider _referralProvider;

  @override
  void initState() {
    super.initState();
    final apiClient = GetIt.instance<ApiClient>();
    _referralProvider = ReferralProvider(
      repository: CounselingRepositoryImpl(apiClient: apiClient),
    );
    _referralProvider.loadReferrals();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ReferralProvider>.value(
      value: _referralProvider,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: CustomScrollView(
          slivers: [
            const BkuAppBar(
              title: 'Tindak Lanjut',
              info: 'Kelola surat rujukan untuk pasien',
              isExpandable: false,
              backgroundColor: Color(0xFF002D6F), // Primary blue color
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Create Referral Button
                    GestureDetector(
                      onTap: () {
                        // TODO: Navigate to create referral screen
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withAlpha(30),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.add_rounded, color: Colors.white),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Buat Surat Rujukan Baru',
                                style: AppTextStyles.bodyMd.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Icon(Icons.arrow_forward_rounded, color: Colors.white),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Referrals List
                    Consumer<ReferralProvider>(
                      builder: (context, provider, _) {
                        if (provider.isLoading) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.all(32),
                              child: CircularProgressIndicator(color: AppColors.primary),
                            ),
                          );
                        }

                        if (provider.referrals.isEmpty) {
                          return Container(
                            padding: const EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.send_rounded, size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text(
                                  'Belum Ada Surat Rujukan',
                                  style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Buat surat rujukan baru untuk pasien Anda',
                                  style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }

                        return ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: provider.referrals.length,
                          itemBuilder: (context, index) {
                            final referral = provider.referrals[index];
                            return _ReferralCard(referral: referral);
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReferralCard extends StatelessWidget {
  final Referral referral;

  const _ReferralCard({required this.referral});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Pending':
        return Colors.amber;
      case 'Sent':
        return AppColors.primary;
      case 'Received':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'Pending':
        return 'Menunggu Pengiriman';
      case 'Sent':
        return 'Sudah Dikirim';
      case 'Received':
        return 'Sudah Diterima';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      referral.mahasiswaNama,
                      style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tipe: ${referral.tipe}',
                      style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getStatusColor(referral.status).withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getStatusLabel(referral.status),
                  style: AppTextStyles.labelSm.copyWith(
                    color: _getStatusColor(referral.status),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Alasan
          Text(
            'Alasan:',
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            referral.alasan,
            style: AppTextStyles.bodyMd,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),

          // Pihak Tujuan
          Text(
            'Pihak Tujuan: ${referral.pihakTujuan}',
            style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),

          // Tanggal
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 14, color: const Color(0xFF94A3B8)),
              const SizedBox(width: 6),
              Text(
                'Dibuat: ${_formatDate(referral.tanggalDibuat)}',
                style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Action Buttons
          Consumer<ReferralProvider>(
            builder: (context, provider, _) {
              return Row(
                children: [
                  if (referral.status == 'Pending')
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: provider.isSending
                            ? null
                            : () async {
                                final success = await provider.sendReferral(referral.id);
                                if (success && context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Surat rujukan berhasil dikirim')),
                                  );
                                }
                              },
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: provider.isSending ? const Text('Mengirim...') : const Text('Kirim'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  if (referral.status == 'Sent')
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: provider.isSending
                            ? null
                            : () async {
                                final success = await provider.confirmReferralReceived(referral.id);
                                if (success && context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Penerimaan surat rujukan dikonfirmasi')),
                                  );
                                }
                              },
                        icon: const Icon(Icons.check_circle_rounded, size: 16),
                        label: provider.isSending ? const Text('Mengkonfirmasi...') : const Text('Konfirmasi Terima'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  if (referral.suratRujiukanUrl != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          try {
                            // Download PDF
                            final apiClient = GetIt.instance<ApiClient>();
                            final response = await apiClient.get(
                              '/psychologist/referrals/${referral.id}/download',
                            );
                            
                            if (response.statusCode == 200) {
                              // Save file to device
                              final bytes = response.bodyBytes;
                              final fileName = 'surat_rujukan_${referral.mahasiswaNama.replaceAll(' ', '_')}.pdf';
                              
                              // TODO: Implement file save and open with platform channel
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('PDF berhasil diunduh: $fileName')),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Gagal mengunduh PDF')),
                              );
                            }
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Error: $e')),
                            );
                          }
                        },
                        icon: const Icon(Icons.download_rounded, size: 16),
                        label: const Text('Lihat PDF'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

