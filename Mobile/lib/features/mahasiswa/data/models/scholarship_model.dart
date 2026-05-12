import '../../domain/entities/scholarship.dart';

class ScholarshipModel extends Scholarship {
  ScholarshipModel({
    required String id,
    required String title,
    required String provider,
    required String category,
    required String deadline,
    required String coverAmount,
    required String description,
    String status = 'Open',
    String? applicationStatus,
  }) : super(
          id: id,
          title: title,
          provider: provider,
          category: category,
          deadline: deadline,
          coverAmount: coverAmount,
          description: description,
          status: status,
          applicationStatus: applicationStatus,
        );

  factory ScholarshipModel.fromJson(Map<String, dynamic> json) {
    return ScholarshipModel(
      id: json['id']?.toString() ?? '',
      title: json['nama'] ?? '',
      provider: json['penyelenggara'] ?? '',
      category: json['kategori'] ?? '',
      deadline: json['deadline'] ?? '',
      coverAmount: (json['nilai_bantuan'] ?? 0).toString(),
      description: json['deskripsi'] ?? '',
      status: json['status'] ?? 'Open',
      applicationStatus: json['application_status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama': title,
      'penyelenggara': provider,
      'kategori': category,
      'deskripsi': description,
    };
  }
}
