import {AppManager} from "./appManager.js"

// Displays home page
function showHomePage(){
    $("section").html(homePage);

    $("#home_login").click( () => {
        $("#swift").addClass("shrink");
        setTimeout(grow, 1000, "login", "Login");
    });
    
    
    $("#home_register").click( () => {
        $("#swift").addClass("shrink");
        setTimeout(grow, 1000, "register", "Register");
    });
}

// Adds grow class
function grow(page, text){
    $("#swift").text(`${text}`);
    $("#swift").addClass("grow");
    if(page == "login"){
        setTimeout(showLoginPage, 2000);
    }else{
        setTimeout(showRegisterPage, 2000);
    }
}

// Displays login page
function showLoginPage(){
    $("section").html(loginPageString);
    $(".back_div").click( () => {
        back();
    });

    $("#login_button").click( () => {
        validateLogin();
    });
}

// Displays register page
 function showRegisterPage(){
    $("section").html(registerPageString);

    $("#next_button").click( async () => {
        validateRegistration();
    });

    $(".back_div").click( () => {
        back();
    });
}

// Shows final register page and gives functionality to all buttons
function showFinalRegisterPage(user){
    // Displays the final register page
    $("section").html(finalRegisterPageString);

    // Takes User back to the previous page
    $(".back_div").click( () => {
        back();
    });

    // Shows selected profile picture
    $('#file_upload').on("change", () => {
        var fr = new FileReader();

        // changes image source to choosen file.
        fr.onload = function(e) { 
            document.getElementById("profile_picture").src = this.result;
            user.profile_img = this.result;
        };
        
        var file = $("#file_upload")[0].files[0]; // Uploaded file

        // Checks if file is an imagr
        if(file.type.match('image.*')){
            fr.readAsDataURL(file);
        }else{
            alert("Invalid file format");
        }
    });

    $("#register_button").click( async () => {
        var userName, result;
        userName = $("#userName").val(); 

        if (!userName){
            alert("You must enter a username");
        }else{
            var questionmark = userName.split("?").length == 1;
            var forwardSlash = userName.split("/").length == 1;
            var backSlash = userName.split("\\").length == 1;
            var equal = userName.split("=").length == 1;
            

            // 
            if (questionmark && forwardSlash && backSlash && equal){
                result = await databaseuserNamelVal(userName);

                if(result){
                    // user.userName = userName;
                    alert("Username already taken");

                }else{
                    user.userName = userName;

                    var userJSON = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userName: user.userName,
                        email: user.email,
                        password: user.password
                    }

                    if (user.profile_img == undefined){
                        user.profile_img = '';
                    }

                    var requestData = {
                        userJSON: userJSON,
                        profile_img: user.profile_img
                    }

                    addUser(JSON.stringify(requestData), userJSON);
                }
            }else{
                alert("Your username cannot have '?', '/', '\\', '=' ");
            }
            
        }
    });
}

// Takes user back to the previous page
function back(){
    var id = $(".back_div").attr("id");

    // Checks if user is on login or register page
    if ((id == "login_back_div") || (id == "next_back_div")){
        showHomePage();
    }else{
        showRegisterPage();
    }
}

// Checks registration field 
function validateRegistration(){
    var firstName , lastName, email, password;
    var user = {};
    firstName = $("#firstName").val();
    lastName = $("#lastName").val();
    email = $("#email").val();
    password = $("#password").val();

    if(!firstName){
        alert("Please enter your first name");
    }else if(!lastName){
        alert("Please enter your last name");
    }else if(!password){
        alert("Please enter a password");
    }else{
        user.firstName = firstName;
        user.lastName = lastName;
        user.password = password;
        validateRegistrationEmail(email, user);
    }
}

// Validates email
async function validateRegistrationEmail(email, user){
    if(email){
        var emailSplit = email.split("@");
        // check for @ sign in email
        if(emailSplit.length == 2){
            // check for .com sign in email
            if(emailSplit[1].split(".")[1] = "com"){
                var result =  await databaseEmailVal(email);
                // Suggest redirection to login page if email exist
                if (result){
                    if (confirm("Email already registered. Would you like to login?")){
                        showLoginPage();
                    }
                }else{
                    user.email = email;
                    showFinalRegisterPage(user);
                }
            }else{
                alert("Invalid email no .com");
            }
        }else{
            alert("Invalid email, no @ sign");
        }
    }else{
        alert("Email field is empty");
    }
}

