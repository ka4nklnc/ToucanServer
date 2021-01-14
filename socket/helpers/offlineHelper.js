"use strict";
let offlineModel = require("../../models/database/offlineModel");
let senderHelper = require("./senderHelper");
let {
    JSONFormat,
    JSONFormatManualmUid,
} = require("../../models/types/JSONFormat");
let authMiddleware = require("../middleware/authMiddleware");
const { db } = require("../../models/database/userDb");
let _resenddata = [];

module.exports.push = (userId, data, save) => {
    push(userId, data, save);
};

module.exports.remove = (mUid, ws) => {
    remove(mUid, ws);
};

module.exports.getDb = async(userId) => {
    var _offline = await offlineModel.findOne({ userId: userId });

    console.log(`Offline waiting message count: ${_offline.data.length}`)
    _offline.data.forEach((e) => {
        push(_offline.userId, {...e }, true);
    });

    _offline.data = [];
    _offline.save();
};

function remove(mUidOrIndex, ws) {
    var index = -1;
    var indexsub = -1;

    var index = _resenddata.findIndex(
        (x) => x != null && x.userId == ws.user.userId
    );

    if (index == -1) return;

    if (typeof mUidOrIndex === "string") {
        var indexsub = _resenddata[index]._resendList.map(v =>
            v.data.mUid).indexOf(mUidOrIndex);
    } else if (typeof mUidOrIndex === "number") {
        index = mUidOrIndex;
    }

    if (index != -1 && indexsub != -1) {
        // console.log("OfflineHelper", "remove", "mUid:" + mUidOrIndex);
        _resenddata[index]._resendList.splice(indexsub, 1);
    }
}

module.exports.disconnect = async(userId) => {
    var index = -1;
    var indexsub = -1;

    var index = _resenddata.map(v => v.userId).indexOf(userId)
    if (index == -1) return;

    var list = _resenddata[index]._resendList.filter((v) => v != null && v.save);
    list = list.map(item => item.data)

    var dbList = await offlineModel.findOne({
        userId: _resenddata[index].userId,
    });
    console.log(dbList);
    if (dbList) {
        dbList.data.push(...list);
        dbList.save();
    } else {
        var offline = offlineModel({
            userId: _resenddata[index].userId,
            data: list,
            mUid: "",
        });

        offline.save();
    }
    clearInterval(_resenddata[index].reSend);

    _resenddata.splice(index, 1);
};

function resend(userId, response) {
    var ws = authMiddleware.getLoginUser(userId);
    for (var i = 0; i < response.length; i++) {
        var model = response[i];
        if (ws != null) {
            var data = JSON.stringify(model.data)
            console.log("resend", model)
            ws.send(data);
        }
    }
}

function push(userId, data, save) {
    var model = _resenddata.filter((v, i) => {
        if (v.userId == userId) return v;
    });

    if (model.length == 0) {
        model = {
            userId,
            _resendList: [{ data, save }],
            reSend: setInterval(() => {
                if (model._resendList.length > 0)
                    resend(model.userId, model._resendList);
            }, 5000),
        };

        _resenddata.push(model);


        return;
    } else model = model[0];
    var obje = {
        data,
        save,
    };
    model._resendList.push(obje);
}