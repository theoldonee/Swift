

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

    // $.ajax({
    //     url: "/M00933241/uploads",

    //     type: "GET",
    //     data: ({
    //         filePath: "/uploads/20230707_205819.jpg"

    //     }),

    // });

    



});

// const xhttp = new XMLHttpRequest();
// xhttp.open("GET", "/M00933241/image");

// xhttp.send({filePath : "/uploads/20230707_205819.jpg"});
// var file = xhttp.response;
// console.log(file);
// $("#image").attr("src", )

// $.ajax({
//     url: "/M00933241/image",

//     type: "GET",
//     data: ({
//         filePath: "/uploads/20230707_205819.jpg"
//     }),
//     success: function(response) {
//         //Do Something
//         console.log(response);
//       },
//       error: function(xhr) {
//         //Do Something to handle error
//         console.log(xhr);
//       }

// });