"use strict";
let userModel = require("../../models/database/userModel");
let { send } = require("../helpers/senderHelper");
let {
    JSONErrorFormat,
    JSONSuccessFormat,
    JSONFormat,
} = require("../../models/types/JSONFormat");
let router = require("./_routerListener");
let pagelimit = 15;

/**
 * success
 * errorCode is page
 *
 * error codes
 *
 */
router.get("getsuffle", true, async(ws, res) => {
    if (ws.user == null) return console.log("getsuffle", "ERROR User Null");

    let where = [
        { username: { $regex: res.data.search, $options: "i" } },
        { namesurname: { $regex: res.data.search, $options: "i" } },
    ];

    let suffleList = await userModel
        .find({ $or: where })
        .sort({ vipstatus: -1, lastseen: -1 })
        .limit(pagelimit)
        .skip(res.data.page * pagelimit);

    if (!suffleList) return;

    var list = convertUserToSuffle(suffleList, ws.user);

    ws.sendCallback(new JSONFormat(list, res.data.page, "getsuffle", true));

});

function convertUserToSuffle(_list, user) {
    var list = [];
    for (var i = 0; i < _list.length; i++) {
        var model = _list[i];
        if (model.userId != user.userId)
            list.push({
                username: model.username,
                uid: model.userId,
                namesurname: model.namesurname,
                profileurl: model.profileurl,
                coverurl: model.coverurl,
                lastseen: model.lastseen,
                liveenum: 0,
                vipstatus: model.vipStatus,
                vipfinishtime: model.vipFinishTime,
            });
    }

    return list;
}