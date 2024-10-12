const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// 회원가입 라우트
router.post('/register', [
  body('username').notEmpty().withMessage('사용자명을 입력해 주세요.'),
  body('email').isEmail().withMessage('유효한 이메일을 입력해 주세요.'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자리여야 합니다.')
], authController.register);

// 로그인 라우트
router.post('/login', [
  body('username').notEmpty().withMessage('사용자명을 입력해 주세요.'),
  body('password').notEmpty().withMessage('비밀번호를 입력해 주세요.')
], authController.login);

// 비밀번호 재설정 이메일 발송 라우트
router.post('/password-reset', [
  body('email').isEmail().withMessage('유효한 이메일을 입력해 주세요.')
], authController.sendPasswordResetEmail);

module.exports = router;
