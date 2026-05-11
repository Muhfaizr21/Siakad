class OrmawaProposal {
  final String id;
  final String? ormawaId;
  final String? mahasiswaId;
  final String? fakultasId;
  final String title;
  final String code;
  final String status;
  final DateTime date;
  final double budget;
  final String? description;

  OrmawaProposal({
    required this.id,
    this.ormawaId,
    this.mahasiswaId,
    this.fakultasId,
    required this.title,
    required this.code,
    required this.status,
    required this.date,
    this.budget = 0,
    this.description,
  });
}
