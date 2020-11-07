import mongoose, { Schema } from 'mongoose'

// var commentLikeSchema = new mongoose.Schema({
//     userid: { type: Schema.ObjectId, ref: "User", required: true }
// }, { timestamps: true })

var commentSchema = new mongoose.Schema({
    type: { type: Number, required: true },//yorumun resim olup olmadığı 
    userid: { type: Schema.ObjectId, ref: "User", required: true },
    likecounter: { type: Number, required: true, default: 0 },
    comment: { type: String, required: true, default: "" },
}, { timestamps: true })

var seenSchema = new mongoose.Schema({
    userid: { type: Schema.ObjectId, ref: "User", required: true }
}, { timestamps: true })

var likeSchema = new mongoose.Schema({
    userid: { type: Schema.ObjectId, ref: "User", required: true }
}, { timestamps: true })


var flowSchema = new mongoose.Schema({
    type: { type: Number, required: true },
    userid: { type: Schema.ObjectId, ref: "User", required: true },
    flowurl: { type: String, required: false },
    text: {type:String},
    seencounter: { type: Number, required: true, default: 0 },
    commentcounter: { type: Number, required: true, default: 0 },
    likecounter: { type: Number, required: true, default: 0 },
    comments: [commentSchema],
    seens: [seenSchema],
    likes: [likeSchema]
}, { timestamps: true })

module.exports = mongoose.model("Flow", flowSchema)
