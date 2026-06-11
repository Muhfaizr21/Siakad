import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Untuk emulator Android Studio, gunakan 10.0.2.2 (alias untuk localhost komputer host)
        return 'http://192.168.18.74:8000/api';
      }
    } catch (_) {}

    // Default: localhost untuk development
    return 'http://localhost:8000/api';
  }

  static const String environment = 'development';
}
