//dataset   filter   method
var columnName = ["quantity","discount","itemname", "price", "category", "solddate","customer","age","country","nationality","itemdesc" ];
var tableName = 'websales_home_myshop_10000';
var dNum;
var dData = [];
var dOption = [];
var rfNum;
var rfName = [];
var dis = [];//分布数组（用来画图）
var fil = [];//filter数组（filter bar的当前值发给onlinedist）
var oriFil = [];//
for (i = 0; i < columnName.length; i++) {
    var temp = {};
    temp.tablename = tableName;
    temp.columnname = columnName[i];
    temp.type = 0;
    temp.data = [];
    fil.push(temp);
    var temp2 = {};
    temp2.tablename = tableName;
    temp2.columnname = columnName[i];
    temp2.type = 0;
    temp2.data = [];
    oriFil.push(temp2);
}//初始化filter数组
var rec;//存放rec数据
var dist;//存放distribution数据
var olDis = [];
var msg;
var buttonflag = 0;
var choosingoption = {};
var choosingChart = 0;
var choosingMethod = [];
var method = [];
method[0] = {"recMethod": []};
method[1] = {"choosingMethod": []};
var presentID1 = -888;
var presentID2 = -888;
var presentID3 = -888;
var history1 = {};
var history2 = {};
var history3 = {};
var thishistory = {};
var thistab = "";
var recentHistory = [];
var page = 1;
var tab_total = 0;
var table;
var gethistorybyidAjax;
var rowcountAjax;
var deepeyeAjax;
var rangeAjax;
var historyNum;
$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/hive/getrecenthistory",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"recent": 5,"tablename": tableName}),       //所有的filter
        jsonp: 'callback',
        success: function (msg) {
            if (msg.length < 1) {
//                document.getElementById('robot_badge').innerHTML = "精彩稍后呈现...";
                $.ajax({
                                            url: "http://10.176.24.40:8083/api/hive/rowcount",
                                            type: "POST",
                                            dataType: "json",
                                            contentType: "application/json",
                                            data: JSON.stringify({"tablename": tableName}),
                                            success: function (data) {
                                                // console.log("============8888888===========");
                                                // console.log(data);
                                                tab_total = data.total;
                                                // console.log(tab_total)
                                                if(table)DataTable.distroy();
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

                // function filterDist(){
//                $.ajax({
//                    type: "POST",
//                    url: "http://10.176.24.40:8083/api/data/range",      //biaoming lieming
//                    //  url : "http://10.222.127.82:8083/api/data/range",          //biaoming lieming
//                    contentType: "application/json",
//                    dataType: "json",
//                    data: JSON.stringify({"tablename": tableName}),
//                    async: true,
//                    jsonp: 'callback',
//                    success: function (msg) {
//                        var filterHistoryState = document.createElement("li");
//                        filterHistoryState.setAttribute('onclick', "$('#tab1')[0].parentNode.parentNode.childNodes[1].setAttribute('class','active');$('#tab1')[0].parentNode.parentNode.childNodes[3].setAttribute('class','');$('#tab1')[0].parentNode.parentNode.childNodes[5].setAttribute('class','');buttonflag = 0; $('#selectButton')[0].innerHTML = '应用过滤';");
//                        filterHistoryState.innerHTML = "<a href='#tab_content1' role='tab'  data-toggle='tab' aria-expanded='true'><h3>" + moment().format('HH:mm') + "</h3><dl><dt>过滤条件推荐</dt></dl></a>";
//                        $(".history-date")[0].children[0].append(filterHistoryState);
//
//                        document.getElementById("mc").childNodes[3].childNodes[1].style.display = "block";
//                        $('#selectButton')[0].innerHTML = "应用过滤";
//
//
//                        rec = msg['recommend'];
//                        rfNum = rec.length;
//                        document.getElementById('robot_badge').innerHTML = rfNum;
//                        var recommendReasonTab = $("#tab_content1").children()[1];
//                        for(i=0;i<rfNum;i++){
//                            var temp1 = document.createElement("columnname");
//                            temp1.innerHTML = rec[i]["columnname"];
//                            recommendReasonTab.append(temp1);
//                            switch (rec[i]["type"]) {
//                                case 8:
//                                    var temp2 = document.createElement("filter1");
//                                    temp2.style.left = "120px";
//                                    temp2.style.maxWidth="600px";
//                                    temp2.style.position = "absolute";
//                                    temp2.innerHTML="推荐理由：检测到区间 ["+rec[i]["data"]+"] 内出现数值异常，该区间均值为  。建议结合其他维度进行分析。";
//                                    recommendReasonTab.append(temp2);
//                                    break;
//                                case 4:
//                                    var temp2 = document.createElement("filter1");
//                                    temp2.style.left = "120px";
//                                    temp2.style.maxWidth="600px";
//                                    temp2.style.position = "absolute";
//                                    temp2.innerHTML="推荐理由：检测到区间 ["+rec[i]["data"]+"] 内出现数值异常，该区间均值为  。建议结合其他维度进行分析。";
//                                    recommendReasonTab.append(temp2);
//                                    break;
//                                case 93:
//                                    var temp3 = document.createElement("filter2");
//                                    temp3.style.left = "120px";
//                                    temp3.style.maxWidth="600px";
//                                    temp3.style.position = "absolute";
//                                    temp3.innerHTML="推荐理由：近期数据时效性高，具有分析价值。根据您的数据集时间跨度，为您推荐 "+rec[i]["data"][0].substring(0,10)+" 到 "+rec[i]["data"][1].substring(0,10)+" 之间的数据";
//                                    recommendReasonTab.append(temp3);
//                                    break;
//                                case 12:
//                                    var temp3 = document.createElement("filter2");
//                                    temp3.style.left = "120px";
//                                    temp3.style.maxWidth="600px";
//                                    temp3.style.position = "absolute";
//                                    temp3.innerHTML="推荐理由：在您的数据集中，以下类目出现频率最高： "+rec[i]["data"][0]+" , "+rec[i]["data"][1]+" , "+rec[i]["data"][2];
//                                    recommendReasonTab.append(temp3);
//                                    break;
//                            }
//                            recommendReasonTab.innerHTML+="</br>";
//
//
//
//                        }
//
//                        dis = msg['distribution']
//                        disToData(dis);
//                        inCharts();
//
//                        for (i = 0; i < dis.length; i++) {
//                            dc = dis[i].columnname;
//                            dt = dis[i].type;
//                            fildata = [];
//                            orifildata = [];
//                            if (dt != 12) {//整型的data
//                                if (dt == 4) {
//                                    tail = dis[i].data.length - 1;
//                                    num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
//                                    fildata[0] = parseInt(Object.keys(dis[i].data[0]).toString().split('-')[0]);
//                                    fildata[1] = parseInt(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
//                                    orifildata[0] = parseInt(Object.keys(dis[i].data[0]).toString().split('-')[0]);
//                                    orifildata[1] = parseInt(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
//                                } else if (dt == 8) {
//                                    tail = dis[i].data.length - 1;
//                                    num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
//                                    fildata[0] = parseFloat(Object.keys(dis[i].data[0]).toString().split('-')[0]);
//                                    fildata[1] = parseFloat(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
//                                    orifildata[0] = parseFloat(Object.keys(dis[i].data[0]).toString().split('-')[0]);
//                                    orifildata[1] = parseFloat(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
//                                } else if (dt == 93) {
//                                    tail = dis[i].data.length - 1;
//                                    startdate = Object.keys(dis[i].data[0]).toString().split('-');
//                                    enddate = Object.keys(dis[i].data[tail]).toString().split('-');
//                                    fildata[0] = startdate[0] + "-" + startdate[1] + "-" + startdate[2];
//                                    fildata[1] = enddate[0] + "-" + enddate[1] + "-" + enddate[2];
//                                    orifildata[0] = startdate[0] + "-" + startdate[1] + "-" + startdate[2];
//                                    orifildata[1] = enddate[0] + "-" + enddate[1] + "-" + enddate[2];
//                                }
//                            } else {      //string的data
//                                for (k = 0; k < dis[i].data.length; k++) {
//                                    orifildata.push(Object.keys(dis[i].data[k])[0]);
//                                }
//                            }
//                            for (j = 0; j < fil.length; j++) {
//                                if (fil[j].columnname == dc) {
//                                    fil[j].type = dt;
//                                    fil[j].data = fildata;
//                                    oriFil[j].type = dt;
//                                    oriFil[j].data = orifildata;
//                                }
//                            }
//                        }
//                        //初始化所有filter，用于之后filter bar的最大/最小值和默认值
//                        for (i = 0; i < rfNum; i++) {
//                            rc = rec[i].columnname;
//                            rfName[i] = rc;
//                            for (j = 0; j < oriFil.length; j++) {
//                                while (oriFil[j].columnname == rc) {
//                                    ord = [];
//                                    rd = [];
//                                    if (rec[i].type == 8 || rec[i].type == 4) {//数值型的data
//                                        ord[0] = rec[i].range[0];
//                                        ord[1] = rec[i].range[1];
//                                        oriFil[j].data = ord;
//                                        rd[0] = rec[i].data[0];
//                                        rd[1] = rec[i].data[1];
//                                        fil[j].data = rd;
//                                    } else if (rec[i].type == 12) {      //string的data
//                                        for (k = 0; k < rec[i].data.length; k++) {
//                                            ord.push(rec[i].data[k]);//这里遗留问题，range返回的是该列所有的不同值。应当返回的是最高的9个值，然后在data里返回其中推荐的filter
//                                            rd.push(rec[i].data[k]);
//                                            //                                    fil[j].data = rd;
//                                        }
//                                    } else if (rec[i].type == 93) {
//                                        ord[0] = rec[i].range[0];
//                                        ord[1] = rec[i].range[1];
//                                        oriFil[j].data = ord;
//                                        rd[0] = rec[i].data[0];
//                                        rd[1] = rec[i].data[1];
//                                        fil[j].data = rd;
//                                    }
//                                    break;
//                                }
//                            }
//                            createFilterTab(rc);
//                        }//更新filter数组中的filter为推荐的值，并为推荐的filter创建filter tab
//
//                        var tab = document.createElement('li');
//                        tab.setAttribute('id', 'addtabs');
//                        tab.innerHTML = '<a data-toggle="tab" onclick="expandTab()" aria-expanded="true">更多...</a>'
//                        $('#columnTabs').append(tab);
//
//                        document.getElementById("datatable-fixed-header").style.display = "block";
//                        $.ajax({
//                            url: "http://10.176.24.40:8083/api/hive/rowcount",
//                            type: "POST",
//                            dataType: "json",
//                            contentType: "application/json",
//                            data: JSON.stringify({"tablename": tableName}),
//                            success: function (data) {
//                                // console.log("============8888888===========");
//                                // console.log(data);
//                                tab_total = data.total;
//                                // console.log(tab_total)
//                                if(table)DataTable.distroy();
//                                table = $('#datatable-fixed-header').DataTable({
//                                    // "processing": true,
//                                    "serverSide": true,
//                                    // "ordering": true,
//                                    "ajax": {
//                                        url: "http://10.176.24.40:8083/api/hive/getdata",
//                                        type: "POST",
//                                        contentType: "application/json",
//                                        dataType: "json",
////                    async: false,
//                                        data: function () {
//                                            return JSON.stringify({
//                                                "tablename": tableName,
//                                                "page": page1(),
//                                                "filters": []
//                                            });
//                                        },
//                                    },//ajax
//
//                                    "columns":
//                                        [
//                                            {"data": "itemname"},
//                                            {"data": "itemdesc"},
//                                            {"data": "quantity"},
//                                            {"data": "price"},
//                                            {"data": "category"},
//                                            {"data": "solddate"}
//                                        ],
//                                    "infoCallback": function () {
//                                        // console.log(tab_total);
//                                        var api = this.api();
//                                        var pageInfo = api.page.info();
//                                        // return 'Page '+ (pageInfo.page*20) +' of '+ pageInfo.pages;
//                                        return '显示第 ' + ((pageInfo.page * 20) + 1) + ' 至 ' + ((pageInfo.page * 20) + 20) + ' 项结果， ' + ' 共 ' + tab_tot() + ' 项'
//                                    },
//                                    "pagingType": "numbers",
//                                    searching: false,
//                                    paging: true,
//                                    "lengthChange": false,
//                                    scrollY: "400px",
//                                    scrollCollapse: false,
//                                    language: {
//                                        "sProcessing": "处理中...",
//                                        "sLengthMenu": "显示 _MENU_ 项结果",
//                                        "sZeroRecords": "没有匹配结果",
//                                        "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
//                                        "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
//                                        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
//                                        "sInfoPostFix": "",
//                                        "sSearch": "搜索:",
//                                        "sUrl": "",
//                                        "sEmptyTable": "表中数据为空",
//                                        "sLoadingRecords": "载入中...",
//                                        "sInfoThousands": ",",
//                                        "oPaginate": {
//                                            "sFirst": "首页",
//                                            "sPrevious": "上页",
//                                            "sNext": "下页",
//                                            "sLast": "末页"
//                                        }
//                                    }
//                                });
//                                document.getElementById('waitingtext').style.display = "none";
//                            },
//                        });
//
//                        function page1() {
//                            // console.log(page);
//                            return page;
//                        };
//
//                        function tab_tot() {
//                            // console.log(page);
//                            return tab_total;
//                        };
//                        $("table:eq(0) th").css("color", "#ECF0F1");
//                        $("table:eq(0) th").css("background-color", "rgba(52, 73, 94, .94)");
//                        $('#datatable-fixed-header').addClass('table table-striped table-bordered');
//                        $('#datatable-fixed-header').on('page.dt', function () {
//                            // console.log(this);
//                            var info = table.page.info();
//                            // console.log(info);
//                            console.log('Showing page: ' + info.page + ' of ' + info.pages);
//                            page = info.page + 1;
//                        });
//
//
//
//
//
//                    },//success function
//                    error: function () {
//                        alert("error on data/range!");
//                    }
//                });//ajax
            }//if

//            document.getElementById('robot_badge').innerHTML = "加载中...";
            historyNum = msg.length;
            for (i = historyNum - 1; i >= 0; i--) {
                recentHistory[i] = msg[i];
                var history = document.createElement("li");
                var time = document.createElement("h3");
                time.innerHTML += moment(msg[i]['time']['time']).format("YYYY.MM.DD");
                if ((msg[i]['time']['hours'] + 13) % 24 < 10) time.innerHTML += "0";
                time.innerHTML += " " + (msg[i]['time']['hours'] + 13) % 24 + ":" + msg[i]['time']['minutes'];

                var dl = document.createElement("dl");
                var dt = document.createElement("dt");
                if (msg[i]["step"] == 1) {
                    dt.innerHTML = "过滤条件选择"
                } else if (msg[i]["step"] == 2) {
                    dt.innerHTML = "可视化推荐"
                } else if (msg[i]["step"] == 3) {
                    dt.innerHTML = "分析方法选择"
                }
                dl.append(dt);
                $("#history-ul")[0].append(history);
                history.append(dl);
                history.append(time);
                history.setAttribute("id", msg[i]['log_id']);
                history.setAttribute("onclick", "clickHistory(this.id)");
            }
            clickHistory(recentHistory[0]["log_id"]);
        },//success function
        error: function () {
            alert("Error on hive/getrecenthistory!")
        }
    })
})

