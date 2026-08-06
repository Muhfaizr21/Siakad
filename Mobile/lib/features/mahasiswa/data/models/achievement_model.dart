import '../../domain/entities/achievement.dart';

class AchievementModel extends Achievement {
  AchievementModel({
    required super.id,
    required super.title,
    required super.organizer,
    required super.level,
    required super.rank,
    required super.date,
    super.status,
    super.isSynced,
    super.certificateUrl,
    super.tipe,
    super.danaDiajukan,
    super.cabang,
    super.jumlahUnitPeserta,
    super.kelompokPrestasi,
    super.bentuk,
    super.urlPeserta,
    super.urlFotoUpp,
    super.urlDokumenUndangan,
    super.jenisRekognisi,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      id: json['id']?.toString() ?? '',
      title: json['nama_kegiatan'] ?? '',
      organizer: json['penyelenggara'] ?? '',
      level: json['tingkat'] ?? '',
      rank: json['peringkat'] ?? '',
      date: json['created_at'] != null
          ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
          : DateTime.now(),
      status: json['status'] ?? 'Pending',
      isSynced: true,
      certificateUrl: json['bukti_url'],
      tipe: json['tipe'],
      danaDiajukan: json['dana_diajukan']?.toString(),
      cabang: json['cabang'],
      jumlahUnitPeserta: json['jumlah_unit_peserta']?.toString(),
      kelompokPrestasi: json['kelompok_prestasi'],
      bentuk: json['bentuk'],
      urlPeserta: json['url_peserta'],
      urlFotoUpp: json['url_foto_upp'],
      urlDokumenUndangan: json['url_dokumen_undangan'],
      jenisRekognisi: json['jenis_rekognisi'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama_kegiatan': title,
      'kategori': 'Prestasi',
      'tingkat': level,
      'peringkat': rank,
      'status': status,
      'bukti_url': certificateUrl,
      'penyelenggara': organizer,
      'tanggal': date.toIso8601String(),
      'tipe': tipe,
      'dana_diajukan': danaDiajukan,
      'cabang': cabang,
      'jumlah_unit_peserta': jumlahUnitPeserta,
      'kelompok_prestasi': kelompokPrestasi,
      'bentuk': bentuk,
      'url_peserta': urlPeserta,
      'url_foto_upp': urlFotoUpp,
      'url_dokumen_undangan': urlDokumenUndangan,
      'jenis_rekognisi': jenisRekognisi,
    };
  }
}
