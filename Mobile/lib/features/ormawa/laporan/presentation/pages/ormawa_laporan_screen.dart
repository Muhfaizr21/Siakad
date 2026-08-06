import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_lpj.dart';

class OrmawaLaporanScreen extends StatefulWidget {
  const OrmawaLaporanScreen({super.key});

  @override
  State<OrmawaLaporanScreen> createState() => _OrmawaLaporanScreenState();
}

class _OrmawaLaporanScreenState extends State<OrmawaLaporanScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterStatus = 'Semua';

  final List<String> _statusOptions = ['Semua', 'Diajukan', 'Revisi', 'Disetujui'];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<OrmawaProvider>().refreshData());
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: () => context.read<OrmawaProvider>().refreshData(),
        child: CustomScrollView(
          slivers: [
          BkuAppBar(
            variant: AppBarVariant.ormawa,
            title: 'LAPORAN & LPJ',
            subtitle: 'DOKUMENTASI KEGIATAN',
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryGrid(),
                  const SizedBox(height: 32),
                  OrmawaListHeader(
                    title: 'DAFTAR LPJ KEGIATAN',
                    searchHint: 'Cari judul laporan kegiatan...',
                    searchController: _searchController,
                    onRefresh: () => context.read<OrmawaProvider>().refreshData(),
                    onFilterTap: () => _showFilterSheet(),
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                  const SizedBox(height: 12),
                  _buildLaporanList(),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddLaporan(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.note_add_rounded, color: Colors.white),
        label: const Text(
          'Buat LPJ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildSummaryGrid() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final lpjs = provider.lpjs;
        final totalLPJ = lpjs.length;
        final approvedLPJ = lpjs.where((e) => e.status == 'disetujui' || e.status == 'selesai').length;
        final pendingLPJ = lpjs.where((e) => e.status == 'diajukan' || e.status == 'revisi').length;
        final totalRealisasi = lpjs.fold<double>(
          0,
          (sum, item) => sum + item.realisasiAnggaran,
        );
        final totalSavings = lpjs.fold<double>(
          0,
          (sum, item) {
            final diff = item.totalAnggaran - item.realisasiAnggaran;
            return diff > 0 ? sum + diff : sum;
          },
        );

        return Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'Total Laporan',
                    totalLPJ.toString(),
                    Icons.description_rounded,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    'LPJ Disetujui',
                    approvedLPJ.toString(),
                    Icons.verified_rounded,
                    Colors.indigo,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'Diajukan & Revisi',
                    pendingLPJ.toString(),
                    Icons.pending_actions_rounded,
                    Colors.orange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    'Realisasi Anggaran',
                    NumberFormat.compactCurrency(
                      locale: 'id',
                      symbol: 'Rp ',
                    ).format(totalRealisasi),
                    Icons.payments_rounded,
                    Colors.teal,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildStatCard(
              'Sisa Saldo Efisiensi',
              NumberFormat.compactCurrency(
                locale: 'id',
                symbol: 'Rp ',
              ).format(totalSavings),
              Icons.savings_rounded,
              Colors.green,
              isFullWidth: true,
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color, {
    bool isFullWidth = false,
  }) {
    return Container(
      width: isFullWidth ? double.infinity : null,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: [
          if (isFullWidth) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: AppTextStyles.titleLg.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Icon(icon, color: color, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          label,
                          style: AppTextStyles.labelSm.copyWith(
                            color: const Color(0xFF94A3B8),
                            fontSize: 10,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    value,
                    style: AppTextStyles.titleLg.copyWith(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return const Color(0xFF64748B);
      case 'diajukan':
        return const Color(0xFF2563EB);
      case 'disetujui':
        return const Color(0xFF10B981);
      case 'revisi':
        return const Color(0xFFF59E0B);
      case 'ditolak':
        return const Color(0xFFEF4444);
      case 'selesai':
        return const Color(0xFF6366F1);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'DRAFT';
      case 'diajukan':
        return 'DIAJUKAN';
      case 'disetujui':
        return 'DISETUJUI';
      case 'revisi':
        return 'BUTUH REVISI';
      case 'ditolak':
        return 'DITOLAK';
      case 'selesai':
        return 'SELESAI';
      default:
        return status.toUpperCase();
    }
  }

  Widget _buildEfficiencyRow(OrmawaLPJ report) {
    final diff = report.totalAnggaran - report.realisasiAnggaran;
    final pct = report.totalAnggaran > 0 ? ((diff / report.totalAnggaran) * 100).round() : 0;
    
    final currencyFormatter = NumberFormat.compactCurrency(
      locale: 'id',
      symbol: 'Rp ',
    );

    if (diff > 0) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lightbulb_outline_rounded, color: Colors.green, size: 14),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                'HEMAT $pct% (+${currencyFormatter.format(diff)})',
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: AppTextStyles.labelSm.copyWith(
                  color: Colors.green.shade800,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      );
    } else if (diff < 0) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFFFEBEE),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 14),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                'OVER ${pct.abs()}% (-${currencyFormatter.format(diff.abs())})',
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: AppTextStyles.labelSm.copyWith(
                  color: Colors.red.shade800,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.gps_fixed_rounded, color: Colors.grey, size: 14),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                '100% EFISIEN',
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: AppTextStyles.labelSm.copyWith(
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      );
    }
  }

  void _showDeleteConfirmation(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Hapus Laporan LPJ?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin menghapus data Laporan Pertanggungjawaban ini? Tindakan ini bersifat permanen.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await context.read<OrmawaProvider>().deleteLPJ(id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('LPJ berhasil dihapus dari sistem'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Gagal menghapus LPJ: $e'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Hapus', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }



  Widget _buildLaporanList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final reports =
            provider.lpjs.where((lpj) {
              final matchesSearch = lpj.judul.toLowerCase().contains(_searchQuery);
              final matchesFilter = _filterStatus == 'Semua' ||
                  lpj.status.toLowerCase() == _filterStatus.toLowerCase();
              return matchesSearch && matchesFilter;
            }).toList();

        if (reports.isEmpty) {
          return Center(
            child: Column(
              children: [
                const SizedBox(height: 40),
                Icon(
                  Icons.description_outlined,
                  size: 64,
                  color: Colors.grey.withAlpha(50),
                ),
                const SizedBox(height: 16),
                Text(
                  'Belum ada laporan kegiatan',
                  style: AppTextStyles.labelMd.copyWith(color: Colors.grey),
                ),
              ],
            ),
          );
        }

        return ListView.separated(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: reports.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final report = reports[index];
            final statusColor = _getStatusColor(report.status);

            return _buildLaporanCard(report, statusColor);
          },
        );
      },
    );
  }

  Widget _buildLaporanCard(OrmawaLPJ report, Color color) {
    Widget? tenggatWidget;
    if (report.tenggatLpj != null) {
      final tenggat = report.tenggatLpj!;
      final now = DateTime.now();
      final diffDays = (tenggat.difference(now).inHours / 24).ceil();
      final isLate = diffDays < 0;
      final isUrgent = diffDays >= 0 && diffDays <= 3;
      
      tenggatWidget = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_rounded, 
            size: 13, 
            color: isLate ? Colors.red : (isUrgent ? Colors.orange : const Color(0xFF64748B))
          ),
          const SizedBox(width: 4),
          Text(
            isLate 
                ? 'Telat ${diffDays.abs()} hr' 
                : (isUrgent ? 'Sisa $diffDays hr' : '$diffDays hr lagi'),
            style: AppTextStyles.labelSm.copyWith(
              color: isLate ? Colors.red.shade800 : (isUrgent ? Colors.orange.shade900 : const Color(0xFF64748B)),
              fontWeight: FontWeight.bold,
              fontSize: 10,
            ),
          ),
        ],
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: color.withAlpha(10),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getStatusLabel(report.status),
                  style: AppTextStyles.labelSm.copyWith(
                    color: color,
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                  ),
                ),
              ),
              if (tenggatWidget != null) tenggatWidget,
            ],
          ),
          const SizedBox(height: 12),
          Text(
            report.judul,
            style: AppTextStyles.bodyMd.copyWith(
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
          if (report.proposalTitle != null && report.proposalTitle!.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              report.proposalTitle!,
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF94A3B8),
                fontSize: 11,
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ANGGARAN',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF94A3B8),
                        fontSize: 9,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      NumberFormat.currency(
                        locale: 'id',
                        symbol: 'Rp ',
                        decimalDigits: 0,
                      ).format(report.totalAnggaran),
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'REALISASI',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF94A3B8),
                        fontSize: 9,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      NumberFormat.currency(
                        locale: 'id',
                        symbol: 'Rp ',
                        decimalDigits: 0,
                      ).format(report.realisasiAnggaran),
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: _buildEfficiencyRow(report),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildIconButton(
                    Icons.visibility_outlined,
                    Colors.blue,
                    () => _showLaporanDetail(context, report),
                  ),
                  const SizedBox(width: 8),
                  _buildIconButton(
                    Icons.edit_outlined,
                    Colors.orange,
                    () => _showEditLaporan(context, report),
                  ),
                  const SizedBox(width: 8),
                  _buildIconButton(
                    Icons.delete_outline_rounded,
                    Colors.red,
                    () => _showDeleteConfirmation(context, report.id),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIconButton(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withAlpha(10),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  void _showLaporanDetail(BuildContext context, OrmawaLPJ report) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (context) => DraggableScrollableSheet(
            initialChildSize: 0.7,
            maxChildSize: 0.95,
            minChildSize: 0.4,
            builder:
                (_, scrollController) {
                  final double total = report.totalAnggaran;
                  final double real = report.realisasiAnggaran;
                  final int pct = total > 0 ? ((real / total) * 100).round() : 0;
                  final double ratio = total > 0 ? (real / total).clamp(0.0, 1.0) : 0.0;
                  final diff = total - real;
                  final isOver = real > total;

                  return Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(32),
                      ),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: ListView(
                      controller: scrollController,
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'DETAIL LAPORAN',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          report.judul,
                          style: AppTextStyles.titleLg.copyWith(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        if (report.proposalTitle != null && report.proposalTitle!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            report.proposalTitle!,
                            style: AppTextStyles.labelSm.copyWith(
                              color: const Color(0xFF64748B),
                              fontSize: 12,
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        _buildDetailItem(
                          'Status',
                          _getStatusLabel(report.status),
                          Icons.info_outline_rounded,
                        ),
                        _buildDetailItem(
                          'Anggaran Terencana',
                          NumberFormat.currency(
                            locale: 'id',
                            symbol: 'Rp ',
                            decimalDigits: 0,
                          ).format(report.totalAnggaran),
                          Icons.account_balance_wallet_outlined,
                        ),
                        _buildDetailItem(
                          'Realisasi Anggaran',
                          NumberFormat.currency(
                            locale: 'id',
                            symbol: 'Rp ',
                            decimalDigits: 0,
                          ).format(report.realisasiAnggaran),
                          Icons.payments_outlined,
                        ),
                        const SizedBox(height: 8),
                        
                        // Budget Absorption Card (Visual Progress Bar)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ANALISIS PENYERAPAN ANGGARAN',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: const Color(0xFF64748B),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 9,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Penyerapan Anggaran',
                                    style: AppTextStyles.bodySm.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF334155),
                                    ),
                                  ),
                                  Text(
                                    '$pct%',
                                    style: AppTextStyles.bodySm.copyWith(
                                      fontWeight: FontWeight.w900,
                                      color: isOver ? Colors.red.shade800 : Colors.green.shade800,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: LinearProgressIndicator(
                                  value: ratio,
                                  minHeight: 8,
                                  backgroundColor: const Color(0xFFE2E8F0),
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    isOver ? Colors.red : Colors.green,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Icon(
                                    isOver ? Icons.warning_amber_rounded : Icons.lightbulb_outline_rounded,
                                    size: 14,
                                    color: isOver ? Colors.red : Colors.green,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      isOver 
                                          ? 'BENGKAK ${pct - 100}% DARI PAGU ANGGARAN'
                                          : 'EFISIEN / SISA: ${NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(diff)} (${100 - pct}% Hemat)',
                                      style: AppTextStyles.labelSm.copyWith(
                                        color: isOver ? Colors.red.shade900 : Colors.green.shade900,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 9.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        Text(
                          'CATATAN & EVALUASI',
                          style: AppTextStyles.labelSm.copyWith(
                            color: const Color(0xFF64748B),
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Text(
                            report.catatan.isEmpty
                                ? 'Tidak ada catatan evaluasi.'
                                : report.catatan,
                            style: AppTextStyles.bodyMd.copyWith(
                              color: const Color(0xFF334155),
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                        if (report.fileUrl != null && report.fileUrl!.isNotEmpty) ...[
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                final url = Uri.parse(report.fileUrl!);
                                if (await canLaunchUrl(url)) {
                                  await launchUrl(url, mode: LaunchMode.externalApplication);
                                } else {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Tidak dapat membuka file')),
                                    );
                                  }
                                }
                              },
                              icon: const Icon(
                                Icons.file_download_rounded,
                                color: Colors.white,
                              ),
                              label: const Text(
                                'UNDUH DOKUMEN LPJ',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 20),
                        if (report.status == 'draft' || report.status == 'revisi') ...[
                          Row(
                            children: [
                              Expanded(
                                child: SizedBox(
                                  height: 52,
                                  child: OutlinedButton.icon(
                                    onPressed: () {
                                      Navigator.pop(context);
                                      _showEditLaporan(context, report);
                                    },
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    icon: const Icon(Icons.edit_outlined, color: Colors.orange),
                                    label: const Text(
                                      'EDIT LPJ',
                                      style: TextStyle(
                                        color: Color(0xFF475569),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: SizedBox(
                                  height: 52,
                                  child: ElevatedButton.icon(
                                    onPressed: () async {
                                      Navigator.pop(context);
                                      try {
                                        final provider = context.read<OrmawaProvider>();
                                        final payload = {
                                          'Judul': report.judul,
                                          'RealisasiAnggaran': report.realisasiAnggaran,
                                          'TotalAnggaran': report.totalAnggaran,
                                          'Catatan': report.catatan,
                                          'Status': 'diajukan',
                                        };
                                        await provider.updateLPJ(report.id, payload);
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('LPJ berhasil dikirim ke kampus'),
                                              backgroundColor: Colors.green,
                                            ),
                                          );
                                        }
                                      } catch (e) {
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Gagal mengirim LPJ: $e'),
                                              backgroundColor: Colors.red,
                                            ),
                                          );
                                        }
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      elevation: 4,
                                    ),
                                    icon: const Icon(Icons.send_rounded, color: Colors.white),
                                    label: const Text(
                                      'KIRIM LPJ',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ] else ...[
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.pop(context);
                                _showEditLaporan(context, report);
                              },
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.edit_outlined, color: Colors.orange),
                              label: const Text(
                                'EDIT LAPORAN LPJ',
                                style: TextStyle(
                                  color: Color(0xFF475569),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
          ),
    );
  }

  Widget _buildDetailItem(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF64748B), size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF94A3B8),
                  fontSize: 10,
                ),
              ),
              Text(
                value,
                style: AppTextStyles.bodyMd.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1E293B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showEditLaporan(BuildContext context, OrmawaLPJ report) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OrmawaEditLaporanScreen(report: report),
      ),
    );
  }

  void _showAddLaporan(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const OrmawaCreateLaporanScreen(),
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Filter Status', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _statusOptions.map((option) {
                final isSelected = _filterStatus == option;
                return GestureDetector(
                  onTap: () {
                    setState(() => _filterStatus = option);
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.primary.withAlpha(10),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(option, style: AppTextStyles.labelSm.copyWith(
                      color: isSelected ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.bold,
                    )),
                  ),
                );
              }).toList(),
            ),
            if (_filterStatus != 'Semua')
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: TextButton(
                  onPressed: () {
                    setState(() => _filterStatus = 'Semua');
                    Navigator.pop(context);
                  },
                  child: Text('Reset Filter', style: AppTextStyles.labelSm.copyWith(color: Colors.red)),
                ),
              ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class OrmawaEditLaporanScreen extends StatefulWidget {
  final OrmawaLPJ report;
  const OrmawaEditLaporanScreen({super.key, required this.report});

  @override
  State<OrmawaEditLaporanScreen> createState() =>
      _OrmawaEditLaporanScreenState();
}

class _OrmawaEditLaporanScreenState extends State<OrmawaEditLaporanScreen> {
  late TextEditingController _judulController;
  late TextEditingController _realisasiController;
  late TextEditingController _totalAnggaranController;
  late TextEditingController _catatanController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _judulController = TextEditingController(text: widget.report.judul);
    _realisasiController = TextEditingController(
      text: _formatNumber(widget.report.realisasiAnggaran.toStringAsFixed(0)),
    );
    _totalAnggaranController = TextEditingController(
      text: _formatNumber(widget.report.totalAnggaran.toStringAsFixed(0)),
    );
    _catatanController = TextEditingController(text: widget.report.catatan);

    // Listeners for live Rupiah preview formatting
    _totalAnggaranController.addListener(() => setState(() {}));
    _realisasiController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _judulController.dispose();
    _realisasiController.dispose();
    _totalAnggaranController.dispose();
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _updateLPJ(String status) async {
    if (_judulController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan judul laporan terlebih dahulu')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final provider = context.read<OrmawaProvider>();
      final payload = {
        'Judul': _judulController.text.trim(),
        'RealisasiAnggaran': double.tryParse(_realisasiController.text.replaceAll('.', '')) ?? 0.0,
        'TotalAnggaran': double.tryParse(_totalAnggaranController.text.replaceAll('.', '')) ?? 0.0,
        'Catatan': _catatanController.text,
        'Status': status,
      };

      await provider.updateLPJ(widget.report.id, payload);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('LPJ berhasil diperbarui')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal memperbarui LPJ: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'id',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'EDIT LAPORAN',
            subtitle: 'DOCUMENTATION HUB',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ubah Laporan Pertanggungjawaban',
                    style: AppTextStyles.titleLg.copyWith(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  if (widget.report.proposalTitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Proposal: ${widget.report.proposalTitle}',
                      style: AppTextStyles.labelSm.copyWith(
                        color: const Color(0xFF64748B),
                        fontSize: 12,
                      ),
                    ),
                  ],
                  const SizedBox(height: 32),
                  _buildInputField(
                    'JUDUL LAPORAN LPJ',
                    'Misal: LPJ Seminar Kepemimpinan Mahasiswa 2026...',
                    Icons.title_rounded,
                    controller: _judulController,
                  ),
                  const SizedBox(height: 20),
                  _buildInputField(
                    'TOTAL ANGGARAN (PLANNED)',
                    'Contoh: 25000000',
                    Icons.account_balance_wallet_rounded,
                    controller: _totalAnggaranController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [ThousandsSeparatorInputFormatter()],
                    prefixText: 'Rp ',
                  ),
                  if (_totalAnggaranController.text.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: Text(
                        'Format: ${currencyFormatter.format(double.tryParse(_totalAnggaranController.text.replaceAll('.', '')) ?? 0.0)}',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.blue.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  _buildInputField(
                    'REALISASI ANGGARAN (ACTUAL)',
                    'Contoh: 24500000',
                    Icons.payments_rounded,
                    controller: _realisasiController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [ThousandsSeparatorInputFormatter()],
                    prefixText: 'Rp ',
                  ),
                  if (_realisasiController.text.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: Text(
                        'Format: ${currencyFormatter.format(double.tryParse(_realisasiController.text.replaceAll('.', '')) ?? 0.0)}',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  _buildInputField(
                    'CATATAN & EVALUASI',
                    'Tuliskan evaluasi dan catatan kegiatan...',
                    Icons.rate_review_rounded,
                    controller: _catatanController,
                    maxLines: 5,
                  ),
                  const SizedBox(height: 40),
                  if (_isSubmitting)
                    const Center(child: CircularProgressIndicator())
                  else if (widget.report.status == 'draft' || widget.report.status == 'revisi')
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 56,
                            child: OutlinedButton.icon(
                              onPressed: () => _updateLPJ('draft'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.drafts_rounded, color: Color(0xFF64748B)),
                              label: const Text(
                                'SIMPAN DRAFT',
                                style: TextStyle(
                                  color: Color(0xFF475569),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 56,
                            child: ElevatedButton.icon(
                              onPressed: () => _updateLPJ('diajukan'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 8,
                                shadowColor: AppColors.primary.withAlpha(50),
                              ),
                              icon: const Icon(Icons.send_rounded, color: Colors.white),
                              label: const Text(
                                'KIRIM LAPORAN',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: () => _updateLPJ(widget.report.status),
                        icon: const Icon(
                          Icons.save_rounded,
                          color: Colors.white,
                        ),
                        label: const Text(
                          'SIMPAN PERUBAHAN',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(
    String label,
    String hint,
    IconData icon, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    TextEditingController? controller,
    List<TextInputFormatter>? inputFormatters,
    String? prefixText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment:
                maxLines > 1
                    ? CrossAxisAlignment.start
                    : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 12 : 0),
                child: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  maxLines: maxLines,
                  keyboardType: keyboardType,
                  inputFormatters: inputFormatters,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                    prefixText: prefixText,
                    prefixStyle: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class OrmawaCreateLaporanScreen extends StatefulWidget {
  const OrmawaCreateLaporanScreen({super.key});

  @override
  State<OrmawaCreateLaporanScreen> createState() =>
      _OrmawaCreateLaporanScreenState();
}

class _OrmawaCreateLaporanScreenState extends State<OrmawaCreateLaporanScreen> {
  final _judulController = TextEditingController();
  final _totalAnggaranController = TextEditingController();
  final _realisasiController = TextEditingController();
  final _catatanController = TextEditingController();
  OrmawaProposal? _selectedProposal;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _totalAnggaranController.addListener(() => setState(() {}));
    _realisasiController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _judulController.dispose();
    _totalAnggaranController.dispose();
    _realisasiController.dispose();
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _submitLPJ(String status) async {
    if (_selectedProposal == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih proposal kegiatan terlebih dahulu'),
        ),
      );
      return;
    }

    if (_judulController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan judul laporan terlebih dahulu')),
      );
      return;
    }

    if (_totalAnggaranController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan total anggaran')),
      );
      return;
    }

    if (_realisasiController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan realisasi anggaran')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final provider = context.read<OrmawaProvider>();
      final payload = {
        'ProposalID': int.parse(_selectedProposal!.id),
        'Judul': _judulController.text.trim(),
        'TotalAnggaran': double.tryParse(_totalAnggaranController.text.replaceAll('.', '')) ?? 0.0,
        'RealisasiAnggaran': double.tryParse(_realisasiController.text.replaceAll('.', '')) ?? 0.0,
        'Catatan': _catatanController.text,
        'Status': status,
      };

      await provider.addLPJ(payload);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('LPJ berhasil diajukan')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal mengajukan LPJ: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          const BkuAppBar(
            title: 'BUAT LAPORAN BARU',
            subtitle: 'DOCUMENTATION HUB',
            variant: AppBarVariant.ormawa,
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.note_add_rounded,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'NEW DOCUMENT',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 8,
                                ),
                              ),
                            ),
                            Text(
                              'LAPORAN KEGIATAN',
                              style: AppTextStyles.titleLg.copyWith(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Unggah laporan pertanggungjawaban kegiatan resmi.',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 32),

                  _buildProposalSelector(),
                  if (_selectedProposal != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.withAlpha(10),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blue.withAlpha(20)),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline_rounded,
                            color: Colors.blue,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Anggaran Terencana (Pagu): ${NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(_selectedProposal!.budget)}',
                              style: AppTextStyles.labelSm.copyWith(
                                color: Colors.blue.shade900,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildInputField(
                      'JUDUL LAPORAN LPJ',
                      'Misal: LPJ Seminar Kepemimpinan Mahasiswa 2026...',
                      Icons.title_rounded,
                      controller: _judulController,
                    ),
                    const SizedBox(height: 20),
                    _buildInputField(
                      'TOTAL ANGGARAN (PLANNED)',
                      'Contoh: 25000000',
                      Icons.account_balance_wallet_rounded,
                      controller: _totalAnggaranController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [ThousandsSeparatorInputFormatter()],
                      prefixText: 'Rp ',
                    ),
                    if (_totalAnggaranController.text.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Padding(
                        padding: const EdgeInsets.only(left: 4),
                        child: Text(
                          'Format: ${NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(double.tryParse(_totalAnggaranController.text.replaceAll('.', '')) ?? 0.0)}',
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.blue.shade800,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                  const SizedBox(height: 20),
                  _buildInputField(
                    'REALISASI ANGGARAN (ACTUAL)',
                    'Contoh: 24500000',
                    Icons.payments_rounded,
                    controller: _realisasiController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [ThousandsSeparatorInputFormatter()],
                    prefixText: 'Rp ',
                  ),
                  if (_realisasiController.text.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: Text(
                        'Format: ${NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(double.tryParse(_realisasiController.text.replaceAll('.', '')) ?? 0.0)}',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  _buildInputField(
                    'CATATAN & EVALUASI',
                    'Tuliskan evaluasi dan catatan kegiatan...',
                    Icons.rate_review_rounded,
                    controller: _catatanController,
                    maxLines: 5,
                  ),
                  const SizedBox(height: 40),

                  if (_isSubmitting)
                    const Center(child: CircularProgressIndicator())
                  else
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 56,
                            child: OutlinedButton.icon(
                              onPressed: () => _submitLPJ('draft'),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.drafts_rounded, color: Color(0xFF64748B)),
                              label: const Text(
                                'SIMPAN DRAFT',
                                style: TextStyle(
                                  color: Color(0xFF475569),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 56,
                            child: ElevatedButton.icon(
                              onPressed: () => _submitLPJ('diajukan'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 8,
                                shadowColor: AppColors.primary.withAlpha(50),
                              ),
                              icon: const Icon(Icons.send_rounded, color: Colors.white),
                              label: const Text(
                                'KIRIM LAPORAN',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProposalSelector() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        // Only show approved proposals that might need LPJ
        final availableProposals = provider.proposals;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'PILIH KEGIATAN (PROPOSAL)',
              style: AppTextStyles.labelSm.copyWith(
                color: const Color(0xFF475569),
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<OrmawaProposal>(
                  isExpanded: true,
                  hint: const Text('Pilih proposal...'),
                  value: _selectedProposal,
                  items:
                      availableProposals.map((p) {
                        return DropdownMenuItem(
                          value: p,
                          child: Text(
                            p.title,
                            style: AppTextStyles.labelSm.copyWith(
                              color: Colors.black87,
                            ),
                          ),
                        );
                      }).toList(),
                  onChanged: (val) {
                    setState(() {
                      _selectedProposal = val;
                      if (val != null) {
                        _judulController.text = 'LPJ ${val.title}';
                        _totalAnggaranController.text = _formatNumber(val.budget.toStringAsFixed(0));
                        _realisasiController.text = _formatNumber(val.budget.toStringAsFixed(0));
                      }
                    });
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInputField(
    String label,
    String hint,
    IconData icon, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    TextEditingController? controller,
    List<TextInputFormatter>? inputFormatters,
    String? prefixText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF475569),
            fontWeight: FontWeight.w900,
            fontSize: 10,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment:
                maxLines > 1
                    ? CrossAxisAlignment.start
                    : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 12 : 0),
                child: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  maxLines: maxLines,
                  keyboardType: keyboardType,
                  inputFormatters: inputFormatters,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                    ),
                    prefixText: prefixText,
                    prefixStyle: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

String _formatNumber(String value) {
  String cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
  if (cleaned.isEmpty) return '';
  final buffer = StringBuffer();
  for (int i = 0; i < cleaned.length; i++) {
    if (i > 0 && (cleaned.length - i) % 3 == 0) {
      buffer.write('.');
    }
    buffer.write(cleaned[i]);
  }
  return buffer.toString();
}

class ThousandsSeparatorInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }

    String cleanedText = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanedText.isEmpty) {
      return newValue.copyWith(text: '');
    }

    final buffer = StringBuffer();
    for (int i = 0; i < cleanedText.length; i++) {
      if (i > 0 && (cleanedText.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(cleanedText[i]);
    }

    final newText = buffer.toString();
    return newValue.copyWith(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }
}
