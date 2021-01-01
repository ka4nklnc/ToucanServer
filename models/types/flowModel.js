var userDb = require("../database/userDb");

module.exports.FlowModel = function(flowModel, userId) {
    this._id = flowModel._id;
    this.createdAt = flowModel.createdAt;
    this.type = flowModel.type;
    this.userid = flowModel.userid;
    this.flowurl = flowModel.flowurl;
    this.text = flowModel.text;
    this.seencounter = flowModel.seencounter;
    this.commentcounter = flowModel.commentcounter;
    this.likecounter = flowModel.likecounter;
    this.comments = flowModel.comments.filter((model) => model.userid == userId);
    this.liked = flowModel.likes.indexOf(userId) != -1
    this.seen = flowModel.seens.indexOf(userId) != -1
    return this;
};

module.exports.FlowModelList = function(list, userId) {
    var returnModel = [];
    list.forEach(async(flowModel, i) => {
        var object = {
            _id: flowModel._id,
            createdAt: flowModel.createdAt,
            type: flowModel.type,
            userid: flowModel.userid,
            flowurl: flowModel.flowurl,
            text: flowModel.text,
            seencounter: flowModel.seencounter,
            commentcounter: flowModel.commentcounter,
            likecounter: flowModel.likecounter,
            comments: [],
            liked: flowModel.likes.indexOf(userId) != -1,
            seen: flowModel.seens.indexOf(userId) != -1
        };

        object.comments = flowModel.comments.filter(
            (model) => model.userid == userId
        );

        object.liked = flowModel.likes.indexOf(userId) != -1
        returnModel.push(object);
    });
    return returnModel;
};