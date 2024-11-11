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
    
    static async getAllUsers() {
        // Finds all users
        const users = await userCollection.find().toArray();

        await client.close();
    }

    static async getUser(idTag) {
        // query for an email match
        var query = {email: idTag};

        // Searches database based on query
        var user =  await userCollection.find(query).toArray();

        if (user.length == 0){

            // query for a username match
            query = {userName: idTag};
            user =  await userCollection.find(query).toArray();

            // Checks if user
            if (user.length == 0){
                return false;
            }
        }

        return user[0];
    }

    static async isUser(idTag){
        var user = await this.getUser(idTag)

        if (user){
            return true;
        }else{
            return false;
        }

    }

    static async addUser(user){
        
        var result = await userCollection.insertOne(user);

        return result;
        // if (result == 1){
        //     return true;
        // }else{
        //     return false;
        // }

    }

    static async deleteUser(idTag){
        // query for an email match
        var query = {email: idTag};

        // Searches database based on query
        var result =  await userCollection.deleteOne(query);

        if (result.deletedCount == 0){

            // query for a username match
            query = {userName: idTag};
            result =  await userCollection.deleteOne(query);

            console.log("here" + result);
            // Checks if user
            if (result.deletedCount == 0){
                // console.log(result);
                return result;
            }
        }

        console.log(result);

        return result;
    }

    // Updates logged in database.
    static async updateLogin({correctPassword, user, status} = {}){
        var log = await this.isLogged(user.email);

        // checks if user is not in logged collection
        if ((!log) && (correctPassword != "delete") ){
            // adds data to collection
            var logTime = new Date();
            var data = {
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
                const query = {email: user.email};
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

        var query = {email: idTag};

        
        // Searches loggedin collection based on email
        var user =  await loginCollection.find(query).toArray();
        if (user.length == 0){

            // query for a username match
            query = {userName: idTag};

            user =  await loginCollection.find(query).toArray();
        }

        // Returns false if no user exist
        if (user.length == 0){
            return false;
        }
        

        return true;

    }

    static async updateLogStatus(status, email){
        // query for an email match
        const query = {email: email};

        const update = {
            $set: { status: status }
        }
        // Searches database based on query
        var result = await loginCollection.updateOne(query, update);

        return result;
    }

    static async getloggedUser(idTag){
        // query for an email match
        var query = {email: idTag};

        // Searches database based on query
        var user =  await loginCollection.find(query).toArray();

        if (user.length == 0){

            // query for a username match
            query = {userName: idTag};
            user =  await loginCollection.find(query).toArray();

            // Checks if user
            if (user.length == 0){
                return false;
            }
        }

        return user[0];
    }
}

// db.collection.insertOne() 
// db.collection.insertMany()

// Deletes a single document that matches the search criteria 
// db.collection.deleteOne(): 
 
// Deletes multiple documents that match the search criteria 
// db.collection.deleteMany(): 
 
// db.collection.remove():