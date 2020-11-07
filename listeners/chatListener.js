"use strict";
let { send, sendUser } = require("../helpers/senderHelper");
let {
  JSONErrorFormat,
  JSONSuccessFormat,
  JSONFormat,
} = require("../models/types/JSONFormat");
let chatModel = require("../models/database/chatModel");
let userModel = require("../models/database/userModel");
let router = require("../listeners/_routerListener");
let gcm = require("../helpers/pushnotiHelper");
const { ObjectId } = require("mongodb");

router.get("message", true, async (ws, res) => {
  if(!ws.user) return
  //TODO Cloud Messaging Firebase yapılacak
  userModel.findOne({ userId: res.data.receiveuid }, (err, resDb) => {
    let chat = new chatModel({
      senderuid: ws.user.userId,
      receiveuid: resDb.userId,
      message: res.data.message,
      messagestatus: 0,
      fileurl: res.data.fileurl,
      filetype: res.data.filetype,
    });
    chat.save();
    //Sender
    ws.sendCallback(
      new JSONSuccessFormat(
        {
          createat: chat.createat,
          isdeleted: false,
          messagestatus: 0,
          _id: chat._id,
          senderuid: chat.senderuid,
          receiveuid: chat.receiveuid,
          message: chat.message,
          fileurl: chat.fileurl,
          filetype: chat.filetype,
          dbId: res.data.dbId,
        },
        "message"
      ),
      true,
      true
    );

    //Receive
    sendUser(resDb, new JSONSuccessFormat(chat, "message"), true);
    var data = {
      bodymessage: chat.message,
      bodyreceiveuid: chat.receiveuid,
      bodysenderuid: chat.senderuid,
      bodytime: 0,
      bodymessagestatus: 0,
      body_id: chat._id,
    };
    gcm.sendNoti(
      resDb.cloudMessagingToken,
      resDb.namesurname,
      JSON.stringify(chat),
      chat.message,
      data
    );
  });
});

router.get("updatemessage", true, async (ws, res) => {
  chatModel.findOne(
    {
      _id:ObjectId(res.data._id),
      senderuid: res.data.senderuid,
      receiveuid: res.data.receiveuid,
    },
    async (err, resDb) => {
      console.log(res.data.fileUrl)
      if (err) return; //TODO ERROR MESSAGE
      resDb.message = res.data.message;
      resDb.fileurl = res.data.fileurl;
      resDb.filetype = res.data.filetype;
      resDb.fileuploadstatus = res.data.fileuploadstatus;

      await resDb.save();

      ws.sendCallback(
        new JSONSuccessFormat(resDb, "updatemessage"),
        true,
        true
      );
      sendUser(res.data.receiveuid, new JSONSuccessFormat(resDb, "updatemessage"));
    }
  );
});

router.get("deletemessage", true, (ws, data, user) => {
  chatModel.updateOne(
    {
      _id: data._id,
      senderId: user._id,
    },
    {
      isDeleted: true,
    },
    (err, res) => {
      if (err) return; //TODO ERROR MESSAGE

      send(socket, user, "deletemessage", new JSONSuccessFormat(res));
      sendUser(user, "deletemessage", new JSONSuccessFormat(res));
    }
  );
});

router.get("statuschangemessage", true, (ws, res) => {
  //console.log(Date(), "chatListener", "statuschangemessage", res.data);
if(!ws.user) return

  chatModel.find(
    {
      _id: res.data._id,
      receiveuid: ws.user.userId,
      senderuid: res.data.senderuid,
      messagestatus: { $lt: res.data.messagestatus },
    },
    (err, resDb) => {
      if (err) console.log(err);
      resDb.forEach((v, i) => {
        if (v.messagestatus < res.data.messagestatus) {
          v.update({ messagestatus: res.data.messagestatus });
          v.save();
          v.messagestatus = res.data.messagestatus;

          ws.sendCallback(
            new JSONSuccessFormat(v, "statuschangemessage"),
            true,
            true
          );

          sendUser(
            { userId: res.data.senderuid },
            new JSONSuccessFormat(v, "statuschangemessage"),
            true,
            true
          );
        }
      });
    }
  );
});

router.get("writemessage", true, async (ws, res) => {
  if(!ws.user)return
  try {
    userModel.findOne({ userId: res.data.userId }, (err, resDb) => {
      var user = { ...ws.user._doc, writing: res.data.writing };
      console.log("chatlistener", "writemessage", user);
      sendUser(
        resDb,
        new JSONSuccessFormat(user, "writemessage"),
        false,
        false
      );
    });
  } catch (e) {}
});
