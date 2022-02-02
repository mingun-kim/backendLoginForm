const express = require("express"); //express 모듈 import
const router = express.Router(); //api 담당 클래스
const logModule = require("./logModule");
const reqIp = require("request-ip");
const pgInit = require("../pgConn");

const jwt = require("jsonwebtoken");
// const fetch = require("node-fetch");
// const https = require("https");
// const httpsAgent = new https.Agent({
//     rejectUnauthorized: false,
//     keepAlive: true
// })
// const axios = require("axios");
// 환경변수로 node에서 허가되지 않은 인증TLS통신을 거부하지 않겠다고 설정
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pg = require("pg");
const client = pg.Client;

const jwtAuth = require("./jwtAuth");
const redis = require("redis").createClient();
const crudModule = require("./crudModule");
const keys = require("./.keys");

router.get("", async(req, res) => {
    if (jwtAuth(req.cookies.accountToken) == false) {
        res.send(false);
    }

    let outputData = {};

    if (req.cookies.accountToken != null) {
        let rsToken = jwt.verify(req.cookies.accountToken, keys.jwt);
        outputData = rsToken;
        res.send(rsToken);
    } else {
        outputData = await crudModule.get(req.session.accountSeq);
        outputData.accountId = req.session.accountId;
        await res.send(outputData);
    }
    logModule("account/get", reqIp.getClientIp(req), {}, outputData);
});

router.get("/id", async(req, res) => {
    let result = {
        success: false
    }
    let idValue = req.query.id;
    let inputValue = {
        id: idValue
    }

    result.success = await crudModule.getId(idValue);
    await logModule("account/get/id", reqIp.getClientIp(req), inputValue, result);
    await res.send(result);
});

router.get("/visits", async(req, res) => {
    let result = {
        visits: 0
    }

    try {
        redis.connect();
    } catch(err) {
        console.log(err);
    }

    result.visits = await redis.get(keys.redis.visits);
    await redis.disconnect();

    await res.send(result);
})

router.post("", async(req, res) => {
    let idValue = req.body.id;
    let pwValue = req.body.pw;
    let result = {
        success: false
    };

    let postRs = await crudModule.post(idValue, pwValue);

    result.success = await postRs.success;
    let sequence = await postRs.seq;
    let identify = await postRs.id;

    if (req.session) {
        req.session.accountSeq = await sequence;
        req.session.accountId = await identify;
        req.session.nowIp = reqIp.getClientIp(req);
    }

    console.log(await req.session);
    res.cookie("accountSeq", req.sessionID);

    let getRs = await crudModule.get(sequence);
    getRs.id = await identify;

    
    const jwtToken = jwt.sign(
        await getRs,
        keys.jwt, //private key 마음대로 지정
        {//형식 정해짐, 내용 맘대로
            expiresIn: "1d",
            issuer: "nidel"
        }
    );
    res.cookie("accountToken", await jwtToken);
    
    let inputData = {
        id: idValue,
        pw: pwValue
    }
    await logModule("account/post", reqIp.getClientIp(req), inputData, result);
    await res.send(result);
});

router.post("/signUp", async(req, res) => {
    let idValue = req.body.id;
    let pwValue = req.body.pw;
    let nameValue = req.body.name;
    let ageValue = req.body.age;
    let emailValue = req.body.email;
    let result = {
        login: false,
        info: false,
        success: false
    }

    if (idValue.length > 20 || pwValue.length > 20 || nameValue.length > 7 || ageValue.length > 3 || emailValue.length > 30) {
        console.log("ERROR invalid data insert");
        res.send(result);
    }

    result.success =  await crudModule.postSignUp(idValue, pwValue, nameValue, ageValue, emailValue);
    console.log("changed");

    let inputValue = {
        id: idValue,
        pw: pwValue,
        name: nameValue,
        age: ageValue,
        email: emailValue
    }
    await logModule("account/post/signUp", reqIp.getClientIp(req), inputValue, result);
    await res.send(result);
});

router.post("/attendance", async(req, res) => {
    let result = {
        success: false
    }

    try {
        redis.connect();
    } catch(err) {
        console.log(err);
    }

    let date = new Date().getDate();

    if (await redis.get(keys.redis.date) == date) {
        result.success = await redis.sendCommand(["sadd", keys.redis.attendance, req.session.accountId]);
        console.log(await redis.sendCommand(["smembers", keys.redis.attendance]));
    } else {
        await redis.set(keys.redis.date, date);
        await redis.srem(keys.redis.attendance, "*");
        //db update
    }
    await res.send(result);
    await redis.disconnect();
})

router.put("", async(req, res) => {
    let idValue = req.body.id;
    let nameValue = req.body.name;
    let ageValue = req.body.age;
    let emailValue = req.body.email;
    let result = {
        success: false
    }
    if (jwtAuth(req.cookies.accountToken) == false) {
        res.send(false);
    }
    
    if (idValue.length > 20 || nameValue.length > 7 || ageValue.length > 3 || emailValue.length > 30) {
        console.log("ERROR invalid data insert");
        res.send(result);
    }

    result.success = await crudModule.put(req.session.accountSeq, idValue, nameValue, ageValue, emailValue);

    let inputValue = {
        id: idValue,
        name: nameValue,
        age: ageValue,
        email: emailValue
    }
    await logModule("account/put", reqIp.getClientIp(req), inputValue, result);
    await res.send(result);
});

router.put("/password", async(req, res) => {
    let pastPw = req.body.pastPw;
    let changePw = req.body.changePw;
    let result = {
        "success": false
    };
    if (jwtAuth(req.cookies.accountToken) == false) {
        res.send(false);
    }

    result.success = await crudModule.putPw(req.session.accountSeq, changePw);

    let inputValue = {
        "pastPw": pastPw,
        "changePw": changePw
    }
    await logModule("account/put/password", reqIp.getClientIp(req), inputValue, result);
    await res.send(result);
});

router.delete("", async(req, res) => {
    let result = {
        success: false
    }
    if (jwtAuth(req.cookies.accountToken) == false) {
        res.send(result);
    }
    
    result.success = await crudModule.delete(req.session.accountSeq);

    let inputValue = {
        seq: req.session.accountSeq
    }
    await logModule("account/delete", reqIp.getClientIp(req), inputValue, result);
    await res.send(result);
});


module.exports = router;