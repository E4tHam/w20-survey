
/* correlated.js */

var slider_speed        = 4;

function updateClientData() {

    let data_i_prev = Math.round( data_time_prev );
    let data_i = Math.round( data_time );

    // if time is up
    if ( time() >= timeLimit || data_i >= SERVER_DATA.length ) {
        handleOutOfTime();
    }
    if ((time()>3)&&( current_earnings() < earnings_floor )) {
        handleLowEarnings();
    }

    // push
    let new_server_data = Number.NEGATIVE_INFINITY;
    for ( let i = data_i_prev; i < data_i; i++ )
        new_server_data = Math.max( new_server_data, SERVER_DATA[i] );
    CLIENT_DATA.push( new_server_data );
}

function handleLowEarnings() {
    console.log("[WARNING]: Earnings are too low!");
    alert(`You have reached a negative profit of $${Math.abs(earnings_floor).toFixed(2)}, so the program will move to the next round.`);
    throw new Stop();
}


function costOf(slider_value) {
    return 0.06 * Math.exp(0.5 * slider_value);
}
function breadthOf(cost_value) {
    return Math.log(cost_value / 0.06) / 0.5;
}
function updateCost() {
    cost += costOf(slider_speed) / FPS;
}


function updateChart() {

    let next = {
        x: time(),
        y: CLIENT_DATA[CLIENT_DATA.length-1]
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
