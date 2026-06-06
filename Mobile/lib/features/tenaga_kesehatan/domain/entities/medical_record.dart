import 'package:equatable/equatable.dart';

class MedicalRecord extends Equatable {
  final int id;
  final int mahasiswaId;
  final int? tenagaKesId;
  final DateTime tanggal;
  final String? jenisPemeriksaan;
  final double tinggiBadan;
  final double beratBadan;
  final double bmi;
  final int sistole;
  final int diastole;
  final int? gulaDarah;
  final String? butaWarna;
  final String? riwayatPenyakit;
  final String? golonganDarah;
  final double suhuTubuh;
  final int denyutNadi;
  final int spO2;
  final int? skalaNyeri;
  final String? alergiObat;
  final String? kondisiPsikologis;
  final String? konsumsiObat;
  final String? tindakanDiberikan;
  final String? obatDiberikan;
  final String? catatan;
  final String? hasil;
  final String? rekomendasi;
  final String statusKesehatan;
  final String? namaPemeriksa;

  const MedicalRecord({
    required this.id,
    required this.mahasiswaId,
    this.tenagaKesId,
    required this.tanggal,
    this.jenisPemeriksaan,
    required this.tinggiBadan,
    required this.beratBadan,
    required this.bmi,
    required this.sistole,
    required this.diastole,
    this.gulaDarah,
    this.butaWarna,
    this.riwayatPenyakit,
    this.golonganDarah,
    required this.suhuTubuh,
    required this.denyutNadi,
    required this.spO2,
    this.skalaNyeri,
    this.alergiObat,
    this.kondisiPsikologis,
    this.konsumsiObat,
    this.tindakanDiberikan,
    this.obatDiberikan,
    this.catatan,
    this.hasil,
    this.rekomendasi,
    required this.statusKesehatan,
    this.namaPemeriksa,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'] ?? 0,
      mahasiswaId: json['mahasiswa_id'] ?? 0,
      tenagaKesId: json['tenaga_kes_id'],
      tanggal: json['tanggal'] != null
          ? DateTime.tryParse(json['tanggal'].toString()) ?? DateTime.now()
          : DateTime.now(),
      jenisPemeriksaan: json['jenis_pemeriksaan'],
      tinggiBadan: (json['tinggi_badan'] ?? 0).toDouble(),
      beratBadan: (json['berat_badan'] ?? 0).toDouble(),
      bmi: (json['bmi'] ?? _calculateBmi(
          (json['tinggi_badan'] ?? 0).toDouble(),
          (json['berat_badan'] ?? 0).toDouble())),
      sistole: json['sistole'] ?? 0,
      diastole: json['diastole'] ?? 0,
      gulaDarah: json['gula_darah'],
      butaWarna: json['buta_warna'],
      riwayatPenyakit: json['riwayat_penyakit'],
      golonganDarah: json['golongan_darah'],
      suhuTubuh: (json['suhu_tubuh'] ?? 0).toDouble(),
      denyutNadi: json['denyut_nadi'] ?? 0,
      spO2: json['sp_o2'] ?? json['spo2'] ?? 0,
      skalaNyeri: json['skala_nyeri'],
      alergiObat: json['alergi_obat'],
      kondisiPsikologis: json['kondisi_psikologis'],
      konsumsiObat: json['konsumsi_obat'],
      tindakanDiberikan: json['tindakan_diberikan'],
      obatDiberikan: json['obat_diberikan'],
      catatan: json['catatan'],
      hasil: json['hasil'],
      rekomendasi: json['rekomendasi'],
      statusKesehatan: json['status_kesehatan'] ?? 'stabil',
      namaPemeriksa: json['nama_pemeriksa'],
    );
  }

  static double _calculateBmi(double tinggi, double berat) {
    if (tinggi <= 0) return 0;
    final tinggiMeter = tinggi / 100;
    return berat / (tinggiMeter * tinggiMeter);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mahasiswa_id': mahasiswaId,
      'tenaga_kes_id': tenagaKesId,
      'tanggal': tanggal.toIso8601String(),
      'jenis_pemeriksaan': jenisPemeriksaan,
      'tinggi_badan': tinggiBadan,
      'berat_badan': beratBadan,
      'bmi': bmi,
      'sistole': sistole,
      'diastole': diastole,
      'gula_darah': gulaDarah,
      'buta_warna': butaWarna,
      'riwayat_penyakit': riwayatPenyakit,
      'golongan_darah': golonganDarah,
      'suhu_tubuh': suhuTubuh,
      'denyut_nadi': denyutNadi,
      'sp_o2': spO2,
      'skala_nyeri': skalaNyeri,
      'alergi_obat': alergiObat,
      'kondisi_psikologis': kondisiPsikologis,
      'konsumsi_obat': konsumsiObat,
      'tindakan_diberikan': tindakanDiberikan,
      'obat_diberikan': obatDiberikan,
      'catatan': catatan,
      'hasil': hasil,
      'rekomendasi': rekomendasi,
      'status_kesehatan': statusKesehatan,
    };
  }

  String get tekananDarah => '$sistole/$diastole mmHg';

  String get bmiCategory {
    if (bmi < 18.5) return 'Kekurangan BB';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Kelebihan BB';
    return 'Obesitas';
  }

  String get statusCategory {
    if (hasil == 'Tidak Layak') return 'Tidak Layak';
    if (hasil == 'Perlu Perhatian') return 'Perlu Perhatian';
    return 'Layak Kegiatan';
  }

  @override
  List<Object?> get props => [
        id,
        mahasiswaId,
        tanggal,
        tinggiBadan,
        beratBadan,
        sistole,
        diastole,
        statusKesehatan,
      ];
}