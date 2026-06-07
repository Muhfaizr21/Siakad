import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';

class TkScreeningInputScreen extends StatefulWidget {
  final int? patientId;

  const TkScreeningInputScreen({super.key, this.patientId});

  @override
  State<TkScreeningInputScreen> createState() => _TkScreeningInputScreenState();
}

class _TkScreeningInputScreenState extends State<TkScreeningInputScreen> {
  late final PageController _pageController;
  late int _currentStep;

  // Form Controllers
  final _searchController = TextEditingController();

  // Step 2: Vital Signs
  double _tinggiBadan = 160;
  double _beratBadan = 55;
  int _sistole = 120;
  int _diastole = 80;
  double _suhuTubuh = 36.5;
  int _denyutNadi = 80;
  int _spO2 = 98;

  @override
  void initState() {
    super.initState();
    _currentStep = widget.patientId != null ? 1 : 0;
    _pageController = PageController(initialPage: _currentStep);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.patientId != null) {
        final provider = context.read<TkPatientProvider>();
        if (provider.selectedPatient != null &&
            provider.selectedPatient!.id == widget.patientId) {
          // Patient already selected, do nothing
        } else {
          final idx = provider.patients.indexWhere(
            (p) => p.id == widget.patientId,
          );
          if (idx != -1) {
            provider.selectPatient(provider.patients[idx]);
          } else {
            provider.loadPatientMedicalRecord(widget.patientId!).then((_) {
              if (mounted && provider.selectedPatient == null) {
                setState(() {
                  _currentStep = 0;
                });
                if (_pageController.hasClients) {
                  _pageController.jumpToPage(0);
                }
              }
            });
          }
        }
      }
    });
  }

  // Step 3: Subjective
  String _keluhan = '';
  int _skalaNyeri = 0;
  String _riwayatPenyakit = '';
  String _alergiObat = '';
  String _kondisiPsikologis = 'Normal';

  // Step 4: Actions
  String _tindakanDiberikan = '';
  String _obatDiberikan = '';
  String _catatan = '';
  String _rekomendasi = '';
  bool _eskalasiPsikolog = false;
  bool _eskalasiFakultas = false;

  // Step 5: Status
  String _hasil = 'Layak Kegiatan';

  bool _isSaving = false;

  @override
  void dispose() {
    _pageController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  double get _bmi {
    if (_tinggiBadan <= 0 || _beratBadan <= 0) return 0;
    final tinggiMeter = _tinggiBadan / 100;
    return _beratBadan / (tinggiMeter * tinggiMeter);
  }

  String get _bmiCategory {
    if (_bmi < 18.5) return 'Kekurangan BB';
    if (_bmi < 25) return 'Normal';
    if (_bmi < 30) return 'Kelebihan BB';
    return 'Obesitas';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TkPatientProvider>(
      builder: (context, provider, child) {
        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.close_rounded),
              onPressed: () => _showExitConfirmation(),
            ),
            title: Text(
              'Input Screening',
              style: AppTextStyles.titleMd.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          body:
              provider.isLoadingRecord &&
                      widget.patientId != null &&
                      provider.selectedPatient == null
                  ? const Center(child: CircularProgressIndicator())
                  : Column(
                    children: [
                      // Progress Indicator
                      _buildProgressIndicator(),

                      // Page Content
                      Expanded(
                        child: PageView(
                          controller: _pageController,
                          physics: const NeverScrollableScrollPhysics(),
                          onPageChanged: (index) {
                            setState(() => _currentStep = index);
                          },
                          children: [
                            _buildPatientSelectionStep(),
                            _buildVitalSignsStep(),
                            _buildSubjectiveStep(),
                            _buildActionsStep(),
                            _buildStatusStep(),
                          ],
                        ),
                      ),

                      // Navigation Buttons
                      _buildNavigationButtons(provider),
                    ],
                  ),
        );
      },
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Row(
        children: List.generate(5, (index) {
          final isActive = index <= _currentStep;
          final isCompleted = index < _currentStep;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : AppColors.neutral200,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child:
                        isCompleted
                            ? const Icon(
                              Icons.check_rounded,
                              color: Colors.white,
                              size: 16,
                            )
                            : Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color:
                                    isActive
                                        ? Colors.white
                                        : AppColors.neutral500,
                              ),
                            ),
                  ),
                ),
                if (index < 4)
                  Expanded(
                    child: Container(
                      height: 2,
                      color:
                          isCompleted
                              ? AppColors.primary
                              : AppColors.neutral200,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildPatientSelectionStep() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionTitle('Identifikasi Pasien'),
        const SizedBox(height: 8),
        Text(
          'Cari pasien berdasarkan Nama atau NIM',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 16),

        // QR Scan Button
        GestureDetector(
          onTap: () => context.push('/tk/qr-scan'),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF001A4D), Color(0xFF003A6E)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF001A4D).withAlpha(40),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(40),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.qr_code_scanner_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Scan QR Code',
                        style: AppTextStyles.bodyMd.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Arahkan kamera ke kartu mahasiswa',
                        style: AppTextStyles.labelSm.copyWith(
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(40),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.arrow_forward_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Divider with text
        Row(
          children: [
            Expanded(child: Divider(color: AppColors.neutral200)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'atau cari manual',
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.neutral400,
                ),
              ),
            ),
            Expanded(child: Divider(color: AppColors.neutral200)),
          ],
        ),

        const SizedBox(height: 24),

        // Search Field
        TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Ketik Nama atau NIM...',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.neutral200),
            ),
            prefixIcon: const Icon(
              Icons.search_rounded,
              color: AppColors.neutral500,
            ),
          ),
          onChanged: (value) async {
            if (value.length >= 3) {
              await context.read<TkPatientProvider>().searchPatients(value);
            }
          },
        ),
        const SizedBox(height: 24),
        Consumer<TkPatientProvider>(
          builder: (context, provider, child) {
            if (provider.patients.isEmpty) {
              return const SizedBox.shrink();
            }
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hasil Pencarian',
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
                const SizedBox(height: 12),
                ...provider.patients.take(5).map((patient) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      onTap: () {
                        provider.selectPatient(patient);
                        _goToNextStep();
                      },
                      leading: CircleAvatar(
                        backgroundColor: AppColors.primary.withAlpha(15),
                        child: Text(
                          patient.initials,
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(patient.nama),
                      subtitle: Text('${patient.nim} • ${patient.prodi}'),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.neutral200),
                      ),
                    ),
                  );
                }),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildVitalSignsStep() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionTitle('Data Vital'),
        const SizedBox(height: 8),
        Text(
          'Ukur dan input data vital pasien',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 24),

        // BMI Display
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(10),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BMI',
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      _bmi.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _bmiCategory,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Body Measurements
        _buildMeasurementRow(
          'Tinggi Badan (cm)',
          _tinggiBadan,
          (v) {
            setState(() => _tinggiBadan = v);
          },
          100,
          220,
        ),
        const SizedBox(height: 16),
        _buildMeasurementRow(
          'Berat Badan (kg)',
          _beratBadan,
          (v) {
            setState(() => _beratBadan = v);
          },
          30,
          200,
        ),
        const SizedBox(height: 24),

        // Blood Pressure
        _buildSectionTitle('Tekanan Darah'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildSliderInput(
                'Sistolik',
                _sistole.toDouble(),
                (v) => setState(() => _sistole = v.round()),
                60,
                200,
                'mmHg',
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSliderInput(
                'Diastolik',
                _diastole.toDouble(),
                (v) => setState(() => _diastole = v.round()),
                40,
                130,
                'mmHg',
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Other Vitals
        _buildSliderInput(
          'Suhu Tubuh',
          _suhuTubuh,
          (v) {
            setState(() => _suhuTubuh = v);
          },
          35,
          42,
          '°C',
          divisions: 140,
        ),
        const SizedBox(height: 16),
        _buildSliderInput(
          'Denyut Nadi',
          _denyutNadi.toDouble(),
          (v) {
            setState(() => _denyutNadi = v.round());
          },
          40,
          150,
          'bpm',
        ),
        const SizedBox(height: 16),
        _buildSliderInput(
          'SpO2',
          _spO2.toDouble(),
          (v) {
            setState(() => _spO2 = v.round());
          },
          80,
          100,
          '%',
        ),
      ],
    );
  }

  Widget _buildSubjectiveStep() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionTitle('Data Subjektif'),
        const SizedBox(height: 8),
        Text(
          'Informasi dari keluhan pasien',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 24),

        // Keluhan
        _buildTextArea(
          'Keluhan Utama',
          _keluhan,
          (v) => _keluhan = v,
          hint: 'Ceritakan keluhan yang dirasakan...',
        ),
        const SizedBox(height: 16),

        // Skala Nyeri
        _buildSectionTitle('Skala Nyeri'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: _skalaNyeri.toDouble(),
                min: 0,
                max: 10,
                divisions: 10,
                activeColor: AppColors.primary,
                onChanged: (v) => setState(() => _skalaNyeri = v.round()),
              ),
            ),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getNyeriColor(_skalaNyeri),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  '$_skalaNyeri',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Riwayat Penyakit
        _buildTextArea(
          'Riwayat Penyakit',
          _riwayatPenyakit,
          (v) => _riwayatPenyakit = v,
          hint: 'Asma, Diabetes, Jantung, dll',
        ),
        const SizedBox(height: 16),

        // Alergi Obat
        _buildTextArea(
          'Alergi Obat',
          _alergiObat,
          (v) => _alergiObat = v,
          hint: 'Daftar alergi obat jika ada',
        ),
        const SizedBox(height: 16),

        // Kondisi Psikologis
        _buildSectionTitle('Kondisi Psikologis'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children:
              ['Normal', 'Cemas', 'Stres', 'Perlu Rujukan Psikolog'].map((
                option,
              ) {
                final isSelected = _kondisiPsikologis == option;
                return ChoiceChip(
                  label: Text(option),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _kondisiPsikologis = option);
                      if (option == 'Perlu Rujukan Psikolog') {
                        setState(() => _eskalasiPsikolog = true);
                      }
                    }
                  },
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.neutral600,
                    fontWeight: FontWeight.w500,
                  ),
                );
              }).toList(),
        ),
      ],
    );
  }

  Widget _buildActionsStep() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionTitle('Tindakan & Penanganan'),
        const SizedBox(height: 8),
        Text(
          'Input tindakan yang diberikan',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 24),

        // Tindakan
        _buildSectionTitle('Tindakan Diberikan'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              [
                'Istirahat',
                'Obat P3K',
                'Rujukan Klinik',
                'Rujukan RS',
                'Tidak Ada',
              ].map((option) {
                final isSelected = _tindakanDiberikan.contains(option);
                return FilterChip(
                  label: Text(option),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _tindakanDiberikan = option;
                      } else {
                        _tindakanDiberikan = '';
                      }
                    });
                  },
                  selectedColor: AppColors.primary.withAlpha(30),
                );
              }).toList(),
        ),
        const SizedBox(height: 16),

        // Obat
        _buildTextArea(
          'Obat Diberikan',
          _obatDiberikan,
          (v) => _obatDiberikan = v,
          hint: 'Nama obat dan dosis',
        ),
        const SizedBox(height: 16),

        // Catatan
        _buildTextArea(
          'Catatan Tenaga Kesehatan',
          _catatan,
          (v) => _catatan = v,
          hint: 'Observasi objektif...',
        ),
        const SizedBox(height: 16),

        // Rekomendasi
        _buildTextArea(
          'Rekomendasi',
          _rekomendasi,
          (v) => _rekomendasi = v,
          hint: 'Saran tindak lanjut...',
        ),
        const SizedBox(height: 24),

        // Eskalasi
        _buildSectionTitle('Eskalasi (Opsional)'),
        const SizedBox(height: 8),
        SwitchListTile(
          title: const Text('Rujuk ke Psikolog'),
          subtitle: const Text('Kirim notifikasi ke psikolog'),
          value: _eskalasiPsikolog,
          onChanged: (v) => setState(() => _eskalasiPsikolog = v),
          activeThumbColor: AppColors.primary,
        ),
        SwitchListTile(
          title: const Text('Lapor ke Admin Fakultas'),
          subtitle: const Text('Untuk kasus kritis'),
          value: _eskalasiFakultas,
          onChanged: (v) => setState(() => _eskalasiFakultas = v),
          activeThumbColor: AppColors.danger,
        ),
      ],
    );
  }

  Widget _buildStatusStep() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionTitle('Status Akhir'),
        const SizedBox(height: 8),
        Text(
          'Tentukan status kesehatan pasien',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.neutral500),
        ),
        const SizedBox(height: 24),

        // Status Options
        _buildStatusOption(
          'Layak Kegiatan',
          '✅ Pasien dapat mengikuti kegiatan',
          AppColors.success,
        ),
        const SizedBox(height: 12),
        _buildStatusOption(
          'Perlu Perhatian',
          '⚠️ Perlu pantauan dan tindak lanjut',
          AppColors.warning,
        ),
        const SizedBox(height: 12),
        _buildStatusOption(
          'Tidak Layak',
          '🚫 Tidak dapat mengikuti kegiatan',
          AppColors.danger,
        ),

        const SizedBox(height: 32),

        // Summary
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.neutral200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ringkasan Screening',
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildSummaryRow(
                'BMI',
                '${_bmi.toStringAsFixed(1)} ($_bmiCategory)',
              ),
              _buildSummaryRow('Tekanan Darah', '$_sistole/$_diastole mmHg'),
              _buildSummaryRow(
                'Suhu Tubuh',
                '${_suhuTubuh.toStringAsFixed(1)}°C',
              ),
              _buildSummaryRow('Denyut Nadi', '$_denyutNadi bpm'),
              _buildSummaryRow('SpO2', '$_spO2%'),
              if (_alergiObat.isNotEmpty)
                _buildSummaryRow('Alergi', _alergiObat),
              if (_tindakanDiberikan.isNotEmpty)
                _buildSummaryRow('Tindakan', _tindakanDiberikan),
              _buildSummaryRow('Status', _hasil),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationButtons(TkPatientProvider provider) {
    final isNextDisabled =
        _currentStep == 0 && provider.selectedPatient == null;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _goToPrevStep,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: AppColors.neutral300),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Kembali'),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed:
                    _currentStep == 4
                        ? _handleSubmit
                        : (isNextDisabled ? null : _goToNextStep),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      isNextDisabled ? AppColors.neutral300 : AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child:
                    _isSaving
                        ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                        : Text(
                          _currentStep == 4 ? 'Simpan Screening' : 'Lanjut',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleSm.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.neutral800,
      ),
    );
  }

  Widget _buildTextArea(
    String label,
    String value,
    Function(String) onChanged, {
    String? hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral600),
        ),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: value,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.neutral200),
            ),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildMeasurementRow(
    String label,
    double value,
    Function(double) onChanged,
    double min,
    double max,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: AppTextStyles.labelSm.copyWith(
                color: AppColors.neutral600,
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                value.toStringAsFixed(0),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ],
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          activeColor: AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildSliderInput(
    String label,
    double value,
    Function(double) onChanged,
    double min,
    double max,
    String unit, {
    int? divisions,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: AppTextStyles.labelSm.copyWith(
                color: AppColors.neutral600,
              ),
            ),
            const Spacer(),
            Text(
              '${value.toStringAsFixed(1)} $unit',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          divisions: divisions,
          activeColor: AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildStatusOption(String status, String description, Color color) {
    final isSelected = _hasil == status;
    return GestureDetector(
      onTap: () => setState(() => _hasil = status),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? color.withAlpha(15) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : AppColors.neutral200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isSelected ? color : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 2),
              ),
              child:
                  isSelected
                      ? const Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 16,
                      )
                      : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    status,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? color : AppColors.neutral800,
                    ),
                  ),
                  Text(
                    description,
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.neutral500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTextStyles.labelSm.copyWith(
                color: AppColors.neutral500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodySm.copyWith(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Color _getNyeriColor(int value) {
    if (value <= 3) return AppColors.success;
    if (value <= 6) return AppColors.warning;
    return AppColors.danger;
  }

  void _goToNextStep() {
    if (_currentStep < 4) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _goToPrevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _handleSubmit() async {
    final provider = context.read<TkPatientProvider>();
    final patient = provider.selectedPatient;

    if (patient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih pasien terlebih dahulu'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    final success = await provider.createScreening(
      patientId: patient.id,
      tinggiBadan: _tinggiBadan,
      beratBadan: _beratBadan,
      sistole: _sistole,
      diastole: _diastole,
      suhuTubuh: _suhuTubuh,
      denyutNadi: _denyutNadi,
      spO2: _spO2,
      hasil: _hasil,
      keluhan: _keluhan.isNotEmpty ? _keluhan : null,
      skalaNyeri: _skalaNyeri > 0 ? _skalaNyeri : null,
      riwayatPenyakit: _riwayatPenyakit.isNotEmpty ? _riwayatPenyakit : null,
      alergiObat: _alergiObat.isNotEmpty ? _alergiObat : null,
      kondisiPsikologis: _kondisiPsikologis,
      tindakanDiberikan:
          _tindakanDiberikan.isNotEmpty ? _tindakanDiberikan : null,
      obatDiberikan: _obatDiberikan.isNotEmpty ? _obatDiberikan : null,
      catatan: _catatan.isNotEmpty ? _catatan : null,
      rekomendasi: _rekomendasi.isNotEmpty ? _rekomendasi : null,
      eskalasiPsikolog: _eskalasiPsikolog,
      eskalasiFakultas: _eskalasiFakultas,
    );

    setState(() => _isSaving = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Data screening berhasil disimpan'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Gagal menyimpan data'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  void _showExitConfirmation() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Batal Screening?'),
            content: const Text('Data yang sudah diinput akan hilang.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Lanjut'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  context.pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.danger,
                ),
                child: const Text('Batal'),
              ),
            ],
          ),
    );
  }
}
