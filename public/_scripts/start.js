
/* start.js */


const app   = firebase.app();
const db    = firebase.firestore();

const SubmitButton = document.getElementById( "SubmitButton" );
const NameInput = document.getElementById( "NameInput" );
NameInput.disabled = false;

const CASE = document.currentScript.getAttribute("case");
var TOKEN = NaN;

function handle_NameInput() {
    SubmitButton.disabled = ( NameInput.value == "" );
}

async function handle_SubmitButton() {
    NameInput.disabled = true;
    SubmitButton.disabled = true;

    // calculate token
    set_token();

    // store all information
    await store_information();

    // set page to 0
    await store_page();

    // redirect
    window.location.href = 
        "../test/?"
        + "token=" + TOKEN
        + "&test=" + 0
    ;
}


function set_token() {
    TOKEN = NameInput.value;
}


function store_information() {
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "information" ).set({
            name: NameInput.value
        })
    .then(function() {
        console.log("Submission successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}

function store_page() {
    return db.collection( "submissions" ).doc( CASE )
        .collection( TOKEN ).doc( "page" ).set({
            number: 0
        })
    .then(function() {
        console.log("Page number successfully written!");
    })
    .catch(function() {
        alert( "[Error]: Please try again." );
    });
}
