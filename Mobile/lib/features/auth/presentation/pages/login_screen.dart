import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:bkuhub_mobile/core/theme/app_colors.dart';
import 'package:bkuhub_mobile/core/theme/app_text_styles.dart';
import 'package:bkuhub_mobile/core/widgets/fade_in_animation.dart';
import 'package:go_router/go_router.dart';
import 'package:bkuhub_mobile/core/routes/app_routes.dart';

import 'package:bkuhub_mobile/core/services/auth_service.dart';
import 'package:provider/provider.dart';
import 'package:bkuhub_mobile/core/providers/student_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isPasswordVisible = false;
  bool _isLoading = false;
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();

  Future<void> _handleLogin() async {
    if (_usernameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('NIM / Email tidak boleh kosong')),
      );
      return;
    }
    if (_passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password tidak boleh kosong')),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    String errorMessage = 'Login gagal. Periksa kembali NIM/Email dan Password Anda.';

    try {
      final success = await _authService.login(
        _usernameController.text, 
        _passwordController.text,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (success) {
        if (_authService.currentRole == UserRole.student) {
          Provider.of<StudentProvider>(context, listen: false).loadAllData();
        }
        
        if (_authService.currentRole == UserRole.ormawa) {
          context.go(AppRoutes.ormawaMain);
        } else if (_authService.currentRole == UserRole.psychologist) {
          context.go(AppRoutes.psychologistMain);
        } else {
          context.go(AppRoutes.studentMain);
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage)),
        );
      }
    } on DioException catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      } else if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.connectionError) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // 1. Background Blue with Batik Pattern
          _buildHeaderBackground(context),

          // 2. Scrollable Content
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                const SizedBox(height: 50),
                _buildLogoSection(),
                const SizedBox(height: 32),

                // 3. Login Body with Premium Styling
                Container(
                  width: double.infinity,
                  constraints: BoxConstraints(
                    minHeight: (MediaQuery.of(context).size.height - 300).clamp(
                      0,
                      double.infinity,
                    ),
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(60),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withAlpha(15),
                        blurRadius: 40,
                        offset: const Offset(0, -10),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 48,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FadeInAnimation(
                        delay: 0.5,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Masuk Akun',
                              style: AppTextStyles.titleLg.copyWith(
                                fontSize: 36,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      FadeInAnimation(
                        delay: 0.6,
                        child: Text(
                          'Silakan login untuk melanjutkan akses portal.',
                          style: AppTextStyles.labelMd.copyWith(
                            color: AppColors.outline,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      FadeInAnimation(
                        delay: 0.7,
                        child: _buildTextField(
                          label: 'NIM / Email',
                          placeholder: 'Masukkan NIM atau Email Anda',
                          icon: Icons.person_rounded,
                          controller: _usernameController,
                        ),
                      ),
                      const SizedBox(height: 16),

                      FadeInAnimation(
                        delay: 0.8,
                        child: _buildTextField(
                          label: 'Password',
                          placeholder: 'Masukkan password',
                          icon: Icons.lock_rounded,
                          isPassword: true,
                          controller: _passwordController,
                        ),
                      ),

                      const SizedBox(height: 16),
                      FadeInAnimation(
                        delay: 0.9,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: Text(
                              'Lupa Password?',
                              style: AppTextStyles.labelMd.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      FadeInAnimation(delay: 1.0, child: _buildLoginButton()),

                      const SizedBox(height: 24),
                      FadeInAnimation(delay: 1.1, child: _buildHelpInfo()),

                      const SizedBox(height: 24),
                      FadeInAnimation(delay: 1.2, child: _buildFooter()),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBackground(BuildContext context) {
    return Container(
      height: 450,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryContainer],
        ),
      ),
      child: Stack(
        children: [
          // Batik Pattern Overlay
          Opacity(
            opacity: 0.15,
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: ExactAssetImage(
                    'assets/images/batik_pattern.png',
                    scale: 4.0,
                  ),
                  repeat: ImageRepeat.repeat,
                  fit: BoxFit.none,
                ),
              ),
            ),
          ),
          Positioned(
            top: -40,
            right: -40,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withAlpha(8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoSection() {
    return FadeInAnimation(
      delay: 0.2,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(40),
                  blurRadius: 40,
                  offset: const Offset(0, 20),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/images/logoBKU.jpg',
                width: 80,
                height: 80,
                fit: BoxFit.contain,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'BKU Hub',
            style: AppTextStyles.titleLg.copyWith(
              color: Colors.white,
              fontSize: 38,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(30),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withAlpha(40)),
            ),
            child: Text(
              'Smart Campus Ecosystem',
              style: AppTextStyles.labelSm.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginButton() {
    return SizedBox(
      width: double.infinity,
      height: 56, // Reduced height
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16), // Smaller radius
          ),
          elevation: 0,
          disabledBackgroundColor: AppColors.primary.withAlpha(150),
        ),
        child: _isLoading
            ? const SizedBox(
                height: 24,
                width: 24,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Text(
                'Masuk ke Akun', // Title Case
                style: AppTextStyles.bodyLg.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
      ),
    );
  }

  Widget _buildHelpInfo() {
    return Center(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Butuh bantuan? ',
                style: AppTextStyles.labelMd.copyWith(color: AppColors.outline),
              ),
              GestureDetector(
                onTap: () {},
                child: Text(
                  'Hubungi Helpdesk',
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Center(
      child: Text(
        'Universitas Bhakti Kencana • v1.2.0',
        style: AppTextStyles.labelSm.copyWith(
          color: AppColors.outline.withAlpha(100),
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String placeholder,
    required IconData icon,
    bool isPassword = false,
    TextEditingController? controller,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          obscureText: isPassword && !_isPasswordVisible,
          style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            labelText: label,
            labelStyle: AppTextStyles.labelMd.copyWith(
              color: AppColors.outline.withAlpha(150),
            ),
            floatingLabelStyle: AppTextStyles.labelMd.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
            hintText: placeholder,
            hintStyle: AppTextStyles.labelMd.copyWith(
              color: AppColors.outline.withAlpha(80),
            ),
            prefixIcon: Icon(
              icon,
              color: AppColors.primary.withAlpha(180),
              size: 20,
            ),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility_rounded
                          : Icons.visibility_off_rounded,
                      color: AppColors.outline.withAlpha(120),
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: AppColors.outline.withAlpha(30)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 20,
              vertical: 18,
            ),
          ),
        ),
      ],
    );
  }
}
