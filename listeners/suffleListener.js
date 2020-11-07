"use strict";
let userModel = require("../models/database/userModel");
let { send } = require("../helpers/senderHelper");
let {
  JSONErrorFormat,
  JSONSuccessFormat,
  JSONFormat,
} = require("../models/types/JSONFormat");
let router = require("./_routerListener");
let pagelimit = 15;

/**
 * success
 * errorCode is page
 *
 * error codes
 *
 */
router.get("getsuffle", true, (ws, res) => {
  if(ws.user == null) return console.log("getsuffle","ERROR User Null");
  console.log("GetSuffle",res.data.page);
  userModel
    .find({}, (err, resDb) => {
      console.log("suffleListener", "getsuffle", resDb.length);
      var list = convertUserToSuffle(resDb, ws.user);
      ws.sendCallback(new JSONFormat(list, res.data.page, "getsuffle", true));
    })
    .sort({ vipstatus: -1, lastseen: -1 })
    .limit(pagelimit)
    .skip(res.data.page * pagelimit);
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
        profileURL: model.profileUrl,
        lastseen: model.lastseen,
        liveenum: 0,
        vipstatus: model.vipStatus,
        vipfinishtime: model.vipFinishTime
      });
  }

  return list;
}
