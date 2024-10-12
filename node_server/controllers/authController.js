require('dotenv').config();
const db = require('../db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

exports.login = (req, res) => {
  const { username, password } = req.body;

  console.log('JWT_SECRET:', process.env.JWT_SECRET); // JWT_SECRET 값 출력 (디버깅)

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (error, results) => {
    if (error) {
      console.error('데이터베이스 오류:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '데이터베이스 오류가 발생했습니다.' });
    }

    if (results.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: '존재하지 않는 사용자입니다.' });
    }

    const user = results[0];

    try {
      // 비밀번호 비교
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
      }

      // 로그인 성공 - 토큰 발급
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET 값이 없습니다.');
      }
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(StatusCodes.OK).json({ success: true, token, userId: user.id }); // userId 추가
    } catch (err) {
      console.error('비밀번호 비교 중 오류:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '서버 오류가 발생했습니다.' });
    }
  });
};

exports.sendPasswordResetEmail = (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '비밀번호 재설정 안내',
    text: '비밀번호를 재설정하려면 이 링크를 클릭하세요.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '이메일을 보내는 중 오류가 발생했습니다.' });
    }
    res.status(StatusCodes.OK).json({ success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 데이터베이스에 추가
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (error, results) => {
      if (error) {
        console.error(error); // 발생한 오류를 콘솔에 출력하여 확인 (여기서 추가)
        
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(StatusCodes.CONFLICT).json({ error: '이미 존재하는 사용자명 또는 이메일입니다.' });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '데이터베이스 오류가 발생했습니다.' });
      }
      res.status(StatusCodes.CREATED).json({ success: true, message: '회원가입이 완료되었습니다.' });
    });
  } catch (err) {
    console.error(err); // try 블록에서 발생한 오류를 콘솔에 출력하여 확인 (여기서 추가)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '서버 오류가 발생했습니다.' });
  }
};