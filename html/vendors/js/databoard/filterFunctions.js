var cData = [];
var sOption = [];
var bOption = [];
var tabExpanded = 0;
var onlinedist;//ajax
//-----------------------根据range返回的recommend，生成左侧filter tab-----------------------------------
function createFilterTab(cn) {
    var tab = document.createElement('li');
    tab.innerHTML = '<a id="tab_' + cn + '" onclick="tabFilter(this.innerHTML)" data-toggle="tab" aria-expanded="true">' + '<span class="fa fa-star">' + cn + '</span></a>';
    $('#columnTabs').append(tab);
}

//-----------------------为其他没有推荐filter的列生成左侧filter tab-------------------------------------
function expandTab() {
    if (tabExpanded === 0) {
        var a = document.getElementById('addtabs');
        document.getElementById('columnTabs').removeChild(a);
        for (var i = 0; i < columnName.length; i++) {
            var cn = columnName[i];
            if (rfName.indexOf(cn) < 0) {
                var tab = document.createElement('li');
                tab.innerHTML = '<a id="tab_' + cn + '" onclick="tabFilter(this.innerHTML)" data-toggle="tab" aria-expanded="true">' + cn + '</a>'
                document.getElementById('columnTabs').append(tab);
            }
        }
        tabExpanded = 1;
    }
//    $("#columnTabs").children("li").click(function () {
//        if ($(this).find('span').html()) {
//            tag = $(this).find('span').html();
//            if (tag == "solddate") {
//                $("#tab1_instructuion").text("为您推荐：近期销售数据分布")
//                $("#tab1_instructuion").css({"color": "#5A738E"});
//
//            } else if (tag == "price") {
//                $("#tab1_instructuion").text("智能分析：监测到可能的异常！")
//                $("#tab1_instructuion").css({"color": "red"});
//            }
//        }
//    })
//    $("#columnTabs").children("li").hover(function () {
//        if ($(this).find('span').html()) {
//            tag = $(this).find('span').html();
//            if (tag == "solddate") {
//                $("#tab1_instructuion").text("为您推荐：近期销售数据分布")
//                $("#tab1_instructuion").css({"color": "#5A738E"});
//
//            } else if (tag == "price") {
//                $("#tab1_instructuion").text("智能分析：监测到可能的异常！")
//                $("#tab1_instructuion").css({"color": "red"});
//            }
//            if (!($(this).hasClass("active"))) {
//                $("#tab1_instructuion").text("")
//            }
//
//        }
//    }, function () {
//        $("#tab1_instructuion").text("")
//    });

}

