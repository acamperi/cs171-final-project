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

var genderBarVis = {
	x: 0,
	y: 30,
	w: 300,
	h: 100,
	barheight: 30
};

var racePieVis = {
	w: 300,		//width
	h: 300,		//height
	r: 100		//radius
}       

// ===============================
//   SETUP FUNCTIONS & VARIABLES
// ===============================

// for zoom functionality
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

// for tooltip functionality
var tooltip = d3.select("#mainVis").append("div").attr("class", "tooltip hidden");

// for state-based zoom functionality
var centered;

// for when a school has been selected or not
var selectedSchool = null;
var selectedSchoolObject = null;

// for dummy testing
var dummy_data = {};

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
	// temporary dummy data tester
	d3.json("../data/dummy_data.json", function(error, data) {
		dummy_data = data;

		selectedSchool = 1;
		selectedSchoolObject = dummy_data[selectedSchool];

		console.log(selectedSchoolObject);

		detailify();
	});

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

// =============================
//   LAUNCH MAIN VISUALIZATION
// =============================

loadMap();

// ===============================
//   LAUNCH DETAIL VISUALIZATION
// ===============================

// function that generates all the detail visualizations
function detailify() {
	tablify();
	genderize();
	pieBaker();
}

// function for creating an info table
function tablify() {
	if (selectedSchoolObject != null) {
		// collecting only pertinent data from the selectedSchoolObject
		schoolName = selectedSchoolObject["name"];
		// schoolBranch = selectedSchoolObject["branch"];
		schoolInfoBuffer = {};
		schoolInfoBuffer["Address"] = selectedSchoolObject["address"];
		schoolInfoBuffer["City"] = selectedSchoolObject["city"];
		schoolInfoBuffer["State"] = selectedSchoolObject["state"];
		schoolInfoBuffer["Zip Code"] = selectedSchoolObject["zip"];
		schoolInfoBuffer["Total Assets"] = selectedSchoolObject["endowment_assets"];

		// adds school name
		var name = d3.select("#detailVis1")
			.insert("h2", "svg")
			.text(schoolName);

		// sets up the table based on schoolInfoBuffer
		var table = d3.select("#detailVis1")
			.insert("table", "svg");
		var tbody = table.append("tbody");
		var rows = tbody.selectAll("tr")
			.data(d3.entries(schoolInfoBuffer)) // d3.entries converts objects into entries with key:key value:value parameters
			.enter()
			.append("tr");

		// adds left-side table headers
		rows.append("th")
			.text(function(d){
				return d.key;
			});

		// adds values
		rows.append("td")
			.text(function(d){
				return d.value;
			});
	}
}

// function for making the gender proportion bars
function genderize() {

	var genderScale = d3.scale.linear().domain([0, 1]).range([0, genderBarVis.w]);

	if (selectedSchoolObject != null) {
		var males = parseInt(selectedSchoolObject["demographics"]["total_men"]);
		var females = parseInt(selectedSchoolObject["demographics"]["total_women"]);
		var total = parseInt(selectedSchoolObject["demographics"]["total"]);

		var mPercent = males/total;
		var fPercent = females/total;
		var oPercent = (total-(males+females))/total;

		console.log(mPercent);

		var genderBars = d3.select("#detailVis1")
			.selectAll("svg");

		genderBars.append("text")
			.attr("class", "detailVisHeader")
			.attr("x", 0)
			.attr("y", 20)
			.attr("anchor", "top")
			.text("Gender");

		var maleBar = genderBars.append("rect")
			.attr("x", genderBarVis.x)
			.attr("y", genderBarVis.y)
			.attr("height", genderBarVis.barheight)
			.attr("width", genderScale(mPercent))
			.classed("maleBar", true);

		var femaleBar = genderBars.append("rect")
			.attr("x", genderBarVis.x + genderScale(mPercent))
			.attr("y", genderBarVis.y)
			.attr("height", genderBarVis.barheight)
			.attr("width", genderScale(fPercent))
			.classed("femaleBar", true);

		var otherBar = genderBars.append("rect")
			.attr("x", genderBarVis.x + genderScale(mPercent) + genderScale(fPercent))
			.attr("y", genderBarVis.y)
			.attr("height", genderBarVis.barheight)
			.attr("width", genderScale(oPercent))
			.classed("otherBar", true);

		var maleText = genderBars.append("text")
			.attr("x", genderBarVis.x)
			.attr("y", genderBarVis.y + genderBarVis.barheight + 20)
			.attr("text-anchor", "start")
			.attr("class", "detailVisDetailText")
			.text(100 * mPercent.toFixed(4) + "% Male");

		var femaleText = genderBars.append("text")
			.attr("x", genderBarVis.x + genderBarVis.w)
			.attr("y", genderBarVis.y + genderBarVis.barheight + 20)
			.attr("text-anchor", "end")
			.attr("class", "detailVisDetailText")
			.text(100 * fPercent.toFixed(4) + "% Female");
	}
}

// modified from https://gist.github.com/enjalot/1203641
function pieBaker() {
    pieColor = d3.scale.category20c();     //builtin range of colors
 
    data = [{"label":"one", "value":20}, 
            {"label":"two", "value":50}, 
            {"label":"three", "value":30}];

    raceInfoBuffer = {};
    raceInfoBuffer["Black/African-American"] = parseInt(selectedSchoolObject["demographics"]["black_african_american_total"]);
    raceInfoBuffer["Asian"] = parseInt(selectedSchoolObject["demographics"]["asian_total"]);
    raceInfoBuffer["White"] = parseInt(selectedSchoolObject["demographics"]["white_total"]);
    raceInfoBuffer["Hispanic/Latinx"] = parseInt(selectedSchoolObject["demographics"]["hispanic_latino_total"]);
    raceInfoBuffer["Native Hawaiian/Other Pacific Islander"] = parseInt(selectedSchoolObject["demographics"]["native_hawaiian_other_pacific_islander_total"]);
	raceInfoBuffer["American Indian/Alaska Native"] = parseInt(selectedSchoolObject["demographics"]["american_indian_alaska_native_total"]);
	raceInfoBuffer["Multiracial"] = parseInt(selectedSchoolObject["demographics"]["two_plus_races_total"]);
	raceInfoBuffer["International"] = parseInt(selectedSchoolObject["demographics"]["nonresident_alien_total"]);

    var vis = d3.select("body")
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([d3.entries(raceInfoBuffer)])                   //associate our data with the document
            .attr("width", racePieVis.w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", racePieVis.h)
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + racePieVis.r + "," + racePieVis.r + ")")    //move the center of the pie chart from 0, 0 to radius, radius
 
    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(racePieVis.r);
 
    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
 
    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)
 
        arcs.append("svg:path")
                .attr("fill", function(d, i) { return pieColor(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
 
        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = racePieVis.r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .attr("class", "pieText")
            .text(function(d, i) { 
            	entries = d3.entries(raceInfoBuffer);
            	return entries[i]["key"]; 
            });        //get the label from our original data array
}




