class Achievement {
  final String id;
  final String title;
  final String organizer;
  final String level;
  final String rank;
  final DateTime date;
  final String status;
  final bool isSynced;
  final String? certificateUrl;

  Achievement({
    required this.id,
    required this.title,
    required this.organizer,
    required this.level,
    required this.rank,
    required this.date,
    this.status = 'Pending',
    this.isSynced = false,
    this.certificateUrl,
  });
}
