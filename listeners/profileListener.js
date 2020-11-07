"use strict";
var userDb = require("../models/database/userModel");
var { LoginUserModel, UserModel, UserModelList } = require("../models/types/userModel");
var onlinestatusModel = require("../models/database/onlinestatusModel");
var {
  JSONErrorFormat,
  JSONSuccessFormat,
  JSONFormat,
} = require("../models/types/JSONFormat");
var { send, sendUser } = require("../helpers/senderHelper");
var router = require("./_routerListener");
var authMiddleware = require("../middleware/authMiddleware");
/**
 *
 * @param {*} socket
 * @param {*} user
 */
router.get("myprofile", true, (ws, res) => {
  if (ws.user == null) return console.log("User undefined");

  userDb.findOne({ userId: ws.user.userId }, (err, resDb) => {
    if (err) return console.log(err);
    console.log("myprofile", resDb);
    ws.sendCallback(new JSONSuccessFormat(new UserModel(resDb), "myprofile"));
  });
});

router.get("getprofile", true, (ws, res) => {
  if (ws.user == null) return;

  console.log("ProfileListener", "GetProfile", res);
  userDb.findOne({ userId: res.data.userId }, (err, resDb) => {
    ws.sendCallback(new JSONSuccessFormat(new UserModel(resDb), "getprofile"));
  });
});
/**
 *
 * errors
 * 301 profil güncellemesi başarısız
 * @param {*} socket
 * @param {*} user
 */

router.get("updateprofile", true, (ws, data) => {
  if (ws.user == null) return;

  userDb.updateOne(
    { _id: ws.user._id },
    {
      username: data.username,
      email: data.email,
      phone: data.phone,
      profileUrl: data.profileurl,
      namesurname: data.namesurname,
      bio: data.bio,
      cloudMessagingToken: data.cloudMessagingToken,
    },
    (err, result) => {
      if (err) send(socket, user, "updateprofile", new JSONErrorFormat(301));
      else send(socket, user, "updateprofile", new JSONSuccessFormat(result));
    }
  );
});

router.get("addonlinestatus", true, (ws, res) => {
  if (!ws.user) return;
  userDb.findOne({ userId: res.data.userId }, (err, resDb) => {
    var state = true;
    resDb.onlinefollowlist.forEach((v, i) => {
      if (v == ws.user.userId) state = false;
    });

    if (state) {
      resDb.onlinefollowlist.push(ws.user.userId);
      resDb.save();
    }
  });
});

router.get("getonlinestatus", true, (ws, res) => {
  var webSocket = authMiddleware.getLoginUser(res.data.userId);
  console.log("profileListener", "getonlinestatus", webSocket != null);
  ws.sendCallback(
    new JSONFormat(res.data.userId, -1, "getonlinestatus", webSocket != null)
  );
});

router.get("GCMToken", true, (ws, res) => {
  try {
    userDb.findOne({ userId: ws.user.userId }, (err, resDb) => {
      resDb.cloudMessagingToken = res.data.token;
      resDb.save();
    });
  } catch (e) {
    console.log("GCMTOKEN ERROR");
  }
});
/**
 * -1 kullanıcının takip edilmiyor durumu
 * 1 kullanıcı takip ediliyor durumu
 */
router.get("followingstate", true, async (ws, res) => {
  if (!ws.user) return;
  var user = await userDb.findOne({ userId: res.data.userId });

  if (!user) return;

  userDb.findOne({ userId: ws.user.userId }, (err, resDb) => {
    var state =
      resDb.followingList.map((e) => e).indexOf(res.data.userId) == -1 ? -1 : 1;

    ws.sendCallback(
      new JSONFormat(new UserModel(user), state, "followingstate", true)
    );
  });
});
/**
 * userId
 * 
 */
router.get("followorunfollow", true, async (ws, res) => {
  if (!ws.user) return;

  var user = await userDb.findOne({ userId: ws.user.userId });

  var index = user.followingList.map((e) => e).indexOf(res.data.userId);

  if (index != -1) user.followingList.splice(index, 1);
  else user.followingList.push(res.data.userId);
  user.following = user.followingList.length;

  user.save();

  ws.sendCallback(new JSONSuccessFormat(res.data.userId, "followorunfollow"));

  ///OTHER USER

  var otherUser = await userDb.findOne({ userId: res.data.userId });

  index = otherUser.followerList.map((e) => e).indexOf(ws.user.userId);

  if (index != -1) otherUser.followerList.splice(index, 1);
  else otherUser.followerList.push(ws.user.userId);
  otherUser.follower = otherUser.followerList.length;

  otherUser.save();
});


router.get("getfollower",true,async(ws,result)=>{
  if(!ws.user) return
  let userModel = await userDb.findOne({userId:result.data.userId})


  let userList = await userDb.find({userId:userModel.followerList})
  .skip(result.data.page*15)
  .limit(15)
  console.log(userList)
  ws.sendCallback(new JSONSuccessFormat(UserModelList(userList),"getfollower"))
})

router.get("getfollowing",true,async (ws,result)=>{
  if(!ws.user) return
  let userModel = await userDb.findOne({userId:result.data.userId})

  let userList = await userDb.find({userId:userModel.followingList})
  .skip(result.data.page*15)
  .limit(15)
  ws.sendCallback(new JSONSuccessFormat(UserModelList(userList),"getfollowing"))
})
