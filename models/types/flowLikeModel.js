module.exports.LikeModel = function(userModel, like) {
    this.userId = userModel.userId;
    this.username = userModel.username;
    this.email = userModel.email;
    this.phone = userModel.phone;
    this.profileurl = userModel.profileUrl;
    this.namesurname = userModel.namesurname;
    this.bio = userModel.bio;
    this.follower = userModel.follower;
    this.following = userModel.following;
    this.shared = userModel.shared;
    this.vipstatus = userModel.vipstatus;
    this.vipfinishtime = userModel.vipfinishtime;

    this._id = comment._id;
    this.createdAt = comment.createdAt;

    return this;
  };
  
  module.exports.LikeModelList = function(userList, likeList,user) {
    let list = [];
    console.log(user.following)
    likeList.forEach((like) => {
      var element = userList.filter((e) => e.userId == like.userid)[0];
      console.log(element)
      if (element) {
        var object = {
          userId: element.userId,
          username: element.username,
          email: element.email,
          phone: element.phone,
          profileurl: element.profileUrl,
          namesurname: element.namesurname,
          bio: element.bio,
          follower: element.follower,
          following: element.following,
          shared: element.shared,
          vipstatus: element.vipstatus,
          vipfinishtime: element.vipfinishtime,
          
          _id: like._id,
          createdAt: like.createdAt,
          followstate : user.followingList.indexOf(element.userId) != -1
        };
        list.push(object);
      }
    });
    return list;
  };
  