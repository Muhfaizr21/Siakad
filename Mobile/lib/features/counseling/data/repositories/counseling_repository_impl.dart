import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/counseling/domain/repositories/counseling_repository.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:developer';

class CounselingRepositoryImpl implements CounselingRepository {
  final ApiClient apiClient;

  CounselingRepositoryImpl({required this.apiClient});

  @override
  Future<Psychologist> getProfile() async {
    try {
      final response = await apiClient.client.get('/psychologist/me');
    final data = response.data['data'] ?? response.data;
    if (data is Map<String, dynamic>) {
      return Psychologist.fromJson(data);
    }
    throw Exception('Invalid profile data');
    } catch (e) {
      log('Error getting psychologist profile: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      await apiClient.client.put('/psychologist/profile', data: data);
    } catch (e) {
      log('Error updating psychologist profile: $e');
      rethrow;
    }
  }

  @override
  Future<void> changePassword(String oldPassword, String newPassword, String confirmPassword) async {
    try {
      await apiClient.client.put('/psychologist/change-password', data: {
        'old_password': oldPassword,
        'new_password': newPassword,
        'confirm_password': confirmPassword,
      });
    } catch (e) {
      log('Error changing password: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final response = await apiClient.client.get('/psychologist/dashboard');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting psychologist dashboard: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getBookings() async {
    try {
      final response = await apiClient.client.get('/psychologist/bookings');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting bookings: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getBookingDetail(String id) async {
    try {
      final response = await apiClient.client.get('/psychologist/bookings/$id');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting booking detail: $e');
      rethrow;
    }
  }

  @override
  Future<void> updateBookingStatus(String id, String status, {String? note, String? linkMeeting}) async {
    try {
      await apiClient.client.put('/psychologist/bookings/$id/status', data: {
        'status': status,
        if (note != null) 'note': note,
        if (linkMeeting != null && linkMeeting.isNotEmpty) 'link_meeting': linkMeeting,
      });
    } catch (e) {
      log('Error updating booking status: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getSchedules() async {
    try {
      final response = await apiClient.client.get('/psychologist/schedules');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting schedules: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> saveSchedules(List<Map<String, dynamic>> schedules) async {
    try {
      final response = await apiClient.client.put('/psychologist/schedules', data: schedules);
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error saving schedules: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getPatients() async {
    try {
      final response = await apiClient.client.get('/psychologist/patients');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting patients: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getMedicalRecord(String patientId) async {
    try {
      final response = await apiClient.client.get('/psychologist/patients/$patientId/medical-record');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting medical record: $e');
      rethrow;
    }
  }

  @override
  Future<void> createSessionNote(String patientId, Map<String, dynamic> data) async {
    try {
      await apiClient.client.post('/psychologist/patients/$patientId/session-notes', data: data);
    } catch (e) {
      log('Error creating session note: $e');
      rethrow;
    }
  }

  @override
  Future<void> updatePatientStatus(String patientId, String status, {String? notes}) async {
    try {
      final data = {
        'status': status,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      };
      await apiClient.client.put('/psychologist/patients/$patientId/status', data: data);
    } catch (e) {
      log('Error updating patient status: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getAssessments() async {
    try {
      final response = await apiClient.client.get('/psychologist/assessments');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting assessments: $e');
      rethrow;
    }
  }

  @override
  Future<void> createAssessment(Map<String, dynamic> data) async {
    try {
      await apiClient.client.post('/psychologist/assessments', data: data);
    } catch (e) {
      log('Error creating assessment: $e');
      rethrow;
    }
  }

  @override
  Future<void> submitAssessmentResult(Map<String, dynamic> data) async {
    try {
      // Mahasiswa submit hasil asesmen ke endpoint psikolog
      // Backend akan update PsikologAssessment dengan mahasiswa_id, skor, status=Selesai
      await apiClient.client.post('/psychologist/assessments', data: data);
    } catch (e) {
      log('Error submitting assessment result: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getAnalytics() async {
    try {
      final response = await apiClient.client.get('/psychologist/analytics');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting analytics: $e');
      rethrow;
    }
  }

  @override
  Future<String> exportPatientsRecapPDF() async {
    try {
      final baseUrl = apiClient.client.options.baseUrl;
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';
      return '$baseUrl/psychologist/patients/export-pdf?token=$token';
    } catch (e) {
      log('Error getting patients recap export URL: $e');
      rethrow;
    }
  }

  @override
  Future<String> exportSessionNotePDF(String id) async {
    try {
      final baseUrl = apiClient.client.options.baseUrl;
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';
      return '$baseUrl/psychologist/session-notes/$id/export-pdf?token=$token';
    } catch (e) {
      log('Error getting session note export URL: $e');
      rethrow;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getNotifications() async {
    try {
      final response = await apiClient.client.get('/psychologist/notifications');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting notifications: $e');
      rethrow;
    }
  }

  @override
  Future<void> markNotificationRead(String id) async {
    try {
      await apiClient.client.put('/psychologist/notifications/$id/read');
    } catch (e) {
      log('Error marking notification read: $e');
      rethrow;
    }
  }

  @override
  Future<void> markAllNotificationsRead() async {
    try {
      await apiClient.client.put('/psychologist/notifications/read-all');
    } catch (e) {
      log('Error marking all notifications read: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteNotification(String id) async {
    try {
      await apiClient.client.delete('/psychologist/notifications/$id');
    } catch (e) {
      log('Error deleting notification: $e');
      rethrow;
    }
  }

  // ─── Tindak Lanjut (Referral) ─────────────────────────────────────────────────

  @override
  Future<List<Map<String, dynamic>>> getReferrals() async {
    try {
      final response = await apiClient.client.get('/psychologist/referrals');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting referrals: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> createReferral({
    required int mahasiswaId,
    required String tipe,
    required String alasan,
    required String pihakTujuan,
    required String emailTujuan,
    int? bookingId,
  }) async {
    try {
      final response = await apiClient.client.post(
        '/psychologist/referrals',
        data: {
          'mahasiswa_id': mahasiswaId,
          'tipe': tipe,
          'alasan': alasan,
          'pihak_tujuan': pihakTujuan,
          'email_tujuan': emailTujuan,
          if (bookingId != null) 'booking_id': bookingId,
        },
      );
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error creating referral: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> sendReferral(int referralId) async {
    try {
      final response = await apiClient.client.post(
        '/psychologist/referrals/$referralId/send',
      );
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error sending referral: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> confirmReferralReceived(int referralId) async {
    try {
      final response = await apiClient.client.post(
        '/psychologist/referrals/$referralId/confirm-received',
      );
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error confirming referral received: $e');
      rethrow;
    }
  }

  @override
  Future<String> downloadReferral(int referralId) async {
    try {
      final baseUrl = apiClient.client.options.baseUrl;
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';
      return '$baseUrl/psychologist/referrals/$referralId/download?token=$token';
    } catch (e) {
      log('Error getting referral download URL: $e');
      rethrow;
    }
  }
}

