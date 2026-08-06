import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/session_note_screen.dart';

class PatientListScreen extends StatefulWidget {
  final bool showBackButton;
  const PatientListScreen({super.key, this.showBackButton = true});

  @override
  State<PatientListScreen> createState() => _PatientListScreenState();
}

class _PatientListScreenState extends State<PatientListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedFilter = 'Semua';
  final List<String> _filters = ['Semua', 'Aktif', 'Selesai', 'Baru'];

  String _sortOrder = 'Terbaru';
  String? _selectedProdi;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadPatients();
    });
  }

  List<Map<String, dynamic>> _filteredPatients(
    List<Map<String, dynamic>> patients,
  ) {
    List<Map<String, dynamic>> result = List.from(patients);

    // Filter Status
    if (_selectedFilter != 'Semua') {
      result = result.where((p) => p['status'] == _selectedFilter).toList();
    }

    // Filter Search
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      result =
          result.where((p) {
            final name = (p['name']?.toString() ?? '').toLowerCase();
            final nim = (p['nim']?.toString() ?? '').toLowerCase();
            return name.contains(q) || nim.contains(q);
          }).toList();
    }

    // Filter Prodi
    if (_selectedProdi != null && _selectedProdi!.isNotEmpty) {
      result =
          result
              .where((p) => p['faculty']?.toString() == _selectedProdi)
              .toList();
    }

    // Sort
    result.sort((a, b) {
      final idA = int.tryParse(a['id']?.toString() ?? '0') ?? 0;
      final idB = int.tryParse(b['id']?.toString() ?? '0') ?? 0;
      return _sortOrder == 'Terbaru' ? idB.compareTo(idA) : idA.compareTo(idB);
    });

    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CounselingProvider>(
      builder: (context, provider, _) {
        final patients = provider.patients;
        final filtered = _filteredPatients(patients);

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              BkuAppBar(
                title: 'Daftar Pasien',
                info: 'Rekam medis & riwayat konseling mahasiswa',
                variant: AppBarVariant.psychologist,
                showBackButton: widget.showBackButton,
                isExpandable: false,
                showNotification: true,
              ),
              SliverToBoxAdapter(
                child:
                    provider.patientsLoading
                        ? const Padding(
                          padding: EdgeInsets.symmetric(vertical: 80),
                          child: Center(child: CircularProgressIndicator()),
                        )
                        : provider.patientsError != null
                        ? _buildError(provider.patientsError!, provider)
                        : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 16),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: _buildSummaryCard(filtered),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: _buildSearchAndFilter(patients),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: Row(
                                children: [
                                  _buildSectionTitle('Daftar Mahasiswa'),
                                  const Spacer(),
                                  _buildExportButton(provider),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: _buildFilterChips(),
                            ),
                            const SizedBox(height: 12),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              child: _buildPatientList(filtered, provider),
                            ),
                            const SizedBox(height: 120),
                          ],
                        ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildExportButton(CounselingProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withAlpha(50)),
      ),
      child: IconButton(
        onPressed: () async {
          final url = await provider.exportPatientsRecapPDF();
          if (url != null && mounted) {
            final uri = Uri.parse(url);
            try {
              await launchUrl(uri, mode: LaunchMode.externalApplication);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Gagal mengunduh PDF rekap pasien'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          } else {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Gagal mendapatkan tautan unduhan'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
        icon: const Icon(
          Icons.download_rounded,
          color: AppColors.primary,
          size: 20,
        ),
        tooltip: 'Ekspor PDF Rekap Pasien',
      ),
    );
  }

  Widget _buildError(String message, CounselingProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.error_outline_rounded, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              message,
              style: AppTextStyles.bodyMd.copyWith(
                color: const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: provider.loadPatients,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilter(List<Map<String, dynamic>> allPatients) {
    final prodis =
        allPatients
            .map((p) => p['faculty']?.toString() ?? '')
            .where((f) => f.isNotEmpty)
            .toSet()
            .toList();
    prodis.sort();

    return Column(
      children: [
        TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          decoration: InputDecoration(
            hintText: 'Cari nama mahasiswa atau NIM...',
            hintStyle: TextStyle(
              color: Colors.grey.withAlpha(150),
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
            prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
            suffixIcon:
                _searchQuery.isNotEmpty
                    ? IconButton(
                      icon: const Icon(
                        Icons.cancel_rounded,
                        size: 18,
                        color: Color(0xFF94A3B8),
                      ),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                    : null,
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              flex: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.withAlpha(40)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _sortOrder,
                    icon: const Icon(
                      Icons.sort_rounded,
                      color: AppColors.primary,
                      size: 18,
                    ),
                    style: AppTextStyles.labelMd.copyWith(
                      color: const Color(0xFF1E293B),
                      fontWeight: FontWeight.w800,
                    ),
                    items:
                        ['Terbaru', 'Terlama'].map((e) {
                          return DropdownMenuItem(value: e, child: Text(e));
                        }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _sortOrder = val);
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.withAlpha(40)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String?>(
                    isExpanded: true,
                    value: _selectedProdi,
                    hint: Text(
                      'Semua Prodi',
                      style: AppTextStyles.labelMd.copyWith(
                        color: const Color(0xFF1E293B),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    icon: const Icon(
                      Icons.filter_list_rounded,
                      color: AppColors.primary,
                      size: 18,
                    ),
                    style: AppTextStyles.labelMd.copyWith(
                      color: const Color(0xFF1E293B),
                      fontWeight: FontWeight.w800,
                    ),
                    items: [
                      DropdownMenuItem<String?>(
                        value: null,
                        child: const Text('Semua Prodi'),
                      ),
                      ...prodis.map((e) {
                        return DropdownMenuItem<String?>(
                          value: e,
                          child: Text(e, overflow: TextOverflow.ellipsis),
                        );
                      }),
                    ],
                    onChanged: (val) {
                      setState(() => _selectedProdi = val);
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(List<Map<String, dynamic>> filteredPatients) {
    final total = filteredPatients.length;
    final aktif = filteredPatients.where((p) => p['status'] == 'Aktif').length;
    final baru = filteredPatients.where((p) => p['status'] == 'Baru').length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.analytics_rounded,
                  size: 16,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Ringkasan Analitik',
                style: AppTextStyles.titleSm.copyWith(
                  color: const Color(0xFF1E293B),
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildScrollableStatCard(
                'Total',
                '$total',
                AppColors.primary,
                AppColors.primary.withAlpha(20),
                Icons.groups_rounded,
                true,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildScrollableStatCard(
                'Aktif',
                '$aktif',
                const Color(0xFF10B981),
                const Color(0xFFECFDF5),
                Icons.autorenew_rounded,
                false,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildScrollableStatCard(
                'Baru',
                '$baru',
                const Color(0xFFF59E0B),
                const Color(0xFFFFFBEB),
                Icons.fiber_new_rounded,
                false,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildScrollableStatCard(
    String label,
    String value,
    Color primaryColor,
    Color bgColor,
    IconData icon,
    bool isPrimary,
  ) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isPrimary ? primaryColor : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: isPrimary ? null : Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [
          BoxShadow(
            color:
                isPrimary
                    ? primaryColor.withAlpha(80)
                    : Colors.black.withAlpha(4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isPrimary ? Colors.white.withAlpha(40) : bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isPrimary ? Colors.white : primaryColor,
              size: 20,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.titleLg.copyWith(
              color: isPrimary ? Colors.white : const Color(0xFF1E293B),
              fontWeight: FontWeight.w900,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color:
                  isPrimary
                      ? Colors.white.withAlpha(200)
                      : const Color(0xFF64748B),
              fontWeight: FontWeight.w700,
              fontSize: 9,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 42,
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
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color:
                      isSelected
                          ? Colors.transparent
                          : Colors.grey.withAlpha(30),
                ),
                boxShadow:
                    isSelected
                        ? [
                          BoxShadow(
                            color: AppColors.primary.withAlpha(40),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ]
                        : null,
              ),
              child: Center(
                child: Text(
                  filter,
                  style: AppTextStyles.labelSm.copyWith(
                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPatientList(
    List<Map<String, dynamic>> list,
    CounselingProvider provider,
  ) {
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 60),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.blue.withAlpha(15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.search_off_rounded,
                  size: 64,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Tidak Ada Data',
                style: AppTextStyles.titleLg.copyWith(
                  color: const Color(0xFF1E293B),
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _searchQuery.isNotEmpty || _selectedProdi != null
                    ? 'Tidak ada mahasiswa yang cocok dengan filter.'
                    : 'Belum ada data pasien saat ini.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMd.copyWith(
                  color: const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) => _buildPatientCard(list[index], provider),
    );
  }

  Widget _buildPatientCard(
    Map<String, dynamic> p,
    CounselingProvider provider,
  ) {
    final status = p['status']?.toString() ?? 'Baru';
    final statusColor =
        status == 'Aktif'
            ? Colors.green
            : status == 'Baru'
            ? Colors.orange
            : status == 'Selesai'
            ? Colors.teal
            : status == 'Perlu Perhatian'
            ? Colors.red
            : const Color(0xFF64748B);

    final name = p['name']?.toString() ?? '-';
    final nim = p['nim']?.toString() ?? '-';
    final prodi = p['program_studi']?.toString() ?? '';
    final semester = p['semester']?.toString() ?? '';
    final sessions = p['sessions']?.toString() ?? '0';
    final lastVisit = p['lastVisit']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';

    // Color from name hash
    const colors = [
      Colors.orange,
      Colors.blue,
      Colors.purple,
      Colors.teal,
      Colors.red,
    ];
    final color = colors[name.length % colors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withAlpha(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () => _showPatientDetails(p, provider, id),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar with Initial
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: color.withAlpha(20),
                        shape: BoxShape.circle,
                        border: Border.all(color: color.withAlpha(30), width: 1.5),
                      ),
                      child: Center(
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : '?',
                          style: TextStyle(
                            color: color,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    
                    // Main Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Name & Status
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  name,
                                  style: AppTextStyles.bodyMd.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF1E293B),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              // Status Badge
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.assignment_ind_outlined, 
                                      size: 10, 
                                      color: statusColor,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      status,
                                      style: AppTextStyles.labelSm.copyWith(
                                        color: statusColor,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          // NIM & Prodi
                          Text(
                            '$nim${prodi.isNotEmpty ? ' • $prodi' : ''}',
                            style: AppTextStyles.labelSm.copyWith(
                              color: const Color(0xFF64748B),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 12),
                          // Visit Info
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 6),
                              Text(
                                lastVisit,
                                style: AppTextStyles.labelSm.copyWith(
                                  color: const Color(0xFF64748B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 6),
                              Text(
                                '$sessions Sesi',
                                style: AppTextStyles.labelSm.copyWith(
                                  color: const Color(0xFF64748B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMd.copyWith(
        fontWeight: FontWeight.w900,
        color: const Color(0xFF0F172A),
      ),
    );
  }

  // _buildFilterAction() removed

  void _showPatientDetails(
    Map<String, dynamic> p,
    CounselingProvider provider,
    String id,
  ) {
    // Load medical record when opening details
    provider.loadMedicalRecord(id);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (context) => _PatientDetailsSheet(patient: p, provider: provider),
    );
  }

  void _quickMarkDone(Map<String, dynamic> p, CounselingProvider provider) {
    final name = p['name']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';

    showDialog(
      context: context,
      builder:
          (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.green),
                SizedBox(width: 12),
                Text('Tandai Selesai'),
              ],
            ),
            content: Text(
              'Tandai $name sebagai pasien yang sudah selesai penanganan?',
              style: AppTextStyles.bodyMd,
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: () async {
                  Navigator.pop(ctx);
                  final success = await provider.updatePatientStatus(
                    id,
                    'Selesai',
                  );
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          success
                              ? '$name berhasil ditandai selesai!'
                              : 'Gagal mengupdate status',
                        ),
                        backgroundColor: success ? Colors.green : Colors.red,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Ya, Selesai'),
              ),
            ],
          ),
    );
  }
}

// ─── Patient Details Bottom Sheet ────────────────────────────────────────────

class _PatientDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> patient;
  final CounselingProvider provider;

  const _PatientDetailsSheet({required this.patient, required this.provider});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 48,
            height: 5,
            decoration: BoxDecoration(
              color: Colors.grey.withAlpha(50),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          Expanded(
            child: Consumer<CounselingProvider>(
              builder: (context, prov, _) {
                final record = prov.medicalRecord;
                final records = record['records'];
                final List<Map<String, dynamic>> visits =
                    records is List ? records.cast<Map<String, dynamic>>() : [];

                return ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 12),
                    _buildInfoGrid(),
                    const SizedBox(height: 16),
                    prov.medicalRecordLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _buildTimelineSection(context, visits),
                  ],
                );
              },
            ),
          ),
          _buildBottomActions(context),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final name = patient['name']?.toString() ?? '-';
    final faculty = patient['faculty']?.toString() ?? '';
    final prodi = patient['program_studi']?.toString() ?? '';
    const colors = [Colors.orange, Colors.blue, Colors.purple, Colors.teal];
    final color = colors[name.length % colors.length];

    final nim = patient['nim']?.toString() ?? '-';
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Premium Avatar
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            shape: BoxShape.circle,
            border: Border.all(color: color.withAlpha(30), width: 4),
            boxShadow: [
              BoxShadow(
                color: color.withAlpha(20),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Center(
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: AppTextStyles.titleLg.copyWith(
                color: color,
                fontSize: 36,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        
        // Name
        Text(
          name,
          style: AppTextStyles.titleLg.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF0F172A),
            fontSize: 24,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 2),
        
        // NIM
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(10),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withAlpha(20)),
          ),
          child: Text(
            nim,
            style: AppTextStyles.labelMd.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
        ),
        const SizedBox(height: 2),
        
        // Faculty / Prodi
        Text(
          [faculty, prodi].where((s) => s.isNotEmpty).join(' • '),
          style: AppTextStyles.labelSm.copyWith(
            color: const Color(0xFF64748B),
            fontSize: 10,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildInfoGrid() {
    final sessions = patient['sessions']?.toString() ?? '0';
    final status = patient['status']?.toString() ?? '-';
    final lastVisit = patient['lastVisit']?.toString() ?? '-';

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withAlpha(15), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(4),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStatItem('Total Sesi', '${sessions}x'),
          Container(height: 40, width: 1, color: Colors.grey.withAlpha(30)),
          _buildStatItem('Status', status),
          Container(height: 40, width: 1, color: Colors.grey.withAlpha(30)),
          _buildStatItem('Kunjungan', lastVisit),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: AppTextStyles.titleSm.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
              fontSize: 13,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF94A3B8),
              fontWeight: FontWeight.w600,
              fontSize: 9,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSection(
    BuildContext context,
    List<Map<String, dynamic>> visits,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.history_rounded, size: 16, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Text(
              'Riwayat Kunjungan',
              style: AppTextStyles.titleSm.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (visits.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Text(
                'Belum ada catatan sesi',
                style: AppTextStyles.bodyMd.copyWith(
                  color: const Color(0xFF94A3B8),
                ),
              ),
            ),
          )
        else
          ...visits.asMap().entries.map((entry) {
            final v = entry.value;
            final isLast = entry.key == visits.length - 1;
            return _buildTimelineItem(context, v, isLast);
          }),
      ],
    );
  }

  Widget _buildTimelineItem(
    BuildContext context,
    Map<String, dynamic> v,
    bool isLast,
  ) {
    final date = v['date']?.toString() ?? '-';
    final type = v['type']?.toString() ?? 'Sesi Konseling';
    final complaint = v['complaint']?.toString() ?? '';
    final mood = v['mood']?.toString() ?? '';
    final note = complaint.isNotEmpty ? complaint : mood;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Elegant Timeline Node & Line
          SizedBox(
            width: 32,
            child: Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: AppColors.primary.withAlpha(40), blurRadius: 8, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: const Icon(Icons.history_edu_rounded, color: Colors.white, size: 16),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: AppColors.primary.withAlpha(30),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Timeline Content Card
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.withAlpha(20)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withAlpha(3), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Date & Download
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_month_rounded, size: 14, color: Color(0xFF64748B)),
                            const SizedBox(width: 6),
                            Text(
                              date,
                              style: AppTextStyles.labelMd.copyWith(
                                color: const Color(0xFF64748B),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        if (v['id'] != null)
                          GestureDetector(
                            onTap: () async {
                              final provider = context.read<CounselingProvider>();
                              final url = await provider.exportSessionNotePDF(v['id'].toString());
                              if (url != null && context.mounted) {
                                final uri = Uri.parse(url);
                                try {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Gagal mengunduh PDF'), backgroundColor: Colors.red),
                                    );
                                  }
                                }
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withAlpha(15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.download_rounded, color: AppColors.primary, size: 16),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Title
                    Text(
                      type,
                      style: AppTextStyles.titleMd.copyWith(
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    // Note Box
                    if (note.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(10),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primary.withAlpha(20)),
                        ),
                        child: Text(
                          note,
                          style: AppTextStyles.bodySm.copyWith(
                            color: AppColors.primary,
                            height: 1.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }



  Widget _buildBottomActions(BuildContext context) {
    final name = patient['name']?.toString() ?? '-';
    final id = patient['id']?.toString() ?? '';
    final sessions = int.tryParse(patient['sessions']?.toString() ?? '0') ?? 0;
    final status = patient['status']?.toString() ?? 'Baru';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 20,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Main Actions Row
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    child: Text(
                      'Tutup',
                      style: AppTextStyles.bodyLg.copyWith(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (_) => SessionNoteScreen(
                                studentName: name,
                                studentId: id,
                                sessionNumber: sessions + 1,
                              ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(0, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Buat Catatan Sesi',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showStatusDialog(
    BuildContext context,
    String patientId,
    String newStatus,
  ) {
    final TextEditingController notesController = TextEditingController();
    final isSelesai = newStatus == 'Selesai';
    final accentColor = isSelesai ? Colors.green : Colors.orange;
    final iconData =
        isSelesai ? Icons.check_circle_rounded : Icons.warning_amber_rounded;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (ctx) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
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
                          color: accentColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(iconData, color: accentColor, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isSelesai ? 'Tandai Selesai' : 'Perlu Perhatian',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            Text(
                              'Update status pasien menjadi "$newStatus"',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Info banner
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: accentColor.withAlpha(12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: accentColor.withAlpha(40)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          color: accentColor,
                          size: 18,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            isSelesai
                                ? 'Pasien akan ditandai sebagai selesai penanganan. Anda masih bisa membuat catatan sesi baru jika diperlukan.'
                                : 'Pasien akan ditandai memerlukan perhatian khusus dan tindak lanjut segera.',
                            style: TextStyle(
                              fontSize: 12,
                              color: accentColor.withAlpha(200),
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Notes field
                  Text(
                    'Catatan (opsional)',
                    style: AppTextStyles.bodyMd.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: notesController,
                    maxLines: 3,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF1E293B),
                    ),
                    decoration: InputDecoration(
                      hintText:
                          'Tambahkan catatan untuk perubahan status ini...',
                      hintStyle: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF94A3B8),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                          color: Colors.grey.withAlpha(40),
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                          color: Colors.grey.withAlpha(40),
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: accentColor, width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            side: BorderSide(color: Colors.grey.withAlpha(60)),
                          ),
                          child: const Text(
                            'Batal',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            Navigator.pop(ctx);
                            final success = await provider.updatePatientStatus(
                              patientId,
                              newStatus,
                              notes: notesController.text.trim(),
                            );
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    success
                                        ? 'Status pasien berhasil diupdate!'
                                        : 'Gagal mengupdate status pasien',
                                  ),
                                  backgroundColor:
                                      success ? accentColor : Colors.red,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              );
                              if (success) {
                                provider.loadPatients();
                                provider.loadMedicalRecord(patientId);
                                Navigator.pop(
                                  context,
                                ); // tutup bottom sheet detail
                              }
                            }
                          },
                          icon: Icon(iconData, size: 18),
                          label: Text(
                            isSelesai ? 'Tandai Selesai' : 'Tandai Perhatian',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: accentColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            elevation: 0,
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
}
