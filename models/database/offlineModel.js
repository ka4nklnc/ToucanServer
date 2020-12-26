'use strict'

import mongoose, { Schema } from 'mongoose'

var offlineSchema = new Schema({
    userId: {type:String,required:true},
    data: [],
})

module.exports = mongoose.model('offline',offlineSchema)

