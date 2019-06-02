
var solutions = d3.csv("./data/solution_harvest_p.csv")
var xp,
    yp = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(), // fix it later 
    background,
    foreground;

var svgParallel = d3.select("#parralel_chart").append("svg")
    .attr("width", width + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // Extract the list of dimensions and create a scale for each.
// xp.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
//   return d != "name" && (y[d] = d3.scale.linear()
//       .domain(d3.extent(cars, function(p) { return +p[d]; }))
//       .range([height, 0]));
// }));    
plotParallelGraph();
// For each dimension, I build a linear scale. I store all in a y object
function plotParallelGraph() {
  solutions.then(function(data) {
    var dimensions = d3.keys(data[0]).filter(d => (d != "idd" && d != 'type'));
    subData = data.filter(d => d.type === stocha_ws);
    // subsetData = subData;
    // console.log('I am not here', subData);
    for (i in dimensions) {
      name = dimensions[i];
      yp[name] = d3.scaleLinear()
        .domain( d3.extent(subData, function(d) { 
          return +d[name]; }) )
        .range([height, 0]);
    }
    // Build the X scale -> it find the best position for each Y axis
    xp = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(dimensions);
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(dimensions.map(function(p) { 
        return [xp(p), yp[p](d[p])]; 
      }));
    }
    // Draw the lines
    svgParallel
      .selectAll("myPath")
      .data(subData)
      .enter().append("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)
  
    // Draw the axis:
    svgParallel.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter()
      .append("g")
      // I translate this element to its right position on the x axis
      .attr("transform", function(d) { return "translate(" + xp(d) + ")"; })
      // And I build the axis with the call function
      .each(function(d) { 
        d3.select(this)
        .call(d3.axisLeft()
          .scale(yp[d]).ticks(6)); })
      // Add axis title
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return 'Scenario ' +d; })
        .style("fill", "black")
  });
  
}






// Add grey background lines for context.
// var background = svgParallel.append("g")
//     .attr("class", "background")
//     .selectAll("path")
//     .data(subsetData)
//     .join().append("path")
//     .attr("d", path);

// Add blue foreground lines for focus.
// var foreground = svgParallel.append("g")
//     .attr("class", "foreground")
//     .selectAll("path")
//     .data(subsetData)
//     .enter().append("path")
//     .attr("d", path);

// Add a group element for each dimension.
// var gp = svgParallel.selectAll(".dimension")
//     .data(keysScen) // fix later
//     .enter().append("g")
//     .attr("class", "dimension")
//     .attr("transform", function(d) { return "translate(" + xp(d) + ")"; });
//     // .call(d3.behavior.drag()
    // .origin(function(d) { return {x: xp(d)}; })
    // // .on("dragstart", function(d) {
    //     dragging[d] = x(d);
    //     // background.attr("visibility", "hidden");
    // })
    // .on("drag", function(d) {
    //     dragging[d] = Math.min(width, Math.max(0, d3.event.x));
    //     // foreground.attr("d", path);
    //     dimensions.sort(function(a, b) { return position(a) - position(b); });
    //     x.domain(dimensions);
    //     g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
    // })
    // .on("dragend", function(d) {
    //     delete dragging[d];
    //     transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
    //     transition(foreground).attr("d", path);
    //     // background
    //     //     .attr("d", path)
    //     // .transition()
    //     //     .delay(500)
    //     //     .duration(0)
    //     //     .attr("visibility", null);
    // }));