function clickHistory(logid) {
    var thisstep;
    $('#'+logid).siblings().each(function(){$(this).css("background-color","")});
    document.getElementById(logid.toString()).style.backgroundColor = "rgba(38, 185, 154, 0.1)";
    if(gethistorybyidAjax)gethistorybyidAjax.abort();
    gethistorybyidAjax=$.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/gethistorybyid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": logid
        }),
        jsonp: 'callback',
        success: function (msg) {
            thishistory = msg;
        },//success function
        error: function () {
            alert("error on hive/gethistorybyid!?")
        }
    });
    thistab = "#tab" + thishistory['step'];

    if (thishistory['step'] == 3) {
        presentID3 = logid;
        presentID2 = getpreviousid(presentID3);
        presentID1 = getpreviousid(presentID2);
        history3 = thishistory;
        history2 = gethistorybyid(presentID2)
        history1 = gethistorybyid(presentID1);
        document.getElementById('tab3').style.display = "block";
        document.getElementById('tab2').style.display = "block";

    } else if (thishistory['step'] == 2) {

        document.getElementById('tab3').style.display = "none";
        presentID2 = logid;
        presentID1 = getpreviousid(presentID2);
        history2 = thishistory;
        history1 = gethistorybyid(presentID1);
    } else if (thishistory['step'] == 1) {
        document.getElementById('tab2').style.display = "none";
        presentID1 = logid;
        history1 = gethistorybyid(presentID1);
        $("#tab1").trigger('click');
    }

    fil = history1['record'];
    if (thishistory['step'] < 3) {
//        var table = document.createElement("table");
//        table.setAttribute('id',"datatable-fixed-header");
//        table.setAttribute('class',"table table-striped table-bordered");
//        document.getElementById("dataBoard").children[1] .innerHTML = '<table id="datatable-fixed-header" class="table table-striped table-bordered"><th>quantity</th><th>discount</th><th>itemname</th><th>price</th><th>category</th>   <th>solddate</th>         <th>customer</th>       <th>age</th>      <th>country</th>    <th>nationality</th>        <th>itemdesc</th></tr></thead></table>';
//       document.getElementById("dataBoard").children[1] =table;
        document.getElementById("datatable-fixed-header").style.display = "block";
        if(rowcountAjax)rowcountAjax.abort();
        rowcountAjax = $.ajax({
            url: "http://10.176.24.40:8083/api/hive/rowcount",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({"tablename": tableName}),
            success: function (data) {
                // console.log("============8888888===========");
                // console.log(data);
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
                        [
                            {"data": "quantity"},
                            {"data": "discount"},
                            {"data": "itemname"},
                            {"data": "price"},
                            {"data": "category"},
                            {"data": "solddate"},
                            {"data": "customer"},
                             {"data": "age"},
                             {"data": "country"},
                             {"data": "nationality"},
                             {"data": "itemdesc"}
],
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
    } else {
        document.getElementById('methodpage').innerHTML = "";    }

if(rangeAjax)range.abort();
    rangeAjax=$.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/range",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"tablename": tableName}),
        async: true,
        jsonp: 'callback',
        success: function (msg) {
            document.getElementById("mc").childNodes[3].childNodes[1].style.display = "block";
            dis = msg['distribution']
            disToData(dis);
            for (i = 0; i < dis.length; i++) {
                dc = dis[i].columnname;
                dt = dis[i].type;
                fildata = [];
                orifildata = [];
                if (dt != 12) {//整型的data
                    if (dt == 4) {
                        tail = dis[i].data.length - 1;
                        num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
                        orifildata[0] = parseInt(Object.keys(dis[i].data[0]).toString().split('-')[0]);
                        orifildata[1] = parseInt(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
                    } else if (dt == 8) {
                        tail = dis[i].data.length - 1;
                        num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
                        orifildata[0] = parseFloat(Object.keys(dis[i].data[0]).toString().split('-')[0]);
                        orifildata[1] = parseFloat(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
                    } else if (dt == 93) {
                        tail = dis[i].data.length - 1;
                        startdate = Object.keys(dis[i].data[0]).toString().split('-');
                        enddate = Object.keys(dis[i].data[tail]).toString().split('-');
                        orifildata[0] = startdate[0] + "-" + startdate[1] + "-" + startdate[2];
                        orifildata[1] = enddate[0] + "-" + enddate[1] + "-" + enddate[2];
                    }
                } else {      //string的data
                    for (k = 0; k < dis[i].data.length; k++) {
                        orifildata.push(Object.keys(dis[i].data[k])[0]);
                    }
                }
                for (j = 0; j < fil.length; j++) {
                    if (oriFil[j].columnname == dc) {
                        oriFil[j].type = dt;
                        oriFil[j].data = orifildata;
                    }
                }
            }
            rec = msg['recommend'];
            rfNum = rec.length;
            document.getElementById("columnTabs").innerHTML = "";
            for (i = 0; i < rfNum; i++) {
                rc = rec[i].columnname;
                rfName[i] = rc;
                for (j = 0; j < oriFil.length; j++) {
                    while (oriFil[j].columnname == rc) {
                        ord = [];
                        rd = [];
                        if (rec[i].type == 8 || rec[i].type == 4) {//数值型的data
                            ord[0] = rec[i].range[0];
                            ord[1] = rec[i].range[1];
                            oriFil[j].data = ord;
                        } else if (rec[i].type == 12) {      //string的data
                            for (k = 0; k < rec[i].data.length; k++) {
                                ord.push(rec[i].data[k]);//这里遗留问题，range返回的是该列所有的不同值。应当返回的是最高的9个值，然后在data里返回其中推荐的filter
                            }
                        } else if (rec[i].type == 93) {
                            ord[0] = rec[i].range[0];
                            ord[1] = rec[i].range[1];
                            oriFil[j].data = ord;
                        }
                        break;
                    }
                }
                createFilterTab(rc);
            }//更新filter数组中的filter为推荐的值，并为推荐的filter创建filter tab
            inCharts();
            var tab = document.createElement('li');
            tab.setAttribute('id', 'addtabs');
            tab.innerHTML = '<a data-toggle="tab" onclick="expandTab()" aria-expanded="true">更多...</a>'
            $('#columnTabs').append(tab);
            tabExpanded = 0;
            expandTab();
            $(thistab).trigger('click');
//            document.getElementById('robot_badge').innerHTML = historyNum;


        },//success function
        error: function () {
            alert("error on data/range!");
        }
    });//ajax

    $('#selectButton')[0].innerHTML = "应用过滤";

    if (thishistory['step'] == 1) {
        if (document.getElementById("datatable-fixed-header_wrapper"))
            document.getElementById("datatable-fixed-header_wrapper").style.display = "block";
    }
    if (thishistory['step'] > 1) {
        if(document.getElementById("datatable-fixed-header_wrapper"))
        document.getElementById("datatable-fixed-header_wrapper").style.display = "block";
        //
        // document.getElementById("datatable-fixed-header_wrapper").style.display ="block";
        $('#selectButton')[0].innerHTML = "选择数据";
        if(deepeyeAjax)deepeyeAjax.abort();
        deepeyeAjax = $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/data/deepeye",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(fil),       //所有的filter
            jsonp: 'callback',
            success: function (msg) {
                $('#myTab')[0].children[1].style.display = "block";
                document.getElementById("tab2").style.display = "block";
                dNum = msg.length;
                for (i = 0; i < dNum; i++) {
                    dData[i] = msg[i];
                }
                document.getElementById("visrecpage").innerHTML = "";
                for (i = 0; i < dNum; i++) {
                    xdata = dData[i].xdata[0];
                    ydata = dData[i].ydata;
                    xname = dData[i].xcolumn;
                    yname = dData[i].ycolumn;
                    cType = dData[i].cType;
                    classify = dData[i].classify;
if(i<2)cType = "line";
                    // console.log(yData);
                    if (cType != 'pie' && cType != 'scatter') {
//                        if(cType == 'scatter')cType = 'line';
                        series = [];
                        for (j = 0; j < classify.length; j++) {
                            serie = {};
                            serie["name"] = classify[j];
                            serie["type"] = cType;
                            serie["data"] = ydata[j];
                            series.push(serie);
                        }
                        if (j == 0) {
                            series = {};
                            series["data"] = ydata[0];
                            series["type"] = cType;
                        }
//                        console.log(series);
                        dOption[i] = {
                            title: {
//                                    text: yname + ' of ' + xname,
                                text: "",
                                textStyle: {
                                    fontSize: 18
                                },
                                x: 'center',
                                y: 'top'
                            },
                            legend: {
                                data: classify,
                                type: 'scroll',
                            },
                            xAxis: {
                                name: xname,
                                data: xdata,
                                show: true,
                                nameLocation: 'center',
                                nameGap:30
                            },
                            yAxis: {
                                name: yname,
                                show: true,

                            },
                            axisPointer: {
                                show: true,
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        show: true,
                                    }
                                },
                                top: '14%',
                            },
                            series: series,
                            grid: {
                                top: '15%',
                                left: '10%',
                                right: '12%',
                                bottom: '8%',
                                containLabel: true
                            }
                        };
                    } else if (cType == 'pie') {
                        piedata = [];
                        for (m = 0; m < xdata.length; m++) {
                            temp = {};
                            temp['name'] = xdata[m];
                            temp['value'] = ydata[m];
                            piedata.push(temp);
                        }
                        //console.log(piedata);
                        dOption[i] = {
                            title: {
                                x: 'center',
                                y: 'top',
                                text: "",
//                                       text:yname + ' of ' + xname,
                                textStyle: {
                                    fontSize: 18
                                }
                            },
                            tooltip: {},
                            series: [{
                                center: ['50%', '52%'],
                                radius: '66%',
                                type: 'pie',
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: true
                                        },
                                        labelLine: {
                                            show: true
                                        }
                                    }
                                },
                                data: piedata,
                            }],
                            grid: {
                                top: '20%'
                            }
                        }
                    } else if (cType == 'scatter') {
                        sdata = [];
                        scatterydata = [];
                        for (p = 0; p < xdata.length; p++) {
                            temp = [];
                            temp[0] = xdata[p];
                            temp[1] = ydata[0][p];
                            scatterydata.push(ydata[0][p]);
                            sdata.push(temp);
                        }
                        dOption[i] = {
                            title: {
//                                    text: yname + ' of ' + xname,
                                text: "",
                                textStyle: {
                                    fontSize: 18
                                },
                                x: 'center',
                                y: 'top'
                            },
                            legend: {
                                data: classify,
                                type: 'scroll',
                            },
                            xAxis: {
                                name: xname,
                                show: true,
                                nameLocation: 'center',
                                                                                      nameGap:30
                            },
                            yAxis: {
//                                     data:scatterydata,
                                name: yname,
                                show: true
                            },
                            axisPointer: {
                                show: true,
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        show: true,
                                    }
                                },
                                top: '14%',
                            },
                            series: {
                                data: sdata,
                                type: cType,
                            },
                            grid: {
                                top: '28%',
                                left: '10%',
                                right: '12%',
                                bottom: '2%',
                                containLabel: true
                            }
                        };
                    }
                }
                if (dNum <= 4) {
                    for (k = 0; k < dNum; k++) {
                        var dc = document.createElement('li');  //deep eye chart
                        dc.className = 'deChart';
                        dc.setAttribute('id', 'chart' + k)
                        dc.setAttribute('onClick', 'choosingDeChart(this)');
                        $('#visrecpage').append(dc);

                        deChart = echarts.init(dc);
                        deChart.setOption(dOption[k]);
                    }
                    choosingoption = dOption[history2['record'][0]['chartId']];
                }
                element = document.getElementById('pagechart');
                element.style.top = "27px";
                // element.style.height = "700%";
                element.style.width = "100%";
                element.style.backgroundColor = "white";
                element.innerHTML = "<div id=\"page_chart\" style=\"height: 750px;width: 100%\"></div>";
                element = document.getElementById('page_chart');
                myChart = echarts.init(element);
                myChart.setOption(dOption[history2['record'][0]['chartId']]);
                document.getElementById("chart" + history2['record'][0]['chartId']).style.backgroundColor = 'rgba(38,185,154,.10)';
                $(thistab).trigger('click');
                document.getElementById("waitingtext").style.display = "none";
            },//success function
            error: function () {
                alert("error on data/deepeye!")
            }
        });
    }
    if (thishistory['step'] > 2) {
        document.getElementById("datatable-fixed-header").style.display = "none";
        if(document.getElementById("datatable-fixed-header_wrapper"))
        document.getElementById("datatable-fixed-header_wrapper").style.display = "none";

        document.getElementById("tab3").style.display = "block";
        document.getElementById("tab2").style.display = "block";

        $('#selectButton')[0].innerHTML = "开始分析";
        method = history3.record;
        $('#myTab')[0].children[2].style.display = "block";
        methodData = [{
            "methodname": "预测趋势",
            "methoddescription": "推荐算法：线性回归",
            "methodparameter": " max-iter = 10"
        },
            {
                "methodname": "异常查找",
                "methoddescription": "推荐算法：孤立森林",
                "methodparameter": "max-iter = 50 ；trees = 100"
            },
            {
                "methodname": "数据划分",
                "methoddescription": "推荐算法：k-means",
                "methodparameter": " k = 4"
            }
        ];
        method[0]['recMethod'] = [];
        for (var k = 0; k < methodData.length; k++) {
            method[0]['recMethod'].push(methodData[k]['methodname']);
            var methodtab = document.createElement('li');
            methodtab.setAttribute('id', 'method' + k);
            methodtab.style.backgroundColor = 'rgb(255,255,255)';
            methodtab.setAttribute('onClick', 'choosingmethod(this)');
            methodtab.style.listStyleType = 'none';
            methodtab.innerHTML =
                '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon"><i class="fa fa-caret-square-o-right"></i></div><div class="methodname">'
                + methodData[k]['methodname'] +
                '</div><div style="position: absolute;left: 154px; bottom: 92px;">有 '+ ' '+ '%的用户选择</div><div class = "methoddescription">'
                + methodData[k]['methoddescription'] +
                '</div><div class = "methodparameter">推荐参数:'
                + methodData[k]['methodparameter'] +
                '</div></div></div>';
            document.getElementById('methodpage').append(methodtab);
//            methodtab.childNodes[0].childNodes[0].style.backgroundColor = 'rgb(255,255,255)';
        }
        for (var k = 0; k < methodData.length; k++) {
            if (method[0]['recMethod'].indexOf(method[1]['choosingMethod'][k]) > -1) {
                var i = method[0]['recMethod'].indexOf(method[1]['choosingMethod'][k]);
                console.log(i, method[1]['choosingMethod'][k]);
                document.getElementById('methodpage').childNodes[i].childNodes[0].childNodes[0].style.backgroundColor = 'rgba(38,185,154,.10)';
            }
        }
        $(thistab).trigger('click');
    }
    buttonflag = thishistory['step'] - 1;

    console.log(history1, history2, history3);


}


