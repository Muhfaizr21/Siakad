import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Menggunakan 10.0.2.2 untuk Emulator Android agar terhubung ke localhost PC secara aman & cepat
        return 'http://10.0.2.2:8000/api';
      }
    } catch (_) {
      // Handle platforms where Platform is not supported (like web)
    }
    return 'http://10.0.2.2:8000/api';
  }

  static const String environment = 'development';
}
