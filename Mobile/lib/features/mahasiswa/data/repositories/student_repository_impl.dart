import '../../domain/entities/achievement.dart';
import '../../domain/entities/scholarship.dart';
import '../../domain/entities/mission.dart';
import '../../domain/entities/counseling_session.dart';
import '../../domain/entities/aspiration.dart';
import '../../domain/entities/health_record.dart';
import '../../domain/entities/organization_history.dart';
import '../../domain/entities/campus_news.dart';
import '../../domain/entities/faculty_progress.dart';
import '../../domain/repositories/student_repository.dart';
import '../../../ormawa/domain/entities/ormawa_pkkmb.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';
import '../../data/models/achievement_model.dart';
import '../../data/models/scholarship_model.dart';
import '../../data/models/counseling_session_model.dart';
import '../../data/models/aspiration_model.dart';
import '../../data/models/health_record_model.dart';
import '../../data/models/organization_history_model.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:dio/dio.dart';
import 'dart:developer';

class StudentRepositoryImpl implements StudentRepository {
  final ApiClient apiClient;

  StudentRepositoryImpl({required this.apiClient});

  @override
  Future<List<Achievement>> getAchievements() async {
    try {
      final response = await apiClient.client.get('/achievement/');
      final rawData = response.data['data'];
      final List list = (rawData is Map ? rawData['list'] : rawData) ?? [];
      return list.map((json) => AchievementModel.fromJson(json)).toList();
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
      final response = await apiClient.client.get('/kencana/progress');
      if (response.data != null && response.data['success'] == true) {
        final data = response.data['data'];
        if (data != null && data['tahaps'] != null) {
          final List<Mission> missionsList = [];
          final tahaps = data['tahaps'] as List;
          for (var t in tahaps) {
            final label = t['label']?.toString() ?? '';
            final materis = t['materis'] as List?;
            if (materis != null) {
              for (var m in materis) {
                // Add material module
                missionsList.add(Mission(
                  id: m['materi_id']?.toString() ?? '',
                  title: m['judul']?.toString() ?? '',
                  desc: m['deskripsi']?.toString() ?? 'Baca & Pelajari Modul',
                  stage: label,
                  type: 'Module',
                  isCompleted: true, // Materials seeded are initially set as completed
                ));

                // Add quiz if present
                final kuis = m['kuis'];
                if (kuis != null) {
                  final kuisStatus = kuis['status']?.toString() ?? 'belum_dikerjakan';
                  final double kuisScore = double.tryParse((kuis['nilai_terbaik'] ?? '0').toString()) ?? 0.0;
                  missionsList.add(Mission(
                    id: kuis['kuis_id']?.toString() ?? '',
                    title: kuis['judul_kuis']?.toString() ?? 'Kuis Evaluasi',
                    desc: 'Selesaikan kuis untuk menguji pemahaman.',
                    stage: label,
                    type: 'Quiz',
                    score: kuisScore.toInt(),
                    isCompleted: kuisStatus == 'lulus',
                  ));
                }
              }
            }
          }
          return missionsList;
        }
      }
      return [];
    } catch (e) {
      log('Error getting missions: $e');
      return [];
    }
  }

  @override
  Future<List<PkkmbEvent>> getPkkmbEvents() async {
    try {
      final response = await apiClient.client.get('/kencana/kegiatan');
      final List data = response.data['data'] ?? [];
      return data.map((json) => PkkmbEvent.fromJson(json)).toList();
    } catch (e) {
      log('Error getting pkkmb events: $e');
      return [];
    }
  }

