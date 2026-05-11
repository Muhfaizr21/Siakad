import '../../domain/entities/ormawa_agenda.dart';

class OrmawaAgendaModel extends OrmawaAgenda {
  OrmawaAgendaModel({
    required super.id,
    required super.title,
    required super.date,
    required super.status,
    required super.description,
    required super.location,
  });

  factory OrmawaAgendaModel.fromJson(Map<String, dynamic> json) {
    return OrmawaAgendaModel(
      id: json['id'],
      title: json['title'],
      date: DateTime.parse(json['date']),
      status: json['status'],
      description: json['description'],
      location: json['location'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'date': date.toIso8601String(),
      'status': status,
      'description': description,
      'location': location,
    };
  }
}
