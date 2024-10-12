const socket = io('http://localhost:3000');

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
      alert('로그인 성공');
      // 로그인 성공 시 소켓에 사용자 ID 전송
      socket.emit('login', data.userId);
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

// 채팅 메시지 전송 함수
function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value;

  if (message.trim() === "") {
    alert("메시지를 입력하세요.");
    return;
  }

  socket.emit('chat message', message);
  input.value = '';
}

// 메시지 수신 시 화면에 표시
socket.on('chat message', function(msg) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = msg;
  messagesDiv.appendChild(messageElement);
});