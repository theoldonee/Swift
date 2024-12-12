// Imports
import {PostManager} from "./postManager.js"
import { HomeManager } from "./home.js";
import { SearchAndSuggestionsManager } from "./searchAndSuggestions.js";
import { ChatManager } from "./chatManager.js";

// Exports
export {
    AppManager
};

var id, user, app, feedPage, chatPage, accountPage, allResults, createPost;

// App manager class
class AppManager{
    static currentPage;
    static getPostInterval;
    static cancelInterval;

    // Loads app and gets id value
    static appLoad(userID){
        // Sets id
        id = userID;

        // injects app
        this.injectApp();

        // feed initialization
        this.feedInitialize();

        // Sets current page to feed.
        AppManager.currentPage = "feed";

        // Sets feed_option as the default selected option.
        $("#feed_option").addClass("selected_option");
    }

    // Initializes panel
    static panelInitialize() {

        // Detects when the feed option has been clicked
        $("#feed_option").click( () => {
            // Clears displayed post
            PostManager.displayedPost = [];

            // Removes selected_option from all other options and adds it to the feed option
            $("#feed_option").addClass("selected_option");
            $("#chat_option").removeClass("selected_option");
            $("#account_option").removeClass("selected_option");

            // Sets current page to feed.
            AppManager.currentPage = "feed";
            this.feedInitialize()
        });

        // Detects when the chat option has been clicked
        $("#chat_option").click( () => {
            
            // Removes selected_option from all other options and adds it to the chat option
            $("#chat_option").addClass("selected_option");
            $("#feed_option").removeClass("selected_option");
            $("#account_option").removeClass("selected_option");

            // Sets current oage to chat
            AppManager.currentPage = "chat";
            this.chatPageInitialize();
        });
        
        // Detects when the account option has been clicked
        $("#account_option").click( () => {

            // Removes selected_option from all other options and adds it to the account option
            $("#account_option").addClass("selected_option");
            $("#chat_option").removeClass("selected_option");
            $("#feed_option").removeClass("selected_option");

            // Sets current page to home.
            AppManager.currentPage = "account";
            this.accountPageInitialize(); 
        });

        // Detects when the logout button has been clicked
        $("#logout_button").click( () => {
            // Sets current page to home.
            AppManager.currentPage = "home";
            // Logs user out
            this.logoutUser();
        });

    }

    // Logs out user.
    static async logoutUser(){
        // Sends DELETE request to  /M00933241/login path
        try{
            var response = await fetch( `/M00933241/login?id=${id}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Gets response in json format
            var result = await response.json();

            // Checks if request was acknowledged
            if(result.acknowledged){
                // Opens home page
                HomeManager.showHomePage();
            }
        }catch(err){
            console.log(`Issue logging out user \nError: ` + err);
        }
    }
    
    // injects app into html
    static async injectApp(){
        // Injects app string
        $("section").html(app);

        // gets user data
        var result = await this.getUserData(id);
        
        // Sets user
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
        // Sends GET request to /M00933241/user path
        try{
            var response = await fetch( `/M00933241/user?id=${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });
            
            // Gets response in json format
            var result = await response.json();
            return result;
    
        }catch(err){
            alert("Could not get user info. Try again later");
            console.log("Issue getting data of user \nError: " + err);
        }
    }

