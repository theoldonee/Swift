import express from "express";
import {dirname} from "path";
import {DatabaseHandler} from "./databaseHandler.js"
// const Car = require("./databaseHandler.js")

import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8080;

app.listen(port, () =>{
    console.log(`Running on port ${port}`);
});

app.use((req, res, next) => {
    console.log(`request method: ${req.method}`);
    console.log(`request URL: ${req.url}`);
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
    // res.sendFile(__dirname + "/public/index.js");
});

app.get("/index.js", (req, res) => {
    // res.sendFile(__dirname + "/public/index.html");
    res.sendFile(__dirname + "/public/index.js");
});


app.get("/M00933241/users", (req, res) => {
    res.send("get users");
});

app.get("/M00933241/login", (req, res) => {
    res.send("get login");
});

app.post("/M00933241/login", (req, res) => {
    // console.log("here");
    // res.send(req.body);
    // console.log(req.body);


});

app.delete("/M00933241/login", (req, res) => {
    res.send("delete login");
});

app.get("/M00933241/contents", (req, res) => {
    res.send("ccontent gets");
});

app.post("/M00933241/contents", (req, res) => {
    res.send("contents post");
});

app.get("/M00933241/follow", (req, res) => {
    res.send("follow get");
});

app.delete("/M00933241/follow", (req, res) => {
    res.send("follow delete");
});

app.get("/M00933241/users/search", (req, res) => {
    res.send("search users");
});

app.get("/M00933241/content/search", (req, res) => {
    res.send("search content");
});


