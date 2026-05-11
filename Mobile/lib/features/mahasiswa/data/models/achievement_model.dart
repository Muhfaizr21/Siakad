import '../../domain/entities/achievement.dart';

class AchievementModel extends Achievement {
  AchievementModel({
    required String id,
    required String title,
    required String organizer,
    required String level,
    required String rank,
    required DateTime date,
    String status = 'Pending',
    bool isSynced = false,
    String? certificateUrl,
  }) : super(
          id: id,
          title: title,
          organizer: organizer,
          level: level,
          rank: rank,
          date: date,
          status: status,
          isSynced: isSynced,
          certificateUrl: certificateUrl,
        );

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      organizer: json['organizer'] ?? '',
      level: json['level'] ?? '',
      rank: json['rank'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      status: json['status'] ?? 'Pending',
      isSynced: json['isSynced'] ?? false,
      certificateUrl: json['certificateUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'organizer': organizer,
      'level': level,
      'rank': rank,
      'date': date.toIso8601String(),
      'status': status,
      'isSynced': isSynced,
      'certificateUrl': certificateUrl,
    };
  }
}
