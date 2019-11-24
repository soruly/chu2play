const fs = require("fs");
const Koa = require("koa");
const websockify = require("koa-websocket");
const app = websockify(new Koa());
const robot = require("robotjs");

app.ws.use(function(ctx, next) {
  return next(ctx);
});

app.ws.use((ctx) => {
  let prevMessage = "[]";
  ctx.websocket.on("message", function(message) {
    if (message === prevMessage) {
      return;
    }
    const prevList = JSON.parse(prevMessage)
    const newList = JSON.parse(message);
    for (let prevKey of prevList) {
      if (!newList.some(k => k === prevKey)) {
        // console.log(prevKey, "up");
        robot.keyToggle(prevKey, "up");
      }
    }
    for (let newKey of newList) {
      if (!prevList.some(k => k === newKey)) {
        // console.log(newKey, "down");
        robot.keyToggle(newKey, "down");
      }
    }
    prevMessage = message;
  });
});

app.use(async (ctx) => {
  console.log(ctx.path);
  if (ctx.path === "/") {
    ctx.body = fs.readFileSync("index.html", "utf8");
    return;
  }
  if (ctx.path === "/manifest.json") {
    ctx.body = JSON.stringify({
      short_name: "chunithm",
      name: "chunithm",
      icons: [],
      start_url: "/",
      background_color: "#000000",
      display: "fullscreen",
      scope: "/",
      theme_color: "#000000"
    });
    return;
  }
}).listen(3000);
