import 'dart:developer';
import 'package:bkuhub_mobile/core/network/api_client.dart';
import 'package:dio/dio.dart';

class NotificationItem {
  final String id;
  final String title;
  final String content;
  final String type; // beasiswa, kencana, info, dll
  final bool isRead;
  final DateTime createdAt;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: (json['id'] ?? json['ID'] ?? '').toString(),
      title: json['judul']?.toString() ?? json['title']?.toString() ?? 'Notifikasi',
      content: json['konten']?.toString() ?? json['content']?.toString() ?? '',
      type: json['tipe']?.toString() ?? json['type']?.toString() ?? 'info',
      isRead: json['is_read'] == true || json['IsRead'] == true,
      createdAt: DateTime.tryParse(
            json['created_at']?.toString() ?? json['CreatedAt']?.toString() ?? '',
          ) ??
          DateTime.now(),
    );
  }

  NotificationItem copyWith({bool? isRead}) {
    return NotificationItem(
      id: id,
      title: title,
      content: content,
      type: type,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final ApiClient _apiClient = ApiClient();

  /// Ambil semua notifikasi dengan optional filter tipe
  Future<List<NotificationItem>> getNotifications({String? tipe}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (tipe != null && tipe != 'Semua') {
        queryParams['tipe'] = tipe.toLowerCase();
      }
      final response = await _apiClient.client.get(
        '/notifikasi/',
        queryParameters: queryParams,
      );
      final List data = response.data['data'] ?? [];
      return data.map((json) => NotificationItem.fromJson(json)).toList();
    } catch (e) {
      log('Error getting notifications: $e');
      return [];
    }
  }

  /// Ambil jumlah notifikasi yang belum dibaca
  Future<int> getUnreadCount() async {
    try {
      final response = await _apiClient.client.get('/notifikasi/unread-count');
      return (response.data['count'] ?? 0) as int;
    } catch (e) {
      log('Error getting unread count: $e');
      return 0;
    }
  }

  /// Tandai satu notifikasi sebagai sudah dibaca
  Future<bool> markAsRead(String id) async {
    try {
      await _apiClient.client.put('/notifikasi/$id/baca');
      return true;
    } catch (e) {
      log('Error marking notification as read: $e');
      return false;
    }
  }

  /// Tandai semua notifikasi sebagai sudah dibaca
  Future<bool> markAllAsRead() async {
    try {
      await _apiClient.client.put('/notifikasi/baca-semua');
      return true;
    } catch (e) {
      log('Error marking all as read: $e');
      return false;
    }
  }

  /// Hapus satu notifikasi
  Future<bool> deleteNotification(String id) async {
    try {
      await _apiClient.client.delete('/notifikasi/$id');
      return true;
    } catch (e) {
      log('Error deleting notification: $e');
      return false;
    }
  }

  /// Hapus semua notifikasi yang sudah dibaca
  Future<bool> deleteReadNotifications() async {
    try {
      await _apiClient.client.delete('/notifikasi/hapus-dibaca');
      return true;
    } catch (e) {
      log('Error deleting read notifications: $e');
      return false;
    }
  }

  /// Hapus beberapa notifikasi sekaligus (bulk)
  Future<bool> deleteBulk(List<String> ids) async {
    try {
      await _apiClient.client.delete(
        '/notifikasi/hapus-bulk',
        data: {'ids': ids},
        options: Options(headers: {'Content-Type': 'application/json'}),
      );
      return true;
    } catch (e) {
      log('Error deleting bulk notifications: $e');
      return false;
    }
  }
}
