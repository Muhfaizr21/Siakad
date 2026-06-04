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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CounselingProvider>().loadPatients();
    });
  }

  List<Map<String, dynamic>> _filteredPatients(
      List<Map<String, dynamic>> patients) {
    return patients.where((p) {
      final name = p['name']?.toString().toLowerCase() ?? '';
      final nim = p['nim']?.toString() ?? '';
      final status = p['status']?.toString() ?? '';
      final matchQuery = name.contains(_searchQuery.toLowerCase()) ||
          nim.contains(_searchQuery);
      final matchFilter =
          _selectedFilter == 'Semua' || status == _selectedFilter;
      return matchQuery && matchFilter;
    }).toList();
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
                child: provider.patientsLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 80),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : provider.patientsError != null
                        ? _buildError(provider.patientsError!, provider)
                        : Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 24),
                                _buildSearchBar(),
                                const SizedBox(height: 24),
                                _buildSummaryCard(patients),
                                const SizedBox(height: 32),
                                Row(
                                  children: [
                                    _buildSectionTitle('Daftar Mahasiswa'),
                                    const Spacer(),
                                    _buildExportButton(provider),
                                    const SizedBox(width: 12),
                                    _buildFilterAction(),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildFilterChips(),
                                const SizedBox(height: 20),
                                _buildPatientList(filtered, provider),
                                const SizedBox(height: 120),
                              ],
                            ),
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
        icon: const Icon(Icons.download_rounded, color: AppColors.primary, size: 20),
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
            Text(message,
                style: AppTextStyles.bodyMd
                    .copyWith(color: const Color(0xFF94A3B8))),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: provider.loadPatients,
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        decoration: InputDecoration(
          hintText: 'Cari nama atau NIM mahasiswa...',
          hintStyle:
              AppTextStyles.labelMd.copyWith(color: const Color(0xFF94A3B8)),
          prefixIcon:
              const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.cancel_rounded,
                      size: 18, color: Color(0xFF94A3B8)),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildSummaryCard(List<Map<String, dynamic>> patients) {
    final total = patients.length;
    final aktif = patients.where((p) => p['status'] == 'Aktif').length;
    final baru = patients.where((p) => p['status'] == 'Baru').length;
    final selesai = patients.where((p) => p['status'] == 'Selesai').length;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF001A54), Color(0xFF003399)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
              color: const Color(0xFF003399).withAlpha(60),
              blurRadius: 20,
              offset: const Offset(0, 10)),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(Icons.folder_shared_rounded,
                size: 140, color: Colors.white.withAlpha(15)),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Ringkasan Data',
                            style: AppTextStyles.labelSm.copyWith(
                                color: Colors.white70,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('$total Pasien',
                            style: AppTextStyles.titleLg.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 32)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                          color: Colors.white.withAlpha(30),
                          borderRadius: BorderRadius.circular(16)),
                      child: const Icon(Icons.analytics_rounded,
                          color: Colors.white, size: 24),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      color: Colors.black.withAlpha(40),
                      borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSummaryItem('Aktif', '$aktif', Colors.green),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _buildSummaryItem('Baru', '$baru', Colors.orange),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _buildSummaryItem('Selesai', '$selesai', Colors.teal),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value,
            style: AppTextStyles.titleMd
                .copyWith(color: Colors.white, fontWeight: FontWeight.w900)),
        Text(label,
            style: AppTextStyles.labelSm
                .copyWith(color: Colors.white60, fontSize: 10)),
      ],
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
                    color: isSelected
                        ? Colors.transparent
                        : Colors.grey.withAlpha(30)),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                            color: AppColors.primary.withAlpha(40),
                            blurRadius: 10,
                            offset: const Offset(0, 4))
                      ]
                    : null,
              ),
              child: Center(
                child: Text(filter,
                    style: AppTextStyles.labelSm.copyWith(
                        color: isSelected
                            ? Colors.white
                            : const Color(0xFF64748B),
                        fontWeight: FontWeight.bold)),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPatientList(
      List<Map<String, dynamic>> list, CounselingProvider provider) {
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 60),
          child: Column(
            children: [
              Icon(Icons.search_off_rounded,
                  size: 64, color: Colors.grey.withAlpha(50)),
              const SizedBox(height: 16),
              Text('Mahasiswa tidak ditemukan',
                  style: AppTextStyles.bodyMd
                      .copyWith(color: const Color(0xFF94A3B8))),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) =>
          _buildPatientCard(list[index], provider),
    );
  }

  Widget _buildPatientCard(
      Map<String, dynamic> p, CounselingProvider provider) {
    final status = p['status']?.toString() ?? 'Baru';
    final statusColor = status == 'Aktif'
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
    final faculty = p['faculty']?.toString() ?? '';
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

    return GestureDetector(
      onTap: () => _showPatientDetails(p, provider, id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withAlpha(5),
                blurRadius: 12,
                offset: const Offset(0, 6)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: color.withAlpha(15),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(Icons.person_rounded, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(name,
                            style: AppTextStyles.bodyLg.copyWith(
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF1E293B)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                            color: statusColor.withAlpha(15),
                            borderRadius: BorderRadius.circular(8)),
                        child: Text(status,
                            style: TextStyle(
                                color: statusColor,
                                fontSize: 10,
                                fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'NIM: $nim${faculty.isNotEmpty ? ' • $faculty' : ''}',
                    style: AppTextStyles.labelSm
                        .copyWith(color: const Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _buildMiniChip('$sessions sesi', Colors.blue),
                      const SizedBox(width: 8),
                      _buildMiniChip(lastVisit, Colors.grey),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (status != 'Selesai')
                  GestureDetector(
                    onTap: () {
                      // Quick mark as done from list
                      _quickMarkDone(p, provider);
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.green.withAlpha(15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.green.withAlpha(40)),
                      ),
                      child: const Icon(Icons.check_rounded,
                          color: Colors.green, size: 18),
                    ),
                  )
                else
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.teal.withAlpha(15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.verified_rounded,
                        color: Colors.teal, size: 18),
                  ),
                const SizedBox(height: 6),
                Icon(Icons.chevron_right_rounded,
                    color: Colors.grey.withAlpha(100), size: 18),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(6)),
      child: Text(label,
          style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF475569),
              fontSize: 9,
              fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title,
        style: AppTextStyles.titleMd
            .copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)));
  }

  Widget _buildFilterAction() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.withAlpha(30))),
      child: const Icon(Icons.tune_rounded,
          size: 18, color: Color(0xFF64748B)),
    );
  }

  void _showPatientDetails(
      Map<String, dynamic> p, CounselingProvider provider, String id) {
    // Load medical record when opening details
    provider.loadMedicalRecord(id);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          _PatientDetailsSheet(patient: p, provider: provider),
    );
  }

  void _quickMarkDone(Map<String, dynamic> p, CounselingProvider provider) {
    final name = p['name']?.toString() ?? '-';
    final id = p['id']?.toString() ?? '';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
              final success = await provider.updatePatientStatus(id, 'Selesai');
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success
                        ? '$name berhasil ditandai selesai!'
                        : 'Gagal mengupdate status'),
                    backgroundColor: success ? Colors.green : Colors.red,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
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

  const _PatientDetailsSheet(
      {required this.patient, required this.provider});

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
                borderRadius: BorderRadius.circular(10)),
          ),
          Expanded(
            child: Consumer<CounselingProvider>(
              builder: (context, prov, _) {
                final record = prov.medicalRecord;
                final records = record['records'];
                final List<Map<String, dynamic>> visits = records is List
                    ? records.cast<Map<String, dynamic>>()
                    : [];

                return ListView(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 24),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 32),
                    _buildInfoGrid(),
                    const SizedBox(height: 32),
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

    return Row(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
              color: color.withAlpha(15),
              borderRadius: BorderRadius.circular(24)),
          child: Icon(Icons.person_rounded, color: color, size: 40),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name,
                  style: AppTextStyles.titleLg.copyWith(
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0F172A))),
              const SizedBox(height: 4),
              Text(
                [faculty, prodi].where((s) => s.isNotEmpty).join(' • '),
                style: AppTextStyles.bodyMd
                    .copyWith(color: const Color(0xFF64748B)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoGrid() {
    final nim = patient['nim']?.toString() ?? '-';
    final sessions = patient['sessions']?.toString() ?? '0';
    final status = patient['status']?.toString() ?? '-';
    final lastVisit = patient['lastVisit']?.toString() ?? '-';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(4),
              blurRadius: 15,
              offset: const Offset(0, 8))
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildInfoCell('NIM', nim, Icons.badge_rounded),
              _buildInfoCell('Sesi', '${sessions}x', Icons.history_edu_rounded),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildInfoCell('Status', status, Icons.verified_user_rounded),
              _buildInfoCell(
                  'Kunjungan', lastVisit, Icons.event_available_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCell(String label, String value, IconData icon) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary.withAlpha(80), size: 18),
          const SizedBox(height: 8),
          Text(value,
              style: AppTextStyles.bodyLg.copyWith(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF1E293B))),
          Text(label,
              style: AppTextStyles.labelSm.copyWith(
                  color: const Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildTimelineSection(BuildContext context, List<Map<String, dynamic>> visits) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Riwayat Kunjungan',
            style: AppTextStyles.titleMd.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF0F172A))),
        const SizedBox(height: 20),
        if (visits.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Text('Belum ada catatan sesi',
                  style: AppTextStyles.bodyMd
                      .copyWith(color: const Color(0xFF94A3B8))),
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

  Widget _buildTimelineItem(BuildContext context, Map<String, dynamic> v, bool isLast) {
    final date = v['date']?.toString() ?? '-';
    final type = v['type']?.toString() ?? 'Sesi Konseling';
    final complaint = v['complaint']?.toString() ?? '';
    final mood = v['mood']?.toString() ?? '';
    final note = complaint.isNotEmpty ? complaint : mood;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: AppColors.primary.withAlpha(30))),
                child: const Icon(Icons.psychology_rounded,
                    color: AppColors.primary, size: 16),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(1)),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(date,
                      style: AppTextStyles.labelSm.copyWith(
                          color: const Color(0xFF94A3B8),
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(type,
                            style: AppTextStyles.bodyLg.copyWith(
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF1E293B))),
                      ),
                      if (v['id'] != null)
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () async {
                            final provider = context.read<CounselingProvider>();
                            final url = await provider.exportSessionNotePDF(v['id'].toString());
                            if (url != null && context.mounted) {
                              final uri = Uri.parse(url);
                              try {
                                await launchUrl(uri, mode: LaunchMode.externalApplication);
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Gagal mengunduh PDF rekam medis'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            } else {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Gagal mendapatkan tautan unduhan'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          icon: const Icon(Icons.download_rounded, color: AppColors.primary, size: 18),
                          tooltip: 'Unduh PDF Catatan Sesi',
                        ),
                    ],
                  ),
                  if (note.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(note,
                        style: AppTextStyles.bodyMd.copyWith(
                            color: const Color(0xFF64748B), height: 1.5)),
                  ],
                ],
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
              color: Colors.black12, blurRadius: 20, offset: Offset(0, -5))
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Status Actions Row
            if (status != 'Selesai') ...[
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showStatusDialog(context, id, 'Selesai'),
                      icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                      label: const Text('Tandai Selesai'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: Colors.green),
                        foregroundColor: Colors.green,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showStatusDialog(context, id, 'Perlu Perhatian'),
                      icon: const Icon(Icons.warning_amber_rounded, size: 18),
                      label: const Text('Perlu Perhatian'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: Colors.orange),
                        foregroundColor: Colors.orange,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
            // Main Actions Row
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 56),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    child: Text('Tutup',
                        style: AppTextStyles.bodyLg.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF64748B))),
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
                          builder: (_) => SessionNoteScreen(
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
                          borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: const Text('Buat Catatan Sesi',
                        style: TextStyle(
                            fontWeight: FontWeight.w900, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showStatusDialog(BuildContext context, String patientId, String newStatus) {
    final TextEditingController notesController = TextEditingController();
    final isSelesai = newStatus == 'Selesai';
    final accentColor = isSelesai ? Colors.green : Colors.orange;
    final iconData = isSelesai ? Icons.check_circle_rounded : Icons.warning_amber_rounded;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
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
                          style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
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
                    Icon(Icons.info_outline_rounded, color: accentColor, size: 18),
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
                style: const TextStyle(fontSize: 14, color: Color(0xFF1E293B)),
                decoration: InputDecoration(
                  hintText: 'Tambahkan catatan untuk perubahan status ini...',
                  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: Colors.grey.withAlpha(40)),
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
                            borderRadius: BorderRadius.circular(14)),
                        side: BorderSide(color: Colors.grey.withAlpha(60)),
                      ),
                      child: const Text('Batal',
                          style: TextStyle(fontWeight: FontWeight.bold)),
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
                              content: Text(success
                                  ? 'Status pasien berhasil diupdate!'
                                  : 'Gagal mengupdate status pasien'),
                              backgroundColor: success ? accentColor : Colors.red,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                          if (success) {
                            provider.loadPatients();
                            provider.loadMedicalRecord(patientId);
                            Navigator.pop(context); // tutup bottom sheet detail
                          }
                        }
                      },
                      icon: Icon(iconData, size: 18),
                      label: Text(
                        isSelesai ? 'Tandai Selesai' : 'Tandai Perhatian',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: accentColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
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
