import 'package:equatable/equatable.dart';

class Psychologist extends Equatable {
  final String id;
  final String name;
  final String nidn;
  final String specialization;
  final String profileImageUrl;
  final bool isAvailable;

  const Psychologist({
    required this.id,
    required this.name,
    required this.nidn,
    required this.specialization,
    required this.profileImageUrl,
    this.isAvailable = true,
  });

  @override
  List<Object?> get props => [id, name, nidn, specialization, profileImageUrl, isAvailable];
}
