import 'package:equatable/equatable.dart';

class Psychologist extends Equatable {
  final String id;
  final String name;
  final String nidn;
  final String specialization;
  final String profileImageUrl;
  final bool isAvailable;
  final String email;
  final String phone;
  final String bio;
  final String location;
  final String languages;
  final int fee;

  const Psychologist({
    required this.id,
    required this.name,
    this.nidn = '',
    this.specialization = '',
    this.profileImageUrl = '',
    this.isAvailable = true,
    this.email = '',
    this.phone = '',
    this.bio = '',
    this.location = '',
    this.languages = '',
    this.fee = 0,
  });

  factory Psychologist.fromJson(Map<String, dynamic> json) {
    return Psychologist(
      id: (json['ID'] ?? json['id'] ?? '').toString(),
      name: json['Nama'] ?? json['nama'] ?? json['name'] ?? '',
      nidn: json['NIDN'] ?? json['nidn'] ?? '',
      specialization: json['Spesialisasi'] ?? json['spesialisasi'] ?? json['specialization'] ?? '',
      profileImageUrl: json['FotoURL'] ?? json['foto_url'] ?? json['photo_url'] ?? json['profileImageUrl'] ?? 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(json['Nama'] ?? json['nama'] ?? json['name'] ?? 'P')}&background=003399&color=fff&size=128',
      isAvailable: json['IsAktif'] ?? json['is_aktif'] ?? json['is_active'] ?? json['isAvailable'] ?? true,
      email: json['Email'] ?? json['email'] ?? '',
      phone: json['NoHP'] ?? json['no_hp'] ?? json['phone'] ?? '',
      bio: json['Bio'] ?? json['bio'] ?? '',
      location: json['Lokasi'] ?? json['lokasi'] ?? json['location'] ?? '',
      languages: json['Bahasa'] ?? json['bahasa'] ?? json['languages'] ?? '',
      fee: (json['Tarif'] ?? json['tarif'] ?? json['fee'] ?? 0).toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama': name,
      'email': email,
      'no_hp': phone,
      'spesialisasi': specialization,
      'bio': bio,
      'lokasi': location,
      'bahasa': languages,
      'tarif': fee,
    };
  }

  @override
  List<Object?> get props => [id, name, nidn, specialization, profileImageUrl, isAvailable, email, phone, bio, location, languages, fee];
}