function getpreviousid(logid) {
    var result = -888;
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/getpreviousid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": logid
        }),
        jsonp: 'callback',
        success: function (msg) {
            result = msg;
        },//success function
        error: function () {
            alert("error on hive/getpreviousid!?")
        }
    });
    return result;
}

function gethistorybyid(logid) {
    var result = {};
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/gethistorybyid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": logid
        }),
        jsonp: 'callback',
        success: function (msg) {
            result = msg;
        },//success function
        error: function () {
            alert("error on hive/getpreviousid!?")
        }
    });
    return result;
}

function usingFilter() {
    if (buttonflag == 0) {
        buttonflag = 1;                                                           //进入可视化推荐界面
        //生成新tab页
//        document.getElementById('robot_badge').innerHTML = "努力工作中...";

        $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/data/deepeye",
//             url : "http://127.0.0.1:8083/api/data/deepeye",
//             url : "http://202.120.224.58:8083/api/data/deepeye",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(fil),       //所有的filter
            //                 async:false,
            jsonp: 'callback',
            success: function (msg) {
                $('#myTab')[0].children[1].style.display = "block";
                document.getElementById('tab2').style.display="block";
                $('#selectButton')[0].innerHTML = "选择数据";
                dNum = msg.length;
                for (i = 0; i < dNum; i++) {
                    dData[i] = msg[i];
                }
                document.getElementById("visrecpage").innerHTML = "";
//                document.getElementById('robot_badge').innerHTML = dNum;
                for (i = 0; i < dNum; i++) {
                    xdata = dData[i].xdata[0];
                    ydata = dData[i].ydata;
                    xname = dData[i].xcolumn;
                    yname = dData[i].ycolumn;
                    cType = dData[i].cType;
                    classify = dData[i].classify;
                    if(i<2)cType = "line";
                    // console.log(yData);
                    if (cType != 'pie' && cType != 'scatter') {
//                        if(cType == 'scatter')cType = 'line';
                        series = [];
                        for (j = 0; j < classify.length; j++) {
                            serie = {};
                            serie["name"] = classify[j];
                            serie["type"] = cType;
                            serie["data"] = ydata[j];
                            series.push(serie);
                        }
                        if (j == 0) {
                            series = {};
                            series["data"] = ydata[0];
                            series["type"] = cType;
                        }
//                        console.log(series);
                        dOption[i] = {
                            title: {
//                                    text: yname + ' of ' + xname,
                                text: "",
                                textStyle: {
                                    fontSize: 18
                                },
                                x: 'center',
                                y: 'top'
                            },
                            legend: {
                                data: classify,
                                type: 'scroll',
                            },
                            xAxis: {
                                name: xname,
                                data: xdata,
                                show: true,
                                nameLocation: 'center',
                                                                                      nameGap:30
                            },
                            yAxis: {
                                name: yname,
                                show: true,

                            },
                            axisPointer: {
                                show: true,
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        show: true,
                                    }
                                },
                                top: '14%',
                            },
                            series: series,
                            grid: {
                                top: '28%',
                                left: '10%',
                                right: '12%',
                                bottom: '2%',
                                containLabel: true
                            }
                        };
                    } else if (cType == 'pie') {
                        piedata = [];
                        for (m = 0; m < xdata.length; m++) {
                            temp = {};
                            temp['name'] = xdata[m];
                            temp['value'] = ydata[m];
                            piedata.push(temp);
                        }
                        //console.log(piedata);
                        dOption[i] = {
                            title: {
                                x: 'center',
                                y: 'top',
                                text: "",
//                                       text:yname + ' of ' + xname,
                                textStyle: {
                                    fontSize: 18
                                }
                            },
                            tooltip: {},
                            series: [{
                                center: ['50%', '52%'],
                                radius: '66%',
                                type: 'pie',
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: true
                                        },
                                        labelLine: {
                                            show: true
                                        }
                                    }
                                },
                                data: piedata,
                            }],
                            grid: {
                                top: '20%'
                            }
                        }
                    } else if (cType == 'scatter') {
                        sdata = [];
                        scatterydata = [];
                        for (p = 0; p < xdata.length; p++) {
                            temp = [];
                            temp[0] = xdata[p];
                            temp[1] = ydata[0][p];
                            scatterydata.push(ydata[0][p]);
                            sdata.push(temp);
                        }
                        dOption[i] = {
                            title: {
//                                    text: yname + ' of ' + xname,
                                text: "",
                                textStyle: {
                                    fontSize: 18
                                },
                                x: 'center',
                                y: 'top'
                            },
                            legend: {
                                data: classify,
                                type: 'scroll',
                            },
                            xAxis: {
                                name: xname,
                                show: true,
                                nameLocation: 'center',
                                                                                      nameGap:30
                            },
                            yAxis: {
//                                     data:scatterydata,
                                name: yname,
                                show: true
                            },
                            axisPointer: {
                                show: true,
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    dataZoom: {
                                        show: true,
                                    }
                                },
                                top: '14%',
                            },
                            series: {
                                data: sdata,
                                type: cType,
                            },
                            grid: {
                                top: '28%',
                                left: '10%',
                                right: '12%',
                                bottom: '12%',
                                containLabel: true
                            }
                        };
                    }
                }
                if (dNum <= 4) {
                    for (k = 0; k < dNum; k++) {
                        var dc = document.createElement('li');  //deep eye chart
                        dc.className = 'deChart';
                        dc.setAttribute('id', 'chart' + k)
                        dc.setAttribute('onClick', 'choosingDeChart(this)');
                        //            dc.style.width = '200px';
                        //            dc.style.height = '200px';
                        $('#visrecpage').append(dc);

                        deChart = echarts.init(dc);
                        deChart.setOption(dOption[k]);
                    }
                    choosingoption = dOption[0];
                }

