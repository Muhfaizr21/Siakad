import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';

class PsychologistReportsScreen extends StatefulWidget {
  const PsychologistReportsScreen({super.key});

  @override
  State<PsychologistReportsScreen> createState() =>
      _PsychologistReportsScreenState();
}

class _PsychologistReportsScreenState
    extends State<PsychologistReportsScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = ['Semua', 'Bulanan', 'Tahunan', 'Kasus', 'Draft', 'Tinjauan'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadReports();
    });
  }

  List<Map<String, dynamic>> _filtered(List<Map<String, dynamic>> reports) {
    if (_selectedTabIndex == 0) return reports;
    final filter = _tabs[_selectedTabIndex];
    return reports.where((r) {
      final type = r['type']?.toString() ?? '';
      final status = r['status']?.toString() ?? '';
      if (filter == 'Draft') return status == 'Draft';
      if (filter == 'Tinjauan') return status == 'Tinjauan';
      return type.contains(filter);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final filtered = _filtered(provider.reports);

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: _showCreateReportSheet,
            backgroundColor: AppColors.primary,
            icon: const Icon(Icons.add_chart_rounded, color: Colors.white),
            label: const Text('Buat Laporan',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              const BkuAppBar(
                title: 'Laporan Psikolog',
                info: 'Kelola dan unduh dokumen pelaporan',
                variant: AppBarVariant.psychologist,
                showBackButton: true,
                isExpandable: false,
              ),
              SliverToBoxAdapter(
                child: provider.reportsLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 80),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 16),
                          _buildTabs(),
                          const SizedBox(height: 24),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Text(
                              '${filtered.length} Laporan',
                              style: AppTextStyles.titleMd.copyWith(
                                  color: const Color(0xFF0F172A),
                                  fontWeight: FontWeight.w900),
                            ),
                          ),
                          const SizedBox(height: 16),
                          filtered.isEmpty
                              ? _buildEmpty()
                              : _buildReportList(filtered),
                          const SizedBox(height: 100),
                        ],
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTabs() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        physics: const BouncingScrollPhysics(),
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTabIndex = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: isSelected ? AppColors.primary : Colors.grey.withAlpha(50)),
                boxShadow: isSelected
                    ? [BoxShadow(color: AppColors.primary.withAlpha(50), blurRadius: 8, offset: const Offset(0, 4))]
                    : null,
              ),
              alignment: Alignment.center,
              child: Text(_tabs[index],
                  style: AppTextStyles.labelMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : const Color(0xFF64748B))),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmpty() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.description_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Belum ada laporan',
                style: AppTextStyles.bodyMd.copyWith(color: const Color(0xFF94A3B8))),
          ],
        ),
      ),
    );
  }

  Widget _buildReportList(List<Map<String, dynamic>> reports) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: reports.length,
      itemBuilder: (context, index) => _buildReportCard(reports[index]),
    );
  }

  Widget _buildReportCard(Map<String, dynamic> report) {
    final status = report['status']?.toString() ?? '';
    final isDraft = status == 'Draft';
    final isTinjauan = status == 'Tinjauan';
    final title = report['title']?.toString() ?? 'Laporan';
    final date = report['date']?.toString() ?? '-';
    final size = report['size']?.toString() ?? '-';

    Color statusColor = const Color(0xFF10B981);
    if (isDraft) statusColor = Colors.orange;
    if (isTinjauan) statusColor = Colors.blue;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDraft ? Colors.grey.withAlpha(30) : AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isDraft ? Icons.edit_document : Icons.picture_as_pdf_rounded,
              color: isDraft ? Colors.grey : const Color(0xFFEF4444),
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: AppTextStyles.titleMd.copyWith(
                        fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 12, color: Colors.grey[500]),
                    const SizedBox(width: 4),
                    Text(date, style: AppTextStyles.labelSm.copyWith(color: Colors.grey[600], fontSize: 10)),
                    if (size != '-') ...[
                      const SizedBox(width: 12),
                      Icon(Icons.sd_storage_rounded, size: 12, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(size, style: AppTextStyles.labelSm.copyWith(color: Colors.grey[600], fontSize: 10)),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                      color: statusColor.withAlpha(20),
                      borderRadius: BorderRadius.circular(6)),
                  child: Text(status,
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: statusColor)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          IconButton(
            onPressed: () => _downloadReport(report),
            icon: Icon(
              isDraft ? Icons.edit_rounded : Icons.download_rounded,
              color: isDraft ? AppColors.primary : const Color(0xFF10B981),
            ),
            style: IconButton.styleFrom(
              backgroundColor: isDraft
                  ? AppColors.primary.withAlpha(20)
                  : const Color(0xFF10B981).withAlpha(20),
            ),
          ),
        ],
      ),
    );
  }

  void _showCreateReportSheet() {
    String selectedTipe = 'Bulanan';
    DateTime selectedDate = DateTime.now();
    bool isCreating = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(ctx).viewInsets.bottom + 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withAlpha(60),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(Icons.assessment_rounded, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Buat Laporan Baru',
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                        Text('Pilih jenis dan periode laporan',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Tipe Laporan
              Text('Jenis Laporan',
                style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setSheetState(() => selectedTipe = 'Bulanan'),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selectedTipe == 'Bulanan' ? AppColors.primary : Colors.grey.withAlpha(10),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: selectedTipe == 'Bulanan' ? AppColors.primary : Colors.grey.withAlpha(30)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.calendar_month_rounded,
                              color: selectedTipe == 'Bulanan' ? Colors.white : Colors.grey, size: 18),
                            const SizedBox(width: 8),
                            Text('Bulanan',
                              style: TextStyle(
                                color: selectedTipe == 'Bulanan' ? Colors.white : Colors.grey,
                                fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setSheetState(() => selectedTipe = 'Tahunan'),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selectedTipe == 'Tahunan' ? AppColors.primary : Colors.grey.withAlpha(10),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: selectedTipe == 'Tahunan' ? AppColors.primary : Colors.grey.withAlpha(30)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.calendar_today_rounded,
                              color: selectedTipe == 'Tahunan' ? Colors.white : Colors.grey, size: 18),
                            const SizedBox(width: 8),
                            Text('Tahunan',
                              style: TextStyle(
                                color: selectedTipe == 'Tahunan' ? Colors.white : Colors.grey,
                                fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Periode
              Text('Periode',
                style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () async {
                  if (selectedTipe == 'Bulanan') {
                    final picked = await _showMonthPickerDialog(selectedDate);
                    if (picked != null) setSheetState(() => selectedDate = picked);
                  } else {
                    final picked = await _showYearPickerDialog(selectedDate);
                    if (picked != null) setSheetState(() => selectedDate = picked);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.grey.withAlpha(10),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.withAlpha(30)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.event_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        selectedTipe == 'Bulanan'
                          ? '${_monthNames[selectedDate.month - 1]} ${selectedDate.year}'
                          : '${selectedDate.year}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                      ),
                      const Spacer(),
                      Icon(Icons.chevron_right_rounded, color: Colors.grey.withAlpha(100)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: isCreating
                        ? null
                        : () async {
                          setSheetState(() => isCreating = true);
                          final periode = selectedTipe == 'Bulanan'
                            ? '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}'
                            : '${selectedDate.year}';
                          final success = await Provider.of<CounselingProvider>(context, listen: false)
                            .createReport(tipe: selectedTipe, periode: periode);
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(success != null ? 'Laporan berhasil dibuat!' : 'Gagal membuat laporan'),
                                backgroundColor: success != null ? Colors.green : Colors.red,
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            );
                          }
                        },
                      icon: isCreating
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.picture_as_pdf_rounded, size: 18),
                      label: Text(isCreating ? 'Membuat...' : 'Buat Laporan PDF',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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

  Future<DateTime?> _showMonthPickerDialog(DateTime initialDate) async {
    int selectedYear = initialDate.year;
    int selectedMonth = initialDate.month;

    return showDialog<DateTime>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Pilih Bulan'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<int>(
                value: selectedYear,
                decoration: InputDecoration(
                  labelText: 'Tahun',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: List.generate(10, (i) => DateTime.now().year - i)
                  .map((y) => DropdownMenuItem(value: y, child: Text('$y')))
                  .toList(),
                onChanged: (v) => setDialogState(() => selectedYear = v ?? selectedYear),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                value: selectedMonth,
                decoration: InputDecoration(
                  labelText: 'Bulan',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: List.generate(12, (i) => i + 1)
                  .map((m) => DropdownMenuItem(value: m, child: Text(_monthNames[m - 1])))
                  .toList(),
                onChanged: (v) => setDialogState(() => selectedMonth = v ?? selectedMonth),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, DateTime(selectedYear, selectedMonth)),
              child: const Text('Pilih'),
            ),
          ],
        ),
      ),
    );
  }

  Future<DateTime?> _showYearPickerDialog(DateTime initialDate) async {
    int selectedYear = initialDate.year;

    return showDialog<DateTime>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Pilih Tahun'),
          content: DropdownButtonFormField<int>(
            value: selectedYear,
            decoration: InputDecoration(
              labelText: 'Tahun',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: List.generate(10, (i) => DateTime.now().year - i)
              .map((y) => DropdownMenuItem(value: y, child: Text('$y')))
              .toList(),
            onChanged: (v) => setDialogState(() => selectedYear = v ?? selectedYear),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, DateTime(selectedYear)),
              child: const Text('Pilih'),
            ),
          ],
        ),
      ),
    );
  }

  void _downloadReport(Map<String, dynamic> report) async {
    final reportId = report['id']?.toString() ?? '';
    if (reportId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ID laporan tidak valid')),
      );
      return;
    }

    final provider = Provider.of<CounselingProvider>(context, listen: false);
    final url = await provider.downloadReport(reportId);

    if (url != null && mounted) {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Gagal membuka link download'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    }
  }

  static const List<String> _monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
}
