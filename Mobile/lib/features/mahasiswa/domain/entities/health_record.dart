import 'package:flutter/material.dart';

class HealthRecord {
  final String id;
  final double height;
  final double weight;
  final String bloodPressure;
  final int heartRate;
  final double temperature;
  final DateTime date;

  HealthRecord({required this.id, required this.height, required this.weight, required this.bloodPressure, required this.heartRate, required this.temperature, required this.date});

  double get bmi => weight / ((height / 100) * (height / 100));
  
  String get bmiStatus {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  Color get bmiColor {
    if (bmi < 18.5) return Colors.blue;
    if (bmi < 25) return Colors.green;
    if (bmi < 30) return Colors.orange;
    return Colors.red;
  }
}
