import '../../domain/entities/ormawa_proposal.dart';

class OrmawaProposalModel extends OrmawaProposal {
  OrmawaProposalModel({
    required super.id,
    required super.title,
    required super.code,
    required super.status,
    required super.date,
    super.budget,
  });

  factory OrmawaProposalModel.fromJson(Map<String, dynamic> json) {
    return OrmawaProposalModel(
      id: json['id'],
      title: json['title'],
      code: json['code'],
      status: json['status'],
      date: DateTime.parse(json['date']),
      budget: (json['budget'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'code': code,
      'status': status,
      'date': date.toIso8601String(),
      'budget': budget,
    };
  }
}
