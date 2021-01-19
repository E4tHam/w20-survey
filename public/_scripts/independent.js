
/* independent.js */


const seconds_per_point = 3;
const frames_per_point  = FPS*seconds_per_point;

let point               = 0;

var slider_scalar       = 1;

function updateClientData() {

    point = Math.floor( frame/frames_per_point );

    // if time is up
    if ( SERVER_DATA.length <= point ) {
        console.log("[WARNING]: Time is up!");
        throw new Stop();
    }

    // if time is continuing
    else if ( frame % frames_per_point === 0 ) {
        // slider logic
        CLIENT_DATA.push(
            slider_scalar * SERVER_DATA[ point ]
        );
    }

    updateCost();

}

// For every second that the slider is at some value s, the subject pays a cost of c(s) = -a + b s
// where a and b are constants.
function updateCost() {
    let temp_scalar = CLIENT_DATA[ CLIENT_DATA.length - 1 ] / SERVER_DATA[ point ];
    cost += ( b * temp_scalar - a ) / FPS;
}

function updateChart() {

    let next = {
        x: time(),
        y: CLIENT_DATA[ CLIENT_DATA.length - 1 ]
    }

    chart.data.datasets[0].data.push( next );

    // if at the end of a line
    if ( ( frame + 1 ) % frames_per_point === 0 ) {
        next.x = ( frame + 0.5 ) / FPS;
        next.y = NaN;

        chart.data.datasets[0].data.push( next );
    }

    chart.options.scales.xAxes[0].ticks.min = Math.max( 0, next.x - _timeWidth );
    chart.options.scales.xAxes[0].ticks.max = Math.max( _timeWidth, next.x );

    updateMaxLineValue();

    chart.update();

}


function initializeChart() {

    initializeChartBase();

    chart.data.datasets[0].borderWidth = 2;

}
