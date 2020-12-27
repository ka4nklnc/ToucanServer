"use strict";
let router = require("./_routerListener");
let userDb = require("../../models/database/userModel");
let flowDb = require("../../models/database/flowModel");
const { JSONSuccessFormat, JSONFormat } = require("../../models/types/JSONFormat");
const { FlowModel, FlowModelList } = require("../../models/types/flowModel");
const userModel = require("../../models/database/userModel");
const { UserModelList } = require("../../models/types/userModel");
const { CommentModelList } = require("../../models/types/flowCommentModel");
const { LikeModelList } = require("../../models/types/flowLikeModel");
const pagelimit = 3;

router.get("getuserflow", true, async(ws, result) => {
    if (!ws.user) return;

    let flowList = await flowDb
        .find({ userid: ws.user.userId })
        .sort("-createdAt")
        .limit(10)
        .skip(result.data.page * 10);

    var list = FlowModelList(flowList, ws.user.userId);

    for (var i = 0; i < list.length; i++) {
        var userId = list[i].userid;

        let user = await userDb.findOne({ userId: userId });

        list[i].username = user.username;
        list[i].email = user.email;
        list[i].phone = user.phone;

        list[i].profileurl = user.profileurl;
        list[i].namesurname = user.namesurname;
        list[i].bio = user.bio;
        list[i].follower = user.follower;
        list[i].following = user.following;
        list[i].shared = user.shared;
        list[i].vipstatus = user.vipstatus;
        list[i].vipfinishtime = user.vipfinishtime;
    }
    ws.sendCallback(new JSONFormat(list, result.data.page, "getuserflow", true));

});

router.get("getflow", true, async(ws, result) => {
    if (!ws.user) return;
    let user = await userDb.findOne({ userId: ws.user.userId });
    let array = [...user.followingList, ws.user.userId]
    let flowList = await flowDb
        .find({ userid: { $in: array } })
        .sort("-createdAt")
        .limit(pagelimit)
        .skip(result.data.page * pagelimit);

    var list = FlowModelList(flowList, ws.user.userId);

    for (var i = 0; i < list.length; i++) {
        var userId = list[i].userid;

        let user = await userDb.findOne({ userId: userId });

        list[i].username = user.username;
        list[i].email = user.email;
        list[i].phone = user.phone;

        list[i].profileurl = user.profileurl;
        list[i].namesurname = user.namesurname;
        list[i].bio = user.bio;
        list[i].follower = user.follower;
        list[i].following = user.following;
        list[i].shared = user.shared;
        list[i].vipstatus = user.vipstatus;
        list[i].vipfinishtime = user.vipfinishtime;
    }
    ws.sendCallback(new JSONFormat(list, result.data.page, "getflow", true));
});

router.get("addflow", true, async(ws, result) => {
    if (!ws.user) return;
    let user = await userDb.findOne({ userId: ws.user.userId });

    let flowModel = flowDb({
        type: result.data.type,
        userid: ws.user.userId,
        flowurl: result.data.flowurl,
        text: result.data.text,
        seencounter: 0,
        commentcounter: 0,
        likecounter: 0,
    });

    await flowModel.save();
    flowModel = await flowDb.findOne({ _id: flowModel._id });

    var model = new FlowModel(flowModel, user.userId);
    model.profileurl = user.profileurl;
    model.namesurname = user.namesurname;
    ws.sendCallback(new JSONSuccessFormat(model, "addflow"));
});
router.get("updateflow", true, (ws, result) => {});
router.get("deleteflow", true, (ws, result) => {});
/**
 * page
 * _id
 * search
 */
router.get("getflowcomment", true, async(ws, result) => {
    var flowModel = await flowDb.findOne({ _id: result.data._id });

    if (!flowModel) return;

    let where = [
        { username: { $regex: result.data.search, $options: "i" } },
        { namesurname: { $regex: result.data.search, $options: "i" } },
    ];
    var useridlist = flowModel.comments.map((e) => e.userid);

    var users = await userDb
        .find({ userId: useridlist, $or: where })
        .limit(20)
        .skip(result.data.page * 20);

    ws.sendCallback(
        new JSONFormat(
            CommentModelList(users, flowModel.comments),
            result.data.page,
            "getflowcomment",
            true
        )
    );
});
router.get("addflowcomment", true, async(ws, result) => {
    var flowModel = await flowDb.findOne({ _id: result.data._id });

    if (!flowModel) return;

    var commentModel = {
        type: 0,
        userid: ws.user.userId,
        comment: result.data.comment,
    };
    console.log("addflowcomment", flowModel.comments);
    flowModel.comments.push(commentModel);
    flowModel.commentcounter = flowModel.comments.length;
    await flowModel.save();

    ws.sendCallback(new JSONSuccessFormat("addflowcomment", commentModel));
});
router.get("updateflowcomment", true, (ws, result) => {});
router.get("deleteflowcomment", true, (ws, result) => {});
router.get("likeflow", true, async(ws, result) => {
    if (!ws.user) return;

    var flowModel = await flowDb.findOne({ _id: result.data._id });

    if (!flowModel) return;

    var index = flowModel.likes.map((e) => e.userid).indexOf(ws.user.userId);
    if (index == -1) flowModel.likes.push({ userid: ws.user.userId });
    else
        flowModel.likes = flowModel.likes.filter((e) => e.userid != ws.user.userId);

    flowModel.likecounter = flowModel.likes.length;

    await flowModel.save();

    console.log("flowListener", "likeflow", index);

    ws.sendCallback(new JSONFormat("", -1, "likeflow", index != -1));
});
router.get("getlikeflow", true, async(ws, result) => {
    var flowModel = await flowDb.findOne({ _id: result.data._id });

    if (!flowModel) return;

    let where = [
        { username: { $regex: result.data.search, $options: "i" } },
        { namesurname: { $regex: result.data.search, $options: "i" } },
    ];

    var useridlist = flowModel.likes.map((e) => e.userid);

    var users = await userDb
        .find({ userId: useridlist, $or: where })
        .limit(20)
        .skip(result.data.page * 20);

    var myuser = await userDb.findOne({ userId: ws.user.userId });

    ws.sendCallback(
        new JSONFormat(
            new LikeModelList(users, flowModel.likes, myuser), -1,
            "getlikeflow",
            true
        )
    );
});

router.get("seenflow", true, async(ws, result) => {
    if (!ws.user) return;

    var flowModel = await flowDb.findOne({ _id: result.data._id });

    if (!flowModel) return;

    var index = flowModel.seens.map((e) => e).indexOf(ws.user.userId);
    if (index == -1) {
        flowModel.seens.push(ws.user.userId);
        flowModel.seencounter = flowModel.seens.length;

        flowModel.save();
    }
});
/**
 * page
 * _id
 * search
 */
router.get("getseenflow", true, async(ws, result) => {
    if (!ws.user) return;

    var flowModel = await flowDb.findOne({
        _id: result.data._id,
        userid: ws.user.userId,
    });

    let where = [
        { username: { $regex: result.data.search } },
        { namesurname: { $regex: result.data.search } },
    ];

    var users = await userDb
        .find({ userId: flowModel.seens, $or: where })
        .limit(20)
        .skip(result.data.page * 20);

    ws.sendCallback(
        new JSONFormat(UserModelList(users), result.data.page, "getseenflow", true)
    );
});