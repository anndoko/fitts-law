var reverse = false;

// Create testData using andomize size/distance
var testData = [];
var numTest = 10;
var wRange = 200;
var aRange = 200;
for (var num = 0; num < numTest; num++){
  var test = {}
  test["size"] = Math.floor(Math.random() * wRange);
  test["distance"] = Math.floor(Math.random() * wRange);
  testData.push(test);
}

var testResults = [];
var clicks = 0;
var i = 0;

$(document).ready(function () {
  loadTestData();
  loadExistingData();
});

// ---------- Fitts Interaction -----
function loadTestData() {
  // Load empty chart
  loadEmptyVis();

  // Draw the current experiment
  drawExp(i, reverse);

  // Reverse button event
  d3.select("#reverse").on("click", function(){
    reverseButtons(i);
  });
}

// Draw interactive buttons
function drawExp(i, reverse){
  // Basic setup
  var body = d3.select("#interaction")
  var margin = { top: 25, right: 25, bottom: 25, left: 25 }
  var height = 450 - margin.top - margin.bottom
  var width = d3.select("#interaction").style('width').slice(0, -2) - margin.left - margin.right

  // Test data
  var w = testData[i]["size"]
  var a = testData[i]["distance"]
  var testNum = Math.floor(testResults.length/10)

  var heading = body.append("h4")
    .html("Test " + (testNum + 1))
    .attr("class", "exp-heading");

  var info = body.append("div")
    .html("Size (w): " + w  + "px | Distance (a): " + a + "px")
    .attr("class", "exp-info");

  var svgContainer = body.append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)

  if(!reverse){
    var target1 = svgContainer.append("rect")
      .attr("id", "target1")
      .attr("x", (width + margin.left + margin.right)/2 - w - a/2)
      .attr("y", (height + margin.top + margin.bottom)/2 - 200/2)
      .attr("width", w)
      .attr("height", 200)
      .attr("disabled", true)
      .attr("fill", "#D8D8D8")

    var target2 = svgContainer.append("rect")
      .attr("id", "target2")
      .attr("x", (width + margin.left + margin.right)/2 - w - a/2 + w + a)
      .attr("y", (height + margin.top + margin.bottom)/2 - 200/2)
      .attr("width", w)
      .attr("height", 200)
      .attr("disabled", false)
      .attr("fill", "#4A90E2")

  } else {
    var target1 = svgContainer.append("rect")
      .attr("id", "target1")
      .attr("x", (width + margin.left + margin.right)/2 - 250/2)
      .attr("y", (height + margin.top + margin.bottom)/2 - a/2 - w)
      .attr("width", 250)
      .attr("height", w)
      .attr("disabled", true)
      .attr("fill", "#D8D8D8")

    var target2 = svgContainer.append("rect")
      .attr("id", "target2")
      .attr("x", (width + margin.left + margin.right)/2 - 250/2)
      .attr("y", (height + margin.top + margin.bottom)/2 - a/2 - w + w + a)
      .attr("width", 250)
      .attr("height", w)
      .attr("disabled", false)
      .attr("fill", "#4A90E2")
  }

  curr_time = Date.now(); // Set the timer

  target1.on("click", function(){
    // Stop and reset the timer
    if (d3.select("#target1").attr("disabled") == "false") {
      next_time = Date.now();
      saveResult(curr_time, next_time, a, w);
      curr_time = Date.now();
    }
    // Switch button status and colors
    target1
      .attr("disabled", true)
      .attr("fill", "#D8D8D8")
    target2
      .attr("disabled", false)
      .attr("fill", "#4A90E2")
  });

  target2.on("click", function(){
    // Stop and reset the timer
    if (d3.select("#target2").attr("disabled") == "false") {
      next_time = Date.now();
      saveResult(curr_time, next_time, a, w);
      curr_time = Date.now();
    }
    // Switch button status and colors
    target2
      .attr("disabled", true)
      .attr("fill", "#D8D8D8")
    target1
      .attr("disabled", false)
      .attr("fill", "#4A90E2")
  });
}

