require('dotenv').config();
const socket = io(process.env.SERVER_URL);

let isLoggedIn = false;

// 로그인 함수
function loginUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        isLoggedIn = true;
        socket.emit('login', { userId: data.userId, username });
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
      } else {
        alert('로그인에 실패했습니다.');
      }
    })
    .catch((error) => {
      console.error('로그인 중 오류 발생:', error);
    });
}

// 회원가입 함수
function registerUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('회원가입이 완료되었습니다. 로그인 해 주세요.');
    } else {
      alert('회원가입에 실패했습니다.');
    }
  })
  .catch((error) => {
    console.error('회원가입 중 오류 발생:', error);
  });
}

// 메시지 전송 함수
function sendMessage() {
  if (!isLoggedIn) {
    alert('로그인 후 메시지를 전송할 수 있습니다.');
    return;
  }

  const input = document.getElementById('chat-input');
  const message = input.value;

  socket.emit('message', { userId, username, message });
  input.value = '';
}

// 메시지 수신 시 화면에 표시
socket.on('message', function({ username, message }) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = `${username}: ${message}`;
  messagesDiv.appendChild(messageElement);
});

// 기존 채팅 기록 수신 시 화면에 표시
socket.on('chat history', function(messages) {
  const messagesDiv = document.getElementById('messages');
  messages.forEach(({ username, message }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messagesDiv.appendChild(messageElement);
  });
});