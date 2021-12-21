// function h(data) {
//     console.log(data);
//     var id = $(data).attr("id");
//     var idnum = id.split("like");
//     var messageID = idnum[1];
//     $(this).css("background-position", "");
//     var D = $(data).attr("rel");
//
//     if (D === 'like') {
//         $(this).addClass("heartAnimation").attr("rel", "unlike");
//         $("#commuse" + messageID).empty();
//         $("#commuse" + messageID).append("已收藏");
//     }
//     else {
//         $(this).removeClass("heartAnimation").attr("rel", "like");
//         $(this).css("background-position", "left");
//         $("#commuse" + messageID).empty();
//         $("#commuse" + messageID).append("收藏");
//     }
// };

function k(data) {
    // console.log(data);
    var id = $(data).attr("id");
    var idnum = id.split("Tid");
    var index = parseInt(idnum[1]);
    $(data).css("background-position", "");
    var D = $(data).attr("rel");

    if (D === 'unlike') {
        console.log(index);
        // vm1.$nextTick(function () {
        // $(data).addClass("heartAnimation").attr("rel", "like");
        // });
        var da = vm1.$data.lists[index];
        var set = {
            tablename: da.tablename,
            "iscommon": "true"
        };
        var update = JSON.stringify(set);
        $.ajax({
            // url: './vendors/json/list.json',
            url: 'http://10.141.223.30:8083/api/index/update',
            type: 'post',
            data: update,
            dataType: "json",
            contentType: "application/json"
        });
        vm1.$data.lists[index].iscommon = "true";
        vm1.$data.lists.unshift(vm1.$data.lists[index]);
        console.log(index + 1);
        vm1.$data.lists.splice(index + 1,1);
}
    else {
        // vm1.$nextTick(function () {
        //     $(data).removeClass("heartAnimation").attr("rel", "unlike");
        // });
        var da = vm1.$data.lists[index];
        var set = {
            tablename: da.tablename,
            "iscommon": "false"
        };
        var update = JSON.stringify(set);
        $.ajax({
            // url: './vendors/json/list.json',
            url: 'http://10.141.223.30:8083/api/index/update',
            type: 'post',
            data: update,
            dataType: "json",
            contentType: "application/json"
        });
        vm1.$data.lists[index].iscommon = "false";
        // var len = vm1.$data.lists.length;
        // vm1.$data.lists.splice(len, 0, vm1.$data.lists[index]);
        vm1.$data.lists.push(vm1.$data.lists[index]);
        vm1.$data.lists.splice(index, 1);
    }
};