    // Get user following
    static async  getUserFollowing(type){
        // Sends GET request to /M00933241/:id/follow path
        try{
            var response = await fetch( `/M00933241/${id}/follow?listType=${type}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Gets response in json format
            var result = await response.json();

            // Checks following type
            if (type == "following"){
                // Sets user's following
                user.following = result.result;
            }else if (type == "followers"){
                // Sets user's followers
                user.followers = result.result;
            }
            
        }catch(err){
            console.log("Issue getting following of user \nError: " + err);
        }
    }

    // Sets username of user
    static setUserName(userName){
        // Injects username into panel
        $(".panel_icon_text").html(`
            <span><b>${userName}</b></span>
        `);

        // Injects username into account
        $(".user_username").html(`
            <span><b>${userName}</b></span>
        `);
        
    }
    
    // Sets user profile image
    static setProfileImage(path){
        
        // Sets panel profile picture
        $("#user_profile_img").attr("src", path);

        // Sets account profile picture
        $("#user_account_profile_img").attr("src", path);

    }
    
    // Sets user's name in account page
    static setName(firstName, lastName){
        // Injects first and last name into account page
        $("#user_name").html(`
            <span><b>${firstName}</b> <b>${lastName}</b></span>
        `);
    }
    
    // Displays users following info
    static setFollowingInfo(post, following, followers){
        // Sets post count
        $("#user_post_count").text(`${post}`);

        // Sets follow count
        $("#user_following_count").text(`${following}`);
         
        // Sets follower count
        $("#user_followers_count").text(`${followers}`);
    }
    
    // gets user's post from server
    static async getUserPost(posts){

        // Loops over user post ids
        for (var postID of posts){

            // Sends GET request to /M00933241/contents/:id path
            try{
                var response = await fetch( `/M00933241/contents/${postID}`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    }
                });
                
                // Gets response in json format
                var result = await response.json();
                var postJSON = result.post;

                // Constructs post
                var post = PostManager.constructPost(postJSON, false, id);

                // Injects post into webpage
                AppManager.injectPost(post, postJSON._id, "accountPage", postJSON.authorId, postJSON.likes);
    
            }catch(err){
                alert("Could not get user's post. Try again later");
                console.log(`Issue getting post ${postID} of user \nError: ` + err);
            }
        }
    }

    // Gets all available post from server
    static async getAllPost(){
            // Sends GET request to /M00933241/contents path
            try{
                const response = await fetch( `/M00933241/contents`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    }
                });
                
                // Gets response in json format
                var result = await response.json();
                var postList = result.posts;

                // Loops over all post to create and inject into web page
                for (var postJSON of postList){
                    
                    // Checks if user is following author
                    if(AppManager.isFollowing(postJSON.authorId) ){
                        var displayedPost = PostManager.displayedPost;

                        // Gets index of post
                        var index = displayedPost.indexOf(postJSON._id);

                        // Checks if post is not displayed
                        if(index == -1){
                            // Adds post id to displayed post array
                            PostManager.displayedPost.push(postJSON._id);

                            // Gets post string
                            var post = PostManager.constructPost(postJSON, true, id);

                            // Injects post into webpage
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
        }else if(page == "search_account"){
            $(".search_user_post").prepend(post);
        }

        // Itterates over liked list
        for (var user of likeList){
            // Checks if a current user has liked displayed post
            if( user == id){
                // Makes icon solid and liked
                $(`#${postId}_like_icon i`).removeClass("fa-regular");
                $(`#${postId}_like_icon i`).addClass("fa-solid");
                $(`#${postId}_like_icon`).addClass("liked");
            }
        }

        
        // initializes post buttons
        $(`#${postId}_like_icon i`).click( () => {
            // Checks if a post is already liked or not
            if ($(`#${postId}_like_icon`).hasClass("liked")){
                // Unlikes post
                PostManager.likePost(postId, "unlike");
            }else{
                // Likes post
                PostManager.likePost(postId, "like");
            }
        });

        // Checks if a follow button is clicked
        $(`#${postId}_${authorId}_follow`).click( () => {
            // Checks if followed button has class following_button
            if($(`#${postId}_${authorId}_follow`).hasClass("following_button")){
                // Unfollows author
                this.unfollow(authorId);
            }else{
                // Follows author
                this.follow(authorId);
            }
        });

        // Starts post interval for post
        PostManager.startPostInterval(postId);

    }


