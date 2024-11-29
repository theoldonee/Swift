import {PostManager} from "./postManager.js"
export {
    AppManager
};

var id, user, app, feedPage, chatPage, accountPage;

class AppManager{

    // Loads app and gets id value
    static appLoad(userID){
        id = userID;
        this.injectApp();
        this.feedInitialize();
    }

    // Initializes panel
    static panelInitialize() {


        $("#feed_option").click( () => {
            $("#feed_option").addClass("selected_option");
            $("#chat_option").removeClass("selected_option");
            $("#account_option").removeClass("selected_option");

            this.feedInitialize()
        });

        $("#chat_option").click( () => {
            $("#chat_option").addClass("selected_option");
            $("#feed_option").removeClass("selected_option");
            $("#account_option").removeClass("selected_option");
        });

        $("#account_option").click( () => {
            $("#account_option").addClass("selected_option");
            $("#chat_option").removeClass("selected_option");
            $("#feed_option").removeClass("selected_option");
            this.accountPageinitialize(); 
        });
    }
    
    // injects app into html
    static async injectApp(){
        $("section").html(app);

        // gets user data
        var result = await this.getUserData(id);
    
        user = result.result;

        // Initializes panel
        this.panelInitialize();

        // sets user name
        this.setUserName(user.userName);

        // sets profile picture
        this.setProfileImage(user.profile_img);
    }

    // Gets user data from server
    static async  getUserData(userId){
        try{
            var response = await fetch( `/M00933241/user?id=${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });
    
            var result = await response.json();
            return result;
    
        }catch(err){
            console.log("Issue getting data of user \nError: " + err);
        }
    }
    
    // Sets username of user
    static setUserName(userName){
        $(".panel_icon_text").html(`
            <span><b>${userName}</b></span>
        `);
    
        $(".user_username").html(`
            <span><b>${userName}</b></span>
        `);
        
    }
    
    // Sets user profile image
    static setProfileImage(path){
        
        $("#user_profile_img").attr("src", path);

        $("#user_account_profile_img").attr("src", path);

    }
    
    // Sets user's name in account page
    static setName(firstName, lastName){
        $("#user_name").html(`
            <span><b>${firstName}</b> <b>${lastName}</b></span>
            `)
    }
    
    // Displays users following info
    static setFollowingInfo(post, following, followers){
        $("#user_post_count").text(`${post}`);
    
        $("#user_following_count").text(`${following}`);
    
        $("#user_followers_count").text(`${followers}`);
    }
    
    // gets user's post from server
    static async getUserPost(posts){

        // Loops over user post ids
        for (var postID of posts){
            try{
                var response = await fetch( `/M00933241/contents/${postID}`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    }
                });
    
                var result = await response.json();
                var postJSON = result.post;
                var post = PostManager.constructPost(postJSON);
                this.injectPost(post, postJSON._id, "accountPage", postJSON.authorId);
    
            }catch(err){
                console.log(`Issue getting post ${postID} of user \nError: ` + err);
            }
        }
    }

    // Gets all available post from server
    static async getAllPost(){
       
            try{
                var response = await fetch( `/M00933241/contents?getBy="all"`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    }
                });
    
                var result = await response.json();
                var postList = result.posts;

                // Loops over all post to create and inject into web page
                for (var postJSON of postList){
                    var post = PostManager.constructPost(postJSON);
                    this.injectPost(post, postJSON._id, "feedPage", postJSON.authorId);
                }
    
            }catch(err){
                console.log(`Issue getting post of user \nError: ` + err);
            }
        
    }
    
    // Injects post into display div
    static injectPost(post, postID, page, authorId){
        
        // Checks the page which the post should be injected into
        if(page == "feedPage"){
            $(".feed").prepend(post);
        }else{
            $(".user_post").prepend(post);
        }
        
        // initializes post buttons
        $(`#${postID}_like_icon i`).click( () => {
            if ($(`#${postID}_like_icon`).hasClass("liked")){
                $(`#${postID}_like_icon`).removeClass("liked");
                $(`#${postID}_like_icon i`).addClass("fa-regular");
                $(`#${postID}_like_icon i`).removeClass("fa-solid");
            }else{
                $(`#${postID}_like_icon i`).removeClass("fa-regular");
                $(`#${postID}_like_icon i`).addClass("fa-solid");
                $(`#${postID}_like_icon`).addClass("liked");
            }
        });

        // Checks if a follow button is clicked
        $(`#${postID}_${authorId}_follow`).click( () => {
            if($(`#${postID}_${authorId}_follow`).hasClass("following_button")){
                this.unfollow(postID, authorId);
            }else{
                this.follow(postID, authorId);
            }
        });
    }

