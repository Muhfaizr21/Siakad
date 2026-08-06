import 'package:flutter/material.dart';

/// MobileThemeColors - Dynamic theme colors loaded from API
///
/// This class represents the mobile-specific theme colors that can be
/// configured from the Super Admin panel and loaded at runtime.
class MobileThemeColors {
  // Primary Colors
  final Color primary;
  final Color primaryContainer;

  // Secondary Colors
  final Color secondary;
  final Color secondaryContainer;

  // Surface & Background
  final Color background;
  final Color surface;
  final Color onSurface;
  final Color onSurfaceVariant;

  // Outline & Border
  final Color outline;
  final Color outlineVariant;

  // Gradient Colors (Primary)
  final Color gradientStart;
  final Color gradientMiddle;
  final Color gradientEnd;

  // Gradient Colors (Secondary)
  final Color gradientSecondaryStart;
  final Color gradientSecondaryMiddle;
  final Color gradientSecondaryEnd;

  // Branding URLs
  final String? logoUrl;
  final String? splashLogoUrl;

  const MobileThemeColors({
    required this.primary,
    required this.primaryContainer,
    required this.secondary,
    required this.secondaryContainer,
    required this.background,
    required this.surface,
    required this.onSurface,
    required this.onSurfaceVariant,
    required this.outline,
    required this.outlineVariant,
    required this.gradientStart,
    required this.gradientMiddle,
    required this.gradientEnd,
    required this.gradientSecondaryStart,
    required this.gradientSecondaryMiddle,
    required this.gradientSecondaryEnd,
    this.logoUrl,
    this.splashLogoUrl,
  });

  /// Default colors matching BKU branding
  factory MobileThemeColors.defaults() {
    return const MobileThemeColors(
      primary: Color(0xFF002068),
      primaryContainer: Color(0xFF003399),
      secondary: Color(0xFF745B00),
      secondaryContainer: Color(0xFFFDD355),
      background: Color(0xFFFBF9F8),
      surface: Color(0xFFFFFFFF),
      onSurface: Color(0xFF1B1C1C),
      onSurfaceVariant: Color(0xFF444653),
      outline: Color(0xFF747684),
      outlineVariant: Color(0xFFC4C5D5),
      gradientStart: Color(0xFF00164E),
      gradientMiddle: Color(0xFF002068),
      gradientEnd: Color(0xFF003399),
      gradientSecondaryStart: Color(0xFF745B00),
      gradientSecondaryMiddle: Color(0xFFB48A00),
      gradientSecondaryEnd: Color(0xFFFDD355),
    );
  }

  /// Parse from API JSON response
  factory MobileThemeColors.fromJson(Map<String, dynamic> json) {
    return MobileThemeColors(
      primary: _hexToColor(json['mobile_color_primary'] ?? '#002068'),
      primaryContainer: _hexToColor(json['mobile_color_primary_container'] ?? '#003399'),
      secondary: _hexToColor(json['mobile_color_secondary'] ?? '#745B00'),
      secondaryContainer: _hexToColor(json['mobile_color_secondary_container'] ?? '#FDD355'),
      background: _hexToColor(json['mobile_color_background'] ?? '#FBF9F8'),
      surface: _hexToColor(json['mobile_color_surface'] ?? '#FFFFFF'),
      onSurface: _hexToColor(json['mobile_color_on_surface'] ?? '#1B1C1C'),
      onSurfaceVariant: _hexToColor(json['mobile_color_on_surface_variant'] ?? '#444653'),
      outline: _hexToColor(json['mobile_color_outline'] ?? '#747684'),
      outlineVariant: _hexToColor(json['mobile_color_outline_variant'] ?? '#C4C5D5'),
      gradientStart: _hexToColor(json['mobile_gradient_start'] ?? '#00164E'),
      gradientMiddle: _hexToColor(json['mobile_gradient_middle'] ?? '#002068'),
      gradientEnd: _hexToColor(json['mobile_gradient_end'] ?? '#003399'),
      gradientSecondaryStart: _hexToColor(json['mobile_gradient_secondary_start'] ?? '#745B00'),
      gradientSecondaryMiddle: _hexToColor(json['mobile_gradient_secondary_middle'] ?? '#B48A00'),
      gradientSecondaryEnd: _hexToColor(json['mobile_gradient_secondary_end'] ?? '#FDD355'),
      logoUrl: json['mobile_logo_url'] as String?,
      splashLogoUrl: json['mobile_splash_logo_url'] as String?,
    );
  }

