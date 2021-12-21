//图表1-1
//1.请求数据
function sql(tablename,Pricecol,chart,title){
    var xA=[];
    var yA=[];
    var ajaxmark=0;
    function setchart(c,t){
        c.hideLoading();
        c.setOption({
            title: {
                text: t
            },
            tooltip:{},
            xAxis: {
                data: xA
            },
            yAxis: {},
            series: [{
                name: 'number',
                type: 'bar',
                data: yA
            }]
        });

    }
    function datapost(p){
        $.ajax({
            url:"http://10.176.24.40:8083/api/hive/executesql",
            type:"POST",
            dataType:"json",
            contentType: "text/plain",
            data:"select * from "+ tablename + " where price>"+(p==0?"0":Pricecol[p-1].toString())+" and price<"+(Pricecol[p].toString()),
            success:function(data){
                yA[p]=data.rowcount;
                ajaxmark++;
                if(ajaxmark==Pricecol.length+1){
                    setchart(chart,title);
                }
            }
        })
        if(p==Pricecol.length-1){
            $.ajax({
                url:"http://10.176.24.40:8083/api/hive/executesql",
                type:"POST",
                dataType:"json",
                contentType: "text/plain",
                data:"select * from "+ tablename + " where price>"+(Pricecol[p].toString()),
                success:function(data){
                    yA[p+1]=data.rowcount;
                    ajaxmark++;
                    if(ajaxmark==Pricecol.length+1){
                        setchart(chart,title);
                    }
                }
            })
        }
    }
    for(let p=0;p<Pricecol.length;p++){
        if(p==0){xA.push("<"+Pricecol[p].toString())}
        if(p==Pricecol.length-1){xA.push(">"+Pricecol[p].toString());break;}
        xA.push(Pricecol[p].toString()+"~"+Pricecol[p+1].toString());
    }
    for(let p=0;p<Pricecol.length;p++){
        datapost(p);
    }
}


var myChart0 = echarts.init(document.getElementById('column'));
myChart0.showLoading({
    text : 'loading...',
    maskColor:"#f7f7f7"
  });
sql("websales_sports",[10,30,50,70,90,110],myChart0,"Price range of websales_sports");
//参数：数据表名，分割点，图表名，图表标题
// 指定图表的配置项和数据
//图表1-1代码结束

//图表1-2
var myChart1 = echarts.init(document.getElementById('column21'));
myChart1.showLoading({
    text : 'loading...',
    maskColor:"#f7f7f7"
});
$.ajax({
    url:"http://10.176.24.40:8083/api/hive/countgroupby",
    type:"POST",
    dataType:"json",
    contentType: "application/json",
    data:JSON.stringify({"tablename":"websales2005_season1","groupbycolumn":"price"}),
    success:function(data){
        var yA=[];
        var xA=[];
        var temp=[];
        function sortNumber(a,b)
        {
            return a[0] - b[0]
        }
        for(d in data.data){
            for(key in data.data[d]){
                temp.push([parseFloat(key),data.data[d][key]]);
            }
        }
        temp.sort(sortNumber);
        for(t in temp){
            if(temp[t][0]==0)continue;
            xA.push(temp[t][0])
            yA.push(temp[t][1]);
        }
        var option1 = {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0], '10%'];
                }
            },
            title: {
                left: 'center',
                text: 'Relativity of Price and Quantity in websales2005_season1',
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                name: "Price",
                type: 'category',
                boundaryGap: false,
                data: xA
            },
            yAxis: {
                name: "Quantity",
                type: 'value',
                boundaryGap: [0, '100%']
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 10
            }, {
                start: 0,
                end: 10,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            series: [
                {
                    name:'Quantity',
                    type:'line',
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        color: 'rgb(255, 70, 131)'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(255, 158, 68)'
                        }, {
                            offset: 1,
                            color: 'rgb(255, 70, 131)'
                        }])
                    },
                    data: yA
                }
            ]
        };
        myChart1.hideLoading();
        myChart1.setOption(option1);

    }
})


//图表1-3
var myChart2 = echarts.init(document.getElementById('column2'));
myChart2.showLoading({
    text : 'loading...',
    maskColor:"#f7f7f7"
});
function rowdata(){
    var chartdata = [];
    var legendbar = [];
    function setcharts(){
        var option2 = {
            title : {
                text: 'Category Percents',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'right',
                data: legendbar
            },
            series : [
                {
                    name: 'Item Category',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:chartdata,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart2.hideLoading();
        myChart2.setOption(option2);
    }
    function getrows(){
        $.ajax({
            url:"http://10.176.24.40:8083/api/hive/countgroupby",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({"tablename":"websales2005_season1","groupbycolumn":"category"}),
            success:function(data){
                for(d in data.data){
                    for(key in data.data[d]){
                        legendbar.push(key);
                        chartdata.push({"name":key,"value":data.data[d][key]});
                    }
                }
                setcharts();
            }
        })
    }
    getrows();
}
rowdata();

//图表2-1
var myChart3 = echarts.init(document.getElementById('column1'));
myChart3.showLoading({
    text : 'loading...',
    maskColor:"#f7f7f7"
});
$.ajax({
    url:"http://10.176.24.40:8083/api/hive/countgroupby",
    type:"POST",
    dataType:"json",
    contentType: "application/json",
    data:JSON.stringify({"tablename":"websales2005_season1","groupbycolumn":"solddate"}),
    success:function(data){
        function sortDate(a,b)
        {
            return Date.parse(a[0]) - Date.parse(b[0])
        }
        var temp=[];
        for(d in data.data){
            for(key in data.data[d])
                temp.push([key,data.data[d][key]]);
        }
        temp.sort(sortDate);
        var dates=[];
        var raws=[];
        var changedata=[];
        for(let t=temp.length-11;t<temp.length;t++){
            dates.push(temp[t][0].slice(0,10));
            raws.push(temp[t][1]);
            changedata.push(temp[t][1]-temp[t-1][1]);
        }
        var colors = ['#d14a61', '#675bba'];

    var option3 = {
        color: colors,
        title : {
            text: 'Order Change',
            x:'left'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        grid: {
            right: '20%'
        },
        legend: {
            data:['Orders','Change']
        },
        xAxis: [
            {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                data: dates
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Orders',
                position: 'right',
                min:4000,
                max:5000,
                axisLine: {
                    lineStyle: {
                        color: colors[0]
                    }
                },
                /*
                axisLabel: {
                    formatter: '{value} ml'
                }*/
            },
            {
                type: 'value',
                name: 'Change',
                position: 'left',
                axisLine: {
                    lineStyle: {
                        color: colors[1]
                    }
                },/*
                axisLabel: {
                    formatter: '{value} °C'
                }*/
            }
        ],
    series: [
        {
            name:'Orders',
            type:'bar',
            data:raws
        },
        {
            name:'Change',
            type:'line',
            yAxisIndex: 1,
            data:changedata
        }
    ]
};
        myChart3.hideLoading();
        myChart3.setOption(option3);
    }
})