    static async follow(postId, authorId){
        var data, requestData;

        data ={
            followerIdTag: id,
            followedIdTag: authorId,
        }

        requestData = JSON.stringify(data);
        try{

            var response = await fetch( `/M00933241/follow`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: requestData
            });

            var result, followedResult, followerResult
            
            result = await response.json();
            followedResult = result.followedResult;
            followerResult = result.followerResult;

            if(followedResult.acknowledged && followerResult.acknowledged){
                $(`#${postId}_${authorId}_follow`).addClass("following_button");
                $(`#${postId}_${authorId}_follow b`).text("following");
            }

            
        }catch(err){
            console.log(`Issue making follow request \nError: ` + err);
        }

    }

    static async unfollow(postId, authorId){
        var data, requestData;
        data ={
            followerIdTag: id,
            followedIdTag: authorId,
        }

        requestData = JSON.stringify(data);
        try{
            var response = await fetch( `/M00933241/follow`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result, followedResult, followerResult
            
            result = await response.json();
            followedResult = result.followedResult;
            followerResult = result.followerResult;

            if(followedResult.acknowledged && followerResult.acknowledged){
                $(`#${postId}_${authorId}_follow`).removeClass("following_button");
                $(`#${postId}_${authorId}_follow b`).text("follow");
            }

        }catch(err){
            console.log(`Issue making unfollow request \nError: ` + err);
        }

    }
    
    // Initializes feedPage
    static feedInitialize(){
        $(".display").html(feedPage);
        $(".nav_bottom_icons i").click( () => {
            $(".create_post_div").slideToggle({
                duration: 'fast',
                step: function() {
                    if ($(this).css('display') == 'block') {
                        $(this).css('display', 'flex');
                    }
                },
                complete: function() {

                    if ($(this).css('display') == 'block') {
                        $(this).css('display', 'flex');
                    }
                }
            });
            
        });
        
        // this.getFeed();
        this.getAllPost();
        var post, img;
        post = {
            caption: '',
            tag: ''
        };
    
        img = '';
        
        // Detects chancges for file upload
        $('#create_post_upload').on("change", () => {
            var fr = new FileReader();
    
            // changes image source to choosen file.
            fr.onload = function(e) {
    
                document.getElementById("create_post_img").src = this.result;
                img = this.result;
            };
            
            var file =  $("#create_post_upload")[0].files[0]; // Uploaded file
    
            // Checks if file is an image
            if(file.type.match('image.*')){
                fr.readAsDataURL(file);
            }else{
                alert("Invalid file format");
            }
            
        });
    
        // Detects when post button is clicked
        $("#create_post_button").click( () => {
            post.caption = $("#create_post_caption").val();
            post.tags = $("#create_post_Tag").val();
    
            if (img == '' && post.caption  == ''){
                alert("You cannot make and empty post");
            }else{
                post.authorId = id;
                post.profile_img = user.profile_img
                post.authorUsername = user.userName;
                
                this.sendUserPost(post, img);
                
            };
    
        });
    }
    
    //  Send user's post to server
    static async sendUserPost(postData, imageData){
        var data, requestData;
    
        data = {
            postData: postData,
            imageData: imageData
        }
    
        requestData = JSON.stringify(data);
    
        try{
            const response = await fetch(`/M00933241/contents`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: requestData
            });
        
            const result = await response.json();
            console.log("Post result: " + result);
        }catch(err){
            console.log("Issue registering user " + err);
        }
    }
    
    // Initializes accountPage
    static async accountPageinitialize(){
        // Injects account page into display div
        $(".display").html(accountPage);
        
    
        this.setUserName(user.userName);
        this.setName(user.firstName, user.lastName);
        this.setProfileImage(user.profile_img);
        this.setFollowingInfo(
            user.post.length, 
            user.following.length, 
            user.followers.length
        );

        try{
            var response = await fetch( `/M00933241/${user._id}/contents?`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result = await response.json();
            var postList = result.post;

            this.getUserPost(postList);
        }catch(err){

        }
        
    
    }

}

