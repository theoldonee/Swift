// Imports
import {AppManager} from "./appManager.js";

// Exports
export{
    HomeManager
}

// Home manager class
class HomeManager{
    // Displays home page
    static showHomePage(){
        // Injects home page html
        $("section").html(homePage);

        // Detects when the login button is clicked
        $("#home_login").click( () => {
            // Adds class shrink to swift
            $("#swift").addClass("shrink");
            // Sets time out for grow
            setTimeout(HomeManager.grow, 1000, "login", "Login");
        });
        
        // Detects when the register button is clicked
        $("#home_register").click( () => {
            // Adds class shrink to swift
            $("#swift").addClass("shrink");
            // Sets time out for grow
            setTimeout(HomeManager.grow, 1000, "register", "Register");
        });
    }

    // Adds grow class
    static grow(page, text){
        // Changes swift text
        $("#swift").text(`${text}`);
        // Adds class grow to swift
        $("#swift").addClass("grow");

        // Checks if the page is login
        if(page == "login"){
            // Displays login page if page is login
            setTimeout(HomeManager.showLoginPage, 2000);
        }else{ // Displays register page
            setTimeout(HomeManager.showRegisterPage, 2000);
        }
    }

    // Displays login page
    static showLoginPage(){
        // Injects home page html
        $("section").html(loginPageString);

        // Detects when the back button is clicked 
        $(".back_div").click( () => {
            // Goes back to previous page
            HomeManager.back();
        });

        // Detects when the login button is clicked 
        $("#login_button").click( () => {
            // Validates login
            HomeManager.validateLogin();
        });
    }

    // Displays register page
    static showRegisterPage(){
        // Injects registration page html
        $("section").html(registerPageString);

        // Detects when the "next" button is clicked 
        $("#next_button").click( async () => {
            // Validates registration
            HomeManager.validateRegistration();
        });

        // Detects when the back button is clicked 
        $(".back_div").click( () => {
            // Goes back to previous page
            HomeManager.back();
        });
    }

