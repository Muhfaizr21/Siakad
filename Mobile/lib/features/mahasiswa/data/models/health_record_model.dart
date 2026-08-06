import '../../domain/entities/health_record.dart';

class HealthRecordModel extends HealthRecord {
  HealthRecordModel({
    required super.id,
    required super.height,
    required super.weight,
    required super.bloodPressure,
    required super.heartRate,
    required super.temperature,
    required super.date,
    super.bloodType = '-',
    super.notes = '',
    super.gulaDarah,
  });

  factory HealthRecordModel.fromJson(Map<String, dynamic> json) {
    // Backend returns: sistole/diastole (NOT sistolik/diastolik)
    // Backend Kesehatan struct has no heart_rate or temperature fields
    final sys = json['sistole'] ?? json['sistolik'] ?? 0;
    final dia = json['diastole'] ?? json['diastolik'] ?? 0;
    return HealthRecordModel(
      id: json['id']?.toString() ?? '',
      height: (json['tinggi_badan'] ?? 0).toDouble(),
      weight: (json['berat_badan'] ?? 0).toDouble(),
      bloodPressure: "$sys/$dia",
      heartRate: 0, // backend Kesehatan model tidak punya heart_rate
      temperature: 0.0, // backend Kesehatan model tidak punya temperature
      date: json['tanggal'] != null ? DateTime.tryParse(json['tanggal'].toString()) ?? DateTime.now() : DateTime.now(),
      bloodType: json['golongan_darah'] ?? '-',
      notes: json['catatan'] ?? '',
      gulaDarah: json['gula_darah'] != null ? (json['gula_darah'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toJson() {
    final bpParts = bloodPressure.split('/');
    final sys = bpParts.isNotEmpty ? (int.tryParse(bpParts.first.trim()) ?? 0) : 0;
    final dia = bpParts.length > 1 ? (int.tryParse(bpParts.last.trim()) ?? 0) : 0;
    return {
      'tinggi_badan': height,
      'berat_badan': weight,
      'sistolik': sys,
      'diastolik': dia,
      'golongan_darah': bloodType,
      'catatan': notes,
      'gula_darah': gulaDarah,
      'tanggal': date.toIso8601String(),
      'tanggal_periksa': date.toIso8601String(),
    };
  }
}
