import express from "express";
import userDb from "../../../models/database/userDb";
import _authMiddleware from "../middleware/_auth";
import JDTModel from "../models/JDTModel";
let router = express.Router();

let pagelimit = 15;

router.get("/:page/:search?", _authMiddleware, async function(req, res) {
    console.log(req.params);
    if (!req.params.search) req.params.search = "";
    let whereQuery = [
        { username: { $regex: req.params.search, $options: "i" } },
        { namesurname: { $regex: req.params.search, $options: "i" } },
    ];

    let suffleList = await userDb
        .find({ $or: whereQuery })
        .sort({ vipstatus: -1, "onlinestatus.lastonline": -1 })
        .limit(pagelimit)
        .skip(req.params.page * pagelimit);

    if (!suffleList) return res.send(JDTModel.Model([]));

    let list = convertUserToSuffle(suffleList, req.loginuser);
    res.send(JDTModel.Model(list));
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

module.exports = router;