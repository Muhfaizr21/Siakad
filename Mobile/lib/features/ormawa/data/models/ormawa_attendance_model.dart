import 'package:bkuhub_mobile/features/ormawa/domain/entities/ormawa_attendance.dart';

class OrmawaAttendanceModel extends OrmawaAttendance {
  OrmawaAttendanceModel({
    required super.mahasiswaId,
    super.mahasiswaName,
    required super.waktuHadir,
  });

  factory OrmawaAttendanceModel.fromJson(Map<String, dynamic> json) {
    final mahasiswa = json['Mahasiswa'] as Map<String, dynamic>?;
    return OrmawaAttendanceModel(
      mahasiswaId: (json['MahasiswaID'] ?? json['mahasiswaId'] ?? '').toString(),
      mahasiswaName: mahasiswa?['Nama'] ?? mahasiswa?['nama'] ?? json['mahasiswaName'] ?? '',
      waktuHadir: DateTime.tryParse(json['WaktuHadir'] ?? json['waktuHadir'] ?? json['waktu_hadir'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'MahasiswaID': int.tryParse(mahasiswaId),
      'WaktuHadir': waktuHadir.toIso8601String(),
    };
  }
}
