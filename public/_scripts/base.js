
/* base.js */


const clamp = ( min, T, max ) => Math.max( min, Math.min( T, max ) );

var canvas              = document.getElementById( "Chart-Canvas" );
var ctx                 = canvas.getContext("2d");

const urlParams         = new URLSearchParams(window.location.search);
const CASE              = document.currentScript.getAttribute("case");
const TOKEN             = urlParams.get("token");
const TEST              = parseInt( urlParams.get("test") );

const ContinueButton    = document.getElementById("ContinueButton");
const StartButton       = document.getElementById("StartButton");

var SERVER_DATA         = [ ];
var CLIENT_DATA         = [ ];

const FPS               = 15;
var frame               = NaN;
var paused              = true;
var max                 = 0;
var scalar              = 1;

class Stop { };
var Actions             = new Object();

const ystep             = 10;
const ysteppx = () => 0.1 * canvas.height;
const xstep             = 6;
const xsteppx = () => 0.1 * canvas.width;
const font              = 0.075;

const xbegin = () => canvas.width  *  font;
const ybegin = () => canvas.height * (1-font);
const xend   = () => canvas.width * 0.8;
const yend   = () => 0;

const app   = firebase.app();
const db    = firebase.firestore();

var tests   = [ "temp" ];


/* On Window Resize */
window.addEventListener('resize', fitToContainer);
function fitToContainer() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}



/* Firebase */

loadData();

async function loadData() {
    //  if URL test number is not firebase test number
    //      redirect
    await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "test" ).get()
            .then( doc => {
                if ( doc.data().finished == true )
                    window.location.replace(
                        "../../done"
                    );
                else if ( doc.data().current != TEST )
                    window.location.replace(
                        "./?token=" + TOKEN
                        + "&test="  + doc.data().current
                    );

                tests = doc.data().order;
        })
    ;

    // console.log( `Retrieving test number ${TEST}: ${tests[TEST]}.` );
    await db.collection( "tests" ).doc( tests[TEST] ).get()
        .then( doc => {
            SERVER_DATA = doc.data().data;
            // console.log( doc.data() );
            console.log( SERVER_DATA );
            StartButton.disabled = false;
        })
    ;
}



/* Buttons */

async function handle_ContinueButton() {
    ContinueButton.disabled = true;

    // save the actions and CLIENT_DATA
    await db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( ""+TEST )
        .set(
            Object.assign(
                Actions,
                {
                    test_id: tests[TEST],
                    data: CLIENT_DATA
                }
            )
        )
        .then(function() {
            console.log("Data successfully added!");
        }).catch(function(error) {
            console.error("Error adding data: ", error);
        });

    
    // if final test
    if ( TEST == tests.length-1 ) {
        
        await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "test" )
            .set({
                finished: true,
                order: tests
            })
        .then(function() {
            console.log("Test data updated.");
        }).catch(function(error) {
            console.error("Error updating data: ", error);
        });

        window.location.replace(
            "../../done"
        );
    }
    // if not final test
    else if ( TEST < tests.length-1 ) {
        // increment test document
        await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "test" )
            .set({
                finished: false,
                current: ( TEST + 1 ),
                order: tests
            })
        .then(function() {
            console.log("Test document successfully incremented!");
        }).catch(function(error) {
            console.error("Error incrementing test document: ", error);
        });

        window.location.replace(
            "./?token=" + TOKEN
            + "&test="  + ( TEST + 1 )
        );
    }
    else
        alert("Error!");
}


/* Update */

function updateMax() {
    if ( CLIENT_DATA.length != 0 )
        max = Math.max( max, CLIENT_DATA[ CLIENT_DATA.length - 1 ] );
}

/* Draw */

function xToPx( x_in ) {
    
}

function yToPx( y_in ) {
    let out = ybegin - (y_in/ystep)*ysteppx*canvas.height;
    if ( out > ybegin || out < 0 )
        return NaN;
    return out;
}

function drawAxies() {

}

function drawMax() {
    
}
