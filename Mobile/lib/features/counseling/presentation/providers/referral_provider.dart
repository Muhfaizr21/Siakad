import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/features/counseling/data/models/counseling_models.dart';
import 'package:bkuhub_mobile/features/counseling/data/repositories/counseling_repository_impl.dart';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'dart:developer';

class ReferralProvider extends ChangeNotifier {
  final CounselingRepositoryImpl repository;

  List<Referral> _referrals = [];
  bool _isLoading = false;
  String? _error;
  bool _isCreating = false;
  bool _isSending = false;

  ReferralProvider({required this.repository});

  List<Referral> get referrals => _referrals;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isCreating => _isCreating;
  bool get isSending => _isSending;

  Future<void> loadReferrals() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await repository.getReferrals();
      _referrals = data.map((item) => Referral.fromJson(item)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      log('Error loading referrals: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createReferral({
    required int mahasiswaId,
    required String tipe,
    required String alasan,
    required String pihakTujuan,
    required String emailTujuan,
    int? bookingId,
  }) async {
    _isCreating = true;
    _error = null;
    notifyListeners();
    try {
      await repository.createReferral(
        mahasiswaId: mahasiswaId,
        tipe: tipe,
        alasan: alasan,
        pihakTujuan: pihakTujuan,
        emailTujuan: emailTujuan,
        bookingId: bookingId,
      );

      // Reload referrals after creating
      await loadReferrals();
      _isCreating = false;
      notifyListeners();
      return true;
    } catch (e) {
      log('Error creating referral: $e');
      _error = e.toString();
      _isCreating = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> sendReferral(int referralId) async {
    _isSending = true;
    _error = null;
    notifyListeners();
    try {
      await repository.sendReferral(referralId);

      // Reload referrals after sending
      await loadReferrals();
      _isSending = false;
      notifyListeners();
      return true;
    } catch (e) {
      log('Error sending referral: $e');
      _error = e.toString();
      _isSending = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> confirmReferralReceived(int referralId) async {
    _isSending = true;
    _error = null;
    notifyListeners();
    try {
      await repository.confirmReferralReceived(referralId);

      // Reload referrals after confirming
      await loadReferrals();
      _isSending = false;
      notifyListeners();
      return true;
    } catch (e) {
      log('Error confirming referral received: $e');
      _error = e.toString();
      _isSending = false;
      notifyListeners();
      return false;
    }
  }
}
