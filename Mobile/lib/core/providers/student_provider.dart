import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/achievement.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/scholarship.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/aspiration.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/health_record.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/repositories/student_repository.dart';

class StudentProvider extends ChangeNotifier {
  final StudentRepository? _repository;

  StudentProvider({StudentRepository? repository}) : _repository = repository {
    if (_repository != null) {
      loadAllData();
    }
  }

  // Profile Data
  String name = "Tegar Syahputra";
  String nim = "2204123001";
  String prodi = "S1 Farmasi";
  String fakultas = "Fakultas Farmasi";
  String email = "tegar.syahputra@student.bku.ac.id";
  String phone = "0812-3456-7890";
  String birthPlaceDate = "Bandung, 12 Maret 2004";
  String gender = "Laki-laki";
  String address = "Jl. Soekarno Hatta No. 123, Bandung";
  String intakeYear = "2022";

  // Data Lists
  List<Mission> _missions = [];
  List<Achievement> _achievements = [];
  List<Scholarship> _scholarships = [];
  List<CounselingSession> _counselingSessions = [];
  List<Aspiration> _aspirations = [];
  List<HealthRecord> _healthRecords = [];
  
  final List<Psychologist> _availablePsychologists = [
    const Psychologist(
      id: 'P1',
      name: 'Dr. Sarah Amalia, M.Psi',
      nidn: '0412038801',
      specialization: 'Psikologi Klinis & Pendidikan',
      profileImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=200&auto=format&fit=crop',
    ),
    const Psychologist(
      id: 'P2',
      name: 'Rian Hidayat, S.Psi',
      nidn: '0415089002',
      specialization: 'Konseling Karir & Industri',
      profileImageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop',
    ),
  ];

  final List<Map<String, dynamic>> _schedules = [
    {'subject': 'Kimia Dasar', 'time': '08:00 - 10:00', 'room': 'Lab A1'},
    {'subject': 'Anatomi Fisiologi', 'time': '13:00 - 15:00', 'room': 'R. Teori 3'},
  ];

  // Loading States
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // Getters
  List<Mission> get missions => _missions;
  List<Achievement> get achievements => _achievements;
  List<Scholarship> get scholarships => _scholarships;
  List<CounselingSession> get counselingSessions => _counselingSessions;
  List<Aspiration> get aspirations => _aspirations;
  List<HealthRecord> get healthRecords => _healthRecords;
  List<Psychologist> get availablePsychologists => _availablePsychologists;
  List<Map<String, dynamic>> get schedules => _schedules;

  HealthRecord? get latestHealthRecord => _healthRecords.isNotEmpty ? _healthRecords.first : null;

  // Logic Getters
  double get totalScore {
    final quizzes = _missions.where((m) => m.type == 'Quiz').toList();
    if (quizzes.isEmpty) return 0;
    int total = quizzes.fold(0, (sum, q) => sum + q.score);
    return total / quizzes.length;
  }

  bool get isEligibleForCertificate => totalScore >= 75;
  int get pendingMissionsCount => _missions.where((m) => !m.isCompleted).length;
  int get completedMissionsCount => _missions.where((m) => m.isCompleted).length;
  double get missionProgress => _missions.isEmpty ? 0 : completedMissionsCount / _missions.length;
  int get totalAchievements => _achievements.length;
  int get validatedAchievements => _achievements.where((a) => a.status == 'Validated').length;
  int get pendingAchievements => _achievements.where((a) => a.status == 'Pending').length;
  int get syncedAchievements => _achievements.where((a) => a.isSynced).length;
  int get totalAspirations => _aspirations.length;
  int get pendingAspirations => _aspirations.where((a) => a.status == 'Pending' || a.status == 'In Progress').length;
  int get resolvedAspirations => _aspirations.where((a) => a.status == 'Resolved').length;

  // Data Loading
  Future<void> loadAllData() async {
    if (_repository == null) return;
    
    _isLoading = true;
    notifyListeners();

    try {
      _missions = await _repository.getMissions();
      _achievements = await _repository.getAchievements();
      _scholarships = await _repository.getScholarships();
      _counselingSessions = await _repository.getCounselingSessions();
      _aspirations = await _repository.getAspirations();
      _healthRecords = await _repository.getHealthRecords();
    } catch (e) {
      debugPrint('Error loading student data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Actions
  void addHealthRecord(HealthRecord record) {
    _healthRecords.insert(0, record);
    notifyListeners();
  }

  void toggleMission(String? id) {
    if (id == null) return;
    final index = _missions.indexWhere((m) => m.id == id);
    if (index != -1) {
      _missions[index].isCompleted = !_missions[index].isCompleted;
      notifyListeners();
    }
  }

  void addAchievement(Achievement achievement) {
    _achievements.insert(0, achievement);
    notifyListeners();
  }

  Future<void> applyForScholarship(String id) async {
    final index = _scholarships.indexWhere((s) => s.id == id);
    if (index != -1) {
      if (_repository != null) {
        await _repository.applyForScholarship(id);
      }
      
      final s = _scholarships[index];
      _scholarships[index] = Scholarship(
        id: s.id, 
        title: s.title, 
        provider: s.provider, 
        category: s.category, 
        deadline: s.deadline, 
        coverAmount: s.coverAmount, 
        description: s.description, 
        status: 'Applied', 
        applicationStatus: 'Review Berkas'
      );
      notifyListeners();
    }
  }

  void cancelScholarshipApplication(String id) {
    final index = _scholarships.indexWhere((s) => s.id == id);
    if (index != -1) {
      final s = _scholarships[index];
      _scholarships[index] = Scholarship(id: s.id, title: s.title, provider: s.provider, category: s.category, deadline: s.deadline, coverAmount: s.coverAmount, description: s.description, status: 'Open', applicationStatus: null);
      notifyListeners();
    }
  }

  void addAspiration(Aspiration aspiration) {
    _aspirations.insert(0, aspiration);
    notifyListeners();
  }

  void bookCounseling(CounselingSession session) {
    _counselingSessions.insert(0, session);
    notifyListeners();
  }
}
