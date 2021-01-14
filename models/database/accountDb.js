"use strict";

let mongoose = require("mongoose");
let { Schema } = require("mongoose");

var accountSchema = new mongoose.Schema({
    username: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    verificationcode: { type: String },
    isverification: { type: Boolean, require: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);