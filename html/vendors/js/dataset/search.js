
// //搜索框
// $('#key').focus(function() {
//     if($(this).val() == '请输入关键词！') {
//         $(this).val("");
//     }
// });
//
// $('#key').blur(function(){
//     if($(this).val() == "") {
//         $(this).val('请输入关键词！');
//     }
// });

function searchlist(){
        console.log("search start");
        var keyword = $(key).val();
        console.log(keyword);
        $('li').fadeOut();
        //将原有的内容隐藏
        //然后将含有keyword的li进行渐变显示
        console.log($("p").filter(":Contains("+keyword+")"));
        $("p").filter(":Contains("+keyword+")").parents('li').fadeIn();
}

function sl(){
    console.log("search start")
    var keyword = $("#searchinput").val();
    console.log(keyword);
    $('li').fadeOut()
    console.log($("h1").filter(":Contains("+keyword+")"))
    $("h1").filter(":Contains("+keyword+")").parents('li').fadeIn()
}

function clean(){
    console.log("search clean")
    $("#searchinput").val("");
}

function search_list(){
    console.log("search start");
    var keyword = $("#key").val();
    console.log(keyword);
    vm1.$nextTick(function (){
        $(".profile_details").fadeOut();
        console.log($("h3").filter(":Contains("+keyword+")"));
        $("h3").filter(":Contains("+keyword+")").parents('.profile_details').fadeIn();
    }

    )

}