import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/providers/tk_patient_provider.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/presentation/widgets/tk_patient_card.dart';
import 'package:bkuhub_mobile/features/tenaga_kesehatan/domain/entities/patient.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: widget.showBackButton
          ? AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => context.pop(),
              ),
              title: Text(
                'Daftar Pasien',
                style: AppTextStyles.titleMd.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                ),
              ),
            )
          : AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              title: Text(
                'Daftar Pasien',
                style: AppTextStyles.titleMd.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
      body: Consumer<TkPatientProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              // Search Bar
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari pasien (Nama/NIM)...',
                    filled: true,
                    fillColor: AppColors.neutral100,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
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
                  onChanged: (value) async {
                    setState(() => _searchQuery = value);
                    if (value.isNotEmpty) {
                      await provider.searchPatients(value);
                    }
                  },
                ),
              ),

              // Patient List
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _buildPatientList(provider),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPatientList(TkPatientProvider provider) {
    List<Patient> patients;
    if (_searchQuery.isNotEmpty) {
      patients = provider.patients.where((p) {
        return p.nama.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            p.nim.toLowerCase().contains(_searchQuery.toLowerCase());
      }).toList();
    } else {
      patients = provider.patients;
    }

    if (patients.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: AppColors.neutral300),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isNotEmpty
                  ? 'Pasien tidak ditemukan'
                  : 'Belum ada data pasien',
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.neutral400),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadPatients(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
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