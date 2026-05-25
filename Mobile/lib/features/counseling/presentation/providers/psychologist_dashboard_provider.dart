import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/counseling/domain/repositories/counseling_repository.dart';
import 'dart:developer';

class PsychologistDashboardProvider extends ChangeNotifier {
  final CounselingRepository _repository;
  bool _isAvailable = true;
  bool _isLoading = false;
  String? _error;

  Psychologist? _profile;
  List<Map<String, dynamic>> _upcomingBookings = [];
  List<Map<String, dynamic>> _stats = [];
  List<Map<String, dynamic>> _recentActivities = [];
  Map<String, dynamic> _currentSession = {};
  int _waitingCount = 0;
  int _confirmedCount = 0;
  int _reportsCount = 0;
  int _assessmentsCount = 0;
  int _todayAppointments = 0;
  int _upcomingAppointments = 0;
  int _completedToday = 0;
  int _completedThisMonth = 0;
  int _newToday = 0;

  PsychologistDashboardProvider({required CounselingRepository repository})
      : _repository = repository;

  bool get isAvailable => _isAvailable;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Psychologist? get profile => _profile;
  List<Map<String, dynamic>> get upcomingBookings => _upcomingBookings;
  List<Map<String, dynamic>> get stats => _stats;
  List<Map<String, dynamic>> get recentActivities => _recentActivities;
  Map<String, dynamic> get currentSession => _currentSession;
  int get waitingCount => _waitingCount;
  int get confirmedCount => _confirmedCount;
  int get reportsCount => _reportsCount;
  int get assessmentsCount => _assessmentsCount;
  int get todayAppointments => _todayAppointments;
  int get upcomingAppointments => _upcomingAppointments;
  int get completedToday => _completedToday;
  int get completedThisMonth => _completedThisMonth;
  int get newToday => _newToday;

  void toggleAvailability() {
    _isAvailable = !_isAvailable;
    notifyListeners();
    // Persist ke backend
    _repository.updateProfile({'is_aktif': _isAvailable}).catchError((e) {
      // Rollback jika gagal
      _isAvailable = !_isAvailable;
      notifyListeners();
      log('toggleAvailability error: $e');
    });
  }

  Future<void> updateProfileData(Map<String, dynamic> data) async {
    await _repository.updateProfile(data);
    // Reload profil setelah update
    await loadDashboardData();
  }

  Future<void> changePassword(String oldPassword, String newPassword, String confirmPassword) async {
    await _repository.changePassword(oldPassword, newPassword, confirmPassword);
  }

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _repository.getProfile(),
        _repository.getDashboard(),
      ]);

      _profile = results[0] as Psychologist;
      final dashboard = results[1] as Map<String, dynamic>;

      _stats = List<Map<String, dynamic>>.from(dashboard['stats'] ?? []);
      _upcomingBookings = List<Map<String, dynamic>>.from(dashboard['bookings'] ?? []);
      _currentSession = dashboard['current_session'] ?? {};
      _recentActivities = List<Map<String, dynamic>>.from(dashboard['recent_activities'] ?? []);
      _todayAppointments = (dashboard['today_appointments'] as num?)?.toInt() ?? 0;
      _upcomingAppointments = (dashboard['upcoming_appointments'] as num?)?.toInt() ?? 0;
      _completedToday = (dashboard['completed_today'] as num?)?.toInt() ?? 0;
      _completedThisMonth = (dashboard['completed_this_month'] as num?)?.toInt() ?? 0;
      _waitingCount = (dashboard['waiting_count'] as num?)?.toInt() ?? 0;
      _newToday = (dashboard['new_today'] as num?)?.toInt() ?? 0;
      _confirmedCount = (dashboard['confirmed_count'] as num?)?.toInt() ?? 0;
      _reportsCount = (dashboard['reports_count'] as num?)?.toInt() ?? 0;
      _assessmentsCount = (dashboard['assessments_count'] as num?)?.toInt() ?? 0;
      _isAvailable = _profile?.isAvailable ?? true;

      _error = null;
    } catch (e) {
      log('Error loading psychologist dashboard: $e');
      _error = 'Gagal memuat data dashboard';
    }

    _isLoading = false;
    notifyListeners();
  }

  void refresh() {
    loadDashboardData();
  }
}