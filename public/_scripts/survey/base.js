
/* base.js */

// constants
const clamp = ( min, T, max ) => Math.max( min, Math.min( T, max ) );
const goldenratio       = 0.61803;

// cost function
const a                 = 0.2;
const b                 = 0.2;

// page data
const urlParams         = new URLSearchParams( window.location.search );
const CASE              = document.currentScript.getAttribute("case");
const TOKEN             = urlParams.get("token");
const PROCESS           = parseInt( urlParams.get("process") );
const PRACTICE          = ( urlParams.get("practice") != null );

if ( TOKEN == null ) handle_noToken();
document.getElementById( "Round-Label" ).innerHTML = (PRACTICE?"Practice ":"") + "Round " + ( PROCESS + 1 );

const DATA_SET          = ( CASE.indexOf( "Independent" ) !== -1 ) ? "independent"
                        : ( CASE.indexOf( "Correlated"  ) !== -1 ) ? "correlated"
                        : "UNKNOWN";

var hasSlider           = false;
var hasStopButton       = false;


// page elements
const StartButton       = document.getElementById("StartButton");
const ContinueButton    = document.getElementById("ContinueButton");

const CurrentValuesDiv  = document.getElementById("CurrentValues");
const FinalValuesDiv    = document.getElementById("FinalValues");

const CurrentValueSpan  = document.getElementById("Current__Value");
const CurrentMaxSpan    = document.getElementById("Current__Max");
const FinalMaxSpan      = document.getElementById("Final__Max");
const FinalCostSpan     = document.getElementById("Final__Cost");
const FinalEarningsSpan = document.getElementById("Final__Earnings");
const ControlsDiv       = document.getElementById( "ControlsDiv" );
const ContinueDiv       = document.getElementById( "ContinueDiv" );

// firebase
const app               = firebase.app();
const db                = firebase.firestore();


// data from firebase
var processes           = [ "temp" ];
var SERVER_DATA         = [ 0 ];
const practices =
    (DATA_SET=="independent") ? ["p01","p01","p01","p02","p02","p02","p03","p03","p03"] :
    (DATA_SET=="correlated")  ? ["p01","p01","p01","p02","p02","p02","p03","p03","p03"] :
    ["error"];
var past_earnings       = 0;


// load firebase data
loadData();


// data for firebase
var Actions             = new Object();
var CLIENT_DATA         = [ 0 ];



// chart.js
const canvas            = document.getElementById( "Chart-Canvas" );
const ctx               = canvas.getContext("2d");
var chart;

const FPS               = 15;
var frame               = NaN;
var data_time           = NaN;
var data_time_prev      = NaN;
const time              = () => frame/FPS;
var paused              = true;
const timeLimit         = 100;


const _stepSize         = 5;
const _maxTicksLimit    = 6;
const _timeWidth        = _stepSize * _maxTicksLimit;


// test
var max                 = Number.NEGATIVE_INFINITY;
var cost                = 0;
var earnings            = NaN;
class Stop { };




function handle_noToken() {
    window.location.replace(
        "../start/"
    );
}


/* Firebase */

async function loadData() {
    //  if URL is not correct, redirect
    await db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "metadata" ).get()
            .then( doc => {
                if ( doc.data().finished == true ) // if finished, go to done
                    window.location.replace(
                        "../../done"
                    );
                else if ( doc.data().finished_processes == true ) // if finished with processes, go to questions
                    window.location.replace(
                        "../concluding_questions/?token=" + TOKEN
                    );
                else if (
                    doc.data().current != PROCESS
                    || doc.data().finished_practice === PRACTICE
                )   // if not at specified process, go to correct process
                    window.location.replace(
                        "./?token=" + TOKEN
                        + "&process="  + doc.data().current
                        + (doc.data().finished_practice?"":"&practice")
                    );

                // load order
                processes = doc.data().order;
                // total earnings
                past_earnings = doc.data().total_earnings;
        })
    ;

    // console.log( `Retrieving process number ${PROCESS}: ${processes[PROCESS]}.` );
    await db.collection( "onload_data" ).doc( DATA_SET )
        .collection( PRACTICE?"practice":"processes" ).doc( PRACTICE?practices[PROCESS]:processes[PROCESS] )
        .get()
        .then( doc => {
            SERVER_DATA = doc.data().data;
            StartButton.disabled = false;
        })
    ;
}



/* Buttons */

async function handle_ContinueButton() {
    ContinueButton.disabled = true;

    // redirect to next page
    if ( PRACTICE ) {
        if ( PROCESS === 8 ) {
            window.location.replace(
                "./?token=" + TOKEN
                + "&process=0"
            );
        }
        else if ( PROCESS < 8 ) {
            window.location.replace(
                "./?token=" + TOKEN
                + "&process="  + ( PROCESS + 1 )
                + "&practice"
            );
        }
    } else {
        if ( PROCESS === processes.length-1 ) {
            window.location.replace(
                "../concluding_questions/?token=" + TOKEN
            );
        }
        else if ( PROCESS < processes.length-1 ) {
            window.location.replace(
                "./?token=" + TOKEN
                + "&process="  + ( PROCESS + 1 )
            );
        }
    }
}

