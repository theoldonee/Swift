
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

function grow(page, text){
    $("#swift").text(`${text}`);
    $("#swift").addClass("grow");
    if(page == "login"){
        setTimeout(showLoginPage, 2000);
    }else{
        setTimeout(showRegisterPage, 2000);
    }
}


function showLoginPage(){
    $("section").html(loginPageString);
    $(".back_div").click( () => {
        back();
    });
}


 function showRegisterPage(){
    $("section").html(registerPageString);

    $("#next_button").click( async () => {
        var email = $("#email").val();
        

        const response = await fetch(`/M00933241/email?email=${email}`, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            },
        
        });

        const result = await response.json();
        // alert(result);
        console.log(result.result);
        if(result.result == false){
            showFinalRegisterPage();
        }else{
            showLoginPage();
        }
        // showFinalRegisterPage();
    });

    $(".back_div").click( () => {
        back();
    });
}

// Shows final register page and gives functionality to all buttons
function showFinalRegisterPage(){
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
        };
    
        fr.readAsDataURL($("#file_upload")[0].files[0]);
    });
}

// Takes user back to the previous page
function back(){
    var id = $(".back_div").attr("id");
    if ((id == "login_back_div") || (id == "next_back_div")){
        showHomePage();
    }else{
        showRegisterPage();
    }
}

var loginPageString, registerPageString, finalRegisterPageString, homePage;

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
                <input type="text" placeholder="Email / Username">
                <input type="password" placeholder="Password">
                <button>Login</button>
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
                <input type="text" placeholder="First Name">
                <input type="text" placeholder="Last Name">
                <input type="email" placeholder="Email" id="email">
                <input type="password" placeholder="Password">
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

                <input type="text" placeholder="User Name">
                <button id="register_button">Register</button>
            </div>
        </div>
    </div>

`

// showHomePage();
showRegisterPage();