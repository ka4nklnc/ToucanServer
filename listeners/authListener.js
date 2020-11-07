"use strict";

let account = require("../models/database/accountModel");
let user = require("../models/database/userModel");
let { LoginUserModel, UserModel } = require("../models/types/userModel");
let { send } = require("../helpers/senderHelper");
let auth = require("../middleware/authMiddleware");
let router = require("./_routerListener");
let {
  JSONSuccessFormat,
  JSONErrorFormat,
  JSONFormat,
} = require("../models/types/JSONFormat");
let { random, randomString } = require("../helpers/randomHelper");
const { query } = require("express");
const email = require("email-validator");
let { sendUser } = require("../helpers/senderHelper");

/**
 *
 * errors
 * 401 User not found
 * 402 Password error
 * success
 * 300 Login success
 * @param {*} ws
 */
router.get("login", false, async (ws, res) => {
  console.log("login", res);
  user.findOne(
    {
      $or: [
        { username: res.data.n },
        { email: res.data.n },
        { phone: res.data.n },
      ],
    },
    (err, userres) => {
      if (err) return; //TODO

      if ((userres == 0) | (userres == null))
        return send(ws, null, new JSONErrorFormat(401, "login"));

      account.findOne(
        {
          _id: userres.userId,
          password: res.data.password,
        },
        (err, accountres) => {
          if ((accountres == 0) | (accountres == null))
            return ws.sendCallback(new JSONErrorFormat(402, "login"));

          userres.token = ws.id;
          userres.save();

          auth.login(userres, ws);

          delete userres.onlinefollowlist;
          delete userres.follower;
          delete userres.following;

          ws.sendCallback(
            new JSONFormat(new LoginUserModel(userres), 300, "login", true)
          );
          // ws.sendCallback( new JSONFormat(ws.id, 300, "login", true));
        }
      );
    }
  );
});

router.get("relogin", false, async (ws, res) => {
  console.log("relogin", res);
  user.findOne({ userId: res.data.userId }, (err, resDb) => {
    if (!resDb) return send(ws, null, new JSONSuccessFormat("", "logouth"));

    //update new token

    if (resDb) {
      var random = randomString(150);

      if (!resDb.token) resDb.user.token = random;

      resDb.save();

      auth.login(resDb, ws);
      ws.sendCallback(
        new JSONSuccessFormat(resDb.token, "relogin"),
        false,
        false
      );

      onlinestatus(resDb.userId, true);
    }
  });
});
/**
 * format errors
 * 101 Mail format
 * 102 Phone format
 * 103 username format
 *------------------
 * check errors
 * 201 Mail check
 * 202 Phone check
 * 203 username check
 *
 * success code
 * 301 Login success
 * @param {*} ws
 */
router.get("register", false, async (ws, res) => {
  var mFormat = false,
    pFormat = false,
    uFormat = false,
    mCheck = false,
    pCheck = false,
    uCheck = false;
  //Format Control
  if ((mFormat = !mailFormat(res.data.email)))
    ws.sendCallback(new JSONErrorFormat(101, "register"));

  if ((pFormat = !phoneFormat(res.data.phone)))
    ws.sendCallback(new JSONErrorFormat(102, "register"));

  if ((uFormat = !usernameFormat(res.data.username)))
    ws.sendCallback(new JSONErrorFormat(103, "register"));

  if (!mFormat & !pFormat & !uFormat) {
    //Db Control
    if (!(mCheck = await mailCheck(res.data.email)))
      ws.sendCallback(new JSONErrorFormat(201, "register"));

    if (!(pCheck = await phoneCheck(res.data.phone)))
      ws.sendCallback(new JSONErrorFormat(202, "register"));

    if (!(uCheck = await usernameCheck(res.data.username)))
      ws.sendCallback(new JSONErrorFormat(203, "register"));
  } else return;
  if (mCheck & pCheck & uCheck) {
    let acc = new account({
      username: res.data.username,
      email: res.data.email,
      phone: res.data.phone,
      password: res.data.password,
    });

    await acc.save();
    let model = new user({
      userId: acc._id,
      username: res.data.username,
      email: res.data.email,
      phone: res.data.phone,
      profileUrl: "default",
      namesurname: res.data.namesurname,
      bio: "",
      follower: 0,
      following: 0,
      shared: 0,
      vipStatus: false,
      vipFinishTime: Date.now(),
      cloudMessagingToken: "x",
      token: ws.id,
    });

    await model.save();

    auth.login(model, ws);

    //sendUser(model.userId,new JSONFormat(model,301,"register",true))
    ws.sendCallback(
      new JSONFormat(new LoginUserModel(model), 301, "register", true)
    );
  }
  //TODO Mail ve sms gönderimi yapılacak.
});

router.get("logouth", true, async (ws, data, user) => {
  auth.logouth(ws);
  send(ws, new JSONSuccessFormat("", "logouth"));
});

router.get("mailcontrol", false, async (ws, data) => {
  let state = await mailCheck(data.data.email);

  send(ws, null, new JSONErrorFormat(201, "register", state));
});

router.get("phonecontrol", false, async (ws, data) => {
  let state = await phoneCheck(data.data.phone);

  send(ws, null, new JSONErrorFormat(202, "register", state));
});

router.get("usernamecontrol", false, async (ws, data) => {
  let state = await usernameCheck(data.data.username);

  send(ws, null, new JSONErrorFormat(203, "register", state));
});

module.exports.confirmMail = (ws, user) => {
  if (!user) return;
};

module.exports.confirmSms = (ws, user) => {
  if (!user) return;
};

module.exports.resendConfirmMail = (ws, user) => {
  if (!user) return;
};

module.exports.resendConfirmSms = (ws, user) => {
  if (!user) return;
};

module.exports.verifyConfirmMail = (ws, user) => {
  if (!user) return;
};

module.exports.verifyConfirmSms = (ws, user) => {
  if (!user) return;
};

function mailFormat(mail) {
  return email.validate(mail);
}

function phoneFormat(phone) {
  const phoneRegexp = /^\d{10}$/g;
  return phone.length == 10;
}

function usernameFormat(n) {
  return n.length < 3 ? false : true;
}

async function mailCheck(mail) {
  return (await user.find({ email: mail })) == 0 ? true : false;
}

async function phoneCheck(phone) {
  return (await user.find({ phone: phone })) == 0 ? true : false;
}

async function usernameCheck(nick) {
  return (await user.find({ username: nick })) == 0 ? true : false;
}

function onlinestatus(userId, state) {
  console.log("authlistener", "onlinestatus", "trigger");
  user.findOne({ userId: userId }, (err, resDb) => {
    console.log("authlistener", "onlinestatus", resDb.onlinefollowlist);
    resDb.onlinefollowlist.forEach((v, i) => {
      sendUser(
        v,
        new JSONFormat(userId, -1, "onlinestatus", state),
        false,
        true
      );
    });
  });
}
