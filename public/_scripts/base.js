
/* base.js */


const clamp = ( min, T, max ) => Math.max( min, Math.min( T, max ) );
const goldenratio       = 0.61803;

const canvas            = document.getElementById( "Chart-Canvas" );
const ctx               = canvas.getContext("2d");
var chart;

const urlParams         = new URLSearchParams(window.location.search);
const CASE              = document.currentScript.getAttribute("case");
const TOKEN             = urlParams.get("token");
const PROCESS           = parseInt( urlParams.get("process") );

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

const app   = firebase.app();
const db    = firebase.firestore();

var processes   = [ "temp" ];



/* Firebase */

loadData();

async function loadData() {
    //  if URL process number is not firebase process number
    //      redirect
    await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "metadata" ).get()
            .then( doc => {
                if ( doc.data().finished == true )
                    window.location.replace(
                        "../../done"
                    );
                else if ( doc.data().current != PROCESS )
                    window.location.replace(
                        "./?token=" + TOKEN
                        + "&process="  + doc.data().current
                    );

                processes = doc.data().order;
        })
    ;

    // console.log( `Retrieving process number ${PROCESS}: ${processes[PROCESS]}.` );
    await db.collection( "processes" ).doc( processes[PROCESS] ).get()
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
        .collection( TOKEN ).doc( ""+PROCESS )
        .set(
            Object.assign(
                Actions,
                {
                    process_id: processes[PROCESS],
                    data: CLIENT_DATA
                }
            )
        )
        .then(function() {
            console.log("Data successfully added!");
        }).catch(function(error) {
            console.error("Error adding data: ", error);
        });

    
    // if final process
    if ( PROCESS == processes.length-1 ) {
        
        await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "metadata" )
            .set({
                finished: true,
                order: processes
            })
        .then(function() {
            console.log("Process data updated.");
        }).catch(function(error) {
            console.error("Error updating data: ", error);
        });

        window.location.replace(
            "../../done"
        );
    }
    // if not final process
    else if ( PROCESS < processes.length-1 ) {
        // increment process document
        await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "metadata" )
            .set({
                finished: false,
                current: ( PROCESS + 1 ),
                order: processes
            })
        .then(function() {
            console.log("Test document successfully incremented!");
        }).catch(function(error) {
            console.error("Error incrementing process document: ", error);
        });

        window.location.replace(
            "./?token=" + TOKEN
            + "&process="  + ( PROCESS + 1 )
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
