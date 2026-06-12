import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/pages/tk_main_screen.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/widgets/tk_patient_card.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/patient.dart';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:universal_html/html.dart' as html;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class TkPatientListScreen extends StatefulWidget {
  final bool showBackButton;

  const TkPatientListScreen({
    super.key,
    this.showBackButton = true,
  });

  @override
  State<TkPatientListScreen> createState() => _TkPatientListScreenState();
}

class _TkPatientListScreenState extends State<TkPatientListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  
  String _selectedFakultas = 'Semua Fakultas';
  String _selectedProdi = 'Semua Prodi';
  String _selectedGender = 'Semua Gender';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TkPatientProvider>().loadPatients();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  
  Future<void> _exportPdf(List<Patient> patients) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Menyiapkan PDF...'), duration: Duration(seconds: 1)),
    );

    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            pw.Header(
              level: 0,
              child: pw.Text('Daftar Mahasiswa (Pasien)', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
            ),
            pw.SizedBox(height: 20),
            pw.TableHelper.fromTextArray(
              headers: ['NIM', 'Nama', 'Fakultas', 'Program Studi', 'Gender', 'Kontak'],
              data: patients.map((p) => [
                p.nim,
                p.nama,
                p.fakultas,
                p.prodi,
                p.jenisKelamin,
                p.noHP ?? '-',
              ]).toList(),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey300),
              cellHeight: 30,
              cellAlignments: {
                0: pw.Alignment.centerLeft,
                1: pw.Alignment.centerLeft,
                2: pw.Alignment.centerLeft,
                3: pw.Alignment.centerLeft,
                4: pw.Alignment.centerLeft,
                5: pw.Alignment.centerLeft,
              },
            ),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    await Printing.sharePdf(bytes: bytes, filename: 'daftar_mahasiswa.pdf');
  }

  Future<void> _exportExcel(List<Patient> patients) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Menyiapkan Excel (CSV)...'), duration: Duration(seconds: 1)),
    );

    List<List<dynamic>> rows = [];
    rows.add(['NIM', 'Nama', 'Fakultas', 'Program Studi', 'Gender', 'Kontak']);
    
    for (var p in patients) {
      rows.add([p.nim, p.nama, p.fakultas, p.prodi, p.jenisKelamin, p.noHP ?? '-']);
    }
    
    String csv = rows.map((row) => row.map((cell) => '"${cell.toString().replaceAll('"', '""')}"').join(',')).join('\n');
    final bytes = Uint8List.fromList(csv.codeUnits);
    
    if (kIsWeb) {
      final blob = html.Blob([bytes], 'text/csv');
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.document.createElement('a') as html.AnchorElement
        ..href = url
        ..style.display = 'none'
        ..download = 'daftar_mahasiswa.csv';
      html.document.body!.children.add(anchor);
      anchor.click();
      html.document.body!.children.remove(anchor);
      html.Url.revokeObjectUrl(url);
    } else {
      await Printing.sharePdf(bytes: bytes, filename: 'daftar_mahasiswa.csv');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.primary),
          onPressed: () {
            final mainState = context.findAncestorStateOfType<TkMainScreenState>();
            if (mainState != null) {
              mainState.setSelectedIndex(0);
            } else if (GoRouter.of(context).canPop()) {
              context.pop();
            } else {
              context.go('/tenagakes?tab=0');
            }
          },
        ),
        title: Text(
          'Daftar Mahasiswa',
          style: AppTextStyles.titleMd.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: Consumer<TkPatientProvider>(
        builder: (context, provider, child) {
          // Extract unique filters from loaded patients
          final fakultasList = ['Semua Fakultas', ...provider.patients.map((e) => e.fakultas).where((e) => e.isNotEmpty).toSet().toList()..sort()];
          
          Iterable<Patient> prodiSource = provider.patients;
          if (_selectedFakultas != 'Semua Fakultas') {
            prodiSource = prodiSource.where((p) => p.fakultas == _selectedFakultas);
          }
          final prodiList = ['Semua Prodi', ...prodiSource.map((e) => e.prodi).where((e) => e.isNotEmpty).toSet().toList()..sort()];
          
          final genderList = ['Semua Gender', 'Laki-laki', 'Perempuan'];

          // Ensure selected values are in the list, otherwise reset
          if (!fakultasList.contains(_selectedFakultas)) _selectedFakultas = 'Semua Fakultas';
          if (!prodiList.contains(_selectedProdi)) _selectedProdi = 'Semua Prodi';

          // Calculate filtered patients
          List<Patient> filteredPatients = provider.patients;
          if (_searchQuery.isNotEmpty) {
            filteredPatients = filteredPatients.where((p) {
              return p.nama.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                  p.nim.toLowerCase().contains(_searchQuery.toLowerCase());
            }).toList();
          }
          if (_selectedFakultas != 'Semua Fakultas') {
            filteredPatients = filteredPatients.where((p) => p.fakultas == _selectedFakultas).toList();
          }
          if (_selectedProdi != 'Semua Prodi') {
            filteredPatients = filteredPatients.where((p) => p.prodi == _selectedProdi).toList();
          }
          if (_selectedGender != 'Semua Gender') {
            if (_selectedGender == 'Laki-laki') {
              filteredPatients = filteredPatients.where((p) => p.jenisKelamin.toLowerCase().startsWith('l')).toList();
            } else if (_selectedGender == 'Perempuan') {
              filteredPatients = filteredPatients.where((p) => p.jenisKelamin.toLowerCase().startsWith('p')).toList();
            }
          }

          return Column(
            children: [
              // Filters Section
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.filter_alt_outlined, size: 20, color: AppColors.neutral700),
                        const SizedBox(width: 8),
                        Text(
                          'SARING & CARI MAHASISWA',
                          style: AppTextStyles.labelMd.copyWith(
                            color: AppColors.neutral700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Search
                    Text('PENCARIAN', style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Ketik NIM atau Nama...',
                        filled: true,
                        fillColor: AppColors.neutral50,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: AppColors.neutral200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: AppColors.neutral200),
                        ),
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.neutral500),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                      ),
                      onChanged: (value) {
                        setState(() => _searchQuery = value);
                        // Local search, no need to await provider search if doing client side filter
                      },
                    ),
                    const SizedBox(height: 12),

                    // Filters row
                    Row(
                      children: [
                        Expanded(
                          child: _buildFilterSelector(
                            label: 'FAKULTAS',
                            value: _selectedFakultas,
                            items: fakultasList,
                            onChanged: (val) {
                              setState(() {
                                _selectedFakultas = val!;
                                _selectedProdi = 'Semua Prodi'; // Reset prodi when fakultas changes
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildFilterSelector(
                            label: 'PROGRAM STUDI',
                            value: _selectedProdi,
                            items: prodiList,
                            onChanged: (val) => setState(() => _selectedProdi = val!),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildFilterSelector(
                      label: 'JENIS KELAMIN',
                      value: _selectedGender,
                      items: genderList,
                      onChanged: (val) => setState(() => _selectedGender = val!),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _exportExcel(filteredPatients),
                            icon: const Icon(Icons.download_rounded, size: 18),
                            label: const Text('Export Excel'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.neutral700,
                              side: BorderSide(color: AppColors.neutral300),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _exportPdf(filteredPatients),
                            icon: const Icon(Icons.download_rounded, size: 18),
                            label: const Text('Export PDF'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Patient List
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _buildPatientList(provider, filteredPatients),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFilterSelector({
    required String label,
    required String value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelSm.copyWith(color: AppColors.neutral500)),
        const SizedBox(height: 4),
        InkWell(
          onTap: () {
            _showSelectionBottomSheet(
              title: label,
              items: items,
              selectedValue: value,
              onSelected: onChanged,
            );
          },
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.neutral50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.neutral200),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    value,
                    style: AppTextStyles.bodyMd.copyWith(
                      color: value.startsWith('Semua') ? AppColors.neutral500 : AppColors.neutral800,
                      fontWeight: value.startsWith('Semua') ? FontWeight.normal : FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.expand_more_rounded, size: 20, color: AppColors.neutral500),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showSelectionBottomSheet({
    required String title,
    required List<String> items,
    required String selectedValue,
    required void Function(String) onSelected,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.7,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 8, bottom: 16),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.neutral300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Text(
                        'Pilih $title',
                        style: AppTextStyles.titleMd.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.neutral800,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: AppColors.neutral500),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      final isSelected = item == selectedValue;
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                        title: Text(
                          item,
                          style: AppTextStyles.bodyMd.copyWith(
                            color: isSelected ? AppColors.primary : AppColors.neutral800,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: AppColors.primary)
                            : null,
                        onTap: () {
                          Navigator.pop(context);
                          onSelected(item);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPatientList(TkPatientProvider provider, List<Patient> patients) {
    if (patients.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: AppColors.neutral300),
            const SizedBox(height: 16),
            Text(
              'Mahasiswa tidak ditemukan',
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadPatients(),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        itemCount: patients.length,
        itemBuilder: (context, index) {
          final patient = patients[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TkPatientCard(
              patient: patient,
              onTap: () => _navigateToPatientDetail(patient),
            ),
          );
        },
      ),
    );
  }

  void _navigateToPatientDetail(Patient patient) {
    context.read<TkPatientProvider>().selectPatient(patient);
    context.push('/tk/patient/${patient.id}');
  }
}
