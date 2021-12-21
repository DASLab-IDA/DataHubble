var currentStepID = [-888, -888, -888];
var currentHistory = [{}, {}, {}];
var currentStep = -1;//0,1,2;
var columnName = [];//String
var columnRange = [];//JSON
var columnFilter = [];//JSON

$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/range",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"tablename": tableName}),
        jsonp: 'callback',
        async:false,
        success: function (msg) {
            var dis = msg['distribution'];
            disToData(dis);
            inCharts();
            var rec = msg['recommend'];
            for (var i = 0; i < dis.length; i++) {
                columnName.push(dis[i]['columnname']);

                var newJSON = {};
                newJSON['tablename'] = tableName;
                newJSON['columnname'] = columnName[i];
                newJSON['type'] = dis[i]['type'];
                newJSON['data'] = [];
                switch (dis[i]['type']) {
                    case 4:
                        var tail = dis[i].data.length - 1;
                        var num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
                        newJSON['data'][0] = parseInt(Object.keys(dis[i].data[0]).toString().split('-')[0]);
                        newJSON['data'][1] = parseInt(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
                        break;
                    case 8:
                        tail = dis[i].data.length - 1;
                        num = Object.keys(dis[i].data[tail]).toString().split('-').length - 1;
                        newJSON['data'][0] = parseFloat(Object.keys(dis[i].data[0]).toString().split('-')[0]);
                        newJSON['data'][1] = parseFloat(Object.keys(dis[i].data[tail]).toString().split('-')[num]);
                        break;
                    case 93:
                        tail = dis[i].data.length - 1;
                        var startdate = Object.keys(dis[i].data[0]).toString().split('-');
                        var enddate = Object.keys(dis[i].data[tail]).toString().split('-');
                        newJSON['data'][0] = startdate[0] + "-" + startdate[1] + "-" + startdate[2];
                        newJSON['data'][1] = enddate[0] + "-" + enddate[1] + "-" + enddate[2];
                        break;
                }
                columnRange.push(newJSON);
            }
            for ( i = 0; i < rec.length; i++) {
                for(var j = 0;j<columnRange.length;j++){
                    if(rec[i]['columnname']===columnRange[j]['columnname']){
                        columnRange[j]['data']=rec[i]['range']
                    }
                }
            }

            if (currentStep === -1) {
//处理初次进入用户的逻辑。暂时可以不写
            }
        },
        error: function () {
            alert("Error on data/range!")
        }
    });
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/hive/getrecenthistory",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"recent": 5}),
        jsonp: 'callback',
        success: function (msg) {
            document.getElementById('robot_badge').innerHTML = msg.length;
            for (var i = msg.length; i > 0; i--) {
                generateHistoryTab(msg[i - 1])
            }
            clickHistory(msg[0]['log_id'])
        },
        error: function () {
            alert("Error on hive/getrecenthistory!")
        }
    })
});

function generateHistoryTab(historyMsg) {
    var historyTab = document.createElement("li");
    historyTab.setAttribute("id", historyMsg['log_id']);
    historyTab.setAttribute("onclick", "clickHistory(this.id)");

    var time = document.createElement("h3");
    time.innerHTML += moment(historyMsg['time']['time']).format("YYYY.MM.DD");
    if ((historyMsg['time']['hours'] + 13) % 24 < 10) time.innerHTML += "0";
    time.innerHTML += " " + (historyMsg['time']['hours'] + 13) % 24 + ":" + historyMsg['time']['minutes'];
    historyTab.append(time);

    var dl = document.createElement("dl");
    var dt = document.createElement("dt");
    if (historyMsg["step"] === 1) {
        dt.innerHTML = "过滤条件选择"
    } else if (historyMsg["step"] === 2) {
        dt.innerHTML = "可视化推荐"
    } else if (historyMsg["step"] === 3) {
        dt.innerHTML = "分析方法选择"
    }
    dl.append(dt);
    historyTab.append(dl);

    $("#history-ul")[0].append(historyTab);
}

