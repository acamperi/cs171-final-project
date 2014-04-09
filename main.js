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
	w: 900 - mainVisMargin.left - mainVisMargin.right,
	h: 500 - mainVisMargin.top - mainVisMargin.bottom
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

// ===============================
//   SETUP FUNCTIONS & VARIABLES
// ===============================

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

var tooltip = d3.select("#mainVis").append("div").attr("class", "tooltip hidden");

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
	.call(zoom) // applies zoom functionality to the mainVisFrame
	.on("click", click); // applies on-click zoom functionality

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

		// make map here, for now just draw without setting color for states
    	var states = mainVisFrame.selectAll(".state")
	        .data(usMap);

	    states.enter()
	        .append("path")
	        .attr("d", path)
	        .attr("title", function(d,i) { return d.properties.name; });

	    states.attr("class", "state")
	    	.attr("stroke", "white")
	    	.on("click", clicked);

	 //    // offsets for tooltips, from http://techslides.com/demos/d3/worldmap-template.html
		// var offsetL = document.getElementById('mainVis').offsetLeft+20;
		// var offsetT = document.getElementById('mainVis').offsetTop+10;

		// // tooltips, from http://techslides.com/demos/d3/worldmap-template.html
		// states.on("mousemove", function(d,i) {
		// 	var mouse = d3.mouse(mainVisFrame.node()).map( function(d) { return parseInt(d); } );
		// 	tooltip.classed("hidden", false)
		//         .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
		//         .html(d.properties.name);
		//   	})
		//   	.on("mouseout",  function(d,i) {
		//     	tooltip.classed("hidden", true);
		//   	}); 

		// load in actual data
		loadStateData();
	});
};

// ===============================
//   MAP INTERACTIVITY FUNCTIONS
// ===============================

// click & drag functionality, from http://techslides.com/demos/d3/worldmap-template.html
function move() {
	var t = d3.event.translate;
	var s = d3.event.scale; 
	zscale = s;
	var h = bbMainVis.h/4;

	t[0] = Math.min(
		(bbMainVis.w/bbMainVis.h)  * (s - 1), 
		Math.max(bbMainVis.w * (1 - s), t[0] )
	);
	t[1] = Math.min(
		h * (s - 1) + h * s, 
		Math.max(bbMainVis.h  * (1 - s) - h * s, t[1])
	);

	zoom.translate(t);
	mainVisFrame.attr("transform", "translate(" + t + ")scale(" + s + ")");

	//adjust the state hover stroke width based on zoom level
	d3.selectAll(".state").style("stroke-width", 1 / s);
}

//geo translation on mouse click in map
function click() {
  var latlon = projection.invert(d3.mouse(this));
  console.log(latlon);
}

function clicked(d) {
  var x, y, k;

	if (d && centered !== d) {
		var centroid = path.centroid(d);
		x = centroid[0];
		y = centroid[1];
		k = 4;
		centered = d;
	}
	else {
		x = bbMainVis.w / 2;
		y = bbMainVis.h / 2;
		k = 1;
		centered = null;
	}

  	mainVisFrame.selectAll("path")
      	.classed("active", centered && function(d) { return d === centered; });

    // There needs to be a zoom function below but I'm not sure what to put there.
  	mainVisFrame.transition()
      	.duration(750)
      	.attr("transform", "translate(" + bbMainVis.w / 2 + "," + bbMainVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
  
  	d3.selectAll(".state").transition().duration(750).style("stroke-width", 1 / k);
}

// ===============================
//   DETAIL VISUALIZATIONS SETUP
// ===============================

// TBD...

// ========================
//   LAUNCH VISUALIZATION
// ========================

loadMap();