  @override
  Future<List<CampusNews>> getCampusNews() async {
    try {
      final response = await apiClient.client.get('/mahasiswa/dashboard');
      final List data = response.data['data']?['pengumuman'] ?? [];
      return data.map((json) => CampusNews.fromJson(json)).toList();
    } catch (e) {
      log('Error getting campus news: $e');
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
  Future<List<FacultyProgress>> getFacultyStatistics() async {
    try {
      final response = await apiClient.client.get('/counseling/faculty-statistics');
      final List data = response.data['data'] ?? [];
      return data.map((json) => FacultyProgress.fromJson(json)).toList();
    } catch (e) {
      log('Error getting faculty statistics from backend: $e');
      return [];
    }
  }

  @override
  Future<List<Psychologist>> getPsychologists() async {
    try {
      final response = await apiClient.client.get('/counseling/psychologists');
      final List data = response.data['data'] ?? [];
      return data.map((json) => Psychologist.fromJson(json)).toList();
    } catch (e) {
      log('Error getting psychologists from backend: $e');
      return [];
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getPsychologistSchedules(String psychologistId) async {
    try {
      final response = await apiClient.client.get('/counseling/psychologists/$psychologistId/schedules');
      final raw = response.data['data'];
      final List list = (raw is Map ? raw['slots'] : []) ?? [];
      return List<Map<String, dynamic>>.from(list);
    } catch (e) {
      log('Error getting psychologist schedules from backend: $e');
      return [];
    }
  }

  @override
  Future<List<Aspiration>> getAspirations() async {
    try {
      final response = await apiClient.client.get('/student-voice/');
      final rawData = response.data['data'];
      final List list = (rawData is Map ? rawData['list'] : rawData) ?? [];
      return list.map((json) => AspirationModel.fromJson(json)).toList();
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
  Future<void> deleteAchievement(String id) async {
    try {
      await apiClient.client.delete('/achievement/$id');
    } catch (e) {
      log('Error deleting achievement: $e');
      if (e is DioException && e.response != null && e.response?.data != null) {
        final data = e.response?.data;
        if (data is Map) {
          final msg = data['message'] ?? data['error'];
          if (msg != null) {
            throw Exception(msg.toString());
          }
        }
      }
      throw Exception('Gagal menghapus prestasi');
    }
  }

  @override
  Future<void> updateAchievement(String id, Achievement achievement) async {
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
      await apiClient.client.put('/achievement/$id', data: model.toJson());
    } catch (e) {
      log('Error updating achievement: $e');
      if (e is DioException && e.response != null && e.response?.data != null) {
        final data = e.response?.data;
        if (data is Map) {
          final msg = data['message'] ?? data['error'];
          if (msg != null) {
            throw Exception(msg.toString());
          }
        }
      }
      throw Exception('Gagal memperbarui prestasi');
    }
  }

  @override
  Future<void> applyForScholarship(
    String scholarshipId, 
    String motivasi, {
    String? ktmKtpPath,
    String? sertifikatPath,
    String? transkripPath,
  }) async {
    try {
      final map = <String, dynamic>{
        'motivasi': motivasi,
      };
      if (ktmKtpPath == "") {
        map['delete_ktm_ktp'] = 'true';
      } else if (ktmKtpPath != null && ktmKtpPath.isNotEmpty && !ktmKtpPath.startsWith('/uploads')) {
        map['ktm_ktp'] = await MultipartFile.fromFile(
          ktmKtpPath,
          filename: ktmKtpPath.replaceAll('\\', '/').split('/').last,
        );
      }
      if (sertifikatPath == "") {
        map['delete_sertifikat'] = 'true';
      } else if (sertifikatPath != null && sertifikatPath.isNotEmpty && !sertifikatPath.startsWith('/uploads')) {
        map['sertifikat'] = await MultipartFile.fromFile(
          sertifikatPath,
          filename: sertifikatPath.replaceAll('\\', '/').split('/').last,
        );
      }
      if (transkripPath == "") {
        map['delete_transkrip'] = 'true';
      } else if (transkripPath != null && transkripPath.isNotEmpty && !transkripPath.startsWith('/uploads')) {
        map['transkrip'] = await MultipartFile.fromFile(
          transkripPath,
          filename: transkripPath.replaceAll('\\', '/').split('/').last,
        );
      }
      
      final formData = FormData.fromMap(map);
      await apiClient.client.post('/scholarship/$scholarshipId/daftar', data: formData);
    } catch (e) {
      log('Error applying for scholarship: $e');
      if (e is DioException && e.response != null && e.response?.data != null) {
        final data = e.response?.data;
        if (data is Map) {
          final msg = data['message'] ?? data['error'];
          if (msg != null) {
            throw Exception(msg.toString());
          }
        }
      }
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
      throw _parseError(e, 'Gagal mengirim aspirasi');
    }
  }

  @override
  Future<void> addHealthRecord(HealthRecord record) async {
    try {
      final model = HealthRecordModel(
        id: record.id,
        height: record.height,
        weight: record.weight,
        bloodPressure: record.bloodPressure,
        heartRate: record.heartRate,
        temperature: record.temperature,
        date: record.date,
        bloodType: record.bloodType,
        notes: record.notes,
        gulaDarah: record.gulaDarah,
      );
      await apiClient.client.post('/student-health/record', data: model.toJson());
    } catch (e) {
      log('Error adding health record: $e');
      throw _parseError(e, 'Gagal menambah data kesehatan');
    }
  }

  @override
  Future<void> bookCounseling(CounselingSession session) async {
    try {
      final isSpecificPsychologist = session.psychologistId != 'UNASSIGNED';
      if (isSpecificPsychologist) {
        final idParts = session.psychologistId.split(':');
        final psychologistId = int.tryParse(idParts.first);
        final slotId = idParts.length > 1 ? int.tryParse(idParts[1]) : null;
        
        final timeParts = session.time.split('-');
        final start = timeParts.isNotEmpty ? timeParts.first.trim() : '09:00';
        final end = timeParts.length > 1 ? timeParts[1].trim() : '10:00';
        
        final Map<String, dynamic> requestData = {
          'psikolog_id': psychologistId,
          'date': session.date.toIso8601String().split('T').first,
          'start': start,
          'end': end,
          'topic': session.topic,
          'complaint': session.notes ?? 'Konseling',
        };
        if (slotId != null) {
          requestData['slot_id'] = slotId;
        }
        
        await apiClient.client.post('/counseling/psychologist-bookings', data: requestData);
      } else {
        await apiClient.client.post('/counseling/request', data: {
          'topik': session.topic,
          'tanggal': session.date.toIso8601String(),
        });
      }
    } catch (e) {
      log('Error booking counseling: $e');
      throw _parseError(e, 'Gagal mengajukan konseling');
    }
  }

  @override
  Future<List<OrganizationHistory>> getOrganizationHistory() async {
    try {
      final response = await apiClient.client.get('/organisasi/');
      final List data = response.data['data'] ?? [];
      return data.map((json) => OrganizationHistoryModel.fromJson(json)).toList();
    } catch (e) {
      log('Error getting organization history: $e');
      return [];
    }
  }

  @override
  Future<void> addOrganizationHistory(OrganizationHistory org) async {
    try {
      final model = OrganizationHistoryModel(
        id: org.id,
        namaOrganisasi: org.namaOrganisasi,
        tipe: org.tipe,
        jabatan: org.jabatan,
        periodeMulai: org.periodeMulai,
        periodeSelesai: org.periodeSelesai,
        deskripsiKegiatan: org.deskripsiKegiatan,
        apresiasi: org.apresiasi,
        statusVerifikasi: org.statusVerifikasi,
        achievements: org.achievements,
      );
      await apiClient.client.post('/organisasi/', data: model.toJson());
    } catch (e) {
      log('Error adding organization history: $e');
      throw Exception('Gagal menambah riwayat organisasi');
    }
  }

  @override
  Future<void> submitAppeal(String alasan) async {
    try {
      await apiClient.client.post('/kencana/banding', data: {
        'alasan': alasan,
      });
    } catch (e) {
      log('Error submitting appeal: $e');
      throw Exception('Gagal mengajukan banding');
    }
  }

  Exception _parseError(dynamic e, String defaultMsg) {
    if (e is DioException) {
      log('DioException type: ${e.type}');
      log('DioException status: ${e.response?.statusCode}');
      log('DioException data: ${e.response?.data}');

      final data = e.response?.data;
      if (data is Map) {
        final msg = data['message'] ?? data['error'];
        if (msg != null) {
          return Exception(msg.toString());
        }
      }
      if (data is String && data.isNotEmpty) {
        return Exception(data);
      }
      // No response body — likely a connection/timeout issue
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return Exception('Koneksi ke server timeout. Pastikan jaringan kamu stabil.');
      }
      if (e.type == DioExceptionType.connectionError) {
        return Exception('Tidak dapat terhubung ke server. Pastikan jaringan kamu aktif.');
      }
    }
    log('Non-Dio error: $e (${e.runtimeType})');
    return Exception(defaultMsg);
  }
}

