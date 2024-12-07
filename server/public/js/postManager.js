import { AppManager } from "./appManager.js";

export{
    PostManager
};


class PostManager{

    static postFollowing;
    static userId;
    static displayedPost = [];
    static postLikesInterval = {};

    static constructPost(postJSON, following, userId){

       this.postFollowing = following;
       this.userId = userId;

        var postConstruct = `
            <div class="post" id="${postJSON._id}_post">
                ${this.postProfile(postJSON.profile_img)}
                ${this.postContent(
                    postJSON.caption, 
                    postJSON.imgPath,
                    postJSON.authorUsername, 
                    postJSON._id, 
                    postJSON.likesCount,
                    postJSON.commentCount,
                    postJSON.authorId
                )}
            </div>
        `
        
        return postConstruct;
    }
    

    static postProfile(path){
        return`
        <div class="post_profile">
            <div class="post_profile_img">
                <img src="${path}" class="user_post_profile_img">
            </div>
        </div>
        `   
    }

    static setFollowing(postId, authorId){
        if(this.postFollowing){
            return `<span id="${postId}_${authorId}_follow" class="follow_button following_button"><b>following</b></span>`   
        }else if(authorId != this.userId){
            return `<span id="${postId}_${authorId}_follow" class="follow_button"><b>follow</b></span>`
        }else{
            return ``
        }
    }
    
    
    static postContent(caption, path, authorUsername, postId, likes, comments, authorId, following){
        
        
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

                        <div class="post_bar_icon">
                            <span id="${postId}_comment_count">${comments}</span>
                            <i class="fa-regular fa-comment"></i> 
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
        var requestData = JSON.stringify(data);

        try{
            var response = await fetch(`/M00933241/contents/${postId}/like`,{
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: requestData
 
            });

            var result = await response.json();
            var postResult = result.postResult;

            if (postResult.acknowledged){

                if(likeStatus == "like"){
                    $(`#${postId}_like_icon i`).removeClass("fa-regular");
                    $(`#${postId}_like_icon i`).addClass("fa-solid");
                    $(`#${postId}_like_icon`).addClass("liked");
                }else{
                    $(`#${postId}_like_icon`).removeClass("liked");
                    $(`#${postId}_like_icon i`).addClass("fa-regular");
                    $(`#${postId}_like_icon i`).removeClass("fa-solid");
                }
            }

        }catch(err){
            console.log("Could not like post \nError: " + err)
        }
    }

    static async getLikes(postId){

        try{
            var response = await fetch(`/M00933241/contents/${postId}/like`,{
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
 
            });

            var result = await response.json();
            var likesCount = result.likesCount;

            $(`#${postId}_like_count`).html(likesCount);

        }catch(err){
            console.log("Could not like post \nError: " + err)
        }
    }

    static async startPostInterval(postId){

        // Checks if a post interval for a specific post  exist
        if(!(this.postLikesInterval[postId])){
            this.postLikesInterval[postId] = {};
        }

       

        var likeIntervalId = this.postLikesInterval[postId].getPostInterval;
        var cancelIntervalId = this.postLikesInterval[postId].cancelInterval;

        if( likeIntervalId && cancelIntervalId){
            clearInterval(likeIntervalId);
            clearInterval(cancelIntervalId);
        }

        this.getPostInterval = setInterval(function () { PostManager.getLikes(postId) },  4000);
        this.cancelInterval = setInterval(function () { PostManager.ShouldCancelLikesGet(postId) }, 1000);
    }

    static async ShouldCancelLikesGet(postId){
        if (AppManager.currentPage != "feed"){

            var likeIntervalId = this.postLikesInterval[postId].getPostInterval;
            var cancelIntervalId = this.postLikesInterval[postId].cancelInterval;

            clearInterval(likeIntervalId);
            clearInterval(cancelIntervalId);
        }
    }
    
}
