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
const openai= initOpenAI();

router.get("/auth", function (req, res) {
  /*  if (bot.isLoggedIn) {
    res.send("You have logged in!");
  } else
    bot.reset().then(() => {
      console.log("s" + Math.random());

    initBot()
    }); */
    
  new Promise<MessageInterface>((resolve, reject) => {
    initBot(res, resolve);
  }).then(async(msg: MessageInterface) => {
   let text = msg.text();
    let talker = msg.talker();
    const MentionedMe = await msg.mentionSelf();
    if (MentionedMe) {
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      temperature: 0.9, // 每次返回的答案的相似度0-1（0：每次都一样，1：每次都不一样）
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [" 王腾腾:", " AI:"],
    });

    let say = response.data.choices[0].text || "";

    msg.say(say);

    outputLog()

  });
});

function outputLog(obj:{}) {
    Object.entries(obj).map((v)=>{

    })
    console.info(...args)
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

function initOpenAI():OpenAIApi {
    const config: Configuration = new Configuration({
        apiKey: "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",
      });
     return  new OpenAIApi(config);
}



export default router;
