
/* chart.js */


const clamp = ( min, X, max ) => Math.max( min, Math.min( X, max ) );

const canvas = document.getElementById( "Chart-Canvas" );
var DATA = [];

const ctx = canvas.getContext("2d");

var time = 0;
var max = 0;

const dataPeriod = 4;

const xstep = 6;
const ystep = 10;
const xsteppx = 0.1;
const ysteppx = 0.1;
const font = 0.075;

var xbegin = canvas.width  *  font;
var ybegin = canvas.height * (1-font);
var xend = canvas.width*0.8;
var yend = 0;

var paused = 1;

/* Event Listeners */
window.addEventListener('resize', fitToContainer);
function fitToContainer() {
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    xbegin = canvas.width  *  font;
    ybegin = canvas.height * (1-font);
    xend = canvas.width*0.8;
    // yend = 0;
}

/* Initialize */
function initialize() {
    loadData();
    fitToContainer();
    draw();
    handle_NameInput();
}



/* Firebase */
const app   = firebase.app();
const db    = firebase.firestore();

const StartStopButton = document.getElementById("StartStopButton");
const NameInput = document.getElementById("NameInput");

function loadData() {
    db.collection("tests").doc("1").get()
        .then( doc => {
            DATA = doc.data().data;
            // console.log( doc.data() );
            console.log( DATA );
            NameInput.disabled = false;
        })
    ;
}
function handle_StartStop() {
    switch ( StartStopButton.getAttribute("state") ) {
        case "Start":
            StartStopButton.setAttribute("state","Stop");
            StartStopButton.innerHTML = "Stop";
            NameInput.disabled = true;
            paused = 0;

            break;
        case "Stop":
            paused = 1;
            StartStopButton.disabled = true;
            db.collection( "submissions" ).doc( NameInput.value ).set({
                name: NameInput.value,
                stopTime: time
            })
            .then(function() {
                alert("Submission successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing submission: ", error);
            });

            break;
        default:
            console.error( "Bad Button State." );
            break;
    }
}
function handle_NameInput() {
    StartStopButton.disabled = ( NameInput.value == "" );
}



/* Draw */

function xToPx( x_in ) {
    let out = xend - ((xsteppx*canvas.width) * (time - x_in) / xstep);
    if ( out < xbegin || out > canvas.width )
        return NaN;
    return out;
}
function yToPx( y_in ) {
    let out = ybegin - (y_in/ystep)*ysteppx*canvas.height;
    if ( out > ybegin || out < 0 )
        return NaN;
    return out;
}

function getValue( num ) {

    let data_i = Math.floor(num / dataPeriod);
    let data_w = (num % dataPeriod)/dataPeriod;

    return DATA[ Math.min( data_i,(DATA.length - 1) ) ]*(1 - data_w)
            + DATA[ Math.min( (data_i + 1), (DATA.length - 1) ) ]*(data_w);
    
}

function getTimeFromI( data_i ) {
    return data_i * dataPeriod;
}

function updateMax() {
    max = Math.max( max, getValue( time ) );
}

function drawAxies() {
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.font = (font*canvas.width*0.3)+"px Arial";

    ctx.moveTo( xbegin, ybegin )
    ctx.lineTo( xbegin, yend );
    ctx.stroke();
    
    for ( let dy_i = 0; (ybegin - ysteppx*dy_i*canvas.height) > yend; dy_i++ ) {
        ctx.fillText(""+Math.round( dy_i*ystep ), xbegin - font*canvas.width, yToPx(dy_i*ystep) + font*canvas.width*.1);
        ctx.moveTo( xbegin, yToPx(dy_i*ystep) );
        ctx.lineTo( xbegin-10, yToPx(dy_i*ystep) );
        ctx.stroke();
    }

    ctx.moveTo( xbegin, ybegin );
    ctx.lineTo( canvas.width, ybegin );
    ctx.stroke();

    let xtick_x = 0;
    let xtick_y = ybegin + font*canvas.width*.25;
    for ( let dx_i = Math.floor(time/xstep); xToPx( dx_i * xstep ) > xbegin; dx_i-- ) {
        if ( dx_i < 0 )
            break;

        xtick_x = xToPx( dx_i * xstep );

        ctx.fillText(
            ""+Math.round( dx_i*xstep ),
            xtick_x ,
            xtick_y
        );
    }

}

function drawData() {
    
    let data_begin = clamp(
        0,
        Math.ceil( ( time - ((xend-xbegin) * (xstep/(xsteppx*canvas.width))) ) / dataPeriod ),
        DATA.length-1
    );
    let data_end = clamp(
        0,
        Math.floor( time / dataPeriod ),
        DATA.length-1
    );

    // console.log(`data_begin : ${data_begin}`);
    // console.log(`data_end   : ${data_end}`);

    let linestart = NaN;
    let lineend = NaN;

    ctx.beginPath();
    ctx.strokeStyle = "#0000FF";
    ctx.fillStyle = "#0000FF";

    for ( let i = data_begin; i <= data_end; i++ ) {
        linestart = lineend;
        lineend = getTimeFromI( i );
        
        ctx.beginPath();
        ctx.moveTo( xToPx( linestart ), yToPx( getValue(linestart) ) );
        ctx.lineTo( xToPx( lineend ), yToPx( getValue(lineend) ) );
        ctx.stroke();

    }

    ctx.beginPath();
    ctx.moveTo( xToPx( getTimeFromI(data_end)  ), yToPx( getValue( getTimeFromI(data_end) ) ) );
    ctx.lineTo( xToPx( time ), yToPx( getValue(time) ) );
    ctx.stroke();

    let yaxis = time - ((xend-xbegin) * (xstep/(xsteppx*canvas.width)));
    if ( yaxis >= 0 ) {
        // console.log(`xToPx( getTimeFromI(data_begin): ${xToPx(getTimeFromI(data_begin))}`);
        // console.log(`xToPx( yaxis )                 : ${xToPx( yaxis )}`);
        ctx.beginPath();
        ctx.moveTo( xToPx( getTimeFromI(data_begin) ), yToPx( getValue( getTimeFromI(data_begin) ) ) );
        ctx.lineTo( xToPx( yaxis ), yToPx( getValue(yaxis) ) );
        ctx.stroke();
        // debugger;
    }


}

function drawMax() {
    // console.log(`max: ${max}`);
    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    ctx.fillStyle = "#FF0000";
    ctx.moveTo( xbegin,     yToPx( max ) );
    ctx.lineTo( canvas.width, yToPx( max ) );
    ctx.stroke();
}




const FPS = 12;
function draw() { setTimeout(function() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    
    drawAxies();
    drawData();
    updateMax();
    drawMax();
    time += (!paused);
    
    // console.log(`time:  ${time}`);

    
    requestAnimationFrame(draw);
}, 1000/FPS);}
