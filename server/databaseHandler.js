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


export class DatabaseHandler{
    
    static async getAllUsers() {

        // Finds all users
        const users = await userCollection.find().toArray();

        console.log(users);
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

}

// db.collection.insertOne() 
// db.collection.insertMany()

// Deletes a single document that matches the search criteria 
// db.collection.deleteOne(): 
 
// Deletes multiple documents that match the search criteria 
// db.collection.deleteMany(): 
 
// db.collection.remove():