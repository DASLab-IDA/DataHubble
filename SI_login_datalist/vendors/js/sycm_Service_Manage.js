
function GetDate(DayDiff){
    let Today = new Date();
    Today.setTime(Today.getTime()-DayDiff*24*60*60*1000);
    let[year, month, day] = [Today.getFullYear(), (Today.getMonth()+1>=10)?Today.getMonth()+1:'0'+(Today.getMonth()+1).toString(), Today.getDate()>=10?Today.getDate():'0'+Today.getDate().toString()]
    return `${year}-${month}-${day}`
}

function charts_resize(){
    setTimeout(() => {
        chart3.resize();
        for(i in charts_global){
            charts_global[i].resize();
        }
    }, 200);
}

function DataMount(title, instance, type, datax, datay){
    let rate = {}
    //处理数据[datax,datay]
    rate.title = title;
    rate.instance = instance;
    rate.data = datay;
    //type==num||type==percent;
    rate.num = (type=='integer') ? datay[datay.length-1]:`${(datay[datay.length-1]*100).toFixed(2)}%`;

    rate.y_up = datay[datay.length-1]>=datay[datay.length-2]?true:false;
    rate.yesterday = (Math.abs(datay[datay.length-1]-datay[datay.length-2])*100/datay[datay.length-2]).toFixed(2).toString()+"%";
    if(datay.length>=8){
        rate.w_up = datay[datay.length-1]>=datay[datay.length-8]?true:false;
        rate.lastweek = (Math.abs(datay[datay.length-1]-datay[datay.length-8])*100/datay[datay.length-8]).toFixed(2).toString()+"%";    
    }    
    //返回vue需要的数据
    return rate;
}
function OptionMount(data, type, name, GraphType) {
    GraphType = GraphType || "line"
    //data = [x,[y]];
    //绘制表格，加入定时刷新列表
    //console.log(data[1])
    let option = {
        grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            top: "6%",
            x: 0,
            y: 0
        },
        tooltip:{
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: data[0],
            axisLine:{
                show: false
            },
            axisTick:{
                show: false
            },
            axisLabel:{    
                color: 'gray',
                formatter: function (value, index) {
                    if(index%2== 0){
                        return value;
                    } else {
                        return ''
                    }
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLine:{
                show: false
            },
            axisTick:{
                show: false
            },
            splitLine:{
                show: false
            },
            axisLabel:{    
                inside: true,
                color: 'gray',
            }
        },
        series: []
    };
    let Colors = ["blue", "brown", "orange", "azur","purple"];
    if(data[1].length>1){
        option.legend = {
            left:'60'
        }
    }
    for(let i=0; i<data[1].length; i++) {
        option.series.push({
            data: data[1][i],
            type: typeof GraphType == "string" ? GraphType : GraphType[i],
            color: Colors[i],
            smooth: true,
            name: name[i]
        })
    }
    if(type == "percent") {
        option.tooltip.formatter = function(params){
            return params.name + ' : ' + (params.data * 100).toFixed(2).toString()+ '%'
        }
        option.yAxis.axisLabel.formatter = function (value, index) { 
            return (value*100).toFixed(2)+'%';
        }
    };
    return option;
}

{//假数据
    function FakeData(days, scale, range){
        let fakeX = [];
        let fakeY = [];
        scale = scale || 1;
        for(let i = days; i >= 0; i-=scale){
            fakeX.push(GetDate(i).substr(5,5));
        }
        for(i in range){
            let temp = [];
            for(let j = 0;j <= days; j+=scale){
                let y = 0;
                if(range[i]==0){
                    y = Math.random();
                } else {
                    y = 1 + Math.round(Math.random()*range[i]);
                }
                temp.push(y)
            }
            fakeY.push(temp);
        }
        return [fakeX, fakeY];
    }
    //////console.log(FakeData(30, 7, [4, 4, 4, 4]));
}
{//共用时间
    var service_manage_range = new Vue ({
        data: {
            range_s:[]
        },
        computed: {
            range(){
                return dateRange.Range
            }
        },
        watch: {
            range:function(){
                ////console.log('public range changed');
                ////console.log(this.range);
                this.range_s = this.range;
            }
        }
    })
}
{/*模板
    let service_exprience = new Vue({
            data: {
                
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            mounted: {

            }
        })
*/}
{//服务视窗部分
    {//服务体验
        let service_exprience = new Vue({
            el:'#service_experience',
            data: {
                ChartInstance: [],
                Rates:[
                    {
                        title: '纠纷退款率',
                        rate: '---',
                        Yesterday: '-',
                        instance: 'issue_refund_rate',
                        up: true,
                        datax: [],
                        datay: [],
                    },
                    {
                        title: '介入率',
                        rate: '---',
                        Yesterday: '-',
                        instance: 'interface_rate',
                        up: true,
                        datax: [],
                        datay: [],
                    },
                    {
                        title: '投诉率',
                        rate: '---',
                        Yesterday: '-',
                        instance: 'complaint_rate',
                        up: true,
                        datax: [],
                        datay: [],
                    },
                    {
                        title: '退款率',
                        rate: '---',
                        Yesterday: '-',
                        instance: 'refund_rate',
                        up: true,
                        datax: [],
                        datay: [],
                    },
                ]
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            mounted(){
                //$.ajax({...})
                //fakedata
                let fakedata = FakeData(30, 1, [0, 0, 0, 0]);//30天数据，7天为分隔，区间0~1，4个数据列
                for(i in fakedata[1]){
                    this.Rates[i].datax = fakedata[0];
                    this.Rates[i].datay = fakedata[1][i];
                }
                for(i in this.Rates){
                    this.Rates[i].up = this.Rates[i].datay[this.Rates[i].datay.length-1] >= this.Rates[i].datay[this.Rates[i].datay.length-2] ? true : false;
                    this.Rates[i].rate = (this.Rates[i].datay[this.Rates[i].datay.length-1]*100).toFixed(2).toString()+'%';
                    this.Rates[i].Yesterday = (Math.abs(this.Rates[i].datay[this.Rates[i].datay.length-1]-this.Rates[i].datay[this.Rates[i].datay.length-2])/this.Rates[i].datay[this.Rates[i].datay.length-1]*100).toFixed(2).toString()+'%';
                    let chartid = 'chart_'+this.Rates[i].instance;
                    let chart = echarts.init(document.getElementById(chartid));
                    this.ChartInstance.push({
                        'id': chartid,
                        "instance": chart
                    });
                    charts_global.push(chart);
                    chart.showLoading();
                    chart.setOption({
                        grid: {
                            left: '5%',
                            right: '5%',
                            bottom: '10%',
                            top: "6%",
                            x: 0,
                            y: 0
                        },
                        tooltip:{
                            formatter: function(params){
                                return params.name + ' : ' + (params.data * 100).toFixed(2).toString()+ '%'
                            }
                        },
                        xAxis: {
                            type: 'category',
                            data: this.Rates[i].datax,
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            axisLabel:{    
                                color: 'gray',
                                formatter: function (value, index) {
                                    if(index%2 == 0  ){
                                        return value;
                                    } else {
                                        return ''
                                    }
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            splitLine:{
                                show: false
                            },
                            axisLabel:{    
                                inside: true,
                                color: 'gray',
                                formatter: function (value, index) { 
                                    return (value*100).toFixed(2)+'%';
                                }
                            }
                        },
                        series: [{
                            data: this.Rates[i].datay,
                            type: 'line',
                            color: 'blue',
                            smooth: true,
                            
                        }]
                    });
                    chart.hideLoading();
                }
                for(i in this.ChartInstance){
                    this.ChartInstance[i].instance.resize();
                }
            }
        })
    }//!服务体验

    {//咨询看板
        let consult = new Vue ({
            el:'#consult',
            data: {
                xAxis: [],
                ChartInstance:[],
                nums:[
                    {
                        column: 2,
                        instance: "visitor_and_consultee",
                        titles: ['访客数', '咨询人数'],
                        type: 'integer',
                        datay:[
                            {
                                data:[],
                                title: '访客数',
                                num: '-',
                                yesterday: '-',
                                y_up: true,
                                lastweek: '-',
                                w_up: true
                            },
                            {
                                data:[],
                                title: '咨询人数',
                                num: '-',
                                yesterday: '-',
                                y_up: true,
                                lastweek: '-',
                                w_up: true
                            },
                        ]
                    },
                    {
                        column: 1,
                        instance: "servicer",
                        type: 'integer',
                        titles: '日均在线客服数',
                        datay:[
                            {
                                data:[],
                                title: '日均在线客服数',
                                num: '-',
                                yesterday: '-',
                                y_up: true,
                                lastweek: '-',
                                w_up: true
                            },
                        ]
                    },
                    {
                        column: 1,
                        instance: "consult_rate",
                        type: 'percent',
                        titles: '咨询率',
                        datay:[
                            {
                                data:[],
                                title: '咨询率',
                                num: '-',
                                yesterday: '-',
                                y_up: true,
                                lastweek: '-',
                                w_up: true
                            },
                        ]
                    }
                ]        
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            watch: {
                range: function(){
                    //////console.log("component range changed");
                    //////console.log(this.range);
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            mounted(){
                //fake data
                let x = FakeData(30, 1, [300, 300, 15, 0]);

                this.xAxis = x[0];
                

                this.nums[0].datay[0].data = x[1][0];
                this.nums[0].datay[0].num = x[1][0][x[1][0].length-1];
                this.nums[0].datay[0].y_up = x[1][0][x[1][0].length-1] - x[1][0][x[1][0].length-2] >=0
                this.nums[0].datay[0].yesterday = (Math.abs(x[1][0][x[1][0].length-1] - x[1][0][x[1][0].length-2]) / x[1][0][x[1][0].length-2] * 100).toFixed(2).toString() + '%';
                this.nums[0].datay[0].w_up = x[1][0][x[1][0].length-1] - x[1][0][x[1][0].length-8] >=0
                this.nums[0].datay[0].lastweek = (Math.abs(x[1][0][x[1][0].length-1] - x[1][0][x[1][0].length-8]) / x[1][0][x[1][0].length-8] * 100).toFixed(2).toString() + '%';

                this.nums[0].datay[1].data = x[1][1];
                this.nums[0].datay[1].num = x[1][1][x[1][1].length-1];
                this.nums[0].datay[1].y_up = x[1][1][x[1][1].length-1] - x[1][1][x[1][1].length-2] >=0
                this.nums[0].datay[1].yesterday = (Math.abs(x[1][1][x[1][1].length-1] - x[1][1][x[1][1].length-2]) / x[1][1][x[1][1].length-2] * 100).toFixed(2).toString() + '%';
                this.nums[0].datay[1].w_up = x[1][0][x[1][1].length-1] - x[1][0][x[1][1].length-8] >=0
                this.nums[0].datay[1].lastweek = (Math.abs(x[1][1][x[1][1].length-1] - x[1][1][x[1][1].length-8]) / x[1][1][x[1][1].length-8] * 100).toFixed(2).toString() + '%';

                id0 = 'chart_'+this.nums[0].instance;
                let chart0 = echarts.init(document.getElementById(id0));
                chart0.showLoading();
                this.ChartInstance.push({
                    "id": id0,
                    'instance': chart0
                })
                charts_global.push(chart0);
                chart0.setOption({
                    legend:{
                        left:'60'
                    },
                        grid: {
                            left: '5%',
                            right: '5%',
                            bottom: '10%',
                            top: "7%",
                            x: 0,
                            y: 0
                        },
                        tooltip:{
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            data: x[0],
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            axisLabel:{    
                                color: 'gray',
                                formatter: function (value, index) {
                                    if(index%2== 0 ){
                                        return value;
                                    } else {
                                        return ''
                                    }
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            splitLine:{
                                show: false
                            },
                            axisLabel:{    
                                inside: true,
                                color: 'gray',
                                
                            }
                        },
                        series: [
                            {
                            data: x[1][0],
                            name: '访客数',
                            type: 'line',
                            color: 'blue',
                            smooth: true,
                        },
                        {
                            data: x[1][1],
                            name: '咨询人数',
                            type: 'line',
                            color: 'brown',
                            smooth: true,
                        },
                    ]
                });
                chart0.hideLoading();

                this.nums[1].datay[0].data = x[1][2];
                this.nums[1].datay[0].num = x[1][2][x[1][2].length-1];
                this.nums[1].datay[0].y_up = x[1][2][x[1][2].length-1] - x[1][2][x[1][2].length-2] >=0
                this.nums[1].datay[0].yesterday = (Math.abs(x[1][2][x[1][2].length-1] - x[1][2][x[1][2].length-2]) / x[1][2][x[1][2].length-2] * 100).toFixed(2).toString() + '%';
                this.nums[1].datay[0].w_up = x[1][2][x[1][2].length-1] - x[1][2][x[1][2].length-8] >=0
                this.nums[1].datay[0].lastweek = (Math.abs(x[1][2][x[1][2].length-1] - x[1][2][x[1][2].length-8]) / x[1][2][x[1][2].length-8] * 100).toFixed(2).toString() + '%';
                
                id1 = 'chart_'+this.nums[1].instance;
                let chart1 = echarts.init(document.getElementById(id1));
                chart1.showLoading();
                this.ChartInstance.push({
                    "id": id1,
                    'instance': chart1
                })
                charts_global.push(chart1);
                chart1.setOption({

                        grid: {
                            left: '5%',
                            right: '5%',
                            bottom: '10%',
                            top: "7%",
                            x: 0,
                            y: 0
                        },
                        tooltip:{
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            data: x[0],
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            axisLabel:{    
                                color: 'gray',
                                formatter: function (value, index) {
                                    if(index%2== 0 ){
                                        return value;
                                    } else {
                                        return ''
                                    }
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            splitLine:{
                                show: false
                            },
                            axisLabel:{    
                                inside: true,
                                color: 'gray',
                                
                            }
                        },
                        series: [
                            {
                            data: x[1][2],
                            type: 'line',
                            color: 'blue',
                            smooth: true,
                        },
                    ]
                });
                chart1.hideLoading();

                this.nums[2].datay[0].data = x[1][3];
                this.nums[2].datay[0].num = (x[1][3][x[1][3].length-1]*100).toFixed(2).toString() + '%';
                this.nums[2].datay[0].y_up = x[1][3][x[1][3].length-1] - x[1][3][x[1][3].length-2] >=0
                this.nums[2].datay[0].yesterday = (Math.abs(x[1][3][x[1][3].length-1] - x[1][3][x[1][3].length-2]) / x[1][3][x[1][3].length-2] * 100).toFixed(2).toString() + '%';
                this.nums[2].datay[0].w_up = x[1][3][x[1][3].length-1] - x[1][3][x[1][3].length-8] >=0
                this.nums[2].datay[0].lastweek = (Math.abs(x[1][3][x[1][3].length-1] - x[1][3][x[1][3].length-8]) / x[1][3][x[1][3].length-8] * 100).toFixed(2).toString() + '%';

                id2 = 'chart_'+this.nums[2].instance;
                let chart2 = echarts.init(document.getElementById(id2));
                chart2.showLoading();
                this.ChartInstance.push({
                    "id": id2,
                    'instance': chart2
                })
                charts_global.push(chart2);
                chart2.setOption({
                        grid: {
                            left: '5%',
                            right: '5%',
                            bottom: '10%',
                            top: "7%",
                            x: 0,
                            y: 0
                        },
                        tooltip:{
                            
                            formatter: function(params){
                                return params.name + ' : ' + (params.data * 100).toFixed(2).toString()+ '%'
                            }
                        },
                        xAxis: {
                            type: 'category',
                            data: x[0],
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            axisLabel:{    
                                color: 'gray',
                                formatter: function (value, index) {
                                    if(index%2==0){
                                        return value;
                                    } else {
                                        return ''
                                    }
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLine:{
                                show: false
                            },
                            axisTick:{
                                show: false
                            },
                            splitLine:{
                                show: false
                            },
                            axisLabel:{    
                                inside: true,
                                color: 'gray',
                                formatter: function (value, index) { 
                                    return (value*100).toFixed(2)+'%';
                                }
                            }
                        },
                        series: [
                            {
                            data: x[1][3],
                            type: 'line',
                            color: 'blue',
                            smooth: true,
                        },
                    ]
                });
                chart2.hideLoading();
            }
        })
    }
    {//评价看板
        let Comment = new Vue({
            el:"#comment",
            data:{
                xAxis: [],
                ChartInstance:[],
                nums:[

                ],
                negativecomments:[
                    /*
                    {
                        item:"",
                        counts: integer
                    }
                    */
                ]
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            mounted(){
                let data = FakeData(30, 1, [4,4,4]);
                
                let MatchRate = DataMount("描述相符评分", "MatchRate", 'integer', data[0], data[1][0]);
                let ServiceRate = DataMount("卖家服务评分", "ServiceRate", 'integer', data[0], data[1][1]);
                let DeliverRate = DataMount("物流服务评分", "DeliverRate", "integer", data[0], data[1][2]);
                this.nums = [{
                    column: 3,
                    instance: "Comment",
                    type: 'integer',
                    datay:[MatchRate, ServiceRate, DeliverRate],
                    titles: ["描述相符评分", "卖家服务评分", "物流服务评分"]
                }];
                let option = OptionMount(data, "num", ["描述相符评分", "卖家服务评分", "物流服务评分"]);
                setTimeout(() => {
                    let chartId = "chart_Comment";
                    let chart = echarts.init(document.getElementById(chartId));
                    ////console.log(chart);
                    chart.setOption(option);
                    this.ChartInstance.push({
                        "id": chartId,
                        'instance': chart
                    });
                    charts_global.push(chart);
                }, 500);
            }
        });
    }
    {//退款看板
        let Refund = new Vue({
            el:"#refund",
            data:{
                xAxis: [],
                ChartInstance:[],
                nums:[

                ],
                refunditems:[
                    /*
                    {
                        item:"",
                        counts: integer
                    }
                    */
                ]
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            mounted(){
                let data = FakeData(30, 1, [0,1000,10]);
                ////console.log(data[1][0])
                let RefundRate = DataMount("退款率", "MatchRate", "percent", data[0], data[1][0]);
                let RefundAmount = DataMount("成功退款金额", "RefundAmount", "integer", data[0], data[1][1]);
                let RefundOrders = DataMount("成功退款笔数", "RefundOrders", "integer", data[0], data[1][2]);
                this.nums = [
                    {
                        column: 1,
                        instance: "RefundRate",
                        type: 'percent',
                        datay:[RefundRate]
                    },
                    {
                        column: 1,
                        instance: "RefundAmount",
                        type: 'integer',
                        datay:[RefundAmount]
                    },
                    {
                        column: 1,
                        instance: "RefundOrders",
                        type: 'integer',
                        datay:[RefundOrders]
                    }
                ];
                for(let i = 0;i<this.nums.length;i++){
                    let temp = [data[0], [data[1][i]]]
                    let option = OptionMount(temp, this.nums[i].type, [this.nums[i].datay.title]);
                    ////console.log(option)
                    let id = this.nums[i].instance;
                    setTimeout(() => {
                        let chartId = "chart_"+id;
                        ////console.log(chartId);
                        let chart = echarts.init(document.getElementById(chartId));
                        chart.setOption(option);
                        this.ChartInstance.push({
                            "id": chartId,
                            'instance': chart
                        });
                        charts_global.push(chart);
                    }, 500);
                }            
            }
        });
    }
}
{//管理视窗
    {//整体看板
        let Manage_Total = new Vue({
            el: "#Manage_Total",
            data: {
                nums:[],
                xAxis:[],
                ChartInstance:[],
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                },
            },
            mounted() {
                let that = this;
                let MountData = function(data, Title, Instance) {
                    let d = {};
                    d.data = data;
                    d.title = Title;
                    d.instance = Instance;
                    return d;
                }
                let data = FakeData(28,1,[10000, 0, 1000, 100]);
                let Titles = ["销售目标", "支付转化率", "访客数", "客单价"]
                let Instances = ["SalesTarget", "PaidTransrate", "Visitors", "MoneyPerVisitor"]
                for(let i=0;i<data[1].length;i++){
                    let d = new Date();
                    let dweek = d.getDay();
                    let dmonth = d.getMonth();
                    let val = MountData(data[1][i], Titles[i], Instances[i]);
                    let WeekProgress = (function(data){let sum = 0;for(let i=0;i<dweek;i++){sum+=data[data.length-1-i]}return sum})(data[1][i]);
                    let LastWeek = (function(data){let sum = 0;for(let i=0;i<7;i++){sum+=data[data.length-dweek-i]}return sum})(data[1][i]);
                    let LastWeekGrowth = [];
                    let option = {};
                    if(i%2==0){
                        let MonthProgress = (function(data){let sum = 0;for(let i=0;i<dmonth;i++){sum+=data[data.length-1-i]}return sum})(data[1][i]);
                        LastWeekGrowth =( function(data) {
                            let t = [];
                            for(let i=0;i<data.length;i++){
                                if(i>7){
                                    t.push( ((data[i]-data[i-7])/data[i]).toFixed(3) )
                                }else{
                                    t.push(0)
                                }
                            }
                            return t;
                        })(data[1][i]);
                        val.Labellength=3;
                        val.col = 8;
                        val.label = [
                            {"head": "本周已完成", "number":WeekProgress},
                            {"head": "本月目标", "number":150000},
                            {"head": "上周", "number":LastWeek},
                            {"head": "本月进度", "number":(MonthProgress/150000*100).toFixed(2).toString()+"%"},
                        ];
                        
                        option = OptionMount([data[0], [data[1][i], LastWeekGrowth]], ["num","percent"], ["实际数额", "上周同比转化率"],["bar","line"]);
                        
                        option.yAxis.axisLabel.inside = false;
                        option.yAxis.axisLabel.fontSize = 8;
                        option.yAxis = [option.yAxis,option.yAxis];
                        option.series[1].yAxisIndex = 1;
                    } else {
                        LastWeekGrowth =( function(data) {
                            let t = [];
                            for(let i=0;i<data.length;i++){
                                if(i>7){
                                    t.push(data[i-7])
                                }else{
                                    t.push(0)
                                }
                            }
                            return t;
                        })(data[1][i]);
                        val.Labellength=6;
                        val.col = 4;
                        val.label = [
                            {"head": "本周平均", "number": (WeekProgress/7).toFixed(3)},
                            {"head": "上周平均", "number": (LastWeek/7).toFixed(3)},
                        ]
                        option = OptionMount([data[0], [data[1][i], LastWeekGrowth]], ["num","percent"], ["日", "上周同期"]);
                    }
                    that.nums.push(val);
                    setTimeout(() => {
                        let chartId = "chart_"+Instances[i];
                        let chart = echarts.init(document.getElementById(chartId));
                        ////console.log(chart);
                        chart.setOption(option);
                        that.ChartInstance.push({
                            "id": chartId,
                            'instance': chart
                        });
                        charts_global.push(chart);
                    }, 500);
                }
            }
        })
    }

    {//流量看板
        let Flow = new Vue({
            el:"#Flow",
            data: {
                classA:{},
                classB:{},
                xAxis:[],
                ChartInstance:[],
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            mounted() {
                let that = this;
                let data = FakeData(28,1,[100, 100, 100, 100, 100]);
                that.classA = {
                    "title": "一级流量走向",
                }
                let option = OptionMount(data, "num", ["淘内免费","付费流量","自主访问","淘外流量","其他"]);
                option.yAxis.axisLabel.inside = false;
                option.yAxis.axisLabel.fontSize = 8;
                for(let i=0;i<option.series.length;i++){
                    option.series[i].areaStyle={"opacity":0.3}
                }
                setTimeout(() => {
                    let chartId = "chart_flow";
                    let chart = echarts.init(document.getElementById(chartId));
                    ////console.log(chart);
                    chart.setOption(option);
                    that.ChartInstance.push({
                        "id": chartId,
                        'instance': chart
                    });
                    charts_global.push(chart);
                }, 500);

                that.classB ={
                    "title": "二级流量来源",
                    "sources":[
                        ["排名","流量来源","访客数","下单转换率"]
                    ]
                }
            }
        })
    }

    {//推广看板
        let Spread = new Vue({
            el:"#Spread",
            data: {
                title: "推广金额",
                sources: [["排序","关键词","推广消耗","占比"]],
                ChartInstance:[],
                label:[]
            },
            computed: {
                range(){
                    return service_manage_range.range_s
                }
            },
            methods: {
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            },
            watch: {
                range: function(){
                    ////console.log("component range changed");
                    ////console.log(this.range);
                }
            },
            mounted() {
                let that = this;
                let data = FakeData(28,1,[10000]);
                let d = new Date();
                let dweek = d.getDay();
                let dmonth = d.getMonth();
                let WeekProgress = (function(data){let sum = 0;for(let i=0;i<dweek;i++){sum+=data[data.length-1-i]}return sum})(data[1][0]);
                let LastWeek = (function(data){let sum = 0;for(let i=0;i<7;i++){sum+=data[data.length-dweek-i]}return sum})(data[1][0]);
                let monthProgress = (function(data){let sum = 0;for(let i=0;i<dmonth;i++){sum+=data[data.length-1-i]}return sum})(data[1][0]);
                let LastWeekGrowth =( function(data) {
                    let t = [];
                    for(let i=0;i<data.length;i++){
                        if(i>7){
                            t.push( ((data[i]-data[i-7])/data[i]).toFixed(3) )
                        }else{
                            t.push(0)
                        }
                    }
                    return t;
                })(data[1][0]);
                that.label = [
                    {"title": "本周已消耗","number": WeekProgress},
                    {"title": "本月预算","number": 100000},
                    {"title": "上周","number": LastWeek},
                    {"title": "本月消耗进度","number": monthProgress},
                ];
                let option = OptionMount([data[0], [data[1][0], LastWeekGrowth]], ["num","percent"], ["实际数额", "上周同比转化率"],["bar","line"]);
                        
                option.yAxis.axisLabel.inside = false;
                option.yAxis.axisLabel.fontSize = 8;
                option.yAxis = [option.yAxis,option.yAxis];
                option.series[1].yAxisIndex = 1;
                setTimeout(() => {
                    let chartId = "chart_spread";
                    let chart = echarts.init(document.getElementById(chartId));
                    ////console.log(chart);
                    chart.setOption(option);
                    that.ChartInstance.push({
                        "id": chartId,
                        'instance': chart
                    });
                    charts_global.push(chart);
                }, 500);
            }
        })
    }

}
{
    {//评价管理
        let Evaluation = new Vue ({
            el: '#evaluation',
            data: {
                wordCloud:[],
                eval:[],
                max: 4,
                Star:`<i class="fa fa-star fa-lg"></i>`,
                StarEmpty: `<i class="fa fa-star-o fa-lg"></i>`,
                ChartInstance: null    
            },
            mounted(){

                var ChartofEval = echarts.init(document.getElementById("Eval_Chart"));
                charts_global.push(ChartofEval);
                this.ChartInstance = ChartofEval;
                this.ChartInstance.setOption({
                    series: [{
                        type: 'wordCloud',
                        shape: 'circle',
                        left: 'center',
                        top: 'center',
                        width: '90%',
                        height: '90%',
                        right: null,
                        bottom: null,
                        sizeRange: [48, 96],
                        rotationRange: [-90, 90],
                        rotationStep: 45,
                        gridSize: 8,
                        drawOutOfBound: false,
                        textStyle: {
                            normal: {
                                fontFamily: 'sans-serif',
                                fontWeight: 'bold',
                                // Color can be a callback function or a color string
                                color: function () {
                                    // Random color
                                    return 'rgb(' + [
                                        Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160)
                                    ].join(',') + ')';
                                }
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{name:"",value:1}]
                    }]
                });
                let that = this;
                let ws = new WebSocket("ws://localhost:8085/CommentsWebsocket");
                let wc = new WebSocket("ws://localhost:8085/WordsCloudWebsocket");
                //let timeline = 0;
                let id = 0;
                
                ws.onmessage = function(event){
                    console.log(event.data)
                    if(event.data == "连接成功" || event.data == "connection success") return 0;
                    let comment = JSON.parse(event.data);
                    let text = comment.comment.length >=40 ? comment.comment.slice(0,38)+"……" : comment.comment;
                    console.log(comment._id.$oid.substr(-8));
                    let user = '用户' + comment._id.$oid.substr(-8);
                    //let date = comment.date.slice(0,12); 
                    let score = Math.round(Math.random()*5);
                    let star = (function ScoretoStar(score){
                        let temp = ''
                        for(let i =0;i<score;i++){
                            temp += that.Star;
                        }
                        for(let i=0;i<5-score;i++){
                            temp += that.StarEmpty;
                        }
                        return temp
                    })(score)
                    
                    if(that.eval.length >= that.max) {   
                        that.eval.splice(0,1);
                    } 
                    that.eval.push({
                        'id': id++,
                        'user': user,
                        'star': star,
                        'content': text,
                        //'date': date
                    })
                }
                
                wc.onmessage = function(event) {
                    console.log(event.data)
                    let temp = event.data.slice(1,-2).split(",");
                    let wordcloud = [];
                    for(let i in temp){
                        let t = temp[i].split(":");
                        wordcloud.push({name: t[0].slice(0,-1), value: parseInt(t[1])});
                    }
                    Evaluation.wordCloud = wordcloud;
                    console.log(that.wordCloud)
                    that.ChartInstance.setOption({
                        series:[{
                            data:that.wordCloud
                        }]
                    })
                }
                window.onbeforeunload = function(event) {
                    ws.close();
                    wc.close();
                }
            }      
        });
        
    }
}