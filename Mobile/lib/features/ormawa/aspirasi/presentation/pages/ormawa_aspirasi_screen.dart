import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_aspiration.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class OrmawaAspirasiScreen extends StatefulWidget {
  const OrmawaAspirasiScreen({super.key});

  @override
  State<OrmawaAspirasiScreen> createState() => _OrmawaAspirasiScreenState();
}

class _OrmawaAspirasiScreenState extends State<OrmawaAspirasiScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _sortOrder = 'terbaru';
  String _filterStatus = 'Semua';

  final List<String> _sortOptions = ['Terbaru', 'Terlama'];
  final List<String> _filterOptions = ['Semua', 'Menunggu', 'Ditanggapi', 'Diabaikan'];

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

  String _normalizeStatus(String status) {
    final s = status.toLowerCase();
    if (s.contains('ditanggapi') || s.contains('processed')) return 'Ditanggapi';
    if (s.contains('diabaikan') || s.contains('ignored')) return 'Diabaikan';
    return 'Menunggu';
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
            title: 'ASPIRASI ORGANISASI',
            subtitle: 'PUSAT ASPIRASI',
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
                    title: 'REKAPITULASI ASPIRASI',
                    searchHint: 'Cari topik aspirasi...',
                    searchController: _searchController,
                    onRefresh: () => context.read<OrmawaProvider>().refreshData(),
                    onFilterTap: () => _showSortFilterSheet(),
                  ),
                  const SizedBox(height: 20),
                  _buildAspirasiList(),
                ],
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildSummaryGrid() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final aspirations = provider.aspirations;
        final countIncoming = aspirations.where((e) => e.status == 'pending').length;
        final countProcessed = aspirations.where((e) => e.status == 'ditanggapi').length;
        final countIgnored = aspirations.where((e) => e.status == 'diabaikan').length;

        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.neutral200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatItem('Masuk', countIncoming.toString(), Icons.inbox_rounded, Colors.blue),
              Container(width: 1, height: 50, color: AppColors.neutral200),
              _buildStatItem('Ditanggapi', countProcessed.toString(), Icons.check_circle_rounded, Colors.green),
              Container(width: 1, height: 50, color: AppColors.neutral200),
              _buildStatItem('Diabaikan', countIgnored.toString(), Icons.cancel_rounded, Colors.red),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, MaterialColor color) {
    return Expanded(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 12),
          Text(value, style: AppTextStyles.headlineMd.copyWith(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.neutral900)),
          const SizedBox(height: 4),
          Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500, fontWeight: FontWeight.bold, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildAspirasiList() {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final filteredList = provider.aspirations.where((item) {
          final matchesSearch = item.judul.toLowerCase().contains(_searchQuery) || item.isi.toLowerCase().contains(_searchQuery);
          final itemStatus = _normalizeStatus(item.status);
          final matchesFilter = _filterStatus == 'Semua' || itemStatus == _filterStatus;
          return matchesSearch && matchesFilter;
        }).toList();

        // Apply sorting
        filteredList.sort((a, b) {
          final aDate = a.createdAt ?? DateTime(2000);
          final bDate = b.createdAt ?? DateTime(2000);
          return _sortOrder == 'terbaru' ? bDate.compareTo(aDate) : aDate.compareTo(bDate);
        });

        if (filteredList.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.speaker_notes_off_rounded, size: 48, color: Colors.grey.withAlpha(50)),
                  const SizedBox(height: 16),
                  Text('Tidak ada aspirasi ditemukan', style: AppTextStyles.labelMd.copyWith(color: Colors.grey)),
                ],
              ),
            ),
          );
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filteredList.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = filteredList[index];
            Color statusColor = Colors.blue;
            if (item.status == 'ditanggapi') statusColor = Colors.green;
            if (item.status == 'diabaikan') statusColor = Colors.red;

            return _buildAspirasiCard(item, statusColor);
          },
        );
      },
    );
  }

  Widget _buildAspirasiCard(OrmawaAspiration item, Color color) {
    String dateStr = 'Baru saja';
    if (item.createdAt != null) {
      dateStr = DateFormat('dd MMM yyyy').format(item.createdAt!);
    }

    return GestureDetector(
      onTap: () => _showAspirasiDetail(item, color),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.neutral200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text(item.status.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.neutral100, borderRadius: BorderRadius.circular(8)),
                      child: Text(item.kategori, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral600, fontWeight: FontWeight.bold, fontSize: 10)),
                    ),
                  ],
                ),
                Text(dateStr, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral400, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Text(item.judul, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.neutral900)),
            const SizedBox(height: 8),
            Text(
              item.isi,
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral600, height: 1.5),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    image: item.mahasiswaFoto != null && item.mahasiswaFoto!.isNotEmpty
                        ? DecorationImage(image: NetworkImage(item.mahasiswaFoto!), fit: BoxFit.cover)
                        : null,
                  ),
                  child: item.mahasiswaFoto == null || item.mahasiswaFoto!.isEmpty
                      ? const Icon(Icons.person_rounded, size: 16, color: AppColors.primary)
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.mahasiswaName, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral800, fontWeight: FontWeight.bold)),
                      if (item.mahasiswaNim.isNotEmpty)
                        Text(item.mahasiswaNim, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500, fontSize: 10)),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.neutral300, size: 14),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAspirasiDetail(OrmawaAspiration item, Color color) {
    final TextEditingController responseController = TextEditingController(text: item.tanggapan);
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.9,
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // HEADER
              Container(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, Color(0xFF0F3460)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 24),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                          ),
                          child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text('INCIDENT AUDIT', style: AppTextStyles.labelSm.copyWith(color: Colors.blue.shade200, fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 10)),
                                  const SizedBox(width: 8),
                                  Container(width: 4, height: 4, decoration: BoxDecoration(color: Colors.blue.shade200.withValues(alpha: 0.5), shape: BoxShape.circle)),
                                  const SizedBox(width: 8),
                                  Text('#ASP-${item.id.padLeft(4, '0')}', style: AppTextStyles.labelSm.copyWith(color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.bold, fontFamily: 'monospace', fontSize: 10)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(item.judul, style: AppTextStyles.titleLg.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20), maxLines: 2, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.person_rounded, color: Colors.white70, size: 14),
                            const SizedBox(width: 6),
                            Text('Oleh: ', style: AppTextStyles.labelSm.copyWith(color: Colors.blue.shade100, fontSize: 11)),
                            Text(item.mahasiswaName, style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.2),
                            border: Border.all(color: color.withValues(alpha: 0.3)),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(color: color.withValues(alpha: 0.1), blurRadius: 8)
                            ]
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                              ),
                              const SizedBox(width: 6),
                              Text(item.status.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color.withValues(alpha: 0.8), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // BODY
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // IDENTITAS PELAPOR
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.neutral200),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.neutral200, width: 4),
                                image: item.mahasiswaFoto != null && item.mahasiswaFoto!.isNotEmpty
                                    ? DecorationImage(image: NetworkImage(item.mahasiswaFoto!), fit: BoxFit.cover)
                                    : null,
                                color: AppColors.neutral100,
                              ),
                              child: item.mahasiswaFoto == null || item.mahasiswaFoto!.isEmpty
                                  ? const Icon(Icons.person_rounded, size: 32, color: AppColors.neutral400)
                                  : null,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('IDENTITAS PELAPOR', style: AppTextStyles.labelSm.copyWith(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.neutral500, letterSpacing: 1.5)),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.neutral200), borderRadius: BorderRadius.circular(6)),
                                        child: Text('VERIFIED', style: AppTextStyles.labelSm.copyWith(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.neutral500)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(item.mahasiswaName, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.neutral900)),
                                  const SizedBox(height: 4),
                                  if (item.mahasiswaNim.isNotEmpty)
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(color: AppColors.neutral50, border: Border.all(color: AppColors.neutral200), borderRadius: BorderRadius.circular(4)),
                                          child: Text(item.mahasiswaNim, style: AppTextStyles.labelSm.copyWith(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.neutral700)),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // SUBSTANSI ASPIRASI
                      Row(
                        children: [
                          const Icon(Icons.article_rounded, size: 20, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text('SUBSTANSI ASPIRASI', style: AppTextStyles.labelSm.copyWith(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.neutral500, letterSpacing: 1.5)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.neutral200),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              top: -10,
                              right: -10,
                              child: Icon(Icons.format_quote_rounded, size: 80, color: AppColors.primary.withValues(alpha: 0.05)),
                            ),
                            Text(
                              item.isi,
                              style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral800, height: 1.6, fontSize: 14, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),

                      // PANEL RESOLUSI
                      Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(color: AppColors.neutral200, borderRadius: BorderRadius.circular(12)),
                            child: const Icon(Icons.gavel_rounded, color: AppColors.neutral600, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Panel Resolusi', style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, color: AppColors.neutral900)),
                              Text('TINDAKAN ADMIN', style: AppTextStyles.labelSm.copyWith(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.neutral500, letterSpacing: 1.5)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text('TANGGAPAN RESMI', style: AppTextStyles.labelSm.copyWith(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.neutral500, letterSpacing: 1.5)),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.neutral200),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: TextField(
                          controller: responseController,
                          maxLines: 4,
                          style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral800, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Tuliskan respon resmi, klarifikasi, atau solusi...',
                            hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),

              // FOOTER ACTIONS
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  border: const Border(top: BorderSide(color: AppColors.neutral200)),
                ),
                child: isSubmitting
                    ? const Center(child: CircularProgressIndicator())
                    : Row(
                        children: [
                          Expanded(
                            child: SizedBox(
                              height: 52,
                              child: OutlinedButton(
                                onPressed: () async {
                                  setModalState(() => isSubmitting = true);
                                  try {
                                    await context.read<OrmawaProvider>().respondToAspiration(item.id, {
                                      'Status': 'diabaikan',
                                      'Tanggapan': responseController.text,
                                    });
                                    if (context.mounted) Navigator.pop(context);
                                  } catch (e) {
                                    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                                  } finally {
                                    setModalState(() => isSubmitting = false);
                                  }
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: AppColors.neutral300),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  backgroundColor: Colors.white,
                                ),
                                child: Text('ABAIKAN', style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral600, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 52,
                              child: ElevatedButton(
                                onPressed: () async {
                                  setModalState(() => isSubmitting = true);
                                  try {
                                    await context.read<OrmawaProvider>().respondToAspiration(item.id, {
                                      'Status': 'ditanggapi',
                                      'Tanggapan': responseController.text,
                                    });
                                    if (context.mounted) Navigator.pop(context);
                                  } catch (e) {
                                    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                                  } finally {
                                    setModalState(() => isSubmitting = false);
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  elevation: 4,
                                  shadowColor: AppColors.primary.withValues(alpha: 0.3),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                                    const SizedBox(width: 8),
                                    Text('KIRIM TANGGAPAN', style: AppTextStyles.labelSm.copyWith(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSortFilterSheet() {
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
            Text('Urutkan & Filter', style: AppTextStyles.titleLg.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Text('Urutkan', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _sortOptions.map((option) {
                final isSelected = _sortOrder == option.toLowerCase().replaceAll('ter', '');
                return GestureDetector(
                  onTap: () {
                    setState(() => _sortOrder = option.toLowerCase().replaceAll('ter', ''));
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
            const SizedBox(height: 20),
            Text('Filter Status', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _filterOptions.map((option) {
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
            if (_filterStatus != 'Semua' || _sortOrder != 'terbaru')
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      _sortOrder = 'terbaru';
                      _filterStatus = 'Semua';
                    });
                    Navigator.pop(context);
                  },
                  child: Text('Reset', style: AppTextStyles.labelSm.copyWith(color: Colors.red)),
                ),
              ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
