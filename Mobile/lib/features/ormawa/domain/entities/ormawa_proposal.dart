class OrmawaProposal {
  final String id;
  final String title;
  final String code;
  final String status;
  final DateTime date;
  final double budget;

  OrmawaProposal({
    required this.id,
    required this.title,
    required this.code,
    required this.status,
    required this.date,
    this.budget = 0,
  });
}
