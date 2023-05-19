const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: 3306,
    database: 'Twitter'
});

connection.connect();

// page: 트윗 리스트
// - 트윗 전체 리스트 노출
function getAllTweets(user_id, callback) {
  const sql = `SELECT DISTINCT p.id, p.user_id, p.content, p.create_at, l.is_like, r.is_retweet
  FROM POST AS p
  LEFT JOIN LIKE_ACTIVE AS l
  ON l.user_id = ?
  AND p.id = l.post_id
  LEFT JOIN RETWEET_ACTIVE AS r
  ON r.user_id = ?
  AND p.id = r.post_id
  LEFT JOIN FOLLOW AS f
  ON f.following_id = ?
  WHERE f.follower_id = p.user_id
  OR p.user_id = ?
  ORDER BY p.create_at DESC;`;
  const params = [user_id, user_id, user_id, user_id];

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback(rows);
  });
}
// - 트윗 좋아요
function likeTweet(user_id, post_id, like, callback) {
  const isLike = like === '1' ? '0' : '1';
  const sql = "UPDATE LIKE_ACTIVE SET is_like = ? WHERE user_id = ? AND post_id = ?";
  const params = [isLike, user_id, post_id];

  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  })
}
// - 트윗 좋아요가 테이블에 없을 시
function makeLikeTweet(user_id, post_id, callback) {
  const sql = 'INSERT INTO LIKE_ACTIVE (user_id, post_id, is_like) VALUES (?, ?, 1)';
  const params = [user_id, post_id];


  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  })
}
// - 트윗 리트윗
function retweetTweet(user_id, post_id, retweet, callback) {
  const isRetweet = retweet === '1' ? '0' : '1';
  const sql = "UPDATE RETWEET_ACTIVE SET is_retweet = ? WHERE user_id = ? AND post_id = ?";
  const params = [isRetweet, user_id, post_id];

  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  })
}
// - 트윗 리트윗이 테이블에 없을 시
function makeRetweetTweet(user_id, post_id, callback) {
  const sql = 'INSERT INTO RETWEET_ACTIVE (user_id, post_id, is_retweet) VALUES (?, ?, 1)';
  const params = [user_id, post_id];


  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  })
}
// - 트윗 만들기
function makeTweet(user_id, content, callback) {
  const sql = 'INSERT INTO POST (user_id, content) VALUES (?, ?)';
  const params = [user_id, content];

  connection.query(sql, params, (err) => {
      if (err) {
        console.log('error content is: ', err);
        return;
      }

      callback();
  });
}
// - 트윗 지우기
function deleteTweet(user_id, post_id, callback) {
  const sql = 'DELETE FROM POST WHERE id = ? AND user_id = ?';
  const params = [post_id, user_id];

  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  })
}

// page: 로그인
// - 로그인 확인
function getLogin(email, password, callback) {
  const emailSql = 'SELECT id, password, state FROM USER WHERE email = ?';
  const emailParams = [email];

  connection.query(emailSql, emailParams, (err, rows) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    if (rows.length) {
      if (rows[0].password === password) {
        callback({
          state: '',
          value: rows[0].id,
          user_state: rows[0].state
        });
      } else {
        callback({
          state: 'Not Match Password',
          value: undefined,
          user_state: undefined
        });
      }
    } else {
      callback({
        state: 'Is Empty Id',
        value: undefined,
        user_state: undefined
      });
    }
  });
}

// page: 회원 가입
// - 회원 가입
function signUpAccount(email, password, name, callback) {
  const sql = 'INSERT INTO USER (email, password, name) VALUES (?, ?, ?)';
  const params = [email, password, name];

  connection.query(sql, params, (err) => {
      if (err) {
        console.log('error content is: ', err);
        return;
      }

      callback();
  });
}

// page: 개인 회원
// - 팔로워, 팔로잉 확인
function getAllFollow(user_id, callback) {
  const sql = `SELECT count(case when f.following_id = ? then 1 end) AS following, count(case when f.follower_id = ? then 1 end) AS follower
  FROM FOLLOW AS f;`;
  const params = [user_id, user_id];

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    if (rows.length) {
      callback(rows[0]);
      return;
    }
  });
}

// page: 회원정보 수정
// - 휴면회원 ACTIVE로 변경
function updateActive(user_id, callback) {
  const sql = "UPDATE USER SET state = 'ACTIVE' WHERE id = ?";
  const params = [user_id];

  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  });
}
// - 회원정보 리스트 노출
function getAllUser(user_id, callback) {
  const sql = "SELECT name FROM USER WHERE id = ?";
  const params = [user_id];

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    if (rows.length) {
      callback(rows[0]);
      return;
    }
  });
}
// - 회원정보 수정 (name)
function updateName(user_id, name, callback) {
  const sql = "UPDATE USER SET name = ? WHERE id = ?";
  const params = [name, user_id];

  connection.query(sql, params, (err) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    callback();
  });
}
// - 회원정보 탈퇴

// middleward
// login check
function checkUser(user_id, callback) {
  const sql = 'SELECT state FROM USER WHERE id = ?'
  const params = [user_id];

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.log('error content is: ', err);
      return;
    }

    if (rows.length) {
      callback(rows[0].state);
      return;
    }

    callback();
  });
}

module.exports = {
  getAllTweets,
  makeTweet,
  deleteTweet,
  getLogin,
  signUpAccount,
  updateActive,
  checkUser,
  likeTweet,
  makeLikeTweet,
  retweetTweet,
  makeRetweetTweet,
  getAllFollow,
  getAllUser,
  updateName
}
