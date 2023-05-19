const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const { loginCheck, userStateCheck } = require('../middleware/auth');

const db = require('./../db');

router.get('/', loginCheck, userStateCheck, function(request, response, next) {
  const { user_id } = request.session;

  db.getAllTweets(user_id, (rows) => {
    response.render('list', { rows, user_id });
    return false;
  });
});

router.post('/make_tweet', [check('content').isByteLength({ min: 1, max: 250 })], function(request, response, next) {
  const { user_id } = request.session;

  const errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/list');
    return;
  } else {
    const post = request.body;
    const content = post.content;

    db.makeTweet(user_id, content, () => {
      response.redirect('/list');
    });
  }
});

router.post('/delete_tweet', function(request, response, next) {
  const { user_id } = request.session;

  let errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/list');
    return;
  } else {
    const post = request.body;
    const id = post.id;

    db.deleteTweet(user_id, id, () => {
      response.redirect('/list');
    });
  }
});

router.post('/like_tweet', function(request, response, next) {
  const { user_id } = request.session;

  let errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/list');
    return;
  } else {
    const post = request.body;
    const id = post.id;
    const like = post.like;

    if (like === '') {
      db.makeLikeTweet(user_id, id, () => {
        response.redirect('/list');
      });
      return;
    }

    db.likeTweet(user_id, id, like, () => {
      response.redirect('/list');
    });
  }
});

router.post('/retweet_tweet', function(request, response, next) {
  const { user_id } = request.session;

  let errs = validationResult(request);

  if (errs['errors'].length > 0) {
    response.redirect('/list');
    return;
  } else {
    const post = request.body;
    const id = post.id;
    const retweet = post.retweet;

    if (retweet === '') {
      db.makeRetweetTweet(user_id, id, () => {
        response.redirect('/list');
      });
      return;
    }

    db.retweetTweet(user_id, id, retweet, () => {
      response.redirect('/list');
    });
  }
});

module.exports = router;
