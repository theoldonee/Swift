$("#login").click( () => {
    console.log("here")
    $("#swift").addClass("grow");
    setTimeout(loginPage, 1600);

});

function loginPage(){
    $("section").html("<p>Login<p>");
}
function register(){
    $("section").html("<p>Register<p>");
}

$("#register").click( () => {
    console.log("here")
    $("#swift").addClass("grow");
    setTimeout(register, 1600);

});