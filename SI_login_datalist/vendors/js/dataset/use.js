var tablename;

function use(element){
    console.log(element);
    table=element.getElementsByTagName('h2')[0].innerHTML;
    console.log(table);
    var url='./databoarddemo.html'+'?tableName='+table;
    talename = table;
    window.location.href = url;
};
