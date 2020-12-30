
/* independent.js */


const seconds_per_point       = 3;
const frames_per_point  = FPS*seconds_per_point;


function updateClientData() {

    let point = Math.floor( frame/frames_per_point );

    // if time is up
    if ( SERVER_DATA.length <= point ) {
        console.log("[WARNING]: Time is up!");
        debugger;
        throw new Stop();
    }

    // if time has just begun
    else if ( CLIENT_DATA.length == 0 ) {
        CLIENT_DATA.push( SERVER_DATA[0] );
    }

    // if time is continuing
    else if (
        frame % frames_per_point == 0
        && CLIENT_DATA.length == point ) {

        // slider logic
        CLIENT_DATA.push(
            scalar * SERVER_DATA[ point ]
        );
    }
}

function getValue( frame ) {

    let point = Math.floor( frame/frames_per_point );

    if ( isNaN( point )
        || point < 0
        || point > CLIENT_DATA.length )
        return 0;
    
    return CLIENT_DATA[ point ];
}


function initializeChart() {
    console.log( `chart: ${chart}` );
}


function updateChart() {
    updateMax();
    
}
