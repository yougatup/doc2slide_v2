var userName = 'tempUser';
var PRESENTATION_ID = '1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY'
var curHighlightInfo = {
	pageNumber: -1,
	startWordIndex: -1,
	endWordIndex: -1
};
var slideDB = {};
var curSlideObjects = null;
var curSlideState = "WAIT";
var highlightDB = {};
var slideObjectMousedown = 0;
var slideObjectMousedownObject = null;
var slideObjectMouseupObject = null;
var popoverElement = null;
var curSlidePage = null; 
var structureHighlightDB = {};

function documentStructureRowElement(id) {
	return "<div id=" + id + " class='documentStructureBodyRow'> " +
			"<div class='documentStructureBodyRowArrowBox'> " +
			"<i class='arrow left'></i>" + 
			"<i class='arrow right'></i>" + 
			"</div>" + 
			"<div class='documentStructureBodyRowTextBox'> yeyeye" +
			"</div>" + 
			"<div class='documentStructureBodyRowIconBox'> " +
			"<button class='documentStructureBodyRowEditIcon'> </button>" + 
			"<button class='documentStructureBodyRowDeleteIcon'> </button>" + 
			"<button class='documentStructureBodyRowConfirmIcon'> OK </button>" + 
			"</div>" + 
			"</div>";
}


function appendDocumentStructureRow() {
	$("#documentStructureAppendDiv").append(
		"<div class='documentStructureBodyRow appendRow'> Add a row </div>"
	);
}

function prepare() {
    initializeGAPI();
/*
    Split(['#leftPlane', '#slidePlane'], {
        sizes: [50, 50],
        minSize: 0
    });
    */
}

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
				 console.log(gapi.auth2.getAuthInstance().currentUser.get().Ot.yu);

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
	
function issueEvent(eventName, data) {
    var myEvent = new CustomEvent(eventName, {detail: data} );

    document.dispatchEvent(myEvent);
}

async function issueEvent(eventName, data, callbackString) {
    var myEvent = new CustomEvent(eventName, {detail: data} );

    document.dispatchEvent(myEvent);

    return new Promise(function(resolve, reject) {
        $(document).on(callbackString, function(e) {
                resolve(e);
            });
        });
}

function highlightPage(pageNumber) {
	if("mapping" in highlightDB) {
		for(var key in highlightDB.mapping[pageNumber]) {
			var elem = highlightDB.mapping[pageNumber][key];

			issueEvent("root_sendMappingIdentifier_2", {
				mappingID: key,
				pageNumber: pageNumber,
				startWordIndex: elem.startWordIndex,
				endWordIndex: elem.endWordIndex
			});
		}
	}
}

async function writeHighlight(pageNumber, startWordIndex, endWordIndex) {
	var newKey = firebase.database().ref('users/' + userName + '/mapping/' + pageNumber + '/').push().key;

	var updates = {};
	updates['/users/' + userName + '/mapping/' + pageNumber + '/' + newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex
	};

	await firebase.database().ref().update(updates);

	if(!("mapping" in highlightDB)) highlightDB.mapping = {};
	if(!(pageNumber in highlightDB.mapping)) highlightDB.mapping[pageNumber] = {};

	highlightDB.mapping[pageNumber][newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex
	};

	return newKey;
}

async function registerHighlight(highlightInfo) {
	return new Promise(function (resolve, reject) { var ret = writeHighlight(highlightInfo.pageNumber, highlightInfo.startWordIndex, highlightInfo.endWordIndex);
		resolve(ret);
	});
}

async function clearDB() {
	var updates = {};

	updates['/users/' + userName + '/slideInfo/'] = {}
	updates['/users/' + userName + '/mapping/'] = {}

	await firebase.database().ref().update(updates);
}

async function initializeSlide() {
	gapi.client.slides.presentations.get({
	  presentationId: PRESENTATION_ID
	}).then(function(response) {
	  var slides = response.result.slides;
	
	  initialSlideCnt = slides.length;
	  removedSlideCnt = 0;
	
	  var requests = [];

	  for(var i=0;i<slides.length;i++) {
			var pageID = slides[i].objectId;

			requests.push({
	    		"deleteObject": {
	     		"objectId": pageID,
	         	},
			});
	  }

	  requests.push({
		createSlide: {
	    	insertionIndex: '0',
		   	slideLayoutReference: {
			    predefinedLayout: 'TITLE'
		   }
		 }
	  });

	  requests.push({
		 createSlide: {
		 	insertionIndex: '1',
		 	slideLayoutReference: {
		     	predefinedLayout: 'TITLE_AND_BODY'
		 	}
	 	 }
	  });

	  gapi.client.slides.presentations.batchUpdate({
	     presentationId: PRESENTATION_ID,
	     requests: requests
	  }).then((createSlideResponse) => {
	     // successfully pasted the text
	
	     console.log("succeed!");
	     console.log(createSlideResponse);

		 return true;
	  });
	}).catch(function (err) {
	  console.log(err);
	});
}

function initializeDB() {
	readData('/users/' + userName).then(result => {
		if(!("parameters" in result && "initialize" in result.parameters && !result.parameters.initialize)) {
			$("#check2").prop("checked", "true");

			clearDB().then( () => {
				initializeSlide().then( () => {
					issueEvent("root_openPDF", null);

					setTimeout(function() {
							$("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");
						}, 1000);
					});
			});
		}
		else {
			// $("#check2").prop("checked", "false");
			$("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");

			highlightDB = result;

			if(highlightDB == null) {
				highlightDB = {};
				highlightDB['mapping'] = {};
			}

			slideDB = result.slideInfo;

			if("structureHighlightInfo" in result) 
				structureHighlightDB = result.structureHighlightInfo;
			else
				structureHighlightDB = {};

			updateStructure();

			setTimeout(function() {
				issueEvent("root_openPDF", null);
			}, 1000);

		}
	}).catch(function(error) {
		console.log(error);
	});
}

function findSlideWithMapping(key) {
	for(page in slideDB) {
		for(obj in slideDB[page]) {
			for(paragraph in slideDB[page][obj]) {
				if(slideDB[page][obj][paragraph].mappingID == key) {
					return {
						pageID: page,
						objectID: obj,
						paragraph: paragraph
					}
				}
			}
		}
	}

	return null;
}

async function removeMappingOnPdfjs(pageNumber, key, slideRemoveFlag) {
	await firebase.database().ref('users/' + userName + '/mapping/' + pageNumber + '/' + key).remove();

	if(slideRemoveFlag){
		slideInfo = findSlideWithMapping(key);

		removeSlideMappingInfo(slideInfo.pageID, slideInfo.objectID, slideInfo.paragraph).then(() => {
			$(".mappingIndicator[mappingID=" + key + "]").removeClass("mapped");
			$(".mappingIndicator[mappingID=" + key + "]").attr("mappingID", null);
		});
	}
	delete highlightDB.mapping[pageNumber][key];

	return key;
}

