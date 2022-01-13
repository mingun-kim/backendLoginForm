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
const axios = require("axios");
// 환경변수로 node에서 허가되지 않은 인증TLS통신을 거부하지 않겠다고 설정
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pg = require("pg");
const client = pg.Client;

router.get("", (req, res) => {
    let outputData = null;
    const pgConn = new client(pgInit);
    
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })
    
    if (req.cookies.accountSeq == req.sessionID) {
        let testQuery = "SELECT * FROM secondsch.user_info WHERE seq=$1";
        let param = [req.session.accountSeq];

        pgConn.query(testQuery, param, (err, results) => {
            let result = {
                "success": false
            };
            if (results.rows.length) {
                result = {
                    "success": true
                };
                console.log("check");
                results.rows[0].accountId = req.session.accountId;
                res.send(results.rows[0]);
                outputData = result;
            }
            logModule("account/get", reqIp.getClientIp(req), {}, outputData);
            pgConn.end();

        });
    }
    
});

router.get("/id", (req, res) => {
    let idValue = req.query.id;
    let param = [idValue];
    let inputValue = {
        id: idValue
    }
    const pgConn = new client(pgInit);
    
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })
    
    let testQuery = "SELECT * FROM secondsch.account WHERE id=$1";
    
    pgConn.query(testQuery, param, (err, results) => {
        let result = {
            "success": false
        };
        if (results.rows.length == 0) {
            result = {
                "success": true
            };
        }
        res.send(result);
        logModule("account/get/id", reqIp.getClientIp(req), inputValue, results.rows[0]);
        pgConn.end();

    });

});

router.post("", (req, res) => {
    let idValue = req.body.id;
    let pwValue = req.body.pw;
    let param = [idValue, pwValue]
    let tokenSeq = [];
    let result = {
        "accountSuccess": false,
        "infoSuccess": false,
        "success": false
    };

    const pgConn = new client(pgInit);
        
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })

    let testQuery = "SELECT * FROM secondsch.account WHERE id=$1 AND pw=$2";
    
    pgConn.query(testQuery, param, (err, results) => {
        console.log(results.rows);
        if (results.rows.length) {
            result.accountSuccess = true;

            if (req.session) {
                req.session.accountSeq = results.rows[0].seq;
                req.session.accountId = results.rows[0].id;
                tokenSeq = [results.rows[0].seq];
            }
            console.log(req.session);
            res.cookie("accountSeq", req.sessionID);

            // const url = "https://" + req.headers.host + "/account";
            
            // axios(url, {
            //     method: "GET",
            //     agent: httpsAgent
            // })
            // .then((response) => response.json())
            // .then((response) => {
            //     console.log(response);
            //     const jwtToken = jwt.sign(
            //     response,
            //     "stanleyParable", //private key 마음대로 지정
            //     {//형식 정해짐, 내용 맘대로
            //         expiresIn: "1d",
            //         issuer: "nidel"
            //     });
            //     res.cookie("accountToken", jwtToken);
            //     let inputData = {
            //         id: idValue,
            //         pw: pwValue
            //     }
            //     logModule("account/post", reqIp.getClientIp(req), inputData, response);
            //     pgConn.end();
            // })
            // .catch((err) => {
            //     console.log(err);
            // })

            testQuery = "SELECT * FROM secondsch.user_info WHERE seq=$1";
            
            pgConn.query(testQuery, tokenSeq, (err, tokenRs) => {
                console.log(tokenRs.rows);
                if (tokenRs.rows.length) {
                    result.infoSuccess = true;
                    if (result.accountSuccess && result.infoSuccess) {
                        result.success = true;
                    }

                    tokenRs.rows[0].id = results.rows[0].id;
                    const jwtToken = jwt.sign(
                    tokenRs.rows[0],
                    "stanleyParable", //private key 마음대로 지정
                    {//형식 정해짐, 내용 맘대로
                        expiresIn: "1d",
                        issuer: "nidel"
                    });
                    res.cookie("accountToken", jwtToken);
                }
                res.send(result);
                let inputData = {
                    id: idValue,
                    pw: pwValue
                }
                logModule("account/post", reqIp.getClientIp(req), inputData, result);
                pgConn.end();

            })
        }
    });

});

