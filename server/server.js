import express from "express";
import {dirname} from "path";
import {DatabaseHandler} from "./databaseHandler.js";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import fs from "fs";



const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

app.listen(port, () =>{
    console.log(`Running on port ${port}`);
});

app.use("/public", express.static('public'));


app.use((req, res, next) => {
    console.log(`request method: ${req.method}`);
    console.log(`request URL: ${req.url}`);
    next();
});

app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());


// Responds with the home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Responds with javascript file
// app.get("/index.js", (req, res) => {
//     res.sendFile(__dirname + "/public/index.js");
// });


app.post("/M00933241/users", async (req, res) => {
    var user = req.body;
    user.followers = []
    user.following = [];
    user.friends = [];
    user.post = [];

    
    var result = await DatabaseHandler.addUser(user);
    res.send(result);
});

app.delete("/M00933241/users", async (req, res) => {
    var idTag = req.body.idTag;


    // res.send(idTag);
    var result = await DatabaseHandler.deleteUser(idTag);
    res.send(result);
});


app.get("/M00933241/login", async (req, res) => {
    var idTag = req.body.idTag;

    var inDatabase = await DatabaseHandler.isLogged(idTag);

    if(inDatabase){
        var userData = new Promise( async (resolve, reject) => {
            var data = await DatabaseHandler.getloggedUser(idTag);
            var userStatus = data.status;

            // checks if user exist 
            if (userStatus){
                resolve({login: true, isuser: true});
            }else{
                reject({login: false, isuser: true});
            }

        })
        
        userData.then((message) => {
            res.send(message);
            // res.send(message);
        }).catch((message) => {
            res.send(message);
        })
    }else{
        res.send({login: false, isuser: false});
    }
});

// Handles sent login data
app.post("/M00933241/login", (req, res) => {
    var idTag = req.body.idTag;
    var password = req.body.password;
    
    var userData = new Promise( async (resolve, reject) => {
        var data = await DatabaseHandler.getUser(idTag);

        // checks if user exist 
        if (data){
            // checks if the password matches stored password.
            if (data.password == password){
                
                var result = await DatabaseHandler.updateLogin({correctPassword: true, user: data, status: true});
                resolve(result);

            }else{
                var result = await DatabaseHandler.updateLogin({correctPassword: false, user: data, status: false});
                resolve(result);
            }
            // resolve(data);
        }else{
            reject({
                acknowledged: false,
                insertedId: false
            });
        }

    })
    
    userData.then((message) => {
        res.send(message);
        // res.send(message);
    }).catch((message) => {
        res.send(message);
    })

    // console.log("here");
    // res.send(req.body);
    // console.log(req.body);
});

app.delete("/M00933241/login", (req, res) => {
    var idTag = req.body.idTag;

    var userData = new Promise( async (resolve, reject) => {
        var data = await DatabaseHandler.getUser(idTag);

        if(data){
            var result = await DatabaseHandler.updateLogin({correctPassword: "delete", user: data});

            if(result.acknowledged){
                resolve(result);
            }else{
                reject(result);
            }
            
        }else{
            reject("Users does not exist");
        }

    })
    
    userData.then((message) => {
        res.send(message);
        // res.send(message);
    }).catch((message) => {
        res.send(message);
    })
});

app.get("/M00933241/contents", async (req, res) => {
    // console.log(req.body._id);
    var post = await DatabaseHandler.getPost(req.body._id);

    res.send(post);

});

app.post("/M00933241/contents", async (req, res) => {

    var post = req.body;
    post.likes = 0;
    post.comments = [];
    post.timeStamp = new Date();

    var image = req.files.image;
    var imgPath = "./public/uploads/" + image.name;

    await image.mv(imgPath, (err) => {

        if(err){
            throw err
        }

        console.log("Image uploaded to " + imgPath);
    })

    post.imgPath = imgPath;

    if(post.imgPath && post.caption){
        post.type = "text & image";
    }else{
        if(post.image){
            post.type = "image";
        }else{
            post.type = "text";
        }
    }

    var result = await DatabaseHandler.addPost(post);
    
    res.send({imgPath: imgPath, result: result});
});

app.post("/M00933241/follow", async (req, res) => {
    var followerIdTag = req.body.followerIdTag;
    var followedIdTag = req.body.followedIdTag;

    var result = await DatabaseHandler.followHandler(true, followerIdTag, followedIdTag);
    res.send(result);
});

app.delete("/M00933241/follow", async (req, res) => {
    var followerIdTag = req.body.followerIdTag;
    var followedIdTag = req.body.followedIdTag;

    var result = await DatabaseHandler.followHandler(false, followerIdTag, followedIdTag);
    res.send(result);
});

app.get("/M00933241/users/search", (req, res) => {

    var idTag = req.body.idTag
    var userData = new Promise( async (resolve, reject) => {
        var data = await DatabaseHandler.getUser(idTag);

        if (data != false){ 
            resolve(data);
        }else{
            reject("No such user");
        }

    })
    
    userData.then((message) => {
        res.send(message);
    }).catch((message) => {
        // console.log(message)
        res.send(message);
    })
    
   
});

app.get("/M00933241/content/search", (req, res) => {
    res.send("search content");
});


// app.get("/M00933241/image", async (req, res) => {
//     var filePath =  req.query.filePath
//     // console.log(req.query.filePath);
//     res.sendFile(__dirname + filePath);
//     // res.send(req.query.filePath);

// });

// DatabaseHandler.getUser(userEmail=userEmail)
// function setLog(idTag, userPassword){
    
// }
