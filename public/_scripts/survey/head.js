
/* head.js */


// Initialize

initializeChart();

var animationFrameRequest   = NaN;

//

if ( hasSlider ) {
    enable_Sliders();
    handle_BreadthSlider();
}

const data_time_delta = () => (DATA_SET=="correlated") ? Math.pow(slider_speed,2.0) : 1;

function handle_StartButton() {
    frame = 0;

    if ( hasSlider ) updateValuesFrom_Sliders();

    data_time_next = 0;

    // reset client data
    CLIENT_DATA = [];

    StartButton.disabled = true;

    if ( hasStopButton )
        StopButton.disabled = false;

    toggleVisibility( CurrentValuesDiv );
    draw();
}

async function stop_execution() {
    Actions[ "StopTime" ] = time();
    frame = NaN;
    data_time_next = NaN;
    stopped = true;

    cancelAnimationFrame(animationFrameRequest);

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

    /* Increment time */
    data_time = data_time_next;

    /* Update Breadth */
    if ( hasSlider )
        updateValuesFrom_Sliders();

    /* Choose number of server data points to check */
    data_time_next += data_time_delta();

    /* Update Client Data or Stop */
    try {
        if (stopped) throw new Stop();

        /* Try to push to CLIENT_DATA */
        updateClientData();

        /* Update Values */
        updateMax();
        updateCost();
        updateCurrentStats();

        /* Check Stopping Condition */
        if ( !hasStopButton )
            checkStopCondition();

    } catch ( error ) {
        if ( !(error instanceof Stop) )
            throw error;
        stopped = true;
        if ( hasSlider ) disable_Sliders();
        if ( hasStopButton ) StopButton.disabled = true;
        if ( !((DATA_SET=="independent") && ((frame%frames_per_point) < stop_line_length)) ) {
            if (error_message != "") alert(error_message);
            stop_execution();
            return;
        }
    }

    /* Draw */
    updateChart();

    frame++;
}
