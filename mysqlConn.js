const mysql = require("mysql");
const conn = {
    host: "localhost",
    port: "3306",
    user: "ubuntu",
    password: "1234",
    database: "6thDB"
};

const connection = mysql.createConnection(conn);

module.exports = connection;