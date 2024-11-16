

$("#home_login").click( () => {
    $("#swift").addClass("shrink");
    setTimeout(grow, 1000, "login", "Login");

});

$("#home_register").click( () => {
    $("#swift").addClass("shrink");
    setTimeout(grow, 1000, "register", "Register");

});

function grow(page, text){
    $("#swift").text(`${text}`);
    $("#swift").addClass("grow");
    if(page == "login"){
        setTimeout(loginPage, 2000);
    }else{
        setTimeout(registerPage, 2000);
    }
}

function loginPage(){
    $("section").html(loginPageString);
}

function registerPage(){
    $("section").html(registerPageString);

    $("#next_button").click(() => {
        $("section").html(finalRegisterPageString);
    });
}


$('#file_upload').on("change", () => {
    var fr = new FileReader();
    fr.onload = function(e) { 
        document.getElementById("profile_picture").src = this.result;
    };

    fr.readAsDataURL($("#file_upload")[0].files[0]);
});



var loginPageString, registerPageString, finalRegisterPageString;

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
                <input type="email" placeholder="Email">
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
                    <img src="default_profile.jpg" alt="default_profile" id="profile_picture">
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
