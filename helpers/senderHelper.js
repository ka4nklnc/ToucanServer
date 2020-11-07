"use strict";
let WebSocket = require("ws");
let authMiddleware = require("../middleware/authMiddleware");
let offlineHelper = require("./offlineHelper");
let offline = require("../models/database/offlineModel");
/**
 *
 * @param {*} socket
 * @param {*} user
 * @param {*} path
 * @param {*} data
 */
module.exports.send = (
  socket,
  user,
  data,
  offlinesave = false,
  resend = true
) => {
  //TODO Offline db ye yazılacak
  socket.send(JSON.stringify(data));
  if (resend) offlineHelper.push(socket, user, data, offlinesave);
};

module.exports.sendUser = (user, data, offlinesave = false, resend = true) => {
  //TODO Offline db ye yazılacak
  let websocket;
  do {
    console.log(user)
    if (typeof user == "string") websocket = authMiddleware.getLoginUser(user);
    else websocket = authMiddleware.getLoginUser(user.userId);
    console.log(
      "SenderHelper",
      "sendUser",
      websocket != null ? "User found" : "User Not Found"
    );
    //let newData = Object.create(data);
    let json = JSON.stringify(data);
    let mUid = data.mUid;
    if (websocket) {
      console.log(
        "SenderHelper",
        "SendUser",
        "Send Socket Message",
        websocket.user.username,
        json
      );
      websocket.send(json);
      if (resend) offlineHelper.push(websocket.user.userId, data, offlinesave);
      else if (offlinesave && json != "{}") {
        var db = offline({ userId: user.userId, data: json, mUid: mUid });
        db.save();
      }
      return;
    } else if (offlinesave && json != "{}") {
      var db = offline({ userId: user.userId, data: json, mUid: mUid });
      db.save();
      return;
    } else return;
  } while (websocket);
};

module.exports.delivery = (socket) => {
  socket.on("delivery", function(data) {
    offlineHelper.remove(socket.id, mUid);
  });
};

module.exports.getDatabaseResend = () => {};

module.exports.disconnect = (socket) => {
  sending.forEach(async (v, i) => {
    if (v.socket.id == socket.id) {
      //TODO veritabanına yazılma işlemi gözden geçirilecek
      let model = new offlineDataModel({
        userId: v.user.userId,
        jsonData: v.data,
      });

      await model.save();

      if (v.data.mUid == data) {
        try {
          clearInterval(v.time);
        } catch {
          console.log("senderHelper", "Interval temizlenemedi.");
        }
        try {
          sending.splice(i, 1);
        } catch {
          console.log("senderHelper", "sending silinemedi.");
        }
      }
    }
  });
};
