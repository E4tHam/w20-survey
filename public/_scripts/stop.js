
/* stop.js */


function handle_StopButton() {
    paused = true;
    Actions[ "StopTime" ] = frame/FPS;
    frame = NaN;
}
