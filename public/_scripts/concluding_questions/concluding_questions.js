
const urlParams         = new URLSearchParams( window.location.search );
const CASE              = document.currentScript.getAttribute("case");
const TOKEN             = urlParams.get("token");

const Q1                = document.getElementById("Q1");
const Q2                = document.getElementById("Q2");
const Q1_input          = document.getElementById("Q1_input");
const Q2_input          = document.getElementById("Q2_input");
const SubmitButton1     = document.getElementById("SubmitButton1");
const SubmitButton2     = document.getElementById("SubmitButton2");

// firebase
const app               = firebase.app();
const db                = firebase.firestore();
var processes           = [ "" ];
var total_earnings      = NaN;

handle_Q1_input();
function handle_Q1_input() {
    let to_disable = true;
    if ( Q1_input.value !== "" ) {
        let v = parseInt(Q1_input.value);
        to_disable = !( parseInt(Q1_input.min) <= v && v <= parseInt(Q1_input.max) );
    }
    SubmitButton1.disabled = to_disable;
}

function handle_SubmitButton1() {
    Q1_input.disabled = true;
    SubmitButton1.disabled = true;
    Q2.style = "";
}

handle_Q2_input();
function handle_Q2_input() {
    let to_disable = true;
    if ( Q2_input.value !== "" ) {
        let v = parseInt(Q2_input.value);
        to_disable = !( parseInt(Q2_input.min) <= v && v <= parseInt(Q2_input.max) );
    }
    SubmitButton2.disabled = to_disable;
}

async function handle_SubmitButton2() {
    Q2_input.disabled = true;
    SubmitButton2.disabled = true;
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
            total_earnings: total_earnings
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
                total_earnings = doc.data().total_earnings;
            });
}

init();
async function init() {
    await loadData();
    Q1.style = "";
}
