class BandingAppeal {
  final String id;
  final String studentName;
  final String nim;
  final String quizTitle;
  final String initialScore;
  final String reason;
  final String? evidenceUrl;
  String status; // MENUNGGU, DISETUJUI, DITOLAK

  BandingAppeal({
    required this.id,
    required this.studentName,
    required this.nim,
    required this.quizTitle,
    required this.initialScore,
    required this.reason,
    this.evidenceUrl,
    this.status = 'MENUNGGU',
  });
  factory BandingAppeal.fromJson(Map<String, dynamic> json) {
    return BandingAppeal(
      id: json['ID']?.toString() ?? '',
      studentName: json['mahasiswa']?['pengguna']?['nama'] ?? 'Mahasiswa',
      nim: json['mahasiswa']?['nim'] ?? '',
      quizTitle: json['kuis']?['judul'] ?? 'Kuis',
      initialScore: json['nilai_awal']?.toString() ?? '0',
      reason: json['alasan'] ?? '',
      evidenceUrl: json['bukti_url'],
      status: json['status'] ?? 'MENUNGGU',
    );
  }
}
