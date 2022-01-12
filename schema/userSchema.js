const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    api: "string",
    time: "Date",
    ip: "string",
    input: {},
    output: {}
});

const userDocument = mongoose.model("user", userSchema);

module.exports = userDocument;