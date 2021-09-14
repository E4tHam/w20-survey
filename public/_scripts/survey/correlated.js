
/* correlated.js */

var slider_speed        = 1;

function updateClientData() {

    let data_i = Math.round( data_time );

    // if time is up
    if ( time() >= timeLimit || data_i >= SERVER_DATA.length ) {
        handleOutOfTime();
    }

    // push
    CLIENT_DATA.push( SERVER_DATA[ data_i ] );

    updateCost();

}

// For every second that the slider is at some value s, the subject pays a cost of c(s) = -a + b*s
// where a and b are constants.
function updateCost() {
    cost += ( b * slider_speed - a ) / FPS;
}


function updateChart() {

    let next = {
        x: time(),
        y: CLIENT_DATA[ CLIENT_DATA.length - 1 ]
    }

    chart.data.datasets[0].data.push( next );


    chart.options.scales.xAxes[0].ticks.min = Math.max( 0, next.x - _timeWidth );
    chart.options.scales.xAxes[0].ticks.max = Math.max( _timeWidth, next.x );

    updateMaxLineValue();

    chart.update();
}


function initializeChart() {

    initializeChartBase();

    chart.data.datasets[0].borderWidth = 1;

}
