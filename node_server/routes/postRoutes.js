const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/postController');

const router = express.Router();

// 게시판 글 생성 라우트
router.post('/create', [
  body('title').notEmpty().withMessage('제목을 입력해 주세요.'),
  body('content').notEmpty().withMessage('내용을 입력해 주세요.'),
  body('author').notEmpty().withMessage('작성자를 입력해 주세요.')
], postController.createPost);

// 게시판 글 목록 가져오기 라우트
router.get('/all', postController.getPosts);

module.exports = router;
