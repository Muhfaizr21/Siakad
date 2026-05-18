import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../network/api_client.dart';

enum UserRole { student, ormawa, psychologist, guest }

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserRole _currentRole = UserRole.guest;
  UserRole get currentRole => _currentRole;
  
  String? _token;
  Map<String, dynamic>? _userData;

  Future<bool> login(String identifier, String password) async {
    try {
      final response = await ApiClient().client.post('/auth/login', data: {
        'identifier': identifier,
        'password': password,
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
      debugPrint('Login DioException: $e');
      rethrow;
    } catch (e) {
      debugPrint('Login Error: $e');
      return false;
    }
  }

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('access_token');
    final userDataStr = prefs.getString('user_data');
    if (userDataStr != null) {
      _userData = jsonDecode(userDataStr);
      final roleStr = prefs.getString('user_role') ?? 'guest';
      
      if (roleStr == 'mahasiswa' || roleStr == 'student') {
        _currentRole = UserRole.student;
      } else if (roleStr == 'ormawa') {
        _currentRole = UserRole.ormawa;
      } else if (roleStr == 'psikolog' || roleStr == 'psychologist') {
        _currentRole = UserRole.psychologist;
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

  String? get token => _token;
  Map<String, dynamic>? get userData => _userData;
}
