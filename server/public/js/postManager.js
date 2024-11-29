export{
    PostManager
};


class PostManager{

    static postFollowing;
    static userId;

    static constructPost(postJSON, following, userId){
        // var postOpenTag = `<div class="post">`
        
        // var postCloseTag = `</div>`
       this.postFollowing = following;
       this.userId = userId;

        var postConstruct = `
            <div class="post">
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
    
}
