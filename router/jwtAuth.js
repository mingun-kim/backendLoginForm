const jwt = require("jsonwebtoken");
const jwtAuth = (cookie) => {
    try {
        jwt.verify(cookie, "stanleyParable");
        return true;
    } catch(err) {
        return false;
    }
}

module.exports = jwtAuth;