const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { validationResult } = require('express-validator');

const db = require('./../db');

router.get('/login', function(request, response) {
  response.render('login');
});

router.get('/logout', function(request, response) {
  request.session.destroy((err) => {
    if (err) {
      console.log(err);
      return;
    }

    response.redirect('/auth/login');
  });
});

router.post('/login_process', function(request, response) {
  const errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/login');
    return;
  } else {
    const post = request.body;
    const email = post.email;
    const password = post.password;

    const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

    db.getLogin(email, hashPassword, (data) => {
      const state = data.state;
      const id = data.value;
      const user_state = data.user_state;

      request.session.user_id = id;
      request.session.save(function () {
        if (user_state === 'SLEEP') {
          response.redirect('/detail');
          return false;
        }

        if (id) {
          response.redirect('/list');
          return false;
        }

        response.render('login', { state });
      });
    });
  }
});

router.get('/join', function(request, response) {
  response.render('join');
});

router.post('/sign_up_account', function(request, response) {
  const errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/auth/join');
    return;
  } else {
    const post = request.body;
    const email = post.email;
    const password = post.password;
    const name = post.name;

    const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

    db.signUpAccount(email, hashPassword, name, () => {
      response.redirect('/auth/login');
    });
  }
});

router.get('/update_active', function(request, response) {
  let { user_id } = request.session;

  db.updateActive(user_id, () => {
    response.redirect('/detail');
  });
});

router.post('/edit_name', function(request, response) {
  let { user_id } = request.session;

  const errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/auth/join');
    return;
  } else {
    const post = request.body;
    const name = post.name;


    db.updateName(user_id, name, () => {
      response.redirect('/detail');
    });
  }
});

module.exports = router;
