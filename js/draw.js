$(document).ready(function () {
    loadData();
    drawChart();
    doInsert();
});

function loadData() {
  d3.csv("data/experiments.csv", function (d){
    data = d;
  });
}

function drawChart() {
  var div = d3.select("data-vis")
    .append("div")
}
