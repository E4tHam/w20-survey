
/* app.js */

document.addEventListener( "DOMContentLoaded", event => {

    const app = firebase.app();
    const db = firebase.firestore();

    const firstPost = db.collection('posts').doc('firstpost');

    firstPost.get()
        .then( doc => {
            const data = doc.data();
            document.write( data.title );
        })

});
