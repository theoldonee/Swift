$("#submit").click( () => {
    // alert($("#username").val());
    // $.post("/M00933241/login", 
        // {
        //     name: $("#username").val(),
        //     password: $("#password").val() 

        // }
    // )

    $.ajax({
        url: "/M00933241/login",

        type: "POST",
        data: ({
            name: $("#username").val(),
            password: $("#password").val() 

        }),
        dataType: "html"

    });

    // const xhttp = new XMLHttpRequest();
    // xhttp.open("POST", "localhost:8080/M00933241/login")

});