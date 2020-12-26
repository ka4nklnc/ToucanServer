let mongoose = require("mongoose");
let { Schema } = require("mongoose");

var followingSchema = new Schema({
  userId: 'String',
});

var followersSchema = new Schema({
  userId:'String',
});

var userSchema = new Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    profileurl: { type: String, required: true ,default:"default"},
    coverurl: {type:String,required:true,default:"default"},
    namesurname: { type: String, required: true },
    bio: { type: String, required: false },
    follower: { type: Number, required: true, default: 0 },
    following: { type: Number, required: true, default: 0 },
    shared: { type: Number, required: true, default: 0 },
    vipstatus: { type: Boolean, required: true, default: false },
    vipfinishtime: { type: Date, required: true, default: Date.now() },
    cloudmessagingtoken: { type: String, required: true, default: "x" },
    token: { type: String, required: true, default: "x" },
    onlinefollowlist: [],
    followingList: [],
    followerList: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
