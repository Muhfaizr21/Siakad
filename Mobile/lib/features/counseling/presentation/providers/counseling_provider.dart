import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/repositories/counseling_repository.dart';
import 'dart:developer';

/// Provider untuk fitur psikolog: bookings, schedules, patients, session notes, dll.
class CounselingProvider extends ChangeNotifier {
  final CounselingRepository _repository;

  CounselingProvider({required CounselingRepository repository})
      : _repository = repository;

  // ─── Bookings ────────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _bookings = [];
  List<Map<String, dynamic>> get bookings => _bookings;

  bool _bookingsLoading = false;
  bool get bookingsLoading => _bookingsLoading;

  String? _bookingsError;
  String? get bookingsError => _bookingsError;

  Future<void> loadBookings() async {
    _bookingsLoading = true;
    _bookingsError = null;
    notifyListeners();
    try {
      _bookings = await _repository.getBookings();
    } catch (e) {
      log('CounselingProvider.loadBookings error: $e');
      _bookingsError = 'Gagal memuat data booking';
    }
    _bookingsLoading = false;
    notifyListeners();
  }

  Future<bool> updateBookingStatus(String id, String status, {String? note, String? linkMeeting}) async {
    try {
      await _repository.updateBookingStatus(id, status, note: note, linkMeeting: linkMeeting);
      // Update local state
      final idx = _bookings.indexWhere((b) => b['id'].toString() == id);
      if (idx != -1) {
        _bookings[idx] = Map<String, dynamic>.from(_bookings[idx])
          ..['status'] = status;
        if (linkMeeting != null && linkMeeting.isNotEmpty) {
          _bookings[idx]['link_meeting'] = linkMeeting;
        }
        notifyListeners();
      }
      return true;
    } catch (e) {
      log('CounselingProvider.updateBookingStatus error: $e');
      return false;
    }
  }

  // ─── Schedules ───────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _schedules = [];
  List<Map<String, dynamic>> get schedules => _schedules;

  bool _schedulesLoading = false;
  bool get schedulesLoading => _schedulesLoading;

  String? _schedulesError;
  String? get schedulesError => _schedulesError;

  Future<void> loadSchedules() async {
    _schedulesLoading = true;
    _schedulesError = null;
    notifyListeners();
    try {
      _schedules = await _repository.getSchedules();
    } catch (e) {
      log('CounselingProvider.loadSchedules error: $e');
      _schedulesError = 'Gagal memuat jadwal';
    }
    _schedulesLoading = false;
    notifyListeners();
  }

  Future<bool> saveSchedules(List<Map<String, dynamic>> schedules) async {
    try {
      final result = await _repository.saveSchedules(schedules);
      _schedules = result;
      notifyListeners();
      return true;
    } catch (e) {
      log('CounselingProvider.saveSchedules error: $e');
      return false;
    }
  }

  // ─── Patients ────────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _patients = [];
  List<Map<String, dynamic>> get patients => _patients;

  bool _patientsLoading = false;
  bool get patientsLoading => _patientsLoading;

  String? _patientsError;
  String? get patientsError => _patientsError;

  Future<void> loadPatients() async {
    _patientsLoading = true;
    _patientsError = null;
    notifyListeners();
    try {
      _patients = await _repository.getPatients();
    } catch (e) {
      log('CounselingProvider.loadPatients error: $e');
      _patientsError = 'Gagal memuat daftar pasien';
    }
    _patientsLoading = false;
    notifyListeners();
  }

  // ─── Medical Record ──────────────────────────────────────────────────────────
  Map<String, dynamic> _medicalRecord = {};
  Map<String, dynamic> get medicalRecord => _medicalRecord;

  bool _medicalRecordLoading = false;
  bool get medicalRecordLoading => _medicalRecordLoading;

  Future<void> loadMedicalRecord(String patientId) async {
    _medicalRecordLoading = true;
    notifyListeners();
    try {
      _medicalRecord = await _repository.getMedicalRecord(patientId);
    } catch (e) {
      log('CounselingProvider.loadMedicalRecord error: $e');
    }
    _medicalRecordLoading = false;
    notifyListeners();
  }

  Future<bool> createSessionNote(String patientId, Map<String, dynamic> data) async {
    try {
      await _repository.createSessionNote(patientId, data);
      return true;
    } catch (e) {
      log('CounselingProvider.createSessionNote error: $e');
      return false;
    }
  }

