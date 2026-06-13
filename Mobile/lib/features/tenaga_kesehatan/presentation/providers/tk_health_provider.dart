import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_insurance_claim_model.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_bap_model.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/data/models/tk_clinical_report_model.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/repositories/tk_repository.dart';

class TkHealthProvider extends ChangeNotifier {
  final TkRepository repository;

  TkHealthProvider({required this.repository});

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  // State for Insurance Claims
  List<TkInsuranceClaimModel> _claims = [];
  List<TkInsuranceClaimModel> get claims => _claims;

  // State for BAP
  List<TkBapModel> _baps = [];
  List<TkBapModel> get baps => _baps;

  // State for Clinical Reports
  TkClinicalReportModel? _clinicalReports;
  TkClinicalReportModel? get clinicalReports => _clinicalReports;

  // ==================== INSURANCE CLAIMS ====================

  Future<void> fetchInsuranceClaims() async {
    _setLoading(true);
    try {
      _claims = await repository.getInsuranceClaims();
      _error = null;
    } catch (e) {
      _error = e.toString();
      log('Error fetching insurance claims: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateClaimStatus(int id, String status, {String? catatanReview}) async {
    _setLoading(true);
    try {
      final updatedClaim = await repository.updateInsuranceClaimStatus(
        id,
        status,
        catatanReview: catatanReview,
      );
      final index = _claims.indexWhere((c) => c.id == id);
      if (index != -1) {
        _claims[index] = updatedClaim;
      }
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      log('Error updating claim status: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ==================== BAP KESEHATAN ====================

  Future<void> fetchBAPs() async {
    _setLoading(true);
    try {
      _baps = await repository.getBAPs();
      _error = null;
    } catch (e) {
      _error = e.toString();
      log('Error fetching BAPs: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> createBAP(Map<String, dynamic> data) async {
    _setLoading(true);
    try {
      final newBap = await repository.createBAP(data);
      _baps.insert(0, newBap);
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      log('Error creating BAP: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateBAP(int id, Map<String, dynamic> data) async {
    _setLoading(true);
    try {
      final updatedBap = await repository.updateBAP(id, data);
      final index = _baps.indexWhere((b) => b.id == id);
      if (index != -1) {
        _baps[index] = updatedBap;
      }
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      log('Error updating BAP: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> deleteBAP(int id) async {
    _setLoading(true);
    try {
      await repository.deleteBAP(id);
      _baps.removeWhere((b) => b.id == id);
      _error = null;
      return true;
    } catch (e) {
      _error = e.toString();
      log('Error deleting BAP: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<String?> downloadBAP(int id) async {
    _setLoading(true);
    try {
      final url = await repository.exportBAPPdf(id);
      _error = null;
      return url;
    } catch (e) {
      _error = e.toString();
      log('Error getting download URL: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // ==================== CLINICAL REPORTS ====================

  Future<void> fetchClinicalReports({String? startDate, String? endDate}) async {
    _setLoading(true);
    try {
      _clinicalReports = await repository.getClinicalReports(
        startDate: startDate,
        endDate: endDate,
      );
      _error = null;
    } catch (e) {
      _error = e.toString();
      log('Error fetching clinical reports: $e');
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
