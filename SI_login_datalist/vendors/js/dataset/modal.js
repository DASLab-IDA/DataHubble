var str="";
function modal(data,index) {
    console.log("___________________modal_________________");
    // console.log(data,index);
    str+="<div class=\"col-md-12 col-sm-12 col-xs-12 profile_details\" style='line-height: 30px'>\n" +
        "        <div class=\"well profile_view\">\n" +
        "        <div class=\"col-sm-12\">\n" +
        "        <div class=\"left col-xs-12\">\n" +
        "        <h2>"+data.name+"</h2>\n" +
        "        <ul class=\"list-unstyled\" style=\"line-height: 20px\">\n" +
        "            <li id=\"des\"><img src=\"vendors/images/databoard/label.png\">"+labels_split(index)+"</li>\n" +
        "            <li><img src=\"vendors/images/databoard/time.png\">创建时间:"+data.createdAt+"</li>\n" +
        "            <li><img src=\"vendors/images/databoard/time.png\">更新时间:"+data.updatedAt+"</li>\n" +
        "            <li><img src=\"vendors/images/databoard/time.png\">详细信息:"+data.description+"</li>\n" +
        "        </ul>\n" +
        "        </div>\n" +
        "        </div>\n" +
        "        </div>\n" +
        "        </div>";
    // console.log(str);
    $("#desContent").empty();
    $("#desContent").append(str);
    str="";
    $("#desContent").css('height', '500px');
}

function labels_split(index) {
    var labels = vm1.$data.lists[index].label.split("&");
    // console.log(labels[0]);
        for (i = 0; i < labels.length; i++) {
            str+= "<span class=\"label label-info\" style='margin-left: 5px' >" + labels[i] + "</span>";
        };
        return str
}