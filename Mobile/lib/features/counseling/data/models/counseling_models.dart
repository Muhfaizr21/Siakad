class CounselingSession {
  final String id;
  final String studentName;
  final String studentId;
  final DateTime dateTime;
  final String status; // 'pending', 'confirmed', 'completed', 'cancelled'
  final String reason;
  final String? meetLink;
  final List<SessionNote>? notes;
  final AssessmentResult? assessment;

  CounselingSession({
    required this.id,
    required this.studentName,
    required this.studentId,
    required this.dateTime,
    required this.status,
    required this.reason,
    this.meetLink,
    this.notes,
    this.assessment,
  });
}

class SessionNote {
  final String id;
  final DateTime createdAt;
  final String content;
  final String psychologistId;
  final String psychologistName;

  SessionNote({
    required this.id,
    required this.createdAt,
    required this.content,
    required this.psychologistId,
    required this.psychologistName,
  });
}

class AssessmentResult {
  final String id;
  final DateTime date;
  final int stressLevel; // 0-100
  final int anxietyLevel; // 0-100
  final String summary;
  final Map<String, dynamic> answers;

  AssessmentResult({
    required this.id,
    required this.date,
    required this.stressLevel,
    required this.anxietyLevel,
    required this.summary,
    required this.answers,
  });
}

class TimeSlot {
  final DateTime start;
  final DateTime end;
  final bool isBooked;

  TimeSlot({
    required this.start,
    required this.end,
    this.isBooked = false,
  });
}
