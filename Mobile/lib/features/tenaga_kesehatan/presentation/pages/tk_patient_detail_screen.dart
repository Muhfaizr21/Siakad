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
              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.neutral900),
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/tk');
                }
              },
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
          const Divider(height: 24, thickness: 1),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () => _showRecordDetails(context, record),
              icon: const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.primary),
              label: Text(
                'Lihat Detail Selengkapnya',
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showRecordDetails(BuildContext context, MedicalRecord record) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.85,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Pull Bar
              Center(
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.neutral300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Detail Rekam Medis',
                            style: AppTextStyles.titleLg.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_formatDate(record.tanggal)} • Oleh ${record.namaPemeriksa ?? "-"}',
                            style: AppTextStyles.bodySm.copyWith(
                              color: AppColors.neutral500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Content
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Status Badge
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getStatusColor(record.statusKesehatan).withAlpha(20),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.medical_services_rounded,
                              color: _getStatusColor(record.statusKesehatan),
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              record.statusCategory,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _getStatusColor(record.statusKesehatan),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Section 1: Tanda Vital & Fisik
                    _buildModalSectionTitle('Tanda Vital & Fisik'),
                    const SizedBox(height: 12),
                    _buildModalGrid([
                      _buildModalGridItem('Tinggi Badan', '${record.tinggiBadan} cm'),
                      _buildModalGridItem('Berat Badan', '${record.beratBadan} kg'),
                      _buildModalGridItem('BMI', '${record.bmi.toStringAsFixed(1)} (${record.bmiCategory})'),
                      _buildModalGridItem('Tekanan Darah', record.tekananDarah),
                      _buildModalGridItem('Denyut Nadi', '${record.denyutNadi} bpm'),
                      _buildModalGridItem('Suhu Tubuh', '${record.suhuTubuh}°C'),
                      _buildModalGridItem('SpO2', '${record.spO2}%'),
                      _buildModalGridItem('Gula Darah', record.gulaDarah != null ? '${record.gulaDarah} mg/dL' : '-'),
                      _buildModalGridItem('Golongan Darah', record.golonganDarah ?? '-'),
                    ]),
                    const SizedBox(height: 24),

                    // Section 2: Keluhan & Kondisi
                    _buildModalSectionTitle('Keluhan & Kondisi'),
                    const SizedBox(height: 12),
                    _buildDetailItem('Riwayat Penyakit', record.riwayatPenyakit),
                    _buildWarningDetailItem('Alergi Obat', record.alergiObat),
                    _buildDetailItem('Kondisi Psikologis', record.kondisiPsikologis),
                    _buildDetailItem('Konsumsi Obat', record.konsumsiObat),
                    _buildDetailItem('Skala Nyeri', record.skalaNyeri != null ? '${record.skalaNyeri} / 10' : null),
                    _buildDetailItem('Buta Warna', record.butaWarna),
                    const SizedBox(height: 24),

                    // Section 3: Tindakan & Penanganan
                    _buildModalSectionTitle('Tindakan & Rekomendasi'),
                    const SizedBox(height: 12),
                    _buildDetailItem('Tindakan Diberikan', record.tindakanDiberikan),
                    _buildDetailItem('Obat Diberikan', record.obatDiberikan),
                    _buildDetailItem('Rekomendasi', record.rekomendasi),
                    _buildDetailItem('Catatan Tambahan', record.catatan),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildModalSectionTitle(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.titleSm.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: 40,
          height: 3,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(1.5),
          ),
        ),
      ],
    );
  }

  Widget _buildModalGrid(List<Widget> children) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 2.4,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      children: children,
    );
  }

  Widget _buildModalGridItem(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.neutral50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: AppTextStyles.caption.copyWith(color: AppColors.neutral500),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String label, String? value) {
    final displayValue = (value == null || value.trim().isEmpty) ? '-' : value;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.neutral50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.neutral200),
      ),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.caption.copyWith(color: AppColors.neutral500),
          ),
          const SizedBox(height: 4),
          Text(
            displayValue,
            style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildWarningDetailItem(String label, String? value) {
    final hasWarning = value != null && value.trim().isNotEmpty && value.trim().toLowerCase() != 'tidak ada' && value.trim() != '-';
    if (!hasWarning) {
      return _buildDetailItem(label, value);
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.danger.withAlpha(15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.danger.withAlpha(50)),
      ),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 14),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.danger,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.bodyMd.copyWith(
              color: AppColors.danger,
              fontWeight: FontWeight.bold,
            ),
          ),
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