  /// Convert back to JSON
  Map<String, dynamic> toJson() {
    return {
      'mobile_color_primary': _colorToHex(primary),
      'mobile_color_primary_container': _colorToHex(primaryContainer),
      'mobile_color_secondary': _colorToHex(secondary),
      'mobile_color_secondary_container': _colorToHex(secondaryContainer),
      'mobile_color_background': _colorToHex(background),
      'mobile_color_surface': _colorToHex(surface),
      'mobile_color_on_surface': _colorToHex(onSurface),
      'mobile_color_on_surface_variant': _colorToHex(onSurfaceVariant),
      'mobile_color_outline': _colorToHex(outline),
      'mobile_color_outline_variant': _colorToHex(outlineVariant),
      'mobile_gradient_start': _colorToHex(gradientStart),
      'mobile_gradient_middle': _colorToHex(gradientMiddle),
      'mobile_gradient_end': _colorToHex(gradientEnd),
      'mobile_gradient_secondary_start': _colorToHex(gradientSecondaryStart),
      'mobile_gradient_secondary_middle': _colorToHex(gradientSecondaryMiddle),
      'mobile_gradient_secondary_end': _colorToHex(gradientSecondaryEnd),
      'mobile_logo_url': logoUrl,
      'mobile_splash_logo_url': splashLogoUrl,
    };
  }

  /// Get primary gradient list
  List<Color> get primaryGradient => [
    gradientStart,
    gradientMiddle,
    gradientEnd,
  ];

  /// Get secondary gradient list
  List<Color> get secondaryGradient => [
    gradientSecondaryStart,
    gradientSecondaryMiddle,
    gradientSecondaryEnd,
  ];

  /// Semantic Colors (consistent naming)
  Color get success => const Color(0xFF10B981);
  Color get successContainer => const Color(0xFFD1FAE5);
  Color get onSuccess => const Color(0xFFFFFFFF);
  Color get onSuccessContainer => const Color(0xFF064E3B);

  Color get warning => const Color(0xFFF59E0B);
  Color get warningContainer => const Color(0xFFFEF3C7);
  Color get onWarning => const Color(0xFFFFFFFF);
  Color get onWarningContainer => const Color(0xFF92400E);

  Color get error => const Color(0xFFEF4444);
  Color get errorContainer => const Color(0xFFFEE2E2);
  Color get onError => const Color(0xFFFFFFFF);
  Color get onErrorContainer => const Color(0xFF991B1B);

  Color get info => const Color(0xFF3B82F6);
  Color get infoContainer => const Color(0xFFDBEAFE);
  Color get onInfo => const Color(0xFFFFFFFF);
  Color get onInfoContainer => const Color(0xFF1E40AF);

  Color get danger => const Color(0xFFEF4444);
  Color get dangerContainer => const Color(0xFFFEE2E2);
  Color get onDanger => const Color(0xFFFFFFFF);
  Color get onDangerContainer => const Color(0xFF991B1B);

  /// Tertiary Colors
  Color get tertiary => const Color(0xFF002E14);
  Color get tertiaryContainer => const Color(0xFF004721);
  Color get onTertiaryContainer => const Color(0xFF3DBE6E);

  // Helper: Parse hex string to Color
  static Color _hexToColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 3) {
      hex = '${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}';
    }
    if (hex.length != 6) {
      return const Color(0xFF002068); // Default fallback
    }
    return Color(int.parse('FF$hex', radix: 16));
  }

  // Helper: Convert Color to hex string
  static String _colorToHex(Color color) {
    return '#${color.toARGB32().toRadixString(16).substring(2).toUpperCase()}';
  }

  /// Copy with new values
  MobileThemeColors copyWith({
    Color? primary,
    Color? primaryContainer,
    Color? secondary,
    Color? secondaryContainer,
    Color? background,
    Color? surface,
    Color? onSurface,
    Color? onSurfaceVariant,
    Color? outline,
    Color? outlineVariant,
    Color? gradientStart,
    Color? gradientMiddle,
    Color? gradientEnd,
    Color? gradientSecondaryStart,
    Color? gradientSecondaryMiddle,
    Color? gradientSecondaryEnd,
    String? logoUrl,
    String? splashLogoUrl,
  }) {
    return MobileThemeColors(
      primary: primary ?? this.primary,
      primaryContainer: primaryContainer ?? this.primaryContainer,
      secondary: secondary ?? this.secondary,
      secondaryContainer: secondaryContainer ?? this.secondaryContainer,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      onSurface: onSurface ?? this.onSurface,
      onSurfaceVariant: onSurfaceVariant ?? this.onSurfaceVariant,
      outline: outline ?? this.outline,
      outlineVariant: outlineVariant ?? this.outlineVariant,
      gradientStart: gradientStart ?? this.gradientStart,
      gradientMiddle: gradientMiddle ?? this.gradientMiddle,
      gradientEnd: gradientEnd ?? this.gradientEnd,
      gradientSecondaryStart: gradientSecondaryStart ?? this.gradientSecondaryStart,
      gradientSecondaryMiddle: gradientSecondaryMiddle ?? this.gradientSecondaryMiddle,
      gradientSecondaryEnd: gradientSecondaryEnd ?? this.gradientSecondaryEnd,
      logoUrl: logoUrl ?? this.logoUrl,
      splashLogoUrl: splashLogoUrl ?? this.splashLogoUrl,
    );
  }
}
