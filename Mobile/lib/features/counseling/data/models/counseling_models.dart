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


// ─── Tindak Lanjut (Referral) ─────────────────────────────────────────────────

class Referral {
  final int id;
  final int mahasiswaId;
  final String mahasiswaNama;
  final String tipe; // "Medis" atau "Akademik"
  final String alasan;
  final String status; // "Pending", "Sent", "Received"
  final String pihakTujuan;
  final String emailTujuan;
  final String? filePendukungUrl;
  final String? suratRujiukanUrl;
  final DateTime tanggalDibuat;
  final DateTime? tanggalDikirim;
  final DateTime? tanggalDiterima;

  Referral({
    required this.id,
    required this.mahasiswaId,
    required this.mahasiswaNama,
    required this.tipe,
    required this.alasan,
    required this.status,
    required this.pihakTujuan,
    required this.emailTujuan,
    this.filePendukungUrl,
    this.suratRujiukanUrl,
    required this.tanggalDibuat,
    this.tanggalDikirim,
    this.tanggalDiterima,
  });

  factory Referral.fromJson(Map<String, dynamic> json) {
    return Referral(
      id: json['id'] as int? ?? 0,
      mahasiswaId: json['mahasiswa_id'] as int? ?? 0,
      mahasiswaNama: json['mahasiswa_name'] as String? ?? '',
      tipe: json['tipe'] as String? ?? '',
      alasan: json['alasan'] as String? ?? '',
      status: json['status'] as String? ?? 'Pending',
      pihakTujuan: json['pihak_tujuan'] as String? ?? '',
      emailTujuan: json['email_tujuan'] as String? ?? '',
      filePendukungUrl: json['file_pendukung_url'] as String?,
      suratRujiukanUrl: json['surat_rujukan_url'] as String?,
      tanggalDibuat: json['tanggal_dibuat'] != null
          ? DateTime.parse(json['tanggal_dibuat'] as String)
          : DateTime.now(),
      tanggalDikirim: json['tanggal_dikirim'] != null
          ? DateTime.parse(json['tanggal_dikirim'] as String)
          : null,
      tanggalDiterima: json['tanggal_diterima'] != null
          ? DateTime.parse(json['tanggal_diterima'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mahasiswa_id': mahasiswaId,
      'mahasiswa_name': mahasiswaNama,
      'tipe': tipe,
      'alasan': alasan,
      'status': status,
      'pihak_tujuan': pihakTujuan,
      'email_tujuan': emailTujuan,
      'file_pendukung_url': filePendukungUrl,
      'surat_rujukan_url': suratRujiukanUrl,
      'tanggal_dibuat': tanggalDibuat.toIso8601String(),
      'tanggal_dikirim': tanggalDikirim?.toIso8601String(),
      'tanggal_diterima': tanggalDiterima?.toIso8601String(),
    };
  }
}