var history = document.createElement("li");
                var time = document.createElement("h3");
                time.innerHTML += moment().format("YYYY.MM.DD hh:mm");
//                if ((msg[i]['time']['hours'] + 13) % 24 < 10) time.innerHTML += "0";
//                time.innerHTML += " " + (msg[i]['time']['hours'] + 13) % 24 + ":" + msg[i]['time']['minutes'];

                var dl = document.createElement("dl");
                var dt = document.createElement("dt");
                dt.innerHTML = "过滤条件选择"

                dl.append(dt);
                $("#history-ul")[0].append(history);
                history.append(dl);
                history.append(time);
                history.setAttribute("id", presentID1);
                history.setAttribute("onclick", "clickHistory(this.id)");

//                var visualizationHistoryState = document.createElement("li");
//                visualizationHistoryState.setAttribute('onclick', "$('#myTab')[0].childNodes[1].setAttribute('class','');$('#myTab')[0].childNodes[3].setAttribute('class','active');$('#myTab')[0].childNodes[5].setAttribute('class',''); document.getElementById('selectButton').innerHTML = '选择数据';buttonflag=1;");
//                visualizationHistoryState.innerHTML = "<a href='#tab_content2' role='tab' data-toggle='tab' aria-expanded='true'><h3>" + moment().format('HH:mm') + "</h3><dl><dt>过滤条件选择</dt></dl>";
//                $(".history-date")[0].children[0].append(visualizationHistoryState);
                $("#tab2").trigger('click');
            },//success function
            error: function () {
                alert("error on data/deepeye!")
            }
        });

