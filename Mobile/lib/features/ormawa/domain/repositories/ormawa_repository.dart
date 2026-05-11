import '../entities/ormawa_proposal.dart';
import '../entities/ormawa_agenda.dart';
import '../entities/pkkmb_mission.dart';
import '../entities/banding_appeal.dart';

abstract class OrmawaRepository {
  List<OrmawaProposal> getProposals();
  List<OrmawaAgenda> getAgendas();
  List<PKKMBMission> getPKKMBMissions();
  List<BandingAppeal> getAppeals();
  
  void addProposal(OrmawaProposal proposal);
  void addPKKMBMission(PKKMBMission mission);
  void togglePKKMBMissionStatus(String id);
  void reviewAppeal(String id, bool approved);
}
