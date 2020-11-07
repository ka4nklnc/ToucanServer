'use strict'

import mongoose, { Schema } from 'mongoose'

var offlineSchema = new Schema({
    userId: {type:String,required:true},
    data: {type:String,required:true},
    mUid: {type:String,required:true}
})

module.exports = mongoose.model('offline',offlineSchema)