//-----------------------点击对应列名tab时，生成filter bar并绘制大图------------------------------------
function tabFilter(text) {
    var id = text.replace(/\<.*?\>/g, '');
    var filterBar = document.getElementById('filterBar');
    filterBar.innerHTML = "";
    filterBar.style.minHeight = "78px";
    for (var i = 0; i < oriFil.length; i++) {
        if (id == oriFil[i].columnname) {
            while (oriFil[i].type == 93) {
                filterBar.innerHTML = '<input type="hidden" class = "filter" id="range" value="" name="range"/>';
                $("#range").ionRangeSlider({
                    hide_min_max: true,
                    keyboard: true,
                    min: moment(oriFil[i].data[0], "YYYYMMDD").format("X"),
                    max: moment(oriFil[i].data[1], "YYYYMMDD").format("X"),
                    from: moment(fil[i].data[0], "YYYYMMDD").format("X"),
                    to: moment(fil[i].data[1], "YYYYMMDD").format("X"),
                    type: 'double',
                    prettify: function (num) {
                        return moment(num, "X").format("LL");
                    },
                    index: i,
                    grid: true,
                    onFinish: function (data) {
                        dom = $('#chartPad')[0].children[0];
                        echarts.getInstanceByDom(dom).showLoading();
                        var f = moment(data.from, "X").format("YYYYMMDD");
                        var t = moment(data.to, "X").format("YYYYMMDD");
                        f = f.substring(0, 4) + "-" + f.substring(4, 6) + "-" + f.substring(6, 8);
                        t = t.substring(0, 4) + "-" + t.substring(4, 6) + "-" + t.substring(6, 8);
                        var dataIndex = data.index;
                        fil[dataIndex].data[0] = f;
                        fil[dataIndex].data[1] = t;
                        var postData = JSON.stringify(fil);
                        if (onlinedist) onlinedist.abort();
                        onlinedist = $.ajax({
                            type: "POST",
                            url: "http://10.176.24.40:8083/api/data/onlinedist",
                            //                             url : "http://10.222.116.151:8083/api/data/onlinedist",
                            contentType: "application/json",
                            dataType: "json",
                            data: postData,
                            async: true,
                            jsonp: 'callback',
                            success: function (msg) {
                                olDis = msg;
                                disToData(olDis);
                                reCharts(dataIndex);
                            },//success function
                            error: function () {
                                for (i = 0; i < cData.length; i++) {
                                    cData[i]['data'] = [];
                                    cData[i]['xAxis'] = [];
                                }
                                reCharts(dataIndex);
                            }
                        });
                    }//onFinish
                })//$("#range").ionRangeSlider
                break;
            }//date
            while (oriFil[i].type == 12) {
                var cNum = oriFil[i]['data'].length;
                if (cNum) {
                    filterBar.innerHTML="";
                    for (var j = 0; j < cNum; j++) {

                        var filter = document.createElement('button');
                        filter.className = 'btn btn-default';
                        filter.setAttribute('type', 'button');
                        filter.setAttribute('onClick', 'choosingFilter(this)');
                        filter.innerHTML = oriFil[i]['data'][j];
                        // filter.style.maxWidth = '80px';
                        if (fil[i]['data'].indexOf(oriFil[i]['data'][j]) != -1) {
                            filter.style.backgroundColor = 'rgba(38,185,154,.2)';
                        } else {
                            filter.style.backgroundColor = 'rgb(255,255,255)';
                        }
                        filter.style.overflowX = 'hidden';

                        filterBar.append(filter);
                    }//for
                }//if
                break;
            }//string
            while (oriFil[i].type == 8 || oriFil[i].type == 4) {
                filterBar.innerHTML = '<input type="hidden" class = "filter" id="range" value="" name="range"/>';
                $("#range").ionRangeSlider({
                    hide_min_max: true,
                    keyboard: true,
                    min: oriFil[i].data[0],
                    max: oriFil[i].data[1],
                    from: fil[i].data[0],
                    to: fil[i].data[1],
                    type: 'double',
                    step: 1,
                    index: i,
                    prefix: "$",
                    grid: true,
                    onFinish: function (data) {
                        dom = $('#chartPad')[0].children[0];
                        echarts.getInstanceByDom(dom).showLoading();
                        var f = data.from;
                        var t = data.to;
                        var dataIndex = data.index;
                        fil[dataIndex].data[0] = f;
                        fil[dataIndex].data[1] = t;
                        var postData = JSON.stringify(fil);
                        if (onlinedist) onlinedist.abort();
                        onlinedist = $.ajax({
                            type: "POST",
                            url: "http://10.176.24.40:8083/api/data/onlinedist",
                            //                                url : "http://10.222.116.151:8083/api/data/onlinedist",
                            contentType: "application/json",
                            dataType: "json",
                            data: postData,
                            async: true,
                            jsonp: 'callback',
                            success: function (msg) {
                                olDis = msg;
                                disToData(olDis);
                                reCharts(dataIndex);
                            },//success function
                            error: function () {

                            }
                        });
                    }//onFinish
                })//$("#range").ionRangeSlider
                break;
            }//num
        }//if
    }//for
    drawBigCharts(id);
}