function setFocusBox(id, info) {
	if(info.left != null) $("#" + id).css("left", info.left);
	if(info.top != null) $("#" + id).css("top", info.top);

	if(info.width != null) $("#" + id).width(info.width);
	if(info.height != null) $("#" + id).height(info.height);
}

function disappearPopover() {
	$("#slideObjectPopover").hide();
}

function appearPopoverOnSlideObject(target) {
	setFocusBox("slideObjectPopover", {
		left: $(target).css("left"),
		top: $(target).position().top - 50,
		width: "120px",
		height: "45px"
	});

    popoverElement = target;

	$("#slideObjectPopover").show();
}

function removeFocus() {
	// $(".editObjectIndicator").removeClass("editObjectIndicator");
	$(".onEditing").removeClass("onEditing");
	$(".focusRect").hide();
	// $("#workspaceRect").show();
	// $(".objectIndicator").show();
}

function editFocus(p) {
	if(curSlideState == "WAIT") {
		$(".objectIndicator").addClass("onEditing");
		$(".mappingIndicator").addClass("onEditing");
		// $(popoverElement).removeClass("objectIndicator");
		// $(popoverElement).removeClass("onEditing");
		// $(popoverElement).addClass("editObjectIndicator");
	}

	var slidePlaneBox = $("#slidePlane")[0].getBoundingClientRect();

	setFocusBox("focusRect1", {
		top: p.parent.top - slidePlaneBox.top + 40,
		left: p.parent.left - slidePlaneBox.left,
		width: p.parent.width,
		height: p.child.top - p.parent.top - 5
	});

	setFocusBox("focusRect2", {
		top: p.child.top - slidePlaneBox.top + 40 - 5,
		left: p.parent.left - slidePlaneBox.left,
		width: p.child.left - p.parent.left,
		height: p.child.height + 10
	});

	setFocusBox("focusRect3", {
		top: p.child.top - slidePlaneBox.top + 40 - 5,
		left: p.child.right - slidePlaneBox.left,
		width: p.parent.right - p.child.right,
		height: p.child.height + 10
	});

	setFocusBox("focusRect4", {
		top: p.child.top + p.child.height  - slidePlaneBox.top + 40 + 5,
		left: p.parent.left - slidePlaneBox.left,
		width: p.parent.width,
		height: p.parent.bottom - p.child.bottom - 10
	});

	if(curSlideState == "WAIT"){ 
		$(".focusRect").show();

		// $("#workspaceRect").hide();
		// $(".objectIndicator").hide();
		$("#workspaceRect").addClass("onEditing");
	}
}

function setSlideState(state, arg) {
	curSlideState = state;

	issueEvent("root_setSlideState", {
		state: state,
		argument: arg
	});
}

function setMappingIndicator(id, info) {
	if(info.left != null) $("#" + id).css("left", info.left);
	if(info.top != null) $("#" + id).css("top", info.top);
}

function visualizeSlideObjects() {
	var tempCnt = 1;

	setFocusBox("workspaceRect", {
		top: curSlideObjects.workspace.top + 40,
		left: curSlideObjects.workspace.left,
		width: curSlideObjects.workspace.width,
		height: curSlideObjects.workspace.height
	});

	$(".objectIndicator").remove();
	$(".filmstripIndicator").remove();
	$(".mappingIndicator").remove();

	var filmstripIndex = 0;

	for(var i=0;i<curSlideObjects.filmstrip.length;i++) {
		$("#slidePlaneCanvas").append(
				"<div id='filmstripIndicator" + filmstripIndex + "' class='filmstripIndicator'"+ 
				" pageID='" + curSlideObjects.filmstrip[i].pageID + "'> </div>"
				);

		var rectInfo = curSlideObjects.filmstrip[i].rect;

		setFocusBox("filmstripIndicator" + filmstripIndex, {
			top: rectInfo.top + 40,
			left: rectInfo.left,
			width: rectInfo.width,
			height: rectInfo.height
		});

		filmstripIndex++;
	}

	for(var i=0;i<curSlideObjects.objects.length;i++) {
		var bottom = -1;

		for(k in curSlideObjects.objects[i].paragraph) {
			var objectID = curSlideObjects.objects[i].objectID.substr(7);
			var paragraphID = parseInt(k.substr(7).split('-')[2]);
			var rectInfo = curSlideObjects.objects[i].paragraph[k];
			var mappedFlag = false;

			if(curSlideObjects.pageID in slideDB && 
			   objectID in slideDB[curSlideObjects.pageID] && 
			   paragraphID in slideDB[curSlideObjects.pageID][objectID] && 
			   slideDB[curSlideObjects.pageID][objectID][paragraphID].mappingID != "null") {
				  mappedFlag = true;
			}

			$("#slidePlaneCanvas").append(
				"<div id='objectIndicator" + tempCnt + "' class='objectIndicator' pageID='" + curSlideObjects.pageID + "'" + 
				" objID='" + objectID + "' paragraphID='" + k + "'" + 
				" paragraphIndex=" + k.split("-")[3] + "></div>" + 
				(mappedFlag ? 
				 "<div id='mappingIndicator" + tempCnt + "' class='mappingIndicator mapped' objID='" + objectID + "' paragraphID=" + k + " mappingID=" + slideDB[curSlideObjects.pageID][objectID][paragraphID].mappingID + "></div>" 
				 : 
				 "<div id='mappingIndicator" + tempCnt + "' class='mappingIndicator' objID='" + objectID + "' paragraphID=" + k + "></div>")

			);

			setFocusBox("objectIndicator" + tempCnt, {
				top: rectInfo.top + 40,
				left: curSlideObjects.objects[i].rect.left,
				width: curSlideObjects.objects[i].rect.width,
				height: rectInfo.height
			});

			bottom = rectInfo.top + rectInfo.height;

			setMappingIndicator("mappingIndicator" + tempCnt, {
				top: rectInfo.top + 40,
				left: curSlideObjects.objects[i].rect.left - 15,
			});

			tempCnt = tempCnt + 1;
		}

		$("#slidePlaneCanvas").append(
			"<div id='objectIndicator" + tempCnt + "' class='objectIndicator endOfParagraph' pageID='" + curSlideObjects.pageID + "'" + 
			" objID='" + objectID + "'" + 
			" paragraphIndex=" + Object.keys(curSlideObjects.objects[i].paragraph).length + "></div>"
		);

		setFocusBox("objectIndicator" + tempCnt, {
			top: bottom + 40 + 20,
			left: curSlideObjects.objects[i].rect.left,
			width: curSlideObjects.objects[i].rect.width,
			height: 50 
		});

		tempCnt = tempCnt + 1;
	}

}

