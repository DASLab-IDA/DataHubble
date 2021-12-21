//——————————————————————————获取表名—————————————————————————————
var tableName;
// var tablename=JSON.stringify({"tablename":tableName});
var userID;
function GetRequest() {
    var url = location.search;
    // var url = "?tableName=websales_home";
    temp = url.split("=");
    return temp[1];
}
tableName = GetRequest();
//console.log(tableName);

$(document).ready(function(){
    $.ajax({
        type : "POST",
        //url : "http://10.222.111.16:8083/api/index/table",
        url : "http://10.141.223.30:8083/api/index/table",
        contentType: "application/json",
        dataType:"json",
        data:JSON.stringify({"tablename":tableName}),
        jsonp:'callback',
        success : function (msg){
//            console.log(msg);
            document.getElementById("name").append(msg.name);
            document.getElementById("description").append(msg.description);
            // document.getElementById("label").append(msg.label);
            document.getElementById("createdAt").append(msg.createdAt);
            document.getElementById("updatedAt").append(msg.updatedAt);

            var labels = msg.label.split("&");
//            console.log(labels);
            var str = '';
            for (var i = 0; i < labels.length; i++) {
                str += "<span class=\"label label-info\" style='margin-left: 5px' >" + labels[i] + "</span>";
            }
            $("#label").append(str);
            },//success
            error:function(){alert("Error on index/table!")}
    });//ajax
});