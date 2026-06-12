import 'package:bkuhub_mobile/core/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_notification.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_attendance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_finance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_lpj.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_aspiration.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_role.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_division.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/repositories/ormawa_repository.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_role_model.dart';
import 'package:bkuhub_mobile/core/services/local_notification_service.dart';

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
  
  // Gamifikasi
  int _gamifikasiPoin = 0;
  int _gamifikasiPeringkat = 0;
  int _totalOrmawa = 0;

  List<OrmawaProposal> _proposals = [];
  List<OrmawaAgenda> _agendas = [];
  List<OrmawaMember> _members = [];
  List<OrmawaFinance> _financeList = [];
  List<OrmawaLPJ> _lpjs = [];
  List<OrmawaAttendance> _attendanceList = [];
  List<OrmawaAspiration> _aspirations = [];
  List<OrmawaAnnouncement> _announcements = [];
  List<OrmawaRole> _roles = [];
  List<OrmawaDivision> _divisions = [];

  List<OrmawaNotification> _notifications = [];
  List<String> _knownNotificationIds = [];
  bool _isFirstFetch = true;

  List<OrmawaNotification> get notifications => _notifications;
  int get unreadNotificationsCount => _notifications.where((n) => !n.isRead).length;

  List<String> _availablePeriods = [];
  String _selectedPeriod = 'aktif';
  
  List<String> get availablePeriods => _availablePeriods;
  String get selectedPeriod => _selectedPeriod;

  bool _isLoading = false;

  // Getters
  String get orgName => (_authService.userData?['user']?['nama'] ?? _authService.userData?['nama']) ?? _orgName;
  String get academicYear => _academicYear;
  int get totalMembers => _totalMembers;
  double get balance {
    if (_financeList.isEmpty) return _balance;
    double totalMasuk = 0;
    double totalKeluar = 0;
    for (var t in _financeList) {
      if (t.type == 'pemasukan') {
        totalMasuk += t.nominal;
      } else {
        totalKeluar += t.nominal;
      }
    }
    return totalMasuk - totalKeluar;
  }
  int get activeProposalsCount => _activeProposalsCount;
  int get upcomingAgendasCount => _upcomingAgendasCount;
  int get gamifikasiPoin => _gamifikasiPoin;
  int get gamifikasiPeringkat => _gamifikasiPeringkat;
  int get totalOrmawa => _totalOrmawa;
  
  int get approvalRate {
    if (_proposals.isEmpty) return 0;
    final approved = _proposals.where((p) => 
      p.status.toLowerCase().contains('disetujui') || 
      p.status.toLowerCase() == 'selesai'
    ).length;
    return ((approved / _proposals.length) * 100).round();
  }
  List<OrmawaProposal> get proposals => _proposals;
  List<OrmawaAgenda> get agendas => _agendas;
  List<OrmawaMember> get members => _members;
  List<OrmawaFinance> get financeList => _financeList;
  List<OrmawaLPJ> get lpjs => _lpjs;
  List<OrmawaAttendance> get attendanceList => _attendanceList;
  List<OrmawaAspiration> get aspirations => _aspirations;
  List<OrmawaAnnouncement> get announcements => _announcements;
  List<OrmawaRole> get roles => _roles;
  List<OrmawaDivision> get divisions => _divisions;

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

      final gamSummary = await _repository.getGamifikasiSummary();
      _gamifikasiPoin = (gamSummary['poin'] as num?)?.toInt() ?? 0;
      _gamifikasiPeringkat = (gamSummary['peringkat'] as num?)?.toInt() ?? 0;
      _totalOrmawa = (gamSummary['total_ormawa'] as num?)?.toInt() ?? 0;

      final activeYear = await _repository.getActiveAcademicYear();
      if (activeYear != null && activeYear.isNotEmpty) {
        _academicYear = activeYear;
      }

      _proposals = await _repository.getProposals(ormawaId);
      _agendas = await _repository.getAgendas(ormawaId);
      
      final membersData = await _repository.getMembersData(ormawaId, periode: _selectedPeriod);
      _members = membersData['members'] as List<OrmawaMember>;
      _availablePeriods = membersData['periods'] as List<String>;
      
      _financeList = await _repository.getFinance(ormawaId);
      _lpjs = await _repository.getLPJs(ormawaId);
      _aspirations = await _repository.getAspirations(ormawaId);
      _announcements = await _repository.getAnnouncements(ormawaId);
      _roles = await _repository.getRoles();
      _divisions = await _repository.getDivisions(ormawaId: ormawaId);
      
      final newNotifications = await _repository.getNotifications(ormawaId);
      if (!_isFirstFetch) {
        for (var n in newNotifications) {
          if (!n.isRead && !_knownNotificationIds.contains(n.id)) {
            LocalNotificationService.showNotification(
              id: n.id.hashCode,
              title: n.title,
              body: n.message,
            );
          }
        }
      }
      _knownNotificationIds = newNotifications.map((n) => n.id).toList();
      _isFirstFetch = false;
      _notifications = newNotifications;
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
  Future<void> setMemberPeriod(String periode) async {
    _selectedPeriod = periode;
    await refreshData();
  }

  Future<void> regenerateMembers() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final ormawaId = this.ormawaId;
      if (ormawaId != null) {
        await _repository.regenerateMembers(ormawaId);
        _selectedPeriod = 'aktif';
        await refreshData();
      }
    } catch (e) {
      debugPrint('Error regenerating members: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<List<Map<String, dynamic>>> getStudents() async {
    try {
      return await _repository.getStudents();
    } catch (e) {
      debugPrint('Error getting students: $e');
      return [];
    }
  }
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

  Future<void> submitAttendance(String eventId, String mhsId, String status) async {
    try {
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

  Future<void> deleteLPJ(String id) async {
    try {
      _isLoading = true;
      notifyListeners();
      await _repository.deleteLPJ(id);
      await getLPJs();
    } catch (e) {
      debugPrint('Error deleting LPJ in provider: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
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

  Future<void> updateAnnouncement(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updateAnnouncement(id, data);
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



  // ROLES & DIVISIONS
  Future<void> createRole(Map<String, dynamic> data) async {
    await _repository.createRole(data);
    await refreshData();
  }

  Future<void> updateRole(String id, Map<String, dynamic> data) async {
    await _repository.updateRole(id, data);
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

  Future<void> createDivisionInline(String name) async {
    try {
      final ormawaId = this.ormawaId;
      if (ormawaId != null) {
        await _repository.createDivisionInline(ormawaId, name);
        await refreshData();
      }
    } catch (e) {
      debugPrint('Error inline division creation: $e');
      rethrow;
    }
  }

  Future<void> deleteDivision(String id) async {
    await _repository.deleteDivision(id);
    await refreshData();
  }
  Future<void> fetchNotifications() async {
    final oId = ormawaId;
    if (oId == null) return;
    
    final newNotifications = await _repository.getNotifications(oId);
    if (!_isFirstFetch) {
      for (var n in newNotifications) {
        if (!n.isRead && !_knownNotificationIds.contains(n.id)) {
          LocalNotificationService.showNotification(
            id: n.id.hashCode,
            title: n.title,
            body: n.message,
          );
        }
      }
    }
    _knownNotificationIds = newNotifications.map((n) => n.id).toList();
    _isFirstFetch = false;
    _notifications = newNotifications;
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

  // RECRUITMENT / OPEN RECRUITMENT
  Map<String, dynamic> _recruitmentSettings = {};
  List<Map<String, dynamic>> _recruitmentApplicants = [];
  List<Map<String, dynamic>> _recruitmentFormFields = [];

  Map<String, dynamic> get recruitmentSettings => _recruitmentSettings;
  List<Map<String, dynamic>> get recruitmentApplicants => _recruitmentApplicants;
  List<Map<String, dynamic>> get recruitmentFormFields => _recruitmentFormFields;

  Future<void> getRecruitmentSettings() async {
    if (ormawaId == null) return;
    try {
      _recruitmentSettings = await _repository.getRecruitmentSettings(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading recruitment settings: $e');
    }
  }

  Future<void> updateRecruitmentSettings(Map<String, dynamic> data) async {
    if (ormawaId == null) return;
    try {
      await _repository.updateRecruitmentSettings(ormawaId!, data);
      await getRecruitmentSettings();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> getRecruitmentApplicants() async {
    if (ormawaId == null) return;
    try {
      _recruitmentApplicants = await _repository.getRecruitmentApplicants(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading recruitment applicants: $e');
    }
  }

  Future<void> reviewRecruitmentApplicant(String applicantId, String status) async {
    try {
      await _repository.reviewRecruitmentApplicant(applicantId, status);
      await getRecruitmentApplicants();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> getRecruitmentFormFields() async {
    if (ormawaId == null) return;
    try {
      _recruitmentFormFields = await _repository.getRecruitmentFormFields(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading recruitment form fields: $e');
    }
  }

  Future<void> saveRecruitmentFormFields(List<Map<String, dynamic>> fields) async {
    if (ormawaId == null) return;
    try {
      await _repository.saveRecruitmentFormFields(ormawaId!, fields);
      await getRecruitmentFormFields();
    } catch (e) {
      rethrow;
    }
  }

  // SETTINGS / PREFERENCES
  Map<String, dynamic> _ormawaSettings = {};

  Map<String, dynamic> get ormawaSettings => _ormawaSettings;

  bool get notifApproval => _ormawaSettings['notifApproval'] ?? true;
  bool get notifFinance => _ormawaSettings['notifFinance'] ?? true;
  bool get notifAspiration => _ormawaSettings['notifAspiration'] ?? false;

  Future<void> getOrmawaSettings() async {
    if (ormawaId == null) return;
    try {
      _ormawaSettings = await _repository.getOrmawaSettings(ormawaId!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading ormawa settings: $e');
    }
  }

  Future<void> updateNotificationPreferences({
    bool? notifApproval,
    bool? notifFinance,
    bool? notifAspiration,
  }) async {
    if (ormawaId == null) return;
    try {
      final data = {
        if (notifApproval != null) 'notifApproval': notifApproval,
        if (notifFinance != null) 'notifFinance': notifFinance,
        if (notifAspiration != null) 'notifAspiration': notifAspiration,
      };
      await _repository.updateOrmawaSettings(ormawaId!, data);
      await getOrmawaSettings();
    } catch (e) {
      debugPrint('Error updating notification preferences: $e');
    }
  }

  Future<String?> uploadFile(String filePath) async {
    try {
      _isLoading = true;
      notifyListeners();
      final url = await _repository.uploadFile(filePath);
      return url;
    } catch (e) {
      debugPrint('Error uploading file in provider: $e');
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
