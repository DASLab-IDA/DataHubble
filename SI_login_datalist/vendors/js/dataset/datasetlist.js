var JSONarray='';
$(function(){
    $.ajax({
        type:"GET",
        // url:"./json/list.json",
        url:"http://10.141.223.30:8083/api/index/list",
        dataType: "json",
        success: function(data){
            JSONarray=data;
            var str="<ul class=\"nav\">";
            // var str ="";
            for(var i=0;i<=data.length-1;i++){
            // $.each(data[i].name,function(i,n){
            //     str+="<li>"+"<a onclick=\"page()\">"+"<p>"+n["item"]+"</p>"+"</a>"+"</li>";
            // })
                str+="<li>"+"<a onclick=\"page(this)\" id="+i+">"+
                    "<p>"+data[i].name+"</p>"
                    +"<p>"+data[i].label+"</p>"
                    +"<p>"+"更新日期:"+data[i].updatedat+"</p>"
                    +"</a>"+"</li>";
            };
            str+="</ul>";
            $("#menu").append(str);
        }
    });
});

function page(element) {
        console.log(element);
        var id=$(element).attr("id");
        // console.log(id)
        console.log(JSONarray[id]);
        var str='';
        str+="<h1>"+"Dataset Summery"+"</h1>";
        str+="<p>"+"id:" +JSONarray[id].id+"</p>";
        str+="<p>"+"name:" +JSONarray[id].name+"</p>";
        str+="<p>"+"description:" +JSONarray[id].description+"</p>";
        str+="<p>"+"label:"+JSONarray[id].label+"</p>";
        str+="<p>"+"createdat:" +JSONarray[id].createdat+"</p>";
        str+="<p>"+"updatedat:" +JSONarray[id].updatedat+"</p>";
        str+="<button id=\"use\" onclick=\"use()\">"+"使用该数据"+"</button>"
        $("#page").empty();
        $("#page").append(str);

}

function use(){
    // $.cookie('category', "book");
    // var category=$.cookie('category');
    // console.log("category"+category);
    var table=$.cookie('data_name');
    console.log($.cookie('data_name'));
    var url='./databoard.html'+'?tableName='+table;
    window.location.href = url;
};