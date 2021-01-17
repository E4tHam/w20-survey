
/* correlated.js */


function updateClientData() {

    // if time is up
    if ( SERVER_DATA.length <= frame ) {
        console.log("[WARNING]: Time is up!");
        throw new Stop();
    }

    // if time has just begun
    else if ( CLIENT_DATA.length === 0 ) {
        CLIENT_DATA.push( SERVER_DATA[0] );
    }

    // if time is continuing
    else {
        CLIENT_DATA.push(
            CLIENT_DATA[ CLIENT_DATA.length - 1 ]
            + scalar * SERVER_DATA[ frame ]
        );
    }

    updateCost();

}

// For every second that the slider is at some value s, the subject pays a cost of c(s) = -a + b*s
// where a and b are constants.
function updateCost() {
    cost += ( b * scalar - a ) / FPS;
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
