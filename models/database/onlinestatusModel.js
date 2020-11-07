"use strict";

import mongoose, { Schema } from "mongoose";

var onlinestatusSchema = new Schema({
  userId: { type: String, required: true },
  list: { type: [] }
});

module.exports = mongoose.model("onlinestatus", onlinestatusSchema);
