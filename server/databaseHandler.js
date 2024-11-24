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

        return result;
    }

    // Updates user's profile image path
    static async updateProfilePath(id, profilePath){

        var query = {_id: new ObjectId(id)}
        var update = {$set: {profile_img: profilePath}}
        var followedResult = await userCollection.updateOne(query, update);
        
        return followedResult;
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
                return result;
            }
        }

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
           var result = await loginCollection.insertOne(data);
           return result;
            
        }else{
            // Checks if password is correct
            if(correctPassword == true){

                var result = await this.updateLogStatus(true, user.email);
                return result;

            } else if(correctPassword == false){

                var result = await this.updateLogStatus(false, user.email);
                return result;

            }else{
                // Query for userId match
                const query = {userId: new ObjectId(user._id)};
                const result = await loginCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    return result;
                } else {
                    return result;
                }
            }
        }
        
    }

    // Checks if a user is logged in
    static async isLogged(idTag){

        // Query for email
        var query = {email: idTag};

        
        // Searches loggedin collection based on query
        var user =  await loginCollection.find(query).toArray();
        if (user.length == 0){

            // Query for a username match
            query = {userName: idTag};

            user =  await loginCollection.find(query).toArray();
        }

        // Returns false if user does not exist login in collection
        if (user.length == 0){
            return false;
        }
        
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

        return result;
    }

    // Gets a logged in user
    static async getloggedUser(idTag){

        // Query for an email match
        var query = {email: idTag};

        // Searches the login collection based on query
        var user =  await loginCollection.find(query).toArray();

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
        var followedQuery = {email: followed.email};
        var followerQuery = {email: follower.email};

        // Set update parameters
        var followedUpdate = {$set: {followers: followed.followers}};
        var followerUpdate = {$set: {following: follower.following}};
       


        var followedResult, followerResult, followedDetails, followerDetails, indexOfFollower, indexOfFollowed ;
        
        // Follower details
        followerDetails = { 
            userId: new ObjectId(follower._id),
            email: follower.email,
            userName: follower.userName,
            firstName: follower.firstName,
            lastName: follower.lastName
        }

        // Followed details
        followedDetails = {
            userId: new ObjectId(followed._id),
            email: followed.email,
            userName: followed.userName,
            firstName: followed.firstName,
            lastName: followed.lastName
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

        post.authorId = new ObjectId(post.authorId);
        
        var result = await postCollection.insertOne(post);

        return result;
    }

    static async getPost(_id){
        
        var query = {_id: new ObjectId(_id)};
        var post = await postCollection.find(query).toArray();
        return post[0];
    }
}

// db.collection.remove():