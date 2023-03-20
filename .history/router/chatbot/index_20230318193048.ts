import express, { Response, Request } from "express";
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

function outputLog(obj: {}) {
  const args: any[] = Object.entries(obj).map((v, i) => {
    return `Witt: the property ${v[0]} value is ${v[1]}\n`;
  });
  console.info(...args);
}
function initBot(
  req: Request,
  res: Response,
  handleMsg: (value: MessageInterface) => void
): WechatyInterface {
  const token = req.cookies["chatbotToken"] ;
  if (!token) {
      const token='Witt:'+Math.random().toString();
      res.cookie('chatbotToken',token);
      console.log(req.cookies["chatbotToken"],'res');
      
  }
  console.log("token", token);
  const bot = WechatyBuilder.build({
    puppet: "wechaty-puppet-wechat4u",
    name: "wechat",
    puppetOptions: {
      uos: true,
      endpoint: "1（0：每次都一样，1：每次都不一样）",
      token:,
    },
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
  bot.once("stop", () => {
    console.log("Bot stopped");
  });

  bot.once("login", () => {
    console.log("success login");
    res.send("You have successfully logged in!");
  });
  bot.once("logout", () => {
    console.log("logout");
  });
  bot.once("message", async (msg: MessageInterface) => {
    if (!msg.text()) {
      return;
    }
    console.log("have a message");
    msg
      .talker()
      .alias()
      .then((name) => {
        console.log(name);
      });
    handleMsg(msg);
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
async function responseMsg(msg: MessageInterface) {
  let text = msg.text();
  let talker = msg.talker();
  let isSentByMe = msg.self();
  const MentionedMe = await msg.mentionSelf();
  const room = await msg.room();
  const date = msg.date();
  if (isSentByMe) {
    //return
  }
  if (MentionedMe) {
  }

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt:
      "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: I'd like to cancel my subscription.\nAI:",
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });

  let say = response.data.choices[0].text || "";
  console.log(say);

  //msg.say(say);

  //outputLog([msg.type(), text, talker, MentionedMe, room?.memberAll?.(), date]);
}
export default router;
