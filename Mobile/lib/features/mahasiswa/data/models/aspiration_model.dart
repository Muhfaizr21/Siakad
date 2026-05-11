import '../../domain/entities/aspiration.dart';

class AspirationModel extends Aspiration {
  AspirationModel({
    required super.id,
    required super.category,
    required super.title,
    required super.description,
    required super.date,
    required super.status,
    super.feedback,
    super.imageUrl,
  });

  factory AspirationModel.fromJson(Map<String, dynamic> json) {
    return AspirationModel(
      id: json['id'] ?? '',
      category: json['category'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
      status: json['status'] ?? '',
      feedback: json['feedback'],
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'title': title,
      'description': description,
      'date': date.toIso8601String(),
      'status': status,
      'feedback': feedback,
      'imageUrl': imageUrl,
    };
  }
}