function storeProccessData() {

    return db.collection( "submissions" ).doc( CASE )
    .collection( TOKEN ).doc( ""+PROCESS )
    .set(
        Object.assign(
            Actions,
            {
                max: max,
                cost: cost,
                earnings: earnings,
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

}


function incrementProccess() {
    if ( PRACTICE ) {
        // if final practice round
        if ( PROCESS === 8 ) {
            return db.collection( "submissions" ).doc( CASE )
                .collection( TOKEN ).doc( "metadata" )
                .set({
                    finished_practice: true,
                    finished_processes: false,
                    finished: false,
                    current: 0,
                    order: processes,
                    total_earnings: 0
                })
            .then(function() {
                console.log("Process data updated.");
            }).catch(function(error) {
                console.error("Error updating data: ", error);
            });
        }
        // if not final practice round
        else if ( PROCESS < 8 ) {
            return db.collection( "submissions" ).doc( CASE )
                .collection( TOKEN ).doc( "metadata" )
                .set({
                    finished_practice: false,
                    finished_processes: false,
                    finished: false,
                    current: ( PROCESS + 1 ),
                    order: processes,
                    total_earnings: 0
                })
            .then(function() {
                console.log("Current proccess metadata successfully incremented!");
            }).catch(function(error) {
                console.error("Error incrementing current proccess metadata: ", error);
            });
        }
    } else {
        // if final process
        if ( PROCESS === processes.length-1 ) {
            return db.collection( "submissions" ).doc( CASE )
                .collection( TOKEN ).doc( "metadata" )
                .set({
                    finished_practice: true,
                    finished_processes: true,
                    finished: false,
                    order: processes,
                    total_earnings: past_earnings+earnings
                })
            .then(function() {
                console.log("Process data updated.");
            }).catch(function(error) {
                console.error("Error updating data: ", error);
            });
        }
        // if not final process
        else if ( PROCESS < processes.length-1 ) {
            return db.collection( "submissions" ).doc( CASE )
                .collection( TOKEN ).doc( "metadata" )
                .set({
                    finished_practice: true,
                    finished_processes: false,
                    finished: false,
                    current: ( PROCESS + 1 ),
                    order: processes,
                    total_earnings: past_earnings+earnings
                })
            .then(function() {
                console.log("Current proccess metadata successfully incremented!");
            }).catch(function(error) {
                console.error("Error incrementing current proccess metadata: ", error);
            });
        }
    }

}

function handleOutOfTime() {
    console.log("[WARNING]: Time is up!");
    alert(`You have been inactive for ${time()} seconds, so the program will move to the next round`);
    throw new Stop();
}



/* Chart */

function initializeChartBase() {

    chart = new Chart(ctx, {
        type: 'line',

        data: {
            datasets: [{
                borderColor : 'blue',
                fill        : false,
                pointRadius : 0
            },{
                borderColor : 'red',
                fill        : false,
                borderWidth : 3,
                pointRadius : 0
            }]
        },

        options: {
            tooltips    : { enabled: false }        ,
            hover       : { mode: null }            ,
            aspectRatio : ( 1 + goldenratio )       ,
            legend      : { display:  false }       ,
            animation   : { duration: 0 }           ,
            elements    : { line: { tension: 0 } }  ,

            scales: {
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        suggestedMin: -10,
                        suggestedMax:  10,

                        callback: function( label ) { return oneDecimalCallback( label ) }
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    ticks: {
                        maxTicksLimit   : _maxTicksLimit,
                        stepSize        : _stepSize,

                        min             : 0,
                        max             : _timeWidth,

                        maxRotation     : 0,
                        minRotation     : 0,

                        callback: function( label ) { return oneDecimalCallback( label ) }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Seconds",
                        fontSize: 15
                    }
                }]
            }
        }
    });

}

function oneDecimalCallback( label ) {
    label = Math.round( ( label + Number.EPSILON ) * 10) / 10
    return Number.isInteger( label ) ? ( label + ".0" ) : ( label + "" );
}

function updateMax() {
    if (DATA_SET=="correlated") {
        for ( let i = Math.round(data_time_prev); i <= Math.round(data_time); i++ )
            max = Math.max( max, SERVER_DATA[i] );
    } else if (DATA_SET=="independent") {
        if ( CLIENT_DATA.length != 0 )
            max = Math.max( max, CLIENT_DATA[ CLIENT_DATA.length - 1 ] );
    }
}



function updateMaxLineValue() {

    chart.data.datasets[1].data = [
    {
        x: chart.options.scales.xAxes[0].ticks.min,
        y: max
    },{
        x: chart.options.scales.xAxes[0].ticks.max,
        y: max
    }];

}



// Cost and Earnings

function updateEarnings() {
    earnings = max - cost;
}

function updateCurrentStats() {
    CurrentValueSpan.innerHTML = CLIENT_DATA[ CLIENT_DATA.length - 1 ].toFixed(2);
    CurrentMaxSpan.innerHTML = max.toFixed(2);
}

function updateFinalStats() {
    FinalMaxSpan.innerHTML      = max.toFixed(2);
    FinalCostSpan.innerHTML     = cost.toFixed(2);
    FinalEarningsSpan.innerHTML = earnings.toFixed(2);
}

function toggleVisibility( div ) {
    if ( div.style.display == "none" ) {
        div.style.display = "block";
    }
    else {
        div.style.display = "none";
    }
}
