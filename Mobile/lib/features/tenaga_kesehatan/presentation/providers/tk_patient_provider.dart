import 'package:flutter/foundation.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/patient.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/medical_record.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';

class TkPatientProvider extends ChangeNotifier {
  final TkRepository repository;

  TkPatientProvider({required this.repository});

  // State
  bool _isLoading = false;
  bool _isLoadingRecord = false;
  bool _isSaving = false;
  String? _error;
  List<Patient> _patients = [];
  Patient? _selectedPatient;
  List<MedicalRecord> _medicalRecords = [];

  // Getters
  bool get isLoading => _isLoading;
  bool get isLoadingRecord => _isLoadingRecord;
  bool get isSaving => _isSaving;
  String? get error => _error;
  List<Patient> get patients => _patients;
  Patient? get selectedPatient => _selectedPatient;
  List<MedicalRecord> get medicalRecords => _medicalRecords;

  List<Patient> get recentPatients => _patients.take(10).toList();

  Future<void> loadPatients() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _patients = await repository.getPatients();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<List<Patient>> searchPatients(String query) async {
    if (query.isEmpty) {
      return _patients;
    }
    try {
      return await repository.searchPatients(query);
    } catch (e) {
      // Fallback to local search
      return _patients.where((p) {
        return p.nama.toLowerCase().contains(query.toLowerCase()) ||
            p.nim.toLowerCase().contains(query.toLowerCase());
      }).toList();
    }
  }

  Future<void> selectPatient(Patient patient) async {
    _selectedPatient = patient;
    _medicalRecords = [];
    notifyListeners();

    // Load medical records
    await loadPatientMedicalRecord(patient.id);
  }

  Future<void> loadPatientMedicalRecord(int patientId) async {
    _isLoadingRecord = true;
    notifyListeners();

    try {
      final data = await repository.getPatientMedicalRecord(patientId);

      // Parse patient data if included
      if (data['patient'] != null && _selectedPatient == null) {
        _selectedPatient = Patient.fromJson(data['patient']);
      }

      // Parse medical records
      final records = data['records'] as List?;
      if (records != null) {
        _medicalRecords = records.map((json) => MedicalRecord.fromJson(json)).toList();
      }

      _isLoadingRecord = false;
      notifyListeners();
    } catch (e) {
      _isLoadingRecord = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<bool> createScreening({
    required int patientId,
    required double tinggiBadan,
    required double beratBadan,
    required int sistole,
    required int diastole,
    required double suhuTubuh,
    required int denyutNadi,
    required int spO2,
    required String hasil,
    String? jenisPemeriksaan,
    String? keluhan,
    int? skalaNyeri,
    String? riwayatPenyakit,
    String? alergiObat,
    String? kondisiPsikologis,
    String? tindakanDiberikan,
    String? obatDiberikan,
    String? catatan,
    String? rekomendasi,
    DateTime? tanggalScreening,
    String? sumberPemeriksaan,
    int? gulaDarah,
    String? golonganDarah,
    String? tesButaWarna,
    String? konsumsiObatTerkini,
    bool eskalasiPsikolog = false,
    bool eskalasiFakultas = false,
    int? bookingId,
  }) async {
    _isSaving = true;
    _error = null;
    notifyListeners();

    try {
      final data = {
        'tinggi_badan': tinggiBadan,
        'berat_badan': beratBadan,
        'sistole': sistole,
        'diastole': diastole,
        'suhu_tubuh': suhuTubuh,
        'denyut_nadi': denyutNadi,
        'sp_o2': spO2,
        'hasil': hasil,
        if (jenisPemeriksaan != null) 'jenis_pemeriksaan': jenisPemeriksaan,
        if (keluhan != null) 'keluhan': keluhan,
        if (skalaNyeri != null) 'skala_nyeri': skalaNyeri,
        if (riwayatPenyakit != null) 'riwayat_penyakit': riwayatPenyakit,
        if (alergiObat != null) 'alergi_obat': alergiObat,
        if (kondisiPsikologis != null) 'kondisi_psikologis': kondisiPsikologis,
        if (tindakanDiberikan != null) 'tindakan_diberikan': tindakanDiberikan,
        if (obatDiberikan != null) 'obat_diberikan': obatDiberikan,
        if (catatan != null) 'catatan': catatan,
        if (rekomendasi != null) 'rekomendasi': rekomendasi,
        if (tanggalScreening != null) 'tanggal_screening': tanggalScreening.toIso8601String(),
        if (sumberPemeriksaan != null) 'sumber_pemeriksaan': sumberPemeriksaan,
        if (gulaDarah != null) 'gula_darah': gulaDarah,
        if (golonganDarah != null) 'golongan_darah': golonganDarah,
        if (tesButaWarna != null) 'tes_buta_warna': tesButaWarna,
        if (konsumsiObatTerkini != null) 'konsumsi_obat_terkini': konsumsiObatTerkini,
        'eskalasi_psikolog': eskalasiPsikolog,
        'eskalasi_fakultas': eskalasiFakultas,
        if (bookingId != null) 'booking_id': bookingId,
      };

      final record = await repository.createScreening(patientId, data);
      _medicalRecords.insert(0, record);
      _isSaving = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isSaving = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearSelection() {
    _selectedPatient = null;
    _medicalRecords = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
