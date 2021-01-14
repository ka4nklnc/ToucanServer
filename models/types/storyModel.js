var userDb = require("../database/userDb");

module.exports.StoryModel = function(storyModel, userId) {
    this._id = storyModel._id;
    this.createdAt = storyModel.createdAt;
    this.type = storyModel.type;
    this.userid = storyModel.userid;
    this.flowurl = storyModel.flowurl;
    this.text = storyModel.text;
    this.seencounter = storyModel.seencounter;
    this.commentcounter = storyModel.commentcounter;
    this.likecounter = storyModel.likecounter;
    this.comments = storyModel.comments.filter((model) => model.userid == userId);
    this.liked = storyModel.likes.indexOf(userId) != -1;
    this.seen = storyModel.seens.indexOf(userId) != -1;
    return this;
};

module.exports.StoryModelList = function(list, users, userId) {
    var returnModel = [];
    list.forEach(async(storyModel, i) => {
        let userModel = users.filter((e) => e.userId == storyModel.userId)[0];
        var story = {
            _id: storyModel._id,
            createdAt: storyModel.createdAt,

            userId: userModel.userId,
            username: userModel.username,
            email: userModel.email,
            phone: userModel.phone,
            profileurl: userModel.profileurl,
            coverurl: userModel.coverurl,
            namesurname: userModel.namesurname,
            bio: userModel.bio,
            follower: userModel.follower,
            following: userModel.following,
            shared: userModel.shared,
            vipstatus: userModel.vipstatus,
            vipfinishtime: userModel.vipfinishtime,
            sharedList: [],
        };

        storyModel.sharedList.forEach(async(sharedModel, j) => {
            var shared = {
                _id: sharedModel._id,
                createdAt: sharedModel.createdAt,
                likecounter: sharedModel.likecounter,
                seencounter: sharedModel.seencounter,
                type: sharedModel.type,
                storyurl: sharedModel.storyurl,
                caption: sharedModel.caption,
                liked: sharedModel.seenList.indexOf(userId) != -1,
                seen: sharedModel.likeList.indexOf(userId) != -1,
            };
            story.sharedList.push(shared);
        });

        returnModel.push(story);
    });
    return returnModel;
};