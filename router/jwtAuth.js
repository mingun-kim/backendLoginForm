const jwt = require("jsonwebtoken");
let jwtAuth = true;

try {
    jwt.verify(req.cookies.accountToken, "stanleyParable");
} catch(err) {
    jwtAuth = false;
}

module.exports = jwtAuth;