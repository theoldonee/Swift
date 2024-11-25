
var id, user;
window.onload = function (){
    // const params = new URL(location.href).searchParams;
    // console.log(params)
    // id = params.get('id');

    id = window.location.search.split("?")[1];
    // console.log(id);
    initialize();
};

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

async function initialize(){
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
    setProfileImage(user.profile_img);
}

function setUserName(userName){
    $(".panel_icon_text").html(`
        <span><b>${userName}</b></span>
    `);
}
function setProfileImage(path){
    console.log(path);
    $("#user_profile_img").attr("src", path);
}


