import 'package:equatable/equatable.dart';

class TkProfile extends Equatable {
  final int id;
  final int userId;
  final String nama;
  final String email;
  final String noHP;
  final String spesialisasi;
  final String fotoURL;
  final String lokasi;
  final bool isAktif;

  const TkProfile({
    required this.id,
    required this.userId,
    required this.nama,
    required this.email,
    required this.noHP,
    required this.spesialisasi,
    required this.fotoURL,
    required this.lokasi,
    required this.isAktif,
  });

  factory TkProfile.fromJson(Map<String, dynamic> json) {
    return TkProfile(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      nama: json['nama'] ?? '',
      email: json['email'] ?? '',
      noHP: json['no_hp'] ?? '',
      spesialisasi: json['spesialisasi'] ?? 'Pemeriksaan Umum',
      fotoURL: json['foto_url'] ?? '',
      lokasi: json['lokasi'] ?? 'Klinik Kampus BKU',
      isAktif: json['is_aktif'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'nama': nama,
      'email': email,
      'no_hp': noHP,
      'spesialisasi': spesialisasi,
      'foto_url': fotoURL,
      'lokasi': lokasi,
      'is_aktif': isAktif,
    };
  }

  String get initials {
    if (nama.isEmpty) return 'TK';
    final parts = nama.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  @override
  List<Object?> get props => [id, userId, nama, email, noHP, spesialisasi, fotoURL, lokasi, isAktif];
}
