import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/tk_profile.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/schedule.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/booking.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/patient.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/medical_record.dart';

abstract class TkRepository {
  // Profile
  Future<TkProfile> getProfile();
  Future<TkProfile> updateProfile(Map<String, dynamic> data);
  Future<void> changePassword(String oldPassword, String newPassword, String confirmPassword);

  // Dashboard
  Future<Map<String, dynamic>> getDashboard();

  // Schedules
  Future<List<Schedule>> getSchedules();
  Future<Schedule> createSchedule(Map<String, dynamic> data);
  Future<Schedule> updateSchedule(int id, Map<String, dynamic> data);
  Future<void> deleteSchedule(int id);

  // Bookings
  Future<List<Booking>> getBookings();
  Future<Booking> getBookingDetail(int id);
  Future<Booking> updateBookingStatus(int id, String status, {String? alasanPenolakan});

  // Patients
  Future<List<Patient>> getPatients();
  Future<List<Patient>> searchPatients(String query);
  Future<Map<String, dynamic>> getPatientMedicalRecord(int patientId);

  // Screening
  Future<MedicalRecord> createScreening(int patientId, Map<String, dynamic> data);
}
