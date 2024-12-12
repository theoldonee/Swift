
// Exports
export{
    ChatManager
}

// Chat manager class
class ChatManager{
    static contacts = [];
    static userId;
    static currentConversation;
    static RoomID;
    static socket = io("ws://localhost:8080");

    // Initialize chat
    static chatInitialize(){
        // Gets user's contacts
        this.getUserContacts();
    }
    
    // Gets user's contacts
    static async getUserContacts(){
        // Sends GET request to /M00933241/:id/contacts path
        try{
            var response = await fetch(`/M00933241/${this.userId}/contacts`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            // Converts response to json format
            var result = await response.json();

            // Sets contact list array
            var contactList = result.contactList;

            // Itterates over contact list array
           for (var contactJson of contactList){
                // Creates contact string
                var contactString = this.createContact(contactJson);

                // Initializes contact
                this.initializeContact(contactString, contactJson.contactId, contactJson)
           }
            

        }catch(err){
            alert("Could not get Contacts. Try again later");
            console.log("Could not get Contacts \nError: " + err)
        }
    }

    // Creates contact string
    static createContact(contactJson){
        // Contact string
        var contatctString = `
            <div class="contact" id="${contactJson.contactId}_contact">
                <div class="contact_profile">
                    <img src="${contactJson.profile_img}" alt="profile_picture">
                </div>
                <div class="contact_username">
                    <span><b>${contactJson.userName}</b></span>
                </div>
            </div>
        `
        return contatctString;
    }


    // Initializes contact
    static initializeContact(contactString, contactId, contactJson){
        // Adds contact to webpage
        $(".contacts").append(contactString);

        // Detects when contact is clicked
        $(`#${contactId}_contact`).click( async () => {
            // Sets current conversation
            this.currentConversation = contactId;

            // Sets conversation object
            var convoObj = await ChatManager.getConversation(contactId, contactJson);
            
            // Sets conversation object string
            var conversationString = convoObj.conversationString;

            // Sets conversation 
            var conversation = convoObj.conversation;

            // Initializes conversation
            ChatManager.initializeConversation(conversationString, conversation.chats);

            // Joins room
            this.socket.emit("join room", this.RoomID);
        }); 
    }

    // Gets user's conversation
    static async getConversation(contactId, contactJson){

        // Sends GET request to /M00933241/conversation path
        try{
            var response = await fetch(`/M00933241/conversation?party1=${this.userId}&party2=${contactId}`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            // Converts response to json format
            var result = await response.json();
            var conversation = result.conversation;

            // Checks if a room already exist
            if( this.RoomID){
                // Leaves room
                this.socket.emit("leave room", this.RoomID);
            }

            // Sets room id
            this.RoomID = conversation._id;

            // Creates conversation string
            var conversationString = this.createConversation(contactJson);

            // Detects when message is sent
            this.socket.on("chat message", (msg) => {
                // Creates chat block
                var chatBlock = this.createChatBlock(msg);
                // Displays chat block
                $(".conversation_display").prepend(chatBlock);
            });

            return {
                conversation: conversation,
                conversationString: conversationString
            };

        }catch(err){
            alert("Could not get conversation. Try again later");
            console.log("Could not get conversation \nError: " + err)
        }
    }

    // Creates conversation string
    static createConversation(contactJson){
        // Conversation string
        var conversationString = `
            <div class="conversation_info">
                <div class="contact_profile">
                    <img src="${contactJson.profile_img}" alt="profile_img">
                </div>

                <div class="contact_username">
                    <span><b>${contactJson.userName}</b></span>
                </div>
            </div>

            <div class="conversation_display">
            
            
            </div>
                
            <div class="chat_input">
                <textarea name="user_text" id="user_chat_input" placeholder="Type a message...."></textarea>
                <i class="fa-solid fa-paper-plane" id="${contactJson.contactId}_send"></i>
            </div>
        
        `
        return conversationString;
    }

    // Initializes conversation
    static initializeConversation(conversationString, chats){
        $(".conversation").html(conversationString);

        for (var chatJson of chats){
            var chatBlock = this.createChatBlock(chatJson);
            $(".conversation_display").prepend(chatBlock);
        }

        $(".chat_input i").click( () => {
            var text = $(".chat_input textarea").val();
            var contactId = $(".chat_input i").attr("id").split("_")[0];
            $(".chat_input textarea").val("");

            var chat = {
                authorId: this.userId,
                content: text
            }

            var date = new Date(); 
            var time = date.getHours() + ':' + date.getMinutes();
            chat.timeStamp = time;

            this.sendChat(contactId, chat);

        });

    }

    // Creates chat block
    static createChatBlock(chatJson){
        // Chat string
        var chatString = `
            <div class="chat_block ${chatJson.authorId == this.userId ? "user_block" : "contact_block"}">
                <div class="chat_content  ${chatJson.authorId == this.userId ? "user_chat_content" : "contact_chat_content"}">
                    <div class="chat_text">
                        <span><b>${chatJson.content}</b></span>
                    </div>
                    <div class="send_time"><b>${chatJson.timeStamp}</b></div>
                </div>
            </div>
        
        `
        return chatString;
    }

    // Sends chat
    static async sendChat(contactId, chat){
        // Turns chat to json string
        var request  = JSON.stringify(chat);

        // Sends POST request to /M00933241/conversation path
        try{
            var response = await fetch(`/M00933241/conversation/chat?party1=${this.userId}&party2=${contactId}`,{
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: request
 
            });

            // Converts response to json format
            var result = await response.json();

            // Checks if result is acknowledged
            if(!result.result.acknowledged){
                alert("Could not send message. Try again later");
            }

        }catch(err){
            console.log("Could not send text \nError: " + err)
        }
    }

    // Loads chat block
    static loadChats(chatList){
        // Itterates over chat list
        for (var chatJson of chatList){
            // Creates chat block
            var chatBlock = this.createChatBlock(chatJson);
            // Displays chat block
            $(".conversation_display").prepend(chatBlock);
        }
    }

}

