import 'package:flutter/material.dart';
import '../../domain/entities/achievement.dart';
import '../../domain/entities/scholarship.dart';
import '../../domain/entities/mission.dart';
import '../../domain/entities/counseling_session.dart';
import '../../domain/entities/aspiration.dart';
import '../../domain/entities/health_record.dart';
import '../../domain/repositories/student_repository.dart';
import '../../data/models/achievement_model.dart';
import '../../data/models/scholarship_model.dart';
import '../../data/models/mission_model.dart';
import '../../data/models/counseling_session_model.dart';
import '../../data/models/aspiration_model.dart';
import '../../data/models/health_record_model.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'dart:developer';

class StudentRepositoryImpl implements StudentRepository {
  final ApiClient apiClient;

  StudentRepositoryImpl({required this.apiClient});

  @override
  Future<List<Achievement>> getAchievements() async {
    try {
      final response = await apiClient.client.get('/achievement/');
      final List data = response.data['data'] ?? [];
      return data.map((json) => AchievementModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting achievements: $e');
      throw Exception('Gagal memuat data prestasi');
    }
  }

  @override
  Future<List<Scholarship>> getScholarships() async {
    try {
      final response = await apiClient.client.get('/scholarship/');
      final List data = response.data['data'] ?? [];
      return data.map((json) => ScholarshipModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting scholarships: $e');
      throw Exception('Gagal memuat katalog beasiswa');
    }
  }

  @override
  Future<List<Mission>> getMissions() async {
    try {
      // PKKMB/Kencana missions
      final response = await apiClient.client.get('/kencana/progress');
      // For now, returning mock or mapping if backend provides mission list
      return []; 
    } catch (e) {
      log('Error getting missions: $e');
      return [];
    }
  }

  @override
  Future<List<CounselingSession>> getCounselingSessions() async {
    try {
      final response = await apiClient.client.get('/counseling/riwayat');
      final List data = response.data['data'] ?? [];
      return data.map((json) => CounselingSessionModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting counseling sessions: $e');
      return [];
    }
  }

  @override
  Future<List<Aspiration>> getAspirations() async {
    try {
      final response = await apiClient.client.get('/student-voice/');
      final List data = response.data['data'] ?? [];
      return data.map((json) => AspirationModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting aspirations: $e');
      throw Exception('Gagal memuat aspirasi');
    }
  }

  @override
  Future<List<HealthRecord>> getHealthRecords() async {
    try {
      final response = await apiClient.client.get('/student-health/riwayat');
      final List data = response.data['data'] ?? [];
      return data.map((json) => HealthRecordModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting health records: $e');
      throw Exception('Gagal memuat riwayat kesehatan');
    }
  }

  @override
  Future<void> addAchievement(Achievement achievement) async {
    try {
      final model = AchievementModel(
        id: achievement.id,
        title: achievement.title,
        organizer: achievement.organizer,
        level: achievement.level,
        rank: achievement.rank,
        date: achievement.date,
        status: achievement.status,
        certificateUrl: achievement.certificateUrl,
      );
      await apiClient.client.post('/achievement/', data: model.toJson());
    } catch (e) {
      log('Error adding achievement: $e');
      throw Exception('Gagal menambah prestasi');
    }
  }

  @override
  Future<void> applyForScholarship(String scholarshipId) async {
    try {
      await apiClient.client.post('/scholarship/$scholarshipId/daftar');
    } catch (e) {
      log('Error applying for scholarship: $e');
      throw Exception('Gagal mendaftar beasiswa');
    }
  }

  @override
  Future<void> submitAspiration(Aspiration aspiration) async {
    try {
      final model = AspirationModel(
        id: aspiration.id,
        category: aspiration.category,
        title: aspiration.title,
        description: aspiration.description,
        date: aspiration.date,
        status: aspiration.status,
      );
      await apiClient.client.post('/student-voice/create', data: model.toJson());
    } catch (e) {
      log('Error submitting aspiration: $e');
      throw Exception('Gagal mengirim aspirasi');
    }
  }
}

