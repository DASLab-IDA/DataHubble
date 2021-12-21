var charts_global = [];
{
    let height = $("#shopsurvey .panel-body").height() >= $("#currentstatus .panel-body").height() ? $("#shopsurvey .panel-body").height() : $("#currentstatus .panel-body").height()
    $("#shopsurvey .panel-body").height(height);
    $("#currentstatus .panel-body").height(height);
}

function NumToStrings(num) {
    if (num < 9999) {
        return num.toFixed(2).toString() + "元";
    } else if (num < 99999999) {
        return (num / 10000).toFixed(2).toString() + "万";
    } else {
        return (num / 100000000).toFixed(2).toString() + "亿";
    }
}

{ //commendation
    var commandlist = [];
    var TargetTable = "websales_home_myshop";
    var TargetName = "行业Top1";
    var CheckedTables = [];
}
{ //datetimepicker init
    $("#datepicker1").datetimepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
        minView: 2
    });

    $("#datepicker2").datetimepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
        minView: 2
    });
    let today = new Date();
    $("#datepicker2").datetimepicker("setDate", today);
    var date_now = $("#datepicker2").val();

    let yesterday = new Date().setDate(new Date().getDate() - 1);
    yesterday = new Date(yesterday);
    $("#datepicker1").datetimepicker("setDate", yesterday);
    var date_yesterday = $("#datepicker1").val();

    let lastweek = new Date().setDate(new Date().getDate() - 7);
    lastweek = new Date(lastweek);
    $("#datepicker1").datetimepicker("setDate", lastweek);
    var date_lastweek = $("#datepicker1").val();

    let lastmonth = new Date().setDate(new Date().getDate() - 1000); //20年前
    lastmonth = new Date(lastmonth);
    $("#datepicker1").datetimepicker("setDate", lastmonth);
    var dateRange = new Vue({
        data: {
            Range: [$("#datepicker1").val(), $("#datepicker2").val()],
        }
    });

    function ChangeDateRange() {
        dateRange.Range = [$("#datepicker1").val(), $("#datepicker2").val()];
        commandlist.push(["DateRange", dateRange.Range]);
    }

    function Datediff(date1, date2) {
        return (Date.parse(date2) - Date.parse(date1)) / 60.0 / 60.0 / 24.0 / 1000.0
    }
}
{ //猜你想问环节
    var GuessQuestion = new Vue({
        el: "#myScrollspy",
        methods: {
            odd: function (index) {
                if (index % 2 == 0) return "odd";
                else return "";
            },
            cli: function () {
                this.updated = false;
            },
            ModalOpen: function(){
                $('#robot').addClass('robot2');
                $('#robot').removeClass('robot1');
                this.updated = false;
                $('#myModal').modal('show');
            },
            ReRange: function(context, index){
                //alert(context)
                let temp = this.interests[index].Title;
                this.interestColumn = temp;
                this.items[0].Title = "载入中，请稍候……"
                Recommend.ReRange(context, index, temp);
            }
        },
        data: {
            updated: false,
            Nums: 0,
            Command: commandlist,
            items: [//猜你想问动态修改部分
                {
                    Title: "随便看看",
                    Link: "$('#mc').modal('show')"
                },
                {
                    Title: "查看选定数据集的可视化推荐",
                    Link: "$('#mc').modal('show')"
                },
                {
                    Title: "查看选定维度的分析方法推荐",
                    Link: "$('#mc').modal('show')"
                },
                {
                    Title: "查看推荐的分析路径？",
                    Link: "$('#mc').modal('show')"
                },
                {
                    Title: "查看分析结果？",
                    Link: "$('#mc').modal('show')"
                },
                //载入中
                {
                    Title: "载入数据中，请稍候……",
                    Link:"alert('载入数据中，请稍候……')"
                },
            ],
            //推荐
            interests: [
                {
                    Title: "1",
                    Show: ""
                },
                {
                    Title: "2",
                    Show: ""
                },
            ],
            interesting:false,
            interestColumn: "",
        },
        watch: {
            Command: function () {
                //this.updated=true;
            }
        },
        mounted: function () {
            $("#ChatService").popover({
                trigger: "hover",
                html: true
            });
        }
    });

    {//智能推荐环节

        var nodered_url = "";

        function MergeData(data) {
            let Xaxis = [];
            let Yaxis = [];
            for (i in data) {
                for (item in data[i]) {
                    Xaxis.push(item.toString());
                    Yaxis.push(data[i][item]);
                }
            }
            return [Xaxis, Yaxis];
        }

        function MergePie(data) {
            let Pie = [];
            let PieMini = [];
            for (i in data) {
                for (item in data[i]) {
                    Pie.push({"value": data[i][item], "name": item});
                    PieMini.push({"value": data[i][item]});
                }
            }
            return [Pie, PieMini];
        }

        let tableName = "websales_home_myshop";//myshop


        var Recommend = new Vue({
            el: "#mc",
            data: {
                Loading: true,
                Section: 1,//当前阶段
                Function: 1,//达到的最远阶段
                History: [],
                Sector: [
                    {
                        Num: 1,
                        Title: "过滤条件推荐"
                    },
                    {
                        Num: 2,
                        Title: "可视化推荐"
                    },
                    {
                        Num: 3,
                        Title: "分析方法推荐"
                    },
                    {
                        Num: 4,
                        Title: "分析途径"
                    },
                    {
                        Num: 5,
                        Title: "分析结果"
                    },
                ],

                distribution: [],//第一阶段过滤
                SimpleTab: true,//More?
                ActiveIndex: 0,

                FirstFilter: [],//过滤条件
                Charts: [],//大表实例
                MiniCharts: [],//迷你表实例
                OnlineDist: [],//实时图表数据

                SecondSelector: [],//可视化推荐选项列表
                SecondIndex: -1,
                //SecondFilter:[],

                ThirdSelector: [],//分析方法推荐列表
                ThirdIndex: -1,

                FourthSelector: [],//分析方法推荐列表

                //FourthSelector:[],
                previous: [-1, -1, -1, -1, -1],
                Nameenum:{
                    "price": "商品售价",
                    "quantity": "销售量",
                    "itemname": "商品名称",
                    "discount": "折扣金额",
                    "category": "商品类型",
                    "solddate": "出售日期",
                    "customer": "买家",
                    "age": "年龄",
                    "gender": "性别",
                    "province": "省份",
                    "nationality": "民族",
                    "itemdesc": "物品描述",
                },
                Mathenum: {
                    "SUM": "总和",
                    "AVG": "均值"
                }
            },
            methods: {
                DeSimplize: function () {
                    this.SimpleTab = false;
                },
                TabOver: function (columnname) {
                    document.getElementById("MiniChart" + columnname).style.backgroundColor = "rgb(204, 204, 204)";
                },
                TabOut: function (columnname) {
                    document.getElementById("MiniChart" + columnname).style.backgroundColor = "#f5f7fa";
                },
                JudgeS: function (num) {
                    if (num == this.Section) return true;
                    else return false;
                },
                JudgeF: function (num) {
                    if (num <= this.Function) return true;
                    else return false;
                },
                SwitchS: function (num) {
                    if (this.Section >= 10) {
                        alert("请退出数据血缘后再更换阶段");
                        return -1;
                    }
                    if (this.Loading == true) {
                        alert("数据载入中，请稍候……");
                        return -1;
                    }
                    if (this.Function < num) {
                        return -1;
                    }
                    this.Section = num;
                    GuessQuestion.Nums = num-1;
                },
                SwitchTab: function (index) {
                    this.DeSimplize();
                    if (index != this.ActiveIndex) {
                        let tabName = "Tab" + index.toString();
                        let ContentName = "Content" + index.toString();
                        let ActiveTab = "Tab" + this.ActiveIndex.toString();
                        let ActiveContent = "Content" + this.ActiveIndex.toString();
                        $("#" + ActiveTab).removeClass("active");
                        $("#" + ActiveContent).removeClass("active");
                        $("#" + ActiveContent).removeClass("in");
                        $("#" + tabName).addClass("active");
                        $("#" + ContentName).addClass("in active");
                        this.ActiveIndex = index;
                    }
                },
                SelectTab: function (index) {
                    if (index != this.ActiveIndex) {
                        this.ActiveIndex = index;
                    }
                },
                StringFilter: function (x, index) {
                    let temp = [x];
                    let empty = [];
                    if (this.FirstFilter[index].data[0] == temp[0]) {
                        this.FirstFilter[index].data = empty;
                    } else {
                        this.FirstFilter[index].data = temp;
                    }
                    let postData = JSON.stringify(this.FirstFilter);
                    for (k in Recommend.Charts) {//Loading所有表
                        Recommend.Charts[k][2].showLoading({
                            text: 'loading...',
                            maskColor: "#f7f7f7"
                        });
                    }
                    $.ajax({
                        type: "POST",
                        url: "http://10.141.223.30:8083/api/data/onlinedist",//155
                        contentType: "application/json",
                        dataType: "json",
                        data: postData,
                        //async: true,
                        jsonp: 'callback',
                        success: function (data) {
                            Recommend.OnlineDist = data;
                        },//success function
                        error: function () {

                        }
                    });
                },
                NameEnum:function(name){
                    return this.Nameenum[name];
                },
                YEnum: function(str){
                    return `${this.Nameenum[str.match("[a-z]+")[0]]}——${this.Mathenum[str.match("[A-Z]+")[0]]}`
                },
                Apply: function () {
                    
                    let that = this;
                    if (that.Loading || that.Section==5) {
                        return -1;
                    }
                    that.Loading = true;
                    GuessQuestion.updated = false;
                    GuessQuestion.Nums = 5;
                    switch (this.Section) {
                        case 1: {//1~2
                            that.Section++;
                            that.Function = that.Section;
                            let temp = [];
                            for(let i of that.FirstFilter){
                                temp.push(i)
                            }
                            if(GuessQuestion.interestColumn != ""){
                                temp.unshift({"columnname": GuessQuestion.interestColumn});
                            }
                            $.ajax({
                                url: "http://10.141.223.30:8083/api/data/deepeye",//155
                                method: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify(temp),
                                success: function (data) {
                                    for (i in data) {
                                        data[i].actived = false;
                                    }
                                    that.SecondSelector = data;
                                    setTimeout(() => {
                                        GuessQuestion.Nums = 1;
                                    }, 1000);
                                }
                            });
                            $.ajax({
                                url: "http://10.141.223.30:8083/api/hive/savehistory",//155
                                method: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify({
                                    "tablename": tableName,
                                    "userid": 1,
                                    "step": 1,
                                    "record": that.FirstFilter,
                                    "previous": that.previous[0]
                                }),
                                success: function (data) {
                                    that.previous[1] = data;
                                    let date = new Date();
                                    if (that.History.length >= 7) {
                                        for (i in that.History) {
                                            if (i == 0) continue;
                                            that.History[i - 1] = that.History[i];
                                        }
                                        that.History[that.History.length - 1] = {
                                            "time": date.toString().substr(16, 5),
                                            "title": that.Sector[0].Title,
                                            "Section": 1,
                                            "id": data
                                        };
                                    } else {
                                        that.History.push({
                                            "time": date.toString().substr(16, 5),
                                            "title": that.Sector[0].Title,
                                            "Section": 1,
                                            "id": data
                                        });
                                    }

                                }
                            })
                            break;
                        }
                        case 2: {//2~3

                            if (that.SecondIndex == -1) {
                                that.Loading = false;
                                return -1;
                            }
                            ycolumnname = Recommend.YEnum(this.SecondSelector[that.SecondIndex].ycolumn);
                            var text = '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>根据您选择的列 [' + Recommend.Nameenum[this.SecondSelector[that.SecondIndex].xcolumn] + '] , [' +  Recommend.YEnum(this.SecondSelector[that.SecondIndex].ycolumn) + ']，为您推荐以下分析流程和方法';
                            document.getElementById('alert-3').innerHTML = text;
                            that.Section++;
                            that.Function = that.Section;

                            $.ajax({
                                url: "http://10.141.223.30:8083/api/data/methodrec",//155
                                method: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify(
                                    [
                                        {"previousStepId": that.previous[1]},
                                        {"xcolumn": that.SecondSelector[that.SecondIndex].xcolumn},
                                        {"ycolumn": that.SecondSelector[that.SecondIndex].ycolumn}
                                    ]
                                ),
                                success: function (data) {
                                    /*
									let TS=MergeData(data)
									let temp=[];
									let tempfilter=[];
									for(i in TS[0]){
										tempfilter.push(false);
										temp.push({"MethodName":TS[0][i],"MethodRate":(TS[1][i]*100).toFixed(2)+"%","actived":false})
									}
									that.ThirdSelector=temp;
									that.ThirdFilter=tempfilter;
									*/
                                    setTimeout(() => {
                                        GuessQuestion.Nums = 1;
                                    }, 1000);
                                    let ThirdTemp = [];
                                    let temp = [];
                                    for (i in data) {
                                        let img = "";
                                        switch (data[i]['task'][0]) {
                                            case "聚类": {
                                                img = "clustering.png";
                                                target = '聚类';
                                                model = data[i]['model'];
                                                src = "http://10.141.223.30:1880/?jid=1574149970156";//暂无
                                                break;
                                            }
                                            case "预测": {
                                                img = "regression.png";
                                                target = '回归';
                                                model = data[i]['model'];
                                                src = "http://10.141.223.30:1880/?jid=1574150267072";
                                                break;
                                            }
                                            case "诊断": {
                                                img = "outlierdetection.png"
                                                target = "异常检测";
                                                model = data[i]['model'];
                                                src = "http://10.141.223.30:1880/?jid=1574316639422";
                                                break;
                                            }
                                        }
                                        /*
                                        switch (data[i][0]) {
                                            case "探索": {
                                                img = "clustering.png";
                                                target = '聚类';
                                                model = 'K均值聚类';
                                                src = "http://10.141.223.30:1880/?jid=1574149970156";
                                                break;
                                            }
                                            case "预测": {
                                                img = "regression.png";
                                                target = '回归';
                                                model = '线性回归';
                                                src = "http://10.141.223.30:1880/?jid=1574150267072";
                                                    data[i][3] = "按需调整商品定价";
                                                break;
                                            }
                                            case "分类": {
                                                img = "outlierdetection.png"
                                                target = "异常检测";
                                                model = "阈值检测";
                                                src = "http://10.141.223.30:1880/?jid=1574316639422";
                                                data[i][1] = "诊断店铺经营状况";
                                                data[i][2] = "找出销售异常商品";
                                                data[i][3] = "发现店铺隐藏问题";

//                                                img = "classification.png";
//                                                target = "分类";
//                                                model = "随机森林";
//                                                src = "http://10.141.223.30:1880/?jid=1574150412616";
                                                break;
                                            }
                                            case "诊断": {
                                                img = "outlierdetection.png"
                                                target = "异常检测";
                                                model = "阈值检测";
                                                src = "http://10.141.223.30:1880/?jid=1574316639422";
                                                break;
                                            }
                                        }*/


                                        ThirdTemp.push({
                                            "method": data[i]['task'][0],
                                            "img": "vendors/images/" + img,
                                            "title": [data[i]['task'][1], data[i]['task'][2], data[i]['task'][3]],
                                            "target": target,
                                            "model": model,
                                            "src": src,
                                            "actived": false,
                                        });
                                        temp.push(false);
                                    }
                                    /*
                                    //演示代码
                                    if(that.SecondSelector[that.SecondIndex].xcolumn=="solddate"){
                                        var TempArr = ThirdTemp[2];
                                        ThirdTemp[2] = ThirdTemp[0];
                                        ThirdTemp[0] = TempArr;
                                    }*/
                                    that.ThirdSelector = ThirdTemp;
                                    setTimeout(() => {
                                        GuessQuestion.Nums = 2;
                                    }, 1000);
//                                    that.ThirdFilter = temp;
                                }
                            });
                            $.ajax({
                                url: "http://10.141.223.30:8083/api/hive/savehistory",//155
                                method: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify({
                                    "tablename": tableName,
                                    "userid": 1,
                                    "step": 2,
                                    "record": [
                                        {"chartId": that.SecondIndex},
                                        {"xcolumn": that.SecondSelector[that.SecondIndex].xcolumn},
                                        {"ycolumn": that.SecondSelector[that.SecondIndex].ycolumn}
                                    ],
                                    "previous": that.previous[1]
                                }),
                                success: function (data) {
                                    that.previous[2] = data;
                                    let date = new Date();
                                    if (that.History.length >= 7) {
                                        for (i in that.History) {
                                            if (i == 0) continue;
                                            that.History[i - 1] = that.History[i];
                                        }
                                        that.History[that.History.length - 1] = {
                                            "time": date.toString().substr(16, 5),
                                            "title": that.Sector[1].Title,
                                            "Section": 2,
                                            "id": data
                                        };
                                    } else {
                                        that.History.push({
                                            "time": date.toString().substr(16, 5),
                                            "title": that.Sector[1].Title,
                                            "Section": 2,
                                            "id": data
                                        });
                                    }

                                }
                            })

                            break;
                        }
                        case 3: {//3~4
                            //11.9
                            $.ajax({
                                url: "http://10.141.223.30:8083/api/data/AnalysisPath",
                                method: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify({

                                }),
                                success: function(data){
                                    //console.log(data)
                                }
                            })
                            document.getElementById('nodered').setAttribute('src', that.ThirdSelector[that.ThirdIndex]['src']);
                            that.Section++;
                            that.Function = that.Section;
                            let date = new Date();
                            if (that.History.length >= 7) {
                                for (i in that.History) {
                                    if (i == 0) continue;
                                    that.History[i - 1] = that.History[i];
                                }
                                that.History[that.History.length - 1] = {
                                    "time": date.toString().substr(16, 5),
                                    "title": that.Sector[2].Title,
                                    "Section": 3,
                                    "id": -1
                                };
                            } else {
                                that.History.push({
                                    "time": date.toString().substr(16, 5),
                                    "title": that.Sector[2].Title,
                                    "Section": 3,
                                    "id": -1
                                });
                            }

                            try {
                                echarts.getInstanceByDom(document.getElementById('result')).dispose();
                            } catch (err) {
                            }
                            ;
                            setTimeout(() => {
                                that.Loading = false;
                                GuessQuestion.Nums = 3;
                                GuessQuestion.updated = true;
                            }, 3000);
                            break;
                        }
                        case 4: {
                            that.Loading = true;

                            that.Section++;
                            that.Function = that.Section;
                            setTimeout(() => {
                                GuessQuestion.Nums = 4;
                                that.Loading = false;
                                GuessQuestion.updated = true;
                            }, 3000);
                            //that.Loading = false;
                            //GuessQuestion.updated = true;
                            let date = new Date();
                            if (that.History.length >= 7) {
                                for (i in that.History) {
                                    if (i == 0) continue;
                                    that.History[i - 1] = that.History[i];
                                }
                                that.History[that.History.length - 1] = {
                                    "time": date.toString().substr(16, 5),
                                    "title": that.Sector[3].Title,
                                    "Section": 4,
                                    "id": -1
                                };
                            } else {
                                that.History.push({
                                    "time": date.toString().substr(16, 5),
                                    "title": that.Sector[3].Title,
                                    "Section": 4,
                                    "id": -1
                                });
                            }
                            try{
                                div=document.getElementById('result')
                               myChart = echarts.getInstanceByDom(div);
                               myChart.dispose();

                            }catch(e){

                            }
                          	xcolumn = that.SecondSelector[that.SecondIndex].xcolumn;
                            ycolumn = that.SecondSelector[that.SecondIndex].ycolumn.substring(4, that.SecondSelector[that.SecondIndex].ycolumn.length - 1);
                            model = that.ThirdSelector[that.ThirdIndex]['model'];
                            // regression
                            if (that.ThirdSelector[that.ThirdIndex]['target']=="回归") {
                                // 分男女预测销量
                                if(xcolumn=='gender'){
                                    var end_date = that.FirstFilter[5].data[1];
                                    var start_date = that.FirstFilter[5].data[0];
                                    $.ajax({
                                        url: "http://10.141.223.30:8083/api/AnalysisResult",// hive/executesql
                                        method: "POST",
                                        dataType: "json",
                                        contentType: "application/json",
                                        data: JSON.stringify({
                                            "sql": "select solddate,gender,sum(" + ycolumn + ") from websales_home_myshop where gender != '未设置' and solddate>'" + start_date + "' group by(solddate),gender order by solddate,gender",
                                            "task": "regression",
                                            "model": model,
                                            "end_date": end_date, //从这一天起往后预测5天
                                            "gender": "true",
                                            "fromcube": "false"
                                        }),
                                        success:function (returnData){
                                            data = returnData.data; //原筛选数据
                                            predicted = returnData.predicted; // 预测数据
                                            len = data.length;
                                            predict_len = predicted.length;
                                            x_date = [];
                                            chart_data = [[]]
                                            predict_data = [[]]
                                            male_data = [];
                                            female_data = [];
                                            male_predict = [];
                                            female_predict = [];
                                            //male_num = 0;//上一个有记录的数值
                                            //female_num = 0;//上一个有记录的数值
                                            var cnt = pdt = 0
                                            for (i = 1; i < len; i++) {
                                                if (data[i]['1']['month'] < 9) {
                                                    month = '0' + (data[i]['1']['month'] + 1);
                                                } else {
                                                    month = data[i]['1']['month'] + 1;
                                                }
                                                if (data[i]['1']['date'] < 10) {
                                                    date = '0' + (data[i]['1']['date']);
                                                } else {
                                                    date = data[i]['1']['date'];
                                                }

                                                time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;

                                                if(time<=end_date){
                                                    if(x_date.indexOf(time)==-1){
                                                        x_date.push(time);
                                                        cnt++;
                                                        chart_data[cnt]=[]
                                                        predict_data[cnt]=['-','-']
                                                    }
                                                    if(data[i]['2']=="男"){
                                                        chart_data[cnt][0] = data[i]['3'];
                                                        //male_num+=data[i]['3'];
                                                    }else{
                                                        chart_data[cnt][1] = data[i]['3'];
                                                        //female_num+=data[i]['3'];
                                                    }
                                                // 预测数据
                                                }else if(time >= end_date && pdt < predict_len/2){
                                                    if(x_date.indexOf(time)==-1){
                                                        x_date.push(time);
                                                        cnt++;
                                                        pdt++;
                                                        predict_data[cnt]=[]
                                                    }
                                                    if(predicted[pdt-1]['2']=="男"){
                                                        predict_data[cnt][0] = predicted[pdt-1]['3'];
                                                        predict_data[cnt][1] = predicted[pdt-1+predict_len/2]['3'];
                                                    }else{
                                                        predict_data[cnt][1] = predicted[pdt-1]['3'];
                                                        predict_data[cnt][0] = predicted[pdt-1+predict_len/2]['3'];
                                                    }
                                                }
                                                else{
                                                    break;
                                                }
                                            }
                                            for(i = 1; i <= cnt; i++){
                                                if(i <= cnt-predict_len/2){
                                                    male_data.push(chart_data[i][0]);
                                                    female_data.push(chart_data[i][1]);
                                                }
                                                male_predict.push(predict_data[i][0]);
                                                female_predict.push(predict_data[i][1]);
                                            }

                                            bopt = {
                                                title: {
                                                    x: 'center',
                                                    y: 'bottom',
                                                    text: '销量预测',
                                                    textStyle: {
                                                        fontSize: 18
                                                    }
                                                },
                                                tooltip: {
                                                    trigger: 'axis',
                                                    axisPointer: {
                                                        type: 'cross'
                                                    },
                                                },
                                                xAxis: {
                                                    data: x_date,
                                                    show: true,
                                                    name: '日期',
                                                },
                                                yAxis: {
                                                    show: true,
                                                    name: ycolumnname
                                                },
                                                series: [{
                                                    name: '男',
                                                    type: 'line',
                                                    data: male_data,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#0000FF"
                                                        }
                                                    }
                                                }, {
                                                    name: '          ',
                                                    type: 'line',
                                                    data: male_predict,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#00FF00"
                                                        }
                                                    }
                                                },{
                                                    name: '女',
                                                    type: 'line',
                                                    data: female_data,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#FF00FF"
                                                        }
                                                    }
                                                }, {
                                                    name: ' ',
                                                    type: 'line',
                                                    data: female_predict,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#FFFF00"
                                                        }
                                                    }
                                                }],
                                                toolbox: {
                                                    show: true,
                                                    feature: {magicType: {type: ['line', 'bar'], show: true}}
                                                },
                                                grid: {
                                                    top: '10%',
                                                    left: '7%',
                                                    right: '10%',
                                                    bottom: '10%',
                                                    containLabel: true
                                                },
                                                legend: {x: 'center', y: 'top'}
                                            };
                                            div = document.getElementById('result');
                                            try {
                                                myChart = echarts.getInstanceByDom(div);
                                                myChart.dispose();
                                            } catch (err) {
                                                myChart = echarts.init(div);
                                            }
                                            window.onresize = myChart.resize;
                                            myChart.resize();
                                            myChart.setOption(bopt);
                                            document.getElementById('alert-6').innerHTML = "为您预测了之后 5 天的销量数据";
                                        }
                                    });
                                }else{
                                    var end_date = that.FirstFilter[5].data[1];
                                    var start_date = that.FirstFilter[5].data[0];
                                    $.ajax({
                                        url: "http://10.141.223.30:8083/api/AnalysisResult",// hive/executesql
                                        method: "POST",
                                        dataType: "json",
                                        contentType: "application/json",
                                        data: JSON.stringify({
                                            "sql": "select solddate,sum(" + ycolumn + ") from websales_home_myshop where solddate>'" + start_date + "' group by(solddate) order by solddate",
                                            "task": "regression",
                                            "model": model,
                                            "end_date": end_date, //从这一天起往后预测5天
                                            "gender": "false",
                                            "fromcube": "false"
                                        }),
                                        success:function (returnData){
                                            data = returnData.data;
                                            predicted = returnData.predicted;
                                            len = data.length;
                                            predict_len = predicted.length;
                                            x_date = [];
                                            y_value_before = [];
                                            y_value_after = [];
                                            var pdt = 0
                                            for (i = 1; i < len; i++) {
                                                if (data[i]['1']['month'] < 9) {
                                                    month = '0' + (data[i]['1']['month'] + 1);
                                                } else {
                                                    month = data[i]['1']['month'] + 1;
                                                }
                                                if (data[i]['1']['date'] < 10) {
                                                    date = '0' + (data[i]['1']['date']);
                                                } else {
                                                    date = data[i]['1']['date'];
                                                }

                                                time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;
                                                if (time <= end_date) {
                                                    y_value_before.push(data[i]['2']);
                                                    y_value_after.push('-');
                                                    x_date.push(time);
                                                } else  if (time > end_date && pdt < predict_len){
                                                    y_value_after.push(predicted[pdt]['2']);
                                                    pdt++;
                                                    x_date.push(time);
                                                }else{
                                                    break;
                                                }
                                            }
                                            bopt = {
                                                title: {
                                                    x: 'center',
                                                    y: 'bottom',
                                                    text: '销量预测',
                                                    textStyle: {
                                                        fontSize: 18
                                                    }
                                                },
                                                tooltip: {
                                                    trigger: 'axis',
                                                    axisPointer: {
                                                        type: 'cross'
                                                    },
                                                },
                                                xAxis: {
                                                    data: x_date,
                                                    show: true,
                                                    name: '日期',
                                                },
                                                yAxis: {
                                                    show: true,
                                                    name: ycolumnname
                                                },
                                                series: [{
                                                    name: '历史数据',
                                                    type: 'line',
                                                    data: y_value_before,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#FF6A6A"
                                                        }
                                                    }
                                                }, {
                                                    name: '预测销量',
                                                    type: 'line',
                                                    data: y_value_after,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#40E0D0"
                                                        }
                                                    }
                                                }],
                                                toolbox: {
                                                    show: true,
                                                    feature: {magicType: {type: ['line', 'bar'], show: true}}
                                                },
                                                grid: {
                                                    top: '10%',
                                                    left: '7%',
                                                    right: '10%',
                                                    bottom: '10%',
                                                    containLabel: true
                                                },
                                                legend: {x: 'center', y: 'top'}
                                            };
                                            div = document.getElementById('result');
                                            try {
                                                myChart = echarts.getInstanceByDom(div);
                                                myChart.dispose();
                                            } catch (err) {
                                                myChart = echarts.init(div);
                                            }
                                            window.onresize = myChart.resize;
                                            myChart.resize();
                                            myChart.setOption(bopt);
                                            document.getElementById('alert-6').innerHTML = "为您预测了之后 5 天的销量数据";
                                        }
                                    })
                                }
                            } else if(that.ThirdSelector[that.ThirdIndex]['target'] == "聚类"){
                                var end_date = that.FirstFilter[5].data[1];
                                var start_date = that.FirstFilter[5].data[0];
                                $.ajax({
                                    url: "http://10.141.223.30:8083/api/AnalysisResult",// hive/executesql
                                    method: "POST",
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        "task": "clustering",
                                        "model": model
                                    }),
                                    success:function (data){
                                        var level= {
                                            "0": "白银用户",
                                            "1": "黄金用户",
                                            "2": "铂金用户"
                                        };
                                        predicted = data.predicted;
                                        len = predicted.length;
                                        x_class = [];
                                        y_value = [];
                                        for(i = 0;i < len;i++){
                                            x_class.push(level[predicted[i]['1']]);
                                            y_value.push(predicted[i][2]);
                                        }
                                        bopt = {
                                            title: {
                                                x: 'center',
                                                y: 'bottom',
                                                text: '用户聚类',
                                                textStyle: {
                                                    fontSize: 18
                                                }
                                            },
                                                tooltip: {
                                                    trigger: 'axis',
                                                    axisPointer: {
                                                        type: 'cross'
                                                    },
                                                },
                                                xAxis: {
                                                    data: x_class,
                                                    show: true,
                                                    name: '类别',
                                                },
                                                yAxis: {
                                                    show: true,
                                                    name: '数量'
                                                },
                                                series: [{
                                                    type: 'line',
                                                    data: y_value,
                                                    itemStyle: {
                                                        normal: {
                                                            color: "#FF6A6A"
                                                        }
                                                    }
                                                }],
                                                toolbox: {
                                                    show: true,
                                                    feature: {magicType: {type: ['line', 'bar'], show: true}}
                                                },
                                                grid: {
                                                    top: '10%',
                                                    left: '7%',
                                                    right: '10%',
                                                    bottom: '10%',
                                                    containLabel: true
                                                },
                                                legend: {x: 'center', y: 'top'}
                                            };
                                            div = document.getElementById('result');
                                            try {
                                                myChart = echarts.getInstanceByDom(div);
                                                myChart.dispose();
                                            } catch (err) {
                                                myChart = echarts.init(div);
                                            }
                                            window.onresize = myChart.resize;
                                            myChart.resize();
                                            myChart.setOption(bopt);
                                            document.getElementById('alert-6').innerHTML = "为您将购买用户聚类成3类";
                                    }
                                });
                            } else if (that.ThirdSelector[that.ThirdIndex]['target']=="异常检测"){
                                var end_date = that.FirstFilter[5].data[1];
                                var start_date = that.FirstFilter[5].data[0];
                                $.ajax({
                                    url: "http://10.141.223.30:8083/api/AnalysisResult",// hive/executesql
                                    method: "POST",
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        "sql": "select solddate,sum(" + ycolumn + ")," + xcolumn + " from websales_home_myshop where solddate>'" + start_date + "' and solddate<'" + end_date + "'group by(solddate)," + xcolumn + " order by solddate",
                                        "task": "outlierdetection",
                                        "model": model
                                    }),
                                    success:function (returnData){
                                        data = returnData.data;
                                        predicted = returnData.predicted;
                                        len = data.length;
                                        x_date = [];
                                        y_value_1 = []; // 正常数据
                                        y_value_2 = []; // 异常数据
                                        for (i = 1; i < len; i++) {
                                            if (data[i]['1']['month'] < 9) {
                                                month = '0' + (data[i]['1']['month'] + 1);
                                            } else {
                                                month = data[i]['1']['month'] + 1;
                                            }
                                            if (data[i]['1']['date'] < 10) {
                                                date = '0' + (data[i]['1']['date']);
                                            } else {
                                                date = data[i]['1']['date'];
                                            }

                                            time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;
                                            if(x_date.indexOf(time)==-1)
                                                x_date.push(time);
                                            if(predicted[i-1] == -1){
                                                y_value_2.push(data[i]['2']);
                                            }else{
                                                y_value_1.push(data[i]['2']);
                                            }
                                        }

                                        // TODO  前端图表展示
                                    }
                                })
                            }
                        }


                            /*//此部分代码演示完后可以删除（伪造预测结果）
                            if (that.ThirdSelector[that.ThirdIndex]['target']=="回归") {
                            if(xcolumn=="gender"){
                                var end_date = that.FirstFilter[5].data[1];
                                var start_date = that.FirstFilter[5].data[0];
                                $.ajax({
                                    url: "http://10.141.223.30:8083/api/AnalysisResult",// hive/executesql
                                    method: "POST",
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        "sql": "select solddate,gender,sum(" + ycolumn + ") from websales_home_myshop where gender != '未设置' and solddate>'" + start_date + "' group by(solddate),gender order by solddate,gender",
                                        "fromcube": "false"
                                    }),
                                    success: function (data) {
                                        data = data.data;
                                        len = data.length;
                                        x_date = [];
                                        chart_data = [[]]
                                        predict_data = [[]]
                                        male_data = [];
                                        female_data = [];
                                        male_predict = [];
                                        female_predict = [];
                                        male_num = 0;//上一个有记录的数值
                                        female_num = 0;//上一个有记录的数值
                                        var cnt = pdt = 0
                                        for (i = 1; i < len; i++) {
                                            if (data[i]['1']['month'] < 9) {
                                                month = '0' + (data[i]['1']['month'] + 1);
                                            } else {
                                                month = data[i]['1']['month'] + 1;
                                            }
                                            if (data[i]['1']['date'] < 10) {
                                                date = '0' + (data[i]['1']['date']);
                                            } else {
                                                date = data[i]['1']['date'];
                                            }

                                            time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;

                                        if(time<=end_date){
                                                if(x_date.indexOf(time)==-1){
                                                    x_date.push(time);cnt++;
                                                    chart_data[cnt]=[]
                                                    predict_data[cnt]=['-','-']
                                                }
                                                 if(data[i]['2']=="男"){
                                                    chart_data[cnt][0] = data[i]['3'];
                                                    male_num+=data[i]['3'];
                                                 }else{
                                                    chart_data[cnt][1] = data[i]['3'];
                                                    female_num+=data[i]['3'];
                                                 }
                                            }else if(time >= end_date && pdt<5){
                                                if(x_date.indexOf(time)==-1){
                                                    x_date.push(time);cnt++;pdt++;
                                                    predict_data[cnt]=[]
                                                }
                                                if(data[i]['2']=="男"){
                                                    predict_data[cnt][0] = data[i]['3'];
                                                 }else{
                                                    predict_data[cnt][1] = data[i]['3'];
                                                 }
                                            }
                                        }

                                        for(i = 0;i<chart_data.length;i++){
                                            if(!chart_data[i][0]){
                                                chart_data[i][0] = 2*Math.random()*male_num/chart_data.length
                                            }
                                            if(!chart_data[i][1]){
                                                chart_data[i][1] = 2*Math.random()*female_num/chart_data.length
                                            }
                                            male_data.push(chart_data[i][0]);
                                            female_data.push(chart_data[i][1]);
                                        }

                                        for(i = 1;i<predict_data.length;i++){
                                            if(!predict_data[i][0]){
                                                predict_data[i][0] = 2*Math.random()*male_num/chart_data.length
                                            }
                                            if(!predict_data[i][1]){
                                                predict_data[i][1] = 2*Math.random()*female_num/chart_data.length
                                            }
                                            male_predict.push(predict_data[i][0]);
                                            female_predict.push(predict_data[i][1]);
                                        }
                                        male_predict[cnt-pdt]=male_data[cnt-pdt]
                                        female_predict[cnt-pdt]=female_data[cnt-pdt]

                                        bopt = {
                                            title: {
                                                x: 'center',
                                                y: 'bottom',
                                                text: '销量预测',
                                                textStyle: {
                                                    fontSize: 18
                                                }
                                            },
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {
                                                    type: 'cross'
                                                },
                                            },
                                            xAxis: {
                                                data: x_date,
                                                show: true,
                                                name: '日期',
                                            },
                                            yAxis: {
                                                show: true,
                                                name: ycolumnname
                                            },
                                            series: [{
                                                name: '男',
                                                type: 'line',
                                                data: male_data,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#0000FF"
                                                    }
                                                }
                                            }, {
                                                name: '          ',
                                                type: 'line',
                                                data: male_predict,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#00FF00"
                                                    }
                                                }
                                            },{
                                                name: '女',
                                                type: 'line',
                                                data: female_data,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#FF00FF"
                                                    }
                                                }
                                            }, {
                                                name: ' ',
                                                type: 'line',
                                                data: female_predict,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#FFFF00"
                                                    }
                                                }
                                            }],
                                            toolbox: {
                                                show: true,
                                                feature: {magicType: {type: ['line', 'bar'], show: true}}
                                            },
                                            grid: {
                                                top: '10%',
                                                left: '7%',
                                                right: '10%',
                                                bottom: '10%',
                                                containLabel: true
                                            },
                                            legend: {x: 'center', y: 'top'}
                                        };
                                        div = document.getElementById('result');
                                        try {
                                            myChart = echarts.getInstanceByDom(div);
                                            myChart.dispose();
                                        } catch (err) {
                                            myChart = echarts.init(div);
                                        }
                                        window.onresize = myChart.resize;
                                        myChart.resize();
                                        myChart.setOption(bopt);
					                    document.getElementById('alert-6').innerHTML = "为您预测了之后 5 天的销量数据";

                                    }
                                });

                            }else{
                                var predict_date = that.FirstFilter[5].data[1];
                                var start_date = that.FirstFilter[5].data[0];
                                $.ajax({
                                    url: "http://10.141.223.30:8083/api/AnalysisResult",
                                    method: "POST",
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        "sql": "select solddate,sum(" + ycolumn + ") from websales_home_myshop where solddate>'" + start_date + "' group by(solddate) order by solddate",
                                        "fromcube": "false"
                                    }),
                                    success: function (data) {
                                        data = data.data;
                                        len = data.length;
                                        x_date = [];
                                        y_value_before = [];
                                        y_value_after = [];
                                        var count = 0;//只预测最多90天的数据
                                        y_num = 0;// 取不到数值时 用前一个数值*随机数伪造
                                        for (i = 1; i < len; i++) {
                                            if (data[i]['1']['month'] < 9) {
                                                month = '0' + (data[i]['1']['month'] + 1);
                                            } else {
                                                month = data[i]['1']['month'] + 1;
                                            }
                                            if (data[i]['1']['date'] < 10) {
                                                date = '0' + (data[i]['1']['date']);
                                            } else {
                                                date = data[i]['1']['date'];
                                            }

                                            time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;
                                            if (time < predict_date) {
                                                y_value_before.push(data[i]['2']);
                                                y_value_after.push('-');
                                                if (count < 5) count++;
                                                x_date.push(time);
                                            } else  if (time > predict_date){
                                                if (count > 0) {
                                                    y_value_after.push(data[i]['2']);
                                                    count--;
                                                    x_date.push(time);
                                                }
                                            }else{
                                                y_value_before.push(data[i]['2']);
                                                y_value_after.push(data[i]['2']);
                                            }


                                        }
                                        bopt = {
                                            title: {
                                                x: 'center',
                                                y: 'bottom',
                                                text: '销量预测',
                                                textStyle: {
                                                    fontSize: 18
                                                }
                                            },
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {
                                                    type: 'cross'
                                                },
                                            },
                                            xAxis: {
                                                data: x_date,
                                                show: true,
                                                name: '日期',
                                            },
                                            yAxis: {
                                                show: true,
                                                name: ycolumnname
                                            },
                                            series: [{
                                                name: '历史数据',
                                                type: 'line',
                                                data: y_value_before,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#FF6A6A"
                                                    }
                                                }
                                            }, {
                                                name: '预测销量',
                                                type: 'line',
                                                data: y_value_after,
                                                itemStyle: {
                                                    normal: {
                                                        color: "#40E0D0"
                                                    }
                                                }
                                            }],
                                            toolbox: {
                                                show: true,
                                                feature: {magicType: {type: ['line', 'bar'], show: true}}
                                            },
                                            grid: {
                                                top: '10%',
                                                left: '7%',
                                                right: '10%',
                                                bottom: '10%',
                                                containLabel: true
                                            },
                                            legend: {x: 'center', y: 'top'}
                                        };
                                        div = document.getElementById('result');
                                        try {
                                            myChart = echarts.getInstanceByDom(div);
                                            myChart.dispose();
                                        } catch (err) {
                                            myChart = echarts.init(div);
                                        }
                                        window.onresize = myChart.resize;
                                        myChart.resize();
                                        myChart.setOption(bopt);
                                        document.getElementById('alert-6').innerHTML = "为您预测了之后 5 天的销量数据";
                                    }
                                });
                                }
                            } else if (that.ThirdSelector[that.ThirdIndex]['target']=="异常检测") {
                                var end_date = that.FirstFilter[5].data[1];
                                var start_date = that.FirstFilter[5].data[0];
                                category = [];
                                //console.log(that.SecondSelector[that.SecondIndex].xcolumn)
                                if (that.SecondSelector[that.SecondIndex].xcolumn == "gender") {
                                    xcolumn = "gender";
                                    category = ["男", "女", "未设置"]
                                } else if (that.SecondSelector[that.SecondIndex].xcolumn == "nationality") {
                                    xcolumn = "nationality";
                                    category = ["汉族", "少数民族"]
                                } else {
                                    xcolumn = "1";
                                    category = ["", ""]
                                }
                                $.ajax({
                                    url: "http://10.141.223.30:8083/api/AnalysisResult",
                                    method: "POST",
                                    dataType: "json",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        "sql": "select solddate,sum(" + ycolumn + ")," + xcolumn + " from websales_home_myshop where solddate>'" + start_date + "' and solddate<'" + end_date + "'group by(solddate)," + xcolumn + " order by solddate",
                                        "fromcube": "false"
                                    }),
                                    success: function (data) {

                                        data = data.data;
                                        len = data.length;
                                        x_date = [];
                                        y_value_1 = [];
                                        y_value_2 = [];
                                        sum = [0, 0]
                                        cnt = [0, 0]
                                        for (i = 1; i < len; i++) {
                                            if (data[i]['1']['month'] < 9) {
                                                month = '0' + (data[i]['1']['month'] + 1);
                                            } else {
                                                month = data[i]['1']['month'] + 1;
                                            }
                                            if (data[i]['1']['date'] < 10) {
                                                date = '0' + (data[i]['1']['date']);
                                            } else {
                                                date = data[i]['1']['date'];
                                            }

                                            time = (data[i]['1']['year'] + 1900) + '-' + month + '-' + date;
                                            if(x_date.indexOf(time)==-1)x_date.push(time);
                                            if (data[i]['3'] == "汉族" || data[i]['3'] == "男" || data[i]['3'] =="1") {
                                                y_value_1.push(data[i]['2']);
                                                sum[0] += data[i]['2'];
                                                cnt[0] += 1;
                                            } else if (data[i]['3'] == "未设置") {
                                            } else {
                                                y_value_2.push(data[i]['2']);
                                                sum[1] += data[i]['2'];
                                                cnt[1] += 1;
                                            }

                                            while(y_value_1.length>y_value_2.length+1 &&  xcolumn !="1"){
                                                y_value_2.push(0);
                                             }
                                             while(y_value_2.length>y_value_1.length+1 && xcolumn !="1"){
                                                 y_value_1.push(0);
                                             }


                                        }
                                        min = [Math.min.apply(Math, y_value_1), Math.min.apply(Math, y_value_2)];
                                        max = [Math.max.apply(Math, y_value_1), Math.max.apply(Math, y_value_2)];
                                        var j = 0;
                                        lte = [];
                                        gte = [];

                                        for (k = 0; k < 2; k++) {
                                            gte[k] = min[k] + 0.2 * (sum[k] / cnt[k] - min[k]);
                                            lte[k] = max[k] - 0.4 * (max[k] - sum[k] / cnt[k]);
                                        }

                                        bopt = {
                                            visualMap: [{
                                                show: false,
                                                dimension: 1,
                                                pieces: [{
                                                    lte: lte[0],
                                                    gte: gte[0],
                                                    color: '#40E0D0',
                                                    seriesIndex: 0
                                                }],  //pieces的值由动态数据决定
                                                outOfRange: {
                                                    color: '#e04050'
                                                },
                                                seriesIndex: 0
                                            },
                                                {
                                                    show: false,
                                                    dimension: 1,
                                                    pieces: [{
                                                        gte: gte[1],
                                                        lte: lte[1],
                                                        color: '#ebe082',
                                                        seriesIndex: 1
                                                    }],  //pieces的值由动态数据决定
                                                    outOfRange: {
                                                        color: '#e04050'
                                                    },
                                                    seriesIndex: 1
                                                }],
                                            title: {
                                                x: 'center',
                                                y: 'bottom',
                                                text: '异常检测',
                                                textStyle: {
                                                    fontSize: 18
                                                }
                                            },
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {
                                                    type: 'cross'
                                                },
                                            },
                                            xAxis: {
                                                name: "日期",
                                                data: x_date,
                                                show: true,
                                            },
                                            yAxis: {
                                                name: ycolumnname,
                                                show: true
                                            },
                                            series: [{
                                                name: category[0],
                                                type: 'line',
                                                data: y_value_1,
                                                itemStyle: {
                                                    normal: {
                                                        color: '#40E0D0',
                                                    }
                                                }

                                            }, {
                                                name: category[1],
                                                type: 'line',
                                                data: y_value_2,
                                                itemStyle: {
                                                    normal: {
                                                        color: '#ebe082',
                                                    }
                                                }
                                            }, {
                                                name: '异常数据',
                                                type: 'line',
                                                data: [],
                                                itemStyle: {
                                                    normal: {
                                                        color: '#e04050'
                                                    }
                                                }
                                            }],
                                            grid: {
                                                top: '10%',
                                                left: '7%',
                                                right: '10%',
                                                bottom: '10%',
                                                containLabel: true
                                            },
                                            legend: {x: 'center', y: 'top'}
                                        };
                                        div = document.getElementById('result');
                                        try {
                                            myChart = echarts.getInstanceByDom(div);
                                            myChart.dispose();
                                        } catch (err) {
                                            myChart = echarts.init(div);
                                        }
                                        window.onresize = myChart.resize;
                                        myChart.resize();
                                        myChart.setOption(bopt);
                                        //11.8修改
                                        let YT = [];
                                        let Ytemp = function(data1,data2) {
                                            let temp = [0,0];
                                            for(let i in data1){
                                                if(data1[i]>lte[0]){
                                                    temp[0]++
                                                }
                                                if(data1[i]<gte[0]){
                                                    temp[1]++
                                                }
                                            }
                                            for(let i in data2){
                                                if(data2[i]>lte[1]){
                                                    temp[0]++
                                                }
                                                if(data2[i]<gte[1]){
                                                    temp[1]++
                                                }
                                            }
                                            return temp;
                                        }
                                        if (data[1]['3'] == "汉族" || data[1]['3'] == "男") {
                                            YT = Ytemp(y_value_1,y_value_2);
                                        } else if (data[1]['3'] == "未设置") {
//                                            YT = Ytemp(y_value_3);
                                        } else {
                                            YT = Ytemp(y_value_1,y_value_2);
                                        }
                                        document.getElementById('alert-6').innerHTML = `高于阈值天数${YT[0]}，低于阈值天数${YT[1]}`;
                                    }
                                });
                            } else {

                                chartOption = {

                                    title: {
                                        x: 'center',
                                        y: 'bottom',
                                        text: '开发中...',
                                        textStyle: {
                                            fontSize: 18
                                        }
                                    },

                                    xAxis: {
                                        name: "",
                                        data: [],
                                        show: true,
                                    },
                                    yAxis: {
                                        name: "",
                                        show: true
                                    },
                                    series: [{
                                        name: '',
                                        type: 'line',
                                        data: []
                                    }],
                                    grid: {
                                        top: '10%',
                                        left: '7%',
                                        right: '10%',
                                        bottom: '10%',
                                        containLabel: true
                                    },

                                };
                                div = document.getElementById('result');
                                try {
                                    myChart = echarts.getInstanceByDom(div);
                                    myChart.dispose();
                                } catch (err) {
                                    myChart = echarts.init(div);
                                }
                                window.onresize = myChart.resize();
                                myChart.resize();
                                myChart.setOption(chartOption);
                            }
                            break;
                        }*/


                        case 5: {

                            break;
                        }
                    }
                },
                Lineage: function () {
                    let that = this;
                    if (that.Loading == true) {
                        alert("数据载入中，请稍候……");
                        return -1;
                    }
                    if (that.Section <= 10) {
                        let Link = 'datalineage.html?logid=' + that.previous[that.Section - 1].toString();
                        //console.log(Link)
                        document.getElementById("DataLineageFrame").src = Link
                        that.Section += 10;
                        document.getElementById("LineageButton").innerHTML = "退出数据血缘"
                    } else {
                        that.Section -= 10;
                        document.getElementById("LineageButton").innerHTML = "数据血缘"
                    }
                    //window.location.href='datalineage.html?logid='+this.previous[this.Section-1].toString();
                },
                SecondSelect: function (index) {
                    if (this.SecondIndex != -1 && this.SecondIndex != index) {//更换
                        this.SecondSelector[this.SecondIndex].actived = false;
                        this.SecondSelector[index].actived = true;
                        this.SecondIndex = index;
                    } else if (this.SecondIndex == index) {//取消
                        this.SecondSelector[index].actived = false;
                        this.SecondIndex = -1;
                    } else {//初始状况
                        this.SecondSelector[index].actived = true;
                        this.SecondIndex = index;
                    }
                },
                ThirdSelect: function (index) {
                    if (this.ThirdIndex != -1 && this.ThirdIndex != index) {//更换
                        this.ThirdSelector[this.ThirdIndex].actived = false;
                        this.ThirdSelector[index].actived = true;
                        this.ThirdIndex = index;
                    } else if (this.ThirdIndex == index) {//取消
                        this.ThirdSelector[index].actived = false;
                        this.ThirdIndex = -1;
                    } else {//初始状况
                        this.ThirdSelector[index].actived = true;
                        this.ThirdIndex = index;
                    }

                    //console.log(this.ThirdSelector[index]['src'])
                    var text = ' <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>根据您创建的分析流程，使用 【' + this.ThirdSelector[index]['model'] + '】 进行' + this.ThirdSelector[index]['target'] + '分析，结果如下';
                    document.getElementById('alert-5').innerHTML = text;
                    //actived=!actived
                },
                ReRange: function(context, index, ShowTemp) {
                    Recommend.Section = 1;
                    Recommend.Function = 1;
                    Recommend.distribution = [];
                    Recommend.FirstFilter = [];
                    Recommend.OnlineDist = [];
                    Recommend.ActiveIndex = 0,
                    Recommend.Charts = [];
                    Recommend.MiniCharts = [];
                    $.ajax({
                        url: "http://10.141.223.30:8083/api/data/range",//155
                        method: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify(
                            {
                                "tablename": tableName,
                                "columnname": context
                            }
                        ),
                        success: function (data) {
                            let temp = [];
                            for (i in data.distribution) {
                                for (j in data.recommend) {
                                    if (data.distribution[i].columnname == data.recommend[j].columnname) {
                                        data.distribution[i].recommend = data.recommend[j];
                                    }
                                }
                                for (k in data.otherrange) {
                                    if (data.distribution[i].columnname == data.otherrange[k].columnname) {
                                        data.distribution[i].otherrange = data.otherrange[k];
                                    }
                                }
                                data.distribution[i].item = MergeData(data.distribution[i].data)[0];
                            }
                            ////console.log(data.distribution);
                            ////console.log(Recommend.FirstFilter);
                            for (d in data.distribution) {
                                if (data.distribution[d].columnname == "price1" || data.distribution[d].columnname == "discount1" || data.distribution[d].columnname == "age1" || data.distribution[d].columnname == "quantity1" || typeof data.distribution[d].recommend == "undefined") {
                                    continue;
                                }
                                temp.push(data.distribution[d]);
                                Recommend.FirstFilter.push(
                                    {
                                        "tablename": tableName,
                                        "columnname": data.distribution[d].columnname,
                                        "type": data.distribution[d].type,
                                        "data": data.distribution[d].type == 12 ? [] : typeof data.distribution[d].otherrange != "undefined" ? data.distribution[d].type == 93 ? [data.distribution[d].otherrange.range[0].substr(0, 10), data.distribution[d].otherrange.range[1].substr(0, 10)] : data.distribution[d].otherrange.range : data.distribution[d].recommend.data,
                                    }
                                );
                            }
                            for (d in data.distribution) {
                                if (data.distribution[d].columnname == "price1" || data.distribution[d].columnname == "discount1" || data.distribution[d].columnname == "age1" || data.distribution[d].columnname == "quantity1" || typeof data.distribution[d].recommend != "undefined") {
                                    continue;
                                }
                                temp.push(data.distribution[d]);
                                Recommend.FirstFilter.push(
                                    {
                                        "tablename": tableName,
                                        "columnname": data.distribution[d].columnname,
                                        "type": data.distribution[d].type,
                                        "data": data.distribution[d].type == 12 ? [] : typeof data.distribution[d].otherrange != "undefined" ? data.distribution[d].type == 93 ? [data.distribution[d].otherrange.range[0].substr(0, 10), data.distribution[d].otherrange.range[1].substr(0, 10)] : data.distribution[d].otherrange.range : data.distribution[d].recommend.range,
                                    }
                                );
                            }
                            Recommend.distribution = temp;
                            setTimeout(() => {
                                GuessQuestion.items[0].Title = "随便看看";
                                GuessQuestion.Nums = 0;
                                $('#myModal').modal('show');
                            }, 1000)
                            
                        }
                    })
                }
            },
            watch: {
                distribution: function () {
                    setTimeout(() => {
                        
                        this.ActiveIndex = 0;
                        for (i in this.distribution) {
                            let that = this.distribution[i];
                            if (that.columnname == "itemdesc") {

                            } else if (that.type == 93) {
                                $("#Slider_" + that.columnname).ionRangeSlider({
                                    hide_min_max: true,
                                    keyboard: true,
                                    min: typeof that.recommend != "undefined" ? moment(that.recommend.range[0], "YYYYMMDD").format("X") : typeof that.otherrange != "undefined" ? moment(that.otherrange.range[0], "YYYYMMDD").format("X") : moment("2001-01-01", "YYYYMMDD").format("X"),
                                    max: typeof that.recommend != "undefined" ? moment(that.recommend.range[1], "YYYYMMDD").format("X") : typeof that.otherrange != "undefined" ? moment(that.otherrange.range[1], "YYYYMMDD").format("X") : moment("2020-12-31", "YYYYMMDD").format("X"),
                                    from: typeof that.recommend != "undefined" ? moment(that.recommend.data[0], "YYYYMMDD").format("X") : typeof that.otherrange != "undefined" ? moment(that.otherrange.range[0], "YYYYMMDD").format("X") : moment("2001-01-01", "YYYYMMDD").format("X"),
                                    to: typeof that.recommend != "undefined" ? moment(that.recommend.data[1], "YYYYMMDD").format("X") : typeof that.otherrange != "undefined" ? moment(that.otherrange.range[1], "YYYYMMDD").format("X") : moment("2020-12-31", "YYYYMMDD").format("X"),
                                    type: 'double',
                                    prettify: function (num) {
                                        return moment(num, "X").format("LL");
                                    },
                                    index: i,
                                    grid: true,
                                    onFinish: function (data) {

                                        let f = moment(data.from, "X").format("YYYYMMDD");
                                        let t = moment(data.to, "X").format("YYYYMMDD");
                                        f = f.substring(0, 4) + "-" + f.substring(4, 6) + "-" + f.substring(6, 8);
                                        t = t.substring(0, 4) + "-" + t.substring(4, 6) + "-" + t.substring(6, 8);
                                        for (j in Recommend.FirstFilter) {
                                            if (Recommend.FirstFilter[j].type == 93) {
                                                Recommend.FirstFilter[j].data = [f, t];
                                                break;
                                            }
                                        }
                                        for (k in Recommend.Charts) {//Loading所有表
                                            Recommend.Charts[k][2].showLoading({
                                                text: 'loading...',
                                                maskColor: "#f7f7f7"
                                            });
                                        }
                                        let postData = JSON.stringify(Recommend.FirstFilter);
                                        /*
                                        if (onlinedist) onlinedist.abort();
                                        onlinedist = */
                                        $.ajax({
                                            type: "POST",
                                            url: "http://10.141.223.30:8083/api/data/onlinedist",//155
                                            contentType: "application/json",
                                            dataType: "json",
                                            data: postData,
                                            //async: true,
                                            jsonp: 'callback',
                                            success: function (data) {
                                                Recommend.OnlineDist = data;
                                            },//success function
                                            error: function () {

                                            }
                                        });
                                    }//onFinish
                                })//$("#range").ionRangeSlider
                            } else if (that.type == 4 || that.type == 8) {
                                $("#Slider_" + that.columnname).ionRangeSlider({
                                    hide_min_max: true,
                                    keyboard: true,
                                    min: typeof that.recommend != "undefined" ? that.recommend.range[0] : typeof that.otherrange != "undefined" ? that.otherrange.range[0] : 0,
                                    max: typeof that.recommend != "undefined" ? that.recommend.range[1] : typeof that.otherrange != "undefined" ? that.otherrange.range[1] : 9999,
                                    from: typeof that.recommend != "undefined" ? that.recommend.data[0] : typeof that.otherrange != "undefined" ? that.otherrange.range[0] : 0,
                                    to: typeof that.recommend != "undefined" ? that.recommend.data[1] : typeof that.otherrange != "undefined" ? that.otherrange.range[1] : 9999,
                                    type: 'double',
                                    step: 1,
                                    index: i,
                                    grid: true,
                                    onFinish: function (data) {
                                        let f = data.from;
                                        let t = data.to;
                                        for (j in Recommend.FirstFilter) {
                                            if (Recommend.FirstFilter[j].columnname == that.columnname) {
                                                Recommend.FirstFilter[j].data = [f, t];
                                                break;
                                            }
                                        }
                                        for (k in Recommend.Charts) {//Loading所有表
                                            Recommend.Charts[k][2].showLoading({
                                                text: 'loading...',
                                                maskColor: "#f7f7f7"
                                            });
                                        }
                                        let postData = JSON.stringify(Recommend.FirstFilter);
                                        /*
                                        if (onlinedist) onlinedist.abort();
                                        onlinedist = */
                                        $.ajax({
                                            type: "POST",
                                            url: "http://10.141.223.30:8083/api/data/onlinedist",//155
                                            contentType: "application/json",
                                            dataType: "json",
                                            data: postData,
                                            //async: true,
                                            jsonp: 'callback',
                                            success: function (data) {
                                                Recommend.OnlineDist = data;
                                            },//success function
                                            error: function () {

                                            }
                                        });
                                    }
                                });
                            }
                            if (that.columnname == "itemdesc") {
                                let temp = [];
                                for (i in that.data) {
                                    for (item in that.data[i]) {
                                        temp.push({"name": item, "value": that.data[i][item]});
                                    }
                                }
                                let MiniChart = echarts.init(document.getElementById("MiniChart" + that.columnname));
                                let Chart = echarts.init(document.getElementById("Chart" + that.columnname));
                                MiniChart.setOption({
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    series: [{
                                        type: 'wordCloud',
                                        shape: 'circle',
                                        //maskImage: maskImage,
                                        left: 'center',
                                        top: 'center',
                                        width: '53%',
                                        height: '60%',
                                        right: null,
                                        bottom: null,
                                        sizeRange: [6, 30],
                                        rotationRange: [-90, 90],
                                        rotationStep: 45,
                                        gridSize: 4,
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
                                        data: temp
                                    }]
                                });
                                Chart.setOption({
                                    tooltip: {},
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    series: [{
                                        type: 'wordCloud',
                                        shape: 'circle',
                                        //maskImage: maskImage,
                                        left: 'center',
                                        top: 'center',
                                        width: '70%',
                                        height: '80%',
                                        right: null,
                                        bottom: null,
                                        sizeRange: [12, 60],
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
                                        data: temp
                                    }]
                                });
                                Recommend.MiniCharts.push([that.columnname, that.type, MiniChart]);
                                Recommend.Charts.push([that.columnname, that.type, Chart]);
                            } else if (that.type == "StringType" || that.type == 12) {//饼图
                                let ChartPie = MergePie(that.data);
                                let MiniChart = echarts.init(document.getElementById("MiniChart" + that.columnname))
                                MiniChart.setOption({//迷你图
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    series: [
                                        {
                                            type: 'pie',
                                            radius: '55%',
                                            center: ['50%', '60%'],
                                            data: ChartPie[1],
                                            labelLine: {
                                                normal: {
                                                    show: false
                                                }
                                            },
                                            itemStyle: {
                                                emphasis: {
                                                    shadowBlur: 10,
                                                    shadowOffsetX: 0,
                                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                }
                                            }
                                        }
                                    ]
                                });

                                let Chart = echarts.init(document.getElementById("Chart" + that.columnname))
                                Chart.setOption({
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: "{b} : {c} ({d}%)",
                                        position: 'top'
                                    },
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    series: [
                                        {
                                            type: 'pie',
                                            radius: '55%',
                                            center: ['50%', '60%'],
                                            data: ChartPie[0],
                                            label: {
                                                formatter: function (params) {
                                                    return params.name.length >= 6 ? params.name.substr(0, 6) + "..." : params.name;
                                                }
                                            },
                                            itemStyle: {
                                                emphasis: {
                                                    shadowBlur: 10,
                                                    shadowOffsetX: 0,
                                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                }
                                            }
                                        }
                                    ]
                                });
                                Recommend.MiniCharts.push([that.columnname, that.type, MiniChart]);
                                Recommend.Charts.push([that.columnname, that.type, Chart]);
                            } else {//条形图
                                let ChartData = MergeData(that.data);
                                let MiniChart = echarts.init(document.getElementById("MiniChart" + that.columnname));
                                MiniChart.setOption({
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    xAxis: {
                                        type: 'category',
                                        data: ChartData[0],
                                        show: false,
                                    },
                                    yAxis: {
                                        type: 'value',
                                        show: false
                                    },
                                    series: [{
                                        data: ChartData[1],
                                        type: 'bar'
                                    }]
                                });
                                //console.log(MiniChart)
                                let Chart = echarts.init(document.getElementById("Chart" + that.columnname))
                                Chart.setOption({
                                    tooltip: {
                                        trigger: 'axis',
                                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                        }
                                    },
                                    title: {
                                        text: Recommend.Nameenum[that.columnname],
                                        x: 'center'
                                    },
                                    xAxis: {
                                        type: 'category',
                                        data: ChartData[0]
                                    },
                                    yAxis: {
                                        type: 'value'
                                    },
                                    series: [{
                                        data: ChartData[1],
                                        type: 'bar'
                                    }]
                                });
                                Recommend.MiniCharts.push([that.columnname, that.type, MiniChart]);
                                Recommend.Charts.push([that.columnname, that.type, Chart]);
                            }
                        }
                        Recommend.Loading = false;
                        GuessQuestion.updated = true;
                    }, 1000);
                },//distribution,
                OnlineDist: function () {
                    ////console.log(this.OnlineDist);
                    let Options = [];

                    for (i in this.OnlineDist) {//获取数据
                        if (this.OnlineDist[i].columnname == "itemdesc") {
                            Options.push([this.OnlineDist[i].columnname, this.OnlineDist[i].data]);
                            //console.log(Options);
                        } else if (this.OnlineDist[i].type == 12) {
                            Options.push([this.OnlineDist[i].columnname, MergePie(this.OnlineDist[i].data)]);
                        } else {
                            Options.push([this.OnlineDist[i].columnname, MergeData(this.OnlineDist[i].data)]);
                        }

                    }
                    //console.log(Options);
                    for (i in Options) {//重绘所有表
                        for (j in this.MiniCharts) {
                            if (Options[i][0] == this.MiniCharts[j][0]) {
                                if (Options[i][0] == "itemdesc") {
                                    let temp = [];
                                    for (k in Options[i][1]) {
                                        for (item in Options[i][1][k]) {
                                            temp.push({"name": item, "value": Options[i][1][k][item]});
                                        }
                                    }
                                    this.MiniCharts[j][2].setOption({
                                        series: [{
                                            data: temp
                                        }]
                                    })
                                    this.Charts[j][2].setOption({
                                        series: [{
                                            data: temp
                                        }]
                                    })
                                    this.Charts[j][2].hideLoading();
                                } else if (this.MiniCharts[j][1] != 12) {
                                    this.MiniCharts[j][2].setOption({
                                        xAxis: {
                                            data: Options[i][1][0],
                                        },
                                        series: {
                                            data: Options[i][1][1],
                                        }
                                    });
                                    this.Charts[j][2].setOption({
                                        xAxis: {
                                            data: Options[i][1][0],
                                        },
                                        series: {
                                            data: Options[i][1][1],
                                        }
                                    })
                                    this.Charts[j][2].hideLoading();
                                } else {
                                    let temp = [];
                                    for (k in Options[i][1][0]) {
                                        temp.push(Options[i][1][0][k]);
                                    }
                                    this.MiniCharts[j][2].setOption({
                                        series: {
                                            data: Options[i][1][1],
                                        }
                                    });
                                    this.Charts[j][2].setOption({
                                        series: {
                                            data: temp,
                                        }
                                    })
                                    this.Charts[j][2].hideLoading();
                                }
                                break;
                            }
                        }
                    }
                },//OnlineDist
                SecondSelector: function () {
                    setTimeout(() => {
                        for (i in this.SecondSelector) {
                            if (this.SecondSelector[i].cType == "bar") {
                                if (this.SecondSelector[i].classify.length != 0) {
                                    let SeriesTemp = [];
                                    let SourceTemp = [["class"]];
                                    for (l in this.SecondSelector[i].classify) {
                                        SourceTemp[0].push(this.SecondSelector[i].classify[l]);
                                        SeriesTemp.push({type: 'bar'});
                                    }
                                    for (j in this.SecondSelector[i].xdata[0]) {
                                        let temp = [this.SecondSelector[i].xdata[0][j]];
                                        for (k in this.SecondSelector[i].ydata) {
                                            temp.push(this.SecondSelector[i].ydata[k][j]);
                                        }
                                        SourceTemp.push(temp);
                                    }
                                    let chart = echarts.init(document.getElementById("SecondChart" + i.toString()));
                                    chart.clear();
                                    chart.setOption({
                                        tooltip: {
                                            trigger: 'axis',
                                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                            }
                                        },
                                        title: {
                                            text: Recommend.YEnum(this.SecondSelector[i].ycolumn),
                                            x: 'left'
                                        },
                                        legend: {
                                            data: this.SecondSelector[i].classify,
                                            left: "right"
                                        },
                                        dataset: {
                                            source: SourceTemp
                                        },
                                        xAxis: {
                                            name:Recommend.Nameenum[this.SecondSelector[i].xcolumn],
                                            nameLocation:"middle",
                                            nameGap:20,
                                            type: 'category',
                                            axisLabel: {
                                                show:this.SecondSelector[i].xdata[0].length>5?false:true,
                                                formatter: function (value, index) {
                                                    if (value.length >= 10) {
                                                        value = value.substr(0, 10);
                                                    }
                                                    return value;
                                                }
                                            },
                                            fontsize :10
                                        },
                                        yAxis: {
                                            axisLabel: {
                                                formatter: function (value, index) {
                                                    if (value >= 10000 && value < 10000000) {
                                                        value = value / 10000 + "万";
                                                    } else if (value >= 10000000) {
                                                        value = value / 10000000 + "千万";
                                                    }
                                                    return value;
                                                },
                                                fontSize:10
                                            }
                                        },
                                        series: SeriesTemp
                                    })
                                } else {
                                    let chart = echarts.init(document.getElementById("SecondChart" + i.toString()));
                                    chart.clear();
                                    chart.setOption({
                                        tooltip: {
                                            trigger: 'axis',
                                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                            }
                                        },
                                        title: {
                                            text: Recommend.YEnum(this.SecondSelector[i].ycolumn),
                                            x: 'left'
                                        },
                                        legend: {
                                            data: this.SecondSelector[i].classify,
                                            left: "right"
                                        },
                                        xAxis: {
                                            type: 'category',
                                            name: Recommend.Nameenum[this.SecondSelector[i].xcolumn],
                                            nameLocation:"middle",
                                            nameGap:20,
                                            data: this.SecondSelector[i].xdata[0],
                                            axisLabel: {
                                                show:this.SecondSelector[i].xdata[0].length>5?false:true,
                                                formatter: function (value, index) {
                                                    if (value.length >= 10) {
                                                        value = value.substr(0, 10);
                                                    }
                                                    return value;
                                                },
                                                fontsize :10,
                                            }
                                        },
                                        yAxis: {
                                            type: 'value',
                                            axisLabel: {
                                                formatter: function (value, index) {
                                                    if (value >= 10000 && value < 10000000) {
                                                        value = value / 10000 + "万";
                                                    } else if (value >= 10000000) {
                                                        value = value / 10000000 + "千万";
                                                    }
                                                    return value;
                                                },
                                                fontSize:10
                                                
                                            }
                                        },
                                        series: [{
                                            data: this.SecondSelector[i].ydata[0],
                                            type: 'bar'
                                        }]
                                    })
                                }
                            } else if (this.SecondSelector[i].cType == "line") {
                                let ytemp = [];
                                for (k in this.SecondSelector[i].ydata) {
                                    ytemp.push({
                                        name: this.SecondSelector[i].classify[k],
                                        data: this.SecondSelector[i].ydata[k],
                                        type: 'line'
                                    });
                                }
                                let chart = echarts.init(document.getElementById("SecondChart" + i.toString()));
                                chart.clear();
                                chart.setOption({
                                    tooltip: {
                                        trigger: 'axis',
                                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                        }
                                    },
                                    title: {
                                        text: Recommend.YEnum(this.SecondSelector[i].ycolumn),
                                        x: 'left'
                                    },
                                    legend: {
                                        data: this.SecondSelector[i].classify,
                                        left: "right"
                                    },
                                    xAxis: {
                                        name:Recommend.Nameenum[this.SecondSelector[i].xcolumn],
                                        nameLocation:"middle",
                                        nameGap:20,
                                        type: 'category',
                                        data: this.SecondSelector[i].xdata[0],
                                        axisLabel: {
                                            show:this.SecondSelector[i].xdata[0].length>5?false:true,
                                            formatter: function (value, index) {
                                                if (value.length >= 10) {
                                                    value = value.substr(0, 10);
                                                }
                                                return value;
                                            },
                                            fontsize :10,
                                            
                                        }
                                    },
                                    yAxis: {
                                        type: 'value',
                                        axisLabel: {
                                            formatter: function (value, index) {
                                                if (value >= 10000 && value < 10000000) {
                                                    value = value / 10000 + "万";
                                                } else if (value >= 10000000) {
                                                    value = value / 10000000 + "千万";
                                                }
                                                return value;
                                            },
                                            fontSize:10
                                        }
                                    },
                                    series: ytemp
                                })
                            } else if (this.SecondSelector[i].cType == "pie") {
                                let temp = [];
                                for (j in this.SecondSelector[i].xdata[0]) {
                                    temp.push({
                                        "value": this.SecondSelector[i].ydata[0][j],
                                        "name": this.SecondSelector[i].xdata[0][j]
                                    });
                                }
                                let chart = echarts.init(document.getElementById("SecondChart" + i.toString()));
                                chart.clear();
                                chart.setOption({
                                    title: {
                                        text: Recommend.YEnum(this.SecondSelector[i].ycolumn),
                                        x: 'left'
                                    },
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: "{b} : {c} ({d}%)"
                                    },
                                    series: [
                                        {
                                            type: 'pie',
                                            radius: '55%',
                                            center: ['50%', '60%'],
                                            data: temp,
                                            labelLine: {
                                                normal: {
                                                    show: true
                                                }
                                            },
                                            label: {
                                                formatter: function (params) {
                                                    return params.name.length >= 6 ? params.name.substr(0, 6) + "..." : params.name;
                                                }
                                            },
                                            itemStyle: {
                                                emphasis: {
                                                    shadowBlur: 10,
                                                    shadowOffsetX: 0,
                                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                }
                                            }
                                        }
                                    ]
                                })
                            }
                        }
                        this.Loading = false;
                        GuessQuestion.updated = true;
                    }, 300);
                },//SecondSelector;
                ThirdSelector: function () {
                    setTimeout(() => {
                        GuessQuestion.updated = true;
                        this.Loading = false;
                    }, 300);
                }//ThirdSelector
            }
        })
        $.ajax({
            type: "POST",
            url: "http://10.141.223.30:8083/api/hive/getrecenthistory",//155
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({"recent": 5, "tablename": tableName}),
            success: function (data) {
                for (i in data) {
                    Recommend.History.push({
                        "time": data[data.length - 1 - i].time.substr(11, 5),
                        "title": Recommend.Sector[data[data.length - 1 - i].step - 1].Title,
                        "Section": data[data.length - 1 - i].step,
                        "id": data[data.length - 1 - i].log_id
                    });
                }
            },//success function
            error: function () {

            }
        });
        $.ajax({
            url: "http://10.141.223.30:8083/api/data/range",//155
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(
                {
                    "tablename": tableName
                }
            ),
            success: function (data) {
                let temp = [];
                for (i in data.distribution) {
                    for (j in data.recommend) {
                        if (data.distribution[i].columnname == data.recommend[j].columnname) {
                            data.distribution[i].recommend = data.recommend[j];
                        }
                    }
                    for (k in data.otherrange) {
                        if (data.distribution[i].columnname == data.otherrange[k].columnname) {
                            data.distribution[i].otherrange = data.otherrange[k];
                        }
                    }
                    data.distribution[i].item = MergeData(data.distribution[i].data)[0];
                }
                ////console.log(data.distribution);
                ////console.log(Recommend.FirstFilter);
                for (d in data.distribution) {
                    if (data.distribution[d].columnname == "price1" || data.distribution[d].columnname == "discount1" || data.distribution[d].columnname == "age1" || data.distribution[d].columnname == "quantity1" || typeof data.distribution[d].recommend == "undefined") {
                        continue;
                    }
                    temp.push(data.distribution[d]);
                    Recommend.FirstFilter.push(
                        {
                            "tablename": tableName,
                            "columnname": data.distribution[d].columnname,
                            "type": data.distribution[d].type,
                            "data": data.distribution[d].type == 12 ? [] : typeof data.distribution[d].otherrange != "undefined" ? data.distribution[d].type == 93 ? [data.distribution[d].otherrange.range[0].substr(0, 10), data.distribution[d].otherrange.range[1].substr(0, 10)] : data.distribution[d].otherrange.range : data.distribution[d].recommend.data,
                        }
                    );
                }
                for (d in data.distribution) {
                    if (data.distribution[d].columnname == "price1" || data.distribution[d].columnname == "discount1" || data.distribution[d].columnname == "age1" || data.distribution[d].columnname == "quantity1" || typeof data.distribution[d].recommend != "undefined") {
                        continue;
                    }
                    temp.push(data.distribution[d]);
                    Recommend.FirstFilter.push(
                        {
                            "tablename": tableName,
                            "columnname": data.distribution[d].columnname,
                            "type": data.distribution[d].type,
                            "data": data.distribution[d].type == 12 ? [] : typeof data.distribution[d].otherrange != "undefined" ? data.distribution[d].type == 93 ? [data.distribution[d].otherrange.range[0].substr(0, 10), data.distribution[d].otherrange.range[1].substr(0, 10)] : data.distribution[d].otherrange.range : data.distribution[d].recommend.range,
                        }
                    );
                }
                Recommend.distribution = temp;
            }
        })
    }
}
//推荐系统结束


