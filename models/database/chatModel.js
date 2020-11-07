"use strict";

let mongoose = require("mongoose");
let {Schema} = require("mongoose");
let chatSchema = new Schema({
  createat: { type: Date, required: true, default: Date.now() },
  isdeleted: { type: Boolean, required: true, default: false },
  senderuid: { type: String, required: true },
  receiveuid: { type: String, required: true },
  message: { type: String, required:false},
  messagestatus: { type: Number, required: true, default: -1 },
  fileurl: { type: String},
  filetype: { type: Number, required: true },
  fileuploadstatus : {type:Boolean, default:false}
});

module.exports = mongoose.model("Chat", chatSchema);
