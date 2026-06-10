import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/achievement.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/scholarship.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/mission.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/aspiration.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/health_record.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/organization_history.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/repositories/student_repository.dart';
import 'package:bkuhub_mobile/core/services/auth_service.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/pkkmb_event.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/campus_news.dart';
import 'package:bkuhub_mobile/features/mahasiswa/domain/entities/faculty_progress.dart';
import 'package:bkuhub_mobile/features/mahasiswa/data/models/scholarship_model.dart';

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
  int semester = 1;
  double ipk = 3.85;
  int totalSks = 112;

  // Data Lists
  List<Mission> _missions = [];
  List<Achievement> _achievements = [];
  List<Scholarship> _scholarships = [];
  List<CounselingSession> _counselingSessions = [];
  List<Aspiration> _aspirations = [];
  List<HealthRecord> _healthRecords = [];
  List<OrganizationHistory> _organizationHistory = [];
  List<PkkmbEvent> _pkkmbEvents = [];
  List<CampusNews> _campusNews = [];
  List<FacultyProgress> _facultyProgress = [];
  
  List<Psychologist> _availablePsychologists = [
    const Psychologist(
      id: 'P1',
      name: 'Dr. Sarah Amalia, M.Psi',
      nidn: '0412038801',
      specialization: 'Psikologi Klinis & Pendidikan',
      profileImageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200&auto=format&fit=crop',
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
  List<OrganizationHistory> get organizationHistory => _organizationHistory;
  List<Psychologist> get availablePsychologists => _availablePsychologists;
  List<PkkmbEvent> get pkkmbEvents => _pkkmbEvents;
  List<CampusNews> get campusNews => _campusNews;
  List<FacultyProgress> get facultyProgress => _facultyProgress;
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
  int get validatedAchievements => _achievements.where((a) => a.status == 'Validated' || a.status == 'Diverifikasi').length;
  int get pendingAchievements => _achievements.where((a) => a.status == 'Pending' || a.status == 'Menunggu').length;
  int get syncedAchievements => _achievements.where((a) => a.isSynced || a.status == 'Diverifikasi').length;
  int get totalAspirations => _aspirations.length;
  int get pendingAspirations => _aspirations.where((a) => a.status == 'Pending' || a.status == 'In Progress').length;
  int get resolvedAspirations => _aspirations.where((a) => a.status == 'Resolved').length;

  // Data Loading
  Future<void> loadAllData() async {
    if (_repository == null) return;
    
    _isLoading = true;
    notifyListeners();

    try {
      // Dynamic profile sync from session
      final userData = AuthService().userData;
      if (userData != null) {
        final m = userData['mahasiswa'] ?? userData['data']?['mahasiswa'] ?? userData;
        name = m['nama']?.toString() ?? m['Nama']?.toString() ?? name;
        nim = m['nim']?.toString() ?? m['NIM']?.toString() ?? nim;
        
        final prodiObj = m['ProgramStudi'] ?? m['program_studi'];
        if (prodiObj != null) {
          prodi = "${prodiObj['jenjang'] ?? prodiObj['Jenjang'] ?? ''} ${prodiObj['nama'] ?? prodiObj['Nama'] ?? ''}".trim();
        } else {
          prodi = m['prodi']?.toString() ?? prodi;
        }

        final fakObj = m['Fakultas'] ?? m['fakultas'];
        if (fakObj != null) {
          fakultas = fakObj['nama']?.toString() ?? fakObj['Nama']?.toString() ?? fakultas;
        } else {
          fakultas = m['fakultas']?.toString() ?? fakultas;
        }

        email = m['email_kampus']?.toString() ?? m['EmailKampus']?.toString() ?? m['email']?.toString() ?? email;
        phone = m['no_hp']?.toString() ?? m['NoHP']?.toString() ?? phone;
        address = m['alamat']?.toString() ?? m['Alamat']?.toString() ?? address;
        gender = m['jenis_kelamin']?.toString() ?? m['JenisKelamin']?.toString() ?? gender;
        intakeYear = (m['tahun_masuk'] ?? m['TahunMasuk'] ?? intakeYear).toString();
        semester = int.tryParse((m['semester_sekarang'] ?? m['SemesterSekarang'] ?? '').toString()) ?? semester;
        ipk = double.tryParse((m['ipk'] ?? m['IPK'] ?? '3.85').toString()) ?? 3.85;
        totalSks = int.tryParse((m['total_sks'] ?? m['TotalSKS'] ?? '112').toString()) ?? 112;
        
        final tempatLahir = m['tempat_lahir']?.toString() ?? m['TempatLahir'] ?? '';
        final tanggalLahir = m['tanggal_lahir']?.toString() ?? m['TanggalLahir'] ?? '';
        if (tempatLahir.isNotEmpty) {
          birthPlaceDate = "$tempatLahir, ${tanggalLahir.split('T').first}";
        }
      }

      _missions = await _repository.getMissions();
      _achievements = await _repository.getAchievements();
      _scholarships = List<Scholarship>.from(await _repository.getScholarships());
      _counselingSessions = await _repository.getCounselingSessions();
      try {
        final psychologistsList = await _repository.getPsychologists();
        if (psychologistsList.isNotEmpty) {
          _availablePsychologists = psychologistsList;
        }
      } catch (e) {
        debugPrint('Error loading psychologists: $e');
      }
      try {
        _facultyProgress = await _repository.getFacultyStatistics();
      } catch (e) {
        debugPrint('Error loading faculty statistics: $e');
      }
      _aspirations = await _repository.getAspirations();
      _healthRecords = await _repository.getHealthRecords();
      _organizationHistory = await _repository.getOrganizationHistory();
      _pkkmbEvents = await _repository.getPkkmbEvents();
      _campusNews = await _repository.getCampusNews();
    } catch (e) {
      debugPrint('Error loading student data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Actions
  Future<void> addHealthRecord(HealthRecord record) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.addHealthRecord(record);
      }
      _healthRecords.insert(0, record);
    } catch (e) {
      debugPrint('Error adding health record: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void toggleMission(String? id) {
    if (id == null) return;
    final index = _missions.indexWhere((m) => m.id == id);
    if (index != -1) {
      _missions[index].isCompleted = !_missions[index].isCompleted;
      notifyListeners();
    }
  }

  Future<void> submitAppeal(String alasan) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.submitAppeal(alasan);
      }
    } catch (e) {
      debugPrint('Error submitting appeal: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addAchievement(Achievement achievement) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.addAchievement(achievement);
      }
      _achievements.insert(0, achievement);
    } catch (e) {
      debugPrint('Error adding achievement: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteAchievement(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.deleteAchievement(id);
      }
      _achievements.removeWhere((a) => a.id == id);
    } catch (e) {
      debugPrint('Error deleting achievement: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateAchievement(String id, Achievement achievement) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.updateAchievement(id, achievement);
      }
      final index = _achievements.indexWhere((a) => a.id == id);
      if (index != -1) {
        _achievements[index] = achievement;
      }
    } catch (e) {
      debugPrint('Error updating achievement: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> applyForScholarship(
    String id, 
    String motivasi, {
    String? ktmKtpPath,
    String? sertifikatPath,
    String? transkripPath,
  }) async {
    final index = _scholarships.indexWhere((s) => s.id == id);
    if (index != -1) {
      final s = _scholarships[index];
      
      // Differentiate between keep existing, new file, or deleted ("")
      final cleanKtm = (ktmKtpPath == null && s.ktmKtpUrl != null && s.ktmKtpUrl!.isNotEmpty) ? "" : ktmKtpPath;
      final cleanSertifikat = (sertifikatPath == null && s.sertifikatUrl != null && s.sertifikatUrl!.isNotEmpty) ? "" : sertifikatPath;
      final cleanTranskrip = (transkripPath == null && s.transkripUrl != null && s.transkripUrl!.isNotEmpty) ? "" : transkripPath;

      if (_repository != null) {
        await _repository.applyForScholarship(
          id, 
          motivasi,
          ktmKtpPath: cleanKtm,
          sertifikatPath: cleanSertifikat,
          transkripPath: cleanTranskrip,
        );
        
        // Refresh the scholarships list from the server to get the actual server-side file paths
        final freshScholarships = await _repository.getScholarships();
        _scholarships = List<Scholarship>.from(freshScholarships);
      } else {
        _scholarships[index] = ScholarshipModel(
          id: s.id, 
          title: s.title, 
          provider: s.provider, 
          category: s.category, 
          deadline: s.deadline, 
          coverAmount: s.coverAmount, 
          description: s.description, 
          status: 'Applied', 
          applicationStatus: 'Review Berkas',
          motivasi: motivasi,
          ktmKtpUrl: ktmKtpPath,
          sertifikatUrl: sertifikatPath,
          transkripUrl: transkripPath,
        );
      }
      notifyListeners();
    }
  }

  void cancelScholarshipApplication(String id) {
    final index = _scholarships.indexWhere((s) => s.id == id);
    if (index != -1) {
      final s = _scholarships[index];
      _scholarships[index] = ScholarshipModel(
        id: s.id, 
        title: s.title, 
        provider: s.provider, 
        category: s.category, 
        deadline: s.deadline, 
        coverAmount: s.coverAmount, 
        description: s.description, 
        status: 'Open', 
        applicationStatus: null
      );
      notifyListeners();
    }
  }

  Future<void> addAspiration(Aspiration aspiration) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.submitAspiration(aspiration);
      }
      _aspirations.insert(0, aspiration);
    } catch (e) {
      debugPrint('Error adding aspiration: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> bookCounseling(CounselingSession session) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.bookCounseling(session);
      }
      _counselingSessions.insert(0, session);
    } catch (e) {
      debugPrint('Error booking counseling: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Map<String, dynamic>>> getPsychologistSchedules(String psychologistId) async {
    try {
      if (_repository != null) {
        return await _repository.getPsychologistSchedules(psychologistId);
      }
      return [];
    } catch (e) {
      debugPrint('Error getting psychologist schedules: $e');
      return [];
    }
  }

  Future<void> addOrganizationHistory(OrganizationHistory org) async {
    _isLoading = true;
    notifyListeners();
    try {
      if (_repository != null) {
        await _repository.addOrganizationHistory(org);
      }
      _organizationHistory.insert(0, org);
    } catch (e) {
      debugPrint('Error adding organization history: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
 