router.post("/signUp", (req, res) => {
    let idValue = req.body.id;
    let pwValue = req.body.pw;
    let nameValue = req.body.name;
    let ageValue = req.body.age;
    let emailValue = req.body.email;
    let sinceValue = new Date().toISOString();
    // sinceValue = sinceValue.replace(/T.+/, '');
    console.log(sinceValue);
    let paramLogin = [idValue, pwValue]
    let paramInfo = [nameValue, ageValue, emailValue, sinceValue];
    
    let success = {
        "loginSuccess": false,
        "infoSuccess": false
    };

    if (idValue.length > 20 || pwValue.length > 20 || nameValue.length > 7 || ageValue.length > 3 || emailValue.length > 30) {
        console.log("ERROR invalid data insert");
        res.send(result);
    }
    const pgConn = new client(pgInit);

    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })
    
    testQuery = "INSERT INTO secondsch.account(id, pw) VALUES($1, $2)";
    
    pgConn.query(testQuery, paramLogin, (err, results) => {
        if (results.rows.length) {
            success.loginSuccess = true;
        }
    });

    testQuery = "INSERT INTO secondsch.user_info(name, age, email, since) VALUES($1, $2, $3, $4)";

    pgConn.query(testQuery, paramInfo, (err, results) => {
        if (results.rows.length) {
            success.infoSuccess = true;
        }
        let inputValue = {
            id: idValue,
            pw: pwValue,
            name: nameValue,
            age: ageValue,
            since: sinceValue,
            email: emailValue
        }
        logModule("account/post/signUp", reqIp.getClientIp(req), inputValue, success);
        res.send(success);
        pgConn.end();
    })
});

router.put("", (req, res) => {
    let idValue = req.body.id;
    let nameValue = req.body.name;
    let ageValue = req.body.age;
    let emailValue = req.body.email;
    let paramLogin = [idValue, req.session.accountSeq];
    let paramInfo = [nameValue, ageValue, emailValue, req.session.accountSeq];
    const pgConn = new client(pgInit);
    
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })
    
    let success = {
        "loginSuccess": false,
        "infoSuccess": false
    };

    let testQuery = "UPDATE secondsch.account SET id=$1 WHERE seq=$2";
    
    pgConn.query(testQuery, paramLogin, (err, results) => {
        if (results.rows.length) {
            success.loginSuccess = true;
        }
    });
    
    testQuery = "UPDATE secondsch.user_info SET name=$1, age=$2, email=$3 WHERE seq=$4";

    pgConn.query(testQuery, paramInfo, (err, results) => {
        if (results.rows.length) {
            success.infoSuccess = true;
        }
        pgConn.end();
            
        let inputValue = {
            id: idValue,
            name: nameValue,
            age: ageValue,
            email: emailValue
        }
        logModule("account/put", reqIp.getClientIp(req), inputValue, success);
        res.send(success);
    });
});

router.put("/password", (req, res) => {
    let pastPw = req.body.pastPw;
    let changePw = req.body.changePw;
    let paramPast = [pastPw, req.session.accountSeq];
    let paramChange = [changePw, req.session.accountSeq];
    let rs = {
        "success": false
    };
    const pgConn = new client(pgInit);
    
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })
    
    let testQuery = "SELECT * FROM secondsch.account WHERE pw=$1 AND seq=$2";
    
    pgConn.query(testQuery, paramPast, (err, results) => {
        if (results.rows.length) {
            testQuery = "UPDATE secondsch.account SET pw=$1 WHERE seq=$2";

            pgConn.query(testQuery, paramChange, (err, results) => {
                pgConn.end();
            });
            rs = {
                "success": true
            };
        } else {
            rs = {
                "success": false
            };
            pgConn.end();
            
        }    
        let inputValue = {
            "pastPw": pastPw,
            "changePw": changePw
        }
        logModule("account/put/password", reqIp.getClientIp(req), inputValue, rs);
        res.send(rs);
    });
});

router.delete("", (req, res) => {
    const pgConn = new client(pgInit);
    
    pgConn.connect((err) => {
        if (err) {
            console.log("ERROR", err);
            res.send(result);
        }
    })

    let param = [req.session.accountSeq];

    let testQuery = "DELETE FROM secondsch.account WHERE seq=$1";

    pgConn.query(testQuery, param, (err, results) => {
    });

    testQuery = "DELETE FROM secondsch.user_info WHERE seq=$1";

    pgConn.query(testQuery, param, (err, results) => {
        pgConn.end();

    });
    

    
    let inputValue = {
        seq: param
    }
    let outputValue = {
        success: true
    }
    logModule("account/delete", reqIp.getClientIp(req), inputValue, outputValue);
    res.send(true);
});


module.exports = router;