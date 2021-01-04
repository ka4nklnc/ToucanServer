import express from 'express'
import _authMiddleware from '../middleware/_auth'
import JDT from '../models/JDTModel'
import userDb from '../../models/database/userDb'
import storyDb from '../../models/database/storyDb'
import flowDb from '../../models/database/flowDb'

import { StoryModel, StoryModelList } from '../../models/types/storyModel'

let router = express.Router();

const pagelimit = 10;

router.get("/:username", _authMiddleware, async function(req, res) {
    console.log("profile/", req.params.username)
    let userModel = await userDb.findOne({
        username: req.params.username
    })
    res.send(JDT.Model(userModel))
})

router.post("/uploadprofilephoto", _authMiddleware, async function(req, res) {
    console.log("profile/uploadprofilephoto", req.body)
    req.loginuser.profileurl = req.body.profileurl;
    await req.loginuser.save();

    res.send(JDT.Model(req.loginuser))
})

router.post("/uploadcoverphoto", _authMiddleware, async function(req, res) {
    console.log("profile/uploadcoverphoto", req.body)
    req.loginuser.coverurl = req.body.coverurl;
    await req.loginuser.save()

    res.send(JDT.Model(req.loginuser))
})


router.get("/story/:username/:page", _authMiddleware, async function(req, res) {

    console.log("profile/story/", req.params.username, '/', req.params.page)

    let userModel = await userDb.findOne({
        username: req.params.username
    })

    let storyList = await storyDb.find({
            userId: userModel.userId
        }).limit(pagelimit)
        .skip(pagelimit * req.params.page);


    let resultModel = StoryModelList(storyList, [userModel], req.loginuser.userId)

    res.send(JDT.Model(resultModel))

})

router.get("/flow/:username/:page", _authMiddleware, async function(req, res) {

    console.log("profile/flow/", req.params.username, '/', req.params.page)

    let userModel = await userDb.findOne({
        username: req.params.username
    })

    let flowList = await flowDb.find({
            userId: userModel.userId
        }).limit(pagelimit)
        .skip(pagelimit * req.params.page);


    let resultModel = StoryModelList(flowList, [userModel], req.loginuser.userId)

    res.send(JDT.Model(resultModel))

})

module.exports = router;