// Imports
import { MongoClient, ServerApiVersion, ObjectId} from "mongodb";

// Connection string
const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

// Create connection
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

// Database
const database = client.db("Swift_DB");

// Collections
const userCollection = database.collection("User");
const conversationCollection = database.collection("Conversations");
const postCollection = database.collection("Post");
const loginCollection = database.collection("Loggedin");
const weatherCollection = database.collection("WeatherData");

// Database handler class
export class DatabaseHandler{
    
    // Returns all users in the user collection
    static async getAllUsers() {
        // Finds all users
        const users = await userCollection.find().toArray();

        // Returns user
        return users;
    }

    // Returns a user
    static async getUser(idTag) {
        var query;

        try{
            // Query for an ID match
            query = { _id: new ObjectId(`${idTag}`)};
        }catch{
            // Query for an email match
            query = {email: idTag};
        }
        

        // Searches user collection based on query
        var user =  await userCollection.find(query).toArray();

        // Checks if user lenght is 0
        if (user.length == 0){

            // Query for a username match
            query = {userName: idTag};
            user =  await userCollection.find(query).toArray();

            // Checks if user exist
            if (user.length == 0){
                return false;
            }
        }

        // Returns user
        return user[0];
    }

    // Returns all users
    static async getUsers(idTag){
        var userNameQuery = {userName: {$regex: `${idTag}`}};
        var firstNameQuery = {firstName: {$regex: `${idTag}`}};
        var lastNameQuery = {lastName: {$regex: `${idTag}`}};

        var userByUsername =  await userCollection.find(userNameQuery).toArray();
        var userByFirstName=  await userCollection.find(firstNameQuery).toArray();
        var userByLastName =  await userCollection.find(lastNameQuery).toArray();

        return {
            userByUsername: userByUsername,
            userByFirstName: userByFirstName,
            userByLastName: userByLastName
        }

    }

    // Checks is a user exist in the user collection
    static async isUser(idTag){
        // Gets a user
        var user = await this.getUser(idTag)

        // Checks if user data has been recieved
        if (user){
            return true;
        }else{
            return false;
        }

    }

    // Adds a user to user collection
    static async addUser(user){
        // Inserts user data into UUser Collection
        var result = await userCollection.insertOne(user);

        // Returns result
        return result;
    }

    // Updates user's profile image path
    static async updateProfilePath(id, profilePath){

        // Set query and update parameters
        var query = {_id: new ObjectId(id)};
        var update = {$set: {profile_img: profilePath}};

        // Gets update result
        var updateResult = await userCollection.updateOne(query, update);

        // Returns update result
        return updateResult;
    }

    // Updates user's post
    static async updateUserPost(postId, authorId){
        var user, query, update, userPost;

        // Gets user
        user = await this.getUser(authorId);

        userPost = user.post;
        // Adds new post to user's post
        userPost.push(postId);

        // Updates user's data in database
        query = {_id: new ObjectId(authorId)};
        update = {$set: {post: userPost}};

        // Gets update result
        var updateResult = await userCollection.updateOne(query, update);
        
        // Returns update result
        return updateResult;

    }

    // Gets user's post
    static async getUserPost(idTag){

        // Gets user
        var user = await this.getUser(idTag);

        // Returns user's post list
        return user.post;

    }

    // Removes a user to user collection
    static async deleteUser(idTag){
        // Query for an email match
        var query = {email: idTag};

        // Searches user collection based on query
        var result =  await userCollection.deleteOne(query);

        // Checks if a document has not been deleted
        if (result.deletedCount == 0){

            // Query for a username match
            query = {userName: idTag};
            result =  await userCollection.deleteOne(query);

            // Checks if a document has been deleted
            if (result.deletedCount == 0){
                // Returns result
                return result;
            }
        }

        // returns result
        return result;
    }

