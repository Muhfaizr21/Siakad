import '../../domain/entities/scholarship.dart';

class ScholarshipModel extends Scholarship {
  ScholarshipModel({
    required String id,
    required String title,
    required String provider,
    required String category,
    required String deadline,
    required String coverAmount,
    required String description,
    String status = 'Open',
    String? applicationStatus,
  }) : super(
          id: id,
          title: title,
          provider: provider,
          category: category,
          deadline: deadline,
          coverAmount: coverAmount,
          description: description,
          status: status,
          applicationStatus: applicationStatus,
        );

  factory ScholarshipModel.fromJson(Map<String, dynamic> json) {
    return ScholarshipModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      provider: json['provider'] ?? '',
      category: json['category'] ?? '',
      deadline: json['deadline'] ?? '',
      coverAmount: json['coverAmount'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'Open',
      applicationStatus: json['applicationStatus'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'provider': provider,
      'category': category,
      'deadline': deadline,
      'coverAmount': coverAmount,
      'description': description,
      'status': status,
      'applicationStatus': applicationStatus,
    };
  }
}
