import express from "express";
import _authMiddleware from "../middleware/_auth";
import storyDb from "../../../models/database/storyDb";
import {} from "../../../models/types/storyModel";
import JDTModel from "../models/JDTModel";
import userDb from "../../../models/database/userDb";

let router = express.Router();

const pagelimit = 10;

router.get("/:page", _authMiddleware, async function(req, res) {
    console.log("story/", req.params.page);
    let storyList = await storyDb
        .find({ userid: [...req.loginyser.followingList, req.loginuser.userId] })
        .sort("-createdAt")
        .limit(pagelimit)
        .skip(req.params.page * pagelimit);
});

router.get("/:username/:page", _authMiddleware, async function(req, res) {
    console.log("story/", req.params.username, "/", req.params.page)

})