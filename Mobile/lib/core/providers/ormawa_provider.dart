import 'package:bkuhub_mobile/core/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_notification.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/pkkmb_mission.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/banding_appeal.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_attendance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_finance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_lpj.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_aspiration.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_pkkmb.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_role.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_division.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/repositories/ormawa_repository.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_role_model.dart';

class OrmawaProvider extends ChangeNotifier {
  final OrmawaRepository _repository;
  final AuthService _authService = AuthService();

  OrmawaProvider(this._repository);

  // Organization Info
  String _orgName = "BEM KBM BHAKTI KENCANA";
  String _academicYear = "2025/2026";

  // Stats
  int _totalMembers = 0;
  double _balance = 0;
  int _activeProposalsCount = 0;
  int _upcomingAgendasCount = 0;

  List<OrmawaProposal> _proposals = [];
  List<OrmawaAgenda> _agendas = [];
  List<OrmawaMember> _members = [];
  List<PKKMBMission> _pkkmbMissions = [];
  List<BandingAppeal> _appeals = [];
  List<OrmawaFinance> _financeList = [];
  List<OrmawaLPJ> _lpjs = [];
  List<OrmawaAttendance> _attendanceList = [];
  List<OrmawaAspiration> _aspirations = [];
  List<OrmawaAnnouncement> _announcements = [];
  
  // PKKMB States
  PkkmbSummary? _pkkmbSummary;
  List<PkkmbParticipant> _pkkmbParticipants = [];
  List<PkkmbEvent> _pkkmbEvents = [];
  List<PkkmbQuiz> _pkkmbQuizzes = [];
  List<OrmawaRole> _roles = [];
  List<OrmawaDivision> _divisions = [];

  List<OrmawaNotification> _notifications = [];
  List<OrmawaNotification> get notifications => _notifications;
  int get unreadNotificationsCount => _notifications.where((n) => !n.isRead).length;

  bool _isLoading = false;

  // Getters
  String get orgName => (_authService.userData?['user']?['nama'] ?? _authService.userData?['nama']) ?? _orgName;
  String get academicYear => _academicYear;
  int get totalMembers => _totalMembers;
  double get balance => _balance;
  int get activeProposalsCount => _activeProposalsCount;
  int get upcomingAgendasCount => _upcomingAgendasCount;
  List<OrmawaProposal> get proposals => _proposals;
  List<OrmawaAgenda> get agendas => _agendas;
  List<OrmawaMember> get members => _members;
  List<PKKMBMission> get pkkmbMissions => _pkkmbMissions;
  List<BandingAppeal> get appeals => _appeals;
  List<OrmawaFinance> get financeList => _financeList;
  List<OrmawaLPJ> get lpjs => _lpjs;
  List<OrmawaAttendance> get attendanceList => _attendanceList;
  List<OrmawaAspiration> get aspirations => _aspirations;
  List<OrmawaAnnouncement> get announcements => _announcements;
  
  PkkmbSummary? get pkkmbSummary => _pkkmbSummary;
  List<PkkmbParticipant> get pkkmbParticipants => _pkkmbParticipants;
  List<PkkmbEvent> get pkkmbEvents => _pkkmbEvents;
  List<PkkmbQuiz> get pkkmbQuizzes => _pkkmbQuizzes;
  List<OrmawaRole> get roles => _roles;
  List<OrmawaDivision> get divisions => _divisions;
  
  int get totalPKKMBParticipants => _pkkmbSummary?.totalMaba ?? 0;
  int get passedPKKMBCount => _pkkmbSummary?.totalLulus ?? 0;
  int get inProgressPKKMBCount => _pkkmbSummary?.totalProses ?? 0;

  bool get isLoading => _isLoading;
  
  String? get ormawaId => _authService.userData?['user']?['ormawa_id']?.toString() ?? _authService.userData?['ormawa_id']?.toString();
  String? get mahasiswaId => _authService.userData?['mahasiswa']?['ID']?.toString() ?? _authService.userData?['mahasiswa']?['id']?.toString() ?? _authService.userData?['mahasiswa_id']?.toString();
  String? get fakultasId => _authService.userData?['mahasiswa']?['fakultas_id']?.toString() ?? _authService.userData?['user']?['fakultas_id']?.toString() ?? _authService.userData?['fakultas_id']?.toString();

  OrmawaMember? get currentMember {
    final mId = mahasiswaId;
    if (mId == null) return null;
    try {
      return _members.firstWhere((m) => m.mahasiswaId == mId);
    } catch (e) {
      return null;
    }
  }