function listSlides(callback) {
    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		for (i = 0; i < length; i++) {
		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
		    function compare(a, b) {
				if(a.objectId > b.objectId) return true;
				else return false;
		    }
	
		    slide.pageElements.sort(compare);
	
		    for(var j=0;j<slide.pageElements.length;j++) {
				var slideItem = slide.pageElements[j];
	
				var slideObjParagraphId = [];
	
				if(slideItem.shape.text != null) {
				    var nestingLevel = 0;
				    var isFirstTextRun = true;
				    var paragraphId = -1;
	
				    for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
					var textElem = slideItem.shape.text.textElements[k];
	
					if(textElem.paragraphMarker != null) {
					    paragraphId = paragraphId + 1;
					}
	
					var paragraphObjId = "editor-" + slideItem.objectId + "-paragraph-" + paragraphId;
					var domId = '';
	
					if(textElem.paragraphMarker != null && textElem.paragraphMarker.bullet != null) {
					    if(textElem.paragraphMarker.bullet.nestingLevel != null) {
						nestingLevel = parseInt(textElem.paragraphMarker.bullet.nestingLevel);
					    }
					    else nestingLevel = 0;
					}
					else if(textElem.textRun != null){
					    var level = (j == 0? nestingLevel : nestingLevel + 1);
	
					    // domId = appendOutlineLine(level, textElem.textRun.content, paragraphObjId);
	
					    isFirstTextRun = false;
	
					    slideObjParagraphId.push(paragraphObjId);
					}
				    }
				}
	
				slideObjId[slideItem.objectId] = slideObjParagraphId;
			}
	
			// slideDB[slideID] = slideObjId;
		}
	
		// console.log(slideDB);

		if(callback) {
		    callback();
		}
	
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

async function putText(p, mappingID) {
	return new Promise(function (resolve, reject) { 
		 appendText(curSlideObjects.pageID, curSlideObjects.objects[curSlideObjects.objects.length-1].objectID.substring(7), p.text, mappingID);

		resolve(mappingID);
	});
}

async function removeSlideMappingInfo(pageID, objID, paragraphIndex) {
	var updates = {};

	updates['/users/' + userName + '/slideInfo/' + pageID + '/' + objID + '/' + paragraphIndex] = {
		mappingID: "null" 
	}

	slideDB[pageID][objID][paragraphIndex] = {
		mappingID: "null" 
	}

	await firebase.database().ref().update(updates);
}

async function removeParagraph(slidePageID, objectID, paragraphIndex) {
    return await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		for (i = 0; i < length; i++) {
			var slide = presentation.slides[i];
	
			var slideID = slide.objectId;

			if(slideID == slidePageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objectID) {
						var textInfo = slideItem.shape.text.textElements;
						var __paragraphIndex = -1;
						var startIndex = -1, endIndex = -1;

						for(var k=0;k<textInfo.length;k++) {
							if(endIndex != textInfo[k].endIndex) {
								startIndex = ("startIndex" in textInfo[k]) ? textInfo[k].startIndex : 0;
								endIndex = textInfo[k].endIndex;
								__paragraphIndex++;
							}

							if(__paragraphIndex == paragraphIndex) {
								var mappingKey = null;
								var lastParagraphFlag = false;

								if(slidePageID in slideDB &&
									objectID in slideDB[slidePageID] &&
									slideDB[slidePageID][objectID] && 
									paragraphIndex in slideDB[slidePageID][objectID]) {

									mappingKey = slideDB[slidePageID][objectID][paragraphIndex].mappingID;

									var numParagraphs = Object.keys(slideDB[slidePageID][objectID]).length;
									var updates = {};

									if(numParagraphs-1 == paragraphIndex) lastParagraphFlag = true;

									for(var l=paragraphIndex;l<numParagraphs-1;l++) {
										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];
										slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];
									}

									updates['/users/' + userName + '/slideInfo/' + slidePageID+ '/' + objectID+ '/' + (numParagraphs-1)] = {
										mappingID: null
									}

									delete slideDB[slidePageID][objectID][numParagraphs-1];

									firebase.database().ref().update(updates);
								}

								if(mappingKey) {
									var myPageNumber = null;

									for(var pageNumber in highlightDB.mapping) {
										if(mappingKey in highlightDB.mapping[pageNumber]) {
											myPageNumber = pageNumber;
											break;
										}
									}

									if(myPageNumber != null) {
										removeMappingOnPdfjs(pageNumber, mappingKey, false).then(result => {
											issueEvent("root_mappingRemoved2", {
												mappingID: result 
											});
										});
									}
								}

								return removeRangeInObj(slidePageID, objectID, {
									startIndex: (lastParagraphFlag? (startIndex == 0 ? 0 : startIndex-1) : startIndex),
									endIndex: endIndex + (lastParagraphFlag? -1 : 0)
								})
							}
						}
					}
				}
			}
		}
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

async function removeRangeInObj(slidePageID, objectID, range) {
   var requests = [ 
   {
     "deleteText": {
       "objectId": objectID,
       "textRange": {
		   "startIndex": range.startIndex,
		   "endIndex": range.endIndex,
		   "type": "FIXED_RANGE"
	   }
     }
   } ];

   return await gapi.client.slides.presentations.batchUpdate({
     presentationId: PRESENTATION_ID,
     requests: requests
   }).then((createSlideResponse) => {
	   return true;
   });
}

async function getTextOnParagraph(slidePageID, objectID, paragraphIndex) {
    return await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		for (i = 0; i < length; i++) {
		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
			if(slideID == slidePageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objectID) {
						var myText = null;
						var myStartIndex, myEndIndex;
						var curParagraphIndex = -1, startIndex = -1, endIndex = -1;

						for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
							var textElem = slideItem.shape.text.textElements[k];

							if(textElem.endIndex != endIndex){
								curParagraphIndex++;

								if("startIndex" in textElem) startIndex = textElem.startIndex;
								else startIndex = 0;

								endIndex = textElem.endIndex;
							}

							if("textRun" in textElem && curParagraphIndex == paragraphIndex) { 
								myText = textElem.textRun.content;
								myStartIndex = startIndex;
								myEndIndex = endIndex;

								return {
									  text: myText,
									  start: myStartIndex,
									  end: myEndIndex
								}
							}
						}
					}
				}
			}
	
			// slideDB[slideID] = slideObjId;
		}
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

