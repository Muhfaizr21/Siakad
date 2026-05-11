import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/features/auth/presentation/pages/login_screen.dart';
import 'package:bkuhub_mobile/features/auth/presentation/pages/splash_screen.dart';
import 'package:bkuhub_mobile/features/main/presentation/pages/main_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/main/presentation/pages/ormawa_main_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/organisasi/presentation/pages/organisasi_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_main_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/assessment_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/student_counseling_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/session_note_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/counseling_booking_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/schedule_management_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/add_schedule_slot_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/patient_list_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/notifications/presentation/pages/student_notifications_screen.dart';
import 'package:bkuhub_mobile/features/ormawa/notifications/presentation/pages/ormawa_notifications_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/assessment_management_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_analytics_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_reports_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/create_psychologist_report_screen.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/pages/psychologist_bookings_screen.dart';
import 'package:bkuhub_mobile/features/mahasiswa/health/presentation/pages/health_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String studentMain = '/main';
  static const String ormawaMain = '/ormawa';
  static const String organisasi = '/organisasi';
  static const String health = '/health';
  static const String psychologistMain = '/psychologist';
  
  // Counseling Routes
  static const String assessment = '/counseling/assessment';
  static const String assessmentManagement = '/counseling/assessment-management';
  static const String psychologistAnalytics = '/counseling/analytics';
  static const String psychologistReports = '/counseling/reports';
  static const String createPsychologistReport = '/counseling/reports/create';
  static const String psychologistBookings = '/counseling/bookings';
  static const String studentCounseling = '/counseling/student';
  static const String sessionNote = '/counseling/session-note';
  static const String counselingBooking = '/counseling/booking';
  static const String scheduleManagement = '/counseling/schedule-management';
  static const String addScheduleSlot = '/counseling/add-slot';
  static const String patientList = '/counseling/patients';
  
  // Notification Routes
  static const String studentNotifications = '/notifications/student';
  static const String ormawaNotifications = '/notifications/ormawa';

  // Compatibility aliases
  static const String main = studentMain;
  static const String ormawa = ormawaMain;

  static final GoRouter router = GoRouter(
    initialLocation: splash,
    routes: [
      GoRoute(
        path: splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: studentMain,
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
        path: ormawaMain,
        builder: (context, state) => const OrmawaMainScreen(),
      ),
      GoRoute(
        path: organisasi,
        builder: (context, state) => const OrganisasiScreen(),
      ),
      GoRoute(
        path: health,
        builder: (context, state) => const HealthScreen(),
      ),
      GoRoute(
        path: psychologistMain,
        builder: (context, state) => const PsychologistMainScreen(),
      ),
      GoRoute(
        path: assessment,
        builder: (context, state) => const AssessmentScreen(),
      ),
      GoRoute(
        path: studentCounseling,
        builder: (context, state) => const StudentCounselingScreen(),
      ),
      GoRoute(
        path: counselingBooking,
        builder: (context, state) => const CounselingBookingScreen(),
      ),
      GoRoute(
        path: studentNotifications,
        builder: (context, state) => const StudentNotificationsScreen(),
      ),
      GoRoute(
        path: ormawaNotifications,
        builder: (context, state) => const OrmawaNotificationsScreen(),
      ),
      GoRoute(
        path: scheduleManagement,
        builder: (context, state) => const ScheduleManagementScreen(),
      ),
      GoRoute(
        path: patientList,
        builder: (context, state) => const PatientListScreen(showBackButton: true),
      ),
      GoRoute(
        path: addScheduleSlot,
        builder: (context, state) => const AddScheduleSlotScreen(),
      ),
      GoRoute(
        path: assessmentManagement,
        builder: (context, state) => const AssessmentManagementScreen(),
      ),
      GoRoute(
        path: psychologistAnalytics,
        builder: (context, state) => const PsychologistAnalyticsScreen(),
      ),
      GoRoute(
        path: psychologistReports,
        builder: (context, state) => const PsychologistReportsScreen(),
      ),
      GoRoute(
        path: createPsychologistReport,
        builder: (context, state) => const CreatePsychologistReportScreen(),
      ),
      GoRoute(
        path: psychologistBookings,
        builder: (context, state) => const PsychologistBookingsScreen(),
      ),
      GoRoute(
        path: sessionNote,
        builder: (context, state) {
          final studentName = state.uri.queryParameters['name'] ?? 'Mahasiswa';
          final studentId = state.uri.queryParameters['id'] ?? '000000';
          return SessionNoteScreen(studentName: studentName, studentId: studentId);
        },
      ),
    ],
  );
}
