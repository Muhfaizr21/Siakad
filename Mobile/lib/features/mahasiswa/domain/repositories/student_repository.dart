import '../entities/achievement.dart';
import '../entities/scholarship.dart';
import '../entities/mission.dart';
import '../entities/counseling_session.dart';
import '../entities/aspiration.dart';
import '../entities/health_record.dart';
import '../entities/organization_history.dart';
import '../entities/campus_news.dart';
import '../../../ormawa/domain/entities/ormawa_pkkmb.dart';

abstract class StudentRepository {
  Future<List<Achievement>> getAchievements();
  Future<List<Scholarship>> getScholarships();
  Future<List<Mission>> getMissions();
  Future<List<CounselingSession>> getCounselingSessions();
  Future<List<Aspiration>> getAspirations();
  Future<List<HealthRecord>> getHealthRecords();
  Future<List<OrganizationHistory>> getOrganizationHistory();
  Future<List<PkkmbEvent>> getPkkmbEvents();
  Future<List<CampusNews>> getCampusNews();
  
  Future<void> addAchievement(Achievement achievement);
  Future<void> updateAchievement(String id, Achievement achievement);
  Future<void> deleteAchievement(String id);
  Future<void> applyForScholarship(String scholarshipId);
  Future<void> submitAspiration(Aspiration aspiration);
  Future<void> addHealthRecord(HealthRecord record);
  Future<void> bookCounseling(CounselingSession session);
  Future<void> addOrganizationHistory(OrganizationHistory org);
  Future<void> submitAppeal(String alasan);
}

