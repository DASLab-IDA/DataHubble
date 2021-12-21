function login() {

    var user = {
        username: $("#Username").val(),
        password: $("#Password").val()
    };
    user=JSON.stringify(user);
    var name=$("#Username").val();
    // var pass=$("#Password").val();
    $.ajax({
        url: "http://10.176.24.40:8083/api/user/login",
        // data: user,
        type: "POST",
        // url:"http://10.222.82.103:8083/api/user/login",
        data: user,
        dataType: "json",
        contentType: "application/json",
        success:
            function (data, status) {
                category = data.category;
                $.cookie('category', category);
                $.cookie('username', name);
                // console.log($.cookie('category'));
                // console.log(category);
                if (status = 200) {
                    window.location.href = "./page-b.html";
                }
            },
    });
}
