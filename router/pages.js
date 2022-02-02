const express = require("express"); //express 모듈 import

const router = express.Router(); //api 담당 클래스

const path = require("path");
const logModule = require("./logModule");
const reqIp = require("request-ip");
const jwt = require("jsonwebtoken");

const redis = require("redis").createClient();
const keys = require("./.keys");

//API
router.get("", (req, res) => {//req: 사용자가 보내는 res:사용자가 받는
    res.sendFile(path.join(__dirname, "../index.html"));
    logModule("indexPage/get", reqIp.getClientIp(req), {}, {});

});

router.get("/main", async(req, res) => {
    try {
        req.decoded = jwt.verify(req.cookies.accountToken, "stanleyParable");//decoded안 내부적 기능실행

        try {
            redis.connect();
        } catch(err) {
            console.log(err);
        }
    
        let date = new Date().getDate();
    
        if (await redis.get(keys.redis.date) == date) {
            if (await redis.exists(keys.redis.visits)) {
                await redis.set(keys.redis.visits, Number(await redis.get(keys.redis.visits)) + 1);
                console.log(await redis.get(keys.redis.visits))
            } else {
                await redis.set(keys.redis.visits, 1);
            }
        } else {
            await redis.set(keys.redis.date, date);
            await redis.set(keys.redis.visits, 1);
        }

        // await redis.zadd("recent", new Date().getTime(), req.decoded.id);

        await redis.disconnect();
    
        res.sendFile(path.join(__dirname, "../main.html"));//여기서 파일과 함께 방문자 수를 어떻게 보냄?
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