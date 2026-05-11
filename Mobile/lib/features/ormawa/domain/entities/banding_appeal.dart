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
}
