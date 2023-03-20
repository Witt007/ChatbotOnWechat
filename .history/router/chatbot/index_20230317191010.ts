import express from "express";
import { ScanStatus, WechatyBuilder } from "wechaty";
import { WechatyInterface } from "wechaty/impls";
const router = express.Router({ caseSensitive: true });
const bot = initBot();

router.get("/auth", function (req, res) {
  res.send("asf");
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
});



export default router;

