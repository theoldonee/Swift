// import {PostManager} from "./postManager.js"

var id, user, app;

window.onload = function (){
    id = window.location.search.split("?")[1];

    accountPageinitialize();
}

// function appLoad(userID){
//     id = userID;
//     console.log(id);
//     injectApp();
//     accountPageinitialize();
//     feedInitialize();
// }

function injectApp(){
    $("section").html(app);
}

async function getUserData(userId){
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

async function accountPageinitialize(){
    $("#feed_option").click( () => {
        $("#feed_option").addClass("selected_option");
        $("#chat_option").removeClass("selected_option");
        $("#account_option").removeClass("selected_option");
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
    });

    var result = await getUserData(id);

    user = result.result;
    setUserName(user.userName);
    setName(user.firstName, user.lastName);
    setProfileImage(user.profile_img);
    setFollowingInfo(
        user.post.length, 
        user.following.length, 
        user.followers.length
    );

    // getPost(user.post);
    $(".follow_button").click( () => {
        if($(".follow_button").hasClass("following_button")){
            $(".follow_button").removeClass("following_button");
            unfollow();
            $(".follow_button b").text("follow");
        }else{
            $(".follow_button").addClass("following_button");
            $(".follow_button b").text("following");
            follow();
        }
    });

    $("#search_icon").click( () => {
        // this.searchDivDisplay("down");
        searchDivDisplay("down");
    });

    $(".suggested_friend_username").click( () => {
        // this.searchDivDisplay("down");
        searchDivDisplay("down");
    });

    $("#close_serach").click( () => {
        // this.searchDivDisplay("up");
        searchDivDisplay("up");
    });

}

function searchDivDisplay(state){
    if(state == "down"){
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
    }else{

        $(".search_result_div").slideUp({
            duration: 'fast'
        });
    }
}

function follow(){
    alert("FOLLOWING");
}

function unfollow(){
    alert("UNFOLLOWING")
}

function setUserName(userName){
    $(".panel_icon_text").html(`
        <span><b>${userName}</b></span>
    `);

    $(".user_username").html(`
        <span><b>${userName}</b></span>
    `);
    
}

function setProfileImage(path){
    
    $("#panel_user_profile_img").attr("src", path);
    $("#user_profile_img").attr("src", path);
    $(".user_post_profile_img").attr("src", path);


}

function setName(firstName, lastName){
    $("#user_name").html(`
        <span><b>${firstName}</b> <b>${lastName}</b></span>
        `)
}

function setFollowingInfo(post, following, followers){
    $("#user_post_count").text(`${post}`);

    $("#user_following_count").text(`${following}`);

    $("#user_followers_count").text(`${followers}`);
}


async function  getPost(posts){
    for (var postID of posts){
        try{
            var response = await fetch( `/M00933241/contents?id=${postID}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result = await response.json();
            var postJSON = result.post;
            var post = PostManager.constructPost(postJSON);
            injectPost(post, postJSON._id);

        }catch(err){
            console.log("Issue getting data of user \nError: " + err);
        }
    }
}


function injectPost(post, postID){

    $(".user_post").append(post);
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
}

function feedInitialize(){

    $(".nav_bottom_icons i").click( () => {
        $(".create_post_div").slideToggle();
    });

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

            document.getElementById("create_post_img").src = result;
            img = result;
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
            
            sendUserPost(post, img);
            
        };

    });
}

async function  sendUserPost(postData, imageData){
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


