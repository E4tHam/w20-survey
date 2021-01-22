
/* head.js */


// Initialize

initializeChart();

var animationFrameRequest   = NaN;

//


function handle_StartButton() {
    frame = 0;
    data_t = 0;
    paused = false;

    StartButton.disabled = true;

    if ( hasSlider ) {
        Slider.disabled = false;
        handle_Slider();
    }

    if ( hasStopButton )
        StopButton.disabled = false;

    toggleVisibility( CurrentValuesDiv );
    draw();
}

async function stop_execution() {
    frame = NaN;
    data_t = NaN;
    paused = true;

    cancelAnimationFrame(animationFrameRequest);

    if ( hasSlider )
        Slider.disabled = true;

    if ( hasStopButton )
        StopButton.disabled = true;

    toggleVisibility( CurrentValuesDiv );

    updateEarnings();
    updateFinalStats();
    toggleVisibility( FinalValuesDiv );

    // save the actions and CLIENT_DATA
    await storeProccessData();

    // save the next proccess
    await incrementProccess();

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

    // console.log(`time: ${time()}`);

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

    data_t += ( hasSlider && DATA_SET == "correlated" ) ? (
        slider_speed * slider_speed * 100 / FPS
    )       : 100;

    frame++;
}
