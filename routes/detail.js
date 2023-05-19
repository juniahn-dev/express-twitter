const express = require('express');
const router = express.Router();

const { loginCheck } = require('../middleware/auth');

const db = require('./../db');

router.get('/', loginCheck, (request, response) => {
  const { user_id } = request.session;

  db.checkUser(user_id, (state) => {
    db.getAllFollow(user_id, (follow) => {
      db.getAllUser(user_id, (user_info) => {
        response.render('detail', { user_state: state, follow, user_info });
      });
    });
  });

  return;
});

module.exports = router;
