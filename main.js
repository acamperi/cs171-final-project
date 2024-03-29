// ====================
//   SIZE DEFINITIONS
// ====================

var mainVisMargin = {
	top: 50,
	right: 50,
	bottom: 50,
	left: 50
};

// definitions for map
var bbMainVis = {
	x: 0,
	y: 0,
	w: 780 - mainVisMargin.left - mainVisMargin.right,
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
	w: 420 - detailVisMargin.left - detailVisMargin.right,
	h: 380 - detailVisMargin.top - detailVisMargin.bottom
};

var bbDetailTabs = {
	x: 0,
	y: 0,
	w: 420,
	h: 25,
	barCount: 3
};

var genderBarVis = {
	x: 0,
	y: 30,
	w: 140,
	h: 100,
	barheight: 30
};

var racePieVis = {
	x: genderBarVis.x,
	y: genderBarVis.y + genderBarVis.h,
	w: 140,		//width
	h: 140,		//height
	r: 70		//radius
};

var financialAidBarVis = {
	yAxisW: 20,
	x: genderBarVis.x + genderBarVis.w + 90,
	chartX: 40 + genderBarVis.x + genderBarVis.w + 90,
	y: genderBarVis.y,
	chartY: 10 + genderBarVis.y,
	w: 150,
	h: 200,
	xAxisY: 10 + genderBarVis.y + 200,
	xAxisH: 30,
	barWidth: 15
};

var crimeBarVis = {
	yAxisW: 20,
	x: 10,
	chartX: genderBarVis.x + 40,
	y: genderBarVis.y,
	chartY: 10 + genderBarVis.y,
	w: 325,
	h: 200,
	xAxisY: 10 + genderBarVis.y + 200,
	xAxisH: 30,
	barWidth: 25
};

var school_dot_radius = 1;
var zscale = 1;
var statetab = 0;

// ===============================
//   SETUP FUNCTIONS & VARIABLES
// ===============================

// for zoom functionality
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10]);
    //.on("zoom", move);

// console.log(d3.event.sourceEvent.pageX);

// for tooltip functionality
var tooltip = d3.select("#mainVis").append("div").attr("class", "tooltip");

// for state-based zoom functionality
var centered;

var allSchoolObjects = [];
var numberSchoolObjects = 0;

// for when a school has been selected or not
var selectedSchool = null;
var selectedSchoolObject = null;
var comparedSchoolObject = null;

var selectedStateName = null;

var detailified = false;
var currentTab = 1;
var newPage = true;

// ==============================
//   CANVAS AND VISFRAMES SETUP
// ==============================

var mainVisFrame = d3.select("#mainVis")
	.append("svg")
		.attr("width", bbMainVis.w + mainVisMargin.left + mainVisMargin.right)
		.attr("height", bbMainVis.h + mainVisMargin.top + mainVisMargin.bottom)
		.attr("id", "#mainVisView")
	.append("g")
		.attr("transform", "translate(" + mainVisMargin.left + "," + mainVisMargin.top + ")")
	.append("g")
		.attr("transform", "translate(" + bbMainVis.x + "," + bbMainVis.y + ")")
	.call(zoom) // applies zoom functionality to the mainVisFrame
	.on("click", click); // applies on-click zoom functionality

var detailVisFrames = d3.select("#detailVis")
	.append("svg")
		.attr("width", bbDetailVis.w + detailVisMargin.left + detailVisMargin.right)
		.attr("height", bbDetailVis.h + detailVisMargin.top + detailVisMargin.bottom)
		.attr("id", "canvas")
	.append("g")
		.attr("transform", "translate(" + detailVisMargin.left + "," + detailVisMargin.top + ")")
	.append("g")
		.attr("transform", "translate(" + bbDetailVis.x + "," + bbDetailVis.y + ")");

var projection = d3.geo.albersUsa().translate([bbMainVis.w / 2, bbMainVis.h / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);

// ============================
//   MAIN VISUALIZATION SETUP
// ============================

function replaceAll(find, replace, str) {
   return str.replace(new RegExp(find, 'g'), replace);
 }
 
 function search(str)
 {
 	var newStr = str.toLowerCase();
 	newStr = newStr.replace(/[^a-zA-Z0-9-\s]/g, '').replace(/\s{2,}/g, ' ');
 	var onlyOneWord = false;
 	if (newStr.split(" ").length == 1)
 {
 		onlyOneWord = true;
 		newStr += " ";
 	}
 
 	var invalid_words = ["school", "university", "seminary", "college"];
 	var reducedStr = newStr;
 	invalid_words.forEach(function(x){
 		reducedStr = replaceAll(x, "", reducedStr);
 	});
 
 	var regex = new RegExp(newStr, "i");
 	var exploded = reducedStr.split(" ");
 	var regexes = [];
 	exploded.forEach(function(x){
 		regexes.push(new RegExp(x, "i"));
 	});
 	var bestOption;
 	var bestOptionMatches = 0;
 	var numberWords = exploded.length
 
 	for (var i = 0; i < numberSchoolObjects; i++)
 	{
 		var schoolObject = allSchoolObjects[i];
 		var initialSearch = schoolObject.name.match(regex);
 
 		if (initialSearch != null)
 		{
 			bestOption = schoolObject;
 			if ((initialSearch.length == 1 && initialSearch[0].length == schoolObject.name.length) ||
 			 (onlyOneWord && initialSearch[0].charAt(0) == schoolObject.name.charAt(0)))
 			{
 				break;
 			}
 		}
 		else
 		{
 			var matches = 0;
 			regexes.forEach(function(reg){
 				if (schoolObject.name.search(reg) != -1)
 					matches++;
 			});
 			if (matches > bestOptionMatches)
 			{
 			bestOptionMatches = matches;
 				bestOption = schoolObject;
 			}
 		}
 	};
 
 	return bestOption;
 
 }
 
 d3.select("#searchButton").on("click", function () {
 	selectSchoolObject(search($("#searchField").val()));
 })
 
 $("#searchField").keyup(function (e) {
     if (e.keyCode == 13) {
         selectSchoolObject(search($("#searchField").val()));
     }
 });


var toggleSelected = function(id) {
	// change map visualization to reflect selected metric
};

function selectSchoolObject(x)
 {
 	$("#searchField").val(x.name);
 
 	selectedSchoolObject = x;
 
 	if(newPage == true) {
 		d3.select("#clickPlease")
 			.remove();
 		newPage = false;
 		tabbify();
 	}
 
 	if (currentTab != 3)
 		detailify();
 	else
 		compare();
 
 	d3.selectAll(".thisSchool")
 		.attr("class", "school");
 }

var loadStateData = function() {
	d3.json("data/statesData101112.json", function(error, statesData) {
		var collegeCrimeScale = d3.scale.linear()
			.interpolate(d3.interpolateRgb)
			.range(["#444444", "#cc3333"])
			.domain(d3.extent(_.values(statesData), function(d) {
				return d.college_crime.total;
			}));
		mainVisFrame.selectAll(".state")
			.style("fill", function(d) {
				var total = statesData[d.properties.code].college_crime.total;
				return collegeCrimeScale(total);
			});

		//load data for state average of university detail vis, set selected state name and selected object as the variable for school name and school object to maintain the same configuration 
		var selectedSchool = selectedState;
		selectedSchoolObject = statesData[selectedState];
		statetab = 1;

		newPage = true;

		if (newPage === true) {
					d3.select("#clickPlease")
						.remove();
					newPage = false;
					// tells tabbify to set appropriate tabs for state level
					tabbify();
		}

		statedetailify();
 		detailified = true;
		
 	});
 };

			
var loadInstitutionData = function() {
	d3.json("data/institutionsData101112.json", function(error, data) {
		var projections = [];
		var schoolIDList = [];
		var c = 0;
		for (var schoolID in data)
		{
			var computed_projection = projection(data[schoolID]["lonlat"]);
			if (computed_projection !== null) {
				allSchoolObjects.push(data[schoolID]);
 				numberSchoolObjects++;
				schoolIDList.push(schoolID);
				projections.push(computed_projection);
			}
			else
				c++;
		}
		// console.log(c);

		// console.log(projections);
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
			statetab = 0;

			newPage = true;

			if (newPage === true) {
				d3.select("#clickPlease")
					.remove();
				newPage = false;
				// tells tabbify to set appropriate tabs for institution level
				tabbify();
			}

			detailify();

			selectSchoolObject(data[x]);

			d3.selectAll(".thisSchool")
				.attr("class", "school");

			d3.select(this)
				.attr("class", "thisSchool");
		});

		selectedSchoolObject = data[selectedSchool];
	});
};


