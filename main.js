const http = require("http");
const fs = require("fs");
const log4js = require("log4js");
log4js.configure("log-config.json");
const logger = log4js.getLogger("system");

// 設定
const port = 80;
const localOnly = false;

// 共有変数
let datas = [];

const server = http.createServer(function(req, res) {
    if (req.method == "GET") {
        if (req.url == "/") {
            // [GET] / メインhtml
            logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
            res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
            let html = fs.readFileSync("index.html", "utf-8");
            res.end(html);
            // 通信終了
        } else if (req.url == "/get") {
            // [GET] /get データ確認用
            logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
            let disp = (datas.length > 0);
            let rt = datas.shift();//string|undef
            if (disp) logger.info(datas);
            res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
            res.end(JSON.stringify({"data": rt}));//{"data": "stringstring"}|{}
            // 通信終了
        } else if (req.url == "/clear") {
            // [GET] /clear 破棄
            logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
            datas.splice(0);
            logger.info(`データ破棄`);
            res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
            res.end(JSON.stringify({"nodeMessage": "OK"}));
            // 通信終了
        } else if (req.url == "/favicon.ico") {
            // [GET] /favicon.ico favicon
            logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
            logger.info(req.headers["user-agent"]);
            // res.writeHead(200, {"Content-Type": "image/vnd.microsoft.icon"});
            res.writeHead(200, {"Content-Type": "image/x-icon"});
            const ua = req.headers["user-agent"];
            let icon;
            // 超☆簡易ブラウザ判定
            if (ua.includes("Edg") && !ua.includes("Edge")) {
                icon = fs.readFileSync("edge.ico");
            } else {
                icon = fs.readFileSync("chrome.ico");
            }
            res.end(icon);
            // 通信終了
        } else {
            // [GET] (not found) それ以外
            res.writeHead(404, {"Content-Type": "application/json; charset=utf-8"});
            res.end(JSON.stringify({"nodeMessage": "not found"}));
            // 通信終了
        }
    } else if (req.method == "POST") {
        // [POST] (any)
        logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
        let body = "";
        // 受信時
        req.on("data", (chunk) => {
            body += chunk;
        });
        // 受信完了後
        req.on("end", () => {
            if (req.url == "/post") {
                // [POST] /post データ追加用
                try {
                    let json = JSON.parse(body);
                    if (json["data"] == undefined) throw new Error("data undefined");
                    datas.push(json["data"]);
                    logger.info(datas);
                    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                    res.end(JSON.stringify({"nodeMessage": "OK"}));
                    // 通信終了
                } catch (error) {
                    res.writeHead(400, {"Content-Type": "application/json; charset=utf-8"});
                    res.end(JSON.stringify({"nodeMessage": "Error"}));
                    // 通信終了
                }
            } else {
                res.writeHead(404, {"Content-Type": "application/json; charset=utf-8"});
                res.end(JSON.stringify({"nodeMessage": "Error"}));
                // 通信終了
            }
        });
    } else {
        // [(any)] (any)
        logger.info(`[${req.method}] ${req.url} from ${req.socket.remoteAddress}`);
        res.writeHead(405, {"Content-Type": "text/plain; charset=utf-8"});
        res.end();
        // 通信終了
    }
});
// 起動
server.listen(port, localOnly ? "127.0.0.1" : "0.0.0.0");
logger.info(`ポート${port}でサーバー${localOnly ? "(ローカル)" : ""}を起動しました`);

// 終了時処理
process.on("SIGINT", () => {
    logger.info("サーバーを停止しました");
    // 遅延終了
    setTimeout(() => {
        process.exit();
    }, 1);
});