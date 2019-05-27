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

// Add a group element for each dimension.
var g = svgParallel.selectAll(".dimension")
    .data(dimensions) // fix later
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .call(d3.behavior.drag()
    .origin(function(d) { return {x: x(d)}; })
    .on("dragstart", function(d) {
        dragging[d] = x(d);
        background.attr("visibility", "hidden");
    })
    .on("drag", function(d) {
        dragging[d] = Math.min(width, Math.max(0, d3.event.x));
        foreground.attr("d", path);
        dimensions.sort(function(a, b) { return position(a) - position(b); });
        x.domain(dimensions);
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
    })
    .on("dragend", function(d) {
        delete dragging[d];
        transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
        transition(foreground).attr("d", path);
        background
            .attr("d", path)
        .transition()
            .delay(500)
            .duration(0)
            .attr("visibility", null);
    }));