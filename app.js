"use strict";
import mongoose from "mongoose";
import _routerListener from "./listeners/_routerListener";
import authMiddleware from "./middleware/authMiddleware";
import offlineHelper from "./helpers/offlineHelper";
import userModel from "./models/database/userModel";
import { JSONFormat } from "./models/types/JSONFormat";
import { sendUser } from "./helpers/senderHelper";
mongoose.connect(
  "mongodb://localhost:27017/toucan",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log("Connected MongoDb.");
  }
);

let WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });
authMiddleware.setWs(wss);

wss.on("connection", function connection(ws) {
  console.log("Device connected.[" + authMiddleware.getCount() + "]", Date());

  setInterval(function() {
    if (ws.terminatetimer != null) clearTimeout(ws.terminatetimer);
    ws.terminatetimer = setTimeout(function() {
      ws.terminate();
      ws.close(1000, "");
      authMiddleware.logouth(ws);
    }, 15000);
  }, 10000);
  ws.id = authMiddleware.createUId();
  ws.user = null;

  ws.on("message", function incoming(message) {
    onMessage(ws, message);
  });
  ws.on("ping", function(data) {
    console.log("ping", data);
    ws.ping();
    ws.send("pong");
  });
  ws.on;
  ws.on("close", function close(closecode) {
    authMiddleware.logouth(ws);

    if (!ws.user) return;
    try {
      onlinestatus(ws.user.userId, false);
    } catch (e) {
      console.log("App", "close", e);
    }
  });
});

function onlinestatus(userId, state) {
  userModel.findOne({ userId: userId }, (err, resDb) => {
    try {
      resDb.onlinefollowlist.forEach((v, i) => {
        sendUser(
          v,
          new JSONFormat(userId, -1, "onlinestatus", state),
          false,
          true
        );
      });
    } catch {}
  });
}

function onPing(ws) {
  console.log("ping", ws.id);
  if (ws.readyState == WebSocket.OPEN) {
    if (ws.user == null) ws.send("pong not login");
    else ws.send("pong");
    console.log("pong");
  }
  clearTimeout(ws.terminatetimer);
}

function onMessage(ws, message) {
  if (message == "ping") {
    return onPing(ws);
  }

  let data = ConvertMessage(message);

  if (data == null) return;
  // if (data.path != "relogin" && data.path != "mUid")
  //   console.log("App", "data:", data.data);
  // if (ws.user)
  //   console.log("App", " incoming message", ws.user.username, data);
  // else console.log("App", "incoming message", "notlogin", data);

  ws.sendCallback = function(res, save = false, resend = true) {
    var model = {
      data: res.data,
      errorCode: res.errorCode,
      state: res.state,
      mUid: data.mUid,
      path: data.path,
    };
    console.log("App", "Callback //:", data.path);
    if (resend) offlineHelper.push(ws, model, save);
    ws.send(JSON.stringify(model));
  };

  _routerListener.manager(ws, data);
}

function ConvertMessage(message) {
  try {
    return JSON.parse(message);
  } catch (e) {
    return console.log("App", "message undefined", e);
  }
}
