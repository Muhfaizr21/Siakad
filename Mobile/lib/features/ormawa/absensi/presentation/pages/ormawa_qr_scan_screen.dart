import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/providers/ormawa_provider.dart';
import 'package:bkuhub_mobile/features/ormawa/data/repositories/ormawa_repository_impl.dart';
import 'package:bkuhub_mobile/core/services/auth_service.dart';

class OrmawaQrScanScreen extends StatefulWidget {
  final String eventId;
  final String eventTitle;

  const OrmawaQrScanScreen({
    super.key,
    required this.eventId,
    required this.eventTitle,
  });

  @override
  State<OrmawaQrScanScreen> createState() => _OrmawaQrScanScreenState();
}

class _OrmawaQrScanScreenState extends State<OrmawaQrScanScreen> with SingleTickerProviderStateMixin {
  late MobileScannerController _scannerController;
  late AnimationController _animationController;
  late Animation<double> _animation;
  bool _isProcessing = false;
  bool _hasScanned = false;
  String? _lastScannedCode;
  String? _scannedStudentName;
  List<Map<String, dynamic>> _studentsLookup = [];
  bool _isLoadingStudents = true;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0, end: 8).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    if (AuthService().currentRole != UserRole.ormawa) {
      if (mounted) {
        setState(() {
          _isLoadingStudents = false;
        });
      }
      return;
    }
    try {
      final repo = OrmawaRepositoryImpl();
      final students = await repo.getStudents();
      if (mounted) {
        setState(() {
          _studentsLookup = students;
          _isLoadingStudents = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingStudents = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
          ),

          // Glassmorphism/Dark Overlay
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withAlpha(150),
            ),
          ),

          // Scan Area frame
          Center(
            child: AnimatedBuilder(
              animation: _animation,
              builder: (context, child) {
                return Container(
                  width: 280 + _animation.value * 2,
                  height: 280 + _animation.value * 2,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: _hasScanned ? Colors.green : AppColors.primary,
                      width: 3,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (_hasScanned ? Colors.green : AppColors.primary).withAlpha(80),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(21),
                    child: Container(
                      color: Colors.transparent,
                    ),
                  ),
                );
              },
            ),
          ),

          // Header
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha(40),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.close_rounded, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Scan Presensi',
                              style: AppTextStyles.titleLg.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              widget.eventTitle,
                              style: AppTextStyles.bodySm.copyWith(
                                color: Colors.white70,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      // Torch Toggle
                      IconButton(
                        onPressed: () => _scannerController.toggleTorch(),
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha(40),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.flash_on_rounded, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Feedback Status at bottom of scan area
          Positioned(
            bottom: 110,
            left: 0,
            right: 0,
            child: Column(
              children: [
                if (_isProcessing) ...[
                  const CircularProgressIndicator(color: Colors.white),
                  const SizedBox(height: 16),
                  Text(
                    'Mencatat kehadiran...',
                    style: AppTextStyles.bodyMd.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ] else if (_hasScanned) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.green.withAlpha(220),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(
                          _scannedStudentName != null ? 'Hadir: $_scannedStudentName' : 'Berhasil Terabsen!',
                          style: AppTextStyles.bodyMd.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(30),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Arahkan kamera ke KTM Digital mahasiswa',
                          style: AppTextStyles.bodySm.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Manual Input Button
          Positioned(
            bottom: 32,
            left: 24,
            right: 24,
            child: SafeArea(
              child: OutlinedButton.icon(
                onPressed: () => _showManualInputDialog(),
                icon: const Icon(Icons.keyboard_rounded),
                label: const Text('Input NIM Manual'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing || _hasScanned) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue;
      if (code != null && code != _lastScannedCode) {
        debugPrint('QR Detected raw: $code');
        _lastScannedCode = code;
        _processQrCode(code);
        break;
      }
    }
  }

  Future<void> _processQrCode(String code) async {
    debugPrint('=== START _processQrCode ===');
    debugPrint('Scanned code: $code');
    setState(() {
      _isProcessing = true;
      _scannedStudentName = null;
    });

    try {
      // Robust parsing of student NIM
      String nim = code;
      if (code.contains('?')) {
        try {
          final uri = Uri.parse(code);
          nim = uri.queryParameters['nim'] ?? uri.queryParameters['NIM'] ?? nim;
        } catch (_) {}
      } else if (code.contains(':')) {
        nim = code.split(':').last;
      }
      nim = nim.trim();
      debugPrint('Parsed NIM: $nim');

      final provider = context.read<OrmawaProvider>();
      String? resolvedId;
      String? studentName;
      String targetEventId = widget.eventId;

      if (code.contains('eventId=') || code.contains('student/presensi')) {
        // Mode 1: Scanning an Event QR Code to check in the logged-in student (Self-Presensi)
        debugPrint('Mode: Event QR Code (Self-Presensi)');
        
        String? parsedEventId;
        try {
          final uri = Uri.parse(code);
          parsedEventId = uri.queryParameters['eventId'] ?? uri.queryParameters['event_id'];
        } catch (_) {}
        
        if (parsedEventId == null || parsedEventId.isEmpty || parsedEventId == 'undefined') {
          throw Exception('ID Kegiatan tidak valid pada QR Code ini.');
        }
        
        targetEventId = parsedEventId;
        
        // Get the logged-in student ID
        resolvedId = provider.mahasiswaId;
        if (resolvedId == null || resolvedId.isEmpty) {
          throw Exception('Gagal melakukan presensi mandiri: Akun mahasiswa tidak terdeteksi.');
        }
        
        // Get name of the logged-in student
        final authData = AuthService().userData;
        studentName = authData?['mahasiswa']?['Nama'] ?? authData?['mahasiswa']?['nama'] ?? authData?['user']?['nama'] ?? 'Anda';
        
        debugPrint('Self-presensi: Event ID: $targetEventId, Student ID: $resolvedId, Name: $studentName');
      } else {
        // Mode 2: Admin scanning student KTM/NIM QR
        debugPrint('Mode: Student KTM QR (Admin Mode)');
        
        if (nim.isEmpty) {
          throw Exception('Kode QR tidak valid.');
        }

        // 1. Check in provider.members
        debugPrint('Checking in members (total: ${provider.members.length})');
        try {
          final match = provider.members.firstWhere(
            (m) => m.nim.trim().toLowerCase() == nim.toLowerCase(),
          );
          resolvedId = match.mahasiswaId;
          studentName = match.name;
          debugPrint('Found in members: $studentName (ID: $resolvedId)');
        } catch (_) {}

        // 2. Check in provider.attendanceList
        if (resolvedId == null) {
          debugPrint('Checking in attendanceList (total: ${provider.attendanceList.length})');
          try {
            final match = provider.attendanceList.firstWhere(
              (e) => e.nim?.trim().toLowerCase() == nim.toLowerCase(),
            );
            resolvedId = match.mahasiswaId;
            studentName = match.mahasiswaName;
            debugPrint('Found in attendanceList: $studentName (ID: $resolvedId)');
          } catch (_) {}
        }

        // 3. Check in preloaded _studentsLookup
        if (resolvedId == null) {
          debugPrint('Checking in _studentsLookup (total: ${_studentsLookup.length})');
          if (_studentsLookup.isNotEmpty) {
            try {
              final match = _studentsLookup.firstWhere(
                (s) => s['nim']?.toString().trim().toLowerCase() == nim.toLowerCase(),
              );
              resolvedId = match['id']?.toString();
              studentName = match['nama']?.toString();
              debugPrint('Found in preloaded lookup: $studentName (ID: $resolvedId)');
            } catch (_) {}
          }
        }

        // 4. Fallback if still loading students lookup
        if (resolvedId == null && _isLoadingStudents) {
          debugPrint('Lookup list still loading. Fetching from API...');
          final repo = OrmawaRepositoryImpl();
          final students = await repo.getStudents();
          _studentsLookup = students;
          _isLoadingStudents = false;
          debugPrint('Fetched ${students.length} students. Checking again...');
          try {
            final match = _studentsLookup.firstWhere(
              (s) => s['nim']?.toString().trim().toLowerCase() == nim.toLowerCase(),
            );
            resolvedId = match['id']?.toString();
            studentName = match['nama']?.toString();
            debugPrint('Found in fallback lookup: $studentName (ID: $resolvedId)');
          } catch (_) {}
        }

        if (resolvedId == null) {
          debugPrint('Student NOT found in any lookup for NIM: $nim');
          throw Exception('Mahasiswa dengan NIM $nim tidak ditemukan.');
        }
      }

      debugPrint('Submitting attendance. Event: $targetEventId, Student ID: $resolvedId');
      // Submit attendance directly using the resolved database ID
      await provider.submitAttendance(targetEventId, resolvedId, 'hadir');
      debugPrint('Attendance submitted successfully.');

      if (!mounted) return;

      setState(() {
        _isProcessing = false;
        _hasScanned = true;
        _scannedStudentName = studentName ?? 'Mahasiswa NIM $nim';
      });

      // Show success feedback
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text('Kehadiran dicatat: ${studentName ?? nim}'),
              ),
            ],
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );

      // Auto-reset scanned state after 1.5 seconds to scan the next one
      await Future.delayed(const Duration(milliseconds: 1500));
      if (mounted) {
        setState(() {
          _hasScanned = false;
          _lastScannedCode = null;
        });
      }

    } catch (e, stack) {
      debugPrint('ERROR in _processQrCode: $e');
      debugPrint('Stacktrace: $stack');
      if (!mounted) return;

      setState(() {
        _isProcessing = false;
        _hasScanned = false;
        _lastScannedCode = null;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text('Gagal mencatat presensi: ${e.toString().replaceAll('Exception: ', '')}'),
              ),
            ],
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  void _showManualInputDialog() {
    final nimController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.person_search_rounded, color: AppColors.primary, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Input NIM Manual',
                          style: AppTextStyles.titleMd.copyWith(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Catat kehadiran berdasarkan NIM mahasiswa',
                          style: AppTextStyles.labelSm.copyWith(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              TextField(
                controller: nimController,
                keyboardType: TextInputType.number,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'NIM Mahasiswa',
                  hintText: 'Contoh: 2204123001',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.badge_rounded),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Batal'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        final nim = nimController.text.trim();
                        if (nim.isNotEmpty) {
                          Navigator.pop(context);
                          _processQrCode(nim);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Submit',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
