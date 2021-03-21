"use strict";
import mongoose from "mongoose";
require("dotenv").config();
//Soketi ayağa kaldırıyoruz.
import socketManager from "./socket/socketManager";

//Apiyi ayağa kaldırıyoruz.
import apiManager from "./website/exppressManager";

mongoose.connect(
    `${process.env.DB_HOST}/${process.env.DB_DATABASE}`, { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) console.log(err);
        else console.log("Connected MolngoDb.");
    }
);

// import email from './restapi/Helpers/MailHelper'
