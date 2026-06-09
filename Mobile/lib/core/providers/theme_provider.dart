import 'package:flutter/material.dart';
import '../repositories/theme_repository.dart';
import '../theme/mobile_theme.dart';

/// ThemeProvider - Provides theme state to the entire app
///
/// Uses Provider pattern to make theme colors available throughout the app.
/// Theme is fetched from API and cached for performance.
class ThemeProvider extends ChangeNotifier {
  final ThemeRepository _repository;

  MobileThemeColors _colors = MobileThemeColors.defaults();
  bool _isLoading = true;
  String? _error;
  bool _initialized = false;

  ThemeProvider({ThemeRepository? repository})
      : _repository = repository ?? ThemeRepository();

  /// Current theme colors
  MobileThemeColors get colors => _colors;

  /// Whether theme is currently loading
  bool get isLoading => _isLoading;

  /// Whether an error occurred
  bool get hasError => _error != null;

  /// Error message if any
  String? get errorMessage => _error;

  /// Whether theme has been initialized
  bool get isInitialized => _initialized;

  /// Convenience getters for common colors
  Color get primary => _colors.primary;
  Color get primaryContainer => _colors.primaryContainer;
  Color get secondary => _colors.secondary;
  Color get secondaryContainer => _colors.secondaryContainer;
  Color get background => _colors.background;
  Color get surface => _colors.surface;
  Color get onSurface => _colors.onSurface;
  Color get onSurfaceVariant => _colors.onSurfaceVariant;
  Color get outline => _colors.outline;
  Color get outlineVariant => _colors.outlineVariant;

  /// Primary gradient colors
  List<Color> get primaryGradient => _colors.primaryGradient;

  /// Secondary gradient colors
  List<Color> get secondaryGradient => _colors.secondaryGradient;

  /// Semantic colors
  Color get success => _colors.success;
  Color get successContainer => _colors.successContainer;
  Color get warning => _colors.warning;
  Color get warningContainer => _colors.warningContainer;
  Color get colorError => _colors.error;  // Renamed to avoid conflict with errorMessage
  Color get errorContainer => _colors.errorContainer;
  Color get info => _colors.info;
  Color get infoContainer => _colors.infoContainer;
  Color get danger => _colors.danger;
  Color get dangerContainer => _colors.dangerContainer;

  /// Tertiary colors
  Color get tertiary => _colors.tertiary;
  Color get tertiaryContainer => _colors.tertiaryContainer;
  Color get onTertiaryContainer => _colors.onTertiaryContainer;

  /// Initialize and load theme
  Future<void> loadTheme() async {
    if (_initialized) return; // Don't reload if already initialized

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _colors = await _repository.getTheme();
      _error = null;
    } catch (e) {
      _error = e.toString();
      // Keep default colors on error
    } finally {
      _isLoading = false;
      _initialized = true;
      notifyListeners();
    }
  }

  /// Force refresh theme from API
  Future<void> refreshTheme() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _repository.clearCache();
      _colors = await _repository.getTheme();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear cached theme and reset to defaults
  Future<void> resetTheme() async {
    await _repository.clearCache();
    _colors = MobileThemeColors.defaults();
    notifyListeners();
  }

  /// Get a specific color by key (for dynamic access)
  Color getColorByKey(String key) {
    switch (key) {
      case 'primary':
        return primary;
      case 'primaryContainer':
        return primaryContainer;
      case 'secondary':
        return secondary;
      case 'secondaryContainer':
        return secondaryContainer;
      case 'background':
        return background;
      case 'surface':
        return surface;
      case 'onSurface':
        return onSurface;
      case 'onSurfaceVariant':
        return onSurfaceVariant;
      case 'outline':
        return outline;
      case 'outlineVariant':
        return outlineVariant;
      case 'success':
        return success;
      case 'warning':
        return warning;
      case 'error':
        return colorError;
      case 'info':
        return info;
      case 'danger':
        return danger;
      default:
        return primary;
    }
  }

  /// Get gradient by type
  List<Color> getGradient(String type) {
    switch (type) {
      case 'primary':
        return primaryGradient;
      case 'secondary':
        return secondaryGradient;
      default:
        return primaryGradient;
    }
  }
}
