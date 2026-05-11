enum UserRole { student, ormawa, psychologist, guest }

class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserRole _currentRole = UserRole.guest;
  UserRole get currentRole => _currentRole;

  Future<bool> login(String username, String password) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    final normalizedUsername = username.toLowerCase().trim();

    if (normalizedUsername.isEmpty) return false;

    // Logic penentuan role (Professional rule)
    if (normalizedUsername.contains('bem') ||
        normalizedUsername.contains('hima') ||
        normalizedUsername.contains('ormawa')) {
      _currentRole = UserRole.ormawa;
      return true;
    } else if (normalizedUsername.contains('psikolog')) {
      _currentRole = UserRole.psychologist;
      return true;
    } else if (RegExp(r'^\d+$').hasMatch(normalizedUsername)) {
      // NIM biasanya angka semua
      _currentRole = UserRole.student;
      return true;
    }

    // Default to student if it looks like a valid username but doesn't match above
    _currentRole = UserRole.student;
    return true;
  }

  void logout() {
    _currentRole = UserRole.guest;
  }
}