  Future<bool> updatePatientStatus(String patientId, String status, {String? notes}) async {
    try {
      await _repository.updatePatientStatus(patientId, status, notes: notes);
      // Update local patient status
      final idx = _patients.indexWhere((p) => p['id'].toString() == patientId);
      if (idx != -1) {
        _patients[idx] = Map<String, dynamic>.from(_patients[idx])
          ..['status'] = status;
        notifyListeners();
      }
      return true;
    } catch (e) {
      log('CounselingProvider.updatePatientStatus error: $e');
      return false;
    }
  }

  // ─── Assessments ─────────────────────────────────────────────────────────────
  Map<String, dynamic> _assessments = {};
  Map<String, dynamic> get assessments => _assessments;

  bool _assessmentsLoading = false;
  bool get assessmentsLoading => _assessmentsLoading;

  Future<void> loadAssessments() async {
    _assessmentsLoading = true;
    notifyListeners();
    try {
      _assessments = await _repository.getAssessments();
    } catch (e) {
      log('CounselingProvider.loadAssessments error: $e');
    }
    _assessmentsLoading = false;
    notifyListeners();
  }

  Future<bool> createAssessment(Map<String, dynamic> data) async {
    try {
      await _repository.createAssessment(data);
      await loadAssessments();
      return true;
    } catch (e) {
      log('CounselingProvider.createAssessment error: $e');
      return false;
    }
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────
  Map<String, dynamic> _analytics = {};
  Map<String, dynamic> get analytics => _analytics;

  bool _analyticsLoading = false;
  bool get analyticsLoading => _analyticsLoading;

  Future<void> loadAnalytics() async {
    _analyticsLoading = true;
    notifyListeners();
    try {
      _analytics = await _repository.getAnalytics();
    } catch (e) {
      log('CounselingProvider.loadAnalytics error: $e');
    }
    _analyticsLoading = false;
    notifyListeners();
  }

  // ─── Reports ─────────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _reports = [];
  List<Map<String, dynamic>> get reports => _reports;

  bool _reportsLoading = false;
  bool get reportsLoading => _reportsLoading;

  bool _creatingReport = false;
  bool get creatingReport => _creatingReport;

  Future<void> loadReports() async {
    _reportsLoading = true;
    notifyListeners();
    try {
      _reports = await _repository.getReports();
    } catch (e) {
      log('CounselingProvider.loadReports error: $e');
    }
    _reportsLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> createReport({required String tipe, required String periode}) async {
    _creatingReport = true;
    notifyListeners();
    try {
      final result = await _repository.createReport(tipe: tipe, periode: periode);
      await loadReports();
      return result;
    } catch (e) {
      log('CounselingProvider.createReport error: $e');
      return null;
    } finally {
      _creatingReport = false;
      notifyListeners();
    }
  }

  Future<String?> downloadReport(String reportId) async {
    try {
      return await _repository.downloadReport(reportId);
    } catch (e) {
      log('CounselingProvider.downloadReport error: $e');
      return null;
    }
  }

  // ─── Notifications ───────────────────────────────────────────────────────────
  List<Map<String, dynamic>> _notifications = [];
  List<Map<String, dynamic>> get notifications => _notifications;

  bool _notificationsLoading = false;
  bool get notificationsLoading => _notificationsLoading;

  int get unreadCount => _notifications.where((n) => n['unread'] == true).length;

  Future<void> loadNotifications() async {
    _notificationsLoading = true;
    notifyListeners();
    try {
      _notifications = await _repository.getNotifications();
    } catch (e) {
      log('CounselingProvider.loadNotifications error: $e');
    }
    _notificationsLoading = false;
    notifyListeners();
  }

  Future<void> markNotificationRead(String id) async {
    try {
      await _repository.markNotificationRead(id);
      final idx = _notifications.indexWhere((n) => n['id'].toString() == id);
      if (idx != -1) {
        _notifications[idx] = Map<String, dynamic>.from(_notifications[idx])
          ..['unread'] = false;
        notifyListeners();
      }
    } catch (e) {
      log('CounselingProvider.markNotificationRead error: $e');
    }
  }

  Future<void> markAllNotificationsRead() async {
    try {
      await _repository.markAllNotificationsRead();
      _notifications = _notifications
          .map((n) => Map<String, dynamic>.from(n)..['unread'] = false)
          .toList();
      notifyListeners();
    } catch (e) {
      log('CounselingProvider.markAllNotificationsRead error: $e');
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      await _repository.deleteNotification(id);
      _notifications.removeWhere((n) => n['id'].toString() == id);
      notifyListeners();
    } catch (e) {
      log('CounselingProvider.deleteNotification error: $e');
    }
  }
}
