"use strict";
let WebSocket = require("ws");
let authMiddleware = require("../middleware/authMiddleware");
let offlineHelper = require("./offlineHelper");
let offlineModel = require("../../models/database/offlineModel");
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
    if (resend && user != null) offlineHelper.push(user.userId, data, offlinesave);
};

module.exports.sendUser = async(
    user,
    data,
    offlinesave = false,
    resend = true
) => {
    //TODO Offline db ye yazılacak
    let websocket;
    do {
        if (typeof user == "string") websocket = authMiddleware.getLoginUser(user);
        else websocket = authMiddleware.getLoginUser(user.userId);

        // console.log(data)
        // console.log(
        //   "SenderHelper",
        //   "sendUser",
        //   websocket != null ? "User found" : "User Not Found"
        // );
        let json = JSON.stringify(data);
        let mUid = data.mUid;

        //Kullanıcının websocket bağlantısı aktif ise gönder.
        if (websocket) {
            console.log('SenderHelper', websocket.user.username, data.path, data.mUid)
                //Mesajı gönder.
            websocket.send(json);

            //Kullanıcı mesajı alana kadar ilet.
            if (resend) offlineHelper.push(websocket.user.userId, data, offlinesave);

            //Eğer mesaj çevrimdışı olarak kaydedilecekse.
            else if (offlinesave && json != "{}") {

                //Kullanıcı online değilse çevrimdışı mesajlarına kaydet.
                var offlineDb = await offlineModel.findOne({ userId: user.userId });

                if (offlineDb) {
                    offlineDb.data.push(data);
                    offlineDb.save();
                } else {
                    //kullanıcının daha önce kaydedilmiş çevrimdışı mesajı yoksa yeni oluştur.
                    var db = offlineModel({ userId: user.userId, data: [data] });
                    db.save();
                }
                console.log("Offline Db Push:", data.path, "User:", user.username)
            }
            return;
        }
        //Kullanıcı online değilse ve mesajı eğer çevrimdışı olarak kaydedilecekse.
        else if (offlinesave && json != "{}") {
            var offlineDb = await offlineModel.findOne({ userId: user.userId });

            if (offlineDb) {
                offlineDb.data.push(data);
                offlineDb.save();
            } else {
                var db = offlineModel({ userId: user.userId, data: [data] });
                db.save();
            }
            console.log("Offline Db Push:", data.path, "User:", user.username)

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
    sending.forEach(async(v, i) => {
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