//---------------点击filter button，修改filter数组，调onlinedist重绘图表--------------------------------
function choosingFilter(a) {
    id = document.getElementsByClassName('chart-pane')[0].getAttribute('id');
    index = columnName.indexOf(id);
    value = a.innerHTML;
    var t = JSON.stringify(a.style.backgroundColor);
    if (t.indexOf('55') > -1) {                      //若为未选中状态,点击变灰，将值添加进filter
        a.style.backgroundColor = 'rgba(38,185,154,.2)';
        if(fil[index]['data'].indexOf(value)==-1)fil[index]['data'].push(value);
    } else {                                      //若为选中状态，点击变白，将值移除出filter
        a.style.backgroundColor = 'rgb(255,255,255)';
        fil[index]['data'].splice(fil[index]['data'].indexOf(value), 1);
        if (id == 'itemdesc') {
            fil[index]['data'] = [];
            fil[index]['data'].push(value);
        }
    }
    postData = JSON.stringify(fil);
    if (onlinedist) onlinedist.abort();
    dom = $('#chartPad')[0].children[0];
    echarts.getInstanceByDom(dom).showLoading();
    onlinedist = $.ajax({
        type: "POST",
        url: "http://10.176.24.40:8083/api/data/onlinedist",
        //         url : "http://10.222.116.151:8083/api/data/onlinedist",
        contentType: "application/json",
        dataType: "json",
        data: postData,
        async: true,
        jsonp: 'callback',
        success: function (msg) {
            olDis = msg;
            for (var i = 0; i < olDis.length; i++) {
                if (olDis[i]['type'] == 12) {
//                    oriFil[i]['data'] = [];
                    for (j = 0; j < fil[i]['data'].length; j++) {
                        if(oriFil[i]['data'].indexOf(fil[i]['data'][j])==-1)oriFil[i]['data'].push(fil[i]['data'][j])
                    }
//                    for (j = 0; j < olDis[i]['data'].length; j++) {
//                        oriFil[i]['data'].push(Object.keys(olDis[i]['data'][j]))
//                    }
                }
            }
            disToData(olDis);
            reCharts(index);
        },//success function
        error: function () {

        }
    });
}

//-----------------------从distribution解析出chart所需数据---------------------------------------------
function disToData(dis) {
    console.log("----------------------------")
    for (i = 0; i < dis.length; i++) {
        c = dis[i].columnname;
        t = dis[i].type;
        d = dis[i].data;
        var j = {};
        j.columnname = c;
        if (t == 12) {
            j.type = t;
            j.data = [];
            for (m = 0; m < d.length; m++) {
                temp = {};
                temp['name'] = Object.keys(d[m])[0];
                temp['value'] = d[m][temp['name']];
                j['data'].push(temp);
            }
        } else {
            x = [];
            y = [];
            for (k = 0; k < d.length; k++) {
                temp = d[k];
                //        console.log(temp);
                xtemp = Object.keys(temp);
                x.push(xtemp);
                y.push(temp[xtemp]);
            }
            j.xAxis = x;
            j.data = y;
            j.type = t;
        }
        cData[i] = j;
    }
}

