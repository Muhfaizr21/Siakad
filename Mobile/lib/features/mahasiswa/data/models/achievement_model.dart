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
      title: json['nama_kegiatan'] ?? '',
      organizer: json['penyelenggara'] ?? '',
      level: json['tingkat'] ?? '',
      rank: json['peringkat'] ?? '',
      date: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      status: json['status'] ?? 'Pending',
      isSynced: true,
      certificateUrl: json['bukti_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama_kegiatan': title,
      'kategori': 'Prestasi',
      'tingkat': level,
      'peringkat': rank,
      'status': status,
      'bukti_url': certificateUrl,
    };
  }
}
