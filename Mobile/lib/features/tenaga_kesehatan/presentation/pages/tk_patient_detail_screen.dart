import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/medical_record.dart';

class TkPatientDetailScreen extends StatefulWidget {
  final int patientId;

  const TkPatientDetailScreen({
    super.key,
    required this.patientId,
  });

  @override
  State<TkPatientDetailScreen> createState() => _TkPatientDetailScreenState();
}

class _TkPatientDetailScreenState extends State<TkPatientDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkPatientProvider>().loadPatientMedicalRecord(widget.patientId);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TkPatientProvider>(
      builder: (context, provider, child) {
        final patient = provider.selectedPatient;
        final records = provider.medicalRecords;

        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => context.pop(),
            ),
            title: Text(
              'Detail Pasien',
              style: AppTextStyles.titleMd.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_note_rounded, color: AppColors.primary),
                onPressed: () => context.push('/tk/screening?patient_id=${widget.patientId}'),
              ),
            ],
          ),
          body: provider.isLoadingRecord
              ? const Center(child: CircularProgressIndicator())
              : Column(
                  children: [
                    // Patient Header
                    if (patient != null) _buildPatientHeader(patient),

                    // Tabs
                    Container(
                      color: Colors.white,
                      child: TabBar(
                        controller: _tabController,
                        labelColor: AppColors.primary,
                        unselectedLabelColor: AppColors.neutral500,
                        indicatorColor: AppColors.primary,
                        tabs: const [
                          Tab(text: 'Info'),
                          Tab(text: 'Riwayat'),
                          Tab(text: 'Screening'),
                        ],
                      ),
                    ),

                    // Tab Content
                    Expanded(
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          _buildInfoTab(patient),
                          _buildHistoryTab(records),
                          _buildScreeningTab(records),
                        ],
                      ),
                    ),
                  ],
                ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => context.push('/tk/screening?patient_id=${widget.patientId}'),
            backgroundColor: AppColors.success,
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: const Text('Input Screening', style: TextStyle(color: Colors.white)),
          ),
        );
      },
    );
  }

  Widget _buildPatientHeader(patient) {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Row(
        children: [
          // Avatar
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                patient.initials,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  patient.nama,
                  style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  patient.nim,
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral500),
                ),
                const SizedBox(height: 4),
                Text(
                  '${patient.prodi} • Semester ${patient.semester}',
                  style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral400),
                ),
                if (patient.golonganDarah != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.danger.withAlpha(15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Golongan Darah: ${patient.golonganDarah}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.danger,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTab(patient) {
    if (patient == null) {
      return const Center(child: Text('Data tidak tersedia'));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildInfoCard('Informasi Pribadi', [
          _buildInfoRow('Nama Lengkap', patient.nama),
          _buildInfoRow('NIM', patient.nim),
          _buildInfoRow('Jenis Kelamin', patient.jenisKelamin),
          _buildInfoRow('Fakultas', patient.fakultas),
          _buildInfoRow('Program Studi', patient.prodi),
          _buildInfoRow('Semester', '${patient.semester}'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('Informasi Kontak', [
          _buildInfoRow('No. HP', patient.noHP ?? '-'),
          _buildInfoRow('Email Personal', patient.email ?? '-'),
          _buildInfoRow('Email Kampus', patient.emailKampus ?? '-'),
        ]),
        if (patient.alergiObat != null && patient.alergiObat!.isNotEmpty) ...[
          const SizedBox(height: 16),
          _buildInfoCard('Riwayat Alergi', [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.danger.withAlpha(15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      patient.alergiObat!,
                      style: const TextStyle(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ]),
        ],
      ],
    );
  }

  Widget _buildHistoryTab(List<MedicalRecord> records) {
    if (records.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history_rounded, size: 64, color: AppColors.neutral300),
            const SizedBox(height: 16),
            Text(
              'Belum ada riwayat pemeriksaan',
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: records.length,
      itemBuilder: (context, index) => _buildRecordCard(records[index]),
    );
  }

  Widget _buildScreeningTab(List<MedicalRecord> records) {
    // Similar to history but with vital signs focus
    return _buildHistoryTab(records);
  }

  Widget _buildRecordCard(MedicalRecord record) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _getStatusColor(record.statusKesehatan).withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.medical_services_rounded,
                  color: _getStatusColor(record.statusKesehatan),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatDate(record.tanggal),
                      style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
                    ),
                    if (record.namaPemeriksa != null)
                      Text(
                        'Pemeriksa: ${record.namaPemeriksa}',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(record.statusKesehatan).withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  record.statusCategory,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: _getStatusColor(record.statusKesehatan),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Vital Signs Grid
          Row(
            children: [
              Expanded(child: _buildVitalItem('TB', '${record.tinggiBadan} cm')),
              Expanded(child: _buildVitalItem('BB', '${record.beratBadan} kg')),
              Expanded(child: _buildVitalItem('BMI', record.bmi.toStringAsFixed(1))),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _buildVitalItem('Tensi', record.tekananDarah)),
              Expanded(child: _buildVitalItem('Nadi', '${record.denyutNadi} bpm')),
              Expanded(child: _buildVitalItem('Suhu', '${record.suhuTubuh}°C')),
            ],
          ),
          if (record.catatan != null && record.catatan!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.neutral100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.note_rounded, size: 14, color: AppColors.neutral500),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      record.catatan!,
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.neutral600,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildVitalItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Layak Kegiatan':
      case 'prima':
      case 'sehat':
        return AppColors.success;
      case 'Perlu Perhatian':
      case 'pantauan':
        return AppColors.warning;
      case 'Tidak Layak':
      case 'kritis':
        return AppColors.danger;
      default:
        return AppColors.info;
    }
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
