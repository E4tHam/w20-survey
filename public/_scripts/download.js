
const DownloadButton = document.getElementById("DownloadButton");
const SessionIdInput = document.getElementById("SessionIdInput");
const EarningsView = document.getElementById("EarningsView");

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

SessionIdInput.disabled = false;

handle_SessionIdInput();
function handle_SessionIdInput() {
    let status = SessionIdInput.value.length > 0 && SessionIdInput.value.match("^[a-zA-Z0-9]+$");
    input_status.set("SessionIdInput", status);
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

    let num_computers = 30;

    let json = new Object();

    for ( const version in VERSIONS ) {

        let version_json = [];

        for ( let computer = 1; computer <= num_computers; computer++ ) {
            let TOKEN = `${SessionIdInput.value.toUpperCase()}_${computer}`;
            console.log( "trying " + VERSIONS[version] + " " + TOKEN );
            let finished = false;
            await db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( TOKEN )
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
            out.processes = {
                "practice": [],
                "processes": []
            };

            await db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( TOKEN )
                .doc("metadata")
                .get().then((doc) => {
                    out.metadata = doc.data();
                }).catch( ()=>{} );
            await db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( TOKEN )
                .doc("information")
                .get().then((doc) => {
                    out.information = doc.data();
                }).catch( ()=>{} );
            await db
                .collection("submissions")
                .doc( VERSIONS[version] )
                .collection( TOKEN )
                .doc("questions")
                .get().then((doc) => {
                    out.questions = doc.data();
                }).catch( ()=>{} );


            EarningsView.innerHTML += `${TOKEN} : $${Math.max(0,out.metadata.total_earnings.toFixed(2))} <br>`;

            // practice
            for ( let process = 0; process < 9; process++ ) {
                await db
                    .collection("submissions").doc( VERSIONS[version] )
                    .collection( TOKEN ).doc( "processes" )
                    .collection( "practice" ).doc( ((process<=9)?"0":"") + process )
                    .get().then((doc) => {
                        out.processes.practice.push( doc.data() );
                    }).catch( ()=>{} );
            }
            // actual
            for ( let process = 0; process < 30; process++ ) {
                await db
                    .collection("submissions")
                    .doc( VERSIONS[version] )
                    .collection( TOKEN ).doc( "processes" )
                    .collection( "processes" ).doc( ((process<=9)?"0":"") + process )
                    .get().then((doc) => {
                        out.processes.processes.push( doc.data() );
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
