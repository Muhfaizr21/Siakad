import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';

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

  final List<Map<String, dynamic>> _patients = [
    {
      'name': 'Andi Wijaya',
      'nim': '20220101',
      'faculty': 'Fakultas Teknik',
      'lastVisit': '07 Mei 2024',
      'sessions': 4,
      'status': 'Aktif',
      'tags': ['Kecemasan', 'Akademik'],
      'color': Colors.orange,
    },
    {
      'name': 'Siti Aminah',
      'nim': '20220512',
      'faculty': 'Fakultas Ekonomi',
      'lastVisit': '02 Mei 2024',
      'sessions': 2,
      'status': 'Selesai',
      'tags': ['Keluarga'],
      'color': Colors.blue,
    },
    {
      'name': 'Budi Santoso',
      'nim': '20220988',
      'faculty': 'Fakultas Farmasi',
      'lastVisit': '28 April 2024',
      'sessions': 1,
      'status': 'Baru',
      'tags': ['Stres'],
      'color': Colors.purple,
    },
    {
      'name': 'Dewi Rahayu',
      'nim': '20221345',
      'faculty': 'Fakultas Hukum',
      'lastVisit': '20 April 2024',
      'sessions': 6,
      'status': 'Aktif',
      'tags': ['Karir', 'Kecemasan'],
      'color': Colors.teal,
    },
  ];

  List<Map<String, dynamic>> get _filteredPatients {
    var list =
        _patients.where((p) {
          final matchQuery =
              p['name'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
              p['nim'].contains(_searchQuery);
          final matchFilter =
              _selectedFilter == 'Semua' || p['status'] == _selectedFilter;
          return matchQuery && matchFilter;
        }).toList();
    return list;
  }

  @override
  Widget build(BuildContext context) {
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
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  _buildInlineSearchBar(),
                  const SizedBox(height: 24),
                  _buildSummaryCard(),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSectionTitle('Daftar Mahasiswa'),
                      _buildFilterAction(),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildFilterChips(),
                  const SizedBox(height: 20),
                  _buildPatientList(),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInlineSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        decoration: InputDecoration(
          hintText: 'Cari nama atau NIM mahasiswa...',
          hintStyle: AppTextStyles.labelMd.copyWith(
            color: const Color(0xFF94A3B8),
          ),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.primary,
            size: 20,
          ),
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
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    final total = _patients.length;
    final aktif = _patients.where((p) => p['status'] == 'Aktif').length;

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
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(
              Icons.folder_shared_rounded,
              size: 140,
              color: Colors.white.withAlpha(15),
            ),
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
                        Text(
                          'Ringkasan Data',
                          style: AppTextStyles.labelSm.copyWith(
                            color: Colors.white70,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$total Pasien',
                          style: AppTextStyles.titleLg.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 32,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.analytics_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(40),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSummaryItem('Aktif', '$aktif', Colors.green),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _buildSummaryItem(
                        'Baru',
                        '${_patients.where((p) => p['status'] == 'Baru').length}',
                        Colors.orange,
                      ),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _buildSummaryItem(
                        'Selesai',
                        '${_patients.where((p) => p['status'] == 'Selesai').length}',
                        Colors.teal,
                      ),
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
        Text(
          value,
          style: AppTextStyles.titleMd.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
          ),
        ),
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(
            color: Colors.white60,
            fontSize: 10,
          ),
        ),
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

  Widget _buildPatientList() {
    final list = _filteredPatients;
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 60),
          child: Column(
            children: [
              Icon(
                Icons.search_off_rounded,
                size: 64,
                color: Colors.grey.withAlpha(50),
              ),
              const SizedBox(height: 16),
              Text(
                'Mahasiswa tidak ditemukan',
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
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      itemBuilder: (context, index) => _buildPatientCard(list[index]),
    );
  }

  Widget _buildPatientCard(Map<String, dynamic> p) {
    final statusColor =
        p['status'] == 'Aktif'
            ? Colors.green
            : p['status'] == 'Baru'
            ? Colors.orange
            : const Color(0xFF64748B);

    return GestureDetector(
      onTap: () => _showPatientDetails(p),
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
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: (p['color'] as Color).withAlpha(15),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(
                Icons.person_rounded,
                color: p['color'] as Color,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          p['name'],
                          style: AppTextStyles.bodyLg.copyWith(
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF1E293B),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          p['status'],
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'NIM: ${p['nim']} • ${p['faculty']}',
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children:
                        (p['tags'] as List<String>)
                            .map(
                              (tag) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  tag,
                                  style: AppTextStyles.labelSm.copyWith(
                                    color: const Color(0xFF475569),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Icon(
              Icons.chevron_right_rounded,
              color: Colors.grey.withAlpha(100),
            ),
          ],
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

  Widget _buildFilterAction() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.withAlpha(30)),
      ),
      child: const Icon(Icons.tune_rounded, size: 18, color: Color(0xFF64748B)),
    );
  }

  void _showPatientDetails(Map<String, dynamic> p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PatientDetailsSheet(patient: p),
    );
  }
}

// ─── Patient Details Bottom Sheet ────────────────────────────────────────────

class _PatientDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> patient;

  const _PatientDetailsSheet({required this.patient});

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
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              physics: const BouncingScrollPhysics(),
              children: [
                _buildHeader(),
                const SizedBox(height: 32),
                _buildInfoGrid(),
                const SizedBox(height: 32),
                _buildTimelineSection(),
              ],
            ),
          ),
          _buildBottomActions(context),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: (patient['color'] as Color).withAlpha(15),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Icon(
            Icons.person_rounded,
            color: patient['color'] as Color,
            size: 40,
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                patient['name'],
                style: AppTextStyles.titleLg.copyWith(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                patient['faculty'],
                style: AppTextStyles.bodyMd.copyWith(
                  color: const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children:
                    (patient['tags'] as List<String>)
                        .map(
                          (tag) => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withAlpha(10),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: AppColors.primary.withAlpha(20),
                              ),
                            ),
                            child: Text(
                              tag,
                              style: AppTextStyles.labelSm.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        )
                        .toList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildInfoCell('NIM', patient['nim'], Icons.badge_rounded),
              _buildInfoCell(
                'Sesi',
                '${patient['sessions']}x',
                Icons.history_edu_rounded,
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildInfoCell(
                'Status',
                patient['status'],
                Icons.verified_user_rounded,
              ),
              _buildInfoCell(
                'Kunjungan',
                patient['lastVisit'].toString(),
                Icons.event_available_rounded,
              ),
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
          Text(
            value,
            style: AppTextStyles.bodyLg.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1E293B),
            ),
          ),
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: const Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSection() {
    final visits = [
      {
        'date': '07 Mei 2024',
        'type': 'Sesi Konseling #4',
        'note': 'Kemajuan signifikan dalam mengelola stres.',
        'icon': Icons.check_circle_rounded,
        'color': Colors.green,
      },
      {
        'date': '25 April 2024',
        'type': 'Sesi Konseling #3',
        'note': 'Pembahasan manajemen waktu & prioritas tugas.',
        'icon': Icons.pending_actions_rounded,
        'color': AppColors.primary,
      },
      {
        'date': '10 April 2024',
        'type': 'Asesmen Pre-Screening',
        'note': 'Skor DASS-21: Kecemasan Tinggi, Depresi Ringan.',
        'icon': Icons.assessment_rounded,
        'color': Colors.orange,
      },
      {
        'date': '01 April 2024',
        'type': 'Registrasi Awal',
        'note': 'Menyetujui aturan kerahasiaan sesi.',
        'icon': Icons.assignment_ind_rounded,
        'color': Colors.blue,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Riwayat Kunjungan',
              style: AppTextStyles.titleMd.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF0F172A),
              ),
            ),
            TextButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.download_rounded, size: 16),
              label: const Text(
                'Export PDF',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
              style: TextButton.styleFrom(foregroundColor: AppColors.primary),
            ),
          ],
        ),
        const SizedBox(height: 20),
        ...visits.map(
          (v) => _buildTimelineItem(v, visits.indexOf(v) == visits.length - 1),
        ),
      ],
    );
  }

  Widget _buildTimelineItem(Map<String, dynamic> v, bool isLast) {
    final color = v['color'] as Color;
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
                  color: color.withAlpha(15),
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withAlpha(30)),
                ),
                child: Icon(v['icon'] as IconData, color: color, size: 16),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(1),
                    ),
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
                  Text(
                    v['date'] as String,
                    style: AppTextStyles.labelSm.copyWith(
                      color: const Color(0xFF94A3B8),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    v['type'] as String,
                    style: AppTextStyles.bodyLg.copyWith(
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    v['note'] as String,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: const Color(0xFF64748B),
                      height: 1.5,
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

  Widget _buildBottomActions(BuildContext context) {
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
        child: Row(
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
                onPressed: () {},
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
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
