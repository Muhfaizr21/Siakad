import 'package:bkuhub_mobile/features/counseling/domain/entities/counseling_session.dart';
import 'package:bkuhub_mobile/features/counseling/domain/entities/psychologist.dart';

abstract class CounselingRepository {
  Future<Psychologist> getPsychologistProfile(String id);
  Future<List<CounselingSession>> getUpcomingSessions(String psychologistId);
  Future<void> updatePsychologistAvailability(String id, bool isAvailable);
  Future<void> createSessionNote(String sessionId, String note);
}
