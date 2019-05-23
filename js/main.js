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
    .attr("height", height+50);

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


var newMap = function(data, selected_scenario) {
    subData = data.features.filter(d => d.properties.scenario === selected_scenario);

   var parcel =  g.selectAll("path")
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
            .attr("fill", d => color(d.period))
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


d3.selectAll('input[name="scenario_type"]').on("change", function() {
    var type = d3.select('input[name="scenario_type"]:checked').node().value;
    volumes.then(function(data) {
        clearChart()
        if (type === "allSenario") {
            plotAllScenarios(data);
        } else {
            plotVolume(data);
        }
    });
    var scen_type = d3.select("#scen_div");
    scen_type.classed("hidden", !scen_type.classed("hidden"));
    
}); 

//========================================================================
// This is for the slider Step
// using clamp here to avoid slider exceeding the range limits
var range = [1, 449];
var xScale = d3.scaleLinear()
.domain(range)
.range([0, width - margin.left - margin.right])
.clamp(true);
// array useful for step sliders
var step = 64;
var rangeValues = d3.range(range[0], range[1], step || 1).concat(range[1]);
var sliderXAxis = d3.axisBottom(xScale).tickValues(rangeValues).tickFormat(function (d) {
    return d;
});
var scen_data = [1, 65, 129, 193, 257,321, 385, 449]
var sliderSimple = d3
.sliderBottom()
.min(d3.min(scen_data))
.max(d3.max(scen_data))
.width(width/2)
.step(64)
// .tickFormat(d3.format('.2%'))
.tickValues(scen_data)
.default(1)
.on('onchange', val => {
    selected_scenario = val.toString();
    forest.then(function(data) {
        newMap(data, selected_scenario);
    });
    volumes.then(function(data) {
        plotVolume(data);
    });
});

var gSimple = d3
    .select('#slider-simple')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

gSimple.call(sliderSimple);

function plotAllScenarios(data) {
    
    x0 = d3.scaleBand()
        .domain(data.map(d => d.period))
        .rangeRound([0, width/2])
        .paddingInner(0.1);

    keys = scen_data.map(String);
    grp = [1, 2, 3, 4, 5]
    
    x1 = d3.scaleBand()
        .domain(keys)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05)
    
    y.domain([0, d3.max(data, function(d) { return d.value; })]);


    colors = d3.scaleOrdinal()
        .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099",
             "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", 
             "#994499", "#22aa99"])
    
    var svg = d3.select("#chart svg");
    chart.append("g")
    .attr("opacity", 0)
    .selectAll("g")
    .data(data)
    .join("g")
        .attr("transform", d => `translate(${x0(d.period)},0)`)
    .selectAll("rect")
    .data(function(d) {
       dt = grp.map(key => ({key:d.scenaros, val: d.value}));
    //    dt = {key:d.scenaros, val:d.value};
    //    console.log(dt);
       return dt;
    })
    .join("rect")
        .attr("class", "bar")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.val))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.val))
      .attr("fill", d => colors(d.key))
      .on("mouseover", function(d) {
        d3.select(this).style("opacity", 0.6)
        tooltipChart.transition()
            .duration(200)
            .style("opacity", .9);
        tooltipChart.html(d3.format("(.2f")(d.val))
            .style("left", (d3.event.pageX ) + "px")
            .style("top", (d3.event.pageY + 10) + "px");
    })
    .on("mouseout", function(d) {
        d3.select(this).style("opacity", 1)
        tooltipChart.transition()
            .duration(50)
            .style("opacity", 0);
    });

    chart.selectAll("g").transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .delay(function(d,i){ return  500 + 1000 * i; })
        .style("opacity","1");

    // update x-axis
    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
            .attr("font-weight", "bold");
    // add the y Axis
    chart.append("g")
        .call(d3.axisLeft(y))
            .attr("font-weight", "bold");

      //Legend
    var legend = svg.selectAll(".legend")
        .data(colors.domain().slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","0");

        legend.append("rect")
        .attr("x", width/2+margin.left)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return colors(d); });

        legend.append("text")
        .attr("x", width/2 +margin.left-2)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

        legend.transition().duration(500).delay(function(d,i){ return  100 * i; }).style("opacity","1");
    
}

function clearChart() {
    chart.selectAll("rect")
    .transition()
    .duration(1000)
    .ease(d3.easeCircle)
    .attr("x", 300)
    .remove() ;
    chart.selectAll("g").remove();
    d3.selectAll("#chart .legend").remove();
}


// .attr("x", d => x(d.period))
// .attr("y", d => y(d.value))
// .attr("fill", d => color(d.period))
// .attr("height", d => height - y(d.value))
// .attr("width", x.bandwidth())
// .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; })