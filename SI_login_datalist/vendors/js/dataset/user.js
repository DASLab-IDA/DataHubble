$(function(){
    var username=$.cookie('username');
    var category=$.cookie('category');
    $("#user1").append(username);
    $("#user2").append(username);
    $("#user3").append(username);
    $(".heading").append(username);
    if(username=="user1"){
        $("#adress").append(" ShangHai, China")
        $("#sell_adress").append("www.sell_adress1.com")
    }
    if(username=="user2"){
        $("#adress").append("Beijing, China")
        $("#sell_adress").append("www.sell_adress2.com")
    }

    var labels = category.split("&");
    // console.log(labels[0]);
    var str = '';
    for (var i = 0; i < labels.length; i++) {
        str += "<span class=\"label label-info\" style='margin-left: 5px' >" + labels[i] + "</span>";
    }
        // console.log("str=" + str);
        $("#labels").empty();
        // console.log($("#Lid" + index));
        $("#labels").html(str);

        if(username=="user1"){

            // Progressbar
            if ($(".progress .progress-bar")[0]) {
                $('.progress .progress-bar').progressbar();
            }
            // /Progressbar

            function init_daterangepicker() {

                if( typeof ($.fn.daterangepicker) === 'undefined'){ return; }
                console.log('init_daterangepicker');

                var cb = function(start, end, label) {
                    console.log(start.toISOString(), end.toISOString(), label);
                    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                };

                var optionSet1 = {
                    startDate: moment().subtract(7, 'days'),
                    endDate: moment(),
                    minDate: '01/01/2012',
                    maxDate: '12/31/2015',
                    dateLimit: {
                        days: 60
                    },
                    showDropdowns: true,
                    showWeekNumbers: true,
                    timePicker: false,
                    timePickerIncrement: 1,
                    timePicker12Hour: true,
                    ranges: {
                        'Today': [moment(), moment()],
                        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    opens: 'left',
                    buttonClasses: ['btn btn-default'],
                    applyClass: 'btn-small btn-primary',
                    cancelClass: 'btn-small',
                    format: 'MM/DD/YYYY',
                    separator: ' to ',
                    locale: {
                        applyLabel: 'Submit',
                        cancelLabel: 'Clear',
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom',
                        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    }
                };

                $('#reportrange span').html(moment().subtract(7, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
                $('#reportrange').daterangepicker(optionSet1, cb);
                $('#reportrange').on('show.daterangepicker', function() {
                    console.log("show event fired");
                });
                $('#reportrange').on('hide.daterangepicker', function() {
                    console.log("hide event fired");
                });
                $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
                    console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
                });
                $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
                    console.log("cancel event fired");
                });
                $('#options1').click(function() {
                    $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
                });
                $('#options2').click(function() {
                    $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
                });
                $('#destroy').click(function() {
                    $('#reportrange').data('daterangepicker').remove();
                });

            }

            function init_morris_charts() {
                "undefined" != typeof Morris && (console.log("init_morris_charts"), $("#graph_bar").length && Morris.Bar({
                    element: "graph_bar",
                    data: [
                        {device: moment().subtract(7, "days").format("MM/DD/YYYY"), num: 180},
                        {device: moment().subtract(6, "days").format("MM/DD/YYYY"), num: 255},
                        {device: moment().subtract(5, "days").format("MM/DD/YYYY"), num: 375},
                        {device: moment().subtract(4, "days").format("MM/DD/YYYY"), num: 571},
                        {device: moment().subtract(3, "days").format("MM/DD/YYYY"), num: 1055},
                        {device: moment().subtract(2, "days").format("MM/DD/YYYY"), num: 1554},
                        {device: moment().subtract(1, "days").format("MM/DD/YYYY"), num: 2144},
                        {device: moment().format("MM/DD/YYYY"), num: 2371},
                    ],
                    xkey: "device",
                    ykeys: ["num"],
                    labels: ["num"],
                    barRatio: .4,
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    xLabelAngle: 35,
                    hideHover: "auto",
                    resize: !0
                }), $("#graph_bar_group").length && Morris.Bar({
                    element: "graph_bar_group",
                    data: [{period: "2016-10-01", licensed: 807, sorned: 660}, {
                        period: "2016-09-30",
                        licensed: 1251,
                        sorned: 729
                    }, {period: "2016-09-29", licensed: 1769, sorned: 1018}, {
                        period: "2016-09-20",
                        licensed: 2246,
                        sorned: 1461
                    }, {period: "2016-09-19", licensed: 2657, sorned: 1967}, {
                        period: "2016-09-18",
                        licensed: 3148,
                        sorned: 2627
                    }, {period: "2016-09-17", licensed: 3471, sorned: 3740}, {
                        period: "2016-09-16",
                        licensed: 2871,
                        sorned: 2216
                    }, {period: "2016-09-15", licensed: 2401, sorned: 1656}, {period: "2016-09-10", licensed: 2115, sorned: 1022}],
                    xkey: "period",
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    ykeys: ["licensed", "sorned"],
                    labels: ["Licensed", "SORN"],
                    hideHover: "auto",
                    xLabelAngle: 60,
                    resize: !0
                }), $("#graphx").length && Morris.Bar({
                    element: "graphx",
                    data: [{x: "2015 Q1", y: 2, z: 3, a: 4}, {x: "2015 Q2", y: 3, z: 5, a: 6}, {
                        x: "2015 Q3",
                        y: 4,
                        z: 3,
                        a: 2
                    }, {x: "2015 Q4", y: 2, z: 4, a: 5}],
                    xkey: "x",
                    ykeys: ["y", "z", "a"],
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    hideHover: "auto",
                    labels: ["Y", "Z", "A"],
                    resize: !0
                }).on("click", function (a, b) {
                    console.log(a, b)
                }), $("#graph_area").length && Morris.Area({
                    element: "graph_area",
                    data: [{period: "2014 Q1", iphone: 2666, ipad: null, itouch: 2647}, {
                        period: "2014 Q2",
                        iphone: 2778,
                        ipad: 2294,
                        itouch: 2441
                    }, {period: "2014 Q3", iphone: 4912, ipad: 1969, itouch: 2501}, {
                        period: "2014 Q4",
                        iphone: 3767,
                        ipad: 3597,
                        itouch: 5689
                    }, {period: "2015 Q1", iphone: 6810, ipad: 1914, itouch: 2293}, {
                        period: "2015 Q2",
                        iphone: 5670,
                        ipad: 4293,
                        itouch: 1881
                    }, {period: "2015 Q3", iphone: 4820, ipad: 3795, itouch: 1588}, {
                        period: "2015 Q4",
                        iphone: 15073,
                        ipad: 5967,
                        itouch: 5175
                    }, {period: "2016 Q1", iphone: 10687, ipad: 4460, itouch: 2028}, {
                        period: "2016 Q2",
                        iphone: 8432,
                        ipad: 5713,
                        itouch: 1791
                    }],
                    xkey: "period",
                    ykeys: ["iphone", "ipad", "itouch"],
                    lineColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    labels: ["iPhone", "iPad", "iPod Touch"],
                    pointSize: 2,
                    hideHover: "auto",
                    resize: !0
                }), $("#graph_donut").length && Morris.Donut({
                    element: "graph_donut",
                    data: [{label: "Jam", value: 25}, {label: "Frosted", value: 40}, {label: "Custard", value: 25}, {
                        label: "Sugar",
                        value: 10
                    }],
                    colors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    formatter: function (a) {
                        return a + "%"
                    },
                    resize: !0
                }), $("#graph_line").length && (Morris.Line({
                    element: "graph_line",
                    xkey: "year",
                    ykeys: ["value"],
                    labels: ["Value"],
                    hideHover: "auto",
                    lineColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    data: [{year: "2012", value: 20}, {year: "2013", value: 10}, {year: "2014", value: 5}, {
                        year: "2015",
                        value: 5
                    }, {year: "2016", value: 20}],
                    resize: !0
                }), $MENU_TOGGLE.on("click", function () {
                    $(window).resize()
                })))
            }

            init_morris_charts();
            init_daterangepicker();

        }
        else {

            // Progressbar
            if ($(".progress .progress-bar")[0]) {
                $('.progress .progress-bar').progressbar();
            }
            // /Progressbar

            function init_daterangepicker() {

                if( typeof ($.fn.daterangepicker) === 'undefined'){ return; }
                console.log('init_daterangepicker');

                var cb = function(start, end, label) {
                    console.log(start.toISOString(), end.toISOString(), label);
                    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                };

                var optionSet1 = {
                    startDate: moment().subtract(7, 'days'),
                    endDate: moment(),
                    minDate: '01/01/2012',
                    maxDate: '12/31/2015',
                    dateLimit: {
                        days: 60
                    },
                    showDropdowns: true,
                    showWeekNumbers: true,
                    timePicker: false,
                    timePickerIncrement: 1,
                    timePicker12Hour: true,
                    ranges: {
                        'Today': [moment(), moment()],
                        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    opens: 'left',
                    buttonClasses: ['btn btn-default'],
                    applyClass: 'btn-small btn-primary',
                    cancelClass: 'btn-small',
                    format: 'MM/DD/YYYY',
                    separator: ' to ',
                    locale: {
                        applyLabel: 'Submit',
                        cancelLabel: 'Clear',
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom',
                        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    }
                };

                $('#reportrange span').html(moment().subtract(7, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
                $('#reportrange').daterangepicker(optionSet1, cb);
                $('#reportrange').on('show.daterangepicker', function() {
                    console.log("show event fired");
                });
                $('#reportrange').on('hide.daterangepicker', function() {
                    console.log("hide event fired");
                });
                $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
                    console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
                });
                $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
                    console.log("cancel event fired");
                });
                $('#options1').click(function() {
                    $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
                });
                $('#options2').click(function() {
                    $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
                });
                $('#destroy').click(function() {
                    $('#reportrange').data('daterangepicker').remove();
                });

            }

            function init_morris_charts() {
                "undefined" != typeof Morris && (console.log("init_morris_charts"), $("#graph_bar").length && Morris.Bar({
                    element: "graph_bar",
                    data: [
                        {device: moment().subtract(7, "days").format("MM/DD/YYYY"), num: 2144},
                        {device: moment().subtract(6, "days").format("MM/DD/YYYY"), num: 1655},
                        {device: moment().subtract(5, "days").format("MM/DD/YYYY"), num: 1275},
                        {device: moment().subtract(4, "days").format("MM/DD/YYYY"), num: 971},
                        {device: moment().subtract(3, "days").format("MM/DD/YYYY"), num: 755},
                        {device: moment().subtract(2, "days").format("MM/DD/YYYY"), num: 5154},
                        {device: moment().subtract(1, "days").format("MM/DD/YYYY"), num: 144},
                        {device: moment().format("MM/DD/YYYY"), num: 2371},
                    ],
                    xkey: "device",
                    ykeys: ["num"],
                    labels: ["num"],
                    barRatio: .4,
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    xLabelAngle: 35,
                    hideHover: "auto",
                    resize: !0
                }), $("#graph_bar_group").length && Morris.Bar({
                    element: "graph_bar_group",
                    data: [{period: "2016-10-01", licensed: 807, sorned: 660}, {
                        period: "2016-09-30",
                        licensed: 1251,
                        sorned: 729
                    }, {period: "2016-09-29", licensed: 1769, sorned: 1018}, {
                        period: "2016-09-20",
                        licensed: 2246,
                        sorned: 1461
                    }, {period: "2016-09-19", licensed: 2657, sorned: 1967}, {
                        period: "2016-09-18",
                        licensed: 3148,
                        sorned: 2627
                    }, {period: "2016-09-17", licensed: 3471, sorned: 3740}, {
                        period: "2016-09-16",
                        licensed: 2871,
                        sorned: 2216
                    }, {period: "2016-09-15", licensed: 2401, sorned: 1656}, {period: "2016-09-10", licensed: 2115, sorned: 1022}],
                    xkey: "period",
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    ykeys: ["licensed", "sorned"],
                    labels: ["Licensed", "SORN"],
                    hideHover: "auto",
                    xLabelAngle: 60,
                    resize: !0
                }), $("#graphx").length && Morris.Bar({
                    element: "graphx",
                    data: [{x: "2015 Q1", y: 2, z: 3, a: 4}, {x: "2015 Q2", y: 3, z: 5, a: 6}, {
                        x: "2015 Q3",
                        y: 4,
                        z: 3,
                        a: 2
                    }, {x: "2015 Q4", y: 2, z: 4, a: 5}],
                    xkey: "x",
                    ykeys: ["y", "z", "a"],
                    barColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    hideHover: "auto",
                    labels: ["Y", "Z", "A"],
                    resize: !0
                }).on("click", function (a, b) {
                    console.log(a, b)
                }), $("#graph_area").length && Morris.Area({
                    element: "graph_area",
                    data: [{period: "2014 Q1", iphone: 2666, ipad: null, itouch: 2647}, {
                        period: "2014 Q2",
                        iphone: 2778,
                        ipad: 2294,
                        itouch: 2441
                    }, {period: "2014 Q3", iphone: 4912, ipad: 1969, itouch: 2501}, {
                        period: "2014 Q4",
                        iphone: 3767,
                        ipad: 3597,
                        itouch: 5689
                    }, {period: "2015 Q1", iphone: 6810, ipad: 1914, itouch: 2293}, {
                        period: "2015 Q2",
                        iphone: 5670,
                        ipad: 4293,
                        itouch: 1881
                    }, {period: "2015 Q3", iphone: 4820, ipad: 3795, itouch: 1588}, {
                        period: "2015 Q4",
                        iphone: 15073,
                        ipad: 5967,
                        itouch: 5175
                    }, {period: "2016 Q1", iphone: 10687, ipad: 4460, itouch: 2028}, {
                        period: "2016 Q2",
                        iphone: 8432,
                        ipad: 5713,
                        itouch: 1791
                    }],
                    xkey: "period",
                    ykeys: ["iphone", "ipad", "itouch"],
                    lineColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    labels: ["iPhone", "iPad", "iPod Touch"],
                    pointSize: 2,
                    hideHover: "auto",
                    resize: !0
                }), $("#graph_donut").length && Morris.Donut({
                    element: "graph_donut",
                    data: [{label: "Jam", value: 25}, {label: "Frosted", value: 40}, {label: "Custard", value: 25}, {
                        label: "Sugar",
                        value: 10
                    }],
                    colors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    formatter: function (a) {
                        return a + "%"
                    },
                    resize: !0
                }), $("#graph_line").length && (Morris.Line({
                    element: "graph_line",
                    xkey: "year",
                    ykeys: ["value"],
                    labels: ["Value"],
                    hideHover: "auto",
                    lineColors: ["#26B99A", "#34495E", "#ACADAC", "#3498DB"],
                    data: [{year: "2012", value: 20}, {year: "2013", value: 10}, {year: "2014", value: 5}, {
                        year: "2015",
                        value: 5
                    }, {year: "2016", value: 20}],
                    resize: !0
                }), $MENU_TOGGLE.on("click", function () {
                    $(window).resize()
                })))
            }

            init_morris_charts();
            init_daterangepicker();

        }
});

