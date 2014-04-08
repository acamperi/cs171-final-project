// ====================
//   SIZE DEFINITIONS
// ====================

var mainVisMargin = {
	top: 50,
	right: 50,
	bottom: 50,
	left: 50
};

var bbMainVis = {
	x: 0,
	y: 0,
	w: 1000 - mainVisMargin.left - mainVisMargin.right,
	h: 700 - mainVisMargin.top - mainVisMargin.bottom
};

var detailVisMargin = {
	top: 50,
	right: 50,
	bottom: 50,
	left: 50
};

var bbDetailVis = {
	x: 0,
	y: 0,
	w: 800 - detailVisMargin.left - detailVisMargin.right,
	h: 600 - detailVisMargin.top - detailVisMargin.bottom
};

var centered;

// ==============================
//   CANVAS AND VISFRAMES SETUP
// ==============================

var mainVisFrame = d3.select("#mainVis")
	.append("svg")
		.attr("width", bbMainVis.w + mainVisMargin.left + mainVisMargin.right)
		.attr("height", bbMainVis.h + mainVisMargin.top + mainVisMargin.bottom)
	.append("g")
		.attr("transform", "translate(" + mainVisMargin.left + "," + mainVisMargin.top + ")")
	.append("g")
		.attr("transform", "translate(" + bbMainVis.x + "," + bbMainVis.y + ")")

var detailVisFrames = d3.selectAll(".detailVis")
	.append("svg")
		.attr("width", bbDetailVis.w + detailVisMargin.left + detailVisMargin.right)
		.attr("height", bbDetailVis.h + detailVisMargin.top + detailVisMargin.bottom)
	.append("g")
		.attr("transform", "translate(" + detailVisMargin.left + "," + detailVisMargin.top + ")")
	.append("g")
		.attr("transform", "translate(" + bbDetailVis.x + "," + bbDetailVis.y + ")")

var projection = d3.geo.albersUsa().translate([bbMainVis.w / 2, bbMainVis.h / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);

// ============================
//   MAIN VISUALIZATION SETUP
// ============================

var toggleSelected = function(id) {
	// change map visualization to reflect selected metric
};

var loadStateData = function() {
	d3.json("../data/institutionsData101112.json", function(error, data) {
		// load in state data, prepare scales etc

		// setup toggle interaction
	});
};

var loadMap = function() {
	d3.json("../data/us-named.json", function(error, data) {
	    var usMap = topojson.feature(data,data.objects.states).features;

    	mainVisFrame.selectAll(".states")
	        .data(usMap)
	        .enter()
	        .append("path")
	        .attr("d", path)
	        .on("click", clicked);
	    // make map here, for now just draw without setting color for states

	    console.log("data");

	    // load in actual data
	    loadStateData();
	});
};

// geometric zoom
// "borrowed" (modified from) http://bl.ocks.org/mbostock/2206590
function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = bbMainVis.w / 2;
    y = bbMainVis.h / 2;
    k = 1;
    centered = null;
  }

  mainVisFrame.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  mainVisFrame.transition()
      .duration(750)
      .attr("transform", "translate(" + bbMainVis.w / 2 + "," + bbMainVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// ===============================
//   DETAIL VISUALIZATIONS SETUP
// ===============================

// TBD...

// ========================
//   LAUNCH VISUALIZATION
// ========================

loadMap();