function moveParagraph(slidePageID, objectID, srcParagraphIndex, dstParagraphIndex) {
    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		for (i = 0; i < length; i++) {
		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
			if(slideID == slidePageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objectID) {
						var srcText = null, dstText = null;
						var srcStartIndex, srcEndIndex, dstStartIndex, dstEndIndex;
						var curParagraphIndex = -1, startIndex = -1, endIndex = -1;

						for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
							var textElem = slideItem.shape.text.textElements[k];

							if(textElem.endIndex != endIndex){
								curParagraphIndex++;

								if("startIndex" in textElem) startIndex = textElem.startIndex;
								else startIndex = 0;

								endIndex = textElem.endIndex;
							}

							if("textRun" in textElem && curParagraphIndex == srcParagraphIndex) { 
								srcText = textElem.textRun.content;
								srcStartIndex = startIndex;
								srcEndIndex = endIndex;
							}
							if("textRun" in textElem && curParagraphIndex == dstParagraphIndex){
								dstText = textElem.textRun.content;
								dstStartIndex = startIndex;
								dstEndIndex = endIndex;
							}
						}

						var requests;

						if(srcParagraphIndex < dstParagraphIndex) {
							if(curParagraphIndex < dstParagraphIndex) 
								dstStartIndex = endIndex-1;

							requests = [{
								insertText: {
      								"objectId": objectID,
      								"text": (dstStartIndex == endIndex-1 ? '\n' + srcText.trim() : srcText),
      								"insertionIndex": dstStartIndex
								}
							}, {
								deleteText: {
       								"objectId": objectID,
       								"textRange": {
	   								    "startIndex": srcStartIndex,
	   								    "endIndex": srcEndIndex,
	   								    "type": "FIXED_RANGE"
	   								}
								}
							}
				   		   ];
						}
						else {
							requests = [{
								deleteText: {
       								"objectId": objectID,
       								"textRange": {
	   								    "startIndex": (curParagraphIndex == srcParagraphIndex ? (srcStartIndex == 0 ? 0 : srcStartIndex-1) : srcStartIndex),
	   								    "endIndex": (curParagraphIndex == srcParagraphIndex ? srcEndIndex-1 : srcEndIndex),
	   								    "type": "FIXED_RANGE"
	   								}
								}
							}, {
								insertText: {
      								"objectId": objectID,
      								"text": srcText,
      								"insertionIndex": dstStartIndex
								}
						    }];
						}

   						gapi.client.slides.presentations.batchUpdate({
   						  presentationId: PRESENTATION_ID,
   						  requests: requests
   						}).then((createSlideResponse) => {
							console.log(createSlideResponse);
   						});
					}
				}
			}
	
			// slideDB[slideID] = slideObjId;
		}
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

function moveParagraphToSlide(slidePageID, objectID, paragraphIndex, dstSlideID, dstObjectID) {
    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		console.log(slidePageID, dstSlideID);

		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		var srcText, srcStartIndex=0, srcEndIndex, dstEndIndex = 0;
		var startIndex = -1, endIndex = -1;
		var curParagraphIndex = -1;

		for (i = 0; i < length; i++) {
		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
			if(slideID == slidePageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objectID) {
						var srcText = null, dstText = null;

						for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
							var textElem = slideItem.shape.text.textElements[k];

							if(textElem.endIndex != endIndex){
								curParagraphIndex++;

								if("startIndex" in textElem) startIndex = textElem.startIndex;
								else startIndex = 0;

								endIndex = textElem.endIndex;
							}

							if("textRun" in textElem && curParagraphIndex == paragraphIndex) { 
								srcText = textElem.textRun.content;
								srcStartIndex = startIndex;
								srcEndIndex = endIndex;
							}
						}
					}
				}
			}
			else if(slideID == dstSlideID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == dstObjectID) {
						if("text" in slideItem.shape) dstEndIndex = slideItem.shape.text.textElements[slideItem.shape.text.textElements.length-1].endIndex;

						break;
					}
				}
			}
		}

		console.log(srcText, srcStartIndex, srcEndIndex, dstEndIndex);

		var	requests = [{
				insertText: {
      				"objectId": dstObjectID,
      				"text": dstEndIndex == 0 ? srcText.trim() : '\n' + srcText.trim(),
      				"insertionIndex": dstEndIndex == 0 ? 0 : dstEndIndex-1
				},
			}, {
				deleteText: {
       				"objectId": objectID,
       				"textRange": {
	   				    "startIndex": (curParagraphIndex == paragraphIndex ? (srcStartIndex == 0 ? 0 : srcStartIndex-1) : srcStartIndex),
	   				    "endIndex": (srcEndIndex == endIndex) ? srcEndIndex-1 : srcEndIndex,
	   				    "type": "FIXED_RANGE"
	   				}
				}
		}];

		var updates = {};

		var srcMappingKey = slideDB[slidePageID][objectID][paragraphIndex];
		var numParagraphs = Object.keys(slideDB[slidePageID][objectID]).length;

		for(var l=paragraphIndex;l<numParagraphs;l++) {
			updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];
			slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];
		}

		updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + (numParagraphs-1)] = {
			mappingID: null
		};

		delete slideDB[slidePageID][objectID][numParagraphs-1];

		if(!(dstSlideID in slideDB)) slideDB[dstSlideID] = {};
		if(!(dstObjectID in slideDB[dstSlideID])) slideDB[dstSlideID][dstObjectID] = {};

		var dstNumParagraphs = Object.keys(slideDB[dstSlideID][dstObjectID]).length;

		console.log(dstNumParagraphs, dstEndIndex);

		if(dstNumParagraphs == 1 && dstEndIndex == 0) dstNumParagraphs = 0;

		slideDB[dstSlideID][dstObjectID][dstNumParagraphs] = srcMappingKey
		updates['/users/' + userName + '/slideInfo/' + dstSlideID+ '/' + dstObjectID+ '/' + dstNumParagraphs] = srcMappingKey

		firebase.database().ref().update(updates);
   		gapi.client.slides.presentations.batchUpdate({
   		  presentationId: PRESENTATION_ID,
   		  requests: requests
   		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
   		});
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

function appearDropbox(objID) {
	$(".endOfParagraph[objID=" + objID + "]").show();
	$(".filmstripIndicator").show();
}

function disappearDropbox() {
	$(".endOfParagraph").hide();
	$(".filmstripIndicator").hide();
}

function showLoadingSlidePlane(){
	$("#loadingSlidePlane").show();
	$("#slidePlaneCanvas").css("background-color", "rgb(0, 0, 0, 0.3)");

	setTimeout(function() { hideLoadingSlidePlane(); }, 3000);
}

function hideLoadingSlidePlane() {
	$("#loadingSlidePlane").hide();
	$("#slidePlaneCanvas").css("background-color", "transparent");
}

function writeStructureHighlight(info) {
	var updates = {};

	updates['/users/' + userName + '/structureHighlightInfo/' + info.rowID] = {
		pageNumber: info.pdfPageNumber,
		startWordIndex: info.pdfStartWordIndex,
		endWordIndex: info.pdfEndWordIndex,
		text: info.text
	};

	structureHighlightDB[info.rowID] = {
		pageNumber: info.pdfPageNumber,
		startWordIndex: info.pdfStartWordIndex,
		endWordIndex: info.pdfEndWordIndex,
		text: info.text
	};

	firebase.database().ref().update(updates);
}

