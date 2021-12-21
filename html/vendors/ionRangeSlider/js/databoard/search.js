//--搜索部分js代码03.27--
var columns=[];
var ajax_columns=[];
var tablenameonsearch;
var page = 1;
var tab_total = 0;
var table;
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
$(document).ready(function(){
        tablenameonsearch = getUrlParam("tableName");
        console.log(tablenameonsearch);
        $.ajax({
            url:"http://10.176.24.40:8083/api/hive/gettableschema",
            type: "POST",
            dataType: "json",
            contentType: "text/plain",
            data: tablenameonsearch,
            success:function(data){
                for(d in data){
                    var column=d;
                    if(d.indexOf(1)!=d.length-1)columns.push({"col":d,"type":data[d]});
                    switch(data[d])
                    {
                        case "int":
                            str = '<div class="col-md-3 "><div class="input-group"><span class="input-group-addon">'+column+'</span><input class="form-control" type="text" id="'+column+'1" value="" /><span class="input-group-addon">-</span><input class= "form-control" type="text" id="'+column+'2" value="" /></div></div>';
                            $("#searchbar").append(str);
                            break;
                        case "double":
                            str = '<div class="col-md-3 "><div class="input-group"><span class="input-group-addon">'+column+'</span><input class="form-control" type="text" id="'+column+'1" value="" /><span class="input-group-addon">-</span><input class= "form-control" type="text" id="'+column+'2" value="" /></div></div>';
                            $("#searchbar").append(str);
                            break;
                        case "string":
                            str = '<div class="col-md-3 "><div class="input-group"><span class="input-group-addon">'+column+'</span><input type="text" class="form-control" id="'+column+'search" value=""><div></div>';
                            $("#searchbar").append(str);
                            break;
                        case "timestamp":
                            str = '<div class="col-md-3 "><div class="input-group" style="color:rgb(0, 0, 0);"><span class="input-group-addon">'+column+'</span><input class= "form-control" type="text" id="'+column+'1"  value="1970-01-01" /><span class="input-group-addon">-</span><input class= "form-control" type="text" id="'+column+'2"  value="2020-01-01" /></div></div>';
                            $("#searchbar").append(str);
                            $("#"+column+"1").datetimepicker({
                                format:'YYYY-MM-DD'
                            });
                            $("#"+column+"2").datetimepicker({
                                format:'YYYY-MM-DD'
                            });
                            break;
                    }
                }
                for(i=0;i<columns.length;i++){
                    tr = document.getElementById('tr');
                    if(columns[i].col.indexOf(1)!=columns[i].col.length-1){
                        temp = {"data":columns[i].col};
                        ajax_columns.push(temp)
                        elem = document.createElement('th');
                        elem.innerHTML=columns[i].col;
                        tr.append(elem);
                    }
                }
                $.ajax({
                    url: "http://10.176.24.40:8083/api/hive/rowcount",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify({"tablename": tablenameonsearch}),
                    success: function (data) {
                        tab_total = data.total;
                        // console.log(tab_total)
                        table = $('#datatable-fixed-header').DataTable({
                            // "processing": true,
                            "serverSide": true,
                            // "ordering": true,
                            "ajax": {
                                url: "http://10.176.24.40:8083/api/hive/getdata",
                                type: "POST",
                                contentType: "application/json",
                                dataType: "json",
                //                    async: false,
                                data: function () {
                                    return JSON.stringify({
                                        "tablename": tableName,
                                        "page": page1(),
                                        "filters": []
                                    });
                                },
                            },//ajax

                            "columns":
                               ajax_columns,
                            "infoCallback": function () {
                                // console.log(tab_total);
                                var api = this.api();
                                var pageInfo = api.page.info();
                                // return 'Page '+ (pageInfo.page*20) +' of '+ pageInfo.pages;
                                return '显示第 ' + ((pageInfo.page * 20) + 1) + ' 至 ' + ((pageInfo.page * 20) + 20) + ' 项结果， ' + ' 共 ' + tab_tot() + ' 项'
                            },
                            "pagingType": "numbers",
                            searching: false,
                            paging: true,
                            "lengthChange": true,
                            scrollY: "400px",
                            scrollCollapse: false,
                            language: {
                                "sProcessing": "处理中...",
                                "sLengthMenu": "显示 _MENU_ 项结果",
                                "sZeroRecords": "没有匹配结果",
                                "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                                "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                                "sInfoPostFix": "",
                                "sSearch": "搜索:",
                                "sUrl": "",
                                "sEmptyTable": "表中数据为空",
                                "sLoadingRecords": "载入中...",
                                "sInfoThousands": ",",
                                "oPaginate": {
                                    "sFirst": "首页",
                                    "sPrevious": "上页",
                                    "sNext": "下页",
                                    "sLast": "末页"
                                }
                            }
                        });
                        document.getElementById('waitingtext').style.display = "none";
                    },
                });
                columns.forEach(function(v){return v.col});
                $("#searchbar").append('<div class="col-md-3"><button type="button" class="btn btn-primary" onclick="Search()">检索</button></div>');
                $("#loadingtext").toggle();
                $("#searchbar").toggle();
            }
        })
})
function getfilters(){
    var filters=[];
    for(c in columns){

        switch(columns[c].type){
            case "int":
                var id1=columns[c].col+"1";
                var id2=columns[c].col+"2";
                var data1 = document.getElementById(id1).value;
                var data2 = document.getElementById(id2).value;
                if(data1==""&&data2=="")break;
                var data=[];
                data.push(data1!=""?data1:0);
                data.push(data2!=""?data2:99999);
                filters.push({"tablename":tablenameonsearch,"columnname":columns[c].col,"type":4,"data":data});
                break;
            case "double":
                var id1=columns[c].col+"1";
                var id2=columns[c].col+"2";
                var data1 = document.getElementById(id1).value;
                var data2 = document.getElementById(id2).value;
                if(data1==""&&data2=="")break;
                var data=[];
                data.push(data1!=""?data1:0.0);
                data.push(data2!=""?data2:99999.9);
                filters.push({"tablename":tablenameonsearch,"columnname":columns[c].col,"type":8,"data":data});
                break;
            case "string":
                if(document.getElementById(columns[c].col+"search").value=="")break;
                var data = document.getElementById(columns[c].col+"search").value.split(";");
                filters.push({"tablename":tablenameonsearch,"columnname":columns[c].col,"type":12,"data":data});
                break;
            case "timestamp":
                var id1=columns[c].col+"1";
                var id2=columns[c].col+"2";
                var data1 = document.getElementById(id1).value;
                var data2 = document.getElementById(id2).value;
                if(data1=="1970-01-01"&&data2=="2020-01-01")break;
                var data=[];
                data.push(data1!=""?data1:"1970-01-01");
                data.push(data2!=""?data2:"2020-01-01");
                filters.push({"tablename":tablenameonsearch,"columnname":columns[c].col,"type":93,"data":data});
                break;
        }

    }
    return filters;
}

