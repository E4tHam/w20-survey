
/* app.js */


const app   = firebase.app();
const db    = firebase.firestore();

const DATA_1;

function initialize() {
    // db.collection( "tests" ).doc( "7" ).set({
    //     data: DATA_7
    // })
    // .then(function() {
    //     console.log("Submission successfully written!");
    // })
    // .catch(function(error) {
    //     console.error("Error writing submission: ", error);
    // });
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