function updateStructure() {
	$(".documentStructureBodyRow").each(function(idx, elem) {
		if(!$(elem).hasClass("appendRow") && !($(elem).attr("id") in structureHighlightDB)) {
			$(elem).remove();
		}
	});

	for(var key in structureHighlightDB) {
		var rowObject = $("#" + key);

		if($(rowObject).length <= 0) {
			$("#documentStructureElements").append(
				documentStructureRowElement(key)
			);

			rowObject = $("#" + key);
		}

		$(rowObject).children(".documentStructureBodyRowTextBox").html(structureHighlightDB[key].text);

		$(rowObject).attr("mappingPageNumber", structureHighlightDB[key].pageNumber);
		$(rowObject).attr("mappingStartWordIndex", structureHighlightDB[key].startWordIndex);
		$(rowObject).attr("mappingEndWordIndex", structureHighlightDB[key].endWordIndex);
	}
}

$(document).ready(function() {
        // $("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");

		appendDocumentStructureRow();

		initializeGAPI(initializeDB);

		window.scrollTo(0, 0);

		setTimeout(function() { listSlides(); }, 2000);

		$(document).on("input", "#resourceBoxShortTextSlider", function(e) {
				var curValue = $(e.target).val();
				var curText = $("#resourceBoxShortTextSlider").attr("text" + curValue);

				$("#resourceBoxShortTextBox").attr("value", curText);
		});

		$(document).on("click", ".removeSlideObject", function(e) {
			var slidePageID = $(popoverElement).attr("pageID");
			var objectID = $(popoverElement).attr("objID");
			var paragraphIndex = parseInt($(popoverElement).attr("paragraphIndex"));

			removeParagraph(slidePageID, objectID, paragraphIndex)
		});

		$(document).on("click", ".editSlideObject", function(e) {
			disappearPopover();

			editFocus( {
				parent: $("#workspaceRect")[0].getBoundingClientRect(),
				child: $(popoverElement)[0].getBoundingClientRect()
			});

			setSlideState("EDIT", {
				paragraphID: $(popoverElement).attr("paragraphID")
			});
		});

		$(document).on("click", ".appendRow", function(e) {
			function pad(num, size) {
			    var s = "000000000" + num;
			    return s.substr(s.length-size);
			}

			var rows = $(".documentStructureBodyRow");
			var lastRowNumber = -1;

			if($(rows).length <= 1) lastRowNumber = 0;
			else lastRowNumber = parseInt($($(rows)[$(rows).length-2]).attr("id").substr(20));

			console.log(lastRowNumber);

			$("#documentStructureElements").append(
				documentStructureRowElement("documentStructureRow" + pad(lastRowNumber+1, 5))
			);
		});

		$(document).on("extension_typing", function(e) {
			if(curSlideState == "EDIT") {
				var p = e.detail;

				var rect = p.paragraphRect;
				var popoverRect = $(popoverElement)[0].getBoundingClientRect();

				if(parseInt(rect.height) != parseInt(popoverRect.height)) {
					setFocusBox($(popoverElement).attr("id"), {
						top: null,
						left: null,
						width: null,
						height: rect.height
					});

					editFocus( {
						parent: $("#workspaceRect")[0].getBoundingClientRect(),
						child: $(popoverElement)[0].getBoundingClientRect()
					});
				}
			}
		});

		$(document).on("extension_pageUpdated", function(e) {
			var tempCnt = 1;
			var p = e.detail;

			curSlideObjects = p;

			var pageID = p.pageID;

			for(var i=0;i<p.objects.length;i++) {
				var objID = p.objects[i].objectID.substr(7);

				if(slideDB == null) slideDB = {};
				if(!(pageID in slideDB)) slideDB[pageID] = {}
				if(!(objID in slideDB[pageID])) slideDB[pageID][objID] = {};

				if(Object.keys(p.objects[i].paragraph).length != Object.keys(slideDB[pageID][objID]).length) {
					if(Object.keys(p.objects[i].paragraph).length < Object.keys(slideDB[pageID][objID]).length) {
						var start = Object.keys(p.objects[i].paragraph.length)+1;
						var end = Object.keys(slideDB[pageID][objID]).length;
								
						for(var j=start;j<=end;j++) removeSlideMappingInfo(pageID, objID, j);
					}
					else {
						writeSlideMappingInfo(pageID, objID, Object.keys(p.objects[i].paragraph).length-1, "null");
					}
				}
			}

			if(curSlidePage == p.pageID) {
			}
			else {
				if(curSlideState == "WAIT")
					visualizeSlideObjects();
				else if(curSlideState == "EDIT") {
					editFocus( {
						parent: $("#workspaceRect")[0].getBoundingClientRect(),
						child: $(popoverElement)[0].getBoundingClientRect()
					});
				}
			}

			hideLoadingSlidePlane();
		});

		$(document).on("click", ".mappingIndicator.mapped", function(e) {
			issueEvent("root_navigateToWord", {
				mappingID: $(e.target).attr("mappingID")
			});
		});

		$(document).on("mousedown", function(e) {
			if($("#resourceBoxDiv").is($(e.target)) || $("#resourceBoxDiv").find($(e.target)[0]).length > 0) return;

			if(curSlideState == "WAIT") {
				$(".slideObjectFirstSelected").removeClass("slideObjectFirstSelected");
				$(".slideObjectSecondSelected").removeClass("slideObjectSecondSelected");

				if($(e.target).hasClass("objectIndicator")) {
					slideObjectMousedown++;
					$(e.target).addClass("slideObjectFirstSelected");

					appearDropbox($(e.target).attr("objID"));
				}
			}
			else if(curSlideState == "EDIT") {
				if($(e.target).hasClass("focusRect")) {
					setSlideState("WAIT", null);

					removeFocus();
					visualizeSlideObjects();
				}
			}
		});

		$(document).on("click", "#shortTextSubmitBtn", function(e) {
			var text = $("#resourceBoxShortTextBox").val();

			showLoadingSlidePlane();

			disappearPopover();
			disappearDropbox();
			disappearResourceBox();

			var curObj = $(".slideObjectFirstSelected");

			var slidePageID = $(curObj).attr("pageID");
			var objID = $(curObj).attr("objID");
			var paragraphIndex = parseInt($(curObj).attr("paragraphIndex"));

			slideSwitchText(slidePageID, objID, paragraphIndex, text);
		});

		$(document).on("mouseenter", ".objectIndicator", function(e) {
			if(slideObjectMousedown > 0) {
				$(this).addClass("slideObjectMouseEntered");
			}
		});

		$(document).on("mouseenter", ".filmstripIndicator", function(e) {
			if(slideObjectMousedown > 0) {
				$(this).addClass("filmstripMouseEntered");
			}
		});

		$(document).on("mouseleave", ".objectIndicator", function(e) {
			if(slideObjectMousedown > 0) {
				$(this).removeClass("slideObjectMouseEntered");
			}
		});

		$(document).on("mouseleave", ".filmstripIndicator", function(e) {
			if(slideObjectMousedown > 0) {
				$(this).removeClass("filmstripMouseEntered");
			}
		});

		
		$(document).on("dblclick", ".objectIndicator", function(e) {
			disappearPopover();

			editFocus( {
				parent: $("#workspaceRect")[0].getBoundingClientRect(),
				child: $(popoverElement)[0].getBoundingClientRect()
			});

			setSlideState("EDIT", {
				paragraphID: $(popoverElement).attr("paragraphID")
			});
		});


		$(document).on("mouseup", function(e) {
			if($("#resourceBoxDiv").is($(e.target)) || $("#resourceBoxDiv").find($(e.target)[0]).length > 0) return;

			slideObjectMousedown = 0;
			disappearDropbox();
			disappearResourceBox();

			var srcPageID = $(".slideObjectFirstSelected").attr("pageID");
			var srcObjectID = $(".slideObjectFirstSelected").attr("objID");
			var srcParagraphIndex = parseInt($(".slideObjectFirstSelected").attr("paragraphIndex"));

			if($(e.target).hasClass("objectIndicator")) {
				$(e.target).removeClass("slideObjectMouseEntered");
				$(e.target).addClass("slideObjectSecondSelected");
			}
			else if($(e.target).hasClass("filmstripIndicator")) {
				showLoadingSlidePlane();

				var pageID = $(e.target).attr("pageID");

				issueEvent("root_getLastObject", {
					pageID: pageID
				}, "extension_getLastObject").then(result => {
					var p = result.detail;
					var lastObjectID = p.objID;

					moveParagraphToSlide(srcPageID, srcObjectID, srcParagraphIndex, pageID, lastObjectID);
/*
					getTextOnParagraph(srcPageID, srcObjectID, srcParagraphIndex).then(result => {
						console.log(result);
					});
					*/
				});
			}
			else {
				$(".slideObjectFirstSelected").removeClass("slideObjectFirstSelected");
				disappearPopover();
			}

			if($(".slideObjectFirstSelected").length == 1 && $(".slideObjectSecondSelected").length == 1) {
				var src = $(".slideObjectFirstSelected")[0];
				var dst = $(".slideObjectSecondSelected")[0];

				if(src === dst) {
					appearPopoverOnSlideObject(src);
					issueEvent("root_getOriginalText", {
						mappingID: $("#mappingIndicator" + $(src).attr("id").substr(15)).attr("mappingID")
					}, "pdfjs_getOriginalText").then( result => {
							if(result.detail.text != '') {
								constructResourceBox(result.detail.text, []);
								appearResourceBox();
							}
						});

				}
				else if($(src).attr("objID") == $(dst).attr("objID")) {
					var srcParagraphIndex = parseInt($(src).attr("paragraphIndex"));
					var dstParagraphIndex = parseInt($(dst).attr("paragraphIndex"));

					// $(src).removeClass("slideObjectFirstSelected");
					// $(dst).removeClass("slideObjectSecondSelected");

					if(srcParagraphIndex+1 != dstParagraphIndex) {
						showLoadingSlidePlane();
						if(srcParagraphIndex < dstParagraphIndex) {
							// move srcParagraph --> dstParagraph-1

							var slidePageID = $(src).attr("pageID");
							var objectID = $(src).attr("objID");

							if(slidePageID in slideDB &&
								objectID in slideDB[slidePageID] &&
								slideDB[slidePageID][objectID] && 
								srcParagraphIndex in slideDB[slidePageID][objectID] 
								) {

								var updates = {};
								var srcMappingKey = slideDB[slidePageID][objectID][srcParagraphIndex];

								for(var l=srcParagraphIndex;l<dstParagraphIndex;l++) {
									updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];
									slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];
								}

								updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + (dstParagraphIndex-1)] = srcMappingKey;
								slideDB[slidePageID][objectID][dstParagraphIndex-1] = srcMappingKey;

								firebase.database().ref().update(updates);

								moveParagraph(slidePageID, objectID, srcParagraphIndex, dstParagraphIndex)
							}
							else{
								alert("ERROR OCCURED");
								console.log("error here");
							}
							
						}
						else {
							var slidePageID = $(src).attr("pageID");
							var objectID = $(src).attr("objID");

							if(slidePageID in slideDB &&
								objectID in slideDB[slidePageID] &&
								slideDB[slidePageID][objectID] && 
								srcParagraphIndex in slideDB[slidePageID][objectID] && 
								dstParagraphIndex in slideDB[slidePageID][objectID]
								) {

								var updates = {};
								var srcMappingKey = slideDB[slidePageID][objectID][srcParagraphIndex];

								for(var l=srcParagraphIndex;l>dstParagraphIndex;l--) {
									updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l-1];
									slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l-1];
								}

								updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + dstParagraphIndex] = srcMappingKey;
								slideDB[slidePageID][objectID][dstParagraphIndex] = srcMappingKey;

								firebase.database().ref().update(updates);

								moveParagraph(slidePageID, objectID, srcParagraphIndex, dstParagraphIndex)
							}
							else {
								alert("ERROR OCCURED");
								console.log("error here");
							}
						}
					}
				}
			}
		});

        $(document).on("initialSlideGeneration", 
                function(e) {
                var p = e.detail;

                sectionParagraph = p.paragraph;
                sectionStructure = p.sections.slice(0, 2);
                paperTitle = p.title;
                paperAuthors = p.authors;
                prepare();
                });

        $(document).on("pdfjs_renderFinished", function(e) {
                $("#loadingPlane").hide();
              //  closeNav();
                });

		$(document).on("pdfjs_pageRendered", function(e) {
				var p = e.detail;

				highlightPage(p.pageNumber);
		});

		$(document).on("pdfjs_highlighted", function(e) {
				var p = e.detail;

				registerHighlight(p).then( mappingID => {
					showLoadingSlidePlane();

					return putText(p, mappingID).then( () => {
						issueEvent("root_sendMappingIdentifier", {
							mappingID: mappingID,
							pageNumber: p.pageNumber,
							startWordIndex: p.startWordIndex,
							endWordIndex: p.endWordIndex
						});
					})
				});
		});

		$(document).on("pdfjs_checkPreprocessed", function(e) {
			readData('/' + userName).then(result => {
				if(result == null) {
				}
				else {
					issueEvent("root_checkPreprocessed", {
						"result": "no"
						});
				}
			});
		});

		$(document).on("pdfjs_removeMapping", function(e) {
			var p = e.detail;

			var mappingID = p.mappingID;
			var pageNumber = parseInt(p.pageNumber);

			removeMappingOnPdfjs(pageNumber, mappingID, true).then(result => {
				issueEvent("root_mappingRemoved", {
					mappingID: result 
				});
			});
		});

		$(document).on("click", ".documentStructureBodyRowTextBox", function(e) {
			var rowObject = $(e.target).parent();

			var attr = $(rowObject).attr('mappingPageNumber');

			if (typeof attr !== typeof undefined && attr !== false) { // attr is there.
				issueEvent("root_navigateToWord", {
					pageNumber: $(rowObject).attr("mappingPageNumber"),
					startWordIndex: $(rowObject).attr("mappingStartWordIndex"),
					endWordIndex: $(rowObject).attr("mappingEndWordIndex"),
				});
			}
		});

		$(document).on("click", ".documentStructureBodyRowEditIcon", function(e) {
				var rowObject = $(e.target).parent().parent();

				issueEvent("root_getStructureHighlight", {
					rowID: $(rowObject).attr("id")
				}, "pdfjs_getStructureHighlight").then( result => {
					console.log(result.detail);

					writeStructureHighlight({
						rowID: $(rowObject).attr("id"),
						text: result.detail.text,
						pdfPageNumber: result.detail.pageNumber,
						pdfStartWordIndex: result.detail.startWordIndex,
						pdfEndWordIndex: result.detail.endWordIndex
					});

					updateStructure();
				});
		});

		$(document).on("extension_focusObject", function(e) {

			var p = e.detail;
			
			setFocusBox("focusRect1", {
				top: p.parent.top+40,
				left: p.parent.left,
				width: p.parent.width,
				height: p.child.top - p.parent.top
			});

			setFocusBox("focusRect2", {
				top: p.child.top + 40,
				left: p.parent.left,
				width: p.child.left - p.parent.left,
				height: p.child.height
			});

			setFocusBox("focusRect3", {
				top: p.child.top + 40,
				left: p.child.right,
				width: p.parent.right - p.child.right,
				height: p.child.height
			});

			setFocusBox("focusRect4", {
				top: p.child.top + p.child.height + 40,
				left: p.parent.left,
				width: p.parent.width,
				height: p.parent.bottom - p.child.bottom
			});

			$(".focusRect").show();
		});


