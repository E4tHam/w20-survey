
/* head.js */


function handle_StartButton() {
    frame = 0;
    paused = false;

    StartButton.disabled = true;
    
    try {
        Slider.disabled = false;
    } catch ( error ) { }
    
    try {
        StopButton.disabled = false;
    } catch (error) { }
    
    draw();
}

function stop_execution() {
    frame = NaN;
    paused = true;

    try {
        Slider.disabled = true;
    } catch ( error ) { }
    
    try {
        StopButton.disabled = true;
    } catch (error) { }

    ContinueButton.disabled = false;
}


initial_draw();
function initial_draw() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    drawAxies();
}

function draw() { setTimeout(function() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    
    /* Update */
    try {
        if ( isNaN( frame ) )
            throw new Stop();
        updateClientData();
    } catch ( error ) {
        if ( !(error instanceof Stop) )
            throw error;

        // console.log("Stopping!");
        stop_execution();
        return;   
    }

    /* Draw */    
    drawAxies();
    drawData();
    drawMax();


    frame += ( paused ? 0 : 1 );
    requestAnimationFrame( draw );
}, 1000/FPS);}
