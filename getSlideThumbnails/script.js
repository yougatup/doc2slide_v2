var SLIDE_ID = ['1Mq57f3Hqi67Nu3fKdUNSwB02nTtlX39i2LEnqAg1Q-Y']

function initializeGAPI(callback) {
    // Client ID and API key from the Developer Console
    var CLIENT_ID = '242873078831-sdfm9eu5qcvoek4k0vkq9ef7de0vqf0a.apps.googleusercontent.com';

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://slides.googleapis.com/$discovery/rest?version=v1", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/script.scriptapp https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/script.external_request https://www.googleapis.com/auth/drive.metadata.readonly";

    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    function handleClientLoad() {
        gapi.load('client:auth2', initClient);
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
        gapi.client.init({
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // console.log(gapi.auth2.getAuthInstance().currentUser.get().Ot.yu);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            // signoutButton.style.display = 'block';

            callback();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            console.log("yay?");
            $("#loadingPlane").hide();
        }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    function appendPre(message) {/*
                                var pre = document.getElementById('slideContents');
                                var textContent = document.createTextNode(message + '\n');
                                pre.appendChild(textContent);*/
    }

    /**
     * Prints the number of slides and elements in a sample presentation:
     * https://docs.google.com/presentation/d/1EAYk18WDjIG-zp_0vLm3CsfQh_i8eXc67Jo2O9C6Vuc/edit
     */

    function createSlide() {
        var requests = [{
            createSlide: {
                slideLayoutReference: {
                    predefinedLayout: 'TITLE_AND_TWO_COLUMNS'
                }
            }
        }];

        // If you wish to populate the slide with elements, add element create requests here,
        // using the pageId.

        // Execute the request.

        console.log("start!");

        gapi.client.slides.presentations.batchUpdate({
            presentationId: PRESENTATION_ID,
            requests: requests
        }).then((createSlideResponse) => {
            console.log(`Created slide with ID: ${createSlideResponse.result.replies[0].createSlide.objectId}`);
        });
    }

    /**
     * Shows basic usage of the Apps Script API.
     *
     * Call the Apps Script API to create a new script project, upload files
     * to the project, and log the script's URL to the user.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    /*
   function callAppsScript(auth) {
   gapi.client.script.projects.create({
resource: {
title: 'My Script'
}
}).then((resp) => {
return gapi.client.script.projects.updateContent({
scriptId: resp.result.scriptId,
resource: {
files: [{
name: 'hello',
type: 'SERVER_JS',
source: 'function helloWorld() {\n  console.log("Hello, world!");\n}'
}, {
name: 'appsscript',
type: 'JSON',
source: "{\"timeZone\":\"America/New_York\",\"" +
"exceptionLogging\":\"CLOUD\"}"
}]
}
});
}).then((resp) => {
let result = resp.result;
if (result.error) throw result.error;
console.log(`https://script.google.com/d/${result.scriptId}/edit`);
}).catch((error) => {
    // The API encountered a problem.
return console.log(`The API returned an error: ${error}`);
});
}*/

    handleClientLoad();
}

async function readData(path) {
    const eventref = firebase.database().ref(path);
    const snapshot = await eventref.once('value');
    const value = snapshot.val();

    return value;
}

function loadThumbnail() {
    var tableHTML = '<tr>' + 
                    '<th> Slide number </th>' + 
                    '<th> Slide ID </th>' + 
                    '<th> Thumbnail </th>' + 
                    '<th> URL </th>' + 
                    '</tr>';

    for(var i=0;i<SLIDE_ID.length;i++) {
        var slide = SLIDE_ID[i];

        gapi.client.slides.presentations.get({
            presentationId: slide,
        }).then(function (response) {
            console.log(response);

            var s = response.result.slides;

            for(var j=0;j<s.length;j++) {
                var s_id = s[j].objectId;

                tableHTML = tableHTML + 
                    '<tr>' + 
                    '<td>' + (i+1) + "</td>" + 
                    '<td>' + s_id + "</td>" + 
                    '<td id="' + s_id + '_img"></td>' + 
                    '<td id="' + s_id + '_url"></td>' + 
                    '</tr>';
            }

            $("#resourceTable").html(tableHTML);

            for(var j=0;j<s.length;j++) {
                var s_id = s[j].objectId;

                console.log(s_id);

                gapi.client.slides.presentations.pages.getThumbnail({
                    presentationId: slide,
                    pageObjectId: s_id
                }).then( (function(my_index, my_s_id) {
                    return function (response) {
                        console.log(my_s_id);
                        console.log(my_index);
                        console.log(response);

                        $("#" + my_s_id + "_img").html(
                            "<img src=" + response.result.contentUrl + " class='slideThumbnail'> </img>");
                        $("#" + my_s_id + "_url").html(response.result.contentUrl);

                        var updates = {};

                        updates['/referenceSlides/' + slide + '/slides/' + my_index] = {
                            slideID: my_s_id,
                            thumbnailURL: response.result.contentUrl
                        }

                        firebase.database().ref().update(updates);
                }
                })(j, s_id)
                );
            }
        });
    }

/*
    for(var i=0;i<SLIDE_ID.length;i++) {
        var slide = SLIDE_ID[i];

        gapi.client.slides.presentations.get({
            presentationId: slide,
        }).then(function (response) {
            console.log(response);

            var s = response.result.slides;

            for(var j=0;j<s.length;j++) {
                var s_id = s[j].objectId;

                gapi.client.slides.presentations.pages.getThumbnail({
                    presentationId: slide,
                    pageObjectId: s_id
                }).then(function (response) {
                    console.log(response);
                });
            }
        });
    }*/

}

$(document).ready(function() {
    console.log("good");

    initializeGAPI(loadThumbnail);
});
