const mongoose = require("mongoose");
const userDocument = require("../schema/userSchema");

const logModule = (apiValue, ipValue, inputData, outputData) => {
    mongoose.connect("mongodb+srv://ubuntu:1234@backendcluster.2zu3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
    .then(() => {
        const user = new userDocument({
            api: apiValue,
            time: Date(),
            ip: ipValue,
            input: inputData,
            output: outputData
        })
        user.save((err, res) => {
            if (err) {
                console.log("data insert error");
            } else {
                console.log("data insert success");
            }
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

module.exports = logModule;