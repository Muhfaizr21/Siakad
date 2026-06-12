import 'package:flutter/foundation.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/tk_profile.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';

class TkDashboardProvider extends ChangeNotifier {
  final TkRepository repository;

  TkDashboardProvider({required this.repository});

  // State
  bool _isLoading = false;
  String? _error;
  TkProfile? _profile;
  bool _isAvailable = true;

  // Dashboard stats
  int _totalDiperiksaHariIni = 0;
  int _belumScreening = 0;
  int _perluPerhatian = 0;
  int _bookingHariIniCount = 0;
  List<Map<String, dynamic>> _bookings = [];
  List<Map<String, dynamic>> _alerts = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  TkProfile? get profile => _profile;
  bool get isAvailable => _isAvailable;
  int get totalDiperiksaHariIni => _totalDiperiksaHariIni;
  int get belumScreening => _belumScreening;
  int get perluPerhatian => _perluPerhatian;
  int get bookingHariIniCount => _bookingHariIniCount;
  List<Map<String, dynamic>> get bookings => _bookings;
  List<Map<String, dynamic>> get alerts => _alerts;

  Future<void> loadDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Load profile and dashboard in parallel
      TkProfile? profileData;
      Map<String, dynamic> dashboardData = {};

      try {
        profileData = await repository.getProfile();
      } catch (_) {
        profileData = null;
      }

      try {
        dashboardData = await repository.getDashboard();
      } catch (_) {
        dashboardData = {};
      }

      if (profileData != null) {
        _profile = profileData;
      }

      // Parse dashboard data
      _totalDiperiksaHariIni = dashboardData['total_diperiksa_hari_ini'] ?? 0;
      _belumScreening = dashboardData['belum_screening'] ?? 0;
      _perluPerhatian = dashboardData['perlu_perhatian'] ?? 0;
      _bookingHariIniCount = dashboardData['booking_hari_ini_count'] ?? 0;
      _bookings = (dashboardData['bookings'] as List?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
      _alerts = (dashboardData['alerts'] as List?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    try {
      _profile = await repository.getProfile();
      notifyListeners();
    } catch (e) {
      debugPrint('Error refreshing profile: $e');
    }
  }

  Future<void> toggleAvailability() async {
    _isAvailable = !_isAvailable;
    notifyListeners();

    try {
      await repository.updateProfile({'is_aktif': _isAvailable});
    } catch (e) {
      // Revert on error
      _isAvailable = !_isAvailable;
      notifyListeners();
    }
  }

  Future<bool> updateProfileData(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await repository.updateProfile(data);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> changePassword(String oldPass, String newPass, String confirmPass) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await repository.changePassword(oldPass, newPass, confirmPass);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