//-----------------------拿到range的dist数据后，初始化所有图表------------------------------------------
function inCharts() {
    document.getElementById('horiz_container').innerHTML = "";
    for (var i = 0; i < columnName.length; i++) {
        var sopt = {};
        var cn = columnName[i];
        if (cData[i].type === 12 && cData[i].columnname !== 'itemdesc') {
            sopt = {
                title: {
                    text: cData[i].columnname,
                    x: 'center',
                    textStyle: {
                        fontSize: 11
                    }
                },
                series: [{
                    center: ['50%', '58%'],
                    radius: '66%',
                    type: 'pie',
                    itemStyle: {
                        normal: {                      //隐藏标示文字、标示线
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    },
                    data: cData[i].data
                }]
            };//option
            bopt = {
                title: {
                    x: 'center',
                    y: 'bottom',
                    text: cData[i].columnname,
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
                            label: {show: true},
                            labelLine: {show: true}
                        }
                    },
                    data: cData[i].data,
                }]
            };
        } else if (cData[i].type !== 12) {
            sopt = {
                title: {
                    text: cData[i].columnname,
                    x: 'center',
                    textStyle: {
                        fontSize: 11
                    }
                },
                xAxis: {
                    data: cData[i].xAxis,
                    show: false
                },
                yAxis: {
                    show: false
                },
                series: [{
                    type: 'bar',
                    data: cData[i].data
                }],
                grid: {
                    top: '22%',
                    left: '1%',
                    right: '16%',
                    bottom: '1%',
                    containLabel: true
                }
            };
            bopt = {
                title: {
                    x: 'center',
                    y: 'bottom',
                    text: cData[i].columnname,
                    textStyle: {
                        fontSize: 18
                    }
                },
                tooltip: {},
                xAxis: {
                    data: cData[i].xAxis,
                    show: true
                },
                yAxis: {
                    show: true
                },
                series: [{
                    type: 'bar',
                    data: cData[i].data
                }],
                toolbox: {
                    show: true,
                    feature: {
                        magicType: {
                            type: ['line', 'bar'],
                            show: true
                        }
                    }
                },
                grid: {
                    top: '10%',
                    left: '10%',
                    right: '3%',
                    bottom: '10%',
                    containLabel: true
                }
            };//boption
        } else if (cData[i].type === 12 && cData[i].columnname === 'itemdesc') {
            sopt = {
                title: {
                    text: 'itemdesc',
                    x: 'center',
                    textStyle: {
                        fontSize: 11
                    }
                },
                series: [{
                    name: 'itemdesc',
                    type: 'wordCloud',
                    sizeRange: [10, 20],
                    rotationRange: [-90, 90],
                    textPadding: 0,
                    autoSize: {
                        enable: true,
                        minSize: 10
                    },

                    textStyle: {
                        normal: {
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 80),
                                    Math.round(Math.random() * 220),
                                    Math.round(Math.random() * 180)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: cData[i].data,
                }],
                grid: {
                    top: '10%',
                    left: '5%',
                    right: '3%',
                    bottom: '10%',
                    containLabel: true
                }
            };
            bopt = {
                title: {
                    text: 'itemdesc',
                    x: 'center',
                    textStyle: {
                        fontSize: 23,
                        color: '#FFFFFF'
                    }
                },
                series: [{
                    name: '',
                    type: 'wordCloud',
                    sizeRange: [12, 40],
                    rotationRange: [-45, 45],
                    textPadding: 0,
                    autoSize: {
                        enable: true,
                        minSize: 12
                    },
                    textStyle: {
                        normal: {
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 80),
                                    Math.round(Math.random() * 220),
                                    Math.round(Math.random() * 180)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: cData[i].data
                }]
            };
        }
        sOption[i] = sopt;
        bOption[i] = bopt;
    }
    for (i = 0; i < columnName.length; i++) {
        cn = columnName[i];
        var mc = document.createElement('li');  //mini chart
        //            mc.innerHTML = '<a  href="#'+cn+'"></a>';
        mc.className = 'miniChart';
        mc.style.height = '110px';
        mc.style.width = '130px';
        mc.style.marginBottom = '20px';
        mc.setAttribute('id', bOption[i]['title']['text']);
        mc.setAttribute('onClick', 'clickChart(this.id)');
        document.getElementById('horiz_container').append(mc);
        myChart = echarts.init(mc);
        myChart.setOption(sOption[i]);
    }
    for (i = 0; i < columnName.length; i++) {
        if (rfName.indexOf(columnName[i]) < 0) {
            var firstColumnNotRecommend = columnName[i];
            i = columnName.length;
        }
    }
    for (var l = 0; l < rfNum; l++) {
        $('#' + rfName[l]).insertBefore($('#' + firstColumnNotRecommend));
    }
    // document.getElementById('vec').style.height=550+'px'
}

