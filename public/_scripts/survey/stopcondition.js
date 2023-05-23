
/* stopcondition.js */


// Let X be the value of process at that point

// Correlated:
// Let M be the max value achieved up to that point
// Stop when X < M - d where d is a constant
const d = 18.04;

// Independent:
// Let X be the value of process at that point
// Stop when X > t where t is some constant
const t = 6.69;

if ( DATA_SET == "independent" )
    document.getElementById( "IndependentSliderStopCondition" ).innerHTML = t;


Actions[ "StopConditionTime" ] = NaN;


function checkStopCondition() {
    // console.log("checking condition");

    if (
           ( DATA_SET === "correlated"
            && CLIENT_DATA[ CLIENT_DATA.length-1 ] < max - d    )
        ||
            ( DATA_SET === "independent"
            && CLIENT_DATA[ CLIENT_DATA.length-1 ] > t          )
    ) {
        console.log(`Stopping condition met: ${CLIENT_DATA[ CLIENT_DATA.length-1 ]} < ${max} - ${d}`);
        Actions[ "StopConditionTime" ] = time();
        throw new Stop();
    }

}
