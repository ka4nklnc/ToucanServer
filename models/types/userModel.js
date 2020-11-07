module.exports.UserModel = function(userModel) {
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
  return this;
};

module.exports.UserModelList = function(userList) {
  let list = [];

  userList.forEach((element) => {
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
    };
    list.push(object);
  });

  return list;
};

module.exports.LoginUserModel = function(userModel) {
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
  this.token = userModel.token;
  return this;
};
