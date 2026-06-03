import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
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
      body: CustomScrollView(
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
                  _buildHeaderActions(),
                  const SizedBox(height: 20),
                  _buildLaporanList(),
                ],
              ),
            ),
          ),
        ],
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
        final pendingLPJ = lpjs.where((e) => e.status != 'disetujui').length;
        final totalAnggaran = lpjs.fold<double>(
          0,
          (sum, item) => sum + item.totalAnggaran,
        );
        final disetujuiLPJ = lpjs.where((e) => e.status == 'disetujui').length;

        return GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.6,
          children: [
            _buildStatCard(
              'Total Laporan',
              totalLPJ.toString(),
              Icons.description_rounded,
              Colors.blue,
            ),
            _buildStatCard(
              'Belum Selesai',
              pendingLPJ.toString(),
              Icons.pending_actions_rounded,
              Colors.orange,
            ),
            _buildStatCard(
              'Anggaran Total',
              NumberFormat.compactCurrency(
                locale: 'id',
                symbol: 'Rp ',
              ).format(totalAnggaran),
              Icons.account_balance_wallet_rounded,
              Colors.green,
            ),
            _buildStatCard(
              'Telah Disetujui',
              disetujuiLPJ.toString(),
              Icons.verified_rounded,
              Colors.indigo,
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
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 8),
              Text(
                label,
                style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF94A3B8),
                  fontSize: 10,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderActions() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'DAFTAR LPJ KEGIATAN',
              style: AppTextStyles.labelMd.copyWith(
                color: const Color(0xFF475569),
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.filter_alt_rounded,
                    size: 14,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Filter',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.search_rounded,
                color: AppColors.primary,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari judul laporan kegiatan...',
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
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

  Widget _buildLaporanList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final reports =
            provider.lpjs.where((lpj) {
              return lpj.judul.toLowerCase().contains(_searchQuery);
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
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: reports.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final report = reports[index];
            Color statusColor = Colors.grey;
            if (report.status == 'disetujui') {
              statusColor = Colors.green;
            } else if (report.status == 'diajukan')
              statusColor = Colors.orange;
            else if (report.status == 'revisi')
              statusColor = Colors.red;

            return _buildLaporanCard(report, statusColor);
          },
        );
      },
    );
  }

  Widget _buildLaporanCard(OrmawaLPJ report, Color color) {
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
                  report.status.toUpperCase(),
                  style: AppTextStyles.labelSm.copyWith(
                    color: color,
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                  ),
                ),
              ),
              const Icon(Icons.more_vert_rounded, color: Color(0xFF94A3B8)),
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
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
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
              _buildIconButton(Icons.delete_outline_rounded, Colors.red, () {
                // Delete not supported by backend yet for LPJ record
              }),
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
            initialChildSize: 0.6,
            maxChildSize: 0.9,
            minChildSize: 0.4,
            builder:
                (_, scrollController) => Container(
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
                      const SizedBox(height: 24),
                      _buildDetailItem(
                        'Status',
                        report.status.toUpperCase(),
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
                      const SizedBox(height: 16),
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
                      if (report.fileUrl != null && report.fileUrl!.isNotEmpty)
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              // TODO: Open URL
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
                  ),
                ),
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
}

class OrmawaEditLaporanScreen extends StatefulWidget {
  final OrmawaLPJ report;
  const OrmawaEditLaporanScreen({super.key, required this.report});

  @override
  State<OrmawaEditLaporanScreen> createState() =>
      _OrmawaEditLaporanScreenState();
}

class _OrmawaEditLaporanScreenState extends State<OrmawaEditLaporanScreen> {
  late TextEditingController _realisasiController;
  late TextEditingController _totalAnggaranController;
  late TextEditingController _catatanController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _realisasiController = TextEditingController(
      text: widget.report.realisasiAnggaran.toStringAsFixed(0),
    );
    _totalAnggaranController = TextEditingController(
      text: widget.report.totalAnggaran.toStringAsFixed(0),
    );
    _catatanController = TextEditingController(text: widget.report.catatan);
  }

  @override
  void dispose() {
    _realisasiController.dispose();
    _totalAnggaranController.dispose();
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _updateLPJ() async {
    setState(() => _isSubmitting = true);

    try {
      final provider = context.read<OrmawaProvider>();
      final payload = {
        'RealisasiAnggaran': double.tryParse(_realisasiController.text) ?? 0.0,
        'TotalAnggaran': double.tryParse(_totalAnggaranController.text) ?? 0.0,
        'Catatan': _catatanController.text,
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
                    widget.report.judul,
                    style: AppTextStyles.titleLg.copyWith(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildInputField(
                    'TOTAL ANGGARAN (PLANNED)',
                    'Contoh: 25000000',
                    Icons.account_balance_wallet_rounded,
                    controller: _totalAnggaranController,
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 20),
                  _buildInputField(
                    'REALISASI ANGGARAN (ACTUAL)',
                    'Contoh: 24500000',
                    Icons.payments_rounded,
                    controller: _realisasiController,
                    keyboardType: TextInputType.number,
                  ),
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
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _updateLPJ,
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
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
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
  final _realisasiController = TextEditingController();
  final _catatanController = TextEditingController();
  OrmawaProposal? _selectedProposal;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _realisasiController.dispose();
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _submitLPJ() async {
    if (_selectedProposal == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih proposal kegiatan terlebih dahulu'),
        ),
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
        'RealisasiAnggaran': double.tryParse(_realisasiController.text) ?? 0.0,
        'Catatan': _catatanController.text,
        'Status': 'diajukan',
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
                          Text(
                            'Anggaran Terencana: ${NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(_selectedProposal!.budget)}',
                            style: AppTextStyles.labelSm.copyWith(
                              color: Colors.blue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  _buildInputField(
                    'REALISASI ANGGARAN',
                    'Contoh: 24500000',
                    Icons.payments_rounded,
                    controller: _realisasiController,
                    keyboardType: TextInputType.number,
                  ),
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
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _submitLPJ,
                        icon: const Icon(
                          Icons.check_circle_rounded,
                          color: Colors.white,
                        ),
                        label: const Text(
                          'SIMPAN & AJUKAN LPJ',
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
                          shadowColor: AppColors.primary.withAlpha(50),
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
                    setState(() => _selectedProposal = val);
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
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
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
