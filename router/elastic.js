const router = require("express").Router();
const es = require("elasticsearch");
const jwt = require("jsonwebtoken");

router.get("/connect", (req, res) => {
    const result = {
        status: "connect fail"
    }
    
    //elasticsearch 설정
    const client = new es.Client({
        node: "http://127.0.0.1:9200/"
    })

    //연결 상태 확인
    client.ping({requestTimeout: 1000}, (err) => {
        if (err) {
            console.log(err);
        } else {
            result.status = "connect success";
        }
        res.send(result);
    });
})

router.post("", (req, res) => {
    const memo = req.body.memo;
    const tag = req.body.tag;
    const tagArr = tag.split(" ");
    const result = {
        success: false
    }

    const client = new es.Client({
        node: "http://127.0.0.1:9200/"
    })

    client.index({
        index: "memo",
        body: {
            memo: memo,
            tag: tagArr,
            writer: jwt.verify(req.cookies.accountToken, "stanleyParable").id
        }
    }, (err) => {
        if (err) {
            console.log(err);
        } else {
            result.success = true;
        }
        res.send(result);
    })
})

router.get("", (req, res) => {
    let word = req.query.data;
    // word = ".*" + word + ".*"
    console.log(word);
    // const korean = /[ㄱ-ㅎ ㅏ-ㅣ 가-힣]/g;
    const result = {
        success: false,
        list: null
    }

    const client = new es.Client({
        node: "http://127.0.0.1:9200/"
    })

    // if (korean.test(word)) {
    //     res.send(result);
    // } else {
    // }
    client.search({
        index: "memo",
        body: {
            query: {//특정 조건으로 찾겠다
                bool: {//논리식
                    should: [//or
                        {fuzzy: {
                                memo: {
                                    value: word,
                                    fuzziness: "1"
                                }
                            }
                        },
                        {fuzzy: {
                                tag: {
                                    value: word,
                                    fuzziness: "1"
                                }
                            }
                        },
                        {fuzzy: {
                                writer: {
                                    value: word,
                                    fuzziness: "1"
                                }
                            }
                        }
                    ]
                }
            }
        }
    }, (err, searchRs) => {
        if (err) {
            console.log(err);
        } else {
            result.list = searchRs.hits.hits;
            result.success = true;
        }
        res.send(result);
    })
})

module.exports = router;