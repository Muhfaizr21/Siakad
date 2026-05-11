import '../../domain/entities/counseling_session.dart';

class CounselingSessionModel extends CounselingSession {
  CounselingSessionModel({
    required super.id,
    required super.psychologistId,
    required super.psychologistName,
    required super.topic,
    required super.date,
    required super.time,
    super.location,
    required super.status,
    super.notes,
  });

  factory CounselingSessionModel.fromJson(Map<String, dynamic> json) {
    return CounselingSessionModel(
      id: json['id'] ?? '',
      psychologistId: json['psychologistId'] ?? '',
      psychologistName: json['psychologistName'] ?? '',
      topic: json['topic'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      time: json['time'] ?? '',
      location: json['location'],
      status: json['status'] ?? '',
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'psychologistId': psychologistId,
      'psychologistName': psychologistName,
      'topic': topic,
      'date': date.toIso8601String(),
      'time': time,
      'location': location,
      'status': status,
      'notes': notes,
    };
  }
}