    // Sends follow request
    static async follow(authorId){
        var data, requestData;

        data ={
            followerIdTag: id,
            followedIdTag: authorId,
        }

        // Convers data to json string
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
            
            // Gets response in json format
            result = await response.json();

            // Sets followed result
            followedResult = result.followedResult;
            // Sets follower result
            followerResult = result.followerResult;

            // Checks if both results have been acknowledged
            if(followedResult.acknowledged && followerResult.acknowledged){
                // Updates follow button
                this.updateFollowButton(authorId, "following");

                // Gets user's following
                this.getUserFollowing("following");
            }
      
        }catch(err){
            alert("Could not follow user. Try again later");
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

        // Convers data to json string
        requestData = JSON.stringify(data);

        // Sends DELETE request to /M00933241/follow
        try{
            var response = await fetch( `/M00933241/follow`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                body: requestData
            });

            var result, followedResult, followerResult
            
            // Converts response to json format
            result = await response.json();

            // Sets followed result
            followedResult = result.followedResult;

            // Sets follower result
            followerResult = result.followerResult;

            // Checks if both results have been acknowledged
            if(followedResult.acknowledged && followerResult.acknowledged){
                // Updates follow button
                this.updateFollowButton(authorId, "unfollowing");

                // Gets user's following
                this.getUserFollowing("following");
            }

        }catch(err){
            alert("Could not unfollow user. Try again later");
            console.log(`Issue making unfollow request \nError: ` + err);
        }

    }
    
    // Initializes feedPage
    static async feedInitialize(){

        // Injects feed page
        $(".display").html(feedPage);
        
        // Sets search and suggestion userId
        SearchAndSuggestionsManager.userId = id;

        // Starts search and suggestion
        SearchAndSuggestionsManager.start();

        // Dettects create post icon click
        $(".nav_bottom_icons i").click( async() => {
            if($(".nav_bottom_icons").has('.create_post_div').length){
                // Slides up the create post div
                $(".create_post_div").slideUp();

                // Sets delay for create div removal
                setTimeout( 
                    function () {
                        $(".create_post_div").remove();
                    },
                    1000
                );

            }else{
                // Adds create div to nav_bottom_icons
                $(".nav_bottom_icons").append(createPost);

                // Slides down create post div
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

                // Initialize create post button
                this.initalizeCreatePost();
            }
            
        });

        // Detects search icon click
        $("#search_icon").click( async () => {
            // Slides down search div
            this.searchDivDisplay("down");
            
            $('.result_display').html(allResults);
            SearchAndSuggestionsManager.initializeNav();
            // Gets value of search
            var search = $("#search").val();

            // Searches based on search value
            await SearchAndSuggestionsManager.getUserSearch(search);
            await SearchAndSuggestionsManager.getContentSearch(search);

            // Sets result page
            SearchAndSuggestionsManager.resultPage = "account";

            // Adds class selected_nav_option to account_result
            $("#account_result").addClass("selected_nav_option");

            // Injects account result div 
            $(".results").html(`
                <div class="results_account">
                </div>
            `);
            
            // Clears displayed accounts
            SearchAndSuggestionsManager.displayedAccounts = [];
            // Displays account
            SearchAndSuggestionsManager.showResults(); 
        });
        
        // Detects close button click
        $("#close_serach").click( () => {

            // Removes selected_nav_option from all tabs 
            $("#account_result").removeClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");

            // Slides search div up
            this.searchDivDisplay("up");
        });

        // Gets weather forcast
        this.getWeatherForcast();

        // Gets all post
        await this.getAllPost();

        // Checs if post interval exist
        if(this.getPostInterval && this.cancelInterval){
            clearInterval(this.getPostInterval);
            clearInterval(this.cancelInterval);
        }

        // Creates get post interval and cancel interval
        this.getPostInterval = setInterval(this.getAllPost, 3000);
        this.cancelInterval = setInterval(this.ShouldCancelPostGet, 1000);

        // Detects activity suggestion click
        $(".activity_suggestion").click( () => {
            this.getSuggestion();
        });

    }

    // Gets activity suggestion
    static async getSuggestion(){
        // Sends GET request to /M00933241/activity path
        try{
            const response = await fetch("/M00933241/activity",{
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                }
            });

            // Convets response to json format
            var result = await response.json();
             console.log(result);
            
            // Injects activity into suggestion div
            $(".suggestion").html(`
                <span><b>Activity: </b>${result.activity}</span>
                <span><b>Type: </b>${result.type}</span>
                <span><b>Participants: </b>${result.participants}</span>
                <span><b>Duration: </b> ${result.duration}</span>
            `);
            

        }catch(err){
            console.log("Issue getting activity \nError: " + err);
        }
    }

    // Initializes create post buttons
    static initalizeCreatePost(){

        var post, img;

        // Post object
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
                // Gets image string
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
            // Sets post caption
            post.caption = $("#create_post_caption").val();

            // Sets post tags
            post.tags = $("#create_post_Tag").val();
            
            // Checks if image string is empty
            if (img == '' && post.caption  == ''){
                alert("You cannot make and empty post");
            }else{
                // Set post data
                post.authorId = id;
                post.profile_img = user.profile_img
                post.authorUsername = user.userName;
                
                // Send user's post
                this.sendUserPost(post, img);
                
            };
    
        });
    }

    // Cancels get post interval
    static ShouldCancelPostGet(){
        // Checks if current page is not feed 
        if (AppManager.currentPage != "feed"){
            // Clears displayed post
            PostManager.displayedPost = [];
            clearInterval(AppManager.getPostInterval);
            clearInterval(AppManager.cancelInterval);
        }   
    }

    // Displays or removes search display
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

    // Slides down search result
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
        
        // Converts data to json string
        requestData = JSON.stringify(data);
        
        // Sends GET request to /M00933241/activity path
        try{
            const response = await fetch(`/M00933241/contents`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: requestData
            });
            
            // Converts response to json format
            const result = await response.json();
        }catch(err){
            console.log("Issue registering user " + err);
        }
    }
    
    // Updates all follow buttons containind author Id
    static updateFollowButton(authorId, buttonState){
        // Gets follow buttons
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
    static async accountPageInitialize(){
        // Injects account page into display div
        $(".display").html(accountPage);
        
        
        // Sets user's information
        this.setUserName(user.userName);
        this.setName(user.firstName, user.lastName);
        this.setProfileImage(user.profile_img);

        // Gets user follwoing and followers
        await this.getUserFollowing("following");
        await this.getUserFollowing("followers");

        // Sets following
        this.setFollowingInfo(
            user.post.length, 
            user.following.length, 
            user.followers.length
        );

        // Sends GET request to /M00933241/:id/contents path
        try{
            const response = await fetch( `/M00933241/${user._id}/contents`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Converts response to json format
            var result = await response.json();
            // Sets post list
            var postList = result.post;
            // Gets user's post
            this.getUserPost(postList);
        }catch(err){
            console.log("Issue getting user's post list. \nError: " + err);

        }
        
    
    }

    // Starts chat page
    static async chatPageInitialize(){
        // Injects chat page into display div
        $(".display").html(chatPage);

        ChatManager.userId = id;
        // Gets chat functiionality running
        ChatManager.chatInitialize();
    }

    // Gets weather forcast
    static async getWeatherForcast(){
        // Sends GET request to /M00933241/weather path
        try{
            const response =  await fetch('/M00933241/weather', {
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                }
            });

            // Converts response to json format
            var result = await response.json();

            // Displays result values
            $("#minTemp").text(result.mintemp);
            $(".weather_content_display img").attr("src", result.condition.icon);
            $("#maxTemp").text(result.maxtemp);
            $("#avdHum").text(result.avghumidity);
            $("#rainChance").text(result.chanceofRain);
            $("#uv").text(result.uv);
        }catch(err){

        }
    }

}

