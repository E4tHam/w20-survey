
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

const DATA_SET          = ( CASE.indexOf( "Independent" ) !== -1 ) ? "independent"
                        : ( CASE.indexOf( "Correlated"  ) !== -1 ) ? "correlated"
                        : "UNKNOWN";

var hasSlider           = false;
var hasStopButton       = false;

// page elements
const StartButton       = document.getElementById("StartButton");
const ContinueButton    = document.getElementById("ContinueButton");

const EarningsSpan      = document.getElementById("Earnings-Span");
const EarningsDiv       = document.getElementById("Earnings-Div");


// firebase
const app               = firebase.app();
const db                = firebase.firestore();


// data from firebase
var processes           = [ "temp" ];
var SERVER_DATA         = [ 0 ];


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
const time              = () => frame/FPS;
var paused              = true;

const _stepSize         = 5;
const _maxTicksLimit    = 6;
const _timeWidth        = _stepSize * _maxTicksLimit;


// test
var max                 = 0;
var scalar              = 1;
var cost                = 0;
var earnings            = NaN;
class Stop { };






/* Firebase */

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
    await db.collection( "onload_data" ).doc( DATA_SET )
        .collection( "processes" ).doc( ""+processes[PROCESS] )
        .get()
        .then( doc => {
            SERVER_DATA = doc.data().data;
            // console.log( SERVER_DATA );
            StartButton.disabled = false;
        })
    ;
}



/* Buttons */

async function handle_ContinueButton() {
    ContinueButton.disabled = true;

    // redirect to next page
    if ( PROCESS === processes.length-1 ) {
        window.location.replace(
            "../../done"
        );
    }
    else if ( PROCESS < processes.length-1 ) {
        window.location.replace(
            "./?token=" + TOKEN
            + "&process="  + ( PROCESS + 1 )
        );
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
        // if final process
        if ( PROCESS === processes.length-1 ) {

            return db.collection( "submissions" ).doc( CASE )
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

        }
        // if not final process
        else if ( PROCESS < processes.length-1 ) {
            
            return db.collection( "submissions" ).doc( CASE )
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

        }
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
    if ( CLIENT_DATA.length != 0 )
        max = Math.max( max, CLIENT_DATA[ CLIENT_DATA.length - 1 ] );
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

function displayFeedback() {
    EarningsSpan.innerHTML = earnings.toFixed(2);
    EarningsDiv.style.display = "block";
}
