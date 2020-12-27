"use strict";
const e = require("cors");
let storyDb = require("../../models/database/storyModel");
let userDb = require("../../models/database/userModel");
let {
    JSONErrorFormat,
    JSONSuccessFormat,
    JSONFormat,
} = require("../../models/types/JSONFormat");
let { StoryModel, StoryModelList } = require("../../models/types/storyModel");
let router = require("./_routerListener");
let pagelimit = 15;

router.get("getuserstory", true, async(ws, result) => {
    if (!ws.user) return;
    let list = await storyDb
        .find({ userId: result.data.user })
        .limit(pagelimit)
        .skip(0);

    console.log(list)
    ws.sendCallback(
        new JSONFormat(StoryModelList(list, [ws.user], ws.user.userId), result.data.page, "getmystory", true)
    );
});

router.get("getstory", true, async(ws, result) => {
    if (!ws.user) return;

    let user = await userDb.findOne({ userId: ws.user.userId });

    let list = await storyDb
        .find({ userId: [...user.followingList, ws.user.userId] })
        .limit(pagelimit)
        .skip(result.data.page * pagelimit);


    let userIds = list.map((e) => e.userId);

    let users = await userDb.find({ userId: userIds });

    ws.sendCallback(
        new JSONFormat(
            StoryModelList(list, users, ws.user.userId),
            result.data.page,
            "getstory",
            true
        )
    );
});

router.get("addstory", true, async(ws, result) => {
    if (!ws.user) return;

    let story = await storyDb.findOne({ userId: ws.user.userId });
    console.log("addstory", story);
    let shared = {
        type: result.data.type,
        storyurl: result.data.storyurl,
        caption: result.data.caption,
    };

    if (story) story.sharedList.push(shared);
    else
        story = new storyDb({
            type: result.data.type,
            userId: ws.user.userId,
            storyurl: result.data.storyurl,
            caption: result.data.caption,
            sharedList: [shared],
        });

    await story.save();

    ws.sendCallback(new JSONSuccessFormat(story, "addstory"));
});

router.get("updatestory", true, (ws, data, user) => {
    let story = storyModel.updateOne({ _id: data._id, userId: user._id }, {
        type: data.type,
        storyUrl: data.storyUrl,
    });

    send(socket, user, "updatestory", new JSONSuccessFormat(story));
});

router.get("deletestory", true, (ws, data, user) => {
    let story = storyModel.updateOne({
        _id: data_id,
        userId: user._id,
    }, {
        isDeleted: true,
    });

    send(socket, user, "deletestory", new JSONSuccessFormat(data._id));
});

router.get("seenstory", true, async(ws, result) => {
    if (!ws.user) return;

    let storyModel = await storyDb.findOne({ _id: result.data._id });

    let sharedIndex = storyModel.sharedList
        .map((e) => e._id)
        .indexOf(result.data.shared_id);

    let seenIndex = storyModel.sharedList[sharedIndex].seenList
        .map((e) => e.userId)
        .indexOf(ws.user.userId);

    if (seenIndex == -1)
        storyModel.sharedList[sharedIndex].seenList.push({
            userId: ws.user.userId,
        });
    storyModel.sharedList[sharedIndex].seencounter =
        storyModel.sharedList[sharedIndex].seenList.length;

    await storyModel.save();
});

router.get("likestory", true, async(ws, result) => {
    if (!ws.user) return;

    let storyModel = await storyDb.findOne({ _id: result.data._id });

    let sharedIndex = storyModel.sharedList
        .map((e) => e._id)
        .indexOf(result.data.shared_id);

    let likeIndex = storyModel.sharedList[sharedIndex].likeList
        .map((e) => e.userId)
        .indexOf(ws.user.userId);

    if (likeIndex == -1) {
        storyModel.sharedList[sharedIndex].likeList.push({
            userId: ws.user.userId,
        });
    } else {
        storyModel.sharedList[sharedIndex].likeList.splice(likeIndex, 1);
    }

    storyModel.sharedList[sharedIndex].likecounter = storyModel.sharedList[sharedIndex].likeList.length

    await storyModel.save();

});