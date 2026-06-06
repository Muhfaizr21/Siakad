import 'package:flutter/foundation.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/booking.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';

class TkBookingProvider extends ChangeNotifier {
  final TkRepository repository;

  TkBookingProvider({required this.repository});

  // State
  bool _isLoading = false;
  String? _error;
  List<Booking> _bookings = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Booking> get bookings => _bookings;
  List<Booking> get allBookings => _bookings;

  List<Booking> get pendingBookings =>
      _bookings.where((b) => b.status == 'Menunggu Konfirmasi').toList();

  List<Booking> get confirmedBookings =>
      _bookings.where((b) => b.status == 'Dikonfirmasi').toList();

  List<Booking> get completedBookings =>
      _bookings.where((b) => b.status == 'Selesai').toList();

  List<Booking> get rejectedBookings =>
      _bookings.where((b) => b.status == 'Ditolak').toList();

  int get pendingCount => pendingBookings.length;
  int get confirmedCount => confirmedBookings.length;

  Future<void> loadBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _bookings = await repository.getBookings();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<bool> acceptBooking(int id) async {
    try {
      final updated = await repository.updateBookingStatus(id, 'Dikonfirmasi');
      _updateBookingInList(updated);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> rejectBooking(int id, {String? alasan}) async {
    try {
      final updated = await repository.updateBookingStatus(
        id,
        'Ditolak',
        alasanPenolakan: alasan,
      );
      _updateBookingInList(updated);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> completeBooking(int id) async {
    try {
      final updated = await repository.updateBookingStatus(id, 'Selesai');
      _updateBookingInList(updated);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void _updateBookingInList(Booking updated) {
    final index = _bookings.indexWhere((b) => b.id == updated.id);
    if (index != -1) {
      _bookings[index] = updated;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}