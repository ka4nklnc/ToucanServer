"use strict";
let { send, sendUser } = require("../helpers/senderHelper");
let {
    JSONErrorFormat,
    JSONSuccessFormat,
    JSONFormat,
} = require("../../models/types/JSONFormat");
let chatModel = require("../../models/database/chatModel");
let userModel = require("../../models/database/userDb");
let router = require("./_routerListener");
let gcm = require("../../models/types/pushnotiHelper");
const { ObjectId } = require("mongodb");

/**
 *
 * receiveuid
 * message
 * fileurl
 * filetype
 * id
 */

router.get("message", true, async(ws, res) => {
    if (!ws.user) return;
    var user = await userModel.findOne({ userId: res.data.receiveuid });

    var date = new Date();
    date.setDate(date.getDate() - 1); //-1 DAYS

    var chat = await chatModel.findOne({
        senderdbid: res.data.id,
        createat: { $gte: date },
    });
    if (!chat) {
        chat = new chatModel({
            senderdbid: res.data.id,
            senderuid: ws.user.userId,
            receiveuid: user.userId,
            message: res.data.message,
            messagestatus: 0,
            fileurl: res.data.fileurl,
            filetype: res.data.filetype,
        });
        await chat.save();
        //Receive
        setTimeout(function() {
            sendUser(
                user,
                new JSONSuccessFormat({
                        createat: chat.createat,
                        isdeleted: false,
                        messagestatus: 0,
                        _id: chat._id,
                        senderuid: chat.senderuid,
                        receiveuid: chat.receiveuid,
                        message: chat.message,
                        fileurl: chat.fileurl,
                        filetype: chat.filetype,
                        id: 0,
                    },
                    "message"
                ),
                true
            );

            var data = {
                createat: chat.createat,
                isdeleted: false,
                messagestatus: 0,
                _id: chat._id,
                senderuid: chat.senderuid,
                receiveuid: chat.receiveuid,
                message: chat.message,
                fileurl: chat.fileurl,
                filetype: chat.filetype,
                id: 0,
            };
            gcm.sendNoti(user.cloudmessagingtoken, new gcm.Model("message", data));
        }, 1000);
    }
    setTimeout(function() {
        sendUser(
            ws.user,
            new JSONSuccessFormat({
                    createat: chat.createat,
                    isdeleted: false,
                    messagestatus: 0,
                    _id: chat._id,
                    senderuid: chat.senderuid,
                    receiveuid: chat.receiveuid,
                    message: chat.message,
                    fileurl: chat.fileurl,
                    filetype: chat.filetype,
                    id: res.data.id,
                },
                "message"
            ),
            true
        );

        //Sender
        // ws.sendCallback(
        //     new JSONSuccessFormat({
        //             createat: chat.createat,
        //             isdeleted: false,
        //             messagestatus: 0,
        //             _id: chat._id,
        //             senderuid: chat.senderuid,
        //             receiveuid: chat.receiveuid,
        //             message: chat.message,
        //             fileurl: chat.fileurl,
        //             filetype: chat.filetype,
        //             id: res.data.id,
        //         },
        //         "message"
        //     ),
        //     true,
        //     true
        // );
    }, 1000);
});

router.get("updatemessage", true, async(ws, res) => {
    chatModel.findOne({
            _id: ObjectId(res.data._id),
            senderuid: ws.user.userId,
            receiveuid: res.data.receiveuid,
        },
        async(err, resDb) => {
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
            sendUser(
                res.data.receiveuid,
                new JSONSuccessFormat(resDb, "updatemessage")
            );
        }
    );
});

router.get("deletemessage", true, (ws, data, user) => {
    chatModel.updateOne({
            _id: data._id,
            senderId: user._id,
        }, {
            isDeleted: true,
        },
        (err, res) => {
            if (err) return; //TODO ERROR MESSAGE

            send(socket, user, "deletemessage", new JSONSuccessFormat(res));
            sendUser(user, "deletemessage", new JSONSuccessFormat(res));
        }
    );
});

router.get("statuschangemessage", true, async(ws, res) => {
    console.log("statusMessage", res);
    if (!ws.user) return;

    var message_ids = [];
    for (var i = 0; i < res.data._id.length; i++) {
        var id = res.data._id[i];

        var message = await chatModel.findOne({
            _id: id,
            receiveuid: ws.user.userId,
            senderuid: res.data.senderuid,
            messagestatus: { $lt: res.data.messagestatus },
        });
        if (message) {
            await message.update({ messagestatus: res.data.messagestatus });
            message.save();
            console.log("pushed message status id", id);
            message_ids.push(id);
        }
    }

    if (message_ids.length > 0) {
        var returnModel = {
            receiveuid: ws.user.userId,
            senderuid: res.data.senderuid,
            messagestatus: res.data.messagestatus,
            _id: message_ids,
        };

        sendUser(
            ws.user,
            new JSONSuccessFormat(returnModel, "statuschangemessage"),
            true,
            true
        );

        sendUser({ userId: res.data.senderuid },
            new JSONSuccessFormat(returnModel, "statuschangemessage"),
            true,
            true
        );
    } else {
        console.log("Not have status message");
    }
});

router.get("writemessage", true, async(ws, res) => {
    if (!ws.user) return;
    try {
        var userModel = await userModel.findOne({ userId: res.data.userId });

        var user = {...ws.user._doc, writing: res.data.writing };
        console.log("chatlistener", "writemessage", user);
        sendUser(
            userModel,
            new JSONSuccessFormat(user, "writemessage"),
            false,
            false
        );
    } catch (e) {}
});