//        postdata1["tablename"]=tableName;
//        postdata1["userid"]=1;
//        postdata1["step"]=1;
//        postdata1.record=fil;
//        postdata1["previous"]= -1;

        $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/hive/savehistory",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "tablename": tableName,
                "userid": 1,
                "step": 1,
                "record": fil,
                "previous": -1
            }),
            jsonp: 'callback',
            success: function (msg) {
                presentID1 = msg;
            },//success function
            error: function () {
                alert("error on hive/savehistory!?")
            }
        });


        $('#tableOri').DataTable({
            "serverSide": true,
            "ajax": {
                url: "http://10.176.24.40:8083/api/hive/getdata",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                async: false,
                data: function (d) {
                    return JSON.stringify({
                        "tablename": tableName,
                        "page": 1,
                        "filters": []
                    });
                },
            },
            "columns":
                [
                    {"data": "quantity"},
                    {"data": "discount"},
                    {"data": "itemname"},
                    {"data": "price"},
                    {"data": "category"},
                    {"data": "solddate"},
                    {"data": "customer"},
                     {"data": "age"},
                     {"data": "country"},
                     {"data": "nationality"},
                     {"data": "itemdesc"}
                ],

            searching: false,
            paging: false,
            scrollY: "400px",
            scrollCollapse: false,
            bRetrieve: true,
        });
        $('#tableOri')
            .addClass('table table-striped table-bordered');
    } else if (buttonflag == 1) {
       var history = document.createElement("li");
                       var time = document.createElement("h3");
                       time.innerHTML += moment().format("YYYY.MM.DD hh:mm");
       //                if ((msg[i]['time']['hours'] + 13) % 24 < 10) time.innerHTML += "0";
       //                time.innerHTML += " " + (msg[i]['time']['hours'] + 13) % 24 + ":" + msg[i]['time']['minutes'];

                       var dl = document.createElement("dl");
                       var dt = document.createElement("dt");
                       dt.innerHTML = "可视化推荐";

                       dl.append(dt);
                       $("#history-ul")[0].append(history);
                       history.append(dl);
                       history.append(time);
                       history.setAttribute("id", presentID2);
                       history.setAttribute("onclick", "clickHistory(this.id)");

        buttonflag = 2;
        document.getElementById('methodpage').innerHTML = "";
        element = document.getElementById('dataBoard');
        element.style.top = "27px";
        // element.style.height = "700%";
        element.style.width = "100%";
        element.style.backgroundColor = "white";
        element.innerHTML = "<div id=\"page_chart\" style=\"height: 750px;width: 100%;top: -100px;\"></div>";
        element = document.getElementById('page_chart');
        myChart = echarts.init(element);
        myChart.setOption(dOption[choosingChart]);
        $('#myTab')[0].children[2].style.display = "block";
        $('#myTab')[0].children[2].children[0].style.display = "block";
        document.getElementById('selectButton').innerHTML = "开始分析";
//        document.getElementById('robot_badge').innerHTML = 3;

        $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/hive/savehistory",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "tablename": tableName,
                "userid": 1,
                "step": 2,
                "record": [{"chartId": choosingChart},{"xcolumn":dOption[choosingChart].xAxis.name},{"ycolumn":dOption[choosingChart].yAxis.name}],
                "previous": presentID1,
            }),       //所有的filter
            jsonp: 'callback',
            success: function (msg) {
                presentID2 = msg;
            },//success function
            error: function () {
                alert("error on hive/savehistory!")
            }
        });
        $("#tab3").trigger('click');
        var methodscore = [];
       $.ajax({
           type: "POST",
           url: "http://10.176.24.40:8083/api/data/methodrec",
//           url: "http://127.0.0.1:8083/api/data/methodrec",
           contentType: "application/json",
           dataType: "json",
           data: JSON.stringify(
           [{"previousStepId":presentID1},{"xcolumn":dOption[choosingChart].xAxis.name},{"ycolumn":dOption[choosingChart].yAxis.name}]),
           async: false,
           jsonp: 'callback',
           success: function (msg) {
               methodNum = msg.length;
               console.log(msg);
//               document.getElementById('robot_badge').innerHTML = msg.length;
               method[1]['choosingMethod']=[];
               method[0]['recMethod']=[];
               for(i=0;i<methodNum;i++){
                  method[0]['recMethod'].push(Object.keys(msg[i]));
                  methodscore.push(msg[i][Object.keys(msg[i])]);

               }
           },//success function
           error: function () {alert("error on data/methodrec!")}
       });
        methodData = [{
            "methodname": "预测趋势",
            "methoddescription": "推荐算法：线性回归",
            "methodparameter": " max-iter = 10"
        },
        {
            "methodname": "异常查找",
            "methoddescription": "推荐算法：孤立森林",
            "methodparameter": "max-iter = 50 ；trees = 100"
        },
        {
            "methodname": "数据划分",
            "methoddescription": "推荐算法：k-means",
            "methodparameter": " k = 4"
        }
        ];
        for (i = 0; i < 3; i++) {
            if( method[0].recMethod.indexOf(methodData[i]['methodname'])<0)
                method[0].recMethod.push(methodData[i]['methodname']);
        }
        for (i = 0; i < methodData.length; i++) {
            if(i==0){
                var methodtab = document.createElement('li');
                methodtab.setAttribute('id', 'method' + i);
                methodtab.style.backgroundColor = 'rgb(255,255,255)';
                methodtab.setAttribute('onClick', 'choosingmethod(this)');
                methodtab.style.listStyleType = 'none';
                methodtab.innerHTML =
                    '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon"><img src="./vendors/images/recmethod0.PNG" style="height: 145px;width:145px"></img></div><div class="methodname">'
                    + methodData[i]['methodname'] +
                    '</div><div style="position: absolute;left: 154px; bottom: 92px;">有 '+ ((methodscore[i]/4).toFixed(2))*100+ '%的用户选择</div><div class = "methoddescription">'
                    + methodData[i]['methoddescription'] +
                    '</div><div class = "methodparameter">推荐参数:'
                    + methodData[i]['methodparameter'] +
                    '</div></div></div>';
                document.getElementById('methodpage').append(methodtab);
            }
            if(i==1){
                var methodtab = document.createElement('li');
                methodtab.setAttribute('id', 'method' + i);
                methodtab.style.backgroundColor = 'rgb(255,255,255)';
                methodtab.setAttribute('onClick', 'choosingmethod(this)');
                methodtab.style.listStyleType = 'none';
                methodtab.innerHTML =
                    '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon" ><img src="./vendors/images/recmethod1.PNG" style="height: 145px;width:145px"></img></div><div class="methodname">'
                    + methodData[i]['methodname'] +
                    '</div><div style="position: absolute;left: 154px; bottom: 92px;">有 '+ ((methodscore[i]/4).toFixed(2))*100+ '%的用户选择</div><div class = "methoddescription">'
                    + methodData[i]['methoddescription'] +
                    '</div><div class = "methodparameter">推荐参数'
                    + methodData[i]['methodparameter'] +
                    '</div></div></div>';
                document.getElementById('methodpage').append(methodtab);
            }
            if(i==2){
                var methodtab = document.createElement('li');
                methodtab.setAttribute('id', 'method' + i);
                methodtab.style.backgroundColor = 'rgb(255,255,255)';
                methodtab.setAttribute('onClick', 'choosingmethod(this)');
                methodtab.style.listStyleType = 'none';
                methodtab.innerHTML =
                    '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon" ><img src="./vendors/images/recmethod2.PNG" style="height: 145px;width:145px"></img></div><div class="methodname">'
                    + methodData[i]['methodname'] +
                    '</div><div style="position: absolute;left: 154px; bottom: 92px;">有 '+((methodscore[i]/4).toFixed(2))*100+ '%的用户选择</div><div class = "methoddescription">'
                    + methodData[i]['methoddescription'] +
                    '</div><div class = "methodparameter">推荐参数'
                    + methodData[i]['methodparameter'] +
                    '</div></div></div>';
                document.getElementById('methodpage').append(methodtab);
            }
//            methodtab.childNodes[0].childNodes[0].style.backgroundColor = 'rgb(255,255,255)';
        }

    } else if (buttonflag == 2) {
        buttonflag +=1;
//        document.getElementById('page').innerHTML = "";

//        $.ajax({
//            type: "POST",
//            url: "http://10.176.24.40:8083/api/hive/savehistory",
//            contentType: "application/json",
//            dataType: "json",
//            data: JSON.stringify({
//                "tablename": "web_sales_home",
//                "userid": 1,
//                "step": 3,
//                "record": method,
//                "previous": presentID2,
//            }),       //所有的filter
//            jsonp: 'callback',
//            success: function (msg) {
//                presentID3 = msg;
//            },//success function
//            error: function () {
//                alert("error on hive/savehistory!")
//            }
//        });
        var cd = dData[choosingChart];
        var cddata={};
        for(var i=0;i<cd['xdata'][0].length;i++){
            var sec = ("sec"+(i+1)).toString();
            var jsonkey = cd['xdata'][0][i];
            var value = cd['ydata'][0][i];
            var jsonobject ={};
            jsonobject[jsonkey]=value;
            cddata[sec]=jsonobject;
        }
        var pushdata = [
            {
                "xcolumn":cd.xcolumn,
                "ycolumn":cd.ycolumn,
                "data":cddata
            }
        ]
        $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/data/exceptiondetect",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(pushdata),
            async: false,
            jsonp: 'callback',
            success: function (msg) {

                dNum = msg.length;
                for (i = 0; i < dNum; i++) {
                    dData[i] = msg[i];
                }
                for (i = 0; i < dNum; i++) {
                    var exn = [];
                    data = dData[i].data;
                    xname = dData[i].xcolumn;
                    yname = dData[i].ycolumn;
                    ex = dData[i].Exception;
                    xAxis = [];
                    yData = [];
                    ten = Object.keys(data);
                    exkey = Object.keys(ex);
                    for (j = 0; j < ten.length; j++) {
                        exn[j] = false;
                        temp = data[ten[j]];
                        xtemp = Object.keys(temp);
                        xAxis.push(xtemp);
                        yData.push(temp[xtemp]);
                        for (k = 0; k < exkey.length; k++) {
                            if (ten[j] == ex[exkey[k]]) {
                                exn[j] = true;
                            }
                        }
                    }
                    // console.log(yData);
                    dOption[i] = {
                        title: {
                            text: yname + ' of ' + xname,
                            textStyle: {
                                fontSize: 18
                            },
                            x: 'center',
                            y: 'bottom'
                        },
                        xAxis: {
                            name: xname,
                            data: xAxis,
                            show: true
                        },
                        yAxis: {
                            name: yname,
                            show: true
                        },
                        axisPointer: {
                            show: true,
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                dataZoom: {
                                    show: true,
                                },
                                magicType: {
                                    type: ['line', 'bar'],
                                    show: true
                                }
                            }

                        },
                        series: se(yData, exn),

                        grid: {
                            top: '28%',
                            left: '10%',
                            right: '12%',
                            bottom: '12%',
                            containLabel: true
                        }
                    };

                }
                ;
                page_chart = document.getElementById('page_chart');
                myChart = echarts.getInstanceByDom(page_chart);
                myChart.setOption(dOption[0]);
       var history = document.createElement("li");
                       var time = document.createElement("h3");
                       time.innerHTML += moment().format("YYYY.MM.DD hh:mm");
       //                if ((msg[i]['time']['hours'] + 13) % 24 < 10) time.innerHTML += "0";
       //                time.innerHTML += " " + (msg[i]['time']['hours'] + 13) % 24 + ":" + msg[i]['time']['minutes'];

                       var dl = document.createElement("dl");
                       var dt = document.createElement("dt");
                       dt.innerHTML = "分析方法推荐";

                       dl.append(dt);
                       $("#history-ul")[0].append(history);
                       history.append(dl);
                       history.append(time);
                       history.setAttribute("id", presentID3);
                       history.setAttribute("onclick", "clickHistory(this.id)");


//                document.getElementById('robot_badge').innerHTML = "1";
                document.getElementById("tab4").parentNode.style.display = "block";
                document.getElementById("bigdata").style.marginTop = "6%";
                $("#tab4").trigger('click');


            },//success function
            error: function () {
                alert("error on data/exceptiondetect!")
            }
        });
    }else if(buttonflag ===3 ){
        window.open("http://10.190.88.25:1888/?jid=1547195598501#");
    }

};

