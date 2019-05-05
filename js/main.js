var height = 500, width = 500;
var projection = d3.geoMercator()
    .scale(500000)
    .center([-79.055235, 41.3289])  // centers map at given coordinates
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select("#map").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

// var legend = d3.select("#map").append("svg")
//     .attr("class", "legend")
//    .attr("width", 140)
//   .attr("height", 200)
//      .selectAll("g")
//      .data(color.domain().slice().reverse())
//      .enter()
//      .append("g")
//    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// legend.append("rect")
// .attr("width", 18)
// .attr("height", 18)
// .style("fill", color);
'193', '257', '321', '385', '449'
var color = d3.scaleOrdinal(d3.schemeCategory10);
var dropdown_options = [{"text":"1"}, {"text":"65"}, {"text":"129"}, {"text":"193"},
                        {"text":"257"}, {"text":"321"}, {"text":"385"}, {"text":"449"}];
// populate drop-down
d3.select("#dropdown")
    .selectAll("option")
    .data(dropdown_options)
    .enter()
    .append("option")
    .attr("value", function(option) { return option.text; })
    .text(function(option) { return option.text; });


var g = svg.append("g")
    .call(d3.zoom()
            .scaleExtent([1,100])
            .on("zoom", zoomHandler)
    );
var selected_scenario = "1";

var forest = d3.json("./data/harvests1.json")
forest.then(function(data) {
    newMap(data);
});

function render() {
    forest.then(function(data) {
        newMap(data);
    });
} 

function zoomHandler() {
    var transform = d3.event.transform;
    g.attr("transform", "translate("
        + transform.x + "," + transform.y
        + ")scale(" + transform.k + ")");
}

var dropDown = d3.select("#dropdown");
dropDown.on("change", function() {
    d3.select("#dropdown")
        .property("checked", true);
    checked = true;
    selected_scenario = d3.event.target.value;
    render(selected_scenario);
    
});

function filterData(data, scenario) {
    filter_data = [];
    data.forEach(function(d) {
        if (d.properties.scenario === scenario) {
            filter_data.push(d);
        }
    })
    return filter_data;
}


var newMap = function(data) {
    subData = filterData(data.features, selected_scenario);
    // console.log(subData);
    g.selectAll("path")
    .exit().remove()
    .data(subData)
    .enter()
    .append("path")
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", d => color(d.properties.harvest))
    .attr("d", path)
    .on("mouseover", function(d) {
        d3.select(this).style("opacity", 0.6)
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Period: " + d.properties.harvest + 
            "<br>Scenario: " + d.properties.scenario)
            .style("left", (d3.event.pageX - $(window).width()/2) + "px")
            .style("top", (d3.event.pageY - 40) + "px");
    })
    .on("mouseout", function(d) {
        d3.select(this).style("opacity", 1)
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .exit().remove();
}