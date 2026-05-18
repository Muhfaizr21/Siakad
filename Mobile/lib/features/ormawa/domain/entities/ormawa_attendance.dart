class OrmawaAttendance {
  final String mahasiswaId;
  final String? mahasiswaName;
  final DateTime waktuHadir;

  OrmawaAttendance({
    required this.mahasiswaId,
    this.mahasiswaName,
    required this.waktuHadir,
  });
}
