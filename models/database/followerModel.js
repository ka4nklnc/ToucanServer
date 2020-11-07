"use strict";
import mongoose, { Schema } from "mongoose";

var followerSchema = new mongoose.Schema(
  {
    followingId: { type: String, required: true },
    followedId: { type: String, required: true },
    createDate: { type: Date, required: true, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Follower", followerSchema);
