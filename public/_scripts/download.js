
const DownloadButton = document.getElementById("DownloadButton");
const NumComputers = document.getElementById("NumComputers");

const app               = firebase.app();
const db                = firebase.firestore();

const VERSIONS = [
    "Correlated_slider",
    "Correlated_slider+stop",
    "Correlated_stop",
    "Independent_slider",
    "Independent_slider+stop",
    "Independent_stop"
];

var input_status = new Map();

NumComputers.disabled = false;

handle_NumComputers();
function handle_NumComputers() {
    input_status.set("SubmitButton", ( NumComputers.value !== "" ) );
    update_DownloadButton_status();
}
function update_DownloadButton_status() {
    let to_disable = false;
    for ( const value of input_status.values() ) {
        if ( !value )
        to_disable = true;
    }
    DownloadButton.disabled = to_disable;
}

async function handle_DownloadButton() {
    console.log("DOWNLOAD: START");
    DownloadButton.disabled = true;

    if ( !number_valid(NumComputers.value) ) {
        alert("Invalid number given.");
        update_DownloadButton_status();
        return;
    }
    let num_computers = parseInt(NumComputers.value);

    let json = new Object();

    for ( const version in VERSIONS ) {

        let version_json = [];

        for ( let computer = 1; computer <= num_computers; computer++ ) {
            console.log( "trying " + VERSIONS[version] + " " + computer );
            let finished = false;
            await db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( ""+computer )
                .doc("metadata")
                .get().then((doc) => {
                    if ( doc.data().finished ) {
                        finished = true;
                    }
                }).catch( ()=>{} )
                ;
            if ( !finished ) continue;
            console.log(`Downloading data from computer ${computer}.`);

            let out = new Object();
            out.data = [];

            db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( ""+computer )
                .doc("metadata")
                .get().then((doc) => {
                    out.metadata = doc.data();
                }).catch( ()=>{} );
            db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( ""+computer )
                .doc("information")
                .get().then((doc) => {
                    out.information = doc.data();
                }).catch( ()=>{} );
            db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( ""+computer )
                .doc("questions")
                .get().then((doc) => {
                    out.questions = doc.data();
                }).catch( ()=>{} );

            for ( let process = 0; process < 30; process++ ) {
                await db
                    .collection("submissions")
                    .doc( VERSIONS[version] )
                    .collection( ""+computer )
                    .doc(""+process)
                    .get().then((doc) => {
                        out.data.push( doc.data() );
                    }).catch( ()=>{} );
            }

            version_json.push(out);

        }
        json[VERSIONS[version]] = version_json;
    }

    update_DownloadButton_status();
    console.log(json);


    // download
    let a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json,null,2));
    a.download = 'data.json';
    a.click();


    console.log("DOWNLOAD: DONE");
}

function number_valid(num) {
    let temp = 0;
    try {temp = parseInt(num);}
    catch (error) {return false;}

    return ( 1 <= temp && temp <= 100 );
}
