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
  socket.on('login', (userId) => {
    socket.userId = userId;
    console.log('로그인한 사용자 ID:', userId);
  });

  socket.on('chat message', (msg) => {
    console.log('메시지:', msg);
    io.emit('chat message', msg);

    // 메시지를 데이터베이스에 저장
    const query = 'INSERT INTO chat_messages (user_id, message) VALUES (?, ?)';
    db.query(query, [socket.userId, msg], (err) => {
      if (err) {
        console.error('메시지를 저장하는 중 오류 발생:', err);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('사용자가 연결이 끊겼습니다.');
  });
});

// 서버 시작
server.listen(process.env.PORT || 3000, () => {
  console.log(`서버가 ${process.env.PORT || 3000} 포트에서 실행 중입니다.`);
});