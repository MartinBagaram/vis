var height = 1*$(window).height()/2, width = $(window).width()/2;

var margin = {top: 30, right: 80, bottom: 50, left: 80};
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
var previousScenario = "0";

var forest = d3.json("./data/harvests1.json")
forest.then(function(data) {
    newMap(data, selected_scenario);
});

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
    forest.then(function(data) {
        newMap(data, selected_scenario);
    });
    volumes.then(function(data) {
        plotVolume(data);
    });
    
});

// function filterData(data, scenario) {
//     filter_data = [];
//     data.forEach(function(d) {
//         if (d.properties.scenario === scenario) {
//             filter_data.push(d);
//         }
//     })
//     return filter_data;
// }


var newMap = function(data, selected_scenario) {
    subData = data.features.filter(d => d.properties.scenario === selected_scenario);
    // g.selectAll("path")
    //     .data(subData)
    //     .exit().remove();

    console.log(selected_scenario, previousScenario)
   var parcel =  g.selectAll("path")
    // .exit().remove()
    .data(subData);
    parcel.enter()
    .append("path")
    .merge(parcel)
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
    });
    previousScenario = selected_scenario
    parcel.exit().remove();
}

var volumes = d3.csv("./data/volume_final.csv")
volumes.then(function(data) {
    plotVolume(data);
});

var x = d3.scaleBand()
    .range([0, width/2])
    .padding(0.1);
var y = d3.scaleLinear()
    .range([height, 0]);

var chart = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left +
            "," + margin.top + ")");

var tooltipChart = d3.select("#chart").append("div") 
    .attr("class", "tooltipChart")       
    .style("opacity", 0);      
    
function plotVolume(data) {
    // chart.selectAll("bar").exit().remove();
    // Scale the range of the data in the domains
    // subVolume = data.filter(d => d.scenario === selected_scenario);
    chart.selectAll("rect")
    .data(data.filter(d => d.scenario === selected_scenario))
    .exit().remove();

    x.domain(data.map(function(d) { return d.period; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);
    
            
    chart.selectAll("rect")
        // .exit().remove()
        .data(data.filter(d => d.scenaros === selected_scenario))
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.period))
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value))
            .attr("width", x.bandwidth())
            .on("mouseover", function(d) {
                d3.select(this).style("opacity", 0.6)
                tooltipChart.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipChart.html(d3.format("(.2f")(d.value))
                    .style("left", (d3.event.pageX ) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("opacity", 1)
                tooltipChart.transition()
                    .duration(50)
                    .style("opacity", 0);
            });
  
    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    // add the y Axis
    chart.append("g")
        .call(d3.axisLeft(y));

    // text on bars
    // chart.selectAll("text")
    //     .data(data.filter(d => d.scenario === selected_scenario))
    //     // .attr("class", "bar")
    //     .enter()
    //     .append("text")
    //     .text(d => d.value)
    //     .attr("text-anchor", "middle")
    //     .attr("x", function(d, i) {
    //         console.log(i * x.bandwidth());
    //         return i * x.bandwidth();
    //     })
    //     .attr("y", d => height/2 - y(d.value) + 10)
    //     // .attr("dy", ".75em")
    //     .attr("fill", "red");
    // // .attr("fill", "blue");
}

// Title
chart.append("text")
    .text('Volume Harvested per Period')
    .attr("text-anchor", "middle")
    .attr("class", "graph-title")
    .attr("y", -15)
    .attr("x", width / 4.0);


// text label for the x axis
chart.append("text")             
    .attr("transform",
        "translate(" + (width/4) + " ," + 
                        (height + margin.top + 10) + ")")
    .style("text-anchor", "middle")
    .text("Period");

// text label for the y axis
chart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Volume cubic meters"); 

