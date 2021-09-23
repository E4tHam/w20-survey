
const urlParams         = new URLSearchParams( window.location.search );
const CASE              = document.currentScript.getAttribute("case");
const TOKEN             = urlParams.get("token");

const Q1_input          = document.getElementById("Q1_input");
const Q2_input          = document.getElementById("Q2_input");
const SubmitButton      = document.getElementById("SubmitButton");

// firebase
const app               = firebase.app();
const db                = firebase.firestore();
var processes           = [ "temp" ];
var earnings            = 0;


var input_status = new Map();

handle_Q1_input();
function handle_Q1_input() {
    let status = false;
    if ( Q1_input.value !== "" ) {
        let v = parseInt(Q1_input.value);
        status = ( parseInt(Q1_input.min) <= v && v <= parseInt(Q1_input.max) );
    }
    input_status.set("Q1_input", status );
    update_SubmitButton_status();
}
handle_Q2_input();
function handle_Q2_input() {
    let status = false;
    if ( Q2_input.value !== "" ) {
        let v = parseInt(Q2_input.value);
        status = ( parseInt(Q2_input.min) <= v && v <= parseInt(Q2_input.max) );
    }
    input_status.set("Q2_input", status );
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
    await db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "questions" )
        .set({
            Q1: parseInt(Q1_input.value),
            Q2: parseInt(Q2_input.value)
        });
    await db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "metadata" )
        .set({
            finished_practice: true,
            finished_processes: true,
            finished: true,
            order: processes,
            total_earnings: earnings
        });
    window.location.replace(
        "../../done/"
    );
}

async function loadData() {
    //  if URL is not correct, redirect
    return db.collection( "submissions" ).doc( CASE )
            .collection( TOKEN ).doc( "metadata" ).get()
            .then( doc => {
                if ( doc.data().finished == true ) // if finished, go to done
                    window.location.replace(
                        "../../done"
                    );
                else if ( doc.data().finished_processes != true ) // if not finished with processes, go to survey
                    window.location.replace(
                        "../survey/?token=" + TOKEN
                    );

                processes = doc.data().order;
                earnings = doc.data().total_earnings;
            });
}

init();
async function init() {
    await loadData();
    update_SubmitButton_status();
}
