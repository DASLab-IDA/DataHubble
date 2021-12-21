//fold button function
var foldflag1=0;
var foldflag2=0;
function foldTableInfo(){

    if(foldflag1==0){
        document.getElementById('tableInfo').style.height="5%";
        document.getElementById('label').style.display="none";
        document.getElementById('createdAt').style.display="none";
        document.getElementById('updatedAt').style.display="none";
        document.getElementById('description').style.display="none";


        if(foldflag2 == 0){
            document.getElementById('dataBoard').style.height="82%";
        }else{
            document.getElementById('dataBoard').style.height="5%";
        };
        document.getElementById('foldButton1').setAttribute('class','fa fa-chevron-down');
        document.getElementById('foldButton1').style.top="-85%";

        foldflag1 = 1;
    }else{
        document.getElementById('tableInfo').style.height="20%";
        document.getElementById('label').style.display="block";
        document.getElementById('createdAt').style.display="block";
        document.getElementById('updatedAt').style.display="block";
        document.getElementById('description').style.display="block";

        if(foldflag2 == 0){
        document.getElementById('dataBoard').style.height="67%";
        }else{
        document.getElementById('dataBoard').style.height="5%";
        };
        document.getElementById('foldButton1').setAttribute('class','fa fa-chevron-up');
        document.getElementById('foldButton1').style.top="-21%";

        foldflag1 = 0;
    }//if&else
};

function foldDataBoard(){
    if (foldflag2==0){
        document.getElementById('dataBoard').style.height="5%";
        document.getElementById('tableOri').style.display="none";
        document.getElementById("tableOri_wrapper").style.display="none";
        document.getElementById('foldButton2').setAttribute('class','fa fa-chevron-down');

        foldflag2 = 1;
    }else{
        document.getElementById('dataBoard').style.height="67%";
        document.getElementById('tableOri').style.display="block";
        document.getElementById("tableOri_wrapper").style.display="block";
        document.getElementById('foldButton2').setAttribute('class','fa fa-chevron-up');

        foldflag2 = 0;
    };//if&else
}