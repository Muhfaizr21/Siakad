import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/referral_provider.dart';
import 'package:bkuhub_mobile/features/counseling/data/models/counseling_models.dart';

class ReferralManagementScreen extends StatefulWidget {
  const ReferralManagementScreen({super.key});

  @override
  State<ReferralManagementScreen> createState() => _ReferralManagementScreenState();
}

class _ReferralManagementScreenState extends State<ReferralManagementScreen> {
  String _searchQuery = '';
  String _selectedFilter = 'Semua';
  final List<String> _filters = ['Semua', 'Pending', 'Sent', 'Selesai', 'Ditolak'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReferralProvider>().loadReferrals();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: CustomScrollView(
          slivers: [
            const BkuAppBar(
              title: 'Tindak Lanjut',
              info: 'Kelola surat rujukan untuk pasien',
              variant: AppBarVariant.psychologist,
              showBackButton: true,
              isExpandable: false,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Create Referral Button
                    GestureDetector(
                      onTap: () {
                        context.push(AppRoutes.createReferral);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withAlpha(60),
                              blurRadius: 15,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withAlpha(30),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.add_task_rounded, color: Colors.white, size: 24),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Buat Surat Rujukan',
                                    style: AppTextStyles.titleMd.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Pusatkan layanan ke instansi ahli',
                                    style: AppTextStyles.labelSm.copyWith(
                                      color: Colors.white.withAlpha(200),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.primary, size: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Stats Section
                    Consumer<ReferralProvider>(
                      builder: (context, provider, _) {
                        if (provider.isLoading || provider.referrals.isEmpty) return const SizedBox.shrink();
                        
                        final total = provider.referrals.length;
                        final pending = provider.referrals.where((r) => r.status == 'Pending' || r.status == 'menunggu_approval').length;
                        final selesai = provider.referrals.where((r) => r.status == 'Selesai' || r.status == 'Diterima' || r.status == 'Received').length;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: Row(
                            children: [
                              Expanded(child: _buildStatCard('Total\nRujukan', total.toString(), Icons.analytics_rounded, AppColors.primary)),
                              const SizedBox(width: 12),
                              Expanded(child: _buildStatCard('Menunggu\nPersetujuan', pending.toString(), Icons.pending_actions_rounded, AppColors.warning)),
                              const SizedBox(width: 12),
                              Expanded(child: _buildStatCard('Selesai\nDiproses', selesai.toString(), Icons.check_circle_rounded, AppColors.success)),
                            ],
                          ),
                        );
                      },
                    ),

                    // Search and Filter
                    _buildSearchBar(),
                    const SizedBox(height: 12),
                    _buildFilterChips(),
                    const SizedBox(height: 20),

                    // Referrals List
                    Consumer<ReferralProvider>(
                      builder: (context, provider, _) {
                        if (provider.isLoading) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: CircularProgressIndicator(color: AppColors.primary),
                            ),
                          );
                        }

                        var filteredList = provider.referrals.where((ref) {
                          final matchesSearch = ref.mahasiswaNama.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                              ref.pihakTujuan.toLowerCase().contains(_searchQuery.toLowerCase());
                          
                          if (_selectedFilter == 'Semua') return matchesSearch;
                          
                          if (_selectedFilter == 'Selesai') {
                            return matchesSearch && (ref.status == 'Diterima' || ref.status == 'Received' || ref.status == 'Selesai');
                          }
                          if (_selectedFilter == 'Pending') {
                            return matchesSearch && (ref.status == 'Pending' || ref.status == 'menunggu_approval');
                          }
                          
                          return matchesSearch && ref.status == _selectedFilter;
                        }).toList();

                        if (filteredList.isEmpty) {
                          return Container(
                            padding: const EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.neutral200),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.search_off_rounded, size: 48, color: AppColors.neutral300),
                                const SizedBox(height: 16),
                                Text(
                                  provider.referrals.isEmpty ? 'Belum Ada Rujukan' : 'Data Tidak Ditemukan',
                                  style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          );
                        }

                        return ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: filteredList.length,
                          itemBuilder: (context, index) {
                            final referral = filteredList[index];
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
      );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.neutral200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
          });
        },
        decoration: InputDecoration(
          hintText: 'Cari nama pasien atau tujuan...',
          hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.neutral500),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 36,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final filter = _filters[index];
          final isSelected = _selectedFilter == filter;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = filter),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? Colors.transparent : AppColors.neutral200,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(40),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : null,
              ),
              child: Center(
                child: Text(
                  filter,
                  style: AppTextStyles.labelSm.copyWith(
                    color: isSelected ? Colors.white : AppColors.neutral600,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
  Widget _buildStatCard(String title, String count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(15),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(color: color.withAlpha(40), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            count,
            style: AppTextStyles.titleLg.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500, fontWeight: FontWeight.w600, height: 1.2, fontSize: 10),
          ),
        ],
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
      case 'menunggu_approval':
        return AppColors.warning;
      case 'Sent':
        return AppColors.primary;
      case 'Received':
      case 'Selesai':
      case 'Diterima':
        return AppColors.success;
      case 'Ditolak':
        return AppColors.danger;
      default:
        return AppColors.neutral500;
    }
  }

  Color _getStatusBgColor(String status) {
    switch (status) {
      case 'Pending':
      case 'menunggu_approval':
        return AppColors.warningContainer;
      case 'Sent':
        return AppColors.primary.withAlpha(15);
      case 'Received':
      case 'Selesai':
      case 'Diterima':
        return AppColors.successContainer;
      case 'Ditolak':
        return AppColors.dangerContainer;
      default:
        return AppColors.neutral200;
    }
  }



  String _getStatusLabel(String status) {
    switch (status) {
      case 'Pending':
      case 'menunggu_approval':
        return 'Menunggu Persetujuan';
      case 'Sent':
        return 'Sudah Dikirim';
      case 'Received':
      case 'Selesai':
      case 'Diterima':
        return 'Disetujui & Selesai';
      case 'Ditolak':
        return 'Ditolak';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withAlpha(4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header (Avatar + Name + Status)
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.primary.withAlpha(15),
                  child: Text(
                    referral.mahasiswaNama.isNotEmpty ? referral.mahasiswaNama[0].toUpperCase() : 'M',
                    style: AppTextStyles.titleMd.copyWith(color: AppColors.primary, fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        referral.mahasiswaNama,
                        style: AppTextStyles.titleSm.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        referral.tipe,
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusBgColor(referral.status),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusLabel(referral.status),
                    style: AppTextStyles.labelSm.copyWith(
                      color: _getStatusColor(referral.status),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),

            // Inner Data Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.neutral500),
                          const SizedBox(width: 6),
                          Text('Tanggal Dibuat', style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500)),
                        ],
                      ),
                      Text(_formatDate(referral.tanggalDibuat), style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1, color: Color(0xFFE2E8F0)),
                  ),
                  _buildDataRow('Instansi Tujuan', referral.pihakTujuan, Icons.apartment_rounded),
                  const SizedBox(height: 12),
                  _buildDataRow('Alasan Rujukan', referral.alasan, Icons.description_rounded, isLong: true),
                ],
              ),
            ),

            // Actions
            Consumer<ReferralProvider>(
              builder: (context, provider, _) {
                final bool isWaiting = referral.status == 'Pending' || referral.status == 'menunggu_approval';
                final bool isDone = referral.status == 'Selesai' || referral.status == 'Diterima' || referral.status == 'Received';
                final bool isRejected = referral.status == 'Ditolak';
                final bool showPdf = referral.suratRujiukanUrl != null && referral.suratRujiukanUrl!.isNotEmpty;
                
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      if (isWaiting)
                        Expanded(
                          child: _buildActionButton(
                            label: 'Menunggu Persetujuan',
                            icon: Icons.access_time_rounded,
                            isPrimary: true,
                            color: AppColors.warning,
                            onPressed: null, // Indicator only
                          ),
                        ),
                      if (isDone && !showPdf)
                        Expanded(
                          child: _buildActionButton(
                            label: 'Telah Disetujui',
                            icon: Icons.check_circle_rounded,
                            isPrimary: true,
                            color: AppColors.success,
                            onPressed: null, // Indicator only
                          ),
                        ),
                      if (isRejected)
                        Expanded(
                          child: _buildActionButton(
                            label: 'Rujukan Ditolak',
                            icon: Icons.cancel_rounded,
                            isPrimary: true,
                            color: AppColors.danger,
                            onPressed: null, // Indicator only
                          ),
                        ),
                      if ((isWaiting || isDone || isRejected) && showPdf) const SizedBox(width: 10),
                      if (showPdf)
                        Expanded(
                          child: _buildActionButton(
                            label: 'Lihat PDF',
                            icon: Icons.picture_as_pdf_rounded,
                            isPrimary: false,
                            color: AppColors.primary,
                            onPressed: () async {
                              final provider = Provider.of<ReferralProvider>(context, listen: false);
                              final url = await provider.downloadReferral(referral.id);
                              if (url != null && context.mounted) {
                                try {
                                  await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal membuka PDF'), backgroundColor: AppColors.danger));
                                  }
                                }
                              }
                            },
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataRow(String label, String value, IconData icon, {bool isLong = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: AppColors.neutral500),
            const SizedBox(width: 6),
            Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500)),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.w600, height: isLong ? 1.4 : 1.0),
          maxLines: isLong ? 3 : 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildActionButton({required String label, required IconData icon, required bool isPrimary, required Color color, required VoidCallback? onPressed}) {
    final bool isDisabled = onPressed == null;
    
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isPrimary ? (isDisabled ? color.withAlpha(20) : color) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: isPrimary && !isDisabled ? null : Border.all(color: isDisabled ? Colors.transparent : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: isPrimary ? (isDisabled ? color : Colors.white) : AppColors.neutral700),
            const SizedBox(width: 8),
            Flexible(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  label,
                  style: TextStyle(
                    color: isPrimary ? (isDisabled ? color : Colors.white) : AppColors.neutral700,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