var loadMap = function() {
	d3.json("data/us-named.json", function(error, data) {
	    var usMap = topojson.feature(data,data.objects.states).features;

		// make map here, for now just draw without setting color for states
    	var states = mainVisFrame.selectAll(".state")
	        .data(usMap);

	    states.enter()
	        .append("path")
	        .attr("d", path)
	        .attr("title", function(d,i) { return d.properties.code; });

	    states.attr("class", "state")
	    	.attr("stroke", "white")
	    	.on("dblclick", clicked)
	    	.on("click", function(d, i){
	    		selectedState = d.properties.code;
	    		selectedStateName = d.properties.name;
	    		loadStateData();
	    	});
	    	

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
		loadInstitutionData();
	});
};

// ===============================
//   MAP INTERACTIVITY FUNCTIONS
// ===============================

// click & drag functionality, from http://techslides.com/demos/d3/worldmap-template.html
function move() {
	var t = d3.event.translate;
	var s = d3.event.scale;
	var h = bbMainVis.h/4;

	zscale = s;

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
	d3.selectAll(".thisSchool").attr("r", school_dot_radius / s);
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

	// if (zscale != 1)
	// 	k = 4;

	zoom.scale(k);
	zoom.translate([x, y]);

  	mainVisFrame.selectAll("path")
      	.classed("active", centered && function(d) { return d === centered; });

    // There needs to be a zoom function below but I'm not sure what to put there.
    // TODO: Figure out how to coordinate zoom functionality
  	mainVisFrame.transition()
      	.duration(750)
      	.attr("transform", "translate(" + bbMainVis.w / 2 + "," + bbMainVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
  
  	d3.selectAll(".state").transition().duration(750).style("stroke-width", 1 / k);
  	d3.selectAll(".school").transition().duration(750).attr("r", school_dot_radius / k);
		d3.selectAll(".thisSchool").transition().duration(750).attr("r", school_dot_radius / k);

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

google.load('search', '1');
var imageSearch;

// Create an Image Search instance.
$().ready(function() {
	imageSearch = new google.search.ImageSearch();
});

function searchComplete(college_name) {

if (selectedSchoolObject.name != college_name)
	return;

// Check that we got results
if (imageSearch.results && imageSearch.results.length > 0) {

  	// Loop through our results, printing them to the page.
  	var results = imageSearch.results;

    // For each result write it's title and image to the screen
    var result = results[0];

    d3.select(".college_logo_link").attr("href", result.originalContextUrl);
    d3.select(".college_logo").attr("src", result.url);

    // var imgContainer = d3.select("body").append("a").attr("href", result.originalContextUrl);
    // imgContainer.append("img").attr("width", "100").attr("align", "center").attr("src", result.url);
  }
}

function searchForImageForCollege(college_name) {

    // Set searchComplete as the callback function when a search is 
    // complete.  The imageSearch object will have results in it.
    imageSearch.setSearchCompleteCallback(this, searchComplete, [college_name]);

    imageSearch.setRestriction(
  		google.search.Search.RESTRICT_SAFESEARCH,
  		google.search.Search.SAFESEARCH_STRICT
	);
	imageSearch.setRestriction(
  		google.search.ImageSearch.RESTRICT_IMAGESIZE,
  		google.search.ImageSearch.IMAGESIZE_MEDIUM
	);

    imageSearch.setResultSetSize = 1;
    imageSearch.setNoHtmlGeneration();

    imageSearch.setQueryAddition(" logo");

    // Find me a beautiful college logo.
    imageSearch.execute(college_name);
}

// function that creates the SVG tabs
function tabbify() {

	// removes table
	d3.select("#detailVis").select("#tabBar")
		.remove();

	if (statetab == 1 && currentTab == 3) {
		currentTab = 1;
	}

	var tabBar = d3.select("#detailVis")
		.insert("svg", "#canvas")
			.attr("width", bbDetailTabs.w)
			.attr("height", bbDetailTabs.h)
			.attr("id", "tabBar")
			.style("padding-bottom", "10px");

	var tabBar1 = tabBar.append("g")
		.attr("id", "tabBar1");
	tabBar1.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", bbDetailTabs.w/bbDetailTabs.barCount)
		.attr("height", bbDetailTabs.h)
		.attr("fill", "#FFFFFF")
	tabBar1.append("text")
		.attr("text-anchor", "middle")
		.attr("x", bbDetailTabs.w/(bbDetailTabs.barCount*2))
		.attr("y", bbDetailTabs.h/2 + 5)
		.text( function () { 
			if (statetab == 0){
				return "School Data";
			}
			else
				return "State Data"; 
		});

	var tabBar2 = tabBar.append("g")
		.attr("id", "tabBar2");
	tabBar2.append("rect")
		.attr("x", bbDetailTabs.w/bbDetailTabs.barCount)
		.attr("y", 0)
		.attr("width", bbDetailTabs.w/bbDetailTabs.barCount)
		.attr("height", bbDetailTabs.h)
		.attr("fill", "#FFFFFF")
	tabBar2.append("text")
		.attr("text-anchor", "middle")
		.attr("x", bbDetailTabs.w/bbDetailTabs.barCount + bbDetailTabs.w/(bbDetailTabs.barCount*2))
		.attr("y", bbDetailTabs.h/2 + 5)
		.text("Crime Statistics");

	if (statetab == 0) {
		var tabBar3 = tabBar.append("g")
			.attr("id", "tabBar3");
		tabBar3.append("rect")
			.attr("x", (bbDetailTabs.w/bbDetailTabs.barCount) * 2)
			.attr("y", 0)
			.attr("width", bbDetailTabs.w/bbDetailTabs.barCount)
			.attr("height", bbDetailTabs.h)
			.attr("fill", "#FFFFFF");
		tabBar3.append("text")
			.attr("text-anchor", "middle")
			.attr("x", (bbDetailTabs.w/bbDetailTabs.barCount) * 2 + bbDetailTabs.w/(bbDetailTabs.barCount*2))
			.attr("y", bbDetailTabs.h/2 + 5)
			.text("School Comparison");
	}

	if (currentTab == 1) {
		d3.select("#tabBar2")
			.select("svg rect")
			.attr("fill", "#BBBBBB");
		d3.select("#tabBar3")
			.select("svg rect")
			.attr("fill", "#BBBBBB");
	}
	else if (currentTab == 2) {
		d3.select("#tabBar1")
			.select("svg rect")
			.attr("fill", "#BBBBBB");
		d3.select("#tabBar3")
			.select("svg rect")
			.attr("fill", "#BBBBBB");
	}
	else if (currentTab == 3) {
		if (statetab == 0) {
			d3.select("#tabBar2")
				.select("svg rect")
				.attr("fill", "#BBBBBB");
			d3.select("#tabBar3")
				.select("svg rect")
				.attr("fill", "#BBBBBB");
		}
		else if (statetab == 1) {
			d3.select("#tabBar1")
				.select("svg rect")
				.attr("fill", "#FFFFFF");
			d3.select("#tabBar2")
				.select("svg rect")
				.attr("fill", "#BBBBBB");
		}
	}

	tabBar1.on("click", function(){
		if(currentTab != 1) {
			d3.selectAll(".tab1")
				.attr("opacity", "1");
			d3.selectAll(".tab2")
				.attr("opacity", "0");
			d3.selectAll(".tab3")
				.attr("opacity", "0");

			d3.select("#tabBar1")
				.select("svg rect")
				.attr("fill", "#FFFFFF");
			d3.select("#tabBar2")
				.select("svg rect")
				.attr("fill", "#BBBBBB");
			d3.select("#tabBar3")
				.select("svg rect")
				.attr("fill", "#BBBBBB");

			d3.select("#dataTable").style("opacity", "1");
			d3.select("#dataTable").classed("fullyHidden", false).classed("fullyVisible", true);
 			d3.select("#rootTable").style("opacity", "0");
 			d3.select("#rootTable").classed("fullyHidden", true).classed("fullyVisible", false);

			currentTab = 1;
			if (needsDetailify)
 				detailify();
		}
	});

	tabBar2.on("click", function(){
		if(currentTab != 2) {
			d3.selectAll(".tab1")
				.attr("opacity", "0");
			d3.selectAll(".tab2")
				.attr("opacity", "1");
			d3.selectAll(".tab3")
				.attr("opacity", "0");

			d3.select("#tabBar1")
				.select("svg rect")
				.attr("fill", "#BBBBBB");
			d3.select("#tabBar2")
				.select("svg rect")
				.attr("fill", "#FFFFFF");
			d3.select("#tabBar3")
				.select("svg rect")
				.attr("fill", "#BBBBBB");

			d3.select("#dataTable").style("opacity", "1");
			d3.select("#dataTable").classed("fullyHidden", false).classed("fullyVisible", true);
 			d3.select("#rootTable").style("opacity", "0");
 			d3.select("#rootTable").classed("fullyHidden", true).classed("fullyVisible", false);

			currentTab = 2;

			if (needsDetailify)
 				detailify();
		}
	});

	if (statetab == 0) {
		tabBar3.on("click", function(){
			if(currentTab != 3) {
				d3.selectAll(".tab1")
					.attr("opacity", "0");
				d3.selectAll(".tab2")
					.attr("opacity", "0");
				d3.selectAll(".tab3")
					.attr("opacity", "1");

				d3.select("#tabBar1")
					.select("svg rect")
					.attr("fill", "#BBBBBB");
				d3.select("#tabBar2")
					.select("svg rect")
					.attr("fill", "#BBBBBB");
				d3.select("#tabBar3")
					.select("svg rect")
					.attr("fill", "#FFFFFF");

				d3.select("#dataTable").style("opacity", "0");
				d3.select("#dataTable").classed("fullyHidden", true).classed("fullyVisible", false);
 				d3.select("#rootTable").style("opacity", "1");
 				d3.select("#rootTable").classed("fullyHidden", false).classed("fullyVisible", true);

				currentTab = 3;

				needsDetailify = true;
			}
		});
	}
}

// function that generates all the detail visualizations
function detailify() {
	if (detailified === true) {
		// selects visualization
		vis1 = d3.select("#detailVis");

		// removes school header
		vis1.select("h2")
			.remove();

		// removes table
		vis1.select("#dataTable")
			.remove();

		// removes comparison stuff
		vis1.select("#rootTable")
 			.remove();

		// removes everything from the canvas
		svg1 = vis1.select("#canvas");
		svg1.selectAll("g")
			.remove();
		svg1.selectAll("text")
			.remove();

		vis2 = d3.select("#detailVis2");

		// removes everything from the SVG
		svg2 = vis2.select("svg");
		svg2.selectAll("g")
			.remove();

	}
	detailified = false;
	tablify();
	genderize();
	pieBaker();
	financify();
	crimeify();
	comparify();
	detailified = true;
}

// function that generates all the detail visualizations
function statedetailify() {
	if (detailified === true) {
		// selects visualization
		vis1 = d3.select("#detailVis");

		// removes school header
		vis1.select("h2")
			.remove();

		// removes table
		vis1.select("#dataTable")
			.remove();

		// removes everything from the canvas
		svg1 = vis1.select("#canvas");
		svg1.selectAll("g")
			.remove();
		svg1.selectAll("text")
			.remove();

		vis2 = d3.select("#detailVis2");

		// removes everything from the SVG
		svg2 = vis2.select("svg");
		svg2.selectAll("g")
			.remove();

	}

	// add state name
	var name = d3.select("#detailVis")
		.insert("h2", "#canvas")
		.text(selectedStateName);

	detailified = false;
	genderize();
	pieBaker();
	financify();
	statecrimeify();
	detailified = true;
}

// function for creating an info table
function tablify() {
	if (selectedSchoolObject !== null) {
		// collecting only pertinent data from the selectedSchoolObject
		schoolName = selectedSchoolObject["name"];
		// schoolBranch = selectedSchoolObject["branch"];
		schoolInfoBuffer = {};
		schoolInfoBuffer["Street Address"] = selectedSchoolObject["address"];
		schoolInfoBuffer["City, State, Zip Code"] = selectedSchoolObject["city"] + ", " + selectedSchoolObject["state"] + " " + selectedSchoolObject["zip"];
		// schoolInfoBuffer["Total Assets"] = selectedSchoolObject["endowment_assets"];
		schoolInfoBuffer["Enrollment"] = selectedSchoolObject["demographics"]["total"];

		var dataTable = d3.select("#detailVis")
			.insert("div", "#canvas")
			.attr("id", "dataTable")
			.attr("class", "tab1")
			.style("padding", "0px");

		// adds school name
		
		largeName = d3.select("#detailVis")
			.insert("h2", "#dataTable")
			.text(schoolName);
		
		// sets up the table based on schoolInfoBuffer	
		// var infoTableCol = dataTable;

		var superTable = dataTable
			.append("table");

		var superTbody = superTable.append("tbody");
		var superRow = superTbody.append("tr").style("background-color", "#222222");
		var infoTableCol = superRow.append("td").style("background-color", "#222222");
		var imgCol = superRow.append("td").style("background-color", "#222222");

		var table = infoTableCol
			.append("table");
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

		imgCol.append("a").classed("college_logo_link", true)
	    .append("img").attr("align", "center").classed("college_logo", true);

	    searchForImageForCollege(schoolName);
	}
}

var comparisonCol;
 
 function compare()
 {
 	d3.select("#comparisonTable").remove();
 
 	largeName.text(selectedSchoolObject.name);
 
 	// var comparisonData = [["", selectedSchoolObject.name, comparedSchoolObject.name]];
 	var comparisonData = [["", selectedSchoolObject.name, comparedSchoolObject.name]];
 
 	var males1 = parseInt(selectedSchoolObject["demographics"]["total_men"]);
 	var females1 = parseInt(selectedSchoolObject["demographics"]["total_women"]);
 	var total1 = parseInt(selectedSchoolObject["demographics"]["total"]);
 
 	var males2 = parseInt(comparedSchoolObject["demographics"]["total_men"]);
 	var females2 = parseInt(comparedSchoolObject["demographics"]["total_women"]);
 	var total2 = parseInt(comparedSchoolObject["demographics"]["total"]);
 
 	var malesProp1 = parseFloat(males1 / total1).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 	var femalesProp1 = parseFloat(females1 / total1).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 	var malesProp2 = parseFloat(males2 / total2).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 	var femalesProp2 = parseFloat(females2 / total2).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 
 	if (malesProp1 == ".")
 		malesProp1 = "0.";
 	if (femalesProp1 == ".")
 		femalesProp1 = "0.";
 	if (malesProp2 == ".")
 		malesProp2 = "0.";
 	if (femalesProp2 == ".")
 		femalesProp2 = "0.";
 
 	comparisonData.push([["Gender Split M/F", "default_compare"],
 	 [malesProp1 + "/" + femalesProp1, "default_compare"],
 	 [malesProp2 + "/" + femalesProp2, "default_compare"]]);
 
 	raceInfoBuffer1 = {};
 	raceInfoBuffer2 = {};
 
     raceInfoBuffer1["Black/African-American"] = parseInt(selectedSchoolObject["demographics"]["black_african_american_total"]);
     raceInfoBuffer1["Asian"] = parseInt(selectedSchoolObject["demographics"]["asian_total"]);
     raceInfoBuffer1["White"] = parseInt(selectedSchoolObject["demographics"]["white_total"]);
     raceInfoBuffer1["Hispanic/Latinx"] = parseInt(selectedSchoolObject["demographics"]["hispanic_latino_total"]);
     raceInfoBuffer1["Native Hawaiian/Other Pacific Islander"] = parseInt(selectedSchoolObject["demographics"]["native_hawaiian_other_pacific_islander_total"]);
 	raceInfoBuffer1["American Indian/Alaska Native"] = parseInt(selectedSchoolObject["demographics"]["american_indian_alaska_native_total"]);
 	raceInfoBuffer1["Multiracial"] = parseInt(selectedSchoolObject["demographics"]["two_plus_races_total"]);
 	raceInfoBuffer1["International"] = parseInt(selectedSchoolObject["demographics"]["nonresident_alien_total"]);
 
 	raceInfoBuffer2["Black/African-American"] = parseInt(comparedSchoolObject["demographics"]["black_african_american_total"]);
     raceInfoBuffer2["Asian"] = parseInt(comparedSchoolObject["demographics"]["asian_total"]);
     raceInfoBuffer2["White"] = parseInt(comparedSchoolObject["demographics"]["white_total"]);
     raceInfoBuffer2["Hispanic/Latinx"] = parseInt(comparedSchoolObject["demographics"]["hispanic_latino_total"]);
     raceInfoBuffer2["Native Hawaiian/Other Pacific Islander"] = parseInt(comparedSchoolObject["demographics"]["native_hawaiian_other_pacific_islander_total"]);
 	raceInfoBuffer2["American Indian/Alaska Native"] = parseInt(comparedSchoolObject["demographics"]["american_indian_alaska_native_total"]);
 	raceInfoBuffer2["Multiracial"] = parseInt(comparedSchoolObject["demographics"]["two_plus_races_total"]);
 	raceInfoBuffer2["International"] = parseInt(comparedSchoolObject["demographics"]["nonresident_alien_total"]);
 
 	var totalPop1 = 
 		raceInfoBuffer1["Black/African-American"] +
 		raceInfoBuffer1["Asian"] +
 		raceInfoBuffer1["White"] +
 		raceInfoBuffer1["Hispanic/Latinx"] +
 		raceInfoBuffer1["Native Hawaiian/Other Pacific Islander"] +
 		raceInfoBuffer1["American Indian/Alaska Native"] +
 		raceInfoBuffer1["Multiracial"] +
 		raceInfoBuffer1["International"];
 
 	var totalPop2 = 
 		raceInfoBuffer2["Black/African-American"] +
 		raceInfoBuffer2["Asian"] +
		raceInfoBuffer2["White"] +
		raceInfoBuffer2["Hispanic/Latinx"] +
 		raceInfoBuffer2["Native Hawaiian/Other Pacific Islander"] +
 		raceInfoBuffer2["American Indian/Alaska Native"] +
 		raceInfoBuffer2["Multiracial"] +
 		raceInfoBuffer2["International"];
 
 	raceProportionsBuffer1 = {};
 	raceProportionsBuffer1["Black/African-American"] = raceInfoBuffer1["Black/African-American"]/totalPop1;
 	raceProportionsBuffer1["Asian"] = raceInfoBuffer1["Asian"]/totalPop1;
 	raceProportionsBuffer1["White"] = raceInfoBuffer1["White"]/totalPop1;
 	raceProportionsBuffer1["Hispanic/Latinx"] = raceInfoBuffer1["Hispanic/Latinx"]/totalPop1;
 	raceProportionsBuffer1["Native Hawaiian/Other Pacific Islander"] = raceInfoBuffer1["Native Hawaiian/Other Pacific Islander"]/totalPop1;
 	raceProportionsBuffer1["American Indian/Alaska Native"] = raceInfoBuffer1["American Indian/Alaska Native"]/totalPop1;
 	raceProportionsBuffer1["Multiracial"] = raceInfoBuffer1["Multiracial"]/totalPop1;
 	raceProportionsBuffer1["International"] = raceInfoBuffer1["International"]/totalPop1;
 
 	raceProportionsBuffer2 = {};
 	raceProportionsBuffer2["Black/African-American"] = raceInfoBuffer2["Black/African-American"]/totalPop2;
 	raceProportionsBuffer2["Asian"] = raceInfoBuffer2["Asian"]/totalPop2;
 	raceProportionsBuffer2["White"] = raceInfoBuffer2["White"]/totalPop2;
 	raceProportionsBuffer2["Hispanic/Latinx"] = raceInfoBuffer2["Hispanic/Latinx"]/totalPop2;
 	raceProportionsBuffer2["Native Hawaiian/Other Pacific Islander"] = raceInfoBuffer2["Native Hawaiian/Other Pacific Islander"]/totalPop2;
 	raceProportionsBuffer2["American Indian/Alaska Native"] = raceInfoBuffer2["American Indian/Alaska Native"]/totalPop2;
 	raceProportionsBuffer2["Multiracial"] = raceInfoBuffer2["Multiracial"]/totalPop2;
 	raceProportionsBuffer2["International"] = raceInfoBuffer2["International"]/totalPop2;
 
 	comparisonData.push([["Total Student Enrollment", "light_gray_compare"],
 	 [parseFloat(totalPop1).toString(), "light_gray_compare"],
 	 [parseFloat(totalPop2).toString(), "light_gray_compare"]]);
 	for (var key in raceProportionsBuffer1)
 	{
 		var prop1 = parseFloat(raceProportionsBuffer1[key]).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 		var prop2 = parseFloat(raceProportionsBuffer2[key]).toFixed(3).replace(/\b0+/g, "").replace(/0*$/, '');
 		if (prop1 == ".")
 			prop1 = "0";
 		if (prop2 == ".")
 			prop2 = "0";
 
 		comparisonData.push([[key, "light_gray_compare"], [prop1, "light_gray_compare"], [prop2, "light_gray_compare"]]);
 	}
 
 	crimeInfoBuffer1 = {};
 	crimeInfoBuffer1["Total"] = parseInt(selectedSchoolObject["crime"]["total"]);
 	crimeInfoBuffer1["Murder"] = parseInt(selectedSchoolObject["crime"]["murder"]);
 	crimeInfoBuffer1["Negligent Manslaughter"] = parseInt(selectedSchoolObject["crime"]["negligent_manslaughter"]);
 	crimeInfoBuffer1["Forcible Sex Offense"] = parseInt(selectedSchoolObject["crime"]["forcible_sex_offense"]);
 	crimeInfoBuffer1["Nonforcible Sex Offense"] = parseInt(selectedSchoolObject["crime"]["nonforcible_sex_offense"]);
 	crimeInfoBuffer1["Robbery"] = parseInt(selectedSchoolObject["crime"]["robbery"]);
 	crimeInfoBuffer1["Aggravated Assault"] = parseInt(selectedSchoolObject["crime"]["aggravated_assault"]);
 	crimeInfoBuffer1["Burglary"] = parseInt(selectedSchoolObject["crime"]["burglary"]);
 	crimeInfoBuffer1["Motor Vehicle Theft"] = parseInt(selectedSchoolObject["crime"]["motor_vehicle_theft"]);
 	crimeInfoBuffer1["Arson"] = parseInt(selectedSchoolObject["crime"]["arson"]);
 
 	crimeInfoBuffer2 = {};
 	crimeInfoBuffer2["Total"] = parseInt(comparedSchoolObject["crime"]["total"]);
 	crimeInfoBuffer2["Murder"] = parseInt(comparedSchoolObject["crime"]["murder"]);
 	crimeInfoBuffer2["Negligent Manslaughter"] = parseInt(comparedSchoolObject["crime"]["negligent_manslaughter"]);
 	crimeInfoBuffer2["Forcible Sex Offense"] = parseInt(comparedSchoolObject["crime"]["forcible_sex_offense"]);
 	crimeInfoBuffer2["Nonforcible Sex Offense"] = parseInt(comparedSchoolObject["crime"]["nonforcible_sex_offense"]);
 	crimeInfoBuffer2["Robbery"] = parseInt(comparedSchoolObject["crime"]["robbery"]);
 	crimeInfoBuffer2["Aggravated Assault"] = parseInt(comparedSchoolObject["crime"]["aggravated_assault"]);
 	crimeInfoBuffer2["Burglary"] = parseInt(comparedSchoolObject["crime"]["burglary"]);
 	crimeInfoBuffer2["Motor Vehicle Theft"] = parseInt(comparedSchoolObject["crime"]["motor_vehicle_theft"]);
	crimeInfoBuffer2["Arson"] = parseInt(comparedSchoolObject["crime"]["arson"]);
 
 	for (var key in crimeInfoBuffer1)
 	{
 		var prop1 = parseFloat(crimeInfoBuffer1[key]);
 		var prop2 = parseFloat(crimeInfoBuffer2[key]);
 
 		comparisonData.push([[key, "enrollment_compare"],
 		 [crimeInfoBuffer1[key], prop1 > prop2 ? "worse_compare" : "better_compare"],
 		 [crimeInfoBuffer2[key], prop2 > prop1 ? "worse_compare" : "better_compare"]]);
 	}

 	var table = comparisonCol.append("table").attr("id", "comparisonTable");
 	var tbody = table.append("tbody");
 	var rows = tbody.selectAll("tr")
 	.data(comparisonData)
 	.enter()
 	.append("tr")
 	.selectAll("td")
 	.data(function(d) { return d; })
 	.enter()
 	.append("td")
 	.text(function(d){
 		return d[0];
 	})
 	.classed("default_compare", function(d){
 		return d[1] == "default_compare";
 	})
 	.classed("worse_compare", function(d){
 		return d[1] == "worse_compare";
 	})
 	.classed("better_compare", function(d){
 		return d[1] == "better_compare";
 	})
 	.classed("enrollment_compare", function(d){
 		return d[1] == "enrollment_compare";
 	})
 	.classed("light_gray_compare", function(d){
 		return d[1] == "light_gray_compare";
 	})
 	.classed("compare_cell", true);
 }
 
 function comparify()
 {
 	if (selectedSchoolObject != null) {
 		// collecting only pertinent data from the selectedSchoolObject
 		schoolName = selectedSchoolObject["name"];
 		// schoolBranch = selectedSchoolObject["branch"];
 		schoolInfoBuffer = {};
 		schoolInfoBuffer["Street Address"] = selectedSchoolObject["address"];
 		schoolInfoBuffer["City, State, Zip Code"] = selectedSchoolObject["city"] + ", " + selectedSchoolObject["state"] + " " + selectedSchoolObject["zip"];
 		// schoolInfoBuffer["Total Assets"] = selectedSchoolObject["endowment_assets"];
 		schoolInfoBuffer["Enrollment"] = selectedSchoolObject["demographics"]["total"];
 
 		var rootTable = d3.select("#detailVis")
 			.insert("div", "#canvas")
 		.attr("id", "rootTable")
 			.attr("class", "tab3")
 			.style("padding", "0px");
 
 
 		// adds school name
 		// var name = d3.select("#detailVis")
 		// 	.insert("h2", "#dataTable")
 		// 	.text(schoolName);
 
 		// console.log(schoolInfoBuffer);
 
 		// sets up the table based on schoolInfoBuffer	
 		// var infoTableCol = dataTable;
 
 
 
 		var outerTable = rootTable
 			.append("table");
 
 		var outerTBody = outerTable.append("tbody");
 		var searchBarCol = outerTBody.append("tr").style("background-color", "#222222").append("td").style("background-color", "#222222");
 		comparisonCol = outerTBody.append("tr").style("background-color", "#222222").append("td").style("background-color", "#222222");
 
 		var searchBar = searchBarCol.append("input").attr("type", "search").attr("placeholder", "Compare With School").attr("id", "comparisonField");
 		var searchBarButton = searchBarCol.append("button").attr("id", "compareButton").text("Compare");
 
 		if (comparedSchoolObject != null)
 		{
 			
 		}
 
 		d3.select("#compareButton").on("click", function () {
 			comparedSchoolObject = search($("#comparisonField").val());
 			compare();
 		})
 
 		$("#comparisonField").keyup(function (e) {
 		    if (e.keyCode == 13) {
 		        comparedSchoolObject = search($("#comparisonField").val());
 		        compare();
 		    }
 		});
 
 		if (comparedSchoolObject != null)
 		{
 			$("#comparisonField").val(comparedSchoolObject.name);
 		compare();
 			// $("#comparisonField").val(comparedSchoolObject.name);
 
			// build data array of arrays
 			// var comparisonData = [["", selectedSchoolObject.name, comparedSchoolObject.name]];
 
 			// var table = comparisonCol.append("table");
 			// var tbody = table.append("tbody");
 			// var rows = tbody.selectAll("tr")
 			// .data(comparisonData)
 			// .enter()
			// .append("tr")
 		// .enter()
 			// .append("td")
 			// .text(function(d){
 			// 	return d;
 			// })
 
 			// var table = infoTableCol
 			// 	.append("table");
 			// var tbody = table.append("tbody");
 			// var rows = tbody.selectAll("tr")
 			// 	.data(d3.entries(schoolInfoBuffer)) // d3.entries converts objects into entries with key:key value:value parameters
 			// 	.enter()
 			// 	.append("tr");
 
 			// adds left-side table headers
 			// rows.append("th")
 			// 	.text(function(d){
 			// 		return d.key;
			// 	});
 
 			// adds values
			// rows.append("td")
			// 	.text(function(d){
			// 		return d.value;
			// 	});
		}

		

		if (currentTab != 3) {
	    	d3.select("#rootTable").style("opacity", "0")
	    	.classed("fullyHidden", true).classed("fullyVisible", false);
	    }
	}
}


// function for making the gender proportion bars
function genderize() {

	var genderScale = d3.scale.linear().domain([0, 1]).range([0, genderBarVis.w]);

	if (selectedSchoolObject !== null) {
		var males = parseInt(selectedSchoolObject["demographics"]["total_men"]);
		var females = parseInt(selectedSchoolObject["demographics"]["total_women"]);
		var total = parseInt(selectedSchoolObject["demographics"]["total"]);

		var mPercent = males/total;
		var fPercent = females/total;
		var oPercent = (total-(males+females))/total;

		var genderBars = d3.select("#detailVis")
			.select("#canvas")
			.append("g")
    		.attr("id", "genderBars")
    		.attr("class", "tab1");

		genderBars.append("text")
			.attr("class", "detailVisHeader")
			.attr("x", genderBarVis.x)
			.attr("y", genderBarVis.y - 5)
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
			.text(100 * Math.round(10000 * parseFloat(mPercent))/10000 + "% M");

		var femaleText = genderBars.append("text")
			.attr("x", genderBarVis.x + genderBarVis.w)
			.attr("y", genderBarVis.y + genderBarVis.barheight + 20)
			.attr("text-anchor", "end")
			.attr("class", "detailVisDetailText")
			.text(100 * Math.round(10000 * parseFloat(fPercent))/10000 + "% F");
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
	// raceInfoBuffer["Multiracial"] = parseInt(selectedSchoolObject["demographics"]["two_plus_races_total"]);
	// raceInfoBuffer["International"] = parseInt(selectedSchoolObject["demographics"]["nonresident_alien_total"]);

	raceProportionsBuffer = {};
	var totalPop = 
		raceInfoBuffer["Black/African-American"] +
		raceInfoBuffer["Asian"] +
		raceInfoBuffer["White"] +
		raceInfoBuffer["Hispanic/Latinx"] +
		raceInfoBuffer["Native Hawaiian/Other Pacific Islander"] +
		raceInfoBuffer["American Indian/Alaska Native"];
		// raceInfoBuffer["Multiracial"] +
		// raceInfoBuffer["International"];
	raceProportionsBuffer["Black/African-American"] = raceInfoBuffer["Black/African-American"]/totalPop;
	raceProportionsBuffer["Asian"] = raceInfoBuffer["Asian"]/totalPop;
	raceProportionsBuffer["White"] = raceInfoBuffer["White"]/totalPop;
	raceProportionsBuffer["Hispanic/Latinx"] = raceInfoBuffer["Hispanic/Latinx"]/totalPop;
	raceProportionsBuffer["Native Hawaiian/Other Pacific Islander"] = raceInfoBuffer["Native Hawaiian/Other Pacific Islander"]/totalPop;
	raceProportionsBuffer["American Indian/Alaska Native"] = raceInfoBuffer["American Indian/Alaska Native"]/totalPop;
	// raceProportionsBuffer["Multiracial"] = raceInfoBuffer["Multiracial"]/totalPop;
	// raceProportionsBuffer["International"] = raceInfoBuffer["International"]/totalPop;

	// selects the canvas on which to bake the pie
    var racePie = d3.select("#detailVis")
    	.select("#canvas")
    	.append("g")
    	.attr("id", "racePie")
    	.attr("class", "tab1");

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
 
    var raceNames = d3.keys(raceInfoBuffer);

    var racePercents = racePie.selectAll("text.raceText")
    	.data(d3.entries(raceProportionsBuffer))
    	.enter()
    	.append("text")
    	.attr("x", 38 + racePieVis.x + 10)
        .attr("y", function(d,i) {
        	return racePieVis.h + 15 + racePieVis.y + (10 * (i + 1));
        })
        .attr("text-anchor", "end")
        .attr("class", "raceText")
        .text(function(d, i) { 
        	return 100 * Math.round(10000 * parseFloat(d.value))/10000 + "%"; 
        });

    var raceBoxes = racePie.selectAll("rect")
    	.data(raceNames)
    	.enter()
		.append("rect")
    	.attr("width", "10px")
    	.attr("height", "10px")
    	.attr("x", 40 + racePieVis.x + 10)
        .attr("y", function(d,i) {
        	return racePieVis.h + 15 + racePieVis.y + (10 * i);
        })
        .attr("fill", function(d,i) {
        	return pieColor(i);
        })
        .attr("label", function(d, i) { 
        	return d; 
        });

    var raceLabels = racePie.selectAll("text.pieText")
    	.data(raceNames)
    	.enter()
    	.append("text")                                     //add a label to each slice
        .attr("x", 54 + racePieVis.x + 10)
        .attr("y", function(d,i) {
        	return racePieVis.h + 15 + racePieVis.y + (10 * (i + 1));
        })
        .attr("text-anchor", "left")                          //center the text on it's origin
        .attr("class", "pieText")
        .text(function(d, i) { 
        	return d; 
        });        //get the label from our original data array



    // TODO: make descriptive text append to a neatly sorted area
    // TODO: make descriptive text append with boxes for the correct color
}

function financify() {
	// pulls financial aid info
	financeInfoBuffer = {};
	financeInfoBuffer["Average"] = parseInt(selectedSchoolObject["finaid"]["average"]);
	financeInfoBuffer["$0-$3k"] = parseInt(selectedSchoolObject["finaid"]["income_0_30000"]);
	financeInfoBuffer["$30k-$48k"] = parseInt(selectedSchoolObject["finaid"]["income_30001_48000"]);
	financeInfoBuffer["$48k-$75k"] = parseInt(selectedSchoolObject["finaid"]["income_48001_75000"]);
	financeInfoBuffer["$75k-110k"] = parseInt(selectedSchoolObject["finaid"]["income_75001_110000"]);
	financeInfoBuffer["$110k+"] = parseInt(selectedSchoolObject["finaid"]["income_110001_more"]);

	financeInfo = d3.entries(financeInfoBuffer);
	financeInfoKeys = d3.keys(financeInfoBuffer);

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
    var financialAidBars = d3.select("#detailVis")
    	.select("#canvas")
    	.append("g")
    	.attr("id", "financialAidBars")
    	.attr("class", "tab1");

    // makes the title
    financialAidBars.append("text")
		.attr("class", "detailVisHeader")
		.attr("x", financialAidBarVis.x)
		.attr("y", (financialAidBarVis.y - 5))
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
                return "rotate(-65)" ;
            });

    financialAidBars.append("g")
        .attr("class", "axis")
        .attr("id", "financialYAxis")
        .attr("transform", "translate(" + (financialAidBarVis.chartX) + "," + financialAidBarVis.chartY +")")
        .call(fBYAxis)
        .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", -70)
	        .attr("x", -financialAidBarVis.h/2)
	        .attr("dy", "1em")
	        .style("text-anchor", "middle")
	        .text("Average financial aid ($)")
	  			.attr("class", "tick");

    if (financeInfoBuffer["Average"] == 0) {
    	var blankAlert = financialAidBars.append("g")
    		.attr("class", "alertWindow");
    	blankAlert.append("rect")
    		.attr("width", "120px")
    		.attr("height", "20px")
    		.attr("x", financialAidBarVis.chartX + financialAidBarVis.w/4 - 10)
    		.attr("y", financialAidBarVis.chartY + financialAidBarVis.h/2 - 15);
    	blankAlert.append("text")
    		.attr("x", financialAidBarVis.chartX + financialAidBarVis.w/4 + 60 - 10)
    		.attr("y", financialAidBarVis.chartY + financialAidBarVis.h/2 + 15 - 15)
    		.attr("text-anchor", "middle")
    		.text("No data available.");
    }

    if (currentTab != 1) {
    	d3.selectAll(".tab1")
    	.attr("opacity", "0");
    }
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
    var crimeBars = d3.select("#detailVis")
    	.select("#canvas")
    	.append("g")
    	.attr("id", "crimeBars")
    	.attr("class", "tab2");

    // makes the title
    crimeBars.append("text")
		.attr("class", "detailVisHeader")
		.attr("x", crimeBarVis.x)
		.attr("y", (crimeBarVis.y - 5))
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
                return "rotate(-65)" ;
            });

    crimeBars.append("g")
        .attr("class", "axis")
        .attr("id", "crimeYAxis")
        .attr("transform", "translate(" + crimeBarVis.chartX + "," + crimeBarVis.chartY +")")
        .call(cBYAxis)
        .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", -40)
	        .attr("x", -crimeBarVis.h/2)
	        .attr("dy", "1em")
	        .style("text-anchor", "middle")
	        .text("Crimes per year")
	  			.attr("class", "tick");

    if (crimeInfoBuffer["total"] == 0) {
    	var blankAlert = crimeBars.append("g")
    		.attr("class", "alertWindow");
    	blankAlert.append("rect")
    		.attr("width", "120px")
    		.attr("height", "20px")
    		.attr("x", crimeBarVis.w/2 - 20)
    		.attr("y", crimeBarVis.h/2 + 15);
    	blankAlert.append("text")
    		.attr("x", crimeBarVis.w/2 + 40)
    		.attr("y", crimeBarVis.h/2 + 30)
    		.attr("text-anchor", "middle")
    		.text("No data available.");
    }

    if (currentTab != 2) {
    	d3.selectAll(".tab2")
    	.attr("opacity", "0");
    }   
}

