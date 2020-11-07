"use strict";
//JSONFormat
let {
  JSONErrorFormat,
  JSONSuccessFormat,
} = require("../models/types/JSONFormat");
let router = [];
//helpers
let { send, sendUser } = require("../helpers/senderHelper");

//middlewares
let authMiddleware = require("../middleware/authMiddleware");

//controllers
module.exports.manager = function(ws, response) {
  router.forEach((v, i) => {
    if (response.path == v.path) {
      if (v.auth) {
        sendmUid(ws,response);

        callBack(ws, response,v);
        return;
      } else {
        v.callback(ws, response);
        sendmUid(ws,response);
      }
    }
  });
};

module.exports.get = (path, auth, callback) => {
  router.push({ path, auth, callback: callback });
};

function callBack(ws, response,v) {
  var user = authMiddleware.isLogin(ws);
  
  if (!user) {
   return send(ws, null, new JSONErrorFormat(0, "relogin"));
  } else v.callback(ws, response, user);
}

function sendmUid(ws,response) {
  if (response.path != "mUid")
    send(ws, null, new JSONSuccessFormat(response.mUid, "mUid"), false, false);
}

//Listeners
require("./authListener");
require("./chatListener");
require("./flowListener");
require("./storyListener");
require("./suffleListener");
require("./profileListener");
require("./deliveryListener");
