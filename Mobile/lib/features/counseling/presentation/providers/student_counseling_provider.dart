import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'dart:developer';

/// Provider untuk fitur konseling dari sisi mahasiswa.
/// Mengelola: list psikolog, jadwal tersedia, booking mahasiswa, medical record.
class StudentCounselingProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  StudentCounselingProvider({required ApiClient apiClient})
      : _apiClient = apiClient;

  // ─── Psychologists ───────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _psychologists = [];
  List<Map<String, dynamic>> get psychologists => _psychologists;

  bool _psychologistsLoading = false;
  bool get psychologistsLoading => _psychologistsLoading;

  String? _psychologistsError;
  String? get psychologistsError => _psychologistsError;

  Future<void> loadPsychologists({String? search}) async {
    _psychologistsLoading = true;
    _psychologistsError = null;
    notifyListeners();
    try {
      final queryParams = search != null && search.isNotEmpty
          ? {'search': search}
          : <String, dynamic>{};
      final response = await _apiClient.client.get(
        '/counseling/psychologists',
        queryParameters: queryParams,
      );
      final data = response.data['data'];
      if (data is List) {
        _psychologists = data.cast<Map<String, dynamic>>();
      } else {
        _psychologists = [];
      }
    } catch (e) {
      log('StudentCounselingProvider.loadPsychologists error: $e');
      _psychologistsError = 'Gagal memuat daftar psikolog';
    }
    _psychologistsLoading = false;
    notifyListeners();
  }

  // ─── Available Schedules ─────────────────────────────────────────────────────
  List<Map<String, dynamic>> _availableSchedules = [];
  List<Map<String, dynamic>> get availableSchedules => _availableSchedules;

  bool _schedulesLoading = false;
  bool get schedulesLoading => _schedulesLoading;

  String? _schedulesError;
  String? get schedulesError => _schedulesError;

  Future<void> loadAvailableSchedules() async {
    _schedulesLoading = true;
    _schedulesError = null;
    notifyListeners();
    try {
      final response =
          await _apiClient.client.get('/counseling/psychologist-schedules');
      final data = response.data['data'];
      if (data is List) {
        _availableSchedules = data.cast<Map<String, dynamic>>();
      } else {
        _availableSchedules = [];
      }
    } catch (e) {
      log('StudentCounselingProvider.loadAvailableSchedules error: $e');
      _schedulesError = 'Gagal memuat jadwal psikolog';
    }
    _schedulesLoading = false;
    notifyListeners();
  }

  // ─── Psychologist Schedules (per psikolog) ───────────────────────────────────
  Map<String, dynamic> _psychologistDetail = {};
  Map<String, dynamic> get psychologistDetail => _psychologistDetail;

  List<Map<String, dynamic>> _psychologistSlots = [];
  List<Map<String, dynamic>> get psychologistSlots => _psychologistSlots;

  bool _psychologistDetailLoading = false;
  bool get psychologistDetailLoading => _psychologistDetailLoading;

  Future<void> loadPsychologistSchedules(String psychologistId) async {
    _psychologistDetailLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.client
          .get('/counseling/psychologists/$psychologistId/schedules');
      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        _psychologistDetail =
            (data['psychologist'] as Map<String, dynamic>?) ?? {};
        final slots = data['slots'];
        if (slots is List) {
          _psychologistSlots = slots.cast<Map<String, dynamic>>();
        } else {
          _psychologistSlots = [];
        }
      }
    } catch (e) {
      log('StudentCounselingProvider.loadPsychologistSchedules error: $e');
    }
    _psychologistDetailLoading = false;
    notifyListeners();
  }

  // ─── My Bookings ─────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _myBookings = [];
  List<Map<String, dynamic>> get myBookings => _myBookings;

  bool _myBookingsLoading = false;
  bool get myBookingsLoading => _myBookingsLoading;

  String? _myBookingsError;
  String? get myBookingsError => _myBookingsError;

  Future<void> loadMyBookings() async {
    _myBookingsLoading = true;
    _myBookingsError = null;
    notifyListeners();
    try {
      final response =
          await _apiClient.client.get('/counseling/psychologist-bookings');
      final data = response.data['data'];
      if (data is List) {
        _myBookings = data.cast<Map<String, dynamic>>();
      } else {
        _myBookings = [];
      }
    } catch (e) {
      log('StudentCounselingProvider.loadMyBookings error: $e');
      _myBookingsError = 'Gagal memuat riwayat booking';
    }
    _myBookingsLoading = false;
    notifyListeners();
  }

  // ─── Medical Record (student view) ──────────────────────────────────────────
  Map<String, dynamic> _myMedicalRecord = {};
  Map<String, dynamic> get myMedicalRecord => _myMedicalRecord;

  bool _medicalRecordLoading = false;
  bool get medicalRecordLoading => _medicalRecordLoading;

  Future<void> loadMyMedicalRecord() async {
    _medicalRecordLoading = true;
    notifyListeners();
    try {
      final response =
          await _apiClient.client.get('/counseling/medical-record');
      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        _myMedicalRecord = data;
      }
    } catch (e) {
      log('StudentCounselingProvider.loadMyMedicalRecord error: $e');
    }
    _medicalRecordLoading = false;
    notifyListeners();
  }

  // ─── Create Booking ──────────────────────────────────────────────────────────
  bool _bookingLoading = false;
  bool get bookingLoading => _bookingLoading;

  String? _bookingError;
  String? get bookingError => _bookingError;

  Future<bool> createBooking({
    required int psikologId,
    required int slotId,
    required String date,
    required String start,
    required String end,
    required String topic,
    String complaint = '',
    String mode = 'Tatap Muka',
  }) async {
    _bookingLoading = true;
    _bookingError = null;
    notifyListeners();
    try {
      await _apiClient.client.post('/counseling/psychologist-bookings', data: {
        'psikolog_id': psikologId,
        'slot_id': slotId,
        'date': date,
        'start': start,
        'end': end,
        'topic': topic,
        'complaint': complaint,
        'mode': mode,
      });
      // Refresh bookings after successful creation
      await loadMyBookings();
      _bookingLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      log('StudentCounselingProvider.createBooking error: $e');
      _bookingError = _extractErrorMessage(e);
      _bookingLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      await _apiClient.client
          .delete('/counseling/psychologist-bookings/$bookingId');
      _myBookings.removeWhere((b) => b['id'].toString() == bookingId);
      notifyListeners();
      return true;
    } catch (e) {
      log('StudentCounselingProvider.cancelBooking error: $e');
      return false;
    }
  }

  // ─── Faculty Statistics ──────────────────────────────────────────────────────
  List<Map<String, dynamic>> _facultyStats = [];
  List<Map<String, dynamic>> get facultyStats => _facultyStats;

  Future<void> loadFacultyStatistics() async {
    try {
      final response =
          await _apiClient.client.get('/counseling/faculty-statistics');
      final data = response.data['data'];
      if (data is List) {
        _facultyStats = data.cast<Map<String, dynamic>>();
        notifyListeners();
      }
    } catch (e) {
      log('StudentCounselingProvider.loadFacultyStatistics error: $e');
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  String _extractErrorMessage(dynamic e) {
    try {
      final response = (e as dynamic).response;
      if (response != null) {
        final msg = response.data['message'] ?? response.data['error'];
        if (msg != null) return msg.toString();
      }
    } catch (_) {}
    return 'Terjadi kesalahan. Coba lagi.';
  }

  // ─── Submit Assessment Result (mahasiswa) ────────────────────────────────────
  bool _assessmentSubmitting = false;
  bool get assessmentSubmitting => _assessmentSubmitting;

  /// Mahasiswa submit hasil asesmen ke backend.
  /// Backend menyimpan ke tabel psikolog.assessments dengan:
  /// - nama = nama asesmen (e.g. "DASS-21")
  /// - kategori = kategori
  /// - skor = hasil kalkulasi (Normal/Sedang/Tinggi/Berat)
  /// - status = "Selesai"
  /// - metadata = jawaban detail dalam JSON
  Future<bool> submitAssessmentResult({
    required String assessmentName,
    required String kategori,
    required String skor,
    required Map<int, int> answers,
    String deskripsi = '',
  }) async {
    _assessmentSubmitting = true;
    notifyListeners();
    try {
      // Convert answers map ke JSON-serializable format
      final answersJson = <String, dynamic>{};
      answers.forEach((k, v) => answersJson['q$k'] = v);

      await _apiClient.client.post('/psychologist/assessments', data: {
        'nama': assessmentName,
        'kategori': kategori,
        'deskripsi': deskripsi.isNotEmpty
            ? deskripsi
            : 'Asesmen mandiri oleh mahasiswa',
        'skor': skor,
        'status': 'Selesai',
        'metadata': answersJson,
      });
      _assessmentSubmitting = false;
      notifyListeners();
      return true;
    } catch (e) {
      log('StudentCounselingProvider.submitAssessmentResult error: $e');
      _assessmentSubmitting = false;
      notifyListeners();
      return false;
    }
  }
}