function clickHistory(historyid) {
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/gethistorybyid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": historyid
        }),
        jsonp: 'callback',
        success: function (msg) {
            var i = msg['step'] - 1;
            currentHistory[i] = msg;
            currentStepID[i] = msg['log_id'];
            currentStep = i;
        },//success function
        error: function () {
            alert("error on hive/gethistorybyid!?")
        }
    });//ajax
    for (var i = currentStep; i > 0; i--) {
        currentStepID[i - 1] = getPreviousId(currentStepID[i]);
        getHistoryById(currentStepID[i - 1]);
    }

    //背景主页面data
    if (currentStep === 0) {
        $.ajax({
            url: "http://10.176.24.40:8083/api/hive/rowcount",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({"tablename": tableName}),
            success: function (data) {
                tab_total = data.total;
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
                        }
                    },//ajax
                    "columns":
                        [
                            {"data": "itemname"},
                            {"data": "itemdesc"},
                            {"data": "quantity"},
                            {"data": "price"},
                            {"data": "category"},
                            {"data": "solddate"}
                        ],
                    "infoCallback": function () {
                        var api = this.api();
                        var pageInfo = api.page.info();
                        return '显示第 ' + ((pageInfo.page * 20) + 1) + ' 至 ' + ((pageInfo.page * 20) + 20) + ' 项结果， ' + ' 共 ' + tab_tot() + ' 项'
                    },
                    "pagingType": "numbers",
                    searching: false,
                    paging: true,
                    "lengthChange": false,
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
            }
        });

        function page1() {
            return page;
        }

        function tab_tot() {
            return tab_total;
        }

        var tableEq = $("table:eq(0) th");
        tableEq.css("color", "#ECF0F1");
        tableEq.css("background-color", "rgba(52, 73, 94, .94)");
        var datatableFixedHeader = $('#datatable-fixed-header');
        datatableFixedHeader.addClass('table table-striped table-bordered');
        datatableFixedHeader.on('page.dt', function () {
            var info = table.page.info();
            console.log('Showing page: ' + info.page + ' of ' + info.pages);
            page = info.page + 1;
        });
    } else if (currentStep === 1) {
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
                        }
                    },//ajax

                    "columns":
                        [
                            {"data": "itemname"},
                            {"data": "itemdesc"},
                            {"data": "quantity"},
                            {"data": "price"},
                            {"data": "category"},
                            {"data": "solddate"}
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
                    "lengthChange": false,
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
            }
        });
        // function page1() {
        //     return page;
        // }
        // function tab_tot() {
        //     return tab_total;
        // }
        tableEq = $("table:eq(0) th");
        tableEq.css("color", "#ECF0F1");
        tableEq.css("background-color", "rgba(52, 73, 94, .94)");
        datatableFixedHeader = $('#datatable-fixed-header');
        datatableFixedHeader.addClass('table table-striped table-bordered');
        datatableFixedHeader.on('page.dt', function () {
            var info = table.page.info();
            console.log('Showing page: ' + info.page + ' of ' + info.pages);
            page = info.page + 1;
        });
    } else if (currentStep === 2) {

    }

    //背景主页面view
    var pageTable = document.getElementById("dataBoard").children[1];
    var pageChart = document.getElementById("pagechart");
    if (currentStep === 0 || currentStep === 1) {
        pageTable.style.display = "block";
    } else if (currentStep === 2) {
        pageChart.style.display = "block";
    }

    //模态框data
    if (currentStep < 1) {
        $.ajax({
            type: "POST",
            url: "http://10.176.24.40:8083/api/data/onlinedist",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(currentHistory[0]['record']),
            async: true,
            jsonp: 'callback',
            success: function (msg) {
                disToData(msg);
                inCharts();
            },//success function
            error: function () {
                alert("error on data/onlinedist!");
            }
        });//ajax
    } else if (currentStep < 2) {

    } else if (currentStep < 3) {

    }

    //模态框view
    var myTab =  $('#myTab')[0];
    var selectButton= $('#selectButton')[0];
    if (currentStep === 0) {
        myTab.children[1].style.display="none";
        myTab.children[2].style.display="none";
        selectButton.innerHTML = "应用过滤";
    } else if (currentStep === 1) {
        myTab.children[2].style.display="none";
        selectButton.innerHTML = "选择数据";
    } else if (currentStep === 2) {
        var methodData = [{
            "methodname": "logistic regression",
            "methoddescription": "预测未来一段时间内的趋势",
            "methodparameter": "max-iter = 10"
        }, {
            "methodname": "k-means",
            "methoddescription": "将数据划分为不同区间",
            "methodparameter": "k = 4"
        }, {
            "methodname": "exception detect",
            "methoddescription": "找出数据中的异常区间",
            "methodparameter": ""
        }];
        for (var k = 0; k < methodData.length; k++) {
            var methodTab = document.createElement('li');
            methodTab.setAttribute('id', 'method' + k);
            methodTab.style.backgroundColor = 'rgb(255,255,255)';
            methodTab.setAttribute('onClick', 'choosingMethod(this)');
            methodTab.style.listStyleType = 'none';
            methodTab.innerHTML =
                '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon"><i class="fa fa-caret-square-o-right"></i></div><div class="methodname">'
                + methodData[k]['methodname'] +
                '</div><div class = "methoddescription">'
                + methodData[k]['methoddescription'] +
                '</div><div class = "methodparameter">推荐参数'
                + methodData[k]['methodparameter'] +
                '</div></div></div>';
            document.getElementById('methodpage').append(methodTab);
        }
        var method = currentHistory[2]['record'];
        for (k = 0; k < method[0]['recMethod'].length; k++) {
            if (method[1]['choosingMethod'].indexOf(method[0]['recMethod'][k]) > -1) {
                i = method[1]['choosingMethod'].indexOf(method[0]['recMethod'][k]);
                document.getElementById('methodpage').childNodes[i].childNodes[0].childNodes[0].style.backgroundColor = 'rgba(38,185,154,.10)';
            }
        }
        selectButton.innerHTML = "开始分析";
    }
    $('#tab' + (currentStep + 1).toString()).trigger('click');
}

function getHistoryById(historyid) {
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/gethistorybyid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": historyid
        }),
        jsonp: 'callback',
        success: function (msg) {
            var i = msg['step'] - 1;
            currentHistory[i] = msg;
            currentStepID[i] = msg['log_id'];
        },//success function
        error: function () {
            alert("error on hive/gethistorybyid!?")
        }
    });
}

function getPreviousId(historyid) {
    var result = -888;
    $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/getpreviousid",
        contentType: "application/json",
        dataType: "json",
        async: false,
        data: JSON.stringify({
            "id": historyid
        }),
        jsonp: 'callback',
        success: function (msg) {
            result = msg;
        },//success function
        error: function () {
            alert("error on hive/getPreviousId!?")
        }
    });
    return result;
}

function choosingMethod(met) {
    method = currentHistory[2]['record'];
    var son = met.childNodes[0];
    var grandson = son.childNodes[0];
    if ((grandson.style.backgroundColor).indexOf('38') < 0) {
        grandson.style.backgroundColor = 'rgba(38,185,154,.10)';
        method[1]['choosingMethod'].push(grandson.childNodes[1].innerHTML);
    } else {
        grandson.style.backgroundColor = 'rgb(255,255,255)';
        for (var j = 0; j < method[1]['choosingMethod'].length; j++) {
            if (method[1]['choosingMethod'][j] === grandson.childNodes[1].innerHTML) {
                method[1]['choosingMethod'].splice(j, 1)
            }
        }
    }
    console.log(method)
}

function choosingDeChart(dec) {
    //$('.deChart').style.backgroundColor='rgb(255,255,255)';
    if ((dec.style.backgroundColor).indexOf('38') < 0) {
        parent = dec.parentNode;
        var lis = parent.childNodes;
        for (var i = 0; i < lis.length; i++) {
            lis[i].style.backgroundColor = 'rgb(255,255,255)';
        }
        dec.style.backgroundColor = 'rgba(38,185,154,.10)';
        var id = dec.getAttribute('id');
        var choosingChartId = id.substring(5);
        choosingChart = parseInt(choosingChartId);
        console.log(choosingChartId, choosingChart);
    } else {
        dec.style.backgroundColor = 'rgb(255,255,255)';
    }
}

function se(yData, exn) {
    var ser = [], value = [];
    for (var s = 0; s < exn.length; s++) {
        if (exn[s]) {
            value[s] = {
                value: yData[s],
                itemStyle: {
                    color: 'blue'
                }
            };
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
}

var page = 1;
var tab_total = 0;
var table;