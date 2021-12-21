var rec_JSONarray='';
var category=$.cookie('category');
console.log($.cookie('category'));
var userprofile=JSON.stringify({"label":category});
console.log(userprofile);
$(function(){
    $.ajax({
        type:"POST",
        // url:"./json/recommend.json",
        url:"http://10.141.223.30:8083/api/index/recommend",
        contentType:"application/json",
        data:userprofile,
        dataType: "json",
        success: function(data){
            rec_JSONarray=data;
            var str="<ul class=\"nav\">";
            // var str ="";
            for(var i=0;i<=data.length-1;i++){
                // $.each(data[i].name,function(i,n){
                //     str+="<li>"+"<a onclick=\"page()\">"+"<p>"+n["item"]+"</p>"+"</a>"+"</li>";
                // })
                str+="<li>"+"<a onclick=\"rec_page(this)\" id="+i+">"+
                    "<p>"+data[i].name+"</p>"
                    +"<p>"+data[i].label+"</p>"
                    +"<p>"+"更新日期:"+data[i].updatedat+"</p>"
                    +"</a>"+"</li>";
            };
            str+="</ul>";
            $("#rec_menu").append(str);
        }
    });
});

function rec_page(element) {
    console.log(element);
    var id=$(element).attr("id");
    console.log(id)
    console.log(rec_JSONarray[id]);
    var str='';
    str+="<h1>"+"Dataset Summery"+"</h1>";
    str+="<p>"+"id:" +rec_JSONarray[id].id+"</p>";
    str+="<p>"+"name:" +rec_JSONarray[id].name+"</p>";
    str+="<p>"+"description:" +rec_JSONarray[id].description+"</p>";
    str+="<p>"+"label:"+rec_JSONarray[id].label+"</p>";
    str+="<p>"+"createdat:" +rec_JSONarray[id].createdat+"</p>";
    str+="<p>"+"updatedat:" +rec_JSONarray[id].updatedat+"</p>";
    str+="<button id=\"use\" onclick=\"use()\">"+"使用该数据"+"</button>"
    $("#rec_page").empty();
    $("#rec_page").append(str);
}

