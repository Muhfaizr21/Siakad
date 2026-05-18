class OrmawaAspiration {
  final String id;
  final String judul;
  final String isi;
  final String status;
  final String? tangtangan; // To avoid typo issues if any view checks both
  final String? tanggapan;
  final String mahasiswaName;
  final DateTime? createdAt;

  OrmawaAspiration({
    required this.id,
    required this.judul,
    required this.isi,
    required this.status,
    this.tanggapan,
    this.tangtangan,
    required this.mahasiswaName,
    this.createdAt,
  });

  factory OrmawaAspiration.fromJson(Map<String, dynamic> json) {
    final mName = json['MahasiswaName'] ?? json['mahasiswaName'] ?? json['Mahasiswa']?['Nama'] ?? json['mahasiswa']?['nama'] ?? 'Mahasiswa';
    return OrmawaAspiration(
      id: (json['ID'] ?? json['id'] ?? '').toString(),
      judul: json['Judul'] ?? json['judul'] ?? '',
      isi: json['Isi'] ?? json['isi'] ?? '',
      status: json['Status'] ?? json['status'] ?? 'pending',
      tanggapan: json['Tanggapan'] ?? json['tanggapan'] as String?,
      tangtangan: json['Tanggapan'] ?? json['tanggapan'] as String?,
      mahasiswaName: mName,
      createdAt: DateTime.tryParse(json['CreatedAt'] ?? json['createdAt'] ?? json['created_at'] ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': int.tryParse(id),
      'Judul': judul,
      'Isi': isi,
      'Status': status,
      'Tanggapan': tanggapan,
    };
  }
}