app = ` 
    <div class="app">
        <div class="panel_div">
            <div class="panel_icon">
                <div>
                    <div class="panel_icon_img">
                        <img src="public/uploads/default_profile/default_profile.jpg" alt="Profile" id="user_profile_img">
                    </div>
                    
                    <div class="panel_icon_text">
                        <span><b>_username_</b></span>
                    </div>
                </div>
            </div>

            <div class="panel_option_div">

                <div class="panel_options" id="feed_option">
                    <div class="panel_option_name">
                        <i class="fa-solid fa-house"></i>
                        <span>Feed</span>
                    </div>
                    
                </div>

                <div class="panel_options" id="chat_option">
                    <div class="panel_option_name">
                        <i class="fa-solid fa-message"></i>
                        <span>Chat</span>
                    </div>
                </div>

                <div class="panel_options" id="account_option">
                    <div class="panel_option_name">
                        <i class="fa-solid fa-user"></i>
                        <span>Account</span>
                    </div>
                    
                </div>
            </div>

            <div id="logout_div">
                <Button id="logout_button">Logout</Button>
            </div>

        </div>

        <div class="display">
            
        </div>

    </div>
`

feedPage = `
    <div class="feed_div">
        <div class="feed">
        
        </div>

        <div class="more_info">
            <div class="weather">
                <div class="info_header">
                    <span><b>weather</b></span>
                </div>
                <div class="info">

                </div>
            </div>

            <div class="activity_suggestion">
                <div class="info_header">
                    <span><b>Activity suggestion</b></span>
                </div>
                <div class="suggestion">
                    <span><b>Activity:</b> Mow your neighbor's lawn</span>
                    <span><b>Type:</b> Charity</span>
                    <span><b>Participants:</b> 1</span>
                    <span><b>Duration:</b> Minutes</span>
                </div>

            </div>

        </div>
    </div>
    <div class="nav_bar_bottom">
        <div class="nav_bottom_icons">
            <i class="fa-regular fa-square-plus"></i>

            <div class="create_post_div">

                <div class="create_post_img_div">
                    <img src="public/uploads/default_profile/default_profile.jpg" alt="default_profile" id="create_post_img">
                    <div class="file_upload_div">
                        <label for="create_post_upload" class="create_upload_label">+</label>
                        <input type="file", id="create_post_upload">   
                    </div>
                </div>
                <div class="create_post_input_div">

                    <textarea name="caption_text" id="create_post_caption" placeholder="Caption"></textarea>
                    <textarea name="caption_tag" id="create_post_Tag" placeholder="Tag (#tag #tag)"></textarea>
                    
                </div>
                <div>
                    <button id="create_post_button">Post</button>
                </div>

            </div>
        </div>
        
    </div>
`
chatPage = `

`

accountPage = `
    <div class="account_display">
        <div class="account_info">
            <div class="user_info_div">
                <div class="user_profile_img">
                    <img src="" alt="profile_picture" id="user_account_profile_img">
                </div>
                <div class="user_info">
                    <div class="user_username">
                        <span><b></b></span>
                    </div>
                    <div class="follow_info">
                        <span><b id="user_post_count"></b> Post</span>
                        <span><b id="user_followers_count"></b> Followers</span>
                        <span><b id="user_following_count"></b> Following</span>
                    </div>
                    <div id="user_name">
                        <span><b>Gabby</b> <b>Babby</b></span>
                    </div>

                    <div id="user_buttons">
                        
                        <button id="edit_button">Edit profile</button>
                    </div>

                </div>
            </div>

            <div class="user_post">

            </div>
        </div>
    </div>
            

`