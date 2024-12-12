// Imports
import { AppManager } from "./appManager.js";

// Exports
export{
    PostManager
};

// PostManager class
class PostManager{

    static postFollowing;
    static userId;
    static displayedPost = [];
    static postLikesInterval = {};

    // Constructs post
    static constructPost(postJSON, following, userId){

        // Gets post following
       this.postFollowing = following;

        // Gets user id
       this.userId = userId;

        // Constructed post string
        var postConstruct = `
            <div class="post" id="${postJSON._id}_post">
                ${this.postProfile(postJSON.profile_img)}
                ${this.postContent(
                    postJSON.caption, 
                    postJSON.imgPath,
                    postJSON.authorUsername, 
                    postJSON._id, 
                    postJSON.likesCount,
                    postJSON.authorId
                )}
            </div>
        ` 
        return postConstruct;
    }
    

    // Constructs post profile
    static postProfile(path){

        // Returns profile string
        return`
        <div class="post_profile">
            <div class="post_profile_img">
                <img src="${path}" class="user_post_profile_img">
            </div>
        </div>
        `   
    }

    // Sets following status
    static setFollowing(postId, authorId){
        // Checks is following is true
        if(this.postFollowing){
            return `<span id="${postId}_${authorId}_follow" class="follow_button following_button"><b>following</b></span>`   
        }else if(authorId != this.userId){ // checks if author is not user
            return `<span id="${postId}_${authorId}_follow" class="follow_button"><b>follow</b></span>`
        }else{
            return ``
        }
    }
    
    // Constructs post content
    static postContent(caption, path, authorUsername, postId, likes, authorId, following){
        // Post content string
        var postContentDiv= `
            <div class="post_content_div">
                <div class="post_aurthor">
                    <div>
                        <span><b>${authorUsername}</b></span>
                    </div>
                    <span><b>.</b></span>
                    <div>
                        ${this.setFollowing(postId, authorId)}  
                    </div>
                </div>
                
                <div class="post_content">

                    ${caption != ""? 
                        `
                            <div class="post_text">
                                <span>
                                    ${caption}
                                </span>
                            </div>
                        `
                        : ``
                    }
                    
                    ${path != ""? 
                        `
                            <div class="post_img_div">
                                <img src="${path}" alt="Profile">
                            </div>
                        `
                        : ``
                    }

                    <div class="post_bar">
                        <div class="post_bar_icon like_icon" id="${postId}_like_icon">
                            <span id="${postId}_like_count">${likes}</span>
                            <i class="fa-regular fa-heart"></i>
                        </div>
                    </div>

                </div>

            </div>
        `

        return postContentDiv;
    }

    // Likes post
    static async likePost(postId, likeStatus){
        var data = {
            likedBy: this.userId,
            likeStatus: likeStatus
        }

        // Stringifies data
        var requestData = JSON.stringify(data);

        // Sends POST request to /M00933241/contents/:id/like path
        try{
            var response = await fetch(`/M00933241/contents/${postId}/like`,{
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: requestData
 
            });

            // Converts response to json format
            var result = await response.json();

            // Sets post result
            var postResult = result.postResult;

            // Checks if post was acknowledged
            if (postResult.acknowledged){

                // Checks if likestatus is equal to like
                if(likeStatus == "like"){
                    // Makes like icon solid and liked
                    $(`#${postId}_like_icon i`).removeClass("fa-regular");
                    $(`#${postId}_like_icon i`).addClass("fa-solid");
                    $(`#${postId}_like_icon`).addClass("liked");
                }else{
                    // Makes like icon regular and unliked
                    $(`#${postId}_like_icon`).removeClass("liked");
                    $(`#${postId}_like_icon i`).addClass("fa-regular");
                    $(`#${postId}_like_icon i`).removeClass("fa-solid");
                }
            }

        }catch(err){
            console.log("Could not like post \nError: " + err)
        }
    }

    // Gets post likes
    static async getLikes(postId){
        // Sends GET request to /M00933241/contents/:id/like path
        try{
            var response = await fetch(`/M00933241/contents/${postId}/like`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            // Converts response to json format
            var result = await response.json();

            // Sets like count
            var likesCount = result.likesCount;

            // Injects post likes into webpage
            $(`#${postId}_like_count`).html(likesCount);

        }catch(err){
            console.log("Could not like post \nError: " + err)
        }
    }

    // Starts get post likes interval
    static async startPostInterval(postId){

        // Checks if a post interval for a specific post  exist
        if(!(this.postLikesInterval[postId])){
            this.postLikesInterval[postId] = {};
        }

        // Sets liked interval id
        var likeIntervalId = this.postLikesInterval[postId].getPostInterval;

        // Sets cancel interval id
        var cancelIntervalId = this.postLikesInterval[postId].cancelInterval;

        // Checks if inteval exist
        if( likeIntervalId && cancelIntervalId){
            // Clears interval
            clearInterval(likeIntervalId);
            clearInterval(cancelIntervalId);
        }

        // Sets liked interval id
        this.postLikesInterval[postId].getPostInterval = setInterval(function () { PostManager.getLikes(postId) },  4000);

        // Sets cancel interval id
        this.postLikesInterval[postId].cancelInterval = setInterval(function () { PostManager.ShouldCancelLikesGet(postId) }, 1000);
    }

    // Cancels get post likes intervals
    static async ShouldCancelLikesGet(postId){
        // Checks if the app's current page is chat or home
        if (AppManager.currentPage == "chat" || AppManager.currentPage == "home"){
            // Sets liked interval id
            var likeIntervalId = this.postLikesInterval[postId].getPostInterval;

            // Sets cancel interval id
            var cancelIntervalId = this.postLikesInterval[postId].cancelInterval;

            // Clears interval
            clearInterval(likeIntervalId);
            clearInterval(cancelIntervalId);
        }
    }
    
}
