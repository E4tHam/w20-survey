
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


function draw() { setTimeout(function() {

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
    requestAnimationFrame( draw );
}, 1000/FPS );}
