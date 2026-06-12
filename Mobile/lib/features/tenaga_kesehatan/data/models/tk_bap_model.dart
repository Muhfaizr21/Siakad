class TkBapModel {
  final int id;
  final String namaKegiatan;
  final DateTime tanggalPelaksanaan;
  final String waktuMulai;
  final String waktuSelesai;
  final String tempat;
  final int jumlahPeserta;
  final int jumlahDiperiksa;
  final int totalLayak;
  final int totalPantauan;
  final int totalTidakLayak;
  final String status;

  TkBapModel({
    required this.id,
    required this.namaKegiatan,
    required this.tanggalPelaksanaan,
    required this.waktuMulai,
    required this.waktuSelesai,
    required this.tempat,
    required this.jumlahPeserta,
    required this.jumlahDiperiksa,
    required this.totalLayak,
    required this.totalPantauan,
    required this.totalTidakLayak,
    required this.status,
  });

  factory TkBapModel.fromJson(Map<String, dynamic> json) {
    return TkBapModel(
      id: json['id'] ?? 0,
      namaKegiatan: json['nama_kegiatan'] ?? '',
      tanggalPelaksanaan: json['tanggal_pelaksanaan'] != null
          ? DateTime.parse(json['tanggal_pelaksanaan'])
          : DateTime.now(),
      waktuMulai: json['waktu_mulai'] ?? '',
      waktuSelesai: json['waktu_selesai'] ?? '',
      tempat: json['tempat'] ?? '',
      jumlahPeserta: json['jumlah_peserta'] ?? 0,
      jumlahDiperiksa: json['jumlah_diperiksa'] ?? 0,
      totalLayak: json['total_layak'] ?? 0,
      totalPantauan: json['total_pantauan'] ?? 0,
      totalTidakLayak: json['total_tidak_layak'] ?? 0,
      status: json['status'] ?? 'DRAFT',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama_kegiatan': namaKegiatan,
      'tanggal_pelaksanaan': "${tanggalPelaksanaan.year.toString().padLeft(4, '0')}-${tanggalPelaksanaan.month.toString().padLeft(2, '0')}-${tanggalPelaksanaan.day.toString().padLeft(2, '0')}",
      'waktu_mulai': waktuMulai,
      'waktu_selesai': waktuSelesai,
      'tempat': tempat,
      'jumlah_peserta': jumlahPeserta,
      'jumlah_diperiksa': jumlahDiperiksa,
      'total_layak': totalLayak,
      'total_pantauan': totalPantauan,
      'total_tidak_layak': totalTidakLayak,
      'status': status,
    };
  }
}
