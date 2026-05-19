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
  final String? motivasi;
  final String? ktmKtpUrl;
  final String? sertifikatUrl;
  final String? transkripUrl;

  Scholarship({
    required this.id, 
    required this.title, 
    required this.provider, 
    required this.category, 
    required this.deadline, 
    required this.coverAmount, 
    required this.description, 
    this.status = 'Open', 
    this.applicationStatus,
    this.motivasi,
    this.ktmKtpUrl,
    this.sertifikatUrl,
    this.transkripUrl,
  });
}
