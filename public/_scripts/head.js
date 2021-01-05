
/* head.js */


// Initialize

initializeChart();

//


function handle_StartButton() {
    frame = 0;
    paused = false;

    StartButton.disabled = true;

    if ( hasSlider ) {
        Slider.disabled = false;
        handle_Slider();
    }

    if ( hasStopButton )
        StopButton.disabled = false;

    draw();
}

function stop_execution() {
    frame = NaN;
    paused = true;

    if ( hasSlider )
        Slider.disabled = true;

    if ( hasStopButton )
        StopButton.disabled = true;

    ContinueButton.disabled = false;

    displayFeedback();
}

var  timer_now;
var  timer_then = Date.now();
const timer_interval = 1000/FPS;
var  timer_delta;

function draw() {
    
    requestAnimationFrame( draw );

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


    frame++;
}
