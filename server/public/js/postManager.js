export{
    PostManager
};


class PostManager{

    static constructPost(postJSON){
        // var postOpenTag = `<div class="post">`
        
        // var postCloseTag = `</div>`

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
    
    
    static postContent(caption, path, aurthor, postId, likes, comments){
        
        
        var postContentDiv= `
            <div class="post_content_div">
                <div class="post_aurthor">
                    <div>
                        <span><b>${aurthor}</b></span>
                    </div>
                    <span><b>.</b></span>
                    <div>
                        <span id="${postId}_follow" class="follow_button"><b>.follow</b></span>
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
