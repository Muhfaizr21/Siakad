import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:bkuhub_mobile/core/widgets/ormawa_list_header.dart';

class OrmawaRecruitmentScreen extends StatefulWidget {
  const OrmawaRecruitmentScreen({super.key});

  @override
  State<OrmawaRecruitmentScreen> createState() => _OrmawaRecruitmentScreenState();
}

class _OrmawaRecruitmentScreenState extends State<OrmawaRecruitmentScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isFabExpanded = false;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().getRecruitmentApplicants();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
      if (_isFabExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  void _showDetailModal(BuildContext context, Map<String, dynamic> applicant) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => RecruitmentApplicantDetailModal(
        applicant: RecruitmentApplicant(
          name: applicant['name'] ?? '',
          nim: applicant['nim'] ?? '',
          prodi: applicant['prodi'] ?? '',
          ipk: (applicant['ipk'] ?? 0).toDouble(),
          divisi1: applicant['divisi1'] ?? '',
          divisi2: applicant['divisi2'] ?? '',
          status: applicant['status'] ?? 'pending',
          alasan: applicant['alasan'] ?? '',
        ),
        onAccept: () async {
          try {
            await context.read<OrmawaProvider>().reviewRecruitmentApplicant(
              applicant['id'].toString(),
              'accepted',
            );
            if (context.mounted) Navigator.pop(context);
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Gagal menerima: $e')),
              );
            }
          }
        },
        onReject: () async {
          try {
            await context.read<OrmawaProvider>().reviewRecruitmentApplicant(
              applicant['id'].toString(),
              'rejected',
            );
            if (context.mounted) Navigator.pop(context);
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Gagal menolak: $e')),
              );
            }
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: _buildExpandableFab(),
      body: Consumer<OrmawaProvider>(
        builder: (context, provider, child) {
          final allApplicants = provider.recruitmentApplicants;
          final applicants = allApplicants.where((a) {
            final matchesSearch = _searchQuery.isEmpty || 
              (a['name']?.toString().toLowerCase().contains(_searchQuery) ?? false) ||
              (a['nim']?.toString().toLowerCase().contains(_searchQuery) ?? false);
            return matchesSearch;
          }).toList();

          return RefreshIndicator(
            onRefresh: () => provider.getRecruitmentApplicants(),
            child: CustomScrollView(
              slivers: [
                BkuAppBar(
                  variant: AppBarVariant.ormawa,
                  title: 'OPEN RECRUITMENT',
                  subtitle: 'KELOLA PENDAFTARAN ANGGOTA BARU',
                  expandedHeight: 160.0,
                  showBackButton: true,
                  isExpandable: false,
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 16, left: 20, right: 20, bottom: 16),
                    child: OrmawaListHeader(
                      title: 'DAFTAR PENDAFTAR (${applicants.length})',
                      searchHint: 'Cari nama atau NIM...',
                      searchController: _searchController,
                      onRefresh: () => provider.getRecruitmentApplicants(),
                      onFilterTap: () {
                        // TODO: Implement filter for recruitment
                      },
                      onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
                    ),
                  ),
                ),
                if (provider.isLoading && allApplicants.isEmpty)
                  const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (applicants.isEmpty)
                  SliverFillRemaining(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.05),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.people_alt_outlined,
                              size: 80,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Belum Ada Pendaftar',
                            style: AppTextStyles.titleLg.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.neutral900,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Daftar mahasiswa yang melamar ke ORMAWA ini akan muncul di sini.',
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMd.copyWith(
                              color: AppColors.neutral600,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 32),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: AppColors.infoContainer,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.info_outline_rounded, color: AppColors.info),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Pastikan status Open Recruitment sudah dibuka pada menu Pengaturan.',
                                    style: AppTextStyles.labelMd.copyWith(
                                      color: AppColors.onInfoContainer,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final applicant = applicants[index];
                          return RecruitmentApplicantCard(
                            applicant: RecruitmentApplicant(
                              name: applicant['name'] ?? '',
                              nim: applicant['nim'] ?? '',
                              prodi: applicant['prodi'] ?? '',
                              ipk: (applicant['ipk'] ?? 0).toDouble(),
                              divisi1: applicant['divisi1'] ?? '',
                              divisi2: applicant['divisi2'] ?? '',
                              status: applicant['status'] ?? 'pending',
                              alasan: applicant['alasan'] ?? '',
                            ),
                            onReview: () => _showDetailModal(context, applicant),
                          );
                        },
                        childCount: applicants.length,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildExpandableFab() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        if (_isFabExpanded) ...[
          _buildFabOption(
            icon: Icons.history_rounded,
            label: 'Riwayat Keputusan',
            color: Colors.green,
            onTap: () {
              _toggleFab();
              Navigator.push(context, MaterialPageRoute(builder: (_) => const RecruitmentHistoryScreen()));
            },
          ),
          const SizedBox(height: 16),
          _buildFabOption(
            icon: Icons.list_alt_rounded,
            label: 'Form Builder',
            color: Colors.purple,
            onTap: () {
              _toggleFab();
              Navigator.push(context, MaterialPageRoute(builder: (_) => const RecruitmentFormScreen()));
            },
          ),
          const SizedBox(height: 16),
          _buildFabOption(
            icon: Icons.settings_rounded,
            label: 'Pengaturan',
            color: Colors.blue,
            onTap: () {
              _toggleFab();
              Navigator.push(context, MaterialPageRoute(builder: (_) => const RecruitmentSettingsScreen()));
            },
          ),
          const SizedBox(height: 16),
        ],
        FloatingActionButton.extended(
          onPressed: _toggleFab,
          backgroundColor: AppColors.primary,
          icon: AnimatedIcon(
            icon: AnimatedIcons.menu_close,
            progress: _animationController,
            color: Colors.white,
          ),
          label: Text(
            _isFabExpanded ? 'Tutup' : 'Menu Utama',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildFabOption({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: AppTextStyles.labelMd.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.neutral900,
            ),
          ),
        ),
        const SizedBox(width: 16),
        FloatingActionButton(
          heroTag: label, // Prevent hero animation conflicts
          mini: true,
          onPressed: onTap,
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
      ],
    );
  }
}

