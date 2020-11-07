"use strict";
let offline = require("../models/database/offlineModel");
let senderHelper = require("./senderHelper");
let {
  JSONFormat,
  JSONFormatManualmUid,
} = require("../models/types/JSONFormat");
let authMiddleware = require("../middleware/authMiddleware");
let _resenddata = [];

module.exports.push = (userId, data, save) => {
  var model = {
    userId,
    data: Object.create(data),
    save,
  };
  _resenddata.push(model);
};

module.exports.remove = (mUid, ws) => {
  remove(mUid, ws);
};

module.exports.getDb = (userId) => {
  offline.find({ userId: userId }, (err, resDb) => {
    console.log("OfflineHelper", "User Offline Data Count:" + resDb.length);
    resDb.forEach((v, i) => {
      //v.remove();
      var model = JSON.parse(v.data);
      console.log("OfflineHelper", "DB data", model.data);
     

      _resenddata.push({
        userId: v.userId,
        data: new JSONFormatManualmUid(
          v.mUid,
          model.data,
          model.errorCode,
          model.path,
          model.state
        ),
      });
    });
  });
};

function remove(mUidOrIndex, ws) {
  var index = -1;
  if (typeof mUidOrIndex === "string") {
    index = _resenddata
      .map(function(e) {
        if (e.data != null) return e.data.mUid;
      })
      .indexOf(mUidOrIndex);

    //Db Remove
    if (ws != null && ws.user != null && ws.user.userId != null)
      offline.find({ mUid: mUidOrIndex, userId: ws.user.userId }, function(
        err,
        resDb
      ) {
        resDb.forEach((v, i) => {
          v.remove();
        });
      });
  } else if (typeof mUidOrIndex === "number") {
    index = mUidOrIndex;
  }

  if (index != -1) {
    console.log("OfflineHelper", "remove", "mUid:" + mUidOrIndex);
    _resenddata.splice(index, 1);
  }
}

///OFFLINE DB SAVE TIMER
setInterval(function() {
  return;
  _resenddata.forEach((v, i) => {
    var dbSaveStatus = "";
    if (v != null && v.ws != null && v.ws.user != null && v.save) {
      var db = offline({
        userId: v.ws.user.userId,
        data: JSON.stringify(v.data),
        mUid: v.data.mUid,
      });
      db.save();
      dbSaveStatus = "Dbsave and ";
    }
    remove(
      _resenddata
        .map(function(e) {
          if (e != null && e.data != null && e.data.mUid != null)
            return e.data.mUid;
        })
        .indexOf(v.data.mUid)
    );

    console.log(
      "OfflineHelper",
      "_resend " + dbSaveStatus + " Clear. Waiting:",
      _resenddata.length,
      Date()
    );
  });
}, 10000);

///RESEND
setInterval(function() {
  console.log("RESEND",_resenddata.length)
  _resenddata.forEach((v, i) => {
    
    var ws = authMiddleware.getLoginUser(v.userId);

    if (JSON.stringify(v.data) == "{}") _resenddata.splice(i, 1);
    if (JSON.stringify(v.data) != "{}" && ws != null)
      ws.send(JSON.stringify(v.data));
  });
}, 5000);
