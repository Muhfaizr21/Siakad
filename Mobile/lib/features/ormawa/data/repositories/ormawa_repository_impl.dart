import 'package:flutter/material.dart';
import '../../domain/entities/ormawa_proposal.dart';
import '../../domain/entities/ormawa_agenda.dart';
import '../../domain/entities/pkkmb_mission.dart';
import '../../domain/entities/banding_appeal.dart';
import '../../domain/repositories/ormawa_repository.dart';

class OrmawaRepositoryImpl implements OrmawaRepository {

  final List<PKKMBMission> _pkkmbMissions = [
    PKKMBMission(
      id: '1',
      title: 'Aturan & Tata Tertib',
      desc: 'Materi PDF Wajib Baca bagi seluruh peserta.',
      stage: 'Pra-PKKMB',
      type: 'PDF',
      icon: Icons.picture_as_pdf_rounded,
      color: const Color(0xFF2563EB),
      participantCount: 10160,
    ),
    PKKMBMission(
      id: '2',
      title: 'Kuis Pra-PKKMB',
      desc: 'Tes Pemahaman Awal sebelum masuk materi inti.',
      stage: 'Pra-PKKMB',
      type: 'Quiz',
      icon: Icons.quiz_rounded,
      color: const Color(0xFFF59E0B),
      participantCount: 9800,
    ),
    PKKMBMission(
      id: '3',
      title: 'Materi Wawasan Kebangsaan',
      desc: 'Video Materi dari Rektorat Universitas Bhakti Kencana.',
      stage: 'Pelaksanaan Inti',
      type: 'Video',
      icon: Icons.play_circle_fill_rounded,
      color: const Color(0xFF9333EA),
      participantCount: 5200,
    ),
  ];

  final List<BandingAppeal> _appeals = [
    BandingAppeal(
      id: 'B1',
      studentName: 'Budi Santoso',
      nim: 'BKU2024001',
      quizTitle: 'Kuis Sejarah Kampus',
      initialScore: '60',
      reason: 'Ada gangguan koneksi saat submit sehingga jawaban tidak terkirim semua.',
      evidenceUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
    ),
    BandingAppeal(
      id: 'B2',
      studentName: 'Siti Aminah',
      nim: 'BKU2024102',
      quizTitle: 'Kuis Etika Akademik',
      initialScore: '65',
      reason: 'Waktu kurang cukup untuk soal esai di bagian akhir.',
      evidenceUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop',
    ),
  ];

  final List<OrmawaProposal> _proposals = [
    OrmawaProposal(
      id: '1',
      title: 'Festival Mahasiswa UBK 2026',
      code: 'PROP-001',
      status: 'Diajukan',
      date: DateTime(2026, 5, 10, 14, 00),
      budget: 25000000,
    ),
    OrmawaProposal(
      id: '2',
      title: 'Seminar Nasional Teknologi',
      code: 'PROP-002',
      status: 'Disetujui',
      date: DateTime(2026, 5, 5, 10, 00),
      budget: 15000000,
    ),
    OrmawaProposal(
      id: '3',
      title: 'Workshop Desain Grafis',
      code: 'PROP-003',
      status: 'Ditolak',
      date: DateTime(2026, 5, 4, 09, 30),
      budget: 5000000,
    ),
  ];

  final List<OrmawaAgenda> _agendas = [
    OrmawaAgenda(
      id: 'A1',
      title: 'Rapat Koordinasi Bulanan',
      date: DateTime(2026, 5, 15, 13, 00),
      status: 'Persiapan',
      description: 'Evaluasi kinerja bulanan dan perencanaan program kerja divisi untuk bulan depan.',
      location: 'Ruang Rapat Lantai 2',
    ),
    OrmawaAgenda(
      id: 'A2',
      title: 'Peluncuran Website Ormawa',
      date: DateTime(2026, 5, 20, 09, 00),
      status: 'Persiapan',
      description: 'Launching resmi platform digital informasi terpadu ormawa BKUhub.',
      location: 'Aula Gedung Serba Guna',
    ),
  ];

  @override
  List<OrmawaProposal> getProposals() => _proposals;

  @override
  List<OrmawaAgenda> getAgendas() => _agendas;

  @override
  List<PKKMBMission> getPKKMBMissions() => _pkkmbMissions;

  @override
  List<BandingAppeal> getAppeals() => _appeals;

  @override
  void addProposal(OrmawaProposal proposal) {
    _proposals.insert(0, proposal);
  }

  @override
  void addPKKMBMission(PKKMBMission mission) {
    _pkkmbMissions.insert(0, mission);
  }

  @override
  void togglePKKMBMissionStatus(String id) {
    final index = _pkkmbMissions.indexWhere((m) => m.id == id);
    if (index != -1) {
      _pkkmbMissions[index].isActive = !_pkkmbMissions[index].isActive;
    }
  }

  @override
  void reviewAppeal(String id, bool approved) {
    final index = _appeals.indexWhere((a) => a.id == id);
    if (index != -1) {
      _appeals[index].status = approved ? 'DISETUJUI' : 'DITOLAK';
    }
  }
}
