import 'dart:io';

class ApiGate {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    try {
      if (Platform.isAndroid) {
        // Menggunakan 127.0.0.1 karena kita menggunakan ADB reverse port forwarding (adb reverse tcp:8000 tcp:8000)
        // agar real device dapat terhubung ke server lokal.
        return 'http://192.168.18.69:8000/api';
      }
    } catch (_) {
      // Handle platforms where Platform is not supported (like web)
    }
    return 'http://192.168.18.69:8000/api';
  }

  static const String environment = 'development';
}
