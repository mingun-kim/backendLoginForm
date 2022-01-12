const express = require("express"); //express 모듈 import

const router = express.Router(); //api 담당 클래스

const path = require("path");
const logModule = require("./logModule");
const reqIp = require("request-ip");

//API
router.get("", (req, res) => {//req: 사용자가 보내는 res:사용자가 받는
    res.sendFile(path.join(__dirname, "../index.html"));
    logModule("indexPage/get", reqIp.getClientIp(req), {}, {});

});

router.get("/main", (req, res) => {
    if (req.cookies.accountSeq == req.sessionID) {
        res.sendFile(path.join(__dirname, "../main.html"));
    } else {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("mainPage/get", reqIp.getClientIp(req), {}, {});

})

router.get("/signUp", (req, res) => {//req: 사용자가 보내는 res:사용자가 받는
    res.sendFile(path.join(__dirname, "../signUp.html"));
    logModule("signUpPage/get", reqIp.getClientIp(req), {}, {});

});

router.get("/editInfo", (req, res) => {
    if (req.cookies.accountSeq == req.sessionID) {
        res.sendFile(path.join(__dirname, "../editInfo.html"));
    } else {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("editInfoPage/get", reqIp.getClientIp(req), {}, {});
})

router.get("/changePw", (req, res) => {
    if (req.cookies.accountSeq == req.sessionID) {
        res.sendFile(path.join(__dirname, "../changePw.html"));
    } else {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("changePwPage/get", reqIp.getClientIp(req), {}, {});
})

module.exports = router; //모듈로써 export