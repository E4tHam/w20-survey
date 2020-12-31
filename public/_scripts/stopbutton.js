
/* stopbutton.js */


function handle_StopButton() {
    paused = true;
    Actions[ "StopTime" ] = time();
    frame = NaN;
}

function checkStopCondition() { }
