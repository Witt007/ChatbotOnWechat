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
const wechaty_1 = require("wechaty");
const https_1 = __importDefault(require("https"));
const openai_1 = require("openai");
const router = express_1.default.Router({ caseSensitive: true });
//const bot = initBot();
const openai = initOpenAI();
router.get("/login", function (req, res) {
    /*  if (bot.isLoggedIn) {
      res.send("You have logged in!");
    } else
      bot.reset().then(() => {
        console.log("s" + Math.random());
  
      initBot()
      }); */
    initBot(req, res, responseMsg);
});
function outputLog(obj) {
    const args = Object.entries(obj).map((v, i) => {
        return `Witt: the property ${v[0]} value is ${v[1]}\n`;
    });
    console.info(...args);
}
function initBot(req, res, handleMsg) {
    let token = req.cookies["chatbotToken"];
    if (!token) {
        token = "Witt:" + Math.random().toString();
        res === null || res === void 0 ? void 0 : res.cookie("chatbotToken", token); //.setHeader("Set-Cookie", ["chatbotToken=" + token]);
        console.log("cookie is set", req.cookies["chatbotToken"]);
    }
    console.log("client token", token);
    const bot = wechaty_1.WechatyBuilder.build({
        puppet: "wechaty-puppet-wechat4u",
        name: "wechat" + token,
        puppetOptions: {
            uos: true,
            endpoint: "1（0：每次都一样，1：每次都不一样）",
            token,
        },
    });
    console.log("entered");
    bot.once("scan", function (qrcode, status) {
        console.log("onscan");
        if (status == wechaty_1.ScanStatus.Waiting || status == wechaty_1.ScanStatus.Timeout) {
            const qrcodeImageUrl = [
                "https://api.qrserver.com/v1/create-qr-code/?data=",
                encodeURIComponent(qrcode),
            ].join("");
            console.log("Scanning...", qrcodeImageUrl);
            https_1.default
                .get(qrcodeImageUrl, function (req) {
                req.on("data", (chunk) => {
                    res === null || res === void 0 ? void 0 : res.status(200).type("jpeg").end(chunk);
                    res = null;
                });
            })
                .on("error", (error) => {
                console.log("https.get", error);
            });
        }
    });
    bot.once("stop", () => {
        console.log("Bot stopped");
    });
    bot.once("login", () => {
        console.log("success login");
        res === null || res === void 0 ? void 0 : res.end("You have successfully logged in!");
    });
    bot.once("logout", () => {
        console.log("logout");
    });
    bot.once("message", (msg) => __awaiter(this, void 0, void 0, function* () {
        if (!msg.text()) {
            //return;
        }
        console.log("have a message");
        msg
            .talker()
            .alias()
            .then((name) => {
            console.log(name);
        });
        handleMsg(msg);
    }));
    bot
        .start()
        .then(() => {
        console.log("chatbot started");
    })
        .catch((error) => {
        console.log("Witt:started error", error);
        bot.start();
    });
    return bot;
}
function initOpenAI() {
    const config = new openai_1.Configuration({
        apiKey: "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",
    });
    return new openai_1.OpenAIApi(config);
}
function responseMsg(msg) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let text = msg.text();
        let talker = msg.talker();
        let isSentByMe = msg.self();
        const MentionedMe = yield msg.mentionSelf();
        const room = yield msg.room();
        const date = msg.date();
        if (isSentByMe) {
            //return
        }
        if (MentionedMe) {
        }
        const response = yield openai.createCompletion({
            model: "text-davinci-003",
            prompt: text ||
                "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: I'd like to cancel my subscription.\nAI:",
            temperature: 0.9,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
            stop: ["YOU:", "Robert Witt:"]
        });
        let say = response.data.choices[0].text || "";
        console.log(say);
        msg.say(say);
        outputLog([msg.type(), text, talker, MentionedMe, (_a = room === null || room === void 0 ? void 0 : room.memberAll) === null || _a === void 0 ? void 0 : _a.call(room), date]);
    });
}
exports.default = router;
