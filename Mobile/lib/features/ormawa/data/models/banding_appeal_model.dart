import '../../domain/entities/banding_appeal.dart';

class BandingAppealModel extends BandingAppeal {
  BandingAppealModel({
    required super.id,
    required super.studentName,
    required super.nim,
    required super.quizTitle,
    required super.initialScore,
    required super.reason,
    super.evidenceUrl,
    super.status,
  });

  factory BandingAppealModel.fromJson(Map<String, dynamic> json) {
    return BandingAppealModel(
      id: json['id'],
      studentName: json['studentName'],
      nim: json['nim'],
      quizTitle: json['quizTitle'],
      initialScore: json['initialScore'],
      reason: json['reason'],
      evidenceUrl: json['evidenceUrl'],
      status: json['status'] ?? 'MENUNGGU',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentName': studentName,
      'nim': nim,
      'quizTitle': quizTitle,
      'initialScore': initialScore,
      'reason': reason,
      'evidenceUrl': evidenceUrl,
      'status': status,
    };
  }
}
