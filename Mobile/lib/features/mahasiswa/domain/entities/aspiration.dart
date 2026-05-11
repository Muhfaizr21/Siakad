class Aspiration {
  final String id;
  final String category;
  final String title;
  final String description;
  final DateTime date;
  final String status; 
  final String? feedback;
  final String? imageUrl;

  Aspiration({required this.id, required this.category, required this.title, required this.description, required this.date, required this.status, this.feedback, this.imageUrl});
}
