import { AppManager } from "./appManager.js";

export{
    ChatManager
}

class ChatManager{
    static contacts = [];
    static userId;
    static currentConversation;
    static chatGetInterval;
    static chatCancelInterval;

    static chatInitialize(){
        this.getUserContacts();
    }
    
    // 
    static async getUserContacts(){

        try{
            var response = await fetch(`/M00933241/${this.userId}/contacts`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            // Converts response to json format
            var result = await response.json();
            var contactList = result.contactList;

           for (var contactJson of contactList){
                var contactString = this.createContact(contactJson);
                this.initializeContact(contactString, contactJson.contactId, contactJson)
           }
            

        }catch(err){
            console.log("Could not get Contacts \nError: " + err)
        }
    }

    // 
    static createContact(contactJson){
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


    // 
    static initializeContact(contactString, contactId, contactJson){
        $(".contacts").append(contactString);

        $(`#${contactId}_contact`).click( async () => {
            this.currentConversation = contactId;
            var convoObj = await ChatManager.getConversation(contactId, contactJson);
            var conversationString = convoObj.conversationString;
            var conversation = convoObj.conversation;
            ChatManager.initializeConversation(conversationString, conversation.chats);
        }); 
    }

    // 
    static async getConversation(contactId, contactJson){
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
            var conversationString = this.createConversation(contactJson);
            return {
                conversation: conversation,
                conversationString: conversationString
            };

        }catch(err){
            console.log("Could not get Contacts \nError: " + err)
        }
    }

    // 
    static createConversation(contactJson){
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

    // 
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
            this.sendChat(contactId, chat);

        });

        // start chat get
        if( this.chatGetInterval && this.chatCancelInterval){
            clearInterval(this.chatGetInterval);
            clearInterval(this.chatCancelInterval);
        }

        this.chatGetInterval = setInterval(ChatManager.getChats(), 1000);
        this.chatCancelInterval = setInterval(ChatManager.stopChatGet(), 1000);
    }

    // 
    static createChatBlock(chatJson){
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

    // // 
    static async sendChat(contactId, chat){
        var request  = JSON.stringify(chat);
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
            if(!result.result.acknowledged){
                alert("Could not send message. Try again later");
            }

        }catch(err){
            console.log("Could not send text \nError: " + err)
        }
    }

    static async getChats(){
        try{
            var response = await fetch(`/M00933241/conversation/chat?party1=${this.userId}&party2=${this.currentConversation}`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            // Converts response to json format
            var result = await response.json();
            var chatList = result.chatList
            if(chatList){
                console.log(chatList);
                $(".conversation_display").html(" ");
                ChatManager.loadChats(chatList);
            }

        }catch(err){
            console.log("Could not send text \nError: " + err)
        }
    }

    static loadChats(chatList){
        for (var chatJson of chatList){
            var chatBlock = this.createChatBlock(chatJson);
            $(".conversation_display").prepend(chatBlock);
        }
    }

    static stopChatGet(){
        console.log(AppManager.currentPage);
        if(AppManager.currentPage != "chat"){
            clearInterval(this.chatGetInterval);
            clearInterval(this.chatCancelInterval);
        }
    }

}

