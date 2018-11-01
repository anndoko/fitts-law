var testData = [
  { name: "Task 1", size: 10, distance: 160 },
  { name: "Task 2", size: 60, distance: 160 },
  { name: "Task 3", size: 150, distance: 160 },
  { name: "Task 4", size: 200, distance: 160 }
];

var testResults = [];

$(document).ready(function () {
  loadTest();
  loadData();
});

// ---------- Fitts Interaction -----
function loadTest() {
  var body = d3.select("#interaction")
  var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  var h = 300 - margin.top - margin.bottom
  var w = 800 - margin.left - margin.right

  var targetSetup = [
    { name: "target1", status: true},
    { name: "target2", status: false}
  ];

  var svgContainer = body.append("svg")
    .attr("height", h + margin.top + margin.bottom)
    .attr("width", w + margin.left + margin.right)

  var target1 = svgContainer.append("rect")
    .attr("id", "target1")
    .attr("x", w/2)
    .attr("y", 50)
    .attr("width", testData[0]["size"])
    .attr("height", 200)
    .attr("disabled", true)
    .attr("fill", "grey")

  var target2 = svgContainer.append("rect")
    .attr("id", "target2")
    .attr("x", w/2 + testData[0]["distance"])
    .attr("y", 50)
    .attr("width", testData[0]["size"])
    .attr("height", 200)
    .attr("disabled", false)
    .attr("fill", "red")

  curr_time = Date.now(); // Set the timer

  // Target 1 events
  target1.on("click", function(){

    // Stop and reset the timer
    if (d3.select("#target1").attr("disabled") == "false") {
      next_time = Date.now();
      move_time = next_time - curr_time;
      console.log("Click 1:", move_time);
      curr_time = Date.now();
    }

    // Switch button status and colors
    target1
      .attr("disabled", true)
      .attr("fill", "grey")
    target2
      .attr("disabled", false)
      .attr("fill", "red")

  });

  // Target 2 events
  target2.on("click", function(){

    // Stop and reset the timer
    if (d3.select("#target2").attr("disabled") == "false") {
      next_time = Date.now();
      move_time = next_time - curr_time;
      console.log("Click 2:", move_time);
      curr_time = Date.now();
    }

    // Switch button status and colors
    target2
      .attr("disabled", true)
      .attr("fill", "grey")
    target1
      .attr("disabled", false)
      .attr("fill", "red")

  });
}


// ---------- Fitts Visualization -----
function loadData() {
  d3.csv("data/experiments.csv", function(data){

    var body = d3.select("#data-vis")
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  	var h = 450 - margin.top - margin.bottom
  	var w = 800 - margin.left - margin.right

    var xScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(data,function (d) { return d.IndexofDifficulty1 })]),
      	d3.max([0, d3.max(data,function (d) { return d.IndexofDifficulty1 })])
      	])
      .range([0,w])

    var yScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(data,function (d) { return d.Mean })]),
      	d3.max([0, d3.max(data,function (d) { return d.Mean })])
      	])
      .range([h, 0])

    var svg = body.append("svg")
      .attr("height", h + margin.top + margin.bottom)
      .attr("width", w + margin.left + margin.right)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")")

  	var xAxis = d3.svg.axis()
  	  .scale(xScale)
  	  .ticks(5)
  	  .orient("bottom");

  	var yAxis = d3.svg.axis()
  	  .scale(yScale)
  	  .ticks(5)
  	  .orient("left");

    var circles = svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .transition()
      .duration(2000)
      .each("start", function() {
        d3.select(this)
          .attr("fill", "red")
          .attr("r", 5);
      })
      .delay(function(d, i) {
        return i / data.length * 500;
      })
      .attr("cx",function (d) { return xScale(d.IndexofDifficulty1) })
      .attr("cy",function (d) { return yScale(d.Mean) })

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", w)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Index of Difficulty = Log(2*A/W)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Mean Movement Time (ms)");
  });


}
