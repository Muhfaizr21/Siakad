class PkkmbSummary {
  final int totalMaba;
  final int totalLulus;
  final int totalProses;
  final List<ProdiStat> prodiBreakdown;

  PkkmbSummary({
    required this.totalMaba,
    required this.totalLulus,
    required this.totalProses,
    required this.prodiBreakdown,
  });

  factory PkkmbSummary.fromJson(Map<String, dynamic> json) {
    var breakdownRaw = json['prodiBreakdown'] ?? json['ProdiBreakdown'] ?? [];
    List<ProdiStat> breakdown = [];
    if (breakdownRaw is List) {
      breakdown = breakdownRaw.map((e) => ProdiStat.fromJson(e)).toList();
    }
    return PkkmbSummary(
      totalMaba: (json['totalMaba'] ?? json['TotalMaba'] ?? 0) as int,
      totalLulus: (json['totalLulus'] ?? json['TotalLulus'] ?? 0) as int,
      totalProses: (json['totalProses'] ?? json['TotalProses'] ?? 0) as int,
      prodiBreakdown: breakdown,
    );
  }
}

class ProdiStat {
  final String prodi;
  final double partisipasi;
  final double nilai;
  final String status;

  ProdiStat({
    required this.prodi,
    required this.partisipasi,
    required this.nilai,
    required this.status,
  });

  factory ProdiStat.fromJson(Map<String, dynamic> json) {
    return ProdiStat(
      prodi: json['prodi'] ?? json['Prodi'] ?? '',
      partisipasi: (json['partisipasi'] ?? json['Partisipasi'] ?? 0.0) as double,
      nilai: (json['nilai'] ?? json['Nilai'] ?? 0.0) as double,
      status: json['status'] ?? json['Status'] ?? '',
    );
  }
}

class PkkmbParticipant {
  final String id;
  final String name;
  final String nim;
  final String prodi;
  final double nilai;
  final String status;

  PkkmbParticipant({
    required this.id,
    required this.name,
    required this.nim,
    required this.prodi,
    required this.nilai,
    required this.status,
  });

  factory PkkmbParticipant.fromJson(Map<String, dynamic> json) {
    return PkkmbParticipant(
      id: (json['ID'] ?? json['id'] ?? '').toString(),
      name: json['Nama'] ?? json['nama'] ?? json['Name'] ?? json['name'] ?? '',
      nim: json['NIM'] ?? json['nim'] ?? '',
      prodi: json['Prodi'] ?? json['prodi'] ?? json['ProgramStudi'] ?? json['program_studi'] ?? '',
      nilai: (json['Nilai'] ?? json['nilai'] ?? 0.0) as double,
      status: json['Status'] ?? json['status'] ?? '',
    );
  }
}

class PkkmbEvent {
  final String id;
  final String judul;
  final String deskripsi;
  final DateTime tanggal;
  final String lokasi;

  PkkmbEvent({
    required this.id,
    required this.judul,
    required this.deskripsi,
    required this.tanggal,
    required this.lokasi,
  });

  factory PkkmbEvent.fromJson(Map<String, dynamic> json) {
    return PkkmbEvent(
      id: (json['ID'] ?? json['id'] ?? '').toString(),
      judul: json['Judul'] ?? json['judul'] ?? '',
      deskripsi: json['Deskripsi'] ?? json['deskripsi'] ?? '',
      tanggal: DateTime.tryParse(json['Tanggal'] ?? json['tanggal'] ?? '') ?? DateTime.now(),
      lokasi: json['Lokasi'] ?? json['lokasi'] ?? '',
    );
  }
}

class PkkmbQuiz {
  final String id;
  final String judul;
  final String deskripsi;
  final int pertanyaanCount;
  final int durasi;
  final bool isActive;

  PkkmbQuiz({
    required this.id,
    required this.judul,
    required this.deskripsi,
    required this.pertanyaanCount,
    required this.durasi,
    required this.isActive,
  });

  factory PkkmbQuiz.fromJson(Map<String, dynamic> json) {
    return PkkmbQuiz(
      id: (json['ID'] ?? json['id'] ?? '').toString(),
      judul: json['Judul'] ?? json['judul'] ?? '',
      deskripsi: json['Deskripsi'] ?? json['deskripsi'] ?? '',
      pertanyaanCount: (json['PertanyaanCount'] ?? json['pertanyaanCount'] ?? json['jumlah_pertanyaan'] ?? json['JumlahPertanyaan'] ?? 0) as int,
      durasi: (json['Durasi'] ?? json['durasi'] ?? 0) as int,
      isActive: json['IsActive'] ?? json['isActive'] ?? json['is_active'] ?? false,
    );
  }
}
