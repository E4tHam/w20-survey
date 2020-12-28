
/* independent.js */


const seconds_per_point       = 3;
const frames_per_point  = FPS*seconds_per_point;

function updateClientData() {

    let point = Math.floor( frame/frames_per_point );

    if ( SERVER_DATA.length <= point ) {
        console.log("[WARNING]: Time is up!");
        debugger;
        throw new Stop();
    }

    if ( CLIENT_DATA.length == 0 )
        CLIENT_DATA.push( SERVER_DATA[0] );

    else if (
        frame % frames_per_point == 0
        && CLIENT_DATA.length == point )

        CLIENT_DATA.push(
            CLIENT_DATA[ point - 1 ]
            + scalar * SERVER_DATA[ point ]
        );
}

function getValue( frame ) {

    let point = Math.floor( frame/frames_per_point );

    if ( isNaN( point )
        || point < 0
        || point > CLIENT_DATA.length )
        return 0;
    
    return CLIENT_DATA[ point ];
}

function drawData() {

}