{
    let XaxisDemo = [];
    let hours = ["0~4", "4~8", "8~12", "12~16", "16~20", "20~24"];
    { //currentstatus
        //标题更新时间
        let updatetime = new Vue({
            el: "#headline",
            data: {
                currenttime: date_now
            }
        });
        //左下表格
        var chart0 = echarts.init(document.getElementById("chart_currentstatus_left"));
        chart0.showLoading({
            text: 'loading...',
            maskColor: "#f7f7f7"
        });
        //左上vue数据
        let paidmoney = new Vue({
            el: "#card_left",
            data: {
                paid: "--",
                rank: "--",
                yeste: "--",
            }

        });
        //右侧vue数据
        let CardRight = new Vue({
            el: "#status_right",
            data: {
                cards: [
                    {
                        img: 'fa fa-truck fa-stack-1x fa-inverse',
                        style: "color:#fe7c24;",
                        column: "销售量",
                        nums: "--",
                        rating: "--",
                        yesterday: "--"
                    },
                    {
                        img: 'fa fa-dollar fa-stack-1x fa-inverse',
                        style: "color:#00ba26;",
                        column: "累计支付金额",
                        nums: "--",
                        rating: "--",
                        yesterday: "--"
                    },
                ]
            },
            methods:{
                HoverOver:function(context){
                    Queues.Hover.Over(context)                       
                },
                HoverOut: function(context){
                    Queues.Hover.Out(context)
                }
            }
        });
        {
            let DataFetched = 0;
            let QuantityToday = 0;
            let QuantityYesterday = 0;
            let TotalSalesToday = 0;
            let TotalSalesYesterday = 0;
            let TotalSales = 0;
            let SalesToday = [];
            let SalesYesterday = [0, 0, 0, 0, 0, 0];

            function SetDataCurrent() {
                let option0 = {
                    tooltip: {
                        trigger: 'axis'
                    },
                    grid: {
                        top: 30,
                        bottom: 10,
                        left: 0,
                        right: 0,
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: XaxisDemo,//hours,
                        //xAxis
                        splitLine: false
                    },
                    yAxis: {
                        type: 'value',
                        splitNumber: 2,
                        splitLine: false
                    },
                    legend: {
                        data: ["我的"/* '今日','昨日'*/],
                        x: "left"
                    },
                    series: [{
                        name: "我的",//"今日",
                        data: SalesToday,
                        //dataToday
                        type: 'line'
                    },
                        /*{
                            name: "昨日",
                            data: SalesYesterday,
                            //dataYesterday
                            type: 'line'
                        }*/]
                };
                chart0.hideLoading();
                chart0.setOption(option0);
                paidmoney.paid = TotalSalesToday;
                paidmoney.rank = "5W+";//dead data
                paidmoney.yeste = TotalSalesYesterday.toFixed(2);
                //paidmoney.rank =
                CardRight.cards[0].nums = QuantityToday;
                CardRight.cards[0].yesterday = QuantityYesterday;
                CardRight.cards[1].nums = NumToStrings(TotalSales);
                CardRight.cards[1].yesterday = NumToStrings(TotalSales - TotalSalesToday);
                CardRight.cards[0].rating = "5W+";
                CardRight.cards[1].rating = "5W+";
            }

            $.ajax({
                url: "http://10.141.223.30:8083/api/data/getsumbydate",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "tablename": "websales_home_myshop",
                        "date1": date_lastweek,//date_now
                        "date2": date_now,//date_now
                        "scale": "day"
                    }
                ),
                success: function (data) {
                    for (i in data.data) {
                        for (item in data.data[i]) {
                            XaxisDemo.push(item.substr(5, 5));
                            SalesToday.push(data.data[i][item][1]);
                        }
                    }
                    DataFetched += 1;
                    if (DataFetched == 4) {
                        SetDataCurrent();
                    }
                }
            });
            $.ajax({
                url: "http://10.141.223.30:8083/api/data/getsumbydate",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "tablename": "websales_home_myshop",
                        "date1": date_now,
                        "date2": date_now,
                        "scale": "day"
                    }
                ),
                success: function (data) {
                    for (i in data.data) {
                        for (item in data.data[i]) {
                            QuantityToday += data.data[i][item][0];
                            //SalesToday[i%4] += data.data[i][item][1];
                            TotalSalesToday += data.data[i][item][1];
                        }
                    }
                    DataFetched += 1;
                    if (DataFetched == 4) {
                        SetDataCurrent();
                    }
                }
            });
            $.ajax({
                url: "http://10.141.223.30:8083/api/data/getsumbydate",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "tablename": "websales_home_myshop",
                        "date1": date_yesterday,
                        "date2": date_yesterday,
                        "scale": "day"
                    }
                ),
                success: function (data) {
                    for (i in data.data) {
                        for (item in data.data[i]) {
                            QuantityYesterday += data.data[i][item][0];
                            //SalesYesterday[i%4] += data.data[i][item][1];
                            TotalSalesYesterday += data.data[i][item][1];
                        }
                    }
                    DataFetched += 1;
                    if (DataFetched == 4) {
                        SetDataCurrent();
                    }
                }

            });
            $.ajax({
                url: "http://10.141.223.30:8083/api/hive/executesql",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    "sql": "select sum(price*quantity) from websales_home_myshop",
                    "fromcube": "false"
                }),
                success: function (data) {
                    TotalSales = data.data[1]["1"];
                    DataFetched += 1;

                    if (DataFetched == 4) {
                        SetDataCurrent();
                    }
                }
            });
        }

    }


    { //survey_rank
        //更新时间
        new Vue({
            el: "#survey_updatetime",
            data: {
                currenttime: date_now,
            },
        });
        //左上数据
        let survey_rank = new Vue({
            el: "#survey_rank",
            data: {
                paymentrank: "5W+",
                changement: "1000+",
                up: "fa fa-angle-double-up",
                color: "color:red"
            },
        });
        //右上表格
        var chart1 = echarts.init(document.getElementById("chart_shopsurvey_rank"));
        chart1.showLoading({
            text: 'loading...',
            maskColor: "#f7f7f7"
        });
        var option1 = {
            xAxis: {
                show: false,
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                splitLine: false,
            },
            yAxis: {
                splitLine: false,
                show: false
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line'
            }]
        }
        chart1.hideLoading();
        chart1.setOption(option1);
        //右下进度条
        var chart2 = echarts.init(document.getElementById("chart_shopsurvey_progress"));
        let Mission = new Vue({
            el: "#survey_progress",
            data: {
                percentage: "--",
                now: "--",
                plan: "--"
            },
        });
        let Target_now = 0;
        chart2.setOption({
            grid: {
                left: '5%',
                right: '2%',
                bottom: '0%',
                top: "0%",
                x: 0,
                y: 0

            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01],
                show: false,
                fontsize: 1
            },
            yAxis: {
                type: 'category',
                data: ['sales12'],
                show: false,
                fontsize: 1
            },
            series: [{
                name: 'completed',
                type: 'bar',
                stack: "sales",
                data: [18203],
                barWidth: 30,
                itemStyle: {
                    barBorderRadius: [5, 0, 0, 5]
                }

            },
                {
                    name: 'rest',
                    type: 'bar',
                    stack: "sales",
                    data: [19325],
                    barWidth: 30,
                    itemStyle: {
                        barBorderRadius: [0, 5, 5, 0]
                    }
                }],
            animation: false,
        });
        $.ajax({
            url: "http://10.141.223.30:8083/api/data/getsumbydate",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(
                {
                    "tablename": "websales_home_myshop",
                    "date1": date_now.substr(0, 8) + "01",
                    "date2": date_now,
                    "scale": "month"
                }
            ),
            success: function (data) {
                for (i in data.data[0]) {
                    Target_now = data.data[0][i][1];
                }
                $.ajax({
                    url: "http://10.141.223.30:8083/api/data/settarget",
                    method: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "user_id": 1,
                        "target": -1
                    }),
                    success: function (data) {
                        DataSet(Target_now, data.target);
                    }
                });
            }
        });

        function MissionSet(goal) {
            $.ajax({
                url: "http://10.141.223.30:8083/api/data/settarget",
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    "user_id": 1,
                    "target": goal
                }),
                success: function (data) {
                    DataSet(Target_now, data.target);
                }
            });
        }

        function DataSet(now, goal) {
            now = parseInt(now);
            goal = parseInt(goal);
            let n = [];
            n.push(now);
            let g = [];
            g.push(goal > now ? goal - now : 0)
            chart2.setOption({
                series: [
                    {
                        name: "completed",
                        data: n
                    },
                    {
                        name: "rest",
                        data: g
                    }
                ]
            });
            Mission.now = NumToStrings(now);
            Mission.plan = NumToStrings(goal);
            Mission.percentage = (now / goal * 100).toFixed(2) + "%";
        }
    }
}

