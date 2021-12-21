var log_id = parseInt((location.href.match(/logid=([^&]+)/)||[,""])[1]);
function datalineage() {
    //obatain log_id
    // let log_id=
    //ajax
    var data = {
        user_id: 1,
        log_id: log_id
    };
    data = JSON.stringify(data);
    $.ajax({
        url: "http://10.176.24.40:8083/api/data/datalineage",
        type: "POST",
        data: data,//这里是不是应该是userid？
        dataType: "json",
        contentType: "application/json",
        success:
            function (data, status) {
                if (status = 200) {
                    console.log(data);
                    var width = document.getElementById("tree").offsetWidth;
                    var height = document.getElementById("tree").offsetHeight;

                    var i = 0,
                        duration = 750,
                        root = {};

                     var tree = d3.layout.tree().size([height, width])
                    //var tree = d3.layout.tree().nodeSize([100, 30]) // 如果子节点太多重叠，可以用这个, nodeSize 会覆盖掉size 更改 g 的 transform y轴 height / 2
                    var diagonal = d3.svg.diagonal().projection(function (d) {
                        return [d.y, d.x];
                    });

                    //Redraw for zoom
                    function redraw() {
                        //console.log("here", d3.event.translate, d3.event.scale);
                        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                    }

                    var svg = d3.select("body").select("#tree").append("svg")
                        .call(zm = d3.behavior.zoom().scaleExtent([0.1, 100]).on("zoom", redraw))
                        .append("g")
                        .attr("transform", "translate(" + 52 + "," + 0 + ")");

                    //necessary so that zoom knows where to zoom and unzoom from
                    zm.translate([52, 0]);
                    root = data;
                    root.x0 = 0;
                    root.y0 = 0;

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            // for (let j =0 ; j <d.children.length-1 ; j++) {
                            //     collapse(d._children);
                            // }
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }

                    // for (let j = 0; j <root.children.length-1 ; j++) {
                    //     collapse(root.children)
                    // }
                    root.children.forEach(collapse);
                    update(root);

                    function update(source) {

                        // Compute the new tree layout.
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes);

                        // Normalize for fixed-depth.
                        nodes.forEach(function (d) {
                            d.y = d.depth * 380;
                        });

                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function (d) {
                                return d.id || (d.id = ++i);
                            });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .style("cursor", "pointer")
                            .attr("transform", function (d) {
                                return "translate(" + source.y0 + "," + source.y0 + ")";
                            })
                            .on("click", click);

                        nodeEnter.append("circle")
                            .attr("r", 1e-6)
                            .style("fill", function (d) {
                                return d._children ? "lightsteelblue" : "#fff";
                            });
                        //title
                        nodeEnter.append("text")
                            .attr("x", function (d) {
                                return d._children ? 0 : 0;
                                //return d._children ? 5 : 0;
                            })
                            .attr("y", function (d) {
                                //return 25
                                return d.children || d._children ? 20 : 20;
                                //return d.children || d._children ? 25 : 20;
                            })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function (d) {
                                if (d.name.length > 100) {
                                    return "end";
                                } else {
                                    return "middle";
                                }
                                //return d.children || d._children ? "end" : "start";
                            })
                            .text(function (d) {
                                return d.name
                            })
                            .style("fill-opacity", 1)
                            .style("font-size", "12px");
                        //subtitle
                        nodeEnter.append("text")
                            .attr("x", function (d) {
                                return d._children ? 0 : 0;
                                //return d._children ? 5 : 0;
                            })
                            .attr("y", function (d) {
                                //return 25
                                return d.children || d._children ? -20 : -20;
                                //return d.children || d._children ? 25 : 20;
                            })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function (d) {
                                return "middle";
                                //return d.children || d._children ? "end" : "start";
                            })
                            .text(function (d) {
                                if (d.rowcount) {
                                    return "数据集规模:" + d.rowcount+" 行"
                                }
                            })
                            .style("fill-opacity", 1)
                            .style("font-size", "12px");

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            });

                        nodeUpdate.select("circle")
                            .attr("r", 20)
                            .style("fill", function (d) {
                                return d._children ? "lightsteelblue" : "#fff";
                            });

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);

                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                                return "translate(" + source.y + "," + source.x + ")";
                            })
                            .remove();

                        nodeExit.select("circle")
                            .attr("r", 1e-6);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function (d) {
                                return d.target.id;
                            });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("d", function (d) {
                                var o = {x: source.x0, y: source.y0};
                                return diagonal({source: o, target: o});
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal)
                            .attr("class", function (d) {
                                // console.log(d)
                                if (d.source.deal != null && d.source.deal != undefined) {
                                    if (d.target.deal != null && d.target.deal != undefined) {
                                        return "link link2";
                                    }
                                }
                                return "link";
                            });

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function (d) {
                                var o = {x: source.x, y: source.y};
                                return diagonal({source: o, target: o});
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function (d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });
                    }

                    function getNode() {
                        var mynodes = null;
                        $.ajax({
                            url: "./node",
                            async: false, // 注意此处需要同步，因为返回完数据后，下面才能让结果的第一条selected
                            type: "POST",
                            dataType: "json",
                            success: function (data) {
                                mynodes = data;
                                console.log(mynodes);
                                //nodes = JSON.parse(nodes);
                            }
                        });
                        return mynodes;
                    }

                    // Toggle children on click.
                    function click(d) {
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else if (d._children) {
                            d.children = d._children;
                            d._children = null;
                        } else {
                            var mnodes = getNode();
                            d.children = mnodes.children;
                        }
                        update(d);
                    }
                }
            },
    });

    // d3.json("tree3.json", function (error, data) {


    //console.log(root)


    //});


}
