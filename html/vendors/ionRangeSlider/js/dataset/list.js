var JSONarray='';
$(function(){
    $.ajax({
        type:"GET",
        // url:"./json/list.json",
        url:"http://10.176.24.40:8083/api/index/list",
        dataType: "json",
        success: function(data){
            JSONarray=data;
            var str="<ol class=\"list\" jsname=\"SoRXVb\" >"
            for(var i=0;i<=data.length-1;i++){
                str+="<li class=\"UnWQ5\">";
                +"<a onclick=\"page(this)\" id="+i+">"
                str+="<div class=\"xdICpb\"  data-dataset-url=\"null\"\n" +
                    "data-docid="+data[i].id+"data-index="+i+"jsname=\"zdUI3e\">";
                str+="<a onclick=\"page(this)\" id="+i+">";
                str+=" <div class=\"Ul9MRe\" style=\"background-color: #004d40  \"><span\n" +
                    "style=\"display: block; padding: 8px\">o</span></div>";
                str+="<div class=\"jWBBzf\">\n" +
                    "<div class=\"kCClje\"><h1 class=\"iKH1Bc\">"+data[i].name+"</h1>\n" +
                    "<div class=\"p86njf\">"
                    +"<ul class=\"bvKdnc\">"
                    +"<li class=\"iW1HZe\">"+data[i].label+"</li>"
                    +"</ul>"
                    +"</div>"
                    +"</div>"
                    +"<div class=\"U0CpDc\">"+"<span class=\"zKF3u\">"+"更新日期："+data[i].updatedAt +"</span></div>"
                +"</div>"
                +"</div>"
                +"</li>";
            };
            str+="</ol>";
            // console.log(str);
            $("#list").append(str);
        }
    });
});

function page(element) {
    // console.log(element);
    var id=$(element).attr("id");

    console.log(JSONarray[id]);
    console.log(JSONarray[id].updatedAt);
    var str="";
str+="<div class=\"Klb03b\" style=\"padding-bottom: 0px\"><a onclick=\"use()\"><h1 class=\"SAyv5\" >"+JSONarray[id].name+ "</h1></a>"
    +"<div class=\"wmTTce\">"
        +"<ul class=\"eEUDce\">"
        str+="<li style=\"display: inline-block;\">\n" +
            "<c-wiz jsrenderer=\"RV9Jv\" jsshadow=\"\" jsdata=\"deferred-i7\"\n" +
            "data-p=\"%.@.&quot;boston education data&quot;,&quot;dXHg8QHLsG3YBjoSAAAAAA\u003d\u003d&quot;]\n" +
            "\" jscontroller=\"AMunpe\" data-node-index=\"0;0\" jsmodel=\"hc6Ubd\">"
    str+="<div jsname=\"gh7ePd\" class=\"jqqkc\" jsaction=\"click:NTdwKb\"\n" +
        "    data-dataset-url=\"https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/WKMP6W\"\n" +
        "    data-index=\"null\"><a class=\"gVd0We\"\n" +
        "    href=\"https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/WKMP6W\"\n" +
        "    target=\"_blank\"><span class=\"DPvwYc pEISbe\"\n" +
        "    aria-hidden=\"true\"></span>"
    str+="<div class=\"eLDzIf\">"+JSONarray[id].label+"</div>"
    +"</a></div>";
    str+="<c-data id=\"i7\" jsdata=\" GPO3Mb;unsupported;1\"></c-data>\n" +
        "        </c-wiz>\n" +
        "        </li>\n" +
        "        </ul>\n" +
        "        </div>\n" +
        "        </div>\n" +
        "\n" +
        "        <div class=\"ukddFf\">\n" +
        "        <ul class=\"qYUaP\">\n" +
        "        <li><span class=\"pXX2tb\"> 数据集更新日期 </span><span class=\"gHkX8d\">"+JSONarray[id].updatedAt+"</span></li>\n" +
        "    <li><span class=\"pXX2tb\"> 数据集发布日期 </span><span class=\"gHkX8d\">"+JSONarray[id].createdAt+"</span></li>\n" +
        "    </ul>"
        "</div>"
    str+="<c-wiz jsshadow=\"\" jsdata=\"deferred-i8\" jsmodel=\"hc6Ubd\">\n" +
        "        <div class=\"pXX2tb\">说明</div>\n" +
        "        <div class=\"iH9v7b\"><p class=\"boqResearchsciencesearchdesktopuiDetailDescriptionElement_\">" +JSONarray[id].description+
        "    </p></div>\n" +
        "    <c-data id=\"i8\"></c-data>\n" +
        "        </c-wiz>"
    // str+="<button id=\"use\" onclick=\"use()\">"+"使用该数据"+"</button>";

    console.log(str);
    $("#page").empty();
    $("#page").append(str);

}

function use(){
    // $.cookie('category', "book");
    // var category=$.cookie('category');
    // console.log("category"+category);
    var table=$.cookie('data_name');
    console.log($.cookie('data_name'));
    var url='./databoarddemo.html'+'?tableName='+table;
    window.location.href = url;
};