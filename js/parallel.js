// var margin = {top: 30, right: 10, bottom: 10, left: 10},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(), // fix it later 
    background,
    foreground;

var svgParallel = d3.select("parralel_chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add grey background lines for context.
var background = svgParallel.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(cars)
    .enter().append("path")
    .attr("d", path);

// Add blue foreground lines for focus.
var foreground = svgParallel.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(cars)
    .enter().append("path")
    .attr("d", path);