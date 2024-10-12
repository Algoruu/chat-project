import 'dart:convert';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter/material.dart';

class ChatService extends ChangeNotifier {
  final WebSocketChannel channel = IOWebSocketChannel.connect('ws://10.0.2.2:3000');
  List<String> messages = [];

  ChatService() {
    // 기존 채팅 기록 수신 시 처리
    channel.stream.listen((data) {
      try {
        final decodedData = jsonDecode(data);
        if (decodedData is List) {
          // 채팅 기록 처리
          for (var messageData in decodedData) {
            messages.add('${messageData['username'] ?? 'null'}: ${messageData['message']}');
          }
        } else if (decodedData is Map) {
          // 새로운 메시지 처리
          messages.add('${decodedData['username'] ?? 'null'}: ${decodedData['message']}');
        }
        notifyListeners();
      } catch (e) {
        print('메시지 수신 중 오류 발생: $e');
      }
    });
  }

  void sendMessage(String username, String message) {
    if (message.isNotEmpty) {
      try {
        channel.sink.add(jsonEncode({'username': username, 'message': message}));
        print('메시지 전송 성공: $message');
      } catch (e) {
        print('메시지 전송 중 오류 발생: $e');
      }
    } else {
      print('메시지가 비어 있습니다.');
    }
  }

  void dispose() {
    channel.sink.close();
    super.dispose();
  }
}
