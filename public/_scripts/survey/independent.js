
/* independent.js */


const seconds_per_point = 3;
const frames_per_point  = FPS*seconds_per_point;
const point = () => Math.floor( frame / frames_per_point );

var slider_scalar       = 6.17;

var max_point = 30;

function updateClientData() {

    // if time is up
    if ( point() >= max_point || SERVER_DATA.length <= point() ) {
        handleOutOfPoints();
    }

    // if time is continuing
    else if ( frame % frames_per_point === 0 ) {
        // slider logic
        CLIENT_DATA.push(
            slider_scalar * SERVER_DATA[ point() ]
        );
    }

}

function handleOutOfPoints() {
    console.log("[WARNING]: Out of Points!");
    alert(`You have drawn the maximum of ${(point())} points, so the program will move to the next round.`);
    throw new Stop();
}

function costOf(slider_value) {
    return 0.02 * Math.exp(0.5 * slider_value);
}
function breadthOf(cost_value) {
    return Math.log(cost_value / 0.02) / 0.5;
}
function updateCost() {
    if (frame % frames_per_point === 0) {
        let set_scalar = CLIENT_DATA[ CLIENT_DATA.length - 1 ] / SERVER_DATA[ point() ];
        cost += costOf(set_scalar);
    }
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
