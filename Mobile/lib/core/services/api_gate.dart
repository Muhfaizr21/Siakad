import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Untuk emulator Android Studio ATAU HP fisik dengan adb reverse
        return 'http://127.0.0.1:8000/api';
      }
    } catch (_) {}

    // Default: localhost untuk development
    return 'http://localhost:8000/api';
  }

  static const String environment = 'development';
}
