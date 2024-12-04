import { MongoClient, ServerApiVersion, ObjectId} from "mongodb";

const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

const database = client.db("Swift_DB");
const userCollection = database.collection("User");
const chatsCollection = database.collection("Chats");
const postCollection = database.collection("Post");
const loginCollection = database.collection("Loggedin");

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
        var log = await this.isLogged(user.email);

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

                // Get's and returns  update result
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

        // Query for email
        var query = {userName: idTag};

        
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

        // Set update parameters
        var followedUpdate = {$set: {followers: followed.followers}};
        var followerUpdate = {$set: {following: follower.following}};
       


        var followedResult, followerResult, followedDetails, followerDetails, indexOfFollower, indexOfFollowed ;
        
        // Follower details
        followerDetails = { 
            userId: new ObjectId(follower._id)
        }

        // Followed details
        followedDetails = {
            userId: new ObjectId(followed._id)
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
            indexOfFollower = followed.followers.indexOf(followerDetails);
            followed.followers.splice(indexOfFollower, 1);

            // Removes followed user to following list
            indexOfFollowed = follower.following.indexOf(followedDetails);
            follower.following.splice(indexOfFollowed, 1);
        }

        // Updates user collection
        followedResult = await userCollection.updateOne(followedQuery, followedUpdate);
        followerResult = await userCollection.updateOne(followerQuery, followerUpdate);

        // Returns result
        return {
            followedResult: followedResult, 
            followerResult: followerResult
        };

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

        var query = {_id: new ObjectId(postId)};
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

    static async getPosts(idTag){
        var captionQuery = {caption: {$regex: `${idTag}`}};
        var tagQuery = {tags: {$regex: `${idTag}`}};

        var postByCaption =  await postCollection.find(captionQuery).toArray();
        var postByTag =  await postCollection.find(tagQuery).toArray();
        
        return {
            postByCaption: postByCaption,
            postByTag: postByTag
        }
    }
}
