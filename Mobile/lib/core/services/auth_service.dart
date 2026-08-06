import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../network/api_client.dart';

enum UserRole { student, ormawa, psychologist, tenagaKesehatan, guest }

class LoginResult {
  final bool success;
  final bool requiresRoleSelection;
  final String? tempToken;
  final List<dynamic>? roles;
  final String? message;

  LoginResult({
    required this.success,
    this.requiresRoleSelection = false,
    this.tempToken,
    this.roles,
    this.message,
  });
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserRole _currentRole = UserRole.guest;
  UserRole get currentRole => _currentRole;
  
  String? _token;
  Map<String, dynamic>? _userData;

  Future<LoginResult> login(String identifier, String password) async {
    try {
      final response = await ApiClient().client.post('/auth/login', data: {
        'identifier': identifier,
        'password': password,
      });

      if (response.data['success'] == true) {
        final data = response.data['data'];
        
        // Check if multi-role selection is required
        if (data['requires_role_selection'] == true) {
          return LoginResult(
            success: true,
            requiresRoleSelection: true,
            tempToken: data['temp_token'],
            roles: data['roles'],
          );
        }

        _token = data['access_token'];
        _userData = data; // Store entire data object including user and mahasiswa
        
        final userObj = _userData!['user'] ?? _userData!;
        final roleStr = userObj['role']?.toString().toLowerCase() ?? 'guest';
        if (roleStr == 'mahasiswa' || roleStr == 'student') {
          _currentRole = UserRole.student;
        } else if (roleStr == 'ormawa') {
          _currentRole = UserRole.ormawa;
        } else if (roleStr == 'psikolog' || roleStr == 'psychologist') {
          _currentRole = UserRole.psychologist;
        } else if (roleStr == 'tenaga_kesehatan' || roleStr == 'tenagakes' || roleStr == 'nakes' || roleStr == 'tk') {
          _currentRole = UserRole.tenagaKesehatan;
        } else {
          _currentRole = UserRole.guest;
        }

        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', _token!);
        await prefs.setString('user_data', jsonEncode(_userData));
        await prefs.setString('user_role', roleStr);

        return LoginResult(success: true);
      }
      return LoginResult(success: false, message: response.data['message']);
    } on DioException catch (e) {
      debugPrint('Login DioException: $e');
      rethrow;
    } catch (e) {
      debugPrint('Login Error: $e');
      return LoginResult(success: false, message: e.toString());
    }
  }

  Future<bool> loginSelectRole(String tempToken, String selectedRole) async {
    try {
      final response = await ApiClient().client.post('/auth/login/select-role', data: {
        'temp_token': tempToken,
        'selected_role': selectedRole,
      });

      if (response.data['success'] == true) {
        final data = response.data['data'];
        _token = data['access_token'];
        _userData = data; // Store entire data object including user and mahasiswa
        
        final userObj = _userData!['user'] ?? _userData!;
        final roleStr = userObj['role']?.toString().toLowerCase() ?? 'guest';
        if (roleStr == 'mahasiswa' || roleStr == 'student') {
          _currentRole = UserRole.student;
        } else if (roleStr == 'ormawa') {
          _currentRole = UserRole.ormawa;
        } else if (roleStr == 'psikolog' || roleStr == 'psychologist') {
          _currentRole = UserRole.psychologist;
        } else if (roleStr == 'tenaga_kesehatan' || roleStr == 'tenagakes' || roleStr == 'nakes' || roleStr == 'tk') {
          _currentRole = UserRole.tenagaKesehatan;
        } else {
          _currentRole = UserRole.guest;
        }

        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', _token!);
        await prefs.setString('user_data', jsonEncode(_userData));
        await prefs.setString('user_role', roleStr);

        return true;
      }
      return false;
    } on DioException catch (e) {
      debugPrint('LoginSelectRole DioException: $e');
      rethrow;
    } catch (e) {
      debugPrint('LoginSelectRole Error: $e');
      return false;
    }
  }

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('access_token');
    final userDataStr = prefs.getString('user_data');
    if (userDataStr != null) {
      _userData = jsonDecode(userDataStr);

      // _userData contains: { access_token, user: { id, email, role, ... } }
      // or in some cases the raw user object
      String? roleStr;
      if (_userData!['user'] != null && _userData!['user']['role'] != null) {
        roleStr = _userData!['user']['role']?.toString().toLowerCase();
      } else if (_userData!['role'] != null) {
        roleStr = _userData!['role']?.toString().toLowerCase();
      }

      // Also try 'data' wrapper (some responses wrap it)
      if (roleStr == null && _userData!['data'] != null) {
        final data = _userData!['data'];
        if (data['user'] != null && data['user']['role'] != null) {
          roleStr = data['user']['role']?.toString().toLowerCase();
        } else if (data['role'] != null) {
          roleStr = data['role']?.toString().toLowerCase();
        }
      }

      roleStr ??= 'guest';

      if (roleStr == 'mahasiswa' || roleStr == 'student') {
        _currentRole = UserRole.student;
      } else if (roleStr == 'ormawa') {
        _currentRole = UserRole.ormawa;
      } else if (roleStr == 'psikolog' || roleStr == 'psychologist') {
        _currentRole = UserRole.psychologist;
      } else if (roleStr == 'tenaga_kesehatan' || roleStr == 'tenagakes' || roleStr == 'nakes' || roleStr == 'tk') {
        _currentRole = UserRole.tenagaKesehatan;
      } else {
        _currentRole = UserRole.guest;
      }
    }
  }

  Future<void> logout() async {
    _currentRole = UserRole.guest;
    _token = null;
    _userData = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<Map<String, dynamic>> changePassword(String oldPassword, String newPassword) async {
    try {
      final response = await ApiClient().client.put('/auth/change-password', data: {
        'old_password': oldPassword,
        'new_password': newPassword,
      });
      return {
        'success': response.data['success'] == true,
        'message': response.data['message'] ?? 'Berhasil mengubah kata sandi',
      };
    } on DioException catch (e) {
      debugPrint('ChangePassword DioException: $e');
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal mengubah kata sandi. Periksa koneksi Anda.',
      };
    } catch (e) {
      debugPrint('ChangePassword Error: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan sistem',
      };
    }
  }

  String? get token => _token;
  Map<String, dynamic>? get userData => _userData;
}
