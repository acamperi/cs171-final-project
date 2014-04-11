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
	y: 50,
	w: 200,
	h: 100,
	barheight: 30
};

var racePieVis = {
	x: genderBarVis.x,
	y: genderBarVis.y + genderBarVis.h,
	w: 300,		//width
	h: 300,		//height
	r: 100		//radius
}

var financialAidBarVis = {
	yAxisW: 20,
	x: genderBarVis.x + genderBarVis.w + 50,
	chartX: 40 + genderBarVis.x + genderBarVis.w + 50,
	y: genderBarVis.y,
	chartY: 10 + genderBarVis.y,
	w: 220,
	h: 300,
	xAxisY: 10 + genderBarVis.y + 300,
	xAxisH: 30,
	barWidth: 30
}

var crimeBarVis = {
	yAxisW: 20,
	x: genderBarVis.x + 50,
	chartX: genderBarVis.x + 50,
	y: genderBarVis.y,
	chartY: 10 + genderBarVis.y,
	w: 400,
	h: 300,
	xAxisY: 10 + genderBarVis.y + 300,
	xAxisH: 30,
	barWidth: 30
}

var school_dot_radius = 2;

// ===============================
//   SETUP FUNCTIONS & VARIABLES
// ===============================

// for zoom functionality
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

// for tooltip functionality
var tooltip = d3.select("#mainVis").append("div").attr("class", "tooltip");

// for state-based zoom functionality
var centered;

// for when a school has been selected or not
var selectedSchool = null;
var selectedSchoolObject = null;

// for dummy testing
var dummy_data = {};

