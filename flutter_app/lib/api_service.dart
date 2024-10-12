import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService extends ChangeNotifier {
  String? username;

  Future<void> loginUser(String username, String password) async {
    final url = Uri.parse('http://10.0.2.2:3000/api/auth/login');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      if (responseData['success']) {
        this.username = username;
        notifyListeners();
        print('로그인 성공, 토큰: ${responseData['token']}');
      } else {
        throw Exception('로그인 실패: ${responseData['message']}');
      }
    } else {
      throw Exception('서버 오류: ${response.statusCode}');
    }
  }

  Future<void> registerUser(String username, String email, String password) async {
    final url = Uri.parse('http://10.0.2.2:3000/api/auth/register');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({'username': username, 'email': email, 'password': password}),
    );

    if (response.statusCode == 201) {
      print('회원가입 성공');
    } else {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['error'] ?? '회원가입 실패');
    }
  }
}