{ //整体看板
    let activedCol = 0;

    var chart3 = echarts.init(document.getElementById("chart_total"));
    setTimeout(function () {
        window.onresize = function () {
            ////console.log(charts_global);
            chart0.resize();
            chart1.resize();
            chart2.resize();
            chart3.resize();
            for(i in charts_global){
                charts_global[i].resize();
            }
            let height = $("#shopsurvey .panel-body").height() >= $("#currentstatus .panel-body").height() ? $("#shopsurvey .panel-body").height() : $("#currentstatus .panel-body").height()
            $("#shopsurvey .panel-body").height(height);
            $("#currentstatus .panel-body").height(height);
        }
    }, 200)
    chart3.showLoading({
        text: "Loading...",
        maskColor: "#f7f7f7"
    });
    //修改数据
    let TopAndOwn = 0;
    let Xaxis = [];
    let Top1Quantity = [];
    let YourQuantity = [];
    let Top1Sales = [];
    let YourSales = [];
    let Top1TotalQuantity = 0;
    let YourTotalQuantity = 0;
    let Top1TotalSales = 0;
    let YourTotalSales = 0;

    function MountVue(vue) {
        vue.static[0].num = YourTotalQuantity;
        vue.static[0].rate_top1 = (Math.abs(YourTotalQuantity - Top1TotalQuantity) / Top1TotalQuantity * 100).toFixed(2) + "%";
        vue.static[0].up1 = (YourTotalQuantity >= Top1TotalQuantity) ? "fa fa-angle-double-up" : "fa fa-angle-double-down";

        vue.static[1].num = NumToStrings(YourTotalSales);
        vue.static[1].rate_top1 = (Math.abs(YourTotalSales - Top1TotalSales) / Top1TotalSales * 100).toFixed(2) + "%";
        vue.static[1].up1 = (YourTotalSales >= Top1TotalSales) ? "fa fa-angle-double-up" : "fa fa-angle-double-down";
    }

    function FetchData(Range, scale) {
        Xaxis = [];
        TopAndOwn = 0;
        //TOP1
        $.ajax({
            url: "http://10.141.223.30:8083/api/data/getsumbydate",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(
                {
                    "tablename": TargetTable,//"bigbench1.websales_home_myshop",
                    "date1": Range[0],
                    "date2": Range[1],
                    "scale": scale,
                }
            ),
            success: function (data) {
                Top1Quantity = [];
                Top1Sales = [];
                Top1TotalQuantity = 0;
                Top1TotalSales = 0;
                for (i in data.data) {
                    for (item in data.data[i]) {
                        Xaxis.push(item);
                        Top1TotalQuantity += data.data[i][item][0];
                        Top1Quantity.push(data.data[i][item][0]);
                        Top1TotalSales += data.data[i][item][1];
                        Top1Sales.push(data.data[i][item][1]);
                    }
                }
                TopAndOwn += 1;
                if (TopAndOwn == 2) {
                    SetDataCurrent(YourQuantity, Top1Quantity);
                    MountVue(columns);
                }
            }
        });
        //yours
        $.ajax({
            url: "http://10.141.223.30:8083/api/data/getsumbydate",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(
                {
                    "tablename": "websales_home_myshop",
                    "date1": Range[0],
                    "date2": Range[1],
                    "scale": scale,
                }
            ),
            success: function (data) {
                YourQuantity = [];
                YourSales = [];
                YourTotalQuantity = 0;
                YourTotalSales = 0;
                for (i in data.data) {
                    for (item in data.data[i]) {
                        YourQuantity.push(data.data[i][item][0]);
                        YourTotalQuantity += data.data[i][item][0];
                        YourSales.push(data.data[i][item][1]);
                        YourTotalSales += data.data[i][item][1];
                    }
                }
                TopAndOwn += 1;
                if (TopAndOwn == 2) {
                    SetDataCurrent(YourQuantity, Top1Quantity);
                    MountVue(columns);
                }
            }
        });
    }

    function SetDataCurrent(y1, y2) {

        let option3 = {

            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['我的', '行业Top1']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },

            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: Xaxis
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '我的',
                    type: 'line',
                    stack: '总量',
                    data: y1
                },
                {
                    name: '行业Top1',
                    type: 'line',
                    stack: '总量',
                    data: y2
                },
            ]
        };
        chart3.setOption(option3);
        chart3.hideLoading();
    }

    var columns = new Vue({
        el: "#total_static",
        data: {
            activedCol: 0,
            static: [
                {
                    column: "销售量",
                    tablename: "Quantity",
                    num: "--",
                    rate_top1: "--%",
                    up1: "fa fa-double-angle-up",
                    class: "actived"
                },
                {
                    column: "支付金额",
                    tablename: "Sales",
                    num: "--",
                    rate_top1: "--",
                    up1: "fa fa-double-angle-up",
                    class: "deactived"
                },
                {
                    TBD: true,
                    /*
                    column: "支付金额",
                    tablename: "Sales",
                    num: "--",
                    rate_top1: "--",
                    up1: "fa fa-double-angle-up",
                    class: "deactived"
                    */
                },
                {
                    TBD: true,
                    /*
                    column: "支付金额",
                    tablename: "Sales",
                    num: "--",
                    rate_top1: "--",
                    up1: "fa fa-double-angle-up",
                    class: "deactived"
                    */
                },
                {
                    TBD: true,
                    /*
                    column: "支付金额",
                    tablename: "Sales",
                    num: "--",
                    rate_top1: "--",
                    up1: "fa fa-double-angle-up",
                    class: "deactived"
                    */
                },
                {
                    TBD: true,
                    /*
                    column: "支付金额",
                    tablename: "Sales",
                    num: "--",
                    rate_top1: "--",
                    up1: "fa fa-double-angle-up",
                    class: "deactived"
                    */
                },
            ]
        },
        computed: {
            DateRange() {
                return dateRange.Range;
            }
        },
        watch: {
            DateRange: function () {
                if (TopAndOwn == 2) {
                    let scale = ""
                    if (Datediff(this.DateRange[0], this.DateRange[1]) < 0) {
                        alert("日期选择错误");
                        return -1;
                    //} else if (Datediff(this.DateRange[0], this.DateRange[1]) == 1) {
                    //    scale = "hour";
                    } else if (Datediff(this.DateRange[0], this.DateRange[1]) < 21) {
                        scale = "day";
                    } else if (Datediff(this.DateRange[0], this.DateRange[1]) < 90) {
                        scale = "week";
                    } else if (Datediff(this.DateRange[0], this.DateRange[1]) < 731) {
                        scale = "month";
                    } else {
                        scale = "year";
                    }

                    chart3.showLoading({
                        text: "Loading...",
                        maskColor: "#f7f7f7"
                    });
                    if (scale != "") {
                        FetchData(this.DateRange, scale);
                        MountVue(columns);
                    }
                } else {
                    alert("操作过多，请稍后再试...")
                }
            }
        },
        methods: {
            update(index) {
                let that = this
                if (TopAndOwn == 2) {
                    this.static[activedCol].class = "deactived";
                    this.static[index].class = "actived";
                    activedCol = index;
                    that.activedCol = index;
                    switch (this.static[activedCol].tablename) {
                        case "Quantity": {
                            chart3.setOption({
                                series: [
                                    {
                                        name: '我的',
                                        data: YourQuantity
                                    },
                                    {
                                        name: TargetName,
                                        data: Top1Quantity
                                    },
                                ]
                            });
                            break;
                        }
                        case "Sales": {
                            chart3.setOption({
                                series: [
                                    {
                                        name: '我的',
                                        data: YourSales
                                    },
                                    {
                                        name: TargetName,
                                        data: Top1Sales
                                    },
                                ]
                            });
                            break;
                        }
                    }
                    commandlist.push(["viewChart", this.static[index].tablename])
                } else {
                    alert("数据载入中，请稍候...")
                }
            },
            HoverOver:function(context){
                Queues.Hover.Over(context)                       
            },
            HoverOut: function(context){
                Queues.Hover.Out(context)
            }
        },
    });

    FetchData(dateRange.Range, "year");
    //MountVue(columns);
}

