import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { renderFile } from "ejs";
import { ScanStatus, WechatyBuilder } from "wechaty";
//@ts-ignore
import QRcode from "qrcode-terminal";
import websocket from "ws";
import { IncomingMessage, ServerResponse, createServer } from "http";
import { WechatyInterface } from "wechaty/impls";
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import path from "path";
let socket: websocket.WebSocket;
const bot = initBot();

const app = express();
app.use(express.static("./static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.set("views", path.join(__dirname, "views"));
app.engine("html", renderFile);
app.use(function doCors(req, res, next) {
  console.log("middleware-", req.url);

  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin,')
  next();
});

app.get('auth')
const server = http.createServer(app);
server.listen(82);

const config: Configuration = new Configuration({
  apiKey: "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",
});
/* const openai = new OpenAIApi(config);
openai.createCompletion({ model: "text-davinci-003", prompt: "sa" }); */

const wsServer = new websocket.WebSocketServer({ server });

wsServer.on(
  "connection",
  async function (sk: websocket.WebSocket, req: IncomingMessage) {
    console.log("connected" + Math.random(), sk.url);
    socket = sk;

    socket.onmessage = function (ev: websocket.MessageEvent) {
      console.log("Witt:received data", ev.data);
      const data = ev.data;
      if (data === "qrcode") {
        if (bot.isLoggedIn)
          return socket.send(JSON.stringify({ type: "hasloggedIn" }));
        bot.reset().then(() => {
          console.log("s" + Math.random());

          bot.once("scan", function (qrcode: string, status) {
            console.log("onscan");

            if (status == ScanStatus.Waiting || status == ScanStatus.Timeout) {
              console.log("Scanning...", qrcode);

              const qrcodeImageUrl: string = [
                "https://api.qrserver.com/v1/create-qr-code/?data=",
                encodeURIComponent(qrcode),
              ].join("");
              socket.send(qrcodeImageUrl);
            }
          });
        });
      }
    };

    socket.onclose = function (ev: websocket.CloseEvent) {
      console.log("Witt:closed", ev.reason);
    };
    socket.onerror = function (ev: websocket.ErrorEvent) {
      console.log("Witt:error", ev.message);
    };
    socket.onopen = function (ev: websocket.Event) {
      console.log("Witt:opened", ev.target);
    };
  }
);

function initBot(): WechatyInterface {
  const bot = WechatyBuilder.build({
    puppet: "wechaty-puppet-wechat4u",
    name: "wechat",
  });

  bot.on("stop", () => {
    console.log("Bot stopped");
  });

  bot.on("login", () => {
    console.log("success login");
  });
  bot.on("logout", () => {
    console.log("logout");
  });
  bot.on("message", () => {
    console.log("have a message");
  });
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
