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
    // Helper to format/extract time if not directly provided
    String timeStr = json['time']?.toString() ?? '';
    if (timeStr.isEmpty) {
      final dateRaw = json['Tanggal'] ?? json['tanggal'] ?? json['date'];
      if (dateRaw != null) {
        try {
          final parsed = DateTime.parse(dateRaw.toString());
          final hour = parsed.hour.toString().padLeft(2, '0');
          final minute = parsed.minute.toString().padLeft(2, '0');
          timeStr = '$hour:$minute';
        } catch (_) {
          timeStr = '08:00 - 10:00';
        }
      } else {
        timeStr = '08:00 - 10:00';
      }
    }

    // Extract psychologist name
    String psyName = json['psychologistName']?.toString() ?? '';
    if (psyName.isEmpty) {
      final dosen = json['Dosen'] ?? json['dosen'];
      if (dosen is Map) {
        psyName = dosen['Nama']?.toString() ?? dosen['nama']?.toString() ?? 'Dosen Konseling';
      } else {
        psyName = 'Dosen Konseling';
      }
    }

    return CounselingSessionModel(
      id: json['id']?.toString() ?? json['ID']?.toString() ?? '',
      psychologistId: json['psychologistId']?.toString() ?? json['dosen_id']?.toString() ?? json['DosenID']?.toString() ?? '',
      psychologistName: psyName,
      topic: json['topic']?.toString() ?? json['Topik']?.toString() ?? json['topik']?.toString() ?? '',
      date: json['date'] != null 
          ? DateTime.parse(json['date'].toString()) 
          : (json['Tanggal'] != null 
              ? DateTime.parse(json['Tanggal'].toString()) 
              : (json['tanggal'] != null 
                  ? DateTime.parse(json['tanggal'].toString()) 
                  : DateTime.now())),
      time: timeStr,
      location: json['location']?.toString() ?? 'Ruang Konseling',
      status: json['status']?.toString() ?? json['Status']?.toString() ?? '',
      notes: json['notes']?.toString() ?? json['Catatan']?.toString() ?? json['catatan']?.toString(),
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
