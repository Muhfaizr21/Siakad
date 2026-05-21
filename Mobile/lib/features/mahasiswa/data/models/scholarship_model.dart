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
    // deadline dari backend adalah time.Time → ISO string, e.g. "2025-12-01T00:00:00Z"
    // kita format jadi "YYYY-MM-DD" agar UI bisa tampilkan
    String deadlineStr = '';
    if (json['deadline'] != null) {
      try {
        final dt = DateTime.parse(json['deadline'].toString());
        deadlineStr = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
      } catch (_) {
        deadlineStr = json['deadline'].toString();
      }
    }

    return ScholarshipModel(
      id: json['id']?.toString() ?? '',
      title: json['nama'] ?? '',
      provider: json['penyelenggara'] ?? '',
      category: json['kategori'] ?? '',
      deadline: deadlineStr,
      coverAmount: (json['nilai_bantuan'] ?? 0).toString(),
      description: json['deskripsi'] ?? '',
      status: json['status'] ?? 'Open',
      applicationStatus: json['application_status']?.toString(),
      motivasi: json['motivasi'],
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
