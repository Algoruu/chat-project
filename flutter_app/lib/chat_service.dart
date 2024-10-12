import 'package:web_socket_channel/io.dart';
import 'package:flutter/material.dart';

class ChatService {
  final channel = IOWebSocketChannel.connect('ws://192.168.0.10:3000');
  final messageController = TextEditingController();

  void sendMessage() {
    if (messageController.text.isNotEmpty) {
      channel.sink.add(messageController.text);
      messageController.clear();
    } else {
      print('메시지를 입력하세요.');
    }
  }

  void dispose() {
    channel.sink.close();
  }
}
