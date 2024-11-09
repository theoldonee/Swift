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
        // const option = { age: { $lte: 30 } };

        const users = await userCollection.find().toArray();

        console.log(users);

        await client.close();
    }

    static async shouldLogin() {
        // for searching
        // const query = {$and : [{email: userEmail}, {password: password}]}
        const query = {email: userEmail}

        // for sorting
        // const option = { age: { $lte: 30 } };

        const users = await userCollection.find(query);

        console.log(users);

        await client.close();
    }

}

// db.collection.insertOne() 
// db.collection.insertMany()

// Deletes a single document that matches the search criteria 
// db.collection.deleteOne(): 
 
// Deletes multiple documents that match the search criteria 
// db.collection.deleteMany(): 
 
// db.collection.remove():