{ //行业排行
    let SubRank = new Vue({
        el: "#shop_index",
        data: {
            Ranks: [
                {
                    RankTitle: "店铺",
                    RankCol: {
                        Col1: "店铺",
                        Col2: "交易指数",
                    },
                    RankList: [
                        {
                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺1",
                            Col2: "100"
                        },
                        {

                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺2",
                            Col2: "99"
                        },
                        {

                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺3",
                            Col2: "98"
                        },
                        {
                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺4",
                            Col2: "97"
                        }
                    ]
                },
                {
                    RankTitle: "商品",
                    RankCol: {
                        Col1: "商品",
                        Col2: "交易指数",
                    },
                    RankList: [
                        {
                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺1",
                            Col2: "100"
                        },
                        {

                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺2",
                            Col2: "99"
                        },
                        {

                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺3",
                            Col2: "98"
                        },
                        {
                            img: "vendors/js/jqfloat/bg.jpg",
                            Col1: "店铺4",
                            Col2: "97"
                        }
                    ]
                },
                {
                    RankTitle: "关键字",
                    RankCol: {
                        Col1: "关键字",
                        Col2: "热度",
                    },
                    RankList: [
                        {
                            Col1: "店铺1",
                            Col2: "100"
                        },
                        {

                            Col1: "店铺2",
                            Col2: "99"
                        },
                        {

                            Col1: "店铺3",
                            Col2: "98"
                        },
                        {
                            Col1: "店铺4",
                            Col2: "97"
                        }
                    ]
                },
            ]
        },
        methods:{
            HoverOver:function(context){
                Queues.Hover.Over(context)                       
            },
            HoverOut: function(context){
                Queues.Hover.Out(context)
            }
        }
    })
}