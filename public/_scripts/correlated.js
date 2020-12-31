
/* correlated.js */


function updateClientData() {

    if ( SERVER_DATA.length <= frame ) {
        console.log("[WARNING]: Time is up!");
        // debugger;
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
