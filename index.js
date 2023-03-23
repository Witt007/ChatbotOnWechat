"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
//@ts-ignore
const ws_1 = __importDefault(require("ws"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const chatbot_1 = __importDefault(require("./router/chatbot"));
let socket;
const app = (0, express_1.default)();
app.disable("x-powered-by");
app.use(express_1.default.static("./static"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded());
app.use((0, cookie_parser_1.default)());
//app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'ejs');
app.use(function doCors(req, res, next) {
    console.log("middleware-", req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,X-Request-With');
    if (req.method == 'OPTION') {
        res.setHeader("Access-Control-Allow-Methods", 'GET,POST,PUT,PATCH,DELETE');
    }
    //res.clearCookie('chatbotToken')
    let token = req.cookies["chatbotToken"];
    next();
});
app.use('/', chatbot_1.default);
const cert = fs_1.default.readFileSync(path_1.default.join(__dirname, 'certs/v2ray.pem'));
const certKey = fs_1.default.readFileSync(path_1.default.join(__dirname, 'certs/v2ray.key'));
const server = https_1.default.createServer({ cert, key: certKey }, app);
server.listen(82);
const wsServer = new ws_1.default.WebSocketServer({ server });
wsServer.on("connection", function (sk, req) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("connected" + Math.random(), sk.url);
        socket = sk;
        socket.onmessage = function (ev) {
            console.log("Witt:received data", ev.data);
            const data = ev.data;
            if (data === "qrcode") {
                /*    if (bot.isLoggedIn)
                     return socket.send(JSON.stringify({ type: "hasloggedIn" }));
                   */
            }
        };
        socket.onclose = function (ev) {
            console.log("Witt:closed", ev.reason);
        };
        socket.onerror = function (ev) {
            console.log("Witt:error", ev.message);
        };
        socket.onopen = function (ev) {
            console.log("Witt:opened", ev.target);
        };
    });
});
