"use strict";
import mongoose from "mongoose";

//Soketi ayağa kaldırıyoruz. 
import socketManager from './socket/socketManager'

//Apiyi ayağa kaldırıyoruz.
import apiManager from './restapi/ApiManager'



mongoose.connect(
    "mongodb://localhost:27017/toucan", { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) console.log(err);
        else console.log("Connected MongoDb.");
    }
);

// import email from './restapi/Helpers/MailHelper'

// email.loginMail("link", "Kaan Kılınç", "kaankilinc@hotmail.com")