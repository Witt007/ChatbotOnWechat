import express from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { WechatyInterface } from "wechaty/impls";
import https from "https";
import { IncomingMessage } from "http";
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
        https
          .get(qrcodeImageUrl, function (req: IncomingMessage) {
            console.log("https");
            res.send(qrcodeImageUrl);
            req.on("data", (d) => {
              console.log(Math.random());
            });
          })
          .on("error", (error) => {
            console.log(error);
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
