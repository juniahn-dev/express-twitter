const db = require('./../db');

const loginCheck = (request, response, next) => {
  let { user_id } = request.session;

  if (!user_id) {
    response.redirect('auth/login');
    return false;
  }

  next();
};

const userStateCheck = (request, response, next) => {
  let { user_id } = request.session;

  db.checkUser(user_id, (state) => {
    if (state === 'SLEEP') {
      return response.redirect('detail');
    }
    next();
  });
};

module.exports = {
  loginCheck,
  userStateCheck
}
