
/* correlated.js */


function updateClientData() {

    if ( SERVER_DATA.length <= frame ) {
        console.log("[WARNING]: Time is up!");
        // debugger;
        throw new Stop();
    }

    if ( CLIENT_DATA.length === 0 )
        CLIENT_DATA.push( SERVER_DATA[0] );

    else if ( CLIENT_DATA.length === frame )
        CLIENT_DATA.push(
            CLIENT_DATA[ frame - 1 ]
            + scalar * SERVER_DATA[ frame ]
        );
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
