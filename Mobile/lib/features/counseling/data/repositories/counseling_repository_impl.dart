import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/features/counseling/domain/repositories/counseling_repository.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:dio/dio.dart';
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
  Future<void> updateBookingStatus(String id, String status, {String? note}) async {
    try {
      await apiClient.client.put('/psychologist/bookings/$id/status', data: {
        'status': status,
        if (note != null) 'note': note,
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
  Future<List<Map<String, dynamic>>> getReports() async {
    try {
      final response = await apiClient.client.get('/psychologist/reports');
      final data = response.data['data'];
      if (data is List) {
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      log('Error getting reports: $e');
      rethrow;
    }
  }

  @override
  Future<void> createReport() async {
    try {
      await apiClient.client.post('/psychologist/reports');
    } catch (e) {
      log('Error creating report: $e');
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
}