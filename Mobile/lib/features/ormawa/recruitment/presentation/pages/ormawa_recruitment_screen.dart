import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/widgets/unified_card.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class OrmawaRecruitmentScreen extends StatefulWidget {
  const OrmawaRecruitmentScreen({super.key});

  @override
  State<OrmawaRecruitmentScreen> createState() => _OrmawaRecruitmentScreenState();
}

class _OrmawaRecruitmentScreenState extends State<OrmawaRecruitmentScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
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
            title: 'OPEN RECRUITMENT',
            subtitle: 'KELOLA PENDAFTARAN ANGGOTA BARU',
            expandedHeight: 160.0,
            showBackButton: true,
            isExpandable: false,
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 24),
                // Tab Navigation
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primary,
                    unselectedLabelColor: AppColors.neutral600,
                    labelStyle: AppTextStyles.labelSm.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    unselectedLabelStyle: AppTextStyles.labelSm,
                    indicatorColor: AppColors.primary,
                    indicatorWeight: 3,
                    indicatorSize: TabBarIndicatorSize.label,
                    indicator: BoxDecoration(
                      color: AppColors.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(6),
                    tabs: const [
                      Tab(text: 'Pengaturan'),
                      Tab(text: 'Form'),
                      Tab(text: 'Pendaftar'),
                      Tab(text: 'Riwayat'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Tab Content
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.6,
                  child: TabBarView(
                    controller: _tabController,
                    children: const [
                      RecruitmentSettingsTab(),
                      RecruitmentFormTab(),
                      RecruitmentApplicantsTab(),
                      RecruitmentHistoryTab(),
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
}

// Tab 1: Pengaturan Recruitment
class RecruitmentSettingsTab extends StatefulWidget {
  const RecruitmentSettingsTab({super.key});

  @override
  State<RecruitmentSettingsTab> createState() => _RecruitmentSettingsTabState();
}

class _RecruitmentSettingsTabState extends State<RecruitmentSettingsTab> {
  bool _isOpenRecruitment = false;
  DateTime? _startDate;
  DateTime? _endDate;
  double _minIpk = 2.5;
  final _requirementsController = TextEditingController();
  bool _isLoading = false;
  bool _isInitialized = false;

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
        _isInitialized = true;
      });
    } else {
      _requirementsController.text = 'Mahasiswa aktif\nMinimal IPK 2.50\nMengisi formulir pendaftaran';
      _isInitialized = true;
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
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Toggle
          UnifiedCard(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Status Open Recruitment',
                      style: AppTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _isOpenRecruitment ? 'Aktif' : 'Tidak Aktif',
                      style: AppTextStyles.labelMd.copyWith(
                        color: _isOpenRecruitment ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
                Switch(
                  value: _isOpenRecruitment,
                  onChanged: (value) => setState(() => _isOpenRecruitment = value),
                  activeColor: AppColors.primary,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Date Selection
          UnifiedCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Periode Pendaftaran',
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: RecruitmentDateField(
                        label: 'Tanggal Mulai',
                        date: _startDate,
                        onTap: () => _selectDate(true),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: RecruitmentDateField(
                        label: 'Tanggal Selesai',
                        date: _endDate,
                        onTap: () => _selectDate(false),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // IPK Minimal
          UnifiedCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'IPK Minimal',
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Slider(
                        value: _minIpk,
                        min: 0,
                        max: 4,
                        divisions: 40,
                        activeColor: AppColors.primary,
                        onChanged: (value) => setState(() => _minIpk = value),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _minIpk.toStringAsFixed(2),
                        style: AppTextStyles.bodyMd.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Persyaratan
          UnifiedCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Persyaratan Pendaftaran',
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _requirementsController,
                  maxLines: 5,
                  decoration: InputDecoration(
                    hintText: 'Masukkan persyaratan pendaftaran...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outline),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outline.withAlpha(100)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Save Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Simpan Perubahan',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 100),
        ],
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
              border: Border.all(color: AppColors.outline.withAlpha(100)),
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

// Tab 2: Form Builder
class RecruitmentFormTab extends StatefulWidget {
  const RecruitmentFormTab({super.key});

  @override
  State<RecruitmentFormTab> createState() => _RecruitmentFormTabState();
}

class _RecruitmentFormTabState extends State<RecruitmentFormTab> {
  final List<RecruitmentFormField> _fields = [];
  bool _isLoading = false;
  bool _isInitialized = false;

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
        _isInitialized = true;
      });
    } else {
      setState(() => _isInitialized = true);
    }
  }

  void _addField() {
    setState(() {
      _fields.add(RecruitmentFormField(
        id: DateTime.now().millisecondsSinceEpoch,
        label: '',
        type: 'Teks Singkat',
        options: '',
        required: false,
      ));
    });
  }

  void _removeField(int index) {
    setState(() => _fields.removeAt(index));
  }

  void _moveField(int index, int direction) {
    if (index == 0 && direction == -1) return;
    if (index == _fields.length - 1 && direction == 1) return;
    setState(() {
      final item = _fields.removeAt(index);
      _fields.insert(index + direction, item);
    });
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

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Add Field Button
          InkWell(
            onTap: _addField,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(10),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primary.withAlpha(50),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_circle_outline_rounded,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Tambah Field',
                    style: AppTextStyles.bodyMd.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Field List
          if (_fields.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(
                      Icons.list_alt_rounded,
                      size: 48,
                      color: AppColors.neutral300,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Belum ada field',
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.neutral600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tekan "Tambah Field" untuk membuat formulir',
                      style: AppTextStyles.labelMd.copyWith(
                        color: AppColors.neutral400,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ..._fields.asMap().entries.map((entry) {
              final index = entry.key;
              final field = entry.value;
              return _buildFieldCard(field, index);
            }),
          if (_fields.isNotEmpty) ...[
            const SizedBox(height: 24),
            // Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Simpan Form',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
          ],
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildFieldCard(RecruitmentFormField field, int index) {
    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(15),
                  borderRadius: BorderRadius.circular(8),
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
              IconButton(
                onPressed: () => _moveField(index, -1),
                icon: Icon(
                  Icons.arrow_upward_rounded,
                  color: AppColors.neutral600,
                ),
                iconSize: 20,
              ),
              IconButton(
                onPressed: () => _moveField(index, 1),
                icon: Icon(
                  Icons.arrow_downward_rounded,
                  color: AppColors.neutral600,
                ),
                iconSize: 20,
              ),
              IconButton(
                onPressed: () => _removeField(index),
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: Colors.red,
                ),
                iconSize: 20,
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
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
          const SizedBox(height: 12),
          Row(
            children: [
              Checkbox(
                value: field.required,
                onChanged: (value) {
                  setState(() => field.required = value!);
                },
                activeColor: AppColors.primary,
              ),
              Text(
                'Wajib diisi',
                style: AppTextStyles.bodyMd,
              ),
            ],
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

// Tab 3: Pendaftar Masuk
class RecruitmentApplicantsTab extends StatefulWidget {
  const RecruitmentApplicantsTab({super.key});

  @override
  State<RecruitmentApplicantsTab> createState() => _RecruitmentApplicantsTabState();
}

class _RecruitmentApplicantsTabState extends State<RecruitmentApplicantsTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrmawaProvider>().getRecruitmentApplicants();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrmawaProvider>(
      builder: (context, provider, child) {
        final applicants = provider.recruitmentApplicants;

        if (provider.isLoading && applicants.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (applicants.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.people_outline_rounded,
                  size: 64,
                  color: AppColors.neutral300,
                ),
                const SizedBox(height: 16),
                Text(
                  'Belum ada pendaftar',
                  style: AppTextStyles.bodyMd.copyWith(
                    color: AppColors.neutral600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Pendaftar akan muncul di sini',
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.neutral400,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.getRecruitmentApplicants(),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: applicants.length,
            itemBuilder: (context, index) {
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
          ),
        );
      },
    );
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
}

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
    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: onReview,
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primary.withAlpha(15),
            child: Text(
              applicant.name.substring(0, 1).toUpperCase(),
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.primary,
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
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${applicant.nim} • ${applicant.prodi}',
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.neutral600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'IPK: ${applicant.ipk}',
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: Colors.orange.withAlpha(15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Menunggu',
              style: AppTextStyles.labelSm.copyWith(
                color: Colors.orange,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            Icons.chevron_right_rounded,
            color: AppColors.neutral400,
          ),
        ],
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
class RecruitmentHistoryTab extends StatelessWidget {
  const RecruitmentHistoryTab({super.key});

  @override
  Widget build(BuildContext context) {
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
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final applicant = history[index];
        return RecruitmentHistoryCard(applicant: applicant);
      },
    );
  }
}

class RecruitmentHistoryCard extends StatelessWidget {
  final RecruitmentApplicant applicant;

  const RecruitmentHistoryCard({super.key, required this.applicant});

  @override
  Widget build(BuildContext context) {
    final isAccepted = applicant.status == 'aktif';

    return UnifiedCard(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: isAccepted
                ? Colors.green.withAlpha(15)
                : Colors.red.withAlpha(15),
            child: Text(
              applicant.name.substring(0, 1).toUpperCase(),
              style: AppTextStyles.bodyMd.copyWith(
                color: isAccepted ? Colors.green : Colors.red,
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
                  style: AppTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${applicant.nim} • ${applicant.prodi}',
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.neutral600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Divisi: ${applicant.divisi1}',
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: isAccepted
                  ? Colors.green.withAlpha(15)
                  : Colors.red.withAlpha(15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isAccepted ? 'Diterima' : 'Ditolak',
              style: AppTextStyles.labelSm.copyWith(
                color: isAccepted ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
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
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: AppColors.primary.withAlpha(15),
                          child: Text(
                            applicant.name.substring(0, 1).toUpperCase(),
                            style: AppTextStyles.headlineMd.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          applicant.name,
                          style: AppTextStyles.headlineSmall.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${applicant.nim} • ${applicant.prodi}',
                          style: AppTextStyles.bodyMd.copyWith(
                            color: AppColors.neutral600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.withAlpha(15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'IPK: ${applicant.ipk}',
                            style: AppTextStyles.labelMd.copyWith(
                              color: Colors.orange,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Divisi Pilihan
                  Text(
                    'Divisi Pilihan',
                    style: AppTextStyles.titleSm.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
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
                  // Alasan/Motivasi
                  Text(
                    'Alasan & Motivasi',
                    style: AppTextStyles.titleSm.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  UnifiedCard(
                    child: Text(
                      applicant.alasan,
                      style: AppTextStyles.bodyMd,
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: onReject,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                            side: const BorderSide(color: Colors.red),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Tolak',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: onAccept,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Terima',
                            style: TextStyle(fontWeight: FontWeight.bold),
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
    return UnifiedCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.neutral600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.bodyMd.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
