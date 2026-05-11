import '../../domain/entities/ormawa_agenda.dart';

class OrmawaAgendaModel extends OrmawaAgenda {
  OrmawaAgendaModel({
    required super.id,
    required super.title,
    required super.date,
    required super.endDate,
    required super.status,
    required super.description,
    required super.location,
  });

  factory OrmawaAgendaModel.fromJson(Map<String, dynamic> json) {
    return OrmawaAgendaModel(
      id: json['ID']?.toString() ?? json['id']?.toString() ?? '',
      title: json['Judul'] ?? json['title'] ?? '',
      date: json['TanggalMulai'] != null 
          ? DateTime.parse(json['TanggalMulai']) 
          : (json['date'] != null ? DateTime.parse(json['date']) : DateTime.now()),
      endDate: json['TanggalSelesai'] != null
          ? DateTime.parse(json['TanggalSelesai'])
          : (json['TanggalMulai'] != null 
              ? DateTime.parse(json['TanggalMulai']).add(const Duration(hours: 2))
              : DateTime.now().add(const Duration(hours: 2))),
      status: json['Status'] ?? json['status'] ?? 'Persiapan',
      description: json['Deskripsi'] ?? json['description'] ?? '',
      location: json['Lokasi'] ?? json['location'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'Judul': title,
      'Deskripsi': description,
      'TanggalMulai': date.toIso8601String(),
      'TanggalSelesai': endDate.toIso8601String(),
      'Lokasi': location,
      'Status': status,
    };
  }
}
