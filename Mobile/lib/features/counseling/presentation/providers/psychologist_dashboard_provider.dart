import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/counseling_session.dart';

class PsychologistDashboardProvider extends ChangeNotifier {
  bool _isAvailable = true;
  bool _isLoading = false;
  
  Psychologist? _profile;
  List<CounselingSession> _upcomingSessions = [];

  bool get isAvailable => _isAvailable;
  bool get isLoading => _isLoading;
  Psychologist? get profile => _profile;
  List<CounselingSession> get upcomingSessions => _upcomingSessions;

  void toggleAvailability() {
    _isAvailable = !_isAvailable;
    // In real app, call repository here
    notifyListeners();
  }

  Future<void> loadDashboardData() async {
    _isLoading = true;
    notifyListeners();

    // Mock delay
    await Future.delayed(const Duration(seconds: 1));

    // Mock profile
    _profile = const Psychologist(
      id: '1',
      name: 'DR. SARAH SP.PSI',
      nidn: '0421039201',
      specialization: 'PSIKOLOG KLINIS',
      profileImageUrl: 'https://ui-avatars.com/api/?name=Sarah+Psychologist&background=003399&color=fff&size=128',
    );

    _isLoading = false;
    notifyListeners();
  }
}
