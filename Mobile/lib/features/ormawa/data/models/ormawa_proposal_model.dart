import '../../domain/entities/ormawa_proposal.dart';

class OrmawaProposalModel extends OrmawaProposal {
  OrmawaProposalModel({
    required super.id,
    super.ormawaId,
    super.mahasiswaId,
    super.fakultasId,
    required super.title,
    required super.code,
    required super.status,
    required super.date,
    super.budget,
    super.description,
  });

  factory OrmawaProposalModel.fromJson(Map<String, dynamic> json) {
    return OrmawaProposalModel(
      id: json['ID']?.toString() ?? json['id']?.toString() ?? '',
      ormawaId: json['OrmawaID']?.toString() ?? json['ormawa_id']?.toString(),
      mahasiswaId:
          json['MahasiswaID']?.toString() ?? json['mahasiswa_id']?.toString(),
      fakultasId:
          json['FakultasID']?.toString() ?? json['fakultas_id']?.toString(),
      title: json['Judul'] ?? json['title'] ?? '',
      code: 'PROP-${json['ID']}',
      status:
          (json['Status'] ?? json['status'] ?? 'diajukan')
              .toString()
              .toLowerCase(),
      date:
          json['TanggalKegiatan'] != null
              ? DateTime.parse(json['TanggalKegiatan'])
              : (json['date'] != null
                  ? DateTime.parse(json['date'])
                  : DateTime.now()),
      budget:
          (json['Anggaran'] as num?)?.toDouble() ??
          (json['budget'] as num?)?.toDouble() ??
          0,
      description: json['Catatan'] ?? json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    // Clean date format for Go's time.Time
    final cleanDate = '${date.toIso8601String().split('.').first}Z';

    final Map<String, dynamic> data = {
      'Judul': title,
      'Anggaran': budget,
      'Status': status.toLowerCase(),
      'TanggalKegiatan': cleanDate,
      'Catatan': description ?? '',
    };

    if (ormawaId != null && ormawaId!.isNotEmpty) {
      data['OrmawaID'] = int.tryParse(ormawaId!);
    }
    if (mahasiswaId != null && mahasiswaId!.isNotEmpty) {
      data['MahasiswaID'] = int.tryParse(mahasiswaId!);
    }
    if (fakultasId != null && fakultasId!.isNotEmpty) {
      data['FakultasID'] = int.tryParse(fakultasId!);
    }

    return data;
  }
}
