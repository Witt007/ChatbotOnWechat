import express from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { WechatyInterface } from "wechaty/impls";
import https from "https";
import { IncomingMessage } from "http";
import fs from "fs";
import { Blob } from "buffer";
const router = express.Router({ caseSensitive: true });
const bot = initBot();

router.get("/auth", function (req, res) {
  bot.reset().then(() => {
    console.log("s" + Math.random());

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
            let data:any='';
            req.on("data", (chunk: Buffer) => {
              data += chunk;console.log(Math.random());
              
            });
            req.on("end", () => {
            console.log('data');
           
              res.type('jpeg').statusCode.render("index", { data });
            });
          })
          .on("error", (error) => {
            console.log('https.get',error);
          });
      }
    });
  });
});

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

export default router;
