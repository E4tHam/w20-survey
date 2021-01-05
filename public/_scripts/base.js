
/* base.js */


// constants
const clamp = ( min, T, max ) => Math.max( min, Math.min( T, max ) );
const goldenratio       = 0.61803;


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

const ScoreSpan         = document.getElementById("Score");
const ScoreDiv          = document.getElementById("Score-Div");


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
var score               = NaN;
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






/* Chart */

function initializeChart() {

    chart = new Chart(ctx, {
        type: 'line',

        data: {
            // labels: chartLabels,
            datasets: [{
                borderColor : 'blue',
                fill        : false,
                borderWidth : 1,
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
                    ticks: {
                        suggestedMin: -10,
                        suggestedMax:  10,

                        callback: function( label ) {
                            label = Math.round( (label + Number.EPSILON ) * 10) / 10
                            return Number.isInteger( label ) ? ( label + ".0" ) : label;
                        }
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

                        callback: function( label ) {
                            label = Math.round( (label + Number.EPSILON ) * 10) / 10
                            return Number.isInteger( label ) ? ( label + ".0" ) : label;
                        }
                    }
                }]
            }
        }
    });

}


function updateMax() {
    if ( CLIENT_DATA.length != 0 )
        max = Math.max( max, CLIENT_DATA[ CLIENT_DATA.length - 1 ] );
}



function updateChart() {

    // Data
    let next = {
        x: time(),
        y: CLIENT_DATA[ CLIENT_DATA.length - 1 ]
    }

    chart.data.datasets[0].data.push( next );


    chart.options.scales.xAxes[0].ticks.min = Math.max( 0, next.x - _timeWidth );
    chart.options.scales.xAxes[0].ticks.max = Math.max( _timeWidth, next.x );

    // Max
    updateMax();
    chart.data.datasets[1].data = [
    {
        x: 0    ,
        y: max
    },{
        x: next.x + _timeWidth  ,
        y: max
    }];

    // Update
    chart.update();

}



// Score

function displayScore() {
    ScoreSpan.innerHTML = score;
    ScoreDiv.style.display = "block";
}
