var MaxContext = {"context":"", "count":0}
//机器人：sycm.js -> GuessQuestion
var Queues = new Vue({
    el: '#Queues',
    data:{
        Queue: [],
        Hover: null
    },
    methods: {
        SendQueue:function(context, count){
            let that = this;
            if(typeof context == "string"){
                that.Queue.push({"context": context, "count": count})
            } else {
                for(let i = 0; i < context.length;i++){
                    that.Queue.push({"context": context[i], "count": count})
                }
            }
            that.GetRecommendation(that.Queue)
        },
        GetRecommendation(Queue){
            $.ajax({
                type: "POST",
                url: "http://10.176.24.40:8083/api/user/interest",//155
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify({
                    username:"user1",
                    useractive:Queue
                }),
                success: function (data) {
                    GuessQuestion.interests[0].Title = Queue[Queue.length-1].context;
                    GuessQuestion.interests[1].Title = MaxContext.context;
                    [GuessQuestion.interests[0].Show, GuessQuestion.interests[1].Show] = [data.recent_interest, data.most_interest] ;
                    GuessQuestion.interesting = true;
                },//success function
                error: function () {
        
                }
            });
            
        }
    },
});

var hover = function(interval, delay){
    this.interval = interval || this.interval;
    this.delay = delay || this.delay;
    this.timer = null
    this.counter = 0;
    this.sent = 0
};

hover.prototype.interval = 50;
hover.prototype.delay = 1000;
hover.prototype.Over = function(context){
    this.timer = setInterval(() => {
        this.counter+=this.interval;
        if(this.counter>=this.delay){
            if(this.sent == 0){
                this.sent = 1;
                if(MaxContext.context==""){
                    MaxContext.context = typeof context == "string" ? context : context[0];
                }
                Queues.SendQueue(context, this.delay)
            }            
        }
    }, this.interval);
}
hover.prototype.Out = function(context) {
    
    let temp = this.counter;
    this.counter = 0;
    clearInterval(this.timer);
    this.timer = null;
    this.sent = 0;
    //Queue.Add(this.title, this.counter)
    if(temp > MaxContext.count){
        MaxContext.context = typeof context == "string" ? context : context[0];
        MaxContext.count = temp;
    }
    if(temp >= this.delay){
        Queues.SendQueue(context, temp)
    }
    
}
let Hover = new hover;
Queues.Hover = new hover;