function statecrimeify() {

	crimeInfoBuffer = {};
	crimeInfoBuffer["total"] = parseInt(selectedSchoolObject["college_crime"]["total"]);
	crimeInfoBuffer["murder"] = parseInt(selectedSchoolObject["college_crime"]["murder"]);
	crimeInfoBuffer["negligent manslaughter"] = parseInt(selectedSchoolObject["college_crime"]["negligent_manslaughter"]);
	crimeInfoBuffer["forcible sex offense"] = parseInt(selectedSchoolObject["college_crime"]["forcible_sex_offense"]);
	crimeInfoBuffer["nonforcible sex offense"] = parseInt(selectedSchoolObject["college_crime"]["nonforcible_sex_offense"]);
	crimeInfoBuffer["robbery"] = parseInt(selectedSchoolObject["college_crime"]["robbery"]);
	crimeInfoBuffer["aggravated assault"] = parseInt(selectedSchoolObject["college_crime"]["aggravated_assault"]);
	crimeInfoBuffer["burglary"] = parseInt(selectedSchoolObject["college_crime"]["burglary"]);
	crimeInfoBuffer["motor vehicle theft"] = parseInt(selectedSchoolObject["college_crime"]["motor_vehicle_theft"]);
	crimeInfoBuffer["arson"] = parseInt(selectedSchoolObject["college_crime"]["arson"]);

	crimeInfo = d3.entries(crimeInfoBuffer);
	crimeInfoKeys = d3.keys(crimeInfoBuffer);

	// console.log(crimeInfo);

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
    var crimeBars = d3.select("#detailVis")
    	.select("#canvas")
    	.append("g")
    	.attr("id", "crimeBars")
    	.attr("class", "tab2");

    // makes the title
    crimeBars.append("text")
		.attr("class", "detailVisHeader")
		.attr("x", crimeBarVis.x)
		.attr("y", (crimeBarVis.y - 5))
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
                return "rotate(-65)" ;
            });

    crimeBars.append("g")
        .attr("class", "axis")
        .attr("id", "crimeYAxis")
        .attr("transform", "translate(" + crimeBarVis.chartX + "," + crimeBarVis.chartY +")")
        .call(cBYAxis);

    if (crimeInfoBuffer["total"] == 0) {
    	var blankAlert = crimeBars.append("g")
    		.attr("class", "alertWindow");
    	blankAlert.append("rect")
    		.attr("width", "120px")
    		.attr("height", "20px")
    		.attr("x", crimeBarVis.w/2 - 20)
    		.attr("y", crimeBarVis.h/2 + 15);
    	blankAlert.append("text")
    		.attr("x", crimeBarVis.w/2 + 40)
    		.attr("y", crimeBarVis.h/2 + 30)
    		.attr("text-anchor", "middle")
    		.text("No data available.");
    }

    if (currentTab != 2) {
    	d3.selectAll(".tab2")
    	.attr("opacity", "0");
    }   
}
