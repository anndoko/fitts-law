var testData = [
  { name: "Task 1", w: 10, d: 160 },
  { name: "Task 2", w: 60, d: 160 },
  { name: "Task 3", w: 150, d: 160 },
  { name: "Task 4", w: 200, d: 160 }
];

$(document).ready(function () {
  loadData();
});

// ---------- Fitts Visualization -----
function loadData() {
  d3.csv("data/experiments.csv", function(data){

    var body = d3. select("#data-vis")
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  	var h = 450 - margin.top - margin.bottom
  	var w = 800 - margin.left - margin.right

    var xScale = d3.scale.linear()
      .domain([
      	d3.min([0,d3.min(data,function (d) { return d.IndexofDifficulty1 })]),
      	d3.max([0,d3.max(data,function (d) { return d.IndexofDifficulty1 })])
      	])
      .range([0,w])

    var yScale = d3.scale.linear()
      .domain([
      	d3.min([0,d3.min(data,function (d) { return d.Mean })]),
      	d3.max([0,d3.max(data,function (d) { return d.Mean })])
      	])
      .range([h,0])

    var svg = body.append("svg")
      .attr("height",h + margin.top + margin.bottom)
      .attr("width",w + margin.left + margin.right)
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
