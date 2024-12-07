import {PostManager} from "./postManager.js"
import { HomeManager } from "./home.js";
import { SearchAndSuggestionsManager } from "./searchAndSuggestions.js";

export {
    AppManager
};

var id, user, app, feedPage, chatPage, accountPage, allResults, createPost;

class AppManager{
    static currentPage;
    static getPostInterval;
    static cancelInterval;

    // Loads app and gets id value
    static appLoad(userID){
        id = userID;
        this.injectApp();
        this.feedInitialize();
    }

    // Initializes panel
    static panelInitialize() {

        $("#feed_option").click( () => {
            PostManager.displayedPost = [];
            $("#feed_option").addClass("selected_option");
            $("#chat_option").removeClass("selected_option");
            $("#account_option").removeClass("selected_option");
            AppManager.currentPage = "feed";
            console.log(AppManager.currentPage);
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
            AppManager.currentPage = "account";
            console.log(AppManager.currentPage);
            this.accountPageinitialize(); 
        });

        $("#logout_button").click( () => {
            AppManager.currentPage = "home";
            this.logoutUser();
        });

    }

    static async logoutUser(){
        try{
            var response = await fetch( `/M00933241/login?id=${id}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result = await response.json();
            if(result.acknowledged){
                HomeManager.showHomePage();
            }
        }catch(err){
            console.log(`Issue logging out user \nError: ` + err);
        }
    }
    
    // injects app into html
    static async injectApp(){
        $("section").html(app);

        // gets user data
        var result = await this.getUserData();
    
        user = result.result;

        // Initializes panel
        this.panelInitialize();

        // sets user name
        this.setUserName(user.userName);

        // sets profile picture
        this.setProfileImage(user.profile_img);
    }

    // Gets user data from server
    static async  getUserData(){
        try{
            var response = await fetch( `/M00933241/user?id=${id}`, {
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

    // Get user following
    static async  getUserFollowing(type){
        try{
            var response = await fetch( `/M00933241/${id}/follow?listType=${type}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });
    
            var result = await response.json();

            if (type == "following"){
                user.following = result.result;
            }else if (type == "followers"){
                user.followers = result.result;
            }
            
        }catch(err){
            console.log("Issue getting following of user \nError: " + err);
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
                var post = PostManager.constructPost(postJSON, false, id);
                
                AppManager.injectPost(post, postJSON._id, "accountPage", postJSON.authorId, postJSON.likes);
    
            }catch(err){
                console.log(`Issue getting post ${postID} of user \nError: ` + err);
            }
        }
    }

    // Gets all available post from server
    static async getAllPost(){
       
            try{
                const response = await fetch( `/M00933241/contents?getBy="all"`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    }
                });
    
                var result = await response.json();
                var postList = result.posts;

                // Loops over all post to create and inject into web page
                for (var postJSON of postList){
                    
                    // Checks if user is following author
                    if(AppManager.isFollowing(postJSON.authorId) ){
                        var displayedPost = PostManager.displayedPost;

                        var index = displayedPost.indexOf(postJSON._id);

                        if(index == -1){
                            PostManager.displayedPost.push(postJSON._id);
                            var post = PostManager.constructPost(postJSON, true, id);
                            AppManager.injectPost(post, postJSON._id, "feedPage", postJSON.authorId, postJSON.likes);
                        }
                        
                    }
                    
                }
    
            }catch(err){
                console.log(`Issue getting post of user \nError: ` + err);
            }
        
    }

    // Checks if user is following author
    static isFollowing(authorId){

        // itterates over user following
        for(var followings of user.following){
            // Checks if following userId is equal to authorId
            if(followings.userId == authorId){
                return true;
            }
        }
    }
    
    // Injects post into display div
    static injectPost(post, postId, page, authorId, likeList){
        
        // Checks the page which the post should be injected into
        if(page == "feedPage"){
            $(".feed").prepend(post);
        }else if(page == "accountPage"){
            $(".user_post").prepend(post);
        }else if(page == "tag"){
            $(".results_tags").prepend(post);
        }else if(page == "caption"){
            $(".results_text").prepend(post);
        }

        for (var user of likeList){
            if( user == id){
                $(`#${postId}_like_icon i`).removeClass("fa-regular");
                $(`#${postId}_like_icon i`).addClass("fa-solid");
                $(`#${postId}_like_icon`).addClass("liked");
            }
        }

        
        // initializes post buttons
        $(`#${postId}_like_icon i`).click( () => {
            // Checks if a post is already liked or not
            if ($(`#${postId}_like_icon`).hasClass("liked")){
                PostManager.likePost(postId, "unlike");
            }else{
                PostManager.likePost(postId, "like");
            }
        });

        // Checks if a follow button is clicked
        $(`#${postId}_${authorId}_follow`).click( () => {
            if($(`#${postId}_${authorId}_follow`).hasClass("following_button")){
                this.unfollow(authorId);
            }else{
                this.follow(authorId);
            }
        });

        PostManager.startPostInterval(postId);

    }


    // Sends follow request
    static async follow(authorId){
        var data, requestData;

        data ={
            followerIdTag: id,
            followedIdTag: authorId,
        }

        requestData = JSON.stringify(data);
        // Sends POST request to /M00933241/follow
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

            // Checks if both results have been acknowledged
            if(followedResult.acknowledged && followerResult.acknowledged){
                this.updateFollowButton(authorId, "following");
                this.getUserFollowing("following");
            }

            
        }catch(err){
            console.log(`Issue making follow request \nError: ` + err);
        }

    }

    // Sends unfollow request
    static async unfollow(authorId){
        var data, requestData;
        data ={
            followerIdTag: id,
            followedIdTag: authorId,
        }

        requestData = JSON.stringify(data);
        // Delete request to /M00933241/follow
        try{
            var response = await fetch( `/M00933241/follow`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                body: requestData
            });

            var result, followedResult, followerResult
            
            result = await response.json();
            followedResult = result.followedResult;
            followerResult = result.followerResult;

            // Checks if both results have been acknowledged
            if(followedResult.acknowledged && followerResult.acknowledged){
                this.updateFollowButton(authorId, "unfollowing");
                this.getUserFollowing("following");
            }

        }catch(err){
            console.log(`Issue making unfollow request \nError: ` + err);
        }

    }
    
    // Initializes feedPage
    static async feedInitialize(){
        $(".display").html(feedPage);

        SearchAndSuggestionsManager.userId = id;
        SearchAndSuggestionsManager.start();


        $(".nav_bottom_icons i").click( async() => {
            console.log("here")
            if($(".nav_bottom_icons").has('.create_post_div').length){

                $(".create_post_div").slideUp();
                setTimeout( 
                    function () {
                        $(".create_post_div").remove();
                    },
                    1000
                );

                // $(".create_post_div").remove();

            }else{
                $(".nav_bottom_icons").append(createPost);

                $(".create_post_div").slideDown({
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

                this.initalizeCreatePost();
            }
            
        });



        $("#search_icon").click( async () => {
            this.searchDivDisplay("down");

            var search = $("#search").val();

            await SearchAndSuggestionsManager.getUserSearch(search);
            await SearchAndSuggestionsManager.getContentSearch(search);
            SearchAndSuggestionsManager.resultPage = "account";


            $("#account_result").addClass("selected_nav_option");

            $(".results").html(`
                <div class="results_account">
                </div>
            `);
            
            SearchAndSuggestionsManager.displayedAccounts = [];
            SearchAndSuggestionsManager.showResults(); 
        });
    
        $(".suggested_friend_username").click( () => {
            this.searchDivDisplay("down");
        });
    
        $("#close_serach").click( () => {
            $("#account_result").removeClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");
            this.searchDivDisplay("up");
        });

        await this.getAllPost();

        if(this.getPostInterval && this.cancelInterval){
            clearInterval(this.getPostInterval);
            clearInterval(this.cancelInterval);
        }

        this.getPostInterval = setInterval(this.getAllPost, 3000);
        this.cancelInterval = setInterval(this.ShouldCancelPostGet, 1000);

    }

    static initalizeCreatePost(){

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
            
            // Checks if image string is empty
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

    // Cancels get post interval
    static ShouldCancelPostGet(){
        // Checks if current page is not feed 
        if (AppManager.currentPage != "feed"){
            PostManager.displayedPost = [];
            clearInterval(AppManager.getPostInterval);
            clearInterval(AppManager.cancelInterval);
        }
            
        
    }

    static searchDivDisplay(state){
        // Checks if search div is down or up
        if(!state || state == "down"){
            // Slides search dive down
            this.slideDownResult()
        }else{
            // Slidees search div up
            $(".search_result_div").slideUp({
                duration: 'fast'
            });
        }
    }

    static slideDownResult(){
        $(".search_result_div").slideDown({
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
        }catch(err){
            console.log("Issue registering user " + err);
        }
    }
    
    // Updates all follow buttons containind author Id
    static updateFollowButton(authorId, buttonState){
        var followButtonList = $(".follow_button");
        
        // itterates over the list of follow buttons
        for (var button of followButtonList){
            var buttonId = $(button).attr("id");

            // checks if the follow button contains the author's id
            if (buttonId.includes(authorId)){
                // checks if the button state is following or unfollowing
                if(buttonState == "following"){
                    $(`#${buttonId}`).addClass("following_button");
                    $(`#${buttonId} b`).text("following");
                }else{
                    $(`#${buttonId}`).removeClass("following_button");
                    $(`#${buttonId} b`).text("follow");
                }
            }
                
            
        }
    }

    // Initializes accountPage
    static async accountPageinitialize(){
        // Injects account page into display div
        $(".display").html(accountPage);
        
        
        // Sets user's information
        this.setUserName(user.userName);
        this.setName(user.firstName, user.lastName);
        this.setProfileImage(user.profile_img);

        await this.getUserFollowing("following");
        await this.getUserFollowing("followers");

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

            <div class="search_suggestion">
                <div class="info_header">
                    <span><b>Search</b></span>
                </div>
                <div class="search_div">
                    <input type="text" id="search" placeholder="Search...(Tags, users)">
                    <i class="fa-solid fa-magnifying-glass" id="search_icon"></i>
                </div>
                <div class="friend_suggestion_div">
                    <div class="friend_suggestion_info">
                        <span>Friend Suggestion</span>
                    </div>
                    <div class="friend_suggestion">

                    </div>
                </div>

                <div class="search_result_div">
                    <div class="close_serach_div">
                        <i class="fa-solid fa-x" id="close_serach"></i>
                    </div>

                    <div class="result_display">

                        <nav class="search_result">
                            <ul>
                                <li class="search_result_options" id="account_result">Accounts</li>
                                <li class="search_result_options" id="tags_result">Tags</li>
                                <li class="search_result_options" id="text_result">Caption</li>
                            </ul>
                        </nav>
                        <div class="results">

                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
    <div class="nav_bar_bottom">
        <div class="nav_bottom_icons">
            <i class="fa-regular fa-square-plus"></i>

            
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

allResults = `
    <nav class="search_result">
        <ul>
            <li class="search_result_options">Accounts</li>
            <li class="search_result_options">Tags</li>
            <li class="search_result_options">Text</li>
        </ul>
    </nav>
    <div class="results">

    </div>
`
createPost = `
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
`
