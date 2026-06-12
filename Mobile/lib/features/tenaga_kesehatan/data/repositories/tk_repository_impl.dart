import 'dart:developer';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/tk_profile.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/schedule.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/booking.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/patient.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/medical_record.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_insurance_claim_model.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_bap_model.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_clinical_report_model.dart';

class TkRepositoryImpl implements TkRepository {
  final ApiClient apiClient;

  TkRepositoryImpl({required this.apiClient});

  // ==================== PROFILE ====================

  @override
  Future<TkProfile> getProfile() async {
    try {
      final response = await apiClient.client.get('/tenagakes/me');
      final data = response.data['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return TkProfile.fromJson(data);
      }
      throw Exception('Invalid profile data');
    } catch (e) {
      log('Error getting TK profile: $e');
      rethrow;
    }
  }

  @override
  Future<TkProfile> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.put('/tenagakes/profile', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return TkProfile.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error updating TK profile: $e');
      rethrow;
    }
  }

  @override
  Future<void> changePassword(
    String oldPassword,
    String newPassword,
    String confirmPassword,
  ) async {
    try {
      await apiClient.client.put('/tenagakes/change-password', data: {
        'old_password': oldPassword,
        'new_password': newPassword,
        'confirm_password': confirmPassword,
      });
    } catch (e) {
      log('Error changing password: $e');
      rethrow;
    }
  }

  // ==================== DASHBOARD ====================

  @override
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final response = await apiClient.client.get('/tenagakes/dashboard');
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting TK dashboard: $e');
      rethrow;
    }
  }

  // ==================== SCHEDULES ====================

  @override
  Future<List<Schedule>> getSchedules() async {
    try {
      final response = await apiClient.client.get('/tenagakes/schedules');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => Schedule.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error getting schedules: $e');
      rethrow;
    }
  }

  @override
  Future<Schedule> createSchedule(Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.post('/tenagakes/schedules', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return Schedule.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error creating schedule: $e');
      rethrow;
    }
  }

  @override
  Future<Schedule> updateSchedule(int id, Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.put('/tenagakes/schedules/$id', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return Schedule.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error updating schedule: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteSchedule(int id) async {
    try {
      await apiClient.client.delete('/tenagakes/schedules/$id');
    } catch (e) {
      log('Error deleting schedule: $e');
      rethrow;
    }
  }

  // ==================== BOOKINGS ====================

  @override
  Future<List<Booking>> getBookings() async {
    try {
      final response = await apiClient.client.get('/tenagakes/bookings');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => Booking.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error getting bookings: $e');
      rethrow;
    }
  }

  @override
  Future<Booking> getBookingDetail(int id) async {
    try {
      final response = await apiClient.client.get('/tenagakes/bookings/$id');
      final data = response.data['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return Booking.fromJson(data);
      }
      throw Exception('Invalid booking data');
    } catch (e) {
      log('Error getting booking detail: $e');
      rethrow;
    }
  }

  @override
  Future<Booking> updateBookingStatus(
    int id,
    String status, {
    String? alasanPenolakan,
  }) async {
    try {
      final response = await apiClient.client.put(
        '/tenagakes/bookings/$id/status',
        data: {
          'status': status,
          if (alasanPenolakan != null) 'alasan_penolakan': alasanPenolakan,
        },
      );
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return Booking.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error updating booking status: $e');
      rethrow;
    }
  }

  // ==================== PATIENTS ====================

  @override
  Future<List<Patient>> getPatients() async {
    try {
      final response = await apiClient.client.get('/tenagakes/patients');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => Patient.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error getting patients: $e');
      rethrow;
    }
  }

  @override
  Future<List<Patient>> searchPatients(String query) async {
    try {
      final response = await apiClient.client.get(
        '/tenagakes/students/lookup',
        queryParameters: {'query': query},
      );
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => Patient.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error searching patients: $e');
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> getPatientMedicalRecord(int patientId) async {
    try {
      final response = await apiClient.client.get(
        '/tenagakes/patients/$patientId/medical-record',
      );
      return response.data['data'] ?? {};
    } catch (e) {
      log('Error getting patient medical record: $e');
      rethrow;
    }
  }

  // ==================== SCREENING ====================

  @override
  Future<MedicalRecord> createScreening(int patientId, Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.post('/tenagakes/patients/$patientId/screenings', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return MedicalRecord.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error creating screening: $e');
      rethrow;
    }
  }

  // ==================== INSURANCE CLAIMS ====================

  @override
  Future<List<TkInsuranceClaimModel>> getInsuranceClaims() async {
    try {
      final response = await apiClient.client.get('/tenagakes/claims');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => TkInsuranceClaimModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error getting insurance claims: $e');
      rethrow;
    }
  }

  @override
  Future<TkInsuranceClaimModel> updateInsuranceClaimStatus(int id, String status, {String? catatanReview}) async {
    try {
      final response = await apiClient.client.put('/tenagakes/claims/$id/status', data: {
        'status': status,
        if (catatanReview != null) 'catatan_review': catatanReview,
      });
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return TkInsuranceClaimModel.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error updating insurance claim status: $e');
      rethrow;
    }
  }

  // ==================== BAP KESEHATAN ====================

  @override
  Future<List<TkBapModel>> getBAPs() async {
    try {
      final response = await apiClient.client.get('/tenagakes/bap');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => TkBapModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      log('Error getting BAPs: $e');
      rethrow;
    }
  }

  @override
  Future<TkBapModel> getBapDetail(int id) async {
    try {
      final response = await apiClient.client.get('/tenagakes/bap/$id');
      final data = response.data['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return TkBapModel.fromJson(data);
      }
      throw Exception('Invalid BAP data');
    } catch (e) {
      log('Error getting BAP detail: $e');
      rethrow;
    }
  }

  @override
  Future<TkBapModel> createBAP(Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.post('/tenagakes/bap', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return TkBapModel.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error creating BAP: $e');
      rethrow;
    }
  }

  @override
  Future<TkBapModel> updateBAP(int id, Map<String, dynamic> data) async {
    try {
      final response = await apiClient.client.put('/tenagakes/bap/$id', data: data);
      final result = response.data['data'] ?? response.data;
      if (result is Map<String, dynamic>) {
        return TkBapModel.fromJson(result);
      }
      throw Exception('Invalid response data');
    } catch (e) {
      log('Error updating BAP: $e');
      rethrow;
    }
  }

  @override
  Future<void> deleteBAP(int id) async {
    try {
      await apiClient.client.delete('/tenagakes/bap/$id');
    } catch (e) {
      log('Error deleting BAP: $e');
      rethrow;
    }
  }

  // ==================== CLINICAL REPORTS ====================

  @override
  Future<TkClinicalReportModel> getClinicalReports({String? startDate, String? endDate}) async {
    try {
      Map<String, dynamic> queryParams = {};
      if (startDate != null) queryParams['start_date'] = startDate;
      if (endDate != null) queryParams['end_date'] = endDate;

      final response = await apiClient.client.get('/tenagakes/reports', queryParameters: queryParams);
      final data = response.data['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return TkClinicalReportModel.fromJson(data);
      }
      throw Exception('Invalid clinical reports data');
    } catch (e) {
      log('Error getting clinical reports: $e');
      rethrow;
    }
  }
}
