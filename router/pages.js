const express = require("express"); //express 모듈 import

const router = express.Router(); //api 담당 클래스

const path = require("path");
const logModule = require("./logModule");
const reqIp = require("request-ip");
const jwt = require("jsonwebtoken");

//API
router.get("", (req, res) => {//req: 사용자가 보내는 res:사용자가 받는
    res.sendFile(path.join(__dirname, "../index.html"));
    logModule("indexPage/get", reqIp.getClientIp(req), {}, {});

});

router.get("/main", (req, res) => {
    try {
        req.decoded = jwt.verify(req.cookies.accountToken, "stanleyParable");//decoded안 내부적 기능실행
        // console.log(req.decoded);
        res.sendFile(path.join(__dirname, "../main.html"));
    }catch(err) {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("mainPage/get", reqIp.getClientIp(req), {}, {});

})

router.get("/signUp", (req, res) => {//req: 사용자가 보내는 res:사용자가 받는
    res.sendFile(path.join(__dirname, "../signUp.html"));
    logModule("signUpPage/get", reqIp.getClientIp(req), {}, {});

});

router.get("/editInfo", (req, res) => {
    try {
        req.decoded = jwt.verify(req.cookies.accountToken, "stanleyParable");//decoded안 내부적 기능실행
        // console.log(req.decoded);
        res.sendFile(path.join(__dirname, "../editInfo.html"));
    }catch(err) {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("editInfoPage/get", reqIp.getClientIp(req), {}, {});
})

router.get("/changePw", (req, res) => {
    try {
        req.decoded = jwt.verify(req.cookies.accountToken, "stanleyParable");//decoded안 내부적 기능실행
        // console.log(req.decoded);
        res.sendFile(path.join(__dirname, "../changePw.html"));
    }catch(err) {
        res.sendFile(path.join(__dirname, "../index.html"));
    }
    logModule("changePwPage/get", reqIp.getClientIp(req), {}, {});
})

module.exports = router; //모듈로써 export