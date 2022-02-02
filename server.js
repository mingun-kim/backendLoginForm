const express = require("express"); //express 모듈 import

const app = express(); //express class를 객체로 만들어 주는 것
const port = 3000;


const httpsPort = 3333;
const path = require("path");

const fs = require("fs");
const https = require("https");
const options = {
    key: fs.readFileSync(path.join(__dirname, "private.pem")),
    cert: fs.readFileSync(path.join(__dirname, "public.pem"))
    // ca:
}


app.use(express.json()); //요청 들어오는 json 읽기



app.get("*", (req, res, next) => {

    const protocol = req.protocol;

    if (protocol == "https") {
        next();
    } else {
        const destination = "https://" + req.hostname + ":" + httpsPort + req.url;
        res.redirect(destination);
    }
})



const session = require("express-session");
app.use(session({
    secret: "test key",
    resave: false,
    saveUninitialized: true
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//middleware 등록, 깊은걸 나중에 등록
let pages = require("./router/pages");
app.use("/", pages);

let account = require("./router/account");
app.use("/account", account);

const elastic = require("./router/elastic");
app.use("/elastic", elastic);

https.createServer(options, app).listen(httpsPort, (req, res) => {
    console.log("https server is started at port" + httpsPort);
});

//middleware: 서버 실행
app.listen(port, (req, res) => {
    console.log("http server is started at port" + port);
});