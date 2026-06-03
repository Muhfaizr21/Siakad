import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';
import 'package:bkuhub_mobile/core/providers/scholarship_provider.dart';
import 'package:bkuhub_mobile/core/providers/achievement_provider.dart';

import 'package:bkuhub_mobile/core/routes/app_routes.dart';
import 'package:bkuhub_mobile/core/widgets/bku_app_bar.dart';
import 'package:bkuhub_mobile/core/providers/navigation_provider.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/psychologist_dashboard_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/counseling_provider.dart';
import 'package:bkuhub_mobile/features/counseling/presentation/providers/student_counseling_provider.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:bkuhub_mobile/features/mahasiswa/data/repositories/student_repository_impl.dart';
import 'package:bkuhub_mobile/features/ormawa/data/repositories/ormawa_repository_impl.dart';
import 'package:bkuhub_mobile/features/counseling/data/repositories/counseling_repository_impl.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id', null);


  // Initialize Core Networking & Repositories
  final apiClient = ApiClient();
  final studentRepository = StudentRepositoryImpl(apiClient: apiClient);
  final ormawaRepository = OrmawaRepositoryImpl();
  final counselingRepository = CounselingRepositoryImpl(apiClient: apiClient);

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
        ChangeNotifierProvider(create: (_) => NavigationProvider()),
        ChangeNotifierProvider(create: (_) => StudentProvider(repository: studentRepository)),
        ChangeNotifierProvider(create: (_) => ScholarshipProvider()),
        ChangeNotifierProvider(create: (_) => AchievementProvider()),
        ChangeNotifierProvider(create: (_) => PsychologistDashboardProvider(repository: counselingRepository)),
        ChangeNotifierProvider(create: (_) => CounselingProvider(repository: counselingRepository)),
        ChangeNotifierProvider(create: (_) => StudentCounselingProvider(apiClient: apiClient)),
        ChangeNotifierProvider(create: (_) => OrmawaProvider(ormawaRepository)),
      ],
      child: const MyApp(),
    ),
  );
}


class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BKU Hub',
      debugShowCheckedModeBanner: false,
      routerConfig: AppRoutes.router,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: AppColors.surface,
        ),
        scaffoldBackgroundColor: AppColors.background,
      ),
    );
  }
}