// App html string 
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
// Feed page html string 
feedPage = `
    <div class="feed_div">
        <div class="feed">
        
        </div>

        <div class="more_info">
            <div class="weather">
                <div class="info_header">
                    <span><b>weather</b></span>
                </div>
                <div class="weather_info">
                    <div class="weather_panel">
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <span><b id="minTemp"></b><b>°c</b></span>
                            </div>
                            <div class="weather_content_name">
                                <span>minTemp</span>
                            </div>
                        </div>
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <img src="" alt="">
                            </div>
                        </div>
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <span><b id="maxTemp"></b><b>°c</b></span>
                            </div>
                            <div class="weather_content_name">
                                <span>maxTemp</span>
                            </div>
                        </div>
                    </div>
                    <div class="weather_panel">
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <span><b id="avdHum"></b></span>
                            </div>
                            <div class="weather_content_name">
                                <span>avgHum</span>
                            </div>
                        </div>
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <span><b id="rainChance"></b><b>%</b></span>
                            </div>
                            <div class="weather_content_name">
                                <span>Chance of rain</span>
                            </div>
                        </div>
                        <div class="weather_content">
                            <div class="weather_content_display">
                                <span><b id="uv"></b></span>
                            </div>
                            <div class="weather_content_name">
                                <span>UV</span>
                            </div>
                        </div>
                    </div>
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

                        

                    </div>
                </div>
            </div>

        </div>
    </div>
    <div class="nav_bar_bottom">
        <div class="nav_bottom_icons">
            <i class="fa-regular fa-square-plus tooltip">
                <span class="tooltiptext">Post</span>
            </i>  
        </div>
        
    </div>
`
// Chat page html string 
chatPage = `
    <div class="chat_display">
        <div class="contacts">
            
        </div>
        
        <div class="conversation">
            
        </div>
    </div>
`
// Accout page html string 
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

                </div>
            </div>

            <div class="user_post">

            </div>
        </div>
    </div>
            

`
// all results html string 
allResults = `
    <nav class="search_result">
        <ul>
            <li class="search_result_options" id="account_result">Accounts</li>
            <li class="search_result_options" id="tags_result">Tags</li>
            <li class="search_result_options" id="text_result">Caption</li>
        </ul>
    </nav>
    <div class="results">

    </div>
`

// create post html string 
createPost = `
    <div class="create_post_div">

        <div class="create_post_img_div">
            <img src="public/uploads/default_profile/default_profile.jpg" alt="default_profile" id="create_post_img">
            <div class="file_upload_div">
                <label for="create_post_upload" class="create_upload_label">+</label>
                <input type="file" id="create_post_upload">   
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
