import express, { Response } from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import https from "https";
import { IncomingMessage } from "http";
import fs from "fs";
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { Blob } from "buffer";
import { WechatyEventListenerMessage } from "wechaty/dist/esm/src/schemas/wechaty-events";
const router = express.Router({ caseSensitive: true });
//const bot = initBot();
const openai = initOpenAI();

router.get("/auth", function (req, res) {
  /*  if (bot.isLoggedIn) {
    res.send("You have logged in!");
  } else
    bot.reset().then(() => {
      console.log("s" + Math.random());

    initBot()
    }); */
initBot(res, resolve);
  new Promise<MessageInterface>((resolve, reject) => {
    
  }).then();
});

function outputLog(obj: {}) {
  const args: any[] = Object.entries(obj).map((v, i) => {
    return `Witt: the property ${v[0]} value is ${v[1]}\n`;
  });
  console.info(...args);
}
function initBot(
  res: Response,
  resolve: (value: MessageInterface) => void
): WechatyInterface {
  const bot = WechatyBuilder.build({
    puppet: "wechaty-puppet-wechat4u",
    name: "wechat",
    puppetOptions: {
      uos: true,
      endpoint: "1（0：每次都一样，1：每次都不一样）",
      token: Math.random().toString(),
    },
    ioToken: Math.random().toString(),
  });
  console.log("entered");

  bot.once("scan", function (qrcode: string, status) {
    console.log("onscan");

    if (status == ScanStatus.Waiting || status == ScanStatus.Timeout) {
      const qrcodeImageUrl: string = [
        "https://api.qrserver.com/v1/create-qr-code/?data=",
        encodeURIComponent(qrcode),
      ].join("");
      console.log("Scanning...", qrcodeImageUrl);
      https
        .get(qrcodeImageUrl, function (req: IncomingMessage) {
          req.on("data", (chunk: Buffer) => {
            res.status(200).type("jpeg").send(chunk);
          });
        })
        .on("error", (error) => {
          console.log("https.get", error);
        });
    }
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
  bot.on("message", async (msg: MessageInterface) => {
    console.log("have a message");
    resolve(msg);
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

function initOpenAI(): OpenAIApi {
  const config: Configuration = new Configuration({
    apiKey: "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",
  });
  return new OpenAIApi(config);
}
func
export default router;