var detailified = false;

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
		

	var projections = [];
	var schoolIDList = [];
	for (var schoolID in data)
	{
		schoolIDList.push(schoolID);
		projections.push(projection(data[schoolID]["lonlat"]));
	}

    dummy_data = data;

	mainVisFrame.append("g").selectAll(".school").data(schoolIDList).enter().append("circle")
    .classed("school", true)
    .attr("r", function(x) { return school_dot_radius; })
    .attr("cx", function(_, i) {return projections[i][0];})
    .attr("cy", function(_, i) {return projections[i][1];})
    .on("mouseover", function(x){return tooltip.style("visibility", "visible").text(function(){
    	return data[x]["name"];
 });})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
	.on("click", function(x){
		selectedSchool = x;
		selectedSchoolObject = data[x];

		detailify();
	});

		selectedSchool = schoolIDList[0];
		selectedSchoolObject = dummy_data[selectedSchool];

		console.log(selectedSchoolObject);

		detailify();
		detailfied = true;
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
	console.log(t + " :::::::: " + s);
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
	d3.selectAll(".school").attr("r", school_dot_radius / s);
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
    // TODO: Figure out how to coordinate zoom functionality
  	mainVisFrame.transition()
      	.duration(750)
      	.attr("transform", "translate(" + bbMainVis.w / 2 + "," + bbMainVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
  
  	d3.selectAll(".state").transition().duration(750).style("stroke-width", 1 / k);
  	d3.selectAll(".school").transition().duration(750).attr("r", school_dot_radius / k);
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
	if (detailified = true) {
		// selects visualization
		vis = d3.select("#detailVis1");

		// removes school header
		vis.select("h2")
			.remove();

		// removes table
		vis.select("table")
			.remove();

		// removes everything from the SVG
		svg = vis.select("svg");
		svg.selectAll("g")
			.remove();
		svg.selectAll("text")
			.remove();
		svg.selectAll("rect")
			.remove();
	}
	detailified = false;
	tablify();
	genderize();
	pieBaker();
	financify();
	crimeify();
	detailified = true;
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
		schoolInfoBuffer["Enrollment"] = selectedSchoolObject["demographics"]["total"];

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
			.attr("x", genderBarVis.x)
			.attr("y", genderBarVis.y - 10)
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

// function for baking a pie chart based on race
// modified from https://gist.github.com/enjalot/1203641
function pieBaker() {
    pieColor = d3.scale.category20c();     //builtin range of colors

    raceInfoBuffer = {};
    raceInfoBuffer["Black/African-American"] = parseInt(selectedSchoolObject["demographics"]["black_african_american_total"]);
    raceInfoBuffer["Asian"] = parseInt(selectedSchoolObject["demographics"]["asian_total"]);
    raceInfoBuffer["White"] = parseInt(selectedSchoolObject["demographics"]["white_total"]);
    raceInfoBuffer["Hispanic/Latinx"] = parseInt(selectedSchoolObject["demographics"]["hispanic_latino_total"]);
    raceInfoBuffer["Native Hawaiian/Other Pacific Islander"] = parseInt(selectedSchoolObject["demographics"]["native_hawaiian_other_pacific_islander_total"]);
	raceInfoBuffer["American Indian/Alaska Native"] = parseInt(selectedSchoolObject["demographics"]["american_indian_alaska_native_total"]);
	raceInfoBuffer["Multiracial"] = parseInt(selectedSchoolObject["demographics"]["two_plus_races_total"]);
	raceInfoBuffer["International"] = parseInt(selectedSchoolObject["demographics"]["nonresident_alien_total"]);

	// selects the canvas on which to bake the pie
    var racePie = d3.select("#detailVis1")
    	.select("svg");

    // bakes the pie name
    racePie.append("text")
			.attr("class", "detailVisHeader")
			.attr("x", racePieVis.x)
			.attr("y", racePieVis.y)
			.text("Race Demographics");

	// bakes the pie data
    var vis = racePie
        .append("g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + (racePieVis.x + racePieVis.r) + "," + (racePieVis.y + racePieVis.r + 10) + ")")    //move the center of the pie chart from 0, 0 to radius, radius
        .data([d3.entries(raceInfoBuffer)]);
 
 	// bakes pie slice data
    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(racePieVis.r);

    // bakes pie slice data for a list of values
    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
 
 	// bakes pie slices
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

    // TODO: make descriptive text append to a neatly sorted area
    // TODO: make descriptive text append with boxes for the correct color
}

function financify() {
	// pulls financial aid info
	financeInfoBuffer = {};
	financeInfoBuffer["Average"] = parseInt(selectedSchoolObject["finaid"]["average"]);
	financeInfoBuffer["$0-$30000"] = parseInt(selectedSchoolObject["finaid"]["income_0_30000"]);
	financeInfoBuffer["$30000-$48000"] = parseInt(selectedSchoolObject["finaid"]["income_30001_48000"]);
	financeInfoBuffer["$48000-$75000"] = parseInt(selectedSchoolObject["finaid"]["income_48001_75000"]);
	financeInfoBuffer["$75000-110000"] = parseInt(selectedSchoolObject["finaid"]["income_75001_110000"]);
	financeInfoBuffer["$110000+"] = parseInt(selectedSchoolObject["finaid"]["income_110001_more"]);

	financeInfo = d3.entries(financeInfoBuffer);
	financeInfoKeys = d3.keys(financeInfoBuffer);

	console.log(financeInfoKeys);

	xScale = d3.scale.ordinal()
		.domain(financeInfoKeys)
		.rangePoints([0, financialAidBarVis.w]);  // define the right domain generically
    yScale = d3.scale.linear()
    	.domain([0, d3.max(financeInfo, function(d){
    		return d.value;
   		})])
   		.range([0, financialAidBarVis.h]);
   	inverseYScale = d3.scale.linear()
    	.domain([0, d3.max(financeInfo, function(d){
    		return d.value;
   		})])
   		.range([financialAidBarVis.h, 0]);

	var fBXAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");

    var fBYAxis = d3.svg.axis()
      .scale(inverseYScale)
      .orient("left");

	// selects the canvas on which to make the visualization
    var financialAidBars = d3.select("#detailVis1")
    	.select("svg");

    // makes the title
    financialAidBars.append("text")
		.attr("class", "detailVisHeader")
		.attr("x", financialAidBarVis.x)
		.attr("y", (financialAidBarVis.y - 10))
		.text("Financial Aid");

	// makes the bars
	financialAidBars.selectAll(".bar")
        .data(financeInfo)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { 
        	return financialAidBarVis.barWidth/2 + financialAidBarVis.chartX + xScale(d.key);
        })
        .attr("y", function(d) {
        	return financialAidBarVis.chartY + (financialAidBarVis.h - yScale(d.value));
        })
        .attr("width", function(d, i) {
        	return financialAidBarVis.barWidth;
        })
        .attr("height", function(d) {
        	return yScale(d.value);
        })
        .attr("title", function(d) {
        	return d.key;
        });

    financialAidBars.append("g")
        .attr("class", "axis")
        .attr("id", "financialXAxis")
        .attr("transform", "translate(" + (financialAidBarVis.chartX + financialAidBarVis.barWidth) + "," + financialAidBarVis.xAxisY +")")
        .call(fBXAxis)
      	// modified from http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
        	.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

    financialAidBars.append("g")
        .attr("class", "axis")
        .attr("id", "financialYAxis")
        .attr("transform", "translate(" + financialAidBarVis.chartX + "," + financialAidBarVis.chartY +")")
        .call(fBYAxis);
}


