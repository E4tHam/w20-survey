
/* correlated.js */

var slider_speed        = 4;

function updateClientData() {

    let data_i = Math.round( data_time );
    let data_i_next = Math.round( data_time_next );

    if ( time() >= timeLimit )
        handleOutOfTime();
    else if ( data_i_next >= SERVER_DATA.length )
        handleOutOfData();
    else if ( (time() > 0) && (current_earnings() < earnings_floor) )
        handleLowEarnings();

    // push
    let max_server_data = Number.NEGATIVE_INFINITY;
    CLIENT_DATA.push( max_server_data );
    for ( let i = data_i; i < data_i_next; i++ ) {
        max_server_data = Math.max( max_server_data, SERVER_DATA[i] );
        CLIENT_DATA[ CLIENT_DATA.length-1 ] = SERVER_DATA[i];
        if ( !hasStopButton ) {
            try {
                checkStopCondition();
            }
            catch (error) {
                // check if current data causes stop condition
                return;
            }
        }
    }
    CLIENT_DATA[ CLIENT_DATA.length-1 ] = max_server_data;
}

function handleOutOfTime() {
    console.log("[WARNING]: Time is up!");
    error_message = `You have exceeded ${time().toFixed(0)} seconds, so the program will move to the next round.`;
    throw new Stop();
}

function handleOutOfData() {
    console.log("[WARNING]: Time is up!");
    error_message = `You have exceeded the length of the data, so the program will move to the next round.`;
    throw new Stop();
}

function handleLowEarnings() {
    console.log("[WARNING]: Earnings are too low!");
    error_message = `You have reached a negative profit of $${Math.abs(earnings_floor).toFixed(2)}, so the program will move to the next round.`;
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
