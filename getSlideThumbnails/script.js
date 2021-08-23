var SLIDE_ID = ['Default']
var source_presentation_id = "1HbS5f9IcAJJwWJqjLPEac03OCNu6Oz_iHfPGsbhYYO4";
var TEMP_PRESENTATION_ID = '1SV3S92pjwtGGwKvjJDJ7d6cxUvS2CCfeQ3yh2Tdz8pQ';

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

async function postRequest(url, body) {
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	};

	var res = await fetch(url, requestOptions)
		.then(response => response.json())
		.then(data => {
			return data;
		});

	return res;
}

async function loadLayoutAndStyle() {
    var r = await postRequest(
        "http://localhost:8010/proxy/get_data_single_presentation", {
        "presentationId": source_presentation_id
    });

    console.log(r);

    var requests = [];

    for(var i=0;i<r.layouts.length;i++) {
        var l = r.layouts[i];
        var rr = l.requests;

        l.slideID = rr[0].createSlide.objectId;

        requests = requests.concat(rr);
    }

    console.log(requests);

	gapi.client.slides.presentations.batchUpdate({
		presentationId: TEMP_PRESENTATION_ID,
		requests: requests
	}).then((createSlideResponse) => {
		console.log(createSlideResponse);

        for (var i = 11; i < r.layouts.length; i++) {
            var mySlideID = r.layouts[i].slideID;

            gapi.client.slides.presentations.pages.getThumbnail({
                presentationId: TEMP_PRESENTATION_ID,
                pageObjectId: mySlideID
            }).then((function (my_index, my_s_id) {
                return function (response) {
                    console.log(my_s_id);
                    console.log(my_index);
                    console.log(response);

                    var updates = {};

                    fetch(response.result.contentUrl)
                        .then(res => res.blob()) // Gets the response and returns it as a blob
                        .then(blob => {
                            // Here's where you get access to the blob
                            // And you can use it for whatever you want
                            // Like calling ref().put(blob)

                            // Here, I use it to make an image appear on the page
                            console.log(blob);

                            const ref = firebase.storage().ref("/preprocessing/" + source_presentation_id);

                            ref.child(my_index + "___" + my_s_id + ".png").put(blob).then(function (obj) {
                                obj.ref.getDownloadURL().then(u => {
                                    console.log(u);
/*
                                    $("#" + my_s_id + "_img").html(
                                        "<img src=" + u + " class='slideThumbnail'> </img>");
                                    $("#" + my_s_id + "_url").html(u);
*/
                                    updates['/referenceLayout/' + source_presentation_id + '/' + r.layouts[my_index].pageId] = {
                                        slideID: my_s_id,
                                        thumbnailURL: u,
                                        boxes: r.layouts[my_index].boxes,
                                        pageSize: r.layouts[my_index].pageSize,
                                    }

                                    firebase.database().ref().update(updates);
                                })
                            });
                        });


                }
            })(i, mySlideID)
            );



        }

        var uu = {};

        for(var i=11;i<r.styles.length;i++) {
            uu['/referenceStyle/' + source_presentation_id + '/' + r.styles[i].pageId] = r.styles[i]
        }

        firebase.database().ref().update(uu);
    });
}

function initializeLayoutAndStyle() {
    var updates = {};

    updates["referenceLayout"] = {};
    updates["referenceStyle"] = {};

    var l = [];
    var s = [];

    l.push({
        width: 160,
        height: 90,
        boxes: [
            {
                top: 20,
                left: 3,
                width: 150,
                height: 30,
                type: "title",
            },
            {
                left: 3,
                top: 51,
                width: 150,
                height: 15,
                type: "body",
            },
        ]
    });
    l.push({
        width: 160,
        height: 90,
        boxes: [
            {
                left: 3,
                top: 1,
                width: 150,
                height: 20,
                type: "title",
            },
            {
                left: 3,
                top: 32,
                width: 150,
                height: 55,
                type: "body",
            },
        ]
    });

    s.push({
        title: {
            "font-size": "20px",
            "color": "red"
        },
        body: {
            "font-size": "15px",
        }
    });

    updates["referenceLayout"][SLIDE_ID[0]] = l;
    updates["referenceStyle"][SLIDE_ID[0]] = s;

    firebase.database().ref().update(updates);
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


                        var updates = {};


                        fetch(response.result.contentUrl)
                            .then(res => res.blob()) // Gets the response and returns it as a blob
                            .then(blob => {
                                // Here's where you get access to the blob
                                // And you can use it for whatever you want
                                // Like calling ref().put(blob)

                                // Here, I use it to make an image appear on the page
                                console.log(blob);

                                const ref = firebase.storage().ref("/" + slide);

                                ref.child(my_index + "___" + my_s_id + ".png").put(blob).then(function(obj) {
                                    obj.ref.getDownloadURL().then(u => {
                                        console.log(u);

                                        $("#" + my_s_id + "_img").html(
                                            "<img src=" + u + " class='slideThumbnail'> </img>");
                                        $("#" + my_s_id + "_url").html(u);

                                        updates['/referenceSlides/' + slide + '/slides/' + my_index] = {
                                            slideID: my_s_id,
                                            thumbnailURL: u 
                                        }

                                        firebase.database().ref().update(updates);
                                    })
                                });
                            });


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

    initializeGAPI(loadLayoutAndStyle);
});