function choosingmethod(met) {
    id = met.id.substring(6).toString();
    son = met.childNodes[0];
    grandson = son.childNodes[0];
    if ((grandson.style.backgroundColor).indexOf('38') < 0) {
        grandson.style.backgroundColor = 'rgba(38,185,154,.10)';
        if(  method[1]['choosingMethod'].indexOf(grandson.childNodes[1].innerHTML)<0)
        method[1]['choosingMethod'].push(grandson.childNodes[1].innerHTML);
    } else {
        grandson.style.backgroundColor = 'rgb(255,255,255)';
        for (j = 0; j < method[1]['choosingMethod'].length; j++) {
            if (method[1]['choosingMethod'][j] == grandson.childNodes[1].innerHTML) {
                method[1]['choosingMethod'].splice(j, 1)
            }
        }
    }
    console.log(method)
}

//
function choosingDeChart(dec) {
    //$('.deChart').style.backgroundColor='rgb(255,255,255)';
    if ((dec.style.backgroundColor).indexOf('38') < 0) {
        parent = dec.parentNode;
        lis = parent.childNodes;
        for (i = 0; i < lis.length; i++) {
            lis[i].style.backgroundColor = 'rgb(255,255,255)';
        }
        dec.style.backgroundColor = 'rgba(38,185,154,.10)';
        id = dec.getAttribute('id');
        choosingChartId = id.substring(5);
        choosingChart = parseInt(choosingChartId);
        console.log(choosingChartId, choosingChart);
    } else {
        dec.style.backgroundColor = 'rgb(255,255,255)';
    }
}