function Search(){
    filters=getfilters();
    SQLSearch(filters);
}

function SQLSearch(filters){


    $.ajax({
        url: "http://10.176.24.40:8083/api/hive/rowcount",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({"tablename":tablenameonsearch}),
        success: function (data) {
            // console.log("============8888888===========");
            // console.log(data);

            tab_total = data.total;
            console.log(tab_total)
            table = $('#datatable-fixed-header').DataTable({
                destroy:true,
                // "processing": true,
                "serverSide": true,
                // "ordering": true,
                "ajax": {
                    url: "http://10.176.24.40:8083/api/hive/getdata",
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    //async: false,
                    data: function () {
                        return JSON.stringify({
                            "tablename": tablenameonsearch,
                            "page": page1(),
                            "filters": filters
                        });
                    },
                },//ajax

                "columns":
                   ajax_columns,
                "infoCallback": function () {
                    // console.log(tab_total);
                    var api = this.api();
                    var pageInfo = api.page.info();
                    // return 'Page '+ (pageInfo.page*20) +' of '+ pageInfo.pages;
                    return '显示第 ' + ((pageInfo.page * 20) + 1) + ' 至 ' + ((pageInfo.page * 20) + 20) + ' 项结果'
                },
                "pagingType": "numbers",



                searching: false,
                paging: true,
                "lengthChange": true,
                scrollY: "400px",
                scrollCollapse: false,
                language: {
                    "sProcessing": "处理中...",
                    "sLengthMenu": "显示 _MENU_ 项结果",
                    "sZeroRecords": "没有匹配结果",
                    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                    "sInfoPostFix": "",
                    "sSearch": "搜索:",
                    "sUrl": "",
                    "sEmptyTable": "表中数据为空",
                    "sLoadingRecords": "载入中...",
                    "sInfoThousands": ",",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "上页",
                        "sNext": "下页",
                        "sLast": "末页"
                    }
                }
            });
            document.getElementById('waitingtext').style.display = "none";
        },
    });
}
function page1() {
        // console.log(page);
        return page;
    };
function tab_tot() {
        // console.log(page);
        return tab_total;
    };
$("table:eq(0) th").css("color", "#ECF0F1");
$("table:eq(0) th").css("background-color", "rgba(52, 73, 94, .94)");
$('#datatable-fixed-header').addClass('table table-striped table-bordered');
$('#datatable-fixed-header').on('page.dt', function () {
    // console.log(this);
    var info = table.page.info();
    // console.log(info);
    console.log('Showing page: ' + info.page + ' of ' + info.pages);
    page = info.page + 1;
});

//搜索部分js结束

