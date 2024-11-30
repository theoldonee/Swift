// Importing modules
import express from "express";
import fileUpload from "express-fileupload";
import expressSession from "express-session";
import {dirname} from "path";
import {DatabaseHandler} from "./databaseHandler.js";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";



const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Set port
const port = process.env.PORT || 8080;

// Configure express to listen on set port
app.listen(port, () =>{
    console.log(`Running on port ${port}`);
});

// Configure express to allow access to the public folder
app.use("/public", express.static('public'));

// 
app.use((req, res, next) => {
    console.log(`request method: ${req.method}`);
    console.log(`request URL: ${req.url}`);
    next();
});

// app.use(express.urlencoded({ extended: true }));

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
// app.use(expressSession({
//     secret: "Swift",
//     cookie: { maxAge: 60000 },
//     resave: false,
//     saveUninitialized: true
// }));


// Handles GET request made to the home path
app.get("/", (req, res) => {
    // Sends response
    res.sendFile(__dirname + "/public/index.html");
});

// Handles GET request made to the /M00933241/email path
app.get("/M00933241/email", async (req, res) => {
    var idTag = req.query.email;
    
    var result = await DatabaseHandler.isUser(idTag);

    res.send({result: result});
});

// Handles GET request made to the /M00933241/username path
app.get("/M00933241/username", async (req, res) => {
    var idTag = req.query.userName;
    
    var result = await DatabaseHandler.isUser(idTag);

    res.send({result: result});
});

// Handles GET request made to the /M00933241/user path
app.get("/M00933241/user", async (req, res) => {
    var idTag = req.query.id;
    
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

    var profile_image, idfolderPath, profileFolderPath, fileName, id;
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
        
        if(writeResult.result == true){
            profile_image = `./uploads/${id}/default_profile/${writeResult.file}`;
        }else{
            profile_image = "./uploads/default_profile/default_profile.jpg"
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
        fs.mkdirSync(directoryPath);
        console.log(`Directory '${directoryPath}' created.`);
    } else {
        console.log(`Directory '${directoryPath}' already exists.`);
    }
}

// creates a file name
// async function generateFileName(postList, id){
//     var length = postList.lenght;

//     // Equates length to 0 if length is undefined
//     if(length == undefined){
//         length = 0;
//     }

//     var fileName = `${id}_${length}`;

//     // Generates new file name if already taken.
//     if (fileName in postList){
//         var lastNumber = parseInt(postList[postList.length - 1].split('_')[1]);
//         fileName = `${id}_${lastNumber}` ; 
//     }

//     return fileName;

// }

// Handles DELETE request made to the /M00933241/users path
app.delete("/M00933241/users", async (req, res) => {
    var idTag = req.body.idTag;

    var result = await DatabaseHandler.deleteUser(idTag);
    res.send(result);
});

// Handles GET request made to the /M00933241/:id/contents path
app.get("/M00933241/login", async (req, res) => {
    var idTag = req.query.idTag;

    var inDatabase = await DatabaseHandler.isLogged(idTag);

    if(inDatabase){
        var userData = new Promise( async (resolve, reject) => {
            var data = await DatabaseHandler.getloggedUser(idTag);
            var userStatus = data.status;

            // checks if user exist 
            if (userStatus){
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

// Handles GET request made to the /M00933241/contents path
app.get("/M00933241/contents", async (req, res) => {
    var getBy, posts, response;

    getBy = req.query.getBy;

    if (getBy = "all"){
        posts = await DatabaseHandler.getAllPost();
    }
    
    
    response = {
        posts: posts
    }

    res.send(response);

});

// Handles GET request made to the M00933241/contents/:id path
app.get("/M00933241/contents/:id", async (req, res) => {
    var idTag, post, response;

    idTag = req.params['id'];

    post = await DatabaseHandler.getPost(idTag);
    
    response = {
        post: post
    };

    res.send(response);

});


// Handles GET request made to the /M00933241/:id/contents path
app.get("/M00933241/:id/contents", async (req, res) => {
    var idTag = req.params['id']
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

    var result = await DatabaseHandler.followHandler(true, followerIdTag, followedIdTag);
    res.send(result);
});

// Handles DELETE request made to the /M00933241/follow path
app.delete("/M00933241/follow", async (req, res) => {
    var followerIdTag = req.body.followerIdTag;
    var followedIdTag = req.body.followedIdTag;

    var result = await DatabaseHandler.followHandler(false, followerIdTag, followedIdTag);
    res.send(result);
});

// Handles GET request made to the /M00933241/users/search path
app.get("/M00933241/users/search", (req, res) => {

    // Gets idTag
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
        res.send(message);
    })
    
   
});

// Handles GET request made to the /M00933241/content/search path
app.get("/M00933241/content/search", (req, res) => {
    res.send("search content");
});


const bordomAPI = 'https://bored-api.appbrewery.com/random';

async function getActivity(){
    const response = await axios.get(bordomAPI);
}

const weatherAPI = 'https://bored-api.appbrewery.com/random';

async function getWeather(){
    const response = await axios.get(weatherAPI);
}

