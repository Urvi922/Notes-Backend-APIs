const retRresp = require('../Utils/Response');

module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        retRresp(res, 401, 'User not authenticated!');
    }
    next();
}