class RecruitmentSettingsScreen extends StatefulWidget {
  const RecruitmentSettingsScreen({super.key});

  @override
  State<RecruitmentSettingsScreen> createState() => _RecruitmentSettingsScreenState();
}

class _RecruitmentSettingsScreenState extends State<RecruitmentSettingsScreen> {
  bool _isOpenRecruitment = false;
  DateTime? _startDate;
  DateTime? _endDate;
  double _minIpk = 2.5;
  final _requirementsController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final provider = context.read<OrmawaProvider>();
    await provider.getRecruitmentSettings();

    final settings = provider.recruitmentSettings;
    if (settings.isNotEmpty && mounted) {
      setState(() {
        _isOpenRecruitment = settings['isActive'] ?? false;
        _minIpk = (settings['minIpk'] ?? 2.5).toDouble();
        _requirementsController.text = settings['requirements'] ?? '';

        if (settings['startDate'] != null) {
          _startDate = DateTime.tryParse(settings['startDate'].toString());
        }
        if (settings['endDate'] != null) {
          _endDate = DateTime.tryParse(settings['endDate'].toString());
        }
      });
    } else {
      _requirementsController.text = 'Mahasiswa aktif\nMinimal IPK 2.50\nMengisi formulir pendaftaran';
    }
  }

  Future<void> _selectDate(bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    try {
      await context.read<OrmawaProvider>().updateRecruitmentSettings({
        'isActive': _isOpenRecruitment,
        'startDate': _startDate?.toIso8601String(),
        'endDate': _endDate?.toIso8601String(),
        'minIpk': _minIpk,
        'requirements': _requirementsController.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pengaturan berhasil disimpan'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyimpan: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Pengaturan', style: AppTextStyles.headlineSmall.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.neutral900,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _isOpenRecruitment
                    ? [AppColors.primary, AppColors.primary.withOpacity(0.8)]
                    : [AppColors.neutral100, AppColors.neutral200],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: _isOpenRecruitment
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.6),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      )
                    ]
                  : null,
            ),
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pendaftaran Anggota',
                        style: AppTextStyles.titleSm.copyWith(
                          color: _isOpenRecruitment ? Colors.white : AppColors.neutral800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _isOpenRecruitment
                            ? 'Pendaftaran saat ini sedang DIBUKA'
                            : 'Pendaftaran saat ini sedang DITUTUP',
                        style: AppTextStyles.labelMd.copyWith(
                          color: _isOpenRecruitment ? Colors.white70 : AppColors.neutral500,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _isOpenRecruitment,
                  onChanged: (value) => setState(() => _isOpenRecruitment = value),
                  activeColor: Colors.white,
                  activeTrackColor: Colors.greenAccent.shade400,
                  inactiveThumbColor: AppColors.neutral400,
                  inactiveTrackColor: AppColors.neutral300,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          Text(
            'Periode & Syarat',
            style: AppTextStyles.titleSm.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.neutral800,
            ),
          ),
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: RecruitmentDateField(
                  label: 'Mulai',
                  date: _startDate,
                  onTap: () => _selectDate(true),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: RecruitmentDateField(
                  label: 'Selesai',
                  date: _endDate,
                  onTap: () => _selectDate(false),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.outline.withOpacity(0.5)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.neutral200.withOpacity(0.5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
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
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.star_rounded, color: Colors.orange, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'IPK Minimal',
                          style: AppTextStyles.bodyMd.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _minIpk.toStringAsFixed(2),
                        style: AppTextStyles.labelMd.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SliderTheme(
                  data: SliderThemeData(
                    activeTrackColor: AppColors.primary,
                    inactiveTrackColor: AppColors.primary.withOpacity(0.3),
                    thumbColor: AppColors.primary,
                    overlayColor: AppColors.primary.withOpacity(0.3),
                    trackHeight: 6,
                  ),
                  child: Slider(
                    value: _minIpk,
                    min: 0,
                    max: 4,
                    divisions: 40,
                    onChanged: (value) => setState(() => _minIpk = value),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.outline.withOpacity(0.5)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.neutral200.withOpacity(0.5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.assignment_rounded, color: Colors.blue, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Persyaratan Utama',
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _requirementsController,
                  maxLines: 4,
                  style: AppTextStyles.bodyMd,
                  decoration: InputDecoration(
                    hintText: 'Tuliskan persyaratan pendaftaran...',
                    hintStyle: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
                    filled: true,
                    fillColor: AppColors.neutral100.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 4,
                shadowColor: AppColors.primary.withOpacity(0.4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(100),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        color: Colors.white,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.save_rounded, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Simpan Pengaturan',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    ),
    );
  }
}

class RecruitmentDateField extends StatelessWidget {
  final String label;
  final DateTime? date;
  final VoidCallback onTap;

  const RecruitmentDateField({
    super.key,
    required this.label,
    required this.date,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMd.copyWith(
            color: AppColors.neutral600,
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.outline.withOpacity(0.5)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.calendar_today_rounded,
                  size: 18,
                  color: AppColors.neutral600,
                ),
                const SizedBox(width: 8),
                Text(
                  date != null
                      ? DateFormat('dd MMM yyyy').format(date!)
                      : 'Pilih Tanggal',
                  style: AppTextStyles.bodyMd.copyWith(
                    color: date != null
                        ? AppColors.neutral900
                        : AppColors.neutral400,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class RecruitmentFormScreen extends StatefulWidget {
  const RecruitmentFormScreen({super.key});

  @override
  State<RecruitmentFormScreen> createState() => _RecruitmentFormScreenState();
}

class _RecruitmentFormScreenState extends State<RecruitmentFormScreen> {
  final List<RecruitmentFormField> _fields = [];
  bool _isLoading = false;

  final List<String> _fieldTypes = [
    'Teks Singkat',
    'Paragraf',
    'Dropdown',
    'Pilihan Ganda',
    'Upload File',
  ];

  @override
  void initState() {
    super.initState();
    _loadFormFields();
  }

  Future<void> _loadFormFields() async {
    final provider = context.read<OrmawaProvider>();
    await provider.getRecruitmentFormFields();

    final fields = provider.recruitmentFormFields;
    if (fields.isNotEmpty && mounted) {
      setState(() {
        _fields.clear();
        for (var i = 0; i < fields.length; i++) {
          final f = fields[i];
          _fields.add(RecruitmentFormField(
            id: i,
            label: f['label'] ?? '',
            type: f['type'] ?? 'Teks Singkat',
            options: f['options'] ?? '',
            required: f['required'] ?? false,
          ));
        }
      });
    }
  }

  void _removeField(int index) {
    setState(() => _fields.removeAt(index));
  }

  Future<void> _saveForm() async {
    setState(() => _isLoading = true);
    try {
      final fieldsData = _fields.map((f) => {
        'label': f.label,
        'type': f.type,
        'options': f.options,
        'required': f.required,
      }).toList();

      await context.read<OrmawaProvider>().saveRecruitmentFormFields(fieldsData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Form berhasil disimpan'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyimpan: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showAddFieldSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: AppColors.neutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                'Pilih Jenis Pertanyaan',
                style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ..._fieldTypes.map((type) => ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 24),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        type == 'Teks Singkat' ? Icons.short_text_rounded :
                        type == 'Paragraf' ? Icons.notes_rounded :
                        type == 'Dropdown' ? Icons.arrow_drop_down_circle_rounded :
                        type == 'Pilihan Ganda' ? Icons.check_box_rounded :
                        Icons.upload_file_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    title: Text(type, style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold)),
                    onTap: () {
                      Navigator.pop(context);
                      setState(() {
                        _fields.add(RecruitmentFormField(
                          id: DateTime.now().millisecondsSinceEpoch,
                          label: '',
                          type: type,
                          options: '',
                          required: false,
                        ));
                      });
                    },
                  )),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Form Builder', style: AppTextStyles.headlineSmall.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.neutral900,
        elevation: 0,
      ),
      body: Stack(
        children: [
          Column(
            children: [
            Expanded(
              child: _fields.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.dynamic_form_rounded,
                            size: 64,
                            color: AppColors.neutral300,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Belum ada field',
                            style: AppTextStyles.bodyMd.copyWith(
                              color: AppColors.neutral600,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Tekan tombol + di bawah untuk membuat formulir',
                            style: AppTextStyles.labelMd.copyWith(
                              color: AppColors.neutral400,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ReorderableListView.builder(
                      padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 100),
                      itemCount: _fields.length,
                      onReorder: (oldIndex, newIndex) {
                        setState(() {
                          if (newIndex > oldIndex) {
                            newIndex -= 1;
                          }
                          final item = _fields.removeAt(oldIndex);
                          _fields.insert(newIndex, item);
                        });
                      },
                      itemBuilder: (context, index) {
                        return Padding(
                          key: ValueKey(_fields[index].id),
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildFieldCard(_fields[index], index),
                        );
                      },
                    ),
            ),
            if (_fields.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: AppColors.outline.withOpacity(0.2))),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveForm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(100),
                      ),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(strokeWidth: 3, color: Colors.white),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.save_rounded, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Simpan Form',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
          ],
        ),
        Positioned(
          right: 20,
          bottom: _fields.isEmpty ? 20 : 100,
          child: FloatingActionButton(
            heroTag: 'add_field_fab',
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 4,
            onPressed: _showAddFieldSheet,
            child: const Icon(Icons.add_rounded),
          ),
        ),
      ],
    ),
    );
  }

  Widget _buildFieldCard(RecruitmentFormField field, int index) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outline.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: AppColors.neutral200.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.neutral100.withOpacity(0.5),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                const Icon(Icons.drag_indicator_rounded, color: Colors.grey, size: 20),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Field ${index + 1}',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                InkWell(
                  onTap: () => _removeField(index),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 18),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: TextEditingController(text: field.label)
                    ..selection = TextSelection.collapsed(offset: field.label.length),
                  decoration: InputDecoration(
                    labelText: 'Pertanyaan',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                  onChanged: (value) => field.label = value,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: field.type,
                  decoration: InputDecoration(
                    labelText: 'Tipe Field',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                  items: _fieldTypes.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(type),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() => field.type = value!);
                  },
                ),
                if (field.type == 'Dropdown' || field.type == 'Pilihan Ganda') ...[
                  const SizedBox(height: 12),
                  TextField(
                    controller: TextEditingController(text: field.options)
                      ..selection = TextSelection.collapsed(offset: field.options.length),
                    decoration: InputDecoration(
                      labelText: 'Opsi (pisahkan dengan koma)',
                      hintText: 'Opsi 1, Opsi 2, Opsi 3',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                    onChanged: (value) => field.options = value,
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    Switch(
                      value: field.required,
                      onChanged: (val) {
                        setState(() => field.required = val);
                      },
                      activeThumbColor: AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Wajib diisi',
                      style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class RecruitmentFormField {
  int id;
  String label;
  String type;
  String options;
  bool required;

  RecruitmentFormField({
    required this.id,
    required this.label,
    required this.type,
    required this.options,
    required this.required,
  });
}

// Removed redundant RecruitmentApplicantsScreen

class RecruitmentApplicantCard extends StatelessWidget {
  final RecruitmentApplicant applicant;
  final VoidCallback onReview;

  const RecruitmentApplicantCard({
    super.key,
    required this.applicant,
    required this.onReview,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outline.withAlpha(50)),
        boxShadow: [
          BoxShadow(
            color: AppColors.neutral200.withAlpha(40),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onReview,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primary.withAlpha(150)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withAlpha(60),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    applicant.name.substring(0, 1).toUpperCase(),
                    style: AppTextStyles.titleSm.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        applicant.name,
                        style: AppTextStyles.titleSm.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${applicant.nim} • ${applicant.prodi}',
                        style: AppTextStyles.labelMd.copyWith(
                          color: AppColors.neutral500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange.withAlpha(20),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: Colors.orange.withAlpha(50)),
                      ),
                      child: Text(
                        'Menunggu',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.orange.shade700,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, color: Colors.orange, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          applicant.ipk.toStringAsFixed(2),
                          style: AppTextStyles.labelMd.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.neutral700,
                          ),
                        ),
                      ],
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
}

class RecruitmentApplicant {
  final String name;
  final String nim;
  final String prodi;
  final double ipk;
  final String divisi1;
  final String divisi2;
  final String status;
  final String alasan;

  RecruitmentApplicant({
    required this.name,
    required this.nim,
    required this.prodi,
    required this.ipk,
    required this.divisi1,
    required this.divisi2,
    required this.status,
    required this.alasan,
  });
}

// Tab 4: Riwayat Keputusan
class RecruitmentHistoryScreen extends StatelessWidget {
  const RecruitmentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Riwayat Keputusan', style: AppTextStyles.headlineSmall.copyWith(color: AppColors.neutral900, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.neutral900,
        elevation: 0,
      ),
      body: Builder(
        builder: (context) {
    // Simulasi data riwayat
    final List<RecruitmentApplicant> history = [];

    if (history.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.history_rounded,
              size: 64,
              color: AppColors.neutral300,
            ),
            const SizedBox(height: 16),
            Text(
              'Belum ada riwayat',
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.neutral600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Riwayat keputusan akan muncul di sini',
              style: AppTextStyles.labelMd.copyWith(
                color: AppColors.neutral400,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final applicant = history[index];
        return RecruitmentHistoryCard(applicant: applicant);
      },
    );
        },
      ),
    );
  }
}

class RecruitmentHistoryCard extends StatelessWidget {
  final RecruitmentApplicant applicant;

  const RecruitmentHistoryCard({super.key, required this.applicant});

  @override
  Widget build(BuildContext context) {
    final isAccepted = applicant.status == 'aktif' || applicant.status == 'accepted';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isAccepted ? Colors.green.withAlpha(50) : Colors.red.withAlpha(50)),
        boxShadow: [
          BoxShadow(
            color: isAccepted ? Colors.green.withAlpha(20) : Colors.red.withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isAccepted 
                      ? [Colors.green, Colors.greenAccent.shade700] 
                      : [Colors.red, Colors.redAccent.shade400],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (isAccepted ? Colors.green : Colors.red).withAlpha(60),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                applicant.name.substring(0, 1).toUpperCase(),
                style: AppTextStyles.titleSm.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    applicant.name,
                    style: AppTextStyles.titleSm.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${applicant.nim} • ${applicant.prodi}',
                    style: AppTextStyles.labelMd.copyWith(
                      color: AppColors.neutral500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (isAccepted ? Colors.green : Colors.red).withAlpha(20),
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: (isAccepted ? Colors.green : Colors.red).withAlpha(50)),
              ),
              child: Text(
                isAccepted ? 'Diterima' : 'Ditolak',
                style: AppTextStyles.labelSm.copyWith(
                  color: isAccepted ? Colors.green.shade700 : Colors.red.shade700,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Modal Detail Applicant
class RecruitmentApplicantDetailModal extends StatelessWidget {
  final RecruitmentApplicant applicant;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;

  const RecruitmentApplicantDetailModal({
    super.key,
    required this.applicant,
    this.onAccept,
    this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Stack(
            children: [
              CustomScrollView(
                controller: scrollController,
                slivers: [
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        const SizedBox(height: 12),
                        Container(
                          width: 48,
                          height: 6,
                          decoration: BoxDecoration(
                            color: AppColors.neutral300,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                        const SizedBox(height: 32),
                        // Profile Avatar Modern
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.primary.withAlpha(50), width: 2),
                          ),
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [AppColors.primary, AppColors.primary.withAlpha(150)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withAlpha(60),
                                  blurRadius: 15,
                                  offset: const Offset(0, 5),
                                )
                              ],
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              applicant.name.substring(0, 1).toUpperCase(),
                              style: AppTextStyles.displaySmall.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            applicant.name,
                            style: AppTextStyles.headlineSmall.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.neutral900,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.neutral100,
                            borderRadius: BorderRadius.circular(100),
                          ),
                          child: Text(
                            '${applicant.nim} • ${applicant.prodi}',
                            style: AppTextStyles.bodyMd.copyWith(
                              color: AppColors.neutral600,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        
                        // Detail Data
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // IPK modern
                              Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.orange.withAlpha(20),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: Colors.orange.withAlpha(50)),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(10),
                                            decoration: BoxDecoration(
                                              color: Colors.orange.withAlpha(40),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.star_rounded, color: Colors.orange, size: 24),
                                          ),
                                          const SizedBox(width: 16),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('Indeks Prestasi', style: AppTextStyles.labelMd.copyWith(color: Colors.orange.shade800)),
                                              Text(applicant.ipk.toStringAsFixed(2), style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.bold, color: Colors.orange.shade900)),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),
                              
                              Text(
                                'Divisi Pilihan',
                                style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: RecruitmentInfoCard(
                                      label: 'Pilihan 1',
                                      value: applicant.divisi1,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: RecruitmentInfoCard(
                                      label: 'Pilihan 2',
                                      value: applicant.divisi2,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),
                              
                              Text(
                                'Alasan & Motivasi',
                                style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: AppColors.neutral100.withAlpha(100),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.outline.withAlpha(50)),
                                ),
                                child: Text(
                                  applicant.alasan,
                                  style: AppTextStyles.bodyMd.copyWith(height: 1.5),
                                ),
                              ),
                              const SizedBox(height: 120), // Padding untuk sticky button
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              // Sticky Action Buttons
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 20,
                        offset: const Offset(0, -10),
                      ),
                    ],
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: onReject,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                            side: const BorderSide(color: Colors.red, width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(100),
                            ),
                          ),
                          child: const Text(
                            'Tolak',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: onAccept,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(100),
                            ),
                          ),
                          child: const Text(
                            'Terima',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
      },
    );
  }
}

class RecruitmentInfoCard extends StatelessWidget {
  final String label;
  final String value;

  const RecruitmentInfoCard({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.bodyMd.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.neutral900,
            ),
          ),
        ],
      ),
    );
  }
}
