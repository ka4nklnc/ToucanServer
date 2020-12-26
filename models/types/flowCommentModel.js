module.exports.CommentModel = function(userModel, comment) {
  this.userId = userModel.userId;
  this.username = userModel.username;
  this.email = userModel.email;
  this.phone = userModel.phone;
  this.profileurl = userModel.profileurl;
  this.coverurl = userModel.coverurl
  this.namesurname = userModel.namesurname;
  this.bio = userModel.bio;
  this.follower = userModel.follower;
  this.following = userModel.following;
  this.shared = userModel.shared;
  this.vipstatus = userModel.vipstatus;
  this.vipfinishtime = userModel.vipfinishtime;
  this.comment = comment.comment;
  this.type = comment.type;
  this._id = comment._id;
  this.likecounter = comment.likecounter;
  this.createdAt = comment.createdAt;
  return this;
};

module.exports.CommentModelList = function(userList, commentList) {
  let list = [];

  commentList.forEach((comment) => {
    var element = userList.filter((e) => e.userId == comment.userid)[0];
    if (element) {
      var object = {
        userId: element.userId,
        username: element.username,
        email: element.email,
        phone: element.phone,
        profileurl: element.profilurl,
        coverurl:element.coverurl,
        namesurname: element.namesurname,
        bio: element.bio,
        follower: element.follower,
        following: element.following,
        shared: element.shared,
        vipstatus: element.vipstatus,
        vipfinishtime: element.vipfinishtime,
        type: comment.type,
        comment: comment.comment,
        likecounter: comment.likecounter,
        _id: comment._id,
        createdAt: comment.createdAt,
      };
      list.push(object);
    }
  });
  return list;
};
