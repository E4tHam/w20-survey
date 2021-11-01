
/* head.js */


// Initialize

initializeChart();

var animationFrameRequest   = NaN;

//


function handle_StartButton() {
    frame = 0;
    data_time = 0;
    data_time_prev = 0;
    paused = false;

    // reset client data
    CLIENT_DATA = [];

    StartButton.disabled = true;

    if ( hasSlider ) {
        enable_Sliders();
        handle_BreadthSlider();
    }

    if ( hasStopButton )
        StopButton.disabled = false;

    toggleVisibility( CurrentValuesDiv );
    draw();
}

async function stop_execution() {
    Actions[ "StopTime" ] = time();
    frame = NaN;
    data_time = NaN;
    paused = true;

    cancelAnimationFrame(animationFrameRequest);

    if ( hasSlider ) {
        disable_Sliders();
    }

    if ( hasStopButton )
        StopButton.disabled = true;

    toggleVisibility( CurrentValuesDiv );

    updateFinalStats();
    toggleVisibility( FinalValuesDiv );

    // save the actions and CLIENT_DATA
    await storeProccessData();

    // save the next proccess
    await incrementProccess();

    toggleVisibility( ControlsDiv );
    toggleVisibility( ContinueDiv );
    ContinueButton.disabled = false;

}

var  timer_now;
var  timer_then = Date.now();
const timer_interval = 1000/FPS;
var  timer_delta;

function draw() {

    animationFrameRequest = requestAnimationFrame( draw );
    // console.log(`animationFrameRequest : ${animationFrameRequest}`);

    // FPS Control
    timer_now = Date.now();
    timer_delta = timer_now - timer_then;
    if ( timer_delta < timer_interval )
        return;

    timer_then = timer_now - ( timer_delta % timer_interval );


    /* Update Client Data or Stop */
    try {
        if ( paused )
            throw new Stop();
        updateClientData();
    } catch ( error ) {
        if ( !(error instanceof Stop) )
            throw error;
        stop_execution();
        return;
    }

    /* Update Values */
    updateMax();
    updateCost();
    updateCurrentStats();

    /* Draw */
    updateChart();

    /* Check Stopping Condition */
    try {
        if ( !hasStopButton )
            checkStopCondition();
    } catch ( error ) {
        if ( !(error instanceof Stop) )
            throw error;
        stop_execution();
        return;
    }

    data_time_prev = data_time;
    data_time += ( hasSlider && DATA_SET == "correlated" ) ? (
        slider_speed * slider_speed * 15 / FPS
    )       : 15 / FPS;

    frame++;
}
