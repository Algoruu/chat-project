const express = require('express'); 
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(require('cookie-parser')());

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 실시간 채팅 구현
io.on('connection', (socket) => {
  console.log('사용자가 연결되었습니다.');

  // 로그인한 사용자의 ID를 소켓에 저장
  socket.on('login', ({ userId, username }) => {
    if (!userId || !username) {
      console.error('로그인 정보가 유효하지 않습니다.');
      return;
    }
    socket.userId = userId;
    socket.username = username;
    console.log('로그인한 사용자 ID:', userId);

    // 연결된 모든 사용자에게 현재 채팅 기록 전송
    const query = 'SELECT * FROM chat_messages';
    db.query(query, (err, results) => {
      if (err) {
        console.error('채팅 기록을 불러오는 중 오류 발생:', err);
      } else {
        socket.emit('chat history', results);
      }
    });
  });

  socket.on('message', ({ message }) => {
    if (!socket.userId || !socket.username) {
      console.error('로그인되지 않은 사용자가 메시지를 전송했습니다.');
      return;
    }
    if (!message) {
      console.error('메시지가 비어 있습니다.');
      return;
    }

    console.log('메시지:', message);
    // 메시지와 함께 사용자 ID와 이름을 전송
    io.emit('message', { userId: socket.userId, username: socket.username, message });

    // 메시지를 데이터베이스에 저장
    const query = 'INSERT INTO chat_messages (user_id, username, message) VALUES (?, ?, ?)';
    db.query(query, [socket.userId, socket.username, message], (err) => {
      if (err) {
        console.error('메시지를 저장하는 중 오류 발생:', err);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('사용자가 연결이 끊겼습니다.');
  });

  // 클라이언트에게 채팅 기록 전송
  const query = 'SELECT * FROM chat_messages';
  db.query(query, (err, results) => {
    if (err) {
      console.error('채팅 기록을 불러오는 중 오류 발생:', err);
    } else {
      socket.emit('chat history', results);
    }
  });
});

// 서버 시작
server.listen(process.env.PORT || 3000, () => {
  console.log(`서버가 ${process.env.PORT || 3000} 포트에서 실행 중입니다.`);
});