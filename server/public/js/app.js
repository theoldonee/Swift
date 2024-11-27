import {PostManager} from "./postManager.js"
var id, user;

window.onload = function (){
    // const params = new URL(location.href).searchParams;
    // console.log(params)
    // id = params.get('id');

    id = window.location.search.split("?")[1];
    // console.log(id);
    accountPageinitialize();
};


function appLoad(userID){
    id = window.location.search.split("?")[1];
    // id = userID;
    accountPageinitialize();
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
        // console.log(response);
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
    getPost(user.post);

}

function setUserName(userName){
    $(".panel_icon_text").html(`
        <span><b>${userName}</b></span>
    `);

    $(".user_username").html(`
        <span><b>${userName}</b></span>
    `);
    
    $(".user_post_aurthor").html(`
        <span><b>${userName}</b></span>
    `);
}

function setProfileImage(path){
    console.log(path);
    
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


async function getPost(posts){
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

