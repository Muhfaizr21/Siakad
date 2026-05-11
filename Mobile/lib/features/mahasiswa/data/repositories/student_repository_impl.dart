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
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        AchievementModel(
          id: 'A1', 
          title: 'Juara 1 Lomba Karya Tulis Ilmiah Nasional', 
          organizer: 'Universitas Indonesia', 
          level: 'Nasional', 
          rank: 'Juara 1', 
          date: DateTime(2025, 3, 15), 
          status: 'Validated', 
          isSynced: true, 
          certificateUrl: 'https://example.com/cert1.pdf'
        ),
        AchievementModel(
          id: 'A2', 
          title: 'Delegasi Pertukaran Mahasiswa', 
          organizer: 'University of Malaya', 
          level: 'Internasional', 
          rank: 'Peserta', 
          date: DateTime(2024, 11, 20), 
          status: 'Validated', 
          isSynced: true, 
          certificateUrl: 'https://example.com/cert2.jpg'
        ),
      ];
    } catch (e) {
      log('Error getting achievements: $e');
      throw Exception('Failed to load achievements');
    }
  }

  @override
  Future<List<Scholarship>> getScholarships() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        ScholarshipModel(id: 'S1', title: 'Beasiswa Prestasi BKU 2026', provider: 'Universitas Bhakti Kencana', category: 'Internal', deadline: '30 Juni 2026', coverAmount: 'UKT 100% + Uang Saku', description: 'Diberikan kepada mahasiswa dengan IPK minimal 3.75.', status: 'Applied', applicationStatus: 'Review Berkas'),
        ScholarshipModel(id: 'S2', title: 'Beasiswa Bank Indonesia', provider: 'Bank Indonesia', category: 'Eksternal', deadline: '15 Mei 2026', coverAmount: 'Rp 1.000.000 / Bulan', description: 'Beasiswa untuk mahasiswa berprestasi.', status: 'Open'),
      ];
    } catch (e) {
      log('Error getting scholarships: $e');
      throw Exception('Failed to load scholarships');
    }
  }

  @override
  Future<List<Mission>> getMissions() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        MissionModel(id: '1', title: 'Aturan & Tata Tertib', desc: 'Materi PDF Wajib Baca', icon: Icons.picture_as_pdf_rounded, color: const Color(0xFF2563EB), stage: 'Pra-PKKMB', type: 'PDF', isCompleted: true),
        MissionModel(id: '2', title: 'Kuis Pra-PKKMB', desc: 'Tes Pemahaman Awal', icon: Icons.quiz_rounded, color: const Color(0xFFF59E0B), stage: 'Pra-PKKMB', type: 'Quiz', score: 85, isCompleted: true),
      ];
    } catch (e) {
      log('Error getting missions: $e');
      throw Exception('Failed to load missions');
    }
  }

  @override
  Future<List<CounselingSession>> getCounselingSessions() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        CounselingSessionModel(id: 'C1', psychologistId: 'P1', psychologistName: 'Dr. Sarah Amalia, M.Psi', topic: 'Manajemen Stres Akademik', date: DateTime(2026, 4, 20), time: '10:00 - 11:00', location: 'Gedung Rektorat Lt. 2', status: 'Completed', notes: 'Mahasiswa disarankan untuk mengatur jadwal istirahat lebih teratur.'),
      ];
    } catch (e) {
      log('Error getting counseling sessions: $e');
      throw Exception('Failed to load counseling sessions');
    }
  }

  @override
  Future<List<Aspiration>> getAspirations() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        AspirationModel(id: 'AS1', category: 'Fasilitas', title: 'Perbaikan WiFi Gedung C', description: 'WiFi di lantai 3 sering mati.', date: DateTime.now(), status: 'Diproses'),
      ];
    } catch (e) {
      log('Error getting aspirations: $e');
      throw Exception('Failed to load aspirations');
    }
  }

  @override
  Future<List<HealthRecord>> getHealthRecords() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      return [
        HealthRecordModel(id: 'H1', height: 170, weight: 65, bloodPressure: '120/80', heartRate: 72, temperature: 36.5, date: DateTime.now()),
      ];
    } catch (e) {
      log('Error getting health records: $e');
      throw Exception('Failed to load health records');
    }
  }

  @override
  Future<void> addAchievement(Achievement achievement) async {
    try {
      await Future.delayed(const Duration(seconds: 1));
    } catch (e) {
      log('Error adding achievement: $e');
      throw Exception('Failed to add achievement');
    }
  }

  @override
  Future<void> applyForScholarship(String scholarshipId) async {
    try {
      await Future.delayed(const Duration(seconds: 1));
    } catch (e) {
      log('Error applying for scholarship: $e');
      throw Exception('Failed to apply for scholarship');
    }
  }

  @override
  Future<void> submitAspiration(Aspiration aspiration) async {
    try {
      await Future.delayed(const Duration(seconds: 1));
    } catch (e) {
      log('Error submitting aspiration: $e');
      throw Exception('Failed to submit aspiration');
    }
  }
}

