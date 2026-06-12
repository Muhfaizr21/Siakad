import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Gunakan IP lokal PC karena di-run di HP Android fisik
        return 'http://192.168.18.84:8000/api';
      }
    } catch (_) {}

    // Default: localhost untuk development
    return 'http://localhost:8000/api';
  }

  static const String environment = 'development';
}
