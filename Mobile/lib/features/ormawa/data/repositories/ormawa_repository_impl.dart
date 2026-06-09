import 'package:flutter/material.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/repositories/ormawa_repository.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_member.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_proposal.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_agenda.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/pkkmb_mission.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/banding_appeal.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_member_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_proposal_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_agenda_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/pkkmb_mission_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_attendance_model.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_attendance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_finance.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_lpj.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_aspiration.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_pkkmb.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_role.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_division.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_role_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_division_model.dart';
import 'package:bkuhub_mobile/features/ormawa/data/models/ormawa_notification_model.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_notification.dart';
import 'package:bkuhub_mobile/core/services/auth_service.dart';

class OrmawaRepositoryImpl implements OrmawaRepository {
  final ApiClient _apiClient = ApiClient();
  final AuthService _authService = AuthService();

  @override
  Future<List<OrmawaMember>> getMembers(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/members', queryParameters: {'ormawaId': ormawaId});
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map((json) => OrmawaMemberModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching members: $e');
      return [];
    }
  }

  @override
  Future<void> addMember(String ormawaId, Map<String, dynamic> data) async {
    try {
      final payload = Map<String, dynamic>.from(data);
      payload['OrmawaID'] = int.parse(ormawaId);
      await _apiClient.client.post('/ormawa/members', data: payload);
    } catch (e) {
      debugPrint('Error adding member: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateMember(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.client.put('/ormawa/members/$id', data: data);
    } catch (e) {
      debugPrint('Error updating member: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteMember(String id) async {
    try {
      await _apiClient.client.delete('/ormawa/members/$id');
    } catch (e) {
      debugPrint('Error deleting member: $e');
      rethrow;
    }
  }

  @override
  Future<List<OrmawaProposal>> getProposals(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/proposals', queryParameters: {'ormawaId': ormawaId});
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map((json) => OrmawaProposalModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  @override
  Future<List<OrmawaAgenda>> getAgendas(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/events', queryParameters: {'ormawaId': ormawaId});
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map((json) => OrmawaAgendaModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  @override
  Future<Map<String, dynamic>> getStats(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/stats', queryParameters: {'ormawaId': ormawaId});
      if (response.data['status'] == 'success') {
        return response.data['data'];
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  @override
  Future<List<PKKMBMission>> getPKKMBMissions() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/materi');
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map<PKKMBMission>((json) => PKKMBMissionModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error getting pkkmb missions (materi): $e');
      return [];
    }
  }

  @override
  Future<List<BandingAppeal>> getAppeals() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/banding');
      final List data = response.data['data'] ?? [];
      return data.map<BandingAppeal>((json) => BandingAppeal.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting pkkmb appeals: $e');
      return [];
    }
  }


  @override
  Future<void> addProposal(OrmawaProposal proposal) async {
    try {
      final ormawaId = _authService.userData?['user']?['ormawa_id']?.toString();
      if (ormawaId == null) return;

      final data = OrmawaProposalModel(
        id: proposal.id,
        ormawaId: ormawaId,
        mahasiswaId: _authService.userData?['mahasiswa']?['ID']?.toString() ?? _authService.userData?['mahasiswa']?['id']?.toString(),
        fakultasId: _authService.userData?['mahasiswa']?['fakultas_id']?.toString() ?? _authService.userData?['user']?['fakultas_id']?.toString(),
        title: proposal.title,
        code: proposal.code,
        status: proposal.status,
        date: proposal.date,
        budget: proposal.budget,
      ).toJson();

      await _apiClient.client.post('/ormawa/proposals', data: data);
    } catch (e) {
      debugPrint('Error adding proposal: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateProposal(OrmawaProposal proposal) async {
    try {
      final data = OrmawaProposalModel(
        id: proposal.id,
        title: proposal.title,
        code: proposal.code,
        status: proposal.status,
        date: proposal.date,
        budget: proposal.budget,
      ).toJson();

      await _apiClient.client.put('/ormawa/proposals/${proposal.id}', data: data);
    } catch (e) {
      debugPrint('Error updating proposal: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteProposal(String proposalId) async {
    try {
      await _apiClient.client.delete('/ormawa/proposals/$proposalId');
    } catch (e) {
      debugPrint('Error deleting proposal: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getStudents() async {
    try {
      final response = await _apiClient.client.get('/ormawa/students');
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching students: $e');
      return [];
    }
  }

  @override
  Future<void> addPKKMBMission(PKKMBMission mission) async {
    try {
      final payload = {
        'judul': mission.title,
        'deskripsi': mission.desc,
        'tipe': mission.type,
      };
      await _apiClient.client.post('/ormawa/kencana/materi', data: payload);
    } catch (e) {
      debugPrint('Error adding pkkmb mission: $e');
      rethrow;
    }
  }

  @override
  Future<void> togglePKKMBMissionStatus(String id) async {
    // Optional: implement status toggle if supported by backend, or just map to delete for now
    try {
      await _apiClient.client.delete('/ormawa/kencana/materi/$id');
    } catch (e) {
      debugPrint('Error toggling/deleting pkkmb mission: $e');
      rethrow;
    }
  }

  @override
  Future<void> addAgenda(String ormawaId, Map<String, dynamic> data) async {
    try {
      final payload = {
        'OrmawaID': int.tryParse(ormawaId) ?? 0,
        'Judul': data['Judul'] ?? data['title'],
        'Deskripsi': data['Deskripsi'] ?? data['description'] ?? '',
        // Go / GORM expects clean RFC3339
        'TanggalMulai': _formatDate(data['TanggalMulai'] ?? data['date']),
        'TanggalSelesai': _formatDate(data['TanggalSelesai'] ?? data['end_date']),
        'Lokasi': data['Lokasi'] ?? data['location'] ?? '',
        'Status': data['Status'] ?? 'Persiapan',
      };
      
      print('DEBUG PAYLOAD: $payload'); // Use print for higher visibility in some logs
      await _apiClient.client.post('/ormawa/events', data: payload);
    } catch (e) {
      debugPrint('Error adding agenda: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateAgenda(String id, Map<String, dynamic> data) async {
    try {
      final payload = {
        'Judul': data['Judul'] ?? data['title'],
        'Deskripsi': data['Deskripsi'] ?? data['description'],
        'TanggalMulai': _formatDate(data['TanggalMulai'] ?? data['date']),
        'TanggalSelesai': _formatDate(data['TanggalSelesai'] ?? data['end_date']),
        'Lokasi': data['Lokasi'] ?? data['location'],
        'Status': data['Status'],
      };
      await _apiClient.client.put('/ormawa/events/$id', data: payload);
    } catch (e) {
      debugPrint('Error updating agenda: $e');
      rethrow;
    }
  }

  String _formatDate(dynamic date) {
    DateTime dt;
    if (date == null) {
      dt = DateTime.now();
    } else if (date is DateTime) {
      dt = date;
    } else if (date is String) {
      dt = DateTime.tryParse(date) ?? DateTime.now();
    } else {
      dt = DateTime.now();
    }
    // Return RFC3339 with 'Z'
    return dt.toUtc().toIso8601String();
  }

  @override
  Future<List<OrmawaFinance>> getFinance(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/kas', queryParameters: {'ormawaId': ormawaId});
      return (response.data['data'] as List).map((e) => OrmawaFinance.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> addFinance(String ormawaId, Map<String, dynamic> data) async {
    try {
      final payload = {
        'OrmawaID': int.tryParse(ormawaId) ?? 0,
        'Tipe': data['type'],
        'Nominal': data['nominal'],
        'Kategori': data['category'],
        'Deskripsi': data['description'],
        'Tanggal': _formatDate(data['date']),
      };
      await _apiClient.client.post('/ormawa/kas', data: payload);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<OrmawaLPJ>> getLPJs(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/lpjs', queryParameters: {'ormawaId': ormawaId});
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map((json) => OrmawaLPJ.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching LPJs: $e');
      return [];
    }
  }

  @override
  Future<void> addLPJ(Map<String, dynamic> data) async {
    try {
      await _apiClient.client.post('/ormawa/lpjs', data: data);
    } catch (e) {
      debugPrint('Error adding LPJ: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateLPJ(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.client.put('/ormawa/lpjs/$id', data: data);
    } catch (e) {
      debugPrint('Error updating LPJ: $e');
      rethrow;
    }
  }

  @override
  Future<List<OrmawaAspiration>> getAspirations(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/aspirations', queryParameters: {'ormawaId': ormawaId});
      final List data = response.data['data'] ?? [];
      return data.map((json) => OrmawaAspiration.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting aspirations: $e');
      rethrow;
    }
  }

  @override
  Future<void> respondToAspiration(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.client.put('/ormawa/aspirations/$id', data: data);
    } catch (e) {
      debugPrint('Error responding to aspiration: $e');
      rethrow;
    }
  }

  @override
  Future<List<OrmawaAnnouncement>> getAnnouncements(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/announcements', queryParameters: {'ormawaId': ormawaId});
      final List data = response.data['data'] ?? [];
      return data.map((json) => OrmawaAnnouncement.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting announcements: $e');
      rethrow;
    }
  }

  @override
  Future<void> createAnnouncement(Map<String, dynamic> data) async {
    try {
      await _apiClient.client.post('/ormawa/announcements', data: data);
    } catch (e) {
      debugPrint('Error creating announcement: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteAnnouncement(String id) async {
    try {
      await _apiClient.client.delete('/ormawa/announcements/$id');
    } catch (e) {
      debugPrint('Error deleting announcement: $e');
      rethrow;
    }
  }

  // PKKMB / KENCANA
  @override
  Future<PkkmbSummary> getPkkmbSummary() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/ringkasan');
      return PkkmbSummary.fromJson(response.data);
    } catch (e) {
      debugPrint('Error getting pkkmb summary: $e');
      rethrow;
    }
  }

  @override
  Future<List<PkkmbParticipant>> getPkkmbParticipants() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/peserta');
      final List data = response.data['data'] ?? [];
      return data.map((json) => PkkmbParticipant.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting pkkmb participants: $e');
      rethrow;
    }
  }

  @override
  Future<List<PkkmbEvent>> getPkkmbEvents() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/kegiatan');
      final List data = response.data['data'] ?? [];
      return data.map((json) => PkkmbEvent.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting pkkmb events: $e');
      rethrow;
    }
  }

  @override
  Future<void> createPkkmbEvent(Map<String, dynamic> data) async {
    try {
      await _apiClient.client.post('/ormawa/kencana/kegiatan', data: data);
    } catch (e) {
      debugPrint('Error creating pkkmb event: $e');
      rethrow;
    }
  }

  @override
  Future<void> updatePkkmbEvent(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.client.put('/ormawa/kencana/kegiatan/$id', data: data);
    } catch (e) {
      debugPrint('Error updating pkkmb event: $e');
      rethrow;
    }
  }

  @override
  Future<void> deletePkkmbEvent(String id) async {
    try {
      await _apiClient.client.delete('/ormawa/kencana/kegiatan/$id');
    } catch (e) {
      debugPrint('Error deleting pkkmb event: $e');
      rethrow;
    }
  }

  @override
  Future<List<PkkmbQuiz>> getPkkmbQuizzes() async {
    try {
      final response = await _apiClient.client.get('/ormawa/kencana/kuis');
      final List data = response.data['data'] ?? [];
      return data.map((json) => PkkmbQuiz.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error getting pkkmb quizzes: $e');
      rethrow;
    }
  }

  @override
  Future<void> createPkkmbQuiz(Map<String, dynamic> data) async {
    try {
      await _apiClient.client.post('/ormawa/kencana/kuis', data: data);
    } catch (e) {
      debugPrint('Error creating pkkmb quiz: $e');
      rethrow;
    }
  }

  @override
  Future<void> updatePkkmbQuiz(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.client.put('/ormawa/kencana/kuis/$id', data: data);
    } catch (e) {
      debugPrint('Error updating pkkmb quiz: $e');
      rethrow;
    }
  }

  @override
  Future<void> deletePkkmbQuiz(String id) async {
    try {
      await _apiClient.client.delete('/ormawa/kencana/kuis/$id');
    } catch (e) {
      debugPrint('Error deleting pkkmb quiz: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteAgenda(String id) async {
    try {
      await _apiClient.client.delete('/ormawa/events/$id');
    } catch (e) {
      debugPrint('Error deleting agenda: $e');
      rethrow;
    }
  }

  @override
  Future<void> reviewAppeal(String id, bool approved) async {
    await _apiClient.client.post('/ormawa/kencana/banding/$id/review', data: {'approved': approved});
  }

  @override
  Future<List<OrmawaAttendance>> getAttendance(String eventId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/attendance/$eventId');
      if (response.data['status'] == 'success') {
        final List data = response.data['data'] ?? [];
        return data.map((json) => OrmawaAttendanceModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching attendance: $e');
      return [];
    }
  }

  @override
  Future<void> submitAttendance(String eventId, String mahasiswaId, String status) async {
    try {
      final payload = {
        'KegiatanID': int.tryParse(eventId),
        'MahasiswaID': int.tryParse(mahasiswaId),
        'Status': status,
      };
      await _apiClient.client.post('/ormawa/attendance', data: payload);
    } catch (e) {
      debugPrint('Error submitting attendance: $e');
      rethrow;
    }
  }

  @override
  Future<List<OrmawaRole>> getRoles() async {
    try {
      final response = await _apiClient.client.get('/ormawa/roles');
      final List data = response.data['data'] ?? [];
      return data.map<OrmawaRole>((json) => OrmawaRoleModel.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> createRole(Map<String, dynamic> data) async {
    await _apiClient.client.post('/ormawa/roles', data: data);
  }

  @override
  Future<void> updateRole(String id, Map<String, dynamic> data) async {
    await _apiClient.client.put('/ormawa/roles/$id', data: data);
  }

  @override
  Future<void> deleteRole(String id) async {
    await _apiClient.client.delete('/ormawa/roles/$id');
  }

  @override
  Future<List<OrmawaDivision>> getDivisions() async {
    try {
      final response = await _apiClient.client.get('/ormawa/divisions');
      final List data = response.data['data'] ?? [];
      return data.map<OrmawaDivision>((json) => OrmawaDivisionModel.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> createDivision(Map<String, dynamic> data) async {
    await _apiClient.client.post('/ormawa/divisions', data: data);
  }

  @override
  Future<void> deleteDivision(String id) async {
    await _apiClient.client.delete('/ormawa/divisions/$id');
  }

  @override
  Future<List<OrmawaNotification>> getNotifications(String ormawaId) async {
    try {
      final response = await _apiClient.client.get('/ormawa/notifications', queryParameters: {'ormawaId': ormawaId});
      final List data = response.data['data'] ?? [];
      return data.map<OrmawaNotification>((json) => OrmawaNotificationModel.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> markNotificationAsRead(String id) async {
    await _apiClient.client.put('/ormawa/notifications/$id/read');
  }

  @override
  Future<void> markAllNotificationsAsRead(String ormawaId) async {
    await _apiClient.client.put('/ormawa/notifications/read-all', queryParameters: {'ormawaId': ormawaId});
  }

  @override
  Future<void> deleteNotification(String id) async {
    await _apiClient.client.delete('/ormawa/notifications/$id');
  }

  @override
  Future<String?> getActiveAcademicYear() async {
    try {
      final response = await _apiClient.client.get('/faculty/academic-periods');
      if (response.data['status'] == 'success' && response.data['data'] != null) {
        return response.data['data']['activeYear']?.toString();
      }
      return null;
    } catch (e) {
      debugPrint('Error getting active academic year in repo: $e');
      return null;
    }
  }
}