// Checks if email is present in the database
async function databaseEmailVal(email){
    try{
        const response = await fetch(`/M00933241/email?email=${email}`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            },
        
        });
    
        const result = await response.json();
        return result.result;
    }catch(err){
        console.log("Issue validating email from database" + err);
    }
}

// Validate username
async function databaseuserNamelVal(userName){
    try{
        const response = await fetch(`/M00933241/username?userName=${userName}`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            },
        
        });
    
        const result = await response.json();
        return result.result;
    }catch(err){
        console.log("Issue validating username from database" + err);
    }

}

// Sends user data to database
async function addUser(data, userData) {
    try{
        const response = await fetch(`/M00933241/users`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: data
        });
    
        const result = await response.json();

        if(result.result.acknowledged == true){
            var idTag = result.result.insertedId

            var loginValResult = loginUser(idTag, userData.password);

            if (loginValResult){
                var loginResult = await checkLogin(idTag);
                if(loginResult.login){
                    AppManager.appLoad(loginResult.id);
                }else{
                    showLoginPage();
                }
            }else{
                showLoginPage();
            };

        }

    }catch(err){
        console.log("Issue registering user " + err);
    }
}

// Checks login field 
async function validateLogin(){
    var idTag, password;
    idTag = $("#idTag").val();
    password = $("#password").val();

    if(!idTag){
        alert("Please enter your username or email");
    }else if(!password){
        alert("Please enter a password");
    }else{
        var loginValResult = await loginUser(idTag, password);

        if (loginValResult){
            var loginResult = await checkLogin(idTag);
            if(loginResult.login){
                alert("Logged in");
                AppManager.appLoad(loginResult.id);
            }else{
                alert("Wrong password");
            }
        }else{
            if (confirm("Email or username not registered. Would you like to register?")){
                showRegisterPage();
            }
        };
        
    }
}

async function loginUser(idTag, password){
    var data = JSON.stringify({
        idTag: idTag,
        password: password,
    });
    
    try{
        const response = await fetch(`/M00933241/login`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: data
        });
    
        const result = await response.json();

        return result.acknowledged;
    }catch(err){
        console.log("Issue logging in user " + err);
    }
}

async function checkLogin(idTag) {
    try{
        const response = await fetch(`/M00933241/login?idTag=${idTag}`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            },
        });
    
        const result = await response.json();

        return result;
    }catch(err){
        console.log("Issue getting login status of user \nError: " + err);
    }
}



var loginPageString, registerPageString, finalRegisterPageString, homePage;
var app, panel, display, weather, activitySuggestion;

homePage = `
    <div class="home_div">
        <div class="home">
            <span id="swift">Swift</span>
            <div class="home_buttons">
                <button id="home_register">Register</button>
                <button id="home_login">Login</button>
            </div>
        </div>
    </div>
`

loginPageString = `
    <div class="login_div">
        <div class="back_div" id="login_back_div">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Back</span>
        </div>
        <div class="login">
            <span id="login">Login</span>
            <div class="login_input_div">
                <input type="text" placeholder="Email / Username" id="idTag">
                <input type="password" placeholder="Password" id="password">
                <button id="login_button">Login</button>
            </div>
            
        </div>
    </div>
`;

registerPageString = `
    <div class="register_div">
        <div class="back_div" id="next_back_div">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Back</span>
        </div>
        <div class="register">
            <span id="register">Register</span>
            <div class="register_input_div">
                <input type="text" placeholder="First Name" id="firstName">
                <input type="text" placeholder="Last Name" id="lastName">
                <input type="email" placeholder="Email" id="email">
                <input type="password" placeholder="Password" id="password">
                <button id="next_button">Next</button>
            </div>
        </div>
    </div
`;

finalRegisterPageString = `
    <div class="register_div">
        <div class="back_div" id="final_back_div">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Back</span>
        </div>
        <div class="register">
            <span id="register">Final step</span>
            <div class="register_input_div">
                <p>Choose a profile or leave as default</p>
                <div class="default_profile">
                    <img src="./public/uploads/default_profile/default_profile.jpg" alt="default_profile" id="profile_picture">
                    <div class="file_upload_div">
                        <label for="file_upload" class="custom_upload">+</label>
                        <input type="file", id="file_upload">   
                    </div>
                </div>

                <input type="text" placeholder="User Name" id="userName">
                <button id="register_button">Register</button>
            </div>
        </div>
    </div>

`

weather = `
    <div class="weather">
        <div class="info_header">
            <span><b>weather</b></span>
        </div>
        <div class="info">

        </div>
    </div>
`

activitySuggestion = `
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
`

// showHomePage();
// showRegisterPage();
showLoginPage();