function se(yData, exn) {
    var ser = [], value = [];
    for (s = 0; s < exn.length; s++) {
        if (exn[s]) {
            var exp = {
                value: yData[s],
                itemStyle: {
                    color: 'blue',
                }
            };
            value[s] = exp;
        } else {
            value[s] = yData[s];
        }
    }
    var item = {
        type: 'bar',
        itemStyle: {
            normal: {
                color: 'red'
            }
        },
        data: value
    };
    ser.push(item);
    return ser
};

//function setButtonFlag(){
//    $("#myTab")[0].children.length = stageCount;
//    for(i=0;i<stageCount;i++){
//        $("#myTab")[0].children[i]
//    }
//}
//function addFilter(f){ //每次操作filter bar后 更新全局变量AllFilterData
////    console.log(f);
////    console.log(AllFilterData);
////    var rep = 0;
////    var afl = AllFilterData.length;
////    if(afl == 0){
////    AllFilterData[afl]=f;
////    }
////    else{
////        for(i=0;i<afl;i++){
////            console.log(AllFilterData[i]['columnname']);
////            console.log(f['columnname']);
////            if(AllFilterData[i]['columnname'] == f['columnname']){
////               AllFilterData[i] = f;
////               rep = 1;
////            }
////        }
////        if(rep == 0){
////        AllFilterData.push(f);
////        }
////    }
//}
