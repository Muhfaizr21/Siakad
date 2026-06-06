import 'package:flutter/foundation.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/schedule.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';

class TkScheduleProvider extends ChangeNotifier {
  final TkRepository repository;

  TkScheduleProvider({required this.repository});

  // State
  bool _isLoading = false;
  String? _error;
  List<Schedule> _schedules = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Schedule> get schedules => _schedules;
  List<Schedule> get upcomingSchedules {
    final now = DateTime.now();
    return _schedules.where((s) => s.tanggal.isAfter(now.subtract(const Duration(days: 1)))).toList()
      ..sort((a, b) => a.tanggal.compareTo(b.tanggal));
  }

  Future<void> loadSchedules() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _schedules = await repository.getSchedules();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<bool> createSchedule({
    required String tanggal,
    required String jamMulai,
    required String jamSelesai,
    required int kuota,
    required String lokasi,
    required String tipeLayanan,
    String? catatan,
    bool isRepeat = false,
    String? repeatDays,
  }) async {
    try {
      final newSchedule = await repository.createSchedule({
        'tanggal': tanggal,
        'jam_mulai': jamMulai,
        'jam_selesai': jamSelesai,
        'kuota': kuota,
        'lokasi': lokasi,
        'tipe_layanan': tipeLayanan,
        'catatan': catatan,
        'is_repeat': isRepeat,
        'repeat_days': repeatDays,
      });
      _schedules.insert(0, newSchedule);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateSchedule(
    int id, {
    String? tanggal,
    String? jamMulai,
    String? jamSelesai,
    int? kuota,
    String? lokasi,
    String? tipeLayanan,
    String? catatan,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (tanggal != null) data['tanggal'] = tanggal;
      if (jamMulai != null) data['jam_mulai'] = jamMulai;
      if (jamSelesai != null) data['jam_selesai'] = jamSelesai;
      if (kuota != null) data['kuota'] = kuota;
      if (lokasi != null) data['lokasi'] = lokasi;
      if (tipeLayanan != null) data['tipe_layanan'] = tipeLayanan;
      if (catatan != null) data['catatan'] = catatan;

      final updated = await repository.updateSchedule(id, data);
      final index = _schedules.indexWhere((s) => s.id == id);
      if (index != -1) {
        _schedules[index] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteSchedule(int id) async {
    try {
      await repository.deleteSchedule(id);
      _schedules.removeWhere((s) => s.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}