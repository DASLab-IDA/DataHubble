//dataset   filter   method
var columnName = ["price", "itemname", "itemdesc", "category", "solddate", "quantity"];
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
var recentHistory = [];

$(document).ready(function () {
    $.ajax({
        type: "POST",
        url: "http://10.141.223.30:8083/api/hive/getrecenthistory",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"recent": 5}),       //所有的filter
        jsonp: 'callback',
        success: function (msg) {
            if (msg.length < 1) {
                document.getElementById('robot_badge').innerHTML = "精彩稍后呈现...";
                // function filterDist(){
                $.ajax({
                    type: "POST",
                    url: "http://10.141.223.30:8083/api/data/range",      //biaoming lieming
                    //  url : "http://10.222.127.82:8083/api/data/range",          //biaoming lieming
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({"tablename": tableName}),
                    async: true,
                    jsonp: 'callback',
                    success: function (msg) {
                        var filterHistoryState = document.createElement("li");
                        filterHistoryState.setAttribute('onclick', "$('#tab1')[0].parentNode.parentNode.childNodes[1].setAttribute('class','active');$('#tab1')[0].parentNode.parentNode.childNodes[3].setAttribute('class','');$('#tab1')[0].parentNode.parentNode.childNodes[5].setAttribute('class','');buttonflag = 0; $('#selectButton')[0].innerHTML = '应用过滤';");
                        filterHistoryState.innerHTML = "<a href='#tab_content1' role='tab'  data-toggle='tab' aria-expanded='true'><h3>" + moment().format('HH:mm') + "</h3><dl><dt>过滤条件推荐</dt></dl></a>";
                        $(".history-date")[0].children[0].append(filterHistoryState);

                        document.getElementById("mc").childNodes[3].childNodes[1].style.display = "block";
                        $('#selectButton')[0].innerHTML = "应用过滤";


                        rec = msg['recommend'];
                        rfNum = rec.length;
                        document.getElementById('robot_badge').innerHTML = rfNum;

                        dis = msg['distribution']
                        disToData(dis);
                        inCharts();

                        for (i = 0; i < dis.length; i++) {
                            dc = dis[i].columnname;
                            dt = dis[i].type;
                            fildata = [];
                            orifildata = [];
                            if (dt != 12) {//整型的data

                            } else {      //string的data
                                for (k = 0; k < dis[i].data.length; k++) {
                                    orifildata.push(Object.keys(dis[i].data[k])[0]);
                                }
                            }
                            for (j = 0; j < fil.length; j++) {
                                if (fil[j].columnname == dc) {
                                    fil[j].type = dt;
                                    fil[j].data = fildata;
                                    oriFil[j].type = dt;
                                    oriFil[j].data = orifildata;
                                }
                            }
                        }
                        //初始化所有filter，用于之后filter bar的最大/最小值和默认值
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
                                        rd[0] = rec[i].data[0];
                                        rd[1] = rec[i].data[1];
                                        fil[j].data = rd;
                                    } else if (rec[i].type == 12) {      //string的data
                                        for (k = 0; k < rec[i].data.length; k++) {
                                            ord.push(rec[i].data[k]);//这里遗留问题，range返回的是该列所有的不同值。应当返回的是最高的9个值，然后在data里返回其中推荐的filter
                                            rd.push(rec[i].data[k]);
                                            //                                    fil[j].data = rd;
                                        }
                                    } else if (rec[i].type == 93) {
                                        ord[0] = rec[i].range[0];
                                        ord[1] = rec[i].range[1];
                                        oriFil[j].data = ord;
                                        rd[0] = rec[i].data[0];
                                        rd[1] = rec[i].data[1];
                                        fil[j].data = rd;
                                    }
                                    break;
                                }
                            }
                            createFilterTab(rc);
                        }//更新filter数组中的filter为推荐的值，并为推荐的filter创建filter tab

                        var tab = document.createElement('li');
                        tab.setAttribute('id', 'addtabs');
                        tab.innerHTML = '<a data-toggle="tab" onclick="expandTab()" aria-expanded="true">更多...</a>'
                        $('#columnTabs').append(tab);

                    },//success function
                    error: function () {
                        alert("error on data/range!");
                    }
                });//ajax
            }//if

            document.getElementById('robot_badge').innerHTML = msg.length;
            var historyNum = msg.length;
            for (i = historyNum - 1; i >= 0; i--) {
                recentHistory[i] = msg[i];

            }
            clickHistory(recentHistory[0]["log_id"]);
        },//success function
        error: function () {
            alert("Error on hive/getrecenthistory!")
        }
    })
})


function clickHistory(logid) {
    fil = history1['record'];

    $.ajax({
        type: "POST",
        url: "http://10.141.223.30:8083/api/data/range",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"tablename": tableName}),
        async: true,
        jsonp: 'callback',
        success: function (msg) {
            document.getElementById("mc").childNodes[3].childNodes[1].style.display = "block";
            dis = msg['distribution']
            disToData(dis);
            inCharts();
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
            var tab = document.createElement('li');
            tab.setAttribute('id', 'addtabs');
            tab.innerHTML = '<a data-toggle="tab" onclick="expandTab()" aria-expanded="true">更多...</a>'
            $('#columnTabs').append(tab);
            expandTab();
            $(thistab).trigger('click');
        },//success function
        error: function () {
            alert("error on data/range!");
        }
    });//ajax

    if (thishistory['step'] > 1) {
        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/data/deepeye",
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
                        console.log(piedata);
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

                document.getElementById("waitingtext").style.display = "none";
            },//success function
            error: function () {
                alert("error on data/deepeye!")
            }
        });
    }
}


