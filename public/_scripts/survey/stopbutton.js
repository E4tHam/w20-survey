
/* stopbutton.js */


hasStopButton           = true;
const StopButton        = document.getElementById( "StopButton" );

StopButton.setAttribute("style","");

Actions[ "StopTime" ]   = NaN;



function handle_StopButton() {
    paused = true;
    Actions[ "StopTime" ] = time();
    frame = NaN;
    data_time = NaN;
}