/*
        document.getElementById("wrapper").addEventListener( 
                'webkitTransitionEnd', 
                function( event ) { 
                alert( "Finished transition!" ); 
                }, false );
                */

		
		// console.log("hello");

		var readValue = readData('/').then(result => {
				/*
			console.log("world");
			console.log(result);
			*/
		});

 		 $("#check1").change( function(){
			var curState = $("#check1").prop("checked");

			if(curState) {
				$("#slidePlaneCanvas").hide();
			}
			else {
				$("#slidePlaneCanvas").show();
			}
 		 });

 		 $("#check2").change( function(){
			var curState = $("#check2").prop("checked");
			var updates = {};

			updates['/users/' + userName + '/parameters/'] = {
				initialize: curState
			}

			firebase.database().ref().update(updates);
 		 });
});

async function readData(path) {
	const eventref = firebase.database().ref(path);
	const snapshot = await eventref.once('value');
	const value = snapshot.val();

	return value;
}

function getStrings(data) {
	var rootIndex = -1;
	var myGraph = [];

	console.log(data);

	for(var i=0;i<data.length;i++) 
		myGraph.push([]);

	for(var i=0;i<data.length;i++) {
		if(data[i].parent == i) {
			rootIndex = i;
		}
		else {
			myGraph[data[i].parent].push(i);
		}
	}
	
	var result = doBFS(myGraph, rootIndex);
	var temp = [];
	var text = [];

	for(var i=0;i<result.length;i++) {
		var tt = [];

		temp = temp.concat(result[i]);

		for(var j=0;j<data.length;j++) {
			if(temp.includes(j)) {
				tt.push(data[j].text);
			}
		}

		text.push(tt.join(' '));
	}

	return text;
}


