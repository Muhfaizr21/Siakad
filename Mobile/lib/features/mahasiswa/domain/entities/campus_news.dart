class CampusNews {
  final int id;
  final String judul;
  final String isi;
  final String gambarUrl;
  final String status;
  final DateTime tanggalPublish;

  const CampusNews({
    required this.id,
    required this.judul,
    required this.isi,
    required this.gambarUrl,
    required this.status,
    required this.tanggalPublish,
  });

  factory CampusNews.fromJson(Map<String, dynamic> json) {
    return CampusNews(
      id: json['id'] ?? 0,
      judul: json['judul'] ?? json['Judul'] ?? '',
      isi: json['isi'] ?? json['Isi'] ?? '',
      gambarUrl: json['gambar_url'] ?? json['GambarURL'] ?? '',
      status: json['status'] ?? json['Status'] ?? '',
      tanggalPublish: DateTime.tryParse(json['tanggal_publish']?.toString() ?? json['TanggalPublish']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
