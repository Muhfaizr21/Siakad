import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Menggunakan IP lokal PC Host agar HP Fisik (Infinix) dan Emulator bisa terhubung ke backend
        return 'http://192.168.18.69:8000/api';
      }
    } catch (_) {
      // Handle platforms where Platform is not supported (like web)
    }
    return 'http://192.168.18.69:8000/api';
  }

  static const String environment = 'development';
}
