import '../../domain/entities/aspiration.dart';

class AspirationModel extends Aspiration {
  AspirationModel({
    required super.id,
    required super.category,
    required super.title,
    required super.description,
    required super.date,
    required super.status,
    super.feedback,
    super.imageUrl,
  });

  factory AspirationModel.fromJson(Map<String, dynamic> json) {
    return AspirationModel(
      id: json['id']?.toString() ?? '',
      category: json['kategori'] ?? '',
      title: json['judul'] ?? '',
      description: json['isi'] ?? '',
      date: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      status: json['status'] ?? '',
      feedback: json['respon'],
      imageUrl: json['file_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'judul': title,
      'isi': description,
      'kategori': category,
      'is_anonim': false,
      'tujuan': 'Fakultas',
    };
  }
}
