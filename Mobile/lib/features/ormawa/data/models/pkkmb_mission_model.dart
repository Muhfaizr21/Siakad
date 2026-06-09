import 'package:flutter/material.dart';
import '../../domain/entities/pkkmb_mission.dart';

class PKKMBMissionModel extends PKKMBMission {
  PKKMBMissionModel({
    required super.id,
    required super.title,
    required super.desc,
    required super.stage,
    required super.type,
    required super.icon,
    required super.color,
    super.isActive,
    super.participantCount,
  });

  factory PKKMBMissionModel.fromJson(Map<String, dynamic> json) {
    // For now, mapping icon and color based on type/stage or just defaults
    IconData icon = Icons.assignment_rounded;
    Color color = Colors.blue;

    final String rawType = json['tipe'] ?? json['type'] ?? 'PDF';
    if (rawType == 'PDF') {
      icon = Icons.picture_as_pdf_rounded;
      color = const Color(0xFF2563EB);
    } else if (rawType == 'Quiz' || rawType == 'Kuis') {
      icon = Icons.quiz_rounded;
      color = const Color(0xFFF59E0B);
    } else if (rawType == 'Video') {
      icon = Icons.play_circle_fill_rounded;
      color = const Color(0xFF9333EA);
    }

    return PKKMBMissionModel(
      id: json['id']?.toString() ?? '',
      title: json['judul'] ?? json['title'] ?? '',
      desc: json['deskripsi'] ?? json['desc'] ?? '',
      stage: json['tahap'] ?? json['stage'] ?? 'Materi',
      type: json['tipe'] ?? json['type'] ?? 'PDF',
      icon: icon,
      color: color,
      isActive: json['isActive'] ?? true,
      participantCount: json['participantCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'desc': desc,
      'stage': stage,
      'type': type,
      'isActive': isActive,
      'participantCount': participantCount,
    };
  }
}
