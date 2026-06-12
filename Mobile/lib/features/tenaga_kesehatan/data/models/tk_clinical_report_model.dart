class TkClinicalReportStats {
  final int totalDiperiksa;
  final int layak;
  final int perluPerhatian;
  final int tidakLayak;

  TkClinicalReportStats({
    required this.totalDiperiksa,
    required this.layak,
    required this.perluPerhatian,
    required this.tidakLayak,
  });

  factory TkClinicalReportStats.fromJson(Map<String, dynamic> json) {
    return TkClinicalReportStats(
      totalDiperiksa: json['total_diperiksa'] ?? 0,
      layak: json['layak'] ?? 0,
      perluPerhatian: json['perlu_perhatian'] ?? 0,
      tidakLayak: json['tidak_layak'] ?? 0,
    );
  }
}

class TkClinicalReportRecord {
  final int id;
  final String namaMahasiswa;
  final String nim;
  final String prodi;
  final DateTime tanggal;
  final String hasil;
  final String catatan;
  final String namaPemeriksa;

  TkClinicalReportRecord({
    required this.id,
    required this.namaMahasiswa,
    required this.nim,
    required this.prodi,
    required this.tanggal,
    required this.hasil,
    required this.catatan,
    required this.namaPemeriksa,
  });

  factory TkClinicalReportRecord.fromJson(Map<String, dynamic> json) {
    return TkClinicalReportRecord(
      id: json['id'] ?? 0,
      namaMahasiswa: json['mahasiswa']?['nama'] ?? '-',
      nim: json['mahasiswa']?['nim'] ?? '-',
      prodi: json['mahasiswa']?['program_studi']?['nama'] ?? '-',
      tanggal: json['tanggal'] != null 
          ? DateTime.parse(json['tanggal']) 
          : DateTime.now(),
      hasil: json['hasil'] ?? '-',
      catatan: json['catatan_medis'] ?? '-',
      namaPemeriksa: json['tenaga_kes']?['nama'] ?? '-',
    );
  }
}

class TkClinicalReportModel {
  final TkClinicalReportStats summary;
  final List<TkClinicalReportRecord> records;

  TkClinicalReportModel({
    required this.summary,
    required this.records,
  });

  factory TkClinicalReportModel.fromJson(Map<String, dynamic> json) {
    var recordList = json['records'] as List? ?? [];
    List<TkClinicalReportRecord> parsedRecords = recordList
        .map((e) => TkClinicalReportRecord.fromJson(e))
        .toList();

    return TkClinicalReportModel(
      summary: TkClinicalReportStats.fromJson(json['summary'] ?? {}),
      records: parsedRecords,
    );
  }
}
