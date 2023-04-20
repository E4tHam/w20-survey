
/* start.js */


const app                   = firebase.app();
const db                    = firebase.firestore();

const SubmitButton          = document.getElementById( "SubmitButton" );
const NameInput             = document.getElementById( "NameInput" );
const SessionIdInput        = document.getElementById( "SessionIdInput" );
const ComputerNumberInput   = document.getElementById( "ComputerNumberInput" );

const CASE                  = document.currentScript.getAttribute("case");
var NAME                    = "";
var SESSIONID               = "";
var COMPUTERNUMBER          = "";
var TOKEN                   = NaN;

const DATA_SET              = ( CASE.indexOf( "Independent" ) !== -1 ) ? "independent"
                            : ( CASE.indexOf( "Correlated"  ) !== -1 ) ? "correlated"
                            : "UNKNOWN";


var processes               = [ "temp" ];

db.collection( "onload_data" ).doc( DATA_SET )
        .collection( "processes" ).doc( "document_ids" )
    .get()
        .then( doc => {
            processes = doc.data().ids;
        }).catch(function(error) {
            console.error( "Error loading processes: ", error );
            alert( "Please try again later." );
        })
;

NameInput.disabled = false;
SessionIdInput.disabled = false;
ComputerNumberInput.disabled = false;




/* Buttons */

var input_status = new Map();

handle_NameInput();
function handle_NameInput() {
    let status = ( NameInput.value !== "" );
    if (status) NAME = NameInput.value;
    else NAME = null;
    input_status.set("SubmitButton", status );
    update_SubmitButton_status();
}
handle_SessionIdInput();
function handle_SessionIdInput() {
    let status = SessionIdInput.value.length > 0 && SessionIdInput.value.match("^[a-zA-Z0-9]+$");
    if (status) SESSIONID = SessionIdInput.value.toUpperCase();
    else SESSIONID = null;
    input_status.set("SessionIdInput", status);
    update_SubmitButton_status();
}
handle_ComputerNumberInput();
function handle_ComputerNumberInput() {
    let computer_number = parseInt(ComputerNumberInput.value);
    if (computer_number < 0 || computer_number > 30) computer_number = NaN;
    let status = (ComputerNumberInput.value == (""+computer_number));
    if (status) COMPUTERNUMBER = ComputerNumberInput.value;
    else COMPUTERNUMBER = null;
    input_status.set("ComputerNumberInput", status );
    update_SubmitButton_status();
}

function update_SubmitButton_status() {
    let to_disable = false;
    for ( const value of input_status.values() ) {
        if ( !value )
        to_disable = true;
    }
    SubmitButton.disabled = to_disable;
}

async function handle_SubmitButton() {
    NameInput.disabled = true;
    SessionIdInput.disabled = true;
    ComputerNumberInput.disabled = true;
    SubmitButton.disabled = true;

    // calculate token
    TOKEN = SESSIONID + "_" + COMPUTERNUMBER;

    // if token already exists in firebase
    await db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "metadata" )
        .get().then( doc => {
            if ( doc.exists )
                window.location.replace(
                    "../survey/?"
                    + "token=" + TOKEN
                );
        })
        .catch( )
    ;

    // store all information
    await store_information();

    // set processes
    assign_process_order();
    // set process to 0
    await store_process();

    // redirect
    window.location.replace(
        "../survey/?"
        + "token=" + TOKEN
        + "&process=0"
        + "&practice"
    );
}




function assign_process_order() {
    const CD_ORDER = [02, 16, 22, 25, 14, 23, 30, 26, 28, 20, 12, 13, 09, 18, 07, 08, 05, 06, 10, 03, 27, 29, 01, 24, 17, 11, 19, 21, 15, 04];
    const ID_ORDER = [07, 16, 15, 02, 25, 14, 30, 26, 28, 23, 09, 20, 10, 18, 06, 08, 05, 12, 17, 03, 27, 29, 22, 21, 24, 01, 13, 11, 19, 04];
    let PROCESS_ORDER = (DATA_SET=="correlated")?CD_ORDER : (DATA_SET=="independent")?ID_ORDER : null;
    if (Math.random() > .5) PROCESS_ORDER.reverse();
    let temp = processes;
    processes = [];
    for (let i = 0; i < PROCESS_ORDER.length; i++) {
        processes.push( temp[PROCESS_ORDER[i]-1] );
    }
}


function store_information() {
    let date = new Date();
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "information" ).set({
            name: NAME,
            session: SESSIONID,
            computer: COMPUTERNUMBER,
            date: date.toUTCString(),
            token: TOKEN
        })
    .then(function() {
        console.log("Submission successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}

function store_process() {
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "metadata" ).set({
            finished_practice: false,
            finished_processes: false,
            finished: false,
            current: 0,
            order: processes,
            total_earnings: NaN,
            average_earnings: NaN
        })
    .then(function() {
        console.log("Process number successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}
