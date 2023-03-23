import express from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import https from "https";
import { IncomingMessage } from "http";
import fs from "fs";
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { Blob } from "buffer";
import { WechatyEventListenerMessage } from "wechaty/dist/esm/src/schemas/wechaty-events";
const router = express.Router({ caseSensitive: true });
const bot = initBot();

router.get("/auth", function (req, res) {
  if (bot.isLoggedIn) {
    res.send("You have logged in!");
  } else
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
              req.on("data", (chunk: Buffer) => {
                res.type("jpeg").status(200).send(chunk);
              });
            })
            .on("error", (error) => {
              console.log("https.get", error);
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
  console.log("entered");

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
    let text=msg.text();
    let sender=msg.from();

    const response =await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "sa",
    }).then((d)=>{})
    
    msg.say(response.data.object)
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

const config: Configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(config);

export default router;
