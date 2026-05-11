import 'package:flutter/material.dart';

class PKKMBMission {
  final String id;
  final String title;
  final String desc;
  final String stage; // Pra-PKKMB, Pelaksanaan Inti, Pasca-PKKMB
  final String type; // PDF, Video, Quiz
  final IconData icon;
  final Color color;
  bool isActive;
  final int participantCount;

  PKKMBMission({
    required this.id,
    required this.title,
    required this.desc,
    required this.stage,
    required this.type,
    required this.icon,
    required this.color,
    this.isActive = true,
    this.participantCount = 0,
  });
}
