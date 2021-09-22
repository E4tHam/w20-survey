
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
            order: processes
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

                // load order
                processes = doc.data().order;
            });
}

init();
async function init() {
    await loadData();
    SubmitButton.disabled   = false;
}
