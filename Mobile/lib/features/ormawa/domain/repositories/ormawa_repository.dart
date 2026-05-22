import '../entities/ormawa_notification.dart';
import '../entities/ormawa_member.dart';
import '../entities/ormawa_proposal.dart';
import '../entities/ormawa_agenda.dart';
import '../entities/pkkmb_mission.dart';
import '../entities/banding_appeal.dart';
import '../entities/ormawa_attendance.dart';
import '../entities/ormawa_finance.dart';
import '../entities/ormawa_lpj.dart';
import '../entities/ormawa_aspiration.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_announcement.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_pkkmb.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_role.dart';
import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_division.dart';

abstract class OrmawaRepository {
  Future<List<OrmawaProposal>> getProposals(String ormawaId);
  Future<List<OrmawaAgenda>> getAgendas(String ormawaId);
  Future<List<OrmawaMember>> getMembers(String ormawaId);
  Future<List<PKKMBMission>> getPKKMBMissions();
  Future<List<BandingAppeal>> getAppeals();
  Future<Map<String, dynamic>> getStats(String ormawaId);
  
  Future<void> addProposal(OrmawaProposal proposal);
  Future<void> updateProposal(OrmawaProposal proposal);
  Future<void> deleteProposal(String proposalId);

  Future<void> addMember(String ormawaId, Map<String, dynamic> data);
  Future<void> updateMember(String id, Map<String, dynamic> data);
  Future<void> deleteMember(String id);

  Future<List<Map<String, dynamic>>> getStudents();
  Future<void> addPKKMBMission(PKKMBMission mission);
  Future<void> togglePKKMBMissionStatus(String id);
  Future<void> addAgenda(String ormawaId, Map<String, dynamic> data);
  Future<void> updateAgenda(String id, Map<String, dynamic> data);
  Future<void> deleteAgenda(String id);

  // Finance
  Future<List<OrmawaFinance>> getFinance(String ormawaId);
  Future<void> addFinance(String ormawaId, Map<String, dynamic> data);

  // LPJ
  Future<List<OrmawaLPJ>> getLPJs(String ormawaId);
  Future<void> addLPJ(Map<String, dynamic> data);
  Future<void> updateLPJ(String id, Map<String, dynamic> data);

  // Aspirations
  Future<List<OrmawaAspiration>> getAspirations(String ormawaId);
  Future<void> respondToAspiration(String id, Map<String, dynamic> data);

  // Announcements
  Future<List<OrmawaAnnouncement>> getAnnouncements(String ormawaId);
  Future<void> createAnnouncement(Map<String, dynamic> data);
  Future<void> deleteAnnouncement(String id);

  // PKKMB / KENCANA
  Future<PkkmbSummary> getPkkmbSummary();
  Future<List<PkkmbParticipant>> getPkkmbParticipants();
  Future<List<PkkmbEvent>> getPkkmbEvents();
  Future<void> createPkkmbEvent(Map<String, dynamic> data);
  Future<void> updatePkkmbEvent(String id, Map<String, dynamic> data);
  Future<void> deletePkkmbEvent(String id);
  
  Future<List<PkkmbQuiz>> getPkkmbQuizzes();
  Future<void> createPkkmbQuiz(Map<String, dynamic> data);
  Future<void> updatePkkmbQuiz(String id, Map<String, dynamic> data);
  Future<void> deletePkkmbQuiz(String id);

  // Attendance
  Future<List<OrmawaAttendance>> getAttendance(String eventId);
  Future<void> submitAttendance(String eventId, String mahasiswaId, String status);
  
  Future<void> reviewAppeal(String id, bool approved);

  // ROLES & DIVISIONS
  Future<List<OrmawaRole>> getRoles();
  Future<void> createRole(Map<String, dynamic> data);
  Future<void> updateRole(String id, Map<String, dynamic> data);
  Future<void> deleteRole(String id);
  
  Future<List<OrmawaDivision>> getDivisions();
  Future<void> createDivision(Map<String, dynamic> data);
  Future<void> deleteDivision(String id);
  Future<List<OrmawaNotification>> getNotifications(String ormawaId);
  Future<void> markNotificationAsRead(String id);
  Future<void> markAllNotificationsAsRead(String ormawaId);
  Future<void> deleteNotification(String id);
  Future<String?> getActiveAcademicYear();
}
