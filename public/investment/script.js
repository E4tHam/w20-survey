
// Paste all of the Javascript code into the "Qualtrics.SurveyEngine.addOnload" function for QUALTRICS question

//Function to get an embedded data variable from Qualtrics
getEmbeddedData = function (key) {
	var fieldName = 'ED~' + key;
	if ($(fieldName)) {
		return $(fieldName).value;
	}
}

//function for creating the chart
makeChart = function () {

	chart = new Highcharts.Chart("container", {
		chart: {
			renderTo: 'container',
			animation: false,
			events: {
				click: function (event) {
					var x = event.xAxis[0].value;
					var y = event.yAxis[0].value;

					if (started == false) {
						barrier = Math.round(y)
						chart.series[1].setData([[minX, barrier], [maxX, barrier]])

					} else {

					}

				}
			}
		},
		credits: { enabled: false },
		legend: { enabled: false },
		title: { text: '' },
		tooltip: { enabled: false },
		xAxis: {
			labels: {
				formatter: function () {
					return this.value >= 0 ? this.value : ""
				},
			},
			title: { text: 'Time' }, min: minX, max: maxX, gridLineWidth: 0, minorGridLineWidth: 0, lineWidth: 0.5, lineColor: "gray"
		},
		yAxis: {
			title: { text: 'Cash' }, min: 0, max: yRange, gridLineWidth: 0, minorGridLineWidth: 0
		},
		plotOptions: {
			series: {
				animation: false,
				states: { hover: { enabled: false } },
				line: {
					marker: { enabled: false },
					lineWidth: 1
				},
				stickyTracking: false
			}
		},
		series: [
			{ // Cash line
				type: "line",
				lineWidth: 1,
				data: [[0, c]]
			},

			{ // Cash dot
				type: "scatter", marker: { symbol: "circle", radius: 2, color: "grey" },
				data: [[0, c]]
			},
			{ // Max line
				type: "line",
				lineWidth: 0.5,
				// dashStyle: "LongDash",
				marker: { enabled: false },
				color: "red", allowOverlap: true,
				data: [[minX, c], [length, c]]
			},
			{ // Profit line
				type: "line",
				dashStyle: "ShortDash",
				lineWidth: 0.5,
				data: [[0, null]]
			}

		]
	});

}


// function called when slider changed
updateSlider = function (value, id) {

	console.log(value)
	document.getElementById("h").innerHTML = "Size(change):  " + value;
	h = parseFloat(value)


}


//function called in each tick, main experiment logic
tickEvents = function () {

	now = chart.series[0].data[chart.series[0].data.length - 1] //latest data point

	// console.log(chart.series[0].data)

	nextval = Math.random() <= p ? (1 + h) * now.y : (1 - h) * now.y //current cash

	maxVal = (nextval > maxVal) ? nextval : maxVal

	//Rescale axes
	if (chart.series[0].data.length > -0.5 * xRange + alpha * xRange) {
		minX = chart.series[0].data.length - xRange * alpha
		maxX = minX + xRange
	}

	chart.xAxis[0].update({ min: minX, max: maxX })

	if (now.y > yRange) {
		yRange += shift
	}

	chart.yAxis[0].update({ min: 0, max: yRange })

	//Update chart series
	chart.series[0].addPoint([now.x + 1, nextval]) //value line
	chart.series[1].setData([[now.x + 1, nextval]]) //value dot
	// chart.series[2].setData([[minX,c],[maxX,c]])
	chart.series[2].setData([[minX, maxVal], [maxX, maxVal]])

	//Stop timer when game is over
	if (now.x >= length) {
		clearInterval(ticker);
		document.getElementById("status").innerHTML = "The period is over.  Click to continue.";

		valueSeries = []
		chart.series[0].data.forEach(function (fdata) {
			valueSeries.push([fdata.x, fdata.y])
		})

		//For Printing Data To QUALTRICS Embedded variables
		//  var temp= Qualtrics.SurveyEngine.getEmbeddedData("parameters"); 
		// temp=temp+"|"+ insurance.toString() + "," + points.toString()+h.toString()+","+ p.toString()+","+","+ c.toString()		
		// Qualtrics.SurveyEngine.setEmbeddedData("parameters",temp)

		// var temp= Qualtrics.SurveyEngine.getEmbeddedData("valueSeries"); 
		// temp=temp+"|"+ valueSeries.toString()		
		// Qualtrics.SurveyEngine.setEmbeddedData("valueSeries",temp)

		//Qualtrics.SurveyEngine.setEmbeddedData("finished",1)
		//$('NextButton').show();

	}
}

//Define variables
var chart,
	ticker, // Defines the timer object
	started = false, // Has the game started
	c = 20, // investment cost
	alpha = 0.75, // How far on graph does the dot reach?
	xRange = 500, yRange = 50, //total width and height
	length = 500, //number of ticks in the round
	h = 0.05, p = 0.55, //size of brownian change, probability up
	q = 0.0029, //ending hazard parameter (reported to subjects but not used to determine period length in this code)
	shift = 10, // adjustment to vertical window if reach edge
	stopTime = -10, stopVal = -10, // for recording decisions
	points = 0, period = 1, minX = -0.5 * xRange, maxX = 0.5 * xRange, //Set initial range for plot
	maxVal = c

// For getting parameters from QUALTRICS loop and merge 
// var period= JSON.parse("${lm://Field/1}"),
//  	p= JSON.parse("${lm://Field/2}"),
// 		h= JSON.parse("${lm://Field/3}"),	
// 		c= JSON.parse("${lm://Field/4}"),	
// 		length= JSON.parse("${lm://Field/5}")

$j.getScript("https://code.highcharts.com/highcharts.js", function () {

	// Hide the QUALTRICS 'next' button until period is over
	// $('NextButton').hide()

	makeChart()

	// Put the parameters into the HTML on screen
	document.getElementById("status").innerHTML = "Press Enter to begin.";
	document.getElementById("points").innerHTML = "Points:  " + points;
	document.getElementById("p").innerHTML = "Prob(change):  " + p;
	document.getElementById("h").innerHTML = "Size(change):  " + h;
	document.getElementById("q").innerHTML = "Prob(end):  " + q;

});

//Keyboard events
$j(document).on('keydown', (e) => {

	if (e.which == 13 & !ticker) { //press Enter/Return

		document.getElementById("status").innerHTML = "The period has started."
		ticker = setInterval(tickEvents, 100)
		started = true

	}

	// if (e.which == 32 & ticker & points==0 ) { //press Enter/Return
	if (e.which == 32 & ticker & points <= 0) { //press Enter/Return

		now = chart.series[0].data[chart.series[0].data.length - 1]

		if (now.y > c) {
			points = now.y - c
			chart.series[3].setData([[now.x, 0], [now.x, yRange]])
			stopTime = now.x; stopVal = now.y;
			document.getElementById("points").innerHTML = "Points:  " + Math.round(points, 2);
			document.getElementById("status").innerHTML = "You have invested.  Please wait for the period to end.";
		}


	}

});