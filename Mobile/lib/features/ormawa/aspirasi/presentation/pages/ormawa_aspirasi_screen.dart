import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
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
    Future.microtask(() => context.read<OrmawaProvider>().getAspirations());
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
      body: CustomScrollView(
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
                  _buildHeaderActions(),
                  const SizedBox(height: 20),
                  _buildAspirasiList(),
                ],
              ),
            ),
          ),
        ],
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

        return GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.1,
          children: [
            _buildStatCard('Masuk', countIncoming.toString(), Icons.inbox_rounded, Colors.blue),
            _buildStatCard('Ditanggapi', countProcessed.toString(), Icons.sync_rounded, Colors.green),
            _buildStatCard('Diabaikan', countIgnored.toString(), Icons.do_disturb_on_rounded, Colors.red),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: AppTextStyles.titleLg.copyWith(fontSize: 18, fontWeight: FontWeight.w900)),
          Text(label, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 9)),
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
              'REKAPITULASI ASPIRASI',
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
                  const Icon(Icons.sort_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTap: () => _showSortFilterSheet(),
                    child: Text('Urutkan', style: AppTextStyles.labelSm.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
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
              const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari topik aspirasi...',
                    hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
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
    String dateStr = 'Beberapa saat lalu';
    if (item.createdAt != null) {
      dateStr = DateFormat('dd MMM yyyy').format(item.createdAt!);
    }

    return GestureDetector(
      onTap: () => _showAspirasiDetail(item, color),
      child: Container(
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
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(8)),
                  child: Text(item.status.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900, fontSize: 10)),
                ),
                Text(dateStr, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontSize: 10)),
              ],
            ),
            const SizedBox(height: 12),
            Text(item.judul, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w900, fontSize: 16)),
            const SizedBox(height: 8),
            Text(
              item.isi,
              style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF64748B), height: 1.4),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 10,
                  backgroundColor: AppColors.primary.withAlpha(10),
                  child: const Icon(Icons.person_rounded, size: 12, color: AppColors.primary),
                ),
                const SizedBox(width: 8),
                Text(item.mahasiswaName, style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
                const Spacer(),
                const Icon(Icons.chevron_right_rounded, color: Color(0xFFE2E8F0)),
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
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: color.withAlpha(10), borderRadius: BorderRadius.circular(10)),
                    child: Text(item.status.toUpperCase(), style: AppTextStyles.labelSm.copyWith(color: color, fontWeight: FontWeight.w900)),
                  ),
                  Text(
                    item.createdAt != null ? DateFormat('dd MMM yyyy').format(item.createdAt!) : '',
                    style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(item.judul, style: AppTextStyles.titleLg.copyWith(fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.person_outline_rounded, size: 16, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 8),
                  Text('Dari: ${item.mahasiswaName}', style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
                ],
              ),
              const SizedBox(height: 32),
              Text('ISI ASPIRASI', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
              const SizedBox(height: 16),
              Expanded(
                child: SingleChildScrollView(
                  child: Text(
                    item.isi,
                    style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF475569), height: 1.6, fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text('TANGGAPAN ADMIN', style: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8), fontWeight: FontWeight.w900, letterSpacing: 1.5)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: TextField(
                  controller: responseController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Tulis tanggapan atau solusi...',
                    hintStyle: AppTextStyles.labelSm.copyWith(color: const Color(0xFF94A3B8)),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (isSubmitting)
                const Center(child: CircularProgressIndicator())
              else
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 56,
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
                            side: const BorderSide(color: Colors.red),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: const Text('Abaikan', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: SizedBox(
                        height: 56,
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
                            elevation: 8,
                            shadowColor: AppColors.primary.withAlpha(50),
                          ),
                          child: const Text('Kirim Tanggapan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
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
