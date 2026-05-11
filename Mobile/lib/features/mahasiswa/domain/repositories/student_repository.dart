import '../entities/achievement.dart';
import '../entities/scholarship.dart';
import '../entities/mission.dart';
import '../entities/counseling_session.dart';
import '../entities/aspiration.dart';
import '../entities/health_record.dart';

abstract class StudentRepository {
  Future<List<Achievement>> getAchievements();
  Future<List<Scholarship>> getScholarships();
  Future<List<Mission>> getMissions();
  Future<List<CounselingSession>> getCounselingSessions();
  Future<List<Aspiration>> getAspirations();
  Future<List<HealthRecord>> getHealthRecords();
  
  Future<void> addAchievement(Achievement achievement);
  Future<void> applyForScholarship(String scholarshipId);
  Future<void> submitAspiration(Aspiration aspiration);
}