function constructResourceBox(originalText, listOfKeywords) {
 	xmlhttp = new XMLHttpRequest();
 	xmlhttp.open("GET","http://hyungyu.com:3333/?text=" + originalText.replace(" ", "_"), true);
 	xmlhttp.onreadystatechange=function(){
 	   if (xmlhttp.readyState==4 && xmlhttp.status==200){
 		      var data=JSON.parse(xmlhttp.responseText);

		  	  var result = getStrings(data);

			  $("#resourceBoxShortTextSlider").attr("max", result.length-1);
			  $("#resourceBoxShortTextSlider").attr("value", parseInt(result.length / 2));

			  for(var i=0;i<result.length;i++) $("#resourceBoxShortTextSlider").attr("text" + i, result[i]);

			  $("#resourceBoxShortTextBox").attr("value", result[parseInt(result.length/2)]);
 		  }
 	   }

 	xmlhttp.send();

	$("#resourceBoxDiv").html('');

	$("#resourceBoxDiv").append('<div class="resourceBoxHeader"> Original Text </div>');
	$("#resourceBoxDiv").append('<div id="resourceBoxOriginalText">' + originalText + '</div>');
	$("#resourceBoxDiv").append('<br>');

	$("#resourceBoxDiv").append('<div style="display: inline-block"> <div class="resourceBoxHeader" style="float: left"> Text Slider </div>' + 
								'<input style="float: left" type="range" min="0" max="100" value="50" id="resourceBoxShortTextSlider"> </div>');
	$("#resourceBoxDiv").append('<br>');
	$("#resourceBoxDiv").append("<input id='resourceBoxShortTextBox' value='Loading...'> </input> <button id='shortTextSubmitBtn' class='resourceBoxSubmitBtn'> Submit </button>");
}

function appearResourceBox() {
	$("#resourceBoxDiv").css("transform", "translate(0, -100%)");
}

function disappearResourceBox() {
	$("#resourceBoxDiv").css("transform", "translate(0, 0)");
}


function openNav() {
// document.getElementById("mySidenav").style.width = "50%";
      document.getElementById("wrapper").style.width = "50%";

        $("#dragButton").addClass("opened");
        $("#dragButton").html(">");
		$("#slidePlaneCanvas").show();
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
//      document.getElementById("mySidenav").style.width = "0";
        document.getElementById("wrapper").style.width = "100%";
        $("#dragButton").removeClass("opened");
        $("#dragButton").html("<");
		$("#slidePlaneCanvas").hide();
}

function toggleSlidePlane() {
    if($("#dragButton").hasClass("opened")) closeNav();
    else openNav();
}