function crimeify() {

	crimeInfoBuffer = {};
	crimeInfoBuffer["total"] = parseInt(selectedSchoolObject["crime"]["total"]);
	crimeInfoBuffer["murder"] = parseInt(selectedSchoolObject["crime"]["murder"]);
	crimeInfoBuffer["negligent manslaughter"] = parseInt(selectedSchoolObject["crime"]["negligent_manslaughter"]);
	crimeInfoBuffer["forcible sex offense"] = parseInt(selectedSchoolObject["crime"]["forcible_sex_offense"]);
	crimeInfoBuffer["nonforcible sex offense"] = parseInt(selectedSchoolObject["crime"]["nonforcible_sex_offense"]);
	crimeInfoBuffer["robbery"] = parseInt(selectedSchoolObject["crime"]["robbery"]);
	crimeInfoBuffer["aggravated assault"] = parseInt(selectedSchoolObject["crime"]["aggravated_assault"]);
	crimeInfoBuffer["burglary"] = parseInt(selectedSchoolObject["crime"]["burglary"]);
	crimeInfoBuffer["motor vehicle theft"] = parseInt(selectedSchoolObject["crime"]["motor_vehicle_theft"]);
	crimeInfoBuffer["arson"] = parseInt(selectedSchoolObject["crime"]["arson"]);

	crimeInfo = d3.entries(crimeInfoBuffer);
	crimeInfoKeys = d3.keys(crimeInfoBuffer);

	console.log(crimeInfo);

	xScale = d3.scale.ordinal()
		.domain(crimeInfoKeys)
		.rangePoints([0, crimeBarVis.w]);  // define the right domain generically
    yScale = d3.scale.linear()
    	.domain([0, d3.max(crimeInfo, function(d){
    		return d.value;
   		})])
   		.range([0, crimeBarVis.h]);
   	inverseYScale = d3.scale.linear()
    	.domain([0, d3.max(crimeInfo, function(d){
    		return d.value;
   		})])
   		.range([crimeBarVis.h, 0]);

	var cBXAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");

    var cBYAxis = d3.svg.axis()
      .scale(inverseYScale)
      .orient("left");

	// selects the canvas on which to make the visualization
    var crimeBars = d3.select("#detailVis2")
    	.select("svg");

    // makes the title
    crimeBars.append("text")
		.attr("class", "detailVisHeader")
		.attr("x", crimeBarVis.x)
		.attr("y", (crimeBarVis.y - 10))
		.text("University Crime");

	// makes the bars
	crimeBars.selectAll(".bar")
        .data(crimeInfo)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { 
        	return crimeBarVis.barWidth/2 + crimeBarVis.chartX + xScale(d.key);
        })
        .attr("y", function(d) {
        	return crimeBarVis.chartY + (crimeBarVis.h - yScale(d.value));
        })
        .attr("width", function(d, i) {
        	return crimeBarVis.barWidth;
        })
        .attr("height", function(d) {
        	return yScale(d.value);
        })
        .attr("title", function(d) {
        	return d.key;
        });

    crimeBars.append("g")
        .attr("class", "axis")
        .attr("id", "crimeXAxis")
        .attr("transform", "translate(" + (crimeBarVis.chartX + crimeBarVis.barWidth) + "," + crimeBarVis.xAxisY +")")
        .call(cBXAxis)
      	// modified from http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
        	.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

    crimeBars.append("g")
        .attr("class", "axis")
        .attr("id", "crimeYAxis")
        .attr("transform", "translate(" + crimeBarVis.chartX + "," + crimeBarVis.chartY +")")
        .call(cBYAxis);
}

