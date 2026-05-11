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
      id: json['id'] ?? '',
      height: (json['height'] ?? 0).toDouble(),
      weight: (json['weight'] ?? 0).toDouble(),
      bloodPressure: json['bloodPressure'] ?? '',
      heartRate: json['heartRate'] ?? 0,
      temperature: (json['temperature'] ?? 0).toDouble(),
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'height': height,
      'weight': weight,
      'bloodPressure': bloodPressure,
      'heartRate': heartRate,
      'temperature': temperature,
      'date': date.toIso8601String(),
    };
  }
}
