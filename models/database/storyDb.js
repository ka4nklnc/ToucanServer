// import mongoose, { Schema } from "mongoose";
let mongoose = require("mongoose");
let { Schema } = require("mongoose");

var likeStorySchema = new Schema(
  {
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

var seenStorySchema = new Schema(
  {
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

var sharedStorySchema = new Schema(
  {
    isdeleted: { type: Boolean, required: true, default: false },
    type: { type: Number, required: true },
    storyurl: { type: String, required: false },
    caption: { type: String, required: false },
    likecounter: { type: Number, required: true, default: 0 },
    seencounter: { type: Number, required: true, default: 0 },
    seenList: [seenStorySchema],
    likeList: [likeStorySchema],
  },
  { timestamps: true }
);

var storySchema = new Schema(
  {
    sharedList: [sharedStorySchema],
    userId: { type: Schema.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
