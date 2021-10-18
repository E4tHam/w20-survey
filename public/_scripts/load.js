
/* app.js */


const app   = firebase.app();
const db    = firebase.firestore();

var read = new FileReader();

const FileInput = document.getElementById("FileInput");
FileInput.addEventListener( "change", handleImageUpload, false );

function handleImageUpload() {
    let file = this.files[0];
    if ( !(file instanceof File) ) return;
    read.readAsArrayBuffer( file );
    console.log("Starting to read file.");
}

read.onloadend = function() {
    console.log("File read.");
    let arrays = read_csv();
    console.log(arrays);
    let case_name = "correlated";
    // let case_name = "independent";
    upload_data(arrays,case_name,"processes","v",30);
    upload_data(arrays,case_name,"practice","p",3);
}


function read_csv() {
    var result = new TextDecoder().decode(read.result);
    let lines = result.split(/\r?\n/);
    let size = lines[0].split(",").length;
    let arrays = [];
    for ( let i = 0; i < size; i++ ) arrays.push([]);
    for ( let line = 0; line < lines.length; line++ ) {
        let nums = lines[line].split(",").map(Number);
        for ( let i = 0; i < nums.length; i++ ) {
            arrays[i].push(nums[i]);
        }
    }
    return arrays;
}

async function upload_data(arrays,case_name,data_name,prefix,num_arrays) {
    let document_ids = [ ];
    for ( let i = 0; i < num_arrays; i++ ) {

        let name = prefix + ((i<9)?"0":"") + (i+1);

        document_ids.push( name );
        console.log(`uploading ${name}`);
        console.log(arrays[i].slice( 0, 21250 ));

        await db.collection( "onload_data" ).doc( case_name )
            .collection( data_name ).doc( name )
            .set({
                data: arrays[i].slice( 0, 21250 )
            })
        ;
    }

    db.collection( "onload_data" ).doc( case_name )
        .collection( data_name ).doc( "document_ids" )
        .set({
            ids: document_ids
        })
    ;
}
