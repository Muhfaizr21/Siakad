import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
// counseling_session.dart tidak dipakai di interface ini

abstract class CounselingRepository {
  Future<Psychologist> getProfile();
  Future<void> updateProfile(Map<String, dynamic> data);
  Future<void> changePassword(String oldPassword, String newPassword, String confirmPassword);
  Future<Map<String, dynamic>> getDashboard();
  Future<List<Map<String, dynamic>>> getBookings();
  Future<Map<String, dynamic>> getBookingDetail(String id);
  Future<void> updateBookingStatus(String id, String status, {String? note, String? linkMeeting});
  Future<List<Map<String, dynamic>>> getSchedules();
  Future<List<Map<String, dynamic>>> saveSchedules(List<Map<String, dynamic>> schedules);
  Future<List<Map<String, dynamic>>> getPatients();
  Future<Map<String, dynamic>> getMedicalRecord(String patientId);
  Future<void> createSessionNote(String patientId, Map<String, dynamic> data);
  Future<void> updatePatientStatus(String patientId, String status, {String? notes});
  Future<Map<String, dynamic>> getAssessments();
  Future<void> createAssessment(Map<String, dynamic> data);
  Future<void> submitAssessmentResult(Map<String, dynamic> data);
  Future<Map<String, dynamic>> getAnalytics();
  Future<List<Map<String, dynamic>>> getReports();
  Future<Map<String, dynamic>> createReport({required String tipe, required String periode});
  Future<String> downloadReport(String reportId);
  Future<List<Map<String, dynamic>>> getNotifications();
  Future<void> markNotificationRead(String id);
  Future<void> markAllNotificationsRead();
  Future<void> deleteNotification(String id);
}