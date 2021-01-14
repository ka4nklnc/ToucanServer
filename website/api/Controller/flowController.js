import express from "express";
import _authMiddleware from "../middleware/_auth";
import flowDb from "../../../models/database/flowDb";
import { FlowModel, FlowModelList } from "../../../models/types/flowModel";
import JDTModel from "../models/JDTModel";
import userDb from "../../../models/database/userDb";
import { CommentModelList } from "../../../models/types/flowCommentModel";
import { UserModelList } from "../../../models/types/userModel";
let router = express.Router();

const pagelimit = 10;

router.get("/:page", _authMiddleware, async function(req, res) {
    console.log("flow/", req.params.page);
    let flowList = await flowDb
        .find({ userid: [...req.loginuser.followingList, req.loginuser.userId] })
        .sort("-createdAt")
        .limit(pagelimit)
        .skip(req.params.page * pagelimit);

    var resultModel = FlowModelList(flowList, req.loginuser.userId);

    for (var i = 0; i < resultModel.length; i++) {
        var userId = resultModel[i].userid;

        let user = await userDb.findOne({ userId: userId });

        resultModel[i].username = user.username;
        resultModel[i].email = user.email;
        resultModel[i].phone = user.phone;

        resultModel[i].profileurl = user.profileurl;
        resultModel[i].namesurname = user.namesurname;
        resultModel[i].bio = user.bio;
        resultModel[i].follower = user.follower;
        resultModel[i].following = user.following;
        resultModel[i].shared = user.shared;
        resultModel[i].vipstatus = user.vipstatus;
        resultModel[i].vipfinishtime = user.vipfinishtime;
    }
    res.send(JDTModel.Model(resultModel));
});

router.post("/newflow", _authMiddleware, async function(req, res) {
    console.log("flow/newflow", req.body);

    let newFlow = flowDb({
        type: req.body.type,
        userid: req.loginuser.userId,
        flowurl: req.body.flowurl,
        text: req.body.text,
        seencounter: 0,
        commentcounter: 0,
        likecounter: 0,
    });

    await newFlow.save();
    newFlow = await flowDb.findOne({ _id: newFlow._id });

    var model = new FlowModel(newFlow, req.loginuser.userId);
    model.profileurl = req.loginuser.profileurl;
    model.namesurname = req.loginuser.namesurname;

    res.send(JDTModel.Model(model));
});

router.post("/newflowcomment", _authMiddleware, async function(req, res) {
    console.log("flow/newflowcomment", req.body);
    var flowModel = await flowDb.findOne({ _id: req.body._id });

    if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

    let commentModel = {
        type: 0,
        userid: req.loginuser.userId,
        comment: req.body.comment,
    };

    flowModel.comments.push(commentModel);
    flowModel.commentcounter = flowModel.comments.length;

    await flowModel.save();

    return res.send(JDTModel.Model(commentModel));
});
/**
 * id
 * page
 * search
 */
router.get(
    "/getflowcomment/:id/:page/:search?",
    _authMiddleware,
    async function(req, res) {
        console.log(
            "flow/getflowcomment/",
            req.params.id,
            "/",
            req.params.page,
            "/",
            req.params.search
        );
        if (req.params.search) req.params.search = "";

        var flowModel = await flowDb.findOne({ _id: req.params.id });

        if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

        let whereQuery = [
            { username: { $regex: req.params.search, $options: "i" } },
            { namesurname: { $regex: req.params.search, $options: "i" } },
        ];

        let userIdMapList = flowModel.comments.map((e) => e.userid);

        let userModelList = await userDb
            .find({ userId: userIdMapList, $or: where })
            .limit(pagelimit)
            .skip(req.params.page * pagelimit);

        let returnModel = CommentModelList(userModelList, flowModel.comments);

        res.send(JDTModel.Model(returnModel));
    }
);
/**
 * _id
 */
router.post("/likeflow", _authMiddleware, async function(req, res) {
    console.log("flow/likeflow", req.body);

    let flowModel = await flowDb.findOne({ _id: req.body._id });

    if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

    let likeIndex = flowModel.likes
        .map((e) => e.userid)
        .indexOf(req.loginuser.userId);
    if (likeIndex == -1) flowModel.likes.push({ userid: req.loginuser.userId });
    else
        flowModel.likes = flowModel.likes.filter(
            (e) => e.userid != req.loginuser.userId
        );

    flowModel.likecounter = flowModel.likes.length;

    await flowModel.save();

    res.send(JDTModel.Model(null, likeIndex != -1));
});

/**
 * _id
 */
router.get(
    "/likeflow/:id/:page/:search?",
    _authMiddleware,
    async function(req, res) {
        console.log("flow/likeflow/", req.params.page);
        if (req.params.search) req.params.search = "";
        let flowModel = await flowDb.findOne({ _id: req.params._id });

        if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

        let whereQuery = [
            { username: { $regex: req.params.search, $options: "i" } },
            { namesurname: { $regex: req.params.search, $options: "i" } },
        ];

        let userIdList = flowModel.likes.map((e) => e.userid);

        let userModelList = await userDb
            .find({ userId: userIdList, $or: whereQuery })
            .limit(pagelimit);
        skip(req.params.page * pagelimit);

        let resultModel = new LikeModelList(
            userModelList,
            flowModel.likes,
            req.loginuser
        );

        res.send(JDTModel.Model(resultModel));
    }
);

/**
 * id
 * page
 * search
 */
router.get(
    "/seenflow/:id/:page/:search?",
    _authMiddleware,
    async function(req, res) {
        console.log(
            "flow/seenflow/",
            req.params.id,
            "/",
            req.params.page,
            "/",
            req.params.search
        );
        if (req.params.search) req.params.search = "";
        let flowModel = await flowDb.findOne({
            _id: req.params.id,
            userid: req.loginuser.userId,
        });

        if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

        let whereQuery = [
            { username: { $regex: req.params.search } },
            { namesurname: { $regex: req.params.search } },
        ];

        let userList = await userDb
            .find({ userId: flowModel.seens, $or: whereQuery })
            .limit(pagelimit)
            .skip(req.params.page * pagelimit);

        let userModelList = UserModelList(userList);

        res.send(JDTModel.Model(userModelList));
    }
);

/**
 * _id
 */
router.post("/seenflow", _authMiddleware, async function(req, res) {
    console.log("flow/seenflow", req.body);

    let flowModel = await flowDb.findOne({ _id: req.body._id });

    if (!flowModel) return res.send(JDTModel.Model(null, false, 403));

    let seenIndex = flowModel.seens.map((e) => e).indexOf(req.loginuser.userId);

    if (seenIndex == -1) {
        flowModel.seens.push(req.loginuser.userId);
        flowModel.seencounter = flowModel.seens.length;

        await flowModel.save();
    }

    res.send(JDTModel.Model());
});

module.exports = router;