//--------------------------onlinedist拿到数据后，重绘所有图表------------------------------------------
function reCharts(index) {
    console.log("-------------reCharts")
    for (i = 0; i < columnName.length; i++) {
        var sopt = {};
        cn = columnName[i];
        if (cData[i].type == 12 && cData[i].columnname != 'itemdesc') {
            sopt = {
                title: {
                    text: cData[i].columnname,
                    textStyle: {
                        fontSize: 11
                    }
                },
                series: [{
                    center: ['50%', '58%'],
                    radius: '66%',
                    type: 'pie',
                    itemStyle: {
                        normal: {                      //隐藏标示文字、标示线
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    },
                    data: cData[i].data,
                }]
            };//option
            bopt = {
                title: {
                    x: 'center',
                    y: 'bottom',
                    text: cData[i].columnname,
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
                    data: cData[i].data,
                }],
                grid: {
                    top: '13%',
                    left: '0%',
                    right: '3%',
                    bottom: '6%',
                    containLabel: true
                }
            };
        } else if (cData[i].type != 12) {
            sopt = {
                title: {
                    text: cData[i].columnname,
                    textStyle: {
                        fontSize: 11
                    }
                },
                xAxis: {
                    data: cData[i].xAxis,
                    show: false
                },
                yAxis: {
                    show: false
                },
                series: [{
                    type: 'bar',
                    data: cData[i].data,
                }],
                grid: {
                    top: '22%',
                    left: '-18%',
                    right: '16%',
                    bottom: '-4%',
                    containLabel: true
                },
            };
            bopt = {
                title: {
                    x: 'center',
                    y: 'bottom',
                    text: cData[i].columnname,
                    textStyle: {
                        fontSize: 18
                    }
                },
                tooltip: {},
                xAxis: {
                    data: cData[i].xAxis,
                    show: true
                },
                yAxis: {
                    show: true
                },
                series: [{
                    type: 'bar',
                    data: cData[i].data,
                }],
                toolbox: {
                    show: true,
                    feature: {
                        magicType: {
                            type: ['line', 'bar'],
                            show: true
                        }
                    }
                },
                grid: {
                    top: '10%',
                    left: '10%',
                    right: '3%',
                    bottom: '10%',
                    containLabel: true
                }
            };//boption
        } else if (cData[i].type == 12 && cData[i].columnname == 'itemdesc') {
            sopt = {
                title: {
                    text: 'itemdesc',
                    x: 'center',
                    textStyle: {
                        fontSize: 0,
                        color: '#F5F7FA'
                    }
                },
                series: [{
                    name: 'itemdesc',
                    type: 'wordCloud',
                    sizeRange: [10, 20],
                    rotationRange: [-90, 90],
                    textPadding: 0,
                    autoSize: {
                        enable: true,
                        minSize: 10
                    },
                    textStyle: {
                        normal: {
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 80),
                                    Math.round(Math.random() * 220),
                                    Math.round(Math.random() * 180)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: cData[i].data,
                }]
            };
            bopt = {
                title: {
                    text: 'itemdesc',
                    x: 'center',
                    textStyle: {
                        fontSize: 23,
                        color: '#FFFFFF'
                    }
                },
                series: [{
                    name: '',
                    type: 'wordCloud',
                    sizeRange: [12, 40],
                    rotationRange: [-45, 45],
                    textPadding: 0,
                    autoSize: {
                        enable: true,
                        minSize: 12
                    },
                    textStyle: {
                        normal: {
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 80),
                                    Math.round(Math.random() * 220),
                                    Math.round(Math.random() * 180)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: cData[i].data,
                }]
            };

        }
        sOption[i] = sopt;
        bOption[i] = bopt;
    }
     if(cData[2].data.length == 0)sOption[2].title.textStyle.color="#000000";
    for (i = 0; i < columnName.length; i++) {                             //最后一列目前无参数
        cn = bOption[i]['title']['text'];
        sc = document.getElementById(cn);
        myChart = echarts.getInstanceByDom(sc);
        myChart.setOption(sOption[i]);
    }
    id = columnName[index];
    if(index!=3)tabFilter(id);
    drawBigCharts(id);
}

//----------------点击上方小图表，替换下方的filter bar和大图表------------------------------------------
function clickChart(id) {
    expandTab();
    eid = 'tab_' + id;
    a = document.getElementById(eid);
    li = a.parentNode;
    columnTabs = li.parentNode;
    lis = columnTabs.childNodes;
    for (i = 0; i < columnName.length; i++) {
        lis[i].className = ''
    }
    li.className = 'active';
    tabFilter(id);
}

//---------------------------------绘制大图------------------------------------------------------------
function drawBigCharts(id) {
    document.getElementById('chartPad').innerHTML = "";

    var chart = document.createElement('div');
    chart.style.height = '360px';
    chart.style.width = '100%';
    chart.className = 'chart-pane';
    chart.setAttribute('id', id);
    document.getElementById('chartPad').append(chart);

    for (i = 0; i < columnName.length; i++) {
        if (bOption[i]['title']['text'] == id) break;
    }
    myChart = echarts.init(chart);
    myChart.setOption(bOption[i]);
    chart.childNodes[0].style.margin = "auto";
}

