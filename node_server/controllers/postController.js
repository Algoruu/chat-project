const db = require('../db');
const { StatusCodes } = require('http-status-codes');

exports.createPost = (req, res) => {
  const { title, content, author } = req.body;
  const query = 'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)';

  db.query(query, [title, content, author], (error, results) => {
    if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '데이터베이스 오류가 발생했습니다.' });
    }
    res.status(StatusCodes.CREATED).json({ success: true, postId: results.insertId });
  });
};

exports.getPosts = (req, res) => {
  const query = 'SELECT * FROM posts';

  db.query(query, (error, results) => {
    if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '데이터베이스 오류가 발생했습니다.' });
    }
    res.status(StatusCodes.OK).json(results);
  });
};
