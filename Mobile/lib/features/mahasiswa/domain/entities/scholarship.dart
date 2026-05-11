class Scholarship {
  final String id;
  final String title;
  final String provider;
  final String category;
  final String deadline;
  final String coverAmount;
  final String description;
  final String status;
  final String? applicationStatus;

  Scholarship({
    required this.id, 
    required this.title, 
    required this.provider, 
    required this.category, 
    required this.deadline, 
    required this.coverAmount, 
    required this.description, 
    this.status = 'Open', 
    this.applicationStatus
  });
}
