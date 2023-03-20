import express from "express";
import { ScanStatus, WechatyBuilder,wechaty } from "wechaty";
const router= express.Router({caseSensitive:true});

router.get('/auth',function (req,res) {
res.send('asf')
})

export default router;
const bot = initBot();
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