    // Updates logged in database.
    static async updateLogin({correctPassword, user, status} = {}){

        // Checks if user data already exist in Login collection
        var log = await this.isLogged(user._id);

        // Checks if user is not in logged collection
        if ((!log) && (correctPassword != "delete") ){
            // Adds data to collection
            var logTime = new Date();
            var data = {
                userId: new ObjectId(user._id),
                email: user.email,
                userName: user.userName,
                date: logTime,
                status: status
            };

            // Gets log insertion result
           var result = await loginCollection.insertOne(data);

           // Returns result
           return result;
            
        }else{

            // Checks if password is correct
            if(correctPassword == true){

                // Gets and returns  update result
                var result = await this.updateLogStatus(true, user.email);

                // Returns result
                return result;

            } else if(correctPassword == false){

                // Get's and returns update result
                var result = await this.updateLogStatus(false, user.email);

                // Returns result
                return result;

            }else{
                // Query for userId match
                const query = {userId: new ObjectId(user._id)};
                // Delete's data from log
                const result = await loginCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    // Returns result
                    return result;
                } else {
                    // Returns result
                    return result;
                }
            }
        }
        
    }

    // Checks if a user is logged in
    static async isLogged(idTag){
        var query;
        try{
            // Query for an ID match
            query = { userId: new ObjectId(`${idTag}`)};
        }catch{
            // Query for an email match
            query = {email: idTag};
        }
        
        // Searches loggedin collection based on query
        var user =  await loginCollection.find(query).toArray();
        if (user.length == 0){

            // Query for a username match
            query = {userName: idTag};

            // Get's user's log information
            user =  await loginCollection.find(query).toArray();
        }

        // Returns false if user does not exist login in collection
        if (user.length == 0){
            return false;
        }
        
        // Returns true
        return true;

    }

    // Updates login status
    static async updateLogStatus(status, email){
        // Query for an email match
        const query = {email: email};

        // Updates the login status of user
        const update = {
            $set: { status: status }
        }

        // Updates the login collection based on query
        var result = await loginCollection.updateOne(query, update);

        // Returns result
        return result;
    }

    // Gets a logged in user
    static async getloggedUser(idTag){

        // Query for an email match
        var query = {userName: idTag};

        // Searches the login collection based on query
        var user =  await loginCollection.find(query).toArray();

        // Checks if list is empty
        if (user.length == 0){

            // Query for a username match
            query = {userName: idTag};
            user =  await loginCollection.find(query).toArray();

            // Checks if user exist
            if (user.length == 0){
                return false;
            }
        }

        // Returns user
        return user[0];
    }

    // Handles follow and unfollow event
    static async followHandler(follow, followerIdTag, followedIdTag){
        // Get follower and followed user
        var follower = await this.getUser(followerIdTag);
        var followed = await this.getUser(followedIdTag);

        // Set queries
        var followedQuery = {_id: new ObjectId(followed._id)};
        var followerQuery = {_id: new ObjectId(follower._id)};


        var followedResult, followerResult, followedDetails, followerDetails, indexOfFollower, indexOfFollowed ;
        
        // Follower details
        followerDetails = { 
            userId: `${new ObjectId(follower._id)}`
        }

        // Followed details
        followedDetails = {
            userId: `${new ObjectId(followed._id)}`
        }

        // Checks if request is a follow request
        if (follow == true){
            // Adds follower to followers list
            followed.followers.push(
                followerDetails
            );
            
            // Adds followed user to following list
            follower.following.push(
                followedDetails
            );
            
        }else{

            // Removes follower to followers list
            var followedFollowers = followed.followers;

            // Itterates over follower list
            for(var index = 0; index < followedFollowers.length; index++){
                if(followedFollowers[index].userId == followerDetails.userId){
                    indexOfFollower = index;
                }
            }
            followed.followers.splice(indexOfFollower, 1);

            // Removes followed user to following list
            var followerFollowing = follower.following;

            // Itterates over following list
            for( var index = 0; index < followerFollowing.length; index++){
                if(followerFollowing[index].userId == followedDetails.userId){
                    indexOfFollowed = index;
                }
            }
            follower.following.splice(indexOfFollowed, 1);
        }

        // Set update parameters
        var followedUpdate = {$set: {followers: followed.followers}};
        var followerUpdate = {$set: {following: follower.following}};
       
        // Updates user collection
        followedResult = await userCollection.updateOne(followedQuery, followedUpdate);
        followerResult = await userCollection.updateOne(followerQuery, followerUpdate);

        // Returns result
        return {
            followedResult: followedResult, 
            followerResult: followerResult
        };

    }

    // Checks if users are friends
    static async isFriends(followerIdTag, followedIdTag){
        // Get follower and followed user
        var follower = await this.getUser(followerIdTag);
        var followed = await this.getUser(followedIdTag);

        var followedFollowers = followed.followers;

        var followResult1, followResult2

        // Checks if the followerIdTag is present in list
        for(var user of followedFollowers){
            if(user.userId == followerIdTag){
                followResult1 = true;
            }
        }
        
        var followerFollowers = follower.followers;
        // Checks if the followedIdTag is present in list
        for( var user of followerFollowers){
            if(user.userId == followedIdTag){
                followResult2 = true;
            }
        }

        if(followResult1 && followResult2){
           return true;
        }else{
            return false;
        }
    }

    // Handles friend addition and removal
    static async friendHandler(followerIdTag, followedIdTag, type){
        // Get user information
        var follower = await this.getUser(followerIdTag);
        var followed = await this.getUser(followedIdTag);

         // Set queries
         var followedQuery = {_id: new ObjectId(followed._id)};
         var followerQuery = {_id: new ObjectId(follower._id)};

         var followedUpdate, followerUpdate

        //  Checks type
        if(type == "add"){
            followed.friends.push(followerIdTag);
            follower.friends.push(followedIdTag);
            
            var isContact =  await this.isContact(follower.contacts, followerIdTag, followed.contacts, followedIdTag);
    
            if (!isContact){
                followed.contacts.push(followerIdTag);
                follower.contacts.push(followedIdTag);
            }
            
            
            // Set update parameters
            followedUpdate = {$set: {friends: followed.friends, contacts: followed.contacts}};
            followerUpdate = {$set: {friends: follower.friends, contacts: follower.contacts}};

         }else{

            var indexOfFollowedFriend, indexOfFollowerFriend
            // Removes follower from friend list
            var followedFriends = followed.friends;

            // Itterates over friend list
            for(var index = 0; index < followedFriends.length; index++){
                if(followedFriends[index].userId == followerIdTag){
                    indexOfFollowerFriend = index;
                }
            }
            // Removes friend
            followed.friends.splice(indexOfFollowerFriend, 1);

            // Removes followed user from friend list
            var followerFriends = follower.friends;

            // Itterates over friend list
            for( var index = 0; index < followerFriends.length; index++){
                if(followerFriends[index].userId == followedIdTag){
                    indexOfFollowedFriend = index;
                }
            }

            // Removes friend
            follower.friends.splice(indexOfFollowedFriend, 1);

            // Set update parameters
            followedUpdate = {$set: {friends: followed.friends}};
            followerUpdate = {$set: {friends: follower.friends}};
         }


         // Updates user collection
         var followedResult = await userCollection.updateOne(followedQuery, followedUpdate);
         var followerResult = await userCollection.updateOne(followerQuery, followerUpdate);

        // Retruns true if both updates have been acknowleded
        if(followedResult.acknowledged && followerResult.acknowledged){
            return true;
        }
    }

    // Checks if user is in contacts.
    static async isContact(followerContact, followerIdTag,  followedContact, followedIdTag){

        var contactResult1, contactResult2

        // Checks if the followerIdTag is present in list
        for(var user of followedContact){
            if(user == followerIdTag){
                contactResult1 = true;
            }
        }
        
        // Checks if the followedIdTag is present in list
        for( var user of followerContact){
            if(user == followedIdTag){
                contactResult2 = true;
            }
        }

        console.log(contactResult1, contactResult2);

        if(contactResult1 && contactResult2){
           return true;
        }else{
            return false;
        }
    }

    // Handles post
    static async addPost(post){

        // Creates Id object
        post.authorId = new ObjectId(post.authorId);

        // Gets result of post insertion into database
        var result = await postCollection.insertOne(post);

        // Returns result
        return result;
    }

    // Updates post Image path
    static async updatePostImgPath(postId, imgPath){

        // Search by Id
        var query = {_id: new ObjectId(postId)};
        // Sets update parameters
        var update = {$set: {imgPath: imgPath}};

        // Gets result of update
        var result = await postCollection.updateOne(query, update);

        // Returns result
        return result;
    }

    // Gets all post present in database
    static async getAllPost(){
        // get all post
        const posts = await postCollection.find().toArray();

        // Returns posts
        return posts;
    }

    // Gets a post
    static async getPost(idTag){
        // Create query
        var query = {_id: new ObjectId(idTag)};

        // Get's post
        var post = await postCollection.find(query).toArray();

        // Returns a post
        return post[0];
    }

    // Searches for post by string
    static async getPosts(idTag){
        // Searches by caption
        var captionQuery = {caption: {$regex: `${idTag}`}};

        // Search by tag
        var tagQuery = {tags: {$regex: `${idTag}`}};

        var postByCaption =  await postCollection.find(captionQuery).toArray();
        var postByTag =  await postCollection.find(tagQuery).toArray();

        // Returns results
        return {
            postByCaption: postByCaption,
            postByTag: postByTag
        }
    }

    // Updates a post's likes
    static async updatePostLike(idTag, likeStatus, userId){
            // Create query
            var query = {_id: new ObjectId(idTag)};

            // Gets post
            var post = await this.getPost(idTag);

            // Gets post likes
            var likes = post.likes;

            var update, likesCount;
            
            // Checks like status
            if( likeStatus == "like"){
                // Updates like count by 1
                likesCount = post.likesCount + 1;
                // Adds user to like array
                likes.push(userId);
                // Sets update parameters
                update = {$set: {likesCount: likesCount, likes: likes}};
            }else{

                // Updates like count by -1
                likesCount = post.likesCount - 1;

                // Removes user from like array
                var userIndex = likes.indexOf(userId);
                likes.splice(userIndex, 1);

                // Sets update parameters
                update = {$set: {likesCount: likesCount, likes: likes}};
            }
            

            // Updates post
            var postResult = await postCollection.updateOne(query, update);
            // Returns post result
            return postResult;
    
    }

    // Gets weather data from database
    static async getWeatherData(){
        // Gets last inserted weather data
        var result = await weatherCollection.findOne({}, {sort: { "entryTime": -1 }});

        // Returns weather data
        return result;
    }

    // Adds weather data to database
    static async addWeatherData(data){
        // Gets result insert
        var result = await weatherCollection.insertOne(data);

        // Returns addition result
        return result;
    }

    // Gets conversation
    static async getConversation(party1, party2){
        // Search query
        var query = {"$and": [{parties: {"$in": [party1]}}, {parties: {"$in": [party2]}}]}
        
        // Gets result of search
        var result = await conversationCollection.findOne(query);

        return result;
    }

    // Gets conversation id
    static async getConversationId(party1, party2){
        // Gets converstaion
        var conversation = await this.getConversation(party1, party2);

        return `${conversation._id}`;
    }

    // Adds conversation
    static async addConversation(party1, party2){
        var date = new Date();

        // Create conversation json
        var conversation = {
            parties: [party1, party2],
            chats: [],
            lastUpdated: {
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate(),
                hour: date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds(),
            }
        }

        var result = await conversationCollection.insertOne(conversation);

        // Returns insert result
        return result;

    }

    // Updates conversation
    static async updateConversation(party1, party2, chat){
        
        var date = new Date(); 
        // search query
        var query = {"$and": [{parties: {"$in": [party1]}}, {parties: {"$in": [party2]}}]};

        // Get Conversation
        var conversation = await this.getConversation(party1, party2);
        var chatList = conversation.chats
        chatList.push(chat);
        
        // Update parameters
        var update = {"$set": {
            lastUpdated: date, 
            chats: chatList
        }}
        
        // Returns update result
        var result = await conversationCollection.updateOne(query, update);

        return result;

    }

    // Get specific user conversations
    static async getUserConversation(user){
        // Search query
        var query = {parties: {"$in": [user]}};

        // Gets result of search 
        var result = await conversationCollection.find(query).sort({lastUpdated: -1}).toArray();
        return result;
    }
}
