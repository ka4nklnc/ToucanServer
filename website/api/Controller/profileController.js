import express from 'express'
import _authMiddleware from '../middleware/_auth'
import JDT from '../models/JDTModel'
import userDb from '../../../models/database/userDb'
import storyDb from '../../../models/database/storyDb'
import flowDb from '../../../models/database/flowDb'

import { StoryModel, StoryModelList } from '../../../models/types/storyModel'
import accountDb from '../../../models/database/accountDb'
import JDTModel from '../models/JDTModel'

import FormatControl from '../Helpers/FormatHelper'
import CheckerControl from '../Helpers/CheckerHelper'
import { FlowModelList } from '../../../models/types/flowModel'

let router = express.Router();

const pagelimit = 10;

router.get("/:username", _authMiddleware, async function(req, res) {
        console.log("profile/", req.params.username)
        let userModel = await userDb.findOne({
            username: req.params.username
        })
        res.send(JDT.Model(userModel))
    })
    /**
     * namesurname
     * username
     * email
     * phone
     */
router.post("/update", _authMiddleware, async function(req, res) {
    console.log("profile/update", req.body)
        //Format Control Start

    if (FormatControl.mailFormat(req.body.email))
        return res.send(JDTModel.Model(null, false, 601))
    if (FormatControl.usernameFormat(req.body.username))
        return res.send(JDTModel.Model(null, false, 602))

    if (FormatControl.phoneFormat(req.body.phone))
        return res.send(JDTModel.Model(null, false, 603))
            //Format Control End

    //Checker Control Start

    if (await CheckerControl.emailControl(req.body.email, req.loginuser.userId))
        return res.send(JDTModel.Model(null, false, 604))
    if (await CheckerControl.phoneControl(req.body.phone, req.loginuser.userId))
        return res.send(JDTModel.Model(null, false, 605))
    if (await CheckerControl.usernameControl(req.body.username, req.loginuser.userId))
        return res.send(JDTModel.Model(null, false, 606))

    //Checker Control End

    //UserSettings Save Start
    let myAccountModel = await accountDb.findOne({ _id: req.loginuser.userId })
    let myUserModel = await userDb.findOne({ userId: req.loginuser.userId })

    console.log(myAccountModel, myUserModel)

    if (myAccountModel && myUserModel) {
        myAccountModel.email = req.body.email
        myAccountModel.phone = req.body.phone
        myAccountModel.username = req.body.username
        await myAccountModel.save()

        myUserModel.email = req.body.email
        myUserModel.phone = req.body.phone
        myUserModel.username = req.body.username
        await myUserModel.save()


        return res.send(JDTModel.Model(myUserModel))
    } else
        return res.send(JDTModel.Model(null, false, 406))

    //UserSettings Save End

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
        console.log(userModel)
        let flowList = await flowDb.find({
                userid: userModel.userId
            }).limit(pagelimit)
            .skip(pagelimit * req.params.page);

        console.log(flowList)
        let resultModel = FlowModelList(flowList, req.loginuser.userId)

        res.send(JDT.Model(resultModel))

    })
    /**
     * username
     */
router.get("/followstate/:username", _authMiddleware, async function(req, res) {
    var user = await userDb.findOne({ username: req.params.username });

    if (!user) return res.send(JDTModel.Model(null, false, 404))

    var state = req.loginuser.followingList.indexOf(user.userId) == -1 ? false : true;

    res.send(JDTModel.Model(state))
})

router.post("/follow", _authMiddleware, async function(req, res) {
    var user = await userDb.findOne({ username: req.params.username });

    if (!user) return res.send(JDTModel.Model(null, false, 404))

    let indexFollowing = req.loginuser.followingList.indexOf(user.userId)

    if (indexFollowing != -1) req.loginuser.followingList.splice(indexFollowing, 1)
    else req.loginuser.followingList.push(user.userId)
    req.loginuser.following = req.loginuser.followingList.length;

    await req.loginuser.save()

    res.send(JDTModel.Model(user.userId))
        /// Other User

    indexFollowing = user.followerList.indexOf(req.loginuser.userId)

    if (indexFollowing != -1) user.followerList.splice(indexFollowing)
    else user.followerList.push(req.loginuser.userId)
    user.follower = user.followerList.length

    await user.save()
})

router.get("/followerlist/:username/:page", _authMiddleware, async function(req, res) {

})

router.get("/followinglist/:username/:page")

module.exports = router;