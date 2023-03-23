import express, { Response, Request } from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { MessageInterface, WechatyInterface } from "wechaty/impls";
import https from "https";
import { IncomingMessage } from "http";
import fs from "fs";
import path from "path";
import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { Blob } from "buffer";
import { WechatyEventListenerMessage, WechatyEventListenerScan, WechatyEventListenerLogin, WechatyEventListenerLogout } from "wechaty/dist/esm/src/schemas/wechaty-events";
const router = express.Router({ caseSensitive: true });
//const bot = initBot();
const openai = initOpenAI();

function getOrSetBotToken(req: Request, res: Response): string {
  let token = req.cookies["chatbotToken"];
  if (!token) {
    token = "Witt:" + Math.random().toString();
    res.cookie("chatbotToken", token); //.setHeader("Set-Cookie", ["chatbotToken=" + token]);

    console.log("cookie is set", req.cookies["chatbotToken"]);
  } else {

  }
  console.log("client token", token);
  return token;
}

router.get("/login", function (req, res) {
  /*  if (bot.isLoggedIn) {
    res.send("You have logged in!");
  } else
    bot.reset().then(() => {
      console.log("s" + Math.random());

    initBot()
    }); */
  //what time?
  initBot(getOrSetBotToken(req, res),getInitBotListenners());
});



function outputLog(obj: {}) {
  const args: any[] = Object.entries(obj).map((v, i) => {
    return `Witt: the property ${v[0]} value is ${v[1]}\n`;
  });
  console.info(...args);
}

type botListenners = {
  onmessage: WechatyEventListenerMessage,
  onscan: WechatyEventListenerScan,
  onlogin: WechatyEventListenerLogin,
  onlogout: WechatyEventListenerLogout,
}
function initBot(
  token: string, listeners: botListenners
): WechatyInterface {


  const bot = WechatyBuilder.build({
    puppet: "wechaty-puppet-wechat4u",
    name: "wechat" + token,
    puppetOptions: {
      uos: true,
      endpoint: "1（0：每次都一样，1：每次都不一样）",
      token,
    },
  });
  console.log("entered");
  bot.once("scan", listeners.onscan);
  bot.once("stop", () => {
    console.log("Bot stopped");
  });

  bot.once("login", listeners.onlogin);
  bot.once("logout", listeners.onlogout);
  bot.once("message", listeners.onmessage);

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


  outputLog([msg.type(), text, talker, MentionedMe, room?.memberAll?.(), date]);
}

let bot: WechatyInterface;
function reinitBot() {

}

export default router;

type username = string
//if logged out then pop it out from users;
type user = { [key: username]: { name?: string, token: string, isLoggedOut?: boolean } }

type userData = {
  users: {
    [key: username]: user
  }
  msgRecord: {
    [key: username]: string[]
  }

}
//let currentBot:WechatyInterface;
type allBots = WechatyInterface[];



function getInitBotListenners(): botListenners {
  return {
    onlogin: () => {
      console.log("success login");

    },
    onlogout: () => {
      console.log("logout");
    },
    onscan: function (qrcode: string, status) {
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
              res?.status(200).type("jpeg").end(chunk);
              res = null;
            });
          })
          .on("error", (error) => {
            console.log("https.get", error);
          });
      }
    },
    onmessage: async (msg: MessageInterface) => {
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
      responseMsg(msg);
    }
  }
}
async function InitAllBots(): Promise<allBots> {

  const userTB: userData = await getUsers(tb);
  let bots: allBots = Object.keys(userTB.users).map((token) => {
    const bot: WechatyInterface = initBot(token, getInitBotListenners())
    return bot;
  })
  return bots;
}

//create a file for each user.

class Database {
  private tables: Map<string, Table> = new Map();
  databaseName: string
  constructor(databaseName: string) {
    this.databaseName = databaseName;
  }
  createTable(tablename: string): Table {
    return new Table(tablename);
  }

  deleteTable(tablename: string) {
    const table = this.tables.get(tablename);
    if (table) {
      try {
        // table.delete()
      } catch (error) {
        console.log('failed to delete table', error);

      }

    }
  }
}


class Table {
  tablename: string
  constructor(tablename: string) {
    this.tablename = tablename;

  }

  private readFile(): Promise<userData> {
    return new Promise((resolve) => {
      const userpath = path.join(process.cwd(), 'data/user.json');
      fs.access(userpath, fs.constants.F_OK, (error: any) => {
        if (!error) {
          fs.readFile(userpath, function (error, data) {
            resolve(JSON.parse(data.toString()));
          })
        }
      })
    })

  }
  delete() {

  }
  private currTbFilePath: string = path.join(process.cwd(), 'data/user.json')
  writeData(data: userData) {
    const dataStr = JSON.stringify(data);
    const userpath = this.currTbFilePath;
    fs.access(userpath, fs.constants.W_OK, (error: any) => {
      if (!error) {
        fs.writeFile(userpath, dataStr, {}, function (error) {
          error && console.log('failed to write user data', error) || (2)

        })
      } else console.log('no write permission');

    })

  }
  readData(): Promise<userData> {
    return this.readFile();
  }


}

function getUsers(tb: Table): Promise<userData> {
  return tb.readData();
}
const database = new Database('chatbot');
const tb = database.createTable('users');

InitAllBots();