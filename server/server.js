// Importing modules
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import expressSession from "express-session";
import {dirname} from "path";
import {DatabaseHandler} from "./databaseHandler.js";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";
import axios from "axios";
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors';

// Configure dotenv
dotenv.config();

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize express app
const app = express();

// APIs
// Activity suggestion API
const bordomAPI = 'https://bored-api.appbrewery.com/random';

// Weather API
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const weatherAPI = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=auto:ip`;

// Set port
const port = process.env.PORT || 8080;

// Creates server
const server = createServer(app);

// Creates websocket instance
const io = new Server(server,{
    // specifies allowed connections and methods
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Detects websocket connection
io.on("connection", (socket) => {
    console.log("connection Made");

    // Detects room join
    socket.on('join room', async (roomId) => {
        await socket.join(roomId);
    });

    socket.on('leave room', async (roomId) => {
        await socket.leave(roomId);
    });

});

app.use(cors());

// Configure express to allow access to the public folder
app.use("/public", express.static('public'));

// 
app.use((req, res, next) => {
    console.log(`request method: ${req.method}`);
    console.log(`request URL: ${req.url}`);
    next();
});


// Configures espress to use body-parser urlencoded
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));

// Configures espress to use body-parser json
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));

// Configures espress to use express-fileupload
app.use(fileUpload());

// Configures espress to use express-session
app.use(
    expressSession({
        secret: "Swift",
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: true
    })
);

// Configure server to listen on set port
server.listen(port, () =>{
    console.log(`Running on port ${port}`);
});


// Handles GET request made to the home path
app.get("/", (req, res) => {
    // Sends homepage
    res.sendFile(__dirname + "/public/index.html");
});

// Handles GET request made to the /M00933241/email path
app.get("/M00933241/email", async (req, res) => {
    var idTag = req.query.email;
    
    // Checks if email exist;
    var result = await DatabaseHandler.isUser(idTag);

    res.send({result: result});
});

// Handles GET request made to the /M00933241/username path
app.get("/M00933241/username", async (req, res) => {
    var idTag = req.query.userName;
    
    // Checks if username exist
    var result = await DatabaseHandler.isUser(idTag);

    res.send({result: result});
});

// Handles GET request made to the /M00933241/user path
app.get("/M00933241/user", async (req, res) => {
    var idTag = req.query.id;

    // Gets a user
    var result = await DatabaseHandler.getUser(idTag);

    res.send({result: result});
});

// Handles GET request made to the /M00933241/:id/follow path
app.get("/M00933241/:id/follow", async (req, res) => {
    var idTag, listType, user, result;

    // Gets the value of the parameter "id"
    idTag = req.params['id'];
    listType = req.query.listType;
    
    user = await DatabaseHandler.getUser(idTag);

    // Checks if user has been gotten
    if(user){
        if (listType == "following"){
            result = user.following;
            res.send({result: result});
        }else if (listType == "followers"){
            result = user.followers;
            res.send({result: result})
        }
    }
    
});

// Handles GET request made to the /M00933241/:id/contacts path
app.get("/M00933241/:id/contacts", async (req, res) => {
    var idTag, user;

    // Gets the value of the parameter "id"
    idTag = req.params['id'];
    
    // Gets user information
    user = await DatabaseHandler.getUser(idTag);
    var userContacts = user.contacts;

    var contactList = [];
    
    // Itterates over user contact list
    for (var contact of userContacts){

        // Gets contact information
        var contactInfo = await DatabaseHandler.getUser(contact);

        // Adds contact information to contactList array
        contactList.push({
            contactId: contact,
            profile_img: contactInfo.profile_img,
            userName: contactInfo.userName
        });
    }

    res.send({
        contactList: contactList
    });
    
});

// Handles POST request made to the /M00933241/user path
app.post("/M00933241/users", async (req, res) => {

    // Gets user data
    var user = req.body.userJSON;
    user.profile_img = "";
    user.followers = []
    user.following = [];
    user.friends = [];
    user.post = [];

    var result = await DatabaseHandler.addUser(user);

    var profile_image, idfolderPath, profileFolderPath, id;
    id = `${result.insertedId}`;
    
    // Creates upload folder for user
    idfolderPath = `./public/uploads/${id}`;
    createFolder(idfolderPath);

    // Checks if profile image has been selected
    if(req.body.profile_img != ""){

        // Creates folder for uploaded profile image
        profileFolderPath = `./public/uploads/${id}/default_profile`;
        createFolder(profileFolderPath);

        // Sets profile_image to created path
        var writeResult = await writeImage(req.body.profile_img, profileFolderPath, 'profile_img');
        
        // Checks if write result was successful
        if(writeResult.result == true){
            profile_image = `public/uploads/${id}/default_profile/${writeResult.file}`;
        }else{
            profile_image = "public/uploads/default_profile/default_profile.jpg"
        }

    }else{
         // Sets profile_image to default profile image path
        profile_image = "public/uploads/default_profile/default_profile.jpg"
    }

    // Updates user profile;
    var updateResult = await DatabaseHandler.updateProfilePath(id, profile_image);
    
    res.send({
        result: result,
        updateResult: updateResult
    });

});

// Writes image to specified directory
async function writeImage(image, directory, fileName){
    try{
        // Splits image string and gets file extension
        const extension = image.split(';')[0].match(/jpeg|png|gif/)[0];

        // Splits image and gets image data
        const data = image.replace(/^data:image\/\w+;base64,/, '');
        const encoding  = 'base64';

        // Sets file name and extension
        const file = `${fileName}.${extension}`;

        // Path to image
        const path = `${directory }/${file}`;

        // Creates image file in appropriate directory
        fs.writeFileSync(path, data, encoding);

        return {result: true, file: file};
    }catch(err){
        return {result: false, file: null};
    }
    

    
}

// Creates a folder in a directory
async function createFolder(directoryPath){
     // Creates new directory if directory doesn't exist,
    if (!fs.existsSync(directoryPath)) {
        // Creates directory
        fs.mkdirSync(directoryPath);
        console.log(`Directory '${directoryPath}' created.`);
    } else {
        console.log(`Directory '${directoryPath}' already exists.`);
    }
}

// Handles GET request made to the /M00933241/login path
app.get("/M00933241/login", async (req, res) => {
    // Set id tag
    var idTag = req.query.idTag;

    // gets log status of user
    var inDatabase = await DatabaseHandler.isLogged(idTag);

    // Checks if log status exist
    if(inDatabase){
        var userData = new Promise( async (resolve, reject) => {
            var data = await DatabaseHandler.getloggedUser(idTag);
            var userStatus = data.status;

            // checks if user exist 
            if (userStatus){

                try{
                    var loggedUsers = req.session.loggedUsers;
                    var index = loggedUsers.indexOf(`${data.userId}`);

                    // Cheks if user is not in session;
                    if(!index){
                        // Adds user id to logged users array
                        req.session.loggedUsers.push(`${data.userId}`);
                    }
                    
                }catch{
                    // Creates logged users in session
                    req.session.loggedUsers = [];
                    // Adds user id to logged users array
                    req.session.loggedUsers.push(`${data.userId}`);
                }

                // console.log(req.session);
                resolve({login: true, isuser: true, id: data.userId});
                
            }else{
                reject({login: false, isuser: true});
            }

        })
        
        userData.then((message) => {
            res.send(message);
        }).catch((message) => {
            res.send(message);
        })
    }else{
        res.send({login: false, isuser: false});
    }
});

// Handles POST request made to the /M00933241/login path
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
        }else{
            var result = {
                acknowledged: false,
                insertedId: null,
            }
            
            reject(result);
        }

    })
    
    userData.then((message) => {
        res.send(message);
    }).catch((message) => {
        res.send(message);
    });
});

// Handles DELETE request made to the /M00933241/login path
app.delete("/M00933241/login", (req, res) => {
    // Set id tag
    var idTag = req.query.id;

    var userData = new Promise( async (resolve, reject) => {
        // Gets user
        var data = await DatabaseHandler.getUser(idTag);

        // Checks if user exist
        if(data){
            var result = await DatabaseHandler.updateLogin({correctPassword: "delete", user: data});

            // Checks if entry was acknowledged
            if(result.acknowledged){
                try{
                    // Gets login user session
                    var loggedUsers = req.session.loggedUsers;
                    var index = loggedUsers.indexOf(`${data.userId}`);
                    // Removes login user
                    req.session.loggedUsers.splice(index, 1);
                    resolve(result);
                }catch(err){
                    resolve(result);
                }

            }else{
                reject(result);
            }
            
        }

    });
    
    userData.then((message) => {
        res.send(message);
    }).catch((message) => {
        res.send(message);
    })
});

// Handles GET request made to the /M00933241/contents path
app.get("/M00933241/contents", async (req, res) => {
    var posts, response;

    // Gets all post
    posts = await DatabaseHandler.getAllPost();
    
    response = {
        posts: posts
    }

    res.send(response);

});

// Handles GET request made to the M00933241/contents/:id path
app.get("/M00933241/contents/:id", async (req, res) => {
    var idTag, post, response;

    // Get's id
    idTag = req.params['id'];

    // Gets post
    post = await DatabaseHandler.getPost(idTag);
    
    response = {
        post: post
    };

    res.send(response);

});

// Handles GET request made to the /M00933241/contents/:id/like path
app.get("/M00933241/contents/:id/like", async (req, res) => {
    var idTag, post, response;

    // Get's id
    idTag = req.params['id'];

    // Gets post
    post = await DatabaseHandler.getPost(idTag);
    
    response = {
        likesCount: post.likesCount
    };

    res.send(response);

});


// Handles POST request made to the /M00933241/contents/:id/like path
app.post("/M00933241/contents/:id/like", async (req, res) => {
    var idTag, postResult, response, likeStatus, userId;

    // Get's id
    idTag = req.params['id'];
    userId = req.body.likedBy;
    likeStatus = req.body.likeStatus;

    // Gets post
    postResult = await DatabaseHandler.updatePostLike(idTag, likeStatus, userId);
    
    response = {
        postResult: postResult
    };

    res.send(response);

});

// Handles GET request made to the /M00933241/:id/contents path
app.get("/M00933241/:id/contents", async (req, res) => {
    var idTag = req.params['id'];

    // Get user's post
    var post = await DatabaseHandler.getUserPost(idTag);

    var response = {
        post: post
    }

    res.send(response);

});

// Handles POST request made to the /M00933241/contents path
app.post("/M00933241/contents", async (req, res) => {
    var post, imageData;
    
    // Sets post properties
    post = req.body.postData;
    post.likesCount = 0;
    post.commentCount = 0;
    post.comments = [];
    post.likes = [];
    post.timeStamp = new Date();
    
    imageData = req.body.imageData;

    // Determines the post type
    if(imageData != '' && post.caption != ''){
        post.type = "text & image";
    }else{
        // Checks if image data exist
        if(imageData){
            post.type = "image";
        }else{
            post.type = "text";
        }
    }

    var addPostResult, userPostResult, imageUpdateResult;

    // Adds post to database
    addPostResult = await DatabaseHandler.addPost(post);

    
    var imgPath, postId, authorId, uploadFolderPath;
    
    postId = `${addPostResult.insertedId}`;
    authorId = post.authorId;

    // Updates user's post list
    userPostResult = await DatabaseHandler.updateUserPost(postId, authorId);

    // Checks if imageData contains data
    if(imageData != ""){
        // Creates folder for uploaded profile image
        uploadFolderPath = `./public/uploads/${authorId}/uploads`;
        createFolder(uploadFolderPath);

        // Sets profile_image to created path
        var writeResult = await writeImage(imageData, uploadFolderPath, postId);
        
        // Checks if write was successful
        if(writeResult.result == true){
            imgPath = `public/uploads/${authorId}/uploads/${writeResult.file}`;
            post.imgPath = imgPath;

        }
        else{
            post.imgPath = '';
        }

    }else{
        post.imgPath = '';
    }

    // Updates the post's image path
    imageUpdateResult = await DatabaseHandler.updatePostImgPath(postId, post.imgPath)

    var response = {
        addPostResult: addPostResult,
        userPostResult: userPostResult,
        imageUpdateResult: imageUpdateResult

    }

    res.send(response);
});

// Handles POST request made to the /M00933241/follow path
app.post("/M00933241/follow", async (req, res) => {
    var followerIdTag = req.body.followerIdTag;
    var followedIdTag = req.body.followedIdTag;

    // Gets follow result
    var result = await DatabaseHandler.followHandler(true, followerIdTag, followedIdTag);
    res.send(result);

    // Gets frienship status
    var isfriend = await DatabaseHandler.isFriends(followerIdTag, followedIdTag);

    // Checks frienship status
    if(isfriend){
        // Gets result of friendship addition
        var friendResult = await DatabaseHandler.friendHandler(followerIdTag, followedIdTag, "add");

        // Checks result of friendship addition
        if (friendResult){
            console.log("\n Friending successful \n");
        }
    }

});

// Handles DELETE request made to the /M00933241/follow path
app.delete("/M00933241/follow", async (req, res) => {
    // Sets follow tags
    var followerIdTag = req.body.followerIdTag;
    var followedIdTag = req.body.followedIdTag;

    // Gets frienship status
    var isfriend = await DatabaseHandler.isFriends(followerIdTag, followedIdTag);

    // Checks frienship status
    if(isfriend){
        // Gets result of friendship removal
        var friendResult = await DatabaseHandler.friendHandler(followerIdTag, followedIdTag, "remove");

        // Checks result of friendship removal
        if (friendResult){
            console.log("\n unFriending successful \n");
        }
    }

    // Get's unfollow result
    var result = await DatabaseHandler.followHandler(false, followerIdTag, followedIdTag);
    res.send(result);
});

// Handles GET request made to the /M00933241/:id/suggestFollowing path
app.get("/M00933241/:id/suggestFollowing", async (req, res) => {
    var idTag = req.params['id'];

    // Gets specified user
    var user = await DatabaseHandler.getUser(idTag);

    // Gets all users
    var usersList = await DatabaseHandler.getAllUsers();

    var addedUserCount = 0;
    var followList = [];
    var stopLoop = false;
    var index = 0;

    // Loop to add users to suggestion
    while (!stopLoop){
       
        // Makes sure user is not in suggestion
        if(`${usersList[index]._id}` != `${user._id}`){

            // Makes sure the user isn't already following
            if (!(isFollowing(user.following, usersList[index]._id))){
                var friendTodAdd = {
                    _id: usersList[index]._id,
                    userName: usersList[index].userName,
                    profile_img: usersList[index].profile_img
                }

                // console.log(friendTodAdd);
                followList.push(friendTodAdd);
                addedUserCount++;
            }
            
            // Checks if added users suggestion is up to 6
            if(addedUserCount == 6){
                stopLoop = true;
            }    
            
        }

        index++;
        // Checks if index is equivalent to length
        if(index == usersList.length){
            stopLoop = true;
        }
    }

    var response = {
        followList: followList
    }

    res.send(response);

});

// Checks if user is following
function isFollowing(followingList, suggestion){
    // Itterates over user following
    for(var following of followingList){
        // Checks if suggestion is in following list
        if (`${following.userId}` == `${suggestion}`){
            // console.log(following.userId, suggestion);
            return true;
        }
    }
}

// Handles GET request made to the /M00933241/users/search path
app.get("/M00933241/users/search", async (req, res) => {

    // Gets idTag
    var idTag = req.query.idTag;
    
    // Gets users from DatabaseHandler
    var data = await DatabaseHandler.getUsers(idTag);
    res.send(data);
       
});

// Handles GET request made to the /M00933241/content/search path
app.get("/M00933241/content/search", async(req, res) => {
    // Gets idTag
    var idTag = req.query.idTag;
    
    // Get's post
    var data = await DatabaseHandler.getPosts(idTag);
    res.send(data);
    
});

// Handles GET request made to the /M00933241/activity path
app.get("/M00933241/activity", async(req, res) => {
    
    try{
        // Gets activity suggetion from 
        const response = await axios.get(bordomAPI);
        res.send(response.data);

    }catch(err){

        // Sends defautlt activity
        res.send({
            "activity": "Learn and play a new card game",
            "availability": 0,
            "type": "recreational",
            "participants": 1,
            "price": 0,
            "accessibility": "Few to no challenges",
            "duration": "minutes",
            "kidFriendly": true,
            "link": "https://www.pagat.com",
            "key": "9660022"
        });
    }
    
});

// Handles GET request made to the /M00933241/weather path
app.get("/M00933241/weather", async(req, res) => {

    // Gets weather data from database;
    var result = await DatabaseHandler.getWeatherData();

    // Create a new date object
    var date = new Date();

    // Checks if result is not null
    if(result){

        var weaterDate = result.date;

        // converts date to ISO string and splits 
        var ISOdate = date.toISOString().split('T')[0];

        // Checks if weather data is current
        if(ISOdate == weaterDate){

            res.send(result);

        }else{
            // Gets weather data insert result
            var insertResult = await getWeaterData();

            // Cheks if insert result has been acknowledged
            if (insertResult.acknowledged){
                // Gets weather data from database
                result = await DatabaseHandler.getWeatherData();

                res.send(result);

            }else{
                res.send({
                    acknowledged: false
                });
            }

        }

    }else{
        // Gets weather data insert result
        var insertResult = await getWeaterData(); 

        // Cheks if insert result has been acknowledged
        if (insertResult.acknowledged){
            // Gets weather data from database
            result = await DatabaseHandler.getWeatherData();
            res.send(result);

        }else{
            res.send({
                acknowledged: false
            });
        }
    }
    
    
});

// Gets and inserts weather data
async function getWeaterData() {
    try{
        // Gets weather data
        const response = await axios.get(weatherAPI);
        var result = response.data;

        // Gets forcast for the day.
        var forecastday = result.forecast.forecastday;
        var date = forecastday[0].date;
        var weatherToday = forecastday[0].day;

        // Weather data object creation
        var data = {
            date: date, 
            maxtemp: weatherToday.maxtemp_c,
            mintemp: weatherToday.mintemp_c,
            avghumidity: weatherToday.avghumidity,
            condition: weatherToday.condition,
            chanceofRain: weatherToday.daily_chance_of_rain,
            uv: weatherToday.uv,
            entryTime: new Date()
        }

        // Adds data to database
        var result = await DatabaseHandler.addWeatherData(data);

        // Returns inset result.
        return result;
        
    }catch{
        return{
            acknowledged: false
        }
    }
}

// Handles GET request made to the /M00933241/conversation path
app.get("/M00933241/conversation", async(req, res) => {
    // Gets parties 
    var party1 = req.query.party1;
    var party2 = req.query.party2;

    // Gets conversation of parties
    var conversation = await DatabaseHandler.getConversation(party1, party2);

    // Checks if converation has value
    if (conversation){
        res.send({
            conversation: conversation
        });
    }else{ // Creates converastion

        // Gets insert result
        var result = await DatabaseHandler.addConversation(party1, party2);

        // Checks if insertion was acknowledged
        if(result.acknowledged){
            // Gets conversation
            conversation = await DatabaseHandler.getConversation(party1, party2);
            res.send({
                conversation: conversation
            });
        }else{
            res.send({
                conversation: null
            });
        }
    }
   
    
});

// Handles POST request made to the /M00933241/conversation/chat path
app.post("/M00933241/conversation/chat", async(req, res) => {
    // Set parties
    var party1 = req.query.party1;
    var party2 = req.query.party2;

    // var chat = req.body.chat;
    var chat = {};
    chat.authorId = req.body.authorId;
    chat.content = req.body.content;

    // Creates new date object
    var date = new Date(); 
    var time = date.getHours() + ':' + date.getMinutes();
    chat.timeStamp = time;

    // Gets converation id
    var conversationId = await DatabaseHandler.getConversationId(party1, party2);

    // Sends message to room
    io.to(conversationId).emit('chat message', chat);

    // Gets update result
    var result = await DatabaseHandler.updateConversation(party1, party2, chat);

    // Checks if result is acknowledged
    if (result.acknowledged){
        res.send({
            result: result
        });
    }else{
        res.send({
            result: {
                acknowledged: false
            }
        });
    }
    
});

// Handles GET request made to the /M00933241/:userId/conversations path
app.get("/M00933241/:userId/conversations", async(req, res) => {
    // Set user
    var user = req.params['userId'];

    // Gets user's conversation
    var conversations = await DatabaseHandler.getUserConversation(user);

    // Checks if conversation holds value
    if (conversations){
        res.send({
            conversations: conversations
        });
    }

    
});