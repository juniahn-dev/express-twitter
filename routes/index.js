const express = require('express');

const router = express.Router();

router.get('/', function(request, response, next) {
  let { user_id } = request.session;

  if (user_id) {
    response.redirect('list');
    return;
  }

  response.redirect('/auth/login');
});

module.exports = router;
