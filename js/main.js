var height = 2*$(window).height()/3, width = $(window).width()/2;

var margin = {top: 20, right: 80, bottom: 30, left: 50};
var projection = d3.geoMercator()
    .scale(400000)
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

// var color = d3.scaleOrdinal(d3.schemeCategory10);
var color = d3.scaleOrdinal()
	.domain([0, 1, 2, 3, 4, 5])
	.range(d3.schemeCategory10)
var dropdown_options = [{"text":"1"}, {"text":"65"}, {"text":"129"}, {"text":"193"},
                        {"text":"257"}, {"text":"321"}, {"text":"385"}, {"text":"449"}];


var legendText = ["0", "1", "2", "3", "4", "5"];
var legend = d3.select("#map").append("svg")
    .attr("class", "legend")
    .attr("width", 140)
    .attr("height", 200)
    .style("position", "absolute")
    .style("top", "50px")
    .style("right", "50px")
    .selectAll("g")
    .data(color.domain().slice())
    .enter()
    .append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .data(legendText)
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function(d){
        if (d === "0") return "Do nothing";
        return "Period " + d;
    });

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
    // .filter(d => d.properties.scenario === selected_scenario)
    .append("path")
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", d => color(d.properties.harvest))
    .attr("d", path)
    // .attr("data-legend", d => d.properties.harvest)
    .on("mouseover", function(d) {
        d3.select(this).style("opacity", 0.6)
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Period: " + d.properties.harvest + 
            "<br>Scenario: " + d.properties.scenario +
            "<br>Area (ac): " + d3.format("(.2f")(d.properties.AREAAC))
            .style("left", (d3.event.pageX - $(window).width()/2 - 50) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
    })
    .on("mouseout", function(d) {
        d3.select(this).style("opacity", 1)
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    // .exit().remove();
}