function usingFilter() {
    if (buttonflag == 0) {
        buttonflag = 1;                                                           //进入可视化推荐界面
        //生成新tab页
        document.getElementById('robot_badge').innerHTML = "努力工作中...";

        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/data/deepeye",
//                                 url : "http://127.0.0.1:8083/api/data/deepeye",
//                                 url : "http://10.222.208.74:8083/api/data/deepeye",
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
                document.getElementById('robot_badge').innerHTML = dNum;
                for (i = 0; i < dNum; i++) {
                    xdata = dData[i].xdata[0];
                    ydata = dData[i].ydata;
                    xname = dData[i].xcolumn;
                    yname = dData[i].ycolumn;
                    cType = dData[i].cType;
                    classify = dData[i].classify;

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
                        console.log(piedata);
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

                var visualizationHistoryState = document.createElement("li");
                visualizationHistoryState.setAttribute('onclick', "$('#myTab')[0].childNodes[1].setAttribute('class','');$('#myTab')[0].childNodes[3].setAttribute('class','active');$('#myTab')[0].childNodes[5].setAttribute('class',''); document.getElementById('selectButton').innerHTML = '选择数据';buttonflag=1;");
                visualizationHistoryState.innerHTML = "<a href='#tab_content2' role='tab' data-toggle='tab' aria-expanded='true'><h3>" + moment().format('HH:mm') + "</h3><dl><dt>可视化推荐</dt></dl>";
                $(".history-date")[0].children[0].append(visualizationHistoryState);
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
            url: "http://10.141.223.30:8083/api/hive/savehistory",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "tablename": "web_sales_home",
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
                url: "http://10.141.223.30:8083/api/hive/getdata",
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
                    {"data": "itemname"},
                    {"data": "itemdesc"},
                    {"data": "quantity"},
                    {"data": "price"},
                    {"data": "category"},
                    {"data": "solddate"},
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
        var methodHistoryState = document.createElement("li");
        methodHistoryState.setAttribute('onclick', "$('#tab1')[0].parentNode.parentNode.childNodes[1].setAttribute('class','');$('#tab1')[0].parentNode.parentNode.childNodes[3].setAttribute('class','');$('#tab1')[0].parentNode.parentNode.childNodes[5].setAttribute('class','active');buttonflag=2;document.getElementById('selectButton').innerHTML = '开始分析';");
        methodHistoryState.innerHTML = "<a href='#tab_content3' role='tab' data-toggle='tab' aria-expanded='true'><h3>" + moment().format('HH:mm') + "</h3><dl><dt>分析方法推荐</dt></dl>";
        $(".history-date")[0].children[0].append(methodHistoryState);

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
        document.getElementById('selectButton').innerHTML = "开始分析";
        document.getElementById('robot_badge').innerHTML = 3;

        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/hive/savehistory",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "tablename": "web_sales_home",
                "userid": 1,
                "step": 2,
                "record": [{"chartId": choosingChart}],
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

//       $.ajax({
//           type: "POST",
//           url: "http://10.141.223.30:8083/api/data/methodrec",
//           contentType: "application/json",
//           dataType: "json",
//           data: 此图数据,
//           async: false,
//           jsonp: 'callback',
//           success: function (msg) {
//               methodNum = msg.length;
//               for (i = 0; i < methodNum; i++) {
//                   methodData[i] = msg[i];
//               }
//               document.getElementById('robot_badge').innerHTML = methodNum;
//           },//success function
//           error: function () {alert("error on data/methodrec!")}
//       });
        methodData = [{
            "methodname": "logistic regression",
            "methoddescription": "预测未来一段时间内的趋势",
            "methodparameter": "max-iter = 10"
        },
            {
                "methodname": "k-means",
                "methoddescription": "将数据划分为不同区间",
                "methodparameter": "k = 4"
            },
            {
                "methodname": "exception detect",
                "methoddescription": "找出数据中的异常区间",
                "methodparameter": ""
            }
        ];
        for (i = 0; i < 3; i++) {
            method[0].recMethod.push(methodData[i]['methodname']);
        }
        for (i = 0; i < methodData.length; i++) {
            var methodtab = document.createElement('li');
            methodtab.setAttribute('id', 'method' + i);
            methodtab.style.backgroundColor = 'rgb(255,255,255)';
            methodtab.setAttribute('onClick', 'choosingmethod(this)');
            methodtab.style.listStyleType = 'none';
            methodtab.innerHTML =
                '<div class="animated flipInY col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="tile-stats"><div class="icon"><i class="fa fa-caret-square-o-right"></i></div><div class="methodname">'
                + methodData[i]['methodname'] +
                '</div><div class = "methoddescription">'
                + methodData[i]['methoddescription'] +
                '</div><div class = "methodparameter">推荐参数'
                + methodData[i]['methodparameter'] +
                '</div></div></div>';
            document.getElementById('methodpage').append(methodtab);
//            methodtab.childNodes[0].childNodes[0].style.backgroundColor = 'rgb(255,255,255)';
        }

    } else if (buttonflag == 2) {
//        document.getElementById('page').innerHTML = "";

        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/hive/savehistory",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "tablename": "web_sales_home",
                "userid": 1,
                "step": 3,
                "record": method,
                "previous": presentID2,
            }),       //所有的filter
            jsonp: 'callback',
            success: function (msg) {
                presentID3 = msg;
            },//success function
            error: function () {
                alert("error on hive/savehistory!")
            }
        });
        cd = [];
        cd.push(dData[choosingChart]);
        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/data/exceptiondetect",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(cd),
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


            },//success function
            error: function () {
                alert("error on data/exceptiondetect!")
            }

        });
    }

};



