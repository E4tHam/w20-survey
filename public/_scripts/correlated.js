
/* correlated.js */


function updateClientData() {
    
    if ( SERVER_DATA.length <= frame ) {
        console.log("[WARNING]: Time is up!");
        debugger;
        throw new Stop();
    }

    if ( CLIENT_DATA.length == 0 )
        CLIENT_DATA.push( SERVER_DATA[0] );

    else if ( CLIENT_DATA.length == frame )
        CLIENT_DATA.push(
            CLIENT_DATA[ frame - 1 ]
            + scalar * SERVER_DATA[ frame ]
        );
}

function getValue( frame ) {
    if ( isNaN( frame ) 
        || frame < 0
        || frame > CLIENT_DATA.length )
        return 0;
    
    return CLIENT_DATA[ frame ];
}

function initializeChart() {
    // console.log( `chart: ${chart}` );
    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
                fill: false,
                pointRadius: 0
            }]
        },
    
        // Configuration options go here
        options: {
            aspectRatio: ( 1 + goldenratio ),
            legend: {
                display: false
            },
            animation: {
                duration: 0
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            }
        }
    });
}

function updateChart() {
    updateMax();

}
