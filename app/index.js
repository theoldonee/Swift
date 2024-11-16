

$("#Home_login").click( () => {
    $("#swift").addClass("shrink");
    setTimeout(grow, 1000, "login", "Login");

});

$("#Home_register").click( () => {
    $("#swift").addClass("shrink");
    setTimeout(grow, 1000, "register", "Register");

});

function grow(page, text){
    // $("#swift").text("Login");
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
}



var loginPageString, registerPageString ;

loginPageString = `
    <div class="login_div">
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
        <div class="register">
            <span id="register">Register</span>
            <div class="register_input_div">
                <input type="text" placeholder="First Name">
                <input type="text" placeholder="Last Name">
                <input type="text" placeholder="User Name">

                <input type="text" placeholder="Email / Username">
                <input type="password" placeholder="Password">
                <button >Register</button>
            </div>
        </div>
    </div>
`;
