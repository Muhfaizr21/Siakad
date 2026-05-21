import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/counseling_session.dart';
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

  void toggleAvailability() {
    _isAvailable = !_isAvailable;
    notifyListeners();
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
      _waitingCount = dashboard['waiting_count'] ?? 0;
      _confirmedCount = dashboard['confirmed_count'] ?? 0;
      _reportsCount = dashboard['reports_count'] ?? 0;
      _assessmentsCount = dashboard['assessments_count'] ?? 0;
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