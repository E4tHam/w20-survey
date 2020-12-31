
/* stopcondition.js */


// Let X be the value of process at that point
// Let M be the max value achieved up to that point
// Stop when X < M - d where d is a constant

const d = 5;

function checkStopCondition() {
    // console.log("checking condition");
    if ( CLIENT_DATA[ CLIENT_DATA.length-1 ] < max - d ) {
        console.log("Stopping condition met.");
        throw new Stop();
    }
}
