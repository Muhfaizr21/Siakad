import 'package:equatable/equatable.dart';

class Psychologist extends Equatable {
  final String id;
  final String name;
  final String nidn;
  final String specialization;
  final String profileImageUrl;
  final bool isAvailable;

  const Psychologist({
    required this.id,
    required this.name,
    required this.nidn,
    required this.specialization,
    required this.profileImageUrl,
    this.isAvailable = true,
  });

  factory Psychologist.fromJson(Map<String, dynamic> json) {
    return Psychologist(
      id: (json['id'] ?? '').toString(),
      name: json['name'] ?? json['nama'] ?? '',
      nidn: json['nidn'] ?? json['NIDN'] ?? '',
      specialization: json['specialization'] ?? json['spesialisasi'] ?? '',
      profileImageUrl: json['photo_url'] ?? json['foto_url'] ?? 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(json['name'] ?? json['nama'] ?? 'P')}&background=003399&color=fff&size=128',
      isAvailable: json['is_active'] ?? json['is_aktif'] ?? true,
    );
  }

  @override
  List<Object?> get props => [id, name, nidn, specialization, profileImageUrl, isAvailable];
}

