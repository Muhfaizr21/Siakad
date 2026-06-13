import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/providers/scholarship_provider.dart';
import 'package:bkuhub_mobile/core/providers/achievement_provider.dart';
import 'package:bkuhub_mobile/core/providers/theme_provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/navigation_provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/referral_provider.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:bkuhub_mobile/features/mahasiswa/data/repositories/student_repository_impl.dart';
import 'package:bkuhub_mobile/features/ormawa/data/repositories/ormawa_repository_impl.dart';
import 'package:bkuhub_mobile/features/counseling/data/repositories/counseling_repository_impl.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/repositories/tk_repository_impl.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_dashboard_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_health_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_schedule_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_booking_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:bkuhub_mobile/core/services/local_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id', null);
  await LocalNotificationService.initialize();


  // Initialize Core Networking & Repositories
  final apiClient = ApiClient();
  final studentRepository = StudentRepositoryImpl(apiClient: apiClient);
  final ormawaRepository = OrmawaRepositoryImpl();
  final counselingRepository = CounselingRepositoryImpl(apiClient: apiClient);
  final tkRepository = TkRepositoryImpl(apiClient: apiClient);

  // Initialize Global Notification Navigation using GoRouter
  BkuAppBar.defaultOnNotificationTap = (context, variant) {
    if (variant == AppBarVariant.ormawa) {
      context.push(AppRoutes.ormawaNotifications);
    } else if (variant == AppBarVariant.psychologist) {
      context.push(AppRoutes.psychologistNotifications);
    } else {
      context.push(AppRoutes.studentNotifications);
    }
  };

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()..loadTheme()),
        ChangeNotifierProvider(create: (_) => NavigationProvider()),
        ChangeNotifierProvider(create: (_) => StudentProvider(repository: studentRepository)),
        ChangeNotifierProvider(create: (_) => ScholarshipProvider()),
        ChangeNotifierProvider(create: (_) => AchievementProvider()),
        ChangeNotifierProvider(create: (_) => PsychologistDashboardProvider(repository: counselingRepository)),
        ChangeNotifierProvider(create: (_) => CounselingProvider(repository: counselingRepository)),
        ChangeNotifierProvider(create: (_) => ReferralProvider(repository: counselingRepository)),
        ChangeNotifierProvider(create: (_) => StudentCounselingProvider(apiClient: apiClient)),
        ChangeNotifierProvider(create: (_) => OrmawaProvider(ormawaRepository)),
        // TK (Tenaga Kesehatan) Providers
        ChangeNotifierProvider(create: (_) => TkDashboardProvider(repository: tkRepository)),
        ChangeNotifierProvider(create: (_) => TkHealthProvider(repository: tkRepository)),
        ChangeNotifierProvider(create: (_) => TkScheduleProvider(repository: tkRepository)),
        ChangeNotifierProvider(create: (_) => TkBookingProvider(repository: tkRepository)),
        ChangeNotifierProvider(create: (_) => TkPatientProvider(repository: tkRepository)),
      ],
      child: const MyApp(),
    ),
  );
}


class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Watch theme provider for dynamic colors
    final themeProvider = context.watch<ThemeProvider>();

    return MaterialApp.router(
      title: 'BKU Hub',
      debugShowCheckedModeBanner: false,
      routerConfig: AppRoutes.router,
      theme: ThemeData(
        fontFamily: GoogleFonts.plusJakartaSans().fontFamily,
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeProvider.primary,
          primary: themeProvider.primary,
          secondary: themeProvider.secondary,
          surface: themeProvider.surface,
          error: themeProvider.colorError,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
        scaffoldBackgroundColor: themeProvider.background,
        // Override AppBar theme with dynamic primary color
        appBarTheme: AppBarTheme(
          backgroundColor: themeProvider.primary,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
    );
  }
}
