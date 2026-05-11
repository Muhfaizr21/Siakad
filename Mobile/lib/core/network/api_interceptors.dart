import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:developer';

class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Inject token if available
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    log('--> ${options.method} ${options.uri}');
    log('Headers: ${options.headers}');
    if (options.data != null) {
      log('Body: ${options.data}');
    }

    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    log('<-- ${response.statusCode} ${response.requestOptions.uri}');
    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    log('<-- Error ${err.response?.statusCode} ${err.requestOptions.uri}');
    log('Message: ${err.message}');

    // Handle global 401 Unauthorized
    if (err.response?.statusCode == 401) {
      log('Unauthorized! Session expired or invalid token.');
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      // TODO: Handle global navigation to Login Screen
    }

    super.onError(err, handler);
  }
}