async function writeSlideMappingInfo(pageID, objID, paragraphIndex, mappingID) {
	var updates = {};
/*
	console.log("### UPDATE SLIDE MAPPING ###");
	console.log(pageID);
	console.log(objID);
	console.log(paragraphIndex);
	console.log(mappingID); */

	updates['/users/' + userName + '/slideInfo/' + pageID + '/' + objID + '/' + paragraphIndex] = {
		mappingID: mappingID
	}

	if(slideDB == null) slideDB = {};
	if(!(pageID in slideDB)) slideDB[pageID] = {};
	if(!(objID in slideDB[pageID])) slideDB[pageID][objID] = [];

	for(var i=0;i<100;i++) {
		if(Object.keys(slideDB[pageID][objID]).length <= paragraphIndex) {
			updates['/users/' + userName + '/slideInfo/' + pageID + '/' + objID + '/' + (parseInt(Object.keys(slideDB[pageID][objID]).length))] = {
				mappingID: "null"
			}

			slideDB[pageID][objID][parseInt(Object.keys(slideDB[pageID][objID]).length)] = {
				mappingID: "null"
			}
		}
		else break;
	}

	if(i == 100) alert("WHAT? WHAT? WHAT? WHAT?");

	updates['/users/' + userName + '/slideInfo/' + pageID + '/' + objID + '/' + paragraphIndex] = {
		mappingID: mappingID 
	}
	slideDB[pageID][objID][paragraphIndex] = {
		mappingID: mappingID
	}

	await firebase.database().ref().update(updates);
}

function slideSwitchText(slidePageID, objID, paragraphIndex, text) {
    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		var startIndex = -1, endIndex = -1;
		var myText, myStartIndex=-1, myEndIndex=-1;
		var curParagraphIndex = -1;

		for (i = 0; i < length; i++) {
			if(endIndex != -1) break;

		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
			if(slideID == slidePageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objID) {
						var srcText = null, dstText = null;

						if("text" in slideItem.shape) {
							for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
								var textElem = slideItem.shape.text.textElements[k];

								if(textElem.endIndex != endIndex){
									curParagraphIndex++;

									if("startIndex" in textElem) startIndex = textElem.startIndex;
									else startIndex = 0;

									endIndex = textElem.endIndex;
								}

								if("textRun" in textElem && curParagraphIndex == paragraphIndex) { 
									myStartIndex = startIndex;
									myEndIndex = endIndex;

									if(text.trim() == textElem.textRun.content.trim()) {
										hideLoadingSlidePlane();
										return;
									}
								}
							}
						}
						else endIndex = 0;

						requests = [{
							deleteText: {
       							"objectId": objID,
       							"textRange": {
	   							    "startIndex":  myStartIndex,
	   							    "endIndex": (curParagraphIndex == paragraphIndex? myEndIndex-1 : myEndIndex == 0 ? 0 : myEndIndex-1),
	   							    "type": "FIXED_RANGE"
	   							}
							}
						}, {
							insertText: {
      							"objectId": objID,
      							"text": text,
      							"insertionIndex": myStartIndex 
							}
						}];

   						gapi.client.slides.presentations.batchUpdate({
   						  presentationId: PRESENTATION_ID,
   						  requests: requests
   						}).then((createSlideResponse) => {
							console.log(createSlideResponse);
   						});
						
						break;
					}
				}
			}
		}
	});
}

function appendText(pageID, objId, myText, mappingID) {
    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		// slideDB = {};
	
		var startIndex = -1, endIndex = -1;
		var curParagraphIndex = -1;

		for (i = 0; i < length; i++) {
			if(endIndex != -1) break;

		    var slide = presentation.slides[i];
	
		    var slideID = slide.objectId;
		    var slideObjId = {};
	
			if(slideID == pageID) {
				for(var j=0;j<slide.pageElements.length;j++) {
					var slideItem = slide.pageElements[j];

					if(slideItem.objectId == objId) {
						var srcText = null, dstText = null;

						if("text" in slideItem.shape) {
							for(var k=0;k<slideItem.shape.text.textElements.length;k++) {
								var textElem = slideItem.shape.text.textElements[k];

								if(textElem.endIndex != endIndex){
									curParagraphIndex++;

									if("startIndex" in textElem) startIndex = textElem.startIndex;
									else startIndex = 0;

									endIndex = textElem.endIndex;
								}
							}
						}
						else endIndex = 0;

						break;
					}
				}
			}
		}

        var requests = [ {
          "insertText": {
            objectId: objId,
            text: (endIndex == 0 ? myText : '\n' + myText),
            insertionIndex: (endIndex  == 0 ? 0 : endIndex-1)
          },
        } ];

        gapi.client.slides.presentations.batchUpdate({
          presentationId: PRESENTATION_ID,
          requests: requests
        }).then((createSlideResponse) => {
            // successfully pasted the text

		    if(endIndex == 0) 
		        writeSlideMappingInfo(pageID, objId, 0, mappingID);
		    else 
		        writeSlideMappingInfo(pageID, objId, Object.keys(slideDB[pageID][objId]).length, mappingID);
		    return true;
        });
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
	/*
   gapi.client.slides.presentations.batchUpdate({
     presentationId: PRESENTATION_ID,
     requests: requests
   }).then((createSlideResponse) => {
       console.log("strange");
       console.log(createSlideResponse);
   }).catch(function(error) {
       if(error.result.error.code == 400) { // get the end index
           var errorMessage = error.result.error.message;

           var flag = false;
           var result = 0, pow = 1;

           for(var i=errorMessage.length-1;i>=0;i--) {
              if(errorMessage[i] == ')') {
                 flag = true;
              }
              else if(errorMessage[i] == '(') break;
              else {
                  if(flag == true) {
                      result = result + pow * parseInt(errorMessage[i]);
                      pow *= 10;
                  }
              }
           }

           var requests = [ {
             "insertText": {
               objectId: objId,
               text: (result == 0 ? myText : '\n' + myText),
               insertionIndex: result
             },
           } ];

           gapi.client.slides.presentations.batchUpdate({
             presentationId: PRESENTATION_ID,
             requests: requests
           }).then((createSlideResponse) => {
               // successfully pasted the text

			   if(result == 0) 
			       writeSlideMappingInfo(pageID, objId, 0, mappingID);
			   else 
			       writeSlideMappingInfo(pageID, objId, Object.keys(slideDB[pageID][objId]).length, mappingID);
			   return true;
           });
	    }
   });
   */
}

function doBFS(myGraph, r) {
	var myQueue = [];
	var front = 0;

	myQueue.push([r, 0]);

	var result = [[]];

	while(front < myQueue.length) {
		var cur = myQueue[front];

		front++;

		while(result.length <= cur[1]) result.push([]);

		result[cur[1]].push(cur[0]);

		for(var j=0;j<myGraph[cur[0]].length;j++) {
			myQueue.push([myGraph[cur[0]][j], cur[1]+1]);
		}
	}

	return result;
}

