
/* app.js */


const app   = firebase.app();
const db    = firebase.firestore();

function handle_submitForm() {
    let name    = document.getElementById("name");
    let number  = returnCheckedRadioFromName("number");
    let submit  = document.getElementById("Submit");

    if ( name.value == "" || number == null )
        return;

        
    console.log( name.value );
    console.log( number.value );

    db.collection( "form_submissions" ).doc( name.value ).set({
        name: name.value,
        number: number.value
    })
    .then(function() {
        console.log("Submission successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing submission: ", error);
    });

    name.value = "";
    number.checked = false;
    submit.disabled = true;

}

function returnCheckedRadioFromName( name ) {

    let radios = document.getElementsByName( name );

    for ( let i = 0; i < radios.length; i++ ) {
        if ( radios[i].checked ) {
            return radios[i]
        }
    }

}


function fill_10() {

    let array = [];
    

    for ( let i = 0; i <= 1; i++ ) {
        array.push( Math.floor( Math.random() * 100 ) );
    }

    db.collection( "tests" ).doc( "1" ).set({
        data: array
    })
    .then(function() {
        console.log("Submission successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing submission: ", error);
    });
}