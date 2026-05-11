import 'package:flutter/material.dart';
import '../../features/ormawa/domain/entities/ormawa_proposal.dart';
import '../../features/ormawa/domain/entities/ormawa_agenda.dart';
import '../../features/ormawa/domain/entities/pkkmb_mission.dart';
import '../../features/ormawa/domain/entities/banding_appeal.dart';
import '../../features/ormawa/domain/repositories/ormawa_repository.dart';

class OrmawaProvider extends ChangeNotifier {
  final OrmawaRepository _repository;

  OrmawaProvider(this._repository);

  // Organization Info
  String _orgName = "BEM KBM BHAKTI KENCANA";
  String _academicYear = "2025/2026";
  
  // Stats
  int _totalMembers = 124;
  double _balance = 2400000; // 2.4M
  int _activeProposalsCount = 3;
  int _upcomingAgendasCount = 2;

  // PKKMB Stats
  int _totalPKKMBParticipants = 10160;
  int _passedPKKMBCount = 8450;
  int _inProgressPKKMBCount = 1710;

  // Getters
  String get orgName => _orgName;
  String get academicYear => _academicYear;
  int get totalMembers => _totalMembers;
  double get balance => _balance;
  int get activeProposalsCount => _activeProposalsCount;
  int get upcomingAgendasCount => _upcomingAgendasCount;
  
  List<OrmawaProposal> get proposals => _repository.getProposals();
  List<OrmawaAgenda> get agendas => _repository.getAgendas();

  // PKKMB Getters
  int get totalPKKMBParticipants => _totalPKKMBParticipants;
  int get passedPKKMBCount => _passedPKKMBCount;
  int get inProgressPKKMBCount => _inProgressPKKMBCount;
  List<PKKMBMission> get pkkmbMissions => _repository.getPKKMBMissions();
  List<BandingAppeal> get appeals => _repository.getAppeals();

  // Logic Bridge Methods
  Future<void> refreshData() async {
    await Future.delayed(const Duration(seconds: 1));
    notifyListeners();
  }

  void addProposal(OrmawaProposal proposal) {
    _repository.addProposal(proposal);
    _activeProposalsCount++;
    notifyListeners();
  }

  void updateOrgName(String newName) {
    _orgName = newName;
    notifyListeners();
  }

  // PKKMB Methods
  void addPKKMBMission(PKKMBMission mission) {
    _repository.addPKKMBMission(mission);
    notifyListeners();
  }

  void togglePKKMBMissionStatus(String id) {
    _repository.togglePKKMBMissionStatus(id);
    notifyListeners();
  }

  // Banding Methods
  void reviewAppeal(String id, bool approved) {
    _repository.reviewAppeal(id, approved);
    notifyListeners();
  }
}
