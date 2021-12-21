// fly
$(document).ready(function() {
    $('.robot1').jqFloat({
        width: 15,
        height: 0,
        speed: 50
    });
    });
var once=true;
function panel() {
    document.getElementById('robot').className="robot2";
    if(once){
        $('.robot1').jqFloat('stop');
        $('.robot2').jqFloat({
            width: 50,
            height: 100,
            speed: 1500
        });
    };
        jsPanel.create({
            container:'body',
            header: 'auto-show-hide',
            contentSize: {
                width: function() { return Math.min(630, window.innerWidth*0.9);},
                height: function() { return Math.min(300, window.innerHeight*0.5);}
            },
            headerTitle: '   ',
            headerLogo: "images/robot1.png",
            theme: 'dark',
            animateIn:   'animated fadeInDown',
            position: 'right-top 0 15%',
            // position: 'right-bottom',
            content: robot1,
            onwindowresize: true
        });
        once=false;
    }

function robot1() {
    $(this.content).load('recommend_dataset.html', function () {
    });
}