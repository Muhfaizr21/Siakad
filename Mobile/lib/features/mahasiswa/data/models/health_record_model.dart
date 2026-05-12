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
  });

  factory HealthRecordModel.fromJson(Map<String, dynamic> json) {
    return HealthRecordModel(
      id: json['id']?.toString() ?? '',
      height: (json['tinggi_badan'] ?? 0).toDouble(),
      weight: (json['berat_badan'] ?? 0).toDouble(),
      bloodPressure: "${json['sistole'] ?? 0}/${json['diastole'] ?? 0}",
      heartRate: 0, // Not available in current backend
      temperature: 0.0, // Not available in current backend
      date: json['tanggal'] != null ? DateTime.parse(json['tanggal']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tinggi_badan': height,
      'berat_badan': weight,
      'sistole': int.tryParse(bloodPressure.split('/').first) ?? 0,
      'diastole': int.tryParse(bloodPressure.split('/').last) ?? 0,
    };
  }
}