    // Shows final register page and gives functionality to all buttons
    static showFinalRegisterPage(user){
        // Displays the final register page
        $("section").html(finalRegisterPageString);

        // Takes User back to the previous page
        $(".back_div").click( () => {
            // Goes back to previous page
            HomeManager.back();
        });

        // Shows selected profile picture
        $('#file_upload').on("change", () => {
            var fr = new FileReader();

            // changes image source to choosen file.
            fr.onload = function (e) { 
                // Sets image
                document.getElementById("profile_picture").src = this.result;
                user.profile_img = this.result;
            };
            
            var file = $("#file_upload")[0].files[0]; // Uploaded file

            // Checks if file is an image
            if(file.type.match('image.*')){
                fr.readAsDataURL(file);
            }else{
                alert("Invalid file format");
            }
        });

        // Detects when the register button is clicked 
        $("#register_button").click( async () => {
            var userName, result;
            userName = $("#userName").val(); 

            // Checks if a username has been entered
            if (!userName){
                alert("You must enter a username");
            }else{
                var questionmark = userName.split("?").length == 1;
                var forwardSlash = userName.split("/").length == 1;
                var backSlash = userName.split("\\").length == 1;
                var equal = userName.split("=").length == 1;
                

                // If the username contains unwanted symbols
                if (questionmark && forwardSlash && backSlash && equal){
                    result = await HomeManager.databaseuserNamelVal(userName);

                    // Checks if username is taken
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

                        // checks if the user has picked a profile picture
                        if (user.profile_img == undefined){
                            user.profile_img = '';
                        }

                        var requestData = {
                            userJSON: userJSON,
                            profile_img: user.profile_img
                        }

                        // Adds user
                        HomeManager.addUser(JSON.stringify(requestData), userJSON);
                    }
                }else{
                    alert("Your username cannot have '?', '/', '\\', '=' ");
                }  
            }
        });
    }

    // Takes user back to the previous page
    static back(){
        // Sets id
        var id = $(".back_div").attr("id");

        // Checks if user is on login or register page
        if ((id == "login_back_div") || (id == "next_back_div")){
            // Shows home page
            this.showHomePage();
        }else{
            // Shows registration page
            this.showRegisterPage();
        }
    }

    // Checks registration field 
    static validateRegistration(){
        var firstName , lastName, email, password;
        // User object
        var user = {};

        // Gets user information
        firstName = $("#firstName").val();
        lastName = $("#lastName").val();
        email = $("#email").val();
        password = $("#password").val();

        // Checks if input data has been entered
        if(!firstName){
            alert("Please enter your first name");
        }else if(!lastName){
            alert("Please enter your last name");
        }else if(!password){
            alert("Please enter a password");
        }else{
            // Sets user infromation
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = password;

            // Validates registration
            this.validateRegistrationEmail(email, user);
        }
    }

    // Validates email
    static async validateRegistrationEmail(email, user){
        // Checks if email has been entered
        if(email){
            var emailSplit = email.split("@");
            // check for @ sign in email
            if(emailSplit.length == 2){
                // check for .com sign in email
                if(emailSplit[1].split(".")[1] = "com"){
                    var result =  await this.databaseEmailVal(email);
                    // Suggest redirection to login page if email exist
                    if (result){
                        if (confirm("Email already registered. Would you like to login?")){
                            // Displays login page
                            this.showLoginPage();
                        }
                    }else{
                        // Sets user email
                        user.email = email;

                        // Displays final registration page
                        this.showFinalRegisterPage(user);
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
    static async databaseEmailVal(email){
        // Sends a email through POST request to the /M00933241/email path
        try{
            const response = await fetch(`/M00933241/email?email=${email}`, {
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                },
            
            });
            
            // Converts response to json format
            const result = await response.json();
            return result.result;
        }catch(err){
            console.log("Issue validating email from database" + err);
        }
    }

    // Validate username
    static async databaseuserNamelVal(userName){
        
        // Sends a usernsme through GET request to the /M00933241/username path
        try{
            const response = await fetch(`/M00933241/username?userName=${userName}`, {
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                },
            
            });
            
            // Converts response to json format
            const result = await response.json();
            return result.result;
        }catch(err){
            console.log("Issue validating username from database" + err);
        }

    }

    // Sends user data to database
    static async addUser(data, userData) {
        
        // Sends a user data through POST request to the /M00933241/users path
        try{
            const response = await fetch(`/M00933241/users`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: data
            });

            // Converts response to json format
            const result = await response.json();

            // Checks if user has been added to database
            if(result.result.acknowledged == true){
                var idTag = result.result.insertedId;
                var password = userData.password;
                // Logs in user
                var loginValResult = await this.loginUser(idTag, password);

                // Checks if user info has been added to login collection
                if (loginValResult){
                    
                    // Gets login status
                    var loginResult = await this.checkLogin(idTag);
                    console.log(loginResult);
                    // Checks if user should be logged in
                    if(loginResult.login){
                        // Sets current page to feed
                        AppManager.currentPage = "feed";
                        // Loads app
                        AppManager.appLoad(idTag);
                    }else{
                        // Displays login page
                        this.showLoginPage();
                    }
                }else{
                    // Displays login page
                    this.showLoginPage();
                };

            }

        }catch(err){
            console.log("Issue registering user " + err);
        }
    }

    // Checks login field 
    static async validateLogin(){
        var idTag, password;

        // Set idtag and password
        idTag = $("#idTag").val();
        password = $("#password").val();

        // Checks if an email or username has been inputed
        if(!idTag){
            alert("Please enter your username or email");
        }else if(!password){ // checks if password has been inputed
            alert("Please enter a password");
        }else{
            // Get user login result
            var loginValResult = await this.loginUser(idTag, password);
            
            // Checks if user exist
            if (loginValResult){

                // Get user login
                var loginResult = await this.checkLogin(idTag);

                // Checks if logged in
                if(loginResult.login){
                    // Sets current page to feed
                    AppManager.currentPage = "feed";
                    AppManager.appLoad(loginResult.id);
                }else{
                    alert("Wrong password");
                }
            }else{
                if (confirm("Email or username not registered. Would you like to register?")){
                    // Displays registration page
                    this.showRegisterPage();
                }
            };
            
        }
    }

    // Sends a login POST request to the server
    static async loginUser(idTag, password){
        // Creates json sring
        var data = JSON.stringify({
            idTag: idTag,
            password: password,
        });
        
        // Sends a login POST request to the /M00933241/login path
        try{
            const response = await fetch(`/M00933241/login`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: data
            });
            
            // Converts response to json format
            const result = await response.json();

            // returns result
            return result.acknowledged;
        }catch(err){
            console.log("Issue logging in user " + err);
        }
    }

    // Sends a login GET request to the server
    static async checkLogin(idTag) {

        // Sends a login GET request to the /M00933241/login path
        try{
            const response = await fetch(`/M00933241/login?idTag=${idTag}`, {
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                },
            });
            
            // Converts response to json format
            const result = await response.json();

            return result;
        }catch(err){
            console.log("Issue getting login status of user \nError: " + err);
        }
    }
}

var loginPageString, registerPageString, finalRegisterPageString, homePage;

// Home page string
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
// Login page string
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

// Registration page string
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

// Final registration page string
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
// Displays home page
HomeManager.showHomePage();