// Reverse buttons
function reverseButtons(i){
  reverse = !reverse;
  $("#interaction").empty();
  drawExp(i, reverse);
}

// Save the user's click
function saveResult(curr_time, next_time, a, w){
  // Store data in an array and push it to the testResults array
  var data = []
  var testID = Math.floor(testResults.length/10)
  data.push(testID, Math.log2(a/w + 1), next_time - curr_time);
  testResults.push(data);

  // Update the test data visualization
  loadVis();

  // Count clicks
  clicks++;

  // Update the experiment when reaching the required number of clicks
  if (clicks == 10 && (i < (testData.length - 1))){
    i++;
    $("#interaction").empty();
    drawExp(i, reverse);
    clicks = 0;
  }
}

// Visualiza testResults
function loadVis() {
    $("#result-vis").empty();
    var body = d3.select("#result-vis")
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  	var h = 300 - margin.top - margin.bottom
  	var w = d3.select("#result-vis").style('width').slice(0, -2) - margin.left - margin.right

    var xScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(testResults, function (d) { return d[1] })]),
      	d3.max([0, d3.max(testResults, function (d) { return d[1] })])
      	])
      .range([0,w])

    var yScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(testResults, function (d) { return d[2] })]),
      	d3.max([0, d3.max(testResults, function (d) { return d[2] })])
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

    var colors = [
      "#08AFD8",
      "#0036AD",
      "#28FFE2",
      "#90FF00",
      "#FF1654",
      "#32936F",
      "#FFBF00",
      "#FE3A56",
      "#FF7F00",
      "#2296A5"
    ];

    var circles = svg.selectAll("circle")
      .data(testResults)
      .enter()
      .append("circle")
      .transition()
      .duration(2000)
      .each("start", function() {
        d3.select(this)
          .attr("fill", function (d) {
            var index = d[0]
            return colors[index];
          })
          .attr("r", 5);
      })
      .delay(function(d, i) {
        return i / testResults.length * 500;
      })
      .attr("cx", function (d) { return xScale(d[1]) })
      .attr("cy", function (d) { return yScale(d[2]) })

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
        .text("Movement Time");
}

// Load empty scatter plot before the test starts
function loadEmptyVis() {
  var body = d3.select("#result-vis")
  var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  var h = 300 - margin.top - margin.bottom
  var w = d3.select("#result-vis").style('width').slice(0, -2) - margin.left - margin.right

  var svg = body.append("svg")
    .attr("height", h + margin.top + margin.bottom)
    .attr("width", w + margin.left + margin.right)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")

  var xScale = d3.scale.linear()
    .domain([0, 4])
    .range([0, w])

  var yScale = d3.scale.linear()
    .domain([0, 2000])
    .range([h, 0])

	var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .ticks(5)
	  .orient("bottom");

	var yAxis = d3.svg.axis()
	  .scale(yScale)
	  .ticks(5)
	  .orient("left");

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
        .text("Movement Time");
}

// ---------- Fitts Visualization -----
function loadExistingData() {
  d3.csv("data/experiments.csv", function(data){

    var body = d3.select("#data-vis")
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  	var h = 300 - margin.top - margin.bottom
  	var w = d3.select("#data-vis").style('width').slice(0, -2) - margin.left - margin.right

    var xScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(data, function (d) { return d.IndexofDifficulty2 })]),
      	d3.max([0, d3.max(data, function (d) { return d.IndexofDifficulty2 })])
      	])
      .range([0, w])

    var yScale = d3.scale.linear()
      .domain([
      	d3.min([0, d3.min(data, function (d) { return d.Mean })]),
      	d3.max([0, d3.max(data, function (d) { return d.Mean })])
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
          .attr("fill", "#4A90E2")
          .attr("r", 4);
      })
      .delay(function(d, i) {
        return i / data.length * 500;
      })
      .attr("cx", function (d) { return xScale(d.IndexofDifficulty2) })
      .attr("cy", function (d) { return yScale(d.Mean) })

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
        .text("Movement Time");
  });
}
