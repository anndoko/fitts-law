var reverse = false;
var testData = [
  { name: "Task 1", size: 10, distance: 160 },
  { name: "Task 2", size: 60, distance: 160 },
  { name: "Task 3", size: 150, distance: 160 },
  { name: "Task 4", size: 200, distance: 160 }
];
var testResults = [];
var clicks = 0;
var i = 0;
$(document).ready(function () {
  loadTestData();
  loadData();
});

// ---------- Fitts Interaction -----
function loadTestData() {
  // Draw the current experiment
  drawExp(i, reverse);
  // Reverse button event
  d3.select("#reverse").on("click", function(){
    reverseButtons(i);
  });
}

// Draw interactive buttons
function drawExp(i, reverse){
  var body = d3.select("#interaction")
  var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  var height = 300 - margin.top - margin.bottom
  var width = 800 - margin.left - margin.right

  var svgContainer = body.append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)

  console.log(i);
  var w = testData[i]["size"]
  var a = testData[i]["distance"]

  if(!reverse){
    var target1 = svgContainer.append("rect")
      .attr("id", "target1")
      .attr("x", 0)
      .attr("y", 24)
      .attr("width", w)
      .attr("height", 250)
      .attr("disabled", true)
      .attr("fill", "grey")

    var target2 = svgContainer.append("rect")
      .attr("id", "target2")
      .attr("x", w + a)
      .attr("y", 24)
      .attr("width", w)
      .attr("height", 250)
      .attr("disabled", false)
      .attr("fill", "red")

  } else {
    var target1 = svgContainer.append("rect")
      .attr("id", "target1")
      .attr("x", 0)
      .attr("y", 24)
      .attr("width", 250)
      .attr("height", w)
      .attr("disabled", true)
      .attr("fill", "grey")

    var target2 = svgContainer.append("rect")
      .attr("id", "target2")
      .attr("x", 0)
      .attr("y", 24 + w + a)
      .attr("width", 250)
      .attr("height", w)
      .attr("disabled", false)
      .attr("fill", "red")
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
      .attr("fill", "grey")
    target2
      .attr("disabled", false)
      .attr("fill", "red")
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
      .attr("fill", "grey")
    target1
      .attr("disabled", false)
      .attr("fill", "red")
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
  data.push(Math.log2(a/w + 1), next_time - curr_time);
  testResults.push(data);

  // Count clicks
  clicks++;

  // Update the experiment when reaching the required number of clicks
  if (clicks == 10 && (i < (testData.length-1))){
    i++;
    $("#interaction").empty();
    drawExp(i, reverse);
    clicks = 0;
  }
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
      	d3.min([0, d3.min(data,function (d) { return d.IndexofDifficulty2 })]),
      	d3.max([0, d3.max(data,function (d) { return d.IndexofDifficulty2 })])
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
      .attr("cx",function (d) { return xScale(d.IndexofDifficulty2) })
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