  bool hasPermission(String permission) {
    final member = currentMember;
    if (member == null) return false;
    
    // Admin/Ketua usually has all permissions
    if (member.role.toUpperCase() == 'KETUA UMUM' || member.role.toUpperCase() == 'KETUA') return true;

    final role = _roles.firstWhere((r) => r.name == member.role, orElse: () => OrmawaRoleModel(id: '', name: '', description: '', permissions: []));
    return role.permissions.contains(permission);
  }

  // Logic Bridge Methods
  Future<void> refreshData() async {
    final ormawaId = this.ormawaId;
    if (ormawaId == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final stats = await _repository.getStats(ormawaId);
      _totalMembers = (stats['totalMembers'] as num?)?.toInt() ?? 0;
      _balance = (stats['totalKas'] as num?)?.toDouble() ?? 0;
      _activeProposalsCount = (stats['totalProposals'] as num?)?.toInt() ?? 0;
      _upcomingAgendasCount = (stats['totalEvents'] as num?)?.toInt() ?? 0;

      final activeYear = await _repository.getActiveAcademicYear();
      if (activeYear != null && activeYear.isNotEmpty) {
        _academicYear = activeYear;
      }

      _proposals = await _repository.getProposals(ormawaId);
      _agendas = await _repository.getAgendas(ormawaId);
      _members = await _repository.getMembers(ormawaId);
      _pkkmbMissions = await _repository.getPKKMBMissions();
      _appeals = await _repository.getAppeals();
      _financeList = await _repository.getFinance(ormawaId);
      _lpjs = await _repository.getLPJs(ormawaId);
      _aspirations = await _repository.getAspirations(ormawaId);
      _announcements = await _repository.getAnnouncements(ormawaId);
      _roles = await _repository.getRoles();
      _divisions = await _repository.getDivisions();
      _notifications = await _repository.getNotifications(ormawaId);
      
      // Load PKKMB data
      _pkkmbSummary = await _repository.getPkkmbSummary();
      _pkkmbParticipants = await _repository.getPkkmbParticipants();
      _pkkmbEvents = await _repository.getPkkmbEvents();
      _pkkmbQuizzes = await _repository.getPkkmbQuizzes();
    } catch (e) {
      debugPrint('Error refreshing Ormawa data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addProposal(OrmawaProposal proposal) async {
    await _repository.addProposal(proposal);
    await refreshData();
  }

  Future<void> updateProposal(OrmawaProposal proposal) async {
    await _repository.updateProposal(proposal);
    await refreshData();
  }

  Future<void> deleteProposal(String id) async {
    try {
      await _repository.deleteProposal(id);
      await refreshData();
    } catch (e) {
      debugPrint('Error deleting proposal: $e');
    }
  }

  // Members Management
  Future<void> addMember(Map<String, dynamic> data) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final ormawaId = _authService.userData?['user']?['ormawa_id']?.toString();
      if (ormawaId != null) {
        await _repository.addMember(ormawaId, data);
        await refreshData();
      }
    } catch (e) {
      debugPrint('Error adding member: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateMember(String id, Map<String, dynamic> data) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _repository.updateMember(id, data);
      await refreshData();
    } catch (e) {
      debugPrint('Error updating member: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteMember(String id) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _repository.deleteMember(id);
      await refreshData();
    } catch (e) {
      debugPrint('Error deleting member: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Agendas Management
  Future<void> addAgenda(Map<String, dynamic> data) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final ormawaId = this.ormawaId;
      if (ormawaId != null) {
        await _repository.addAgenda(ormawaId, data);
        await refreshData();
      }
    } catch (e) {
      debugPrint('Error adding agenda: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateAgenda(String id, Map<String, dynamic> data) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _repository.updateAgenda(id, data);
      await refreshData();
    } catch (e) {
      debugPrint('Error updating agenda: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteAgenda(String id) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _repository.deleteAgenda(id);
      await refreshData();
    } catch (e) {
      debugPrint('Error deleting agenda: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateOrgName(String newName) {
    _orgName = newName;
    notifyListeners();
  }

  // PKKMB Methods
  void addPKKMBMission(PKKMBMission mission) async {
    await _repository.addPKKMBMission(mission);
    await refreshData();
  }

  void togglePKKMBMissionStatus(String id) async {
    await _repository.togglePKKMBMissionStatus(id);
    await refreshData();
  }

  // Banding Methods
  void reviewAppeal(String id, bool approved) async {
    await _repository.reviewAppeal(id, approved);
    await refreshData();
  }

  // Attendance Methods
  Future<void> fetchAttendance(String eventId) async {
    try {
      _isLoading = true;
      notifyListeners();
      _attendanceList = await _repository.getAttendance(eventId);
    } catch (e) {
      debugPrint('Error fetching attendance: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> submitAttendance(String eventId, String status) async {
    try {
      final mhsId = mahasiswaId;
      if (mhsId == null) throw Exception("Mahasiswa ID tidak ditemukan");
      
      await _repository.submitAttendance(eventId, mhsId, status);
      await fetchAttendance(eventId);
    } catch (e) {
      debugPrint('Error submitting attendance: $e');
      rethrow;
    }
  }

  // FINANCE METHODS
  Future<void> getFinance() async {
    try {
      final id = ormawaId;
      if (id == null) return;
      _financeList = await _repository.getFinance(id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error getting finance: $e');
    }
  }

  Future<void> addFinance(Map<String, dynamic> data) async {
    try {
      final id = ormawaId;
      if (id == null) throw Exception('Ormawa ID not found');
      await _repository.addFinance(id, data);
      await getFinance();
    } catch (e) {
      rethrow;
    }
  }

  // LPJ METHODS
  Future<void> getLPJs() async {
    try {
      final id = ormawaId;
      if (id == null) return;
      _lpjs = await _repository.getLPJs(id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error getting LPJs: $e');
    }
  }

  Future<void> addLPJ(Map<String, dynamic> data) async {
    try {
      await _repository.addLPJ(data);
      await getLPJs();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateLPJ(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updateLPJ(id, data);
      await getLPJs();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> getAspirations() async {
    try {
      if (ormawaId == null) return;
      _aspirations = await _repository.getAspirations(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading aspirations: $e');
    }
  }

  Future<void> respondToAspiration(String id, Map<String, dynamic> data) async {
    try {
      await _repository.respondToAspiration(id, data);
      await getAspirations();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> getAnnouncements() async {
    try {
      if (ormawaId == null) return;
      _announcements = await _repository.getAnnouncements(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading announcements: $e');
    }
  }

  Future<void> createAnnouncement(Map<String, dynamic> data) async {
    try {
      await _repository.createAnnouncement(data);
      await getAnnouncements();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteAnnouncement(String id) async {
    try {
      await _repository.deleteAnnouncement(id);
      await getAnnouncements();
    } catch (e) {
      rethrow;
    }
  }

  // PKKMB / KENCANA Actions
  Future<void> getPkkmbData() async {
    try {
      _pkkmbSummary = await _repository.getPkkmbSummary();
      _pkkmbParticipants = await _repository.getPkkmbParticipants();
      _pkkmbEvents = await _repository.getPkkmbEvents();
      _pkkmbQuizzes = await _repository.getPkkmbQuizzes();
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading PKKMB data: $e');
    }
  }

  Future<void> createPkkmbEvent(Map<String, dynamic> data) async {
    try {
      await _repository.createPkkmbEvent(data);
      await getPkkmbData();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePkkmbEvent(String id) async {
    try {
      await _repository.deletePkkmbEvent(id);
      await getPkkmbData();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createPkkmbQuiz(Map<String, dynamic> data) async {
    try {
      await _repository.createPkkmbQuiz(data);
      await getPkkmbData();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePkkmbQuiz(String id) async {
    await _repository.deletePkkmbQuiz(id);
    await refreshData();
  }

  // ROLES & DIVISIONS
  Future<void> createRole(Map<String, dynamic> data) async {
    await _repository.createRole(data);
    await refreshData();
  }

  Future<void> deleteRole(String id) async {
    await _repository.deleteRole(id);
    await refreshData();
  }

  Future<void> createDivision(Map<String, dynamic> data) async {
    await _repository.createDivision(data);
    await refreshData();
  }

  Future<void> deleteDivision(String id) async {
    await _repository.deleteDivision(id);
    await refreshData();
  }
  Future<void> fetchNotifications() async {
    final oId = ormawaId;
    if (oId == null) return;
    _notifications = await _repository.getNotifications(oId);
    notifyListeners();
  }

  Future<void> markAsRead(String id) async {
    await _repository.markNotificationAsRead(id);
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      final n = _notifications[index];
      _notifications[index] = OrmawaNotification(
        id: n.id,
        ormawaId: n.ormawaId,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: true,
        createdAt: n.createdAt,
      );
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    final oId = ormawaId;
    if (oId == null) return;
    await _repository.markAllNotificationsAsRead(oId);
    _notifications = _notifications.map((n) => OrmawaNotification(
      id: n.id,
      ormawaId: n.ormawaId,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: true,
      createdAt: n.createdAt,
    )).toList();
    notifyListeners();
  }

  Future<void> removeNotification(String id) async {
    await _repository.deleteNotification(id);
    _notifications.removeWhere((n) => n.id == id);
    notifyListeners();
  }
}
