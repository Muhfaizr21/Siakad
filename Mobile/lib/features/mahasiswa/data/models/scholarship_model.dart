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
    String? motivasi,
    String? ktmKtpUrl,
    String? sertifikatUrl,
    String? transkripUrl,
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
          motivasi: motivasi,
          ktmKtpUrl: ktmKtpUrl,
          sertifikatUrl: sertifikatUrl,
          transkripUrl: transkripUrl,
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
      motivasi: json['motivasi'] ?? json['motivasi_kamu'],
      ktmKtpUrl: json['ktm_ktp_url'],
      sertifikatUrl: json['sertifikat_url'],
      transkripUrl: json['transkrip_url'],
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
