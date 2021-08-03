var MAX_ELEMENTS_PER_SLIDE = 4;
var SLIDES_PER_MIN = 2;

var GOOGLE_SLIDE_HEIGHT = 540;
var GOOGLE_SLIDE_WIDTH = 960;

var RENDER_SLIDE_HEIGHT = 225;
var RENDER_SLIDE_WIDTH = 400;

var adaptivePlaneStatus = 0;
var slideDeckInfo = {};

var docSlideStructure = [{},];

var userName = 'tempUser';
var PRESENTATION_ID = '1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY'
var curHighlightInfo = {
	pageNumber: -1,
	startWordIndex: -1,
	endWordIndex: -1
};
var curRecommendedSlideList;
var generalMouseDown = 0;
var slideDB = {};
var curSlideObjects = null;
var curSlideState = "WAIT";
var highlightDB = {};
var mappingPageNumberIndex = {};
var slideObjectMousedown = 0;
var slideObjectMousedownObject = null;
var slideObjectMouseupObject = null;
var popoverElement = null;
var curSlidePage = null; 
var structureHighlightDB = {};
var recommendationLoadingHistory = {};
var clickedElements = false;
var userLevelCoverageConstraints = {};

var currentSlideDeckConstraints = {};
var currentSingleSlideConstraints = {};

var T = null, C = null;

var MAX_NUMBER_OF_BULLETS = 3;
var MAX_NUMBER_OF_SLIDES = 10;

function getImgList(x) { 
	for(var i in x) {
		if(x[i].length > 0)
			return x[i][0];
	}
	return -1;
}

function presentationObjectiveRowElement(sectionKey, index) {
	return "<tr>" + 
		"<td class='sectionLevelCoverageRowTitle' sectionKey='" + sectionKey + "' rowIndex='" + index + "'> </td>" + 

		"<td class='sectionLevelCoverageRowHighlight' sectionKey='" + sectionKey + "' rowIndex='" + index + "'> </td>" + 

		"<td class='sectionLevelCoverageRowBoxes' sectionKey='" + sectionKey + "' rowIndex='" + index + "'>" + 
		/*
		"<table class='.coverageTable' style='height: 30px; border-collapse: collapse; border-spacing: 0;' sectionKey='" + sectionKey + "' rowIndex='" + index + "'>" + 
		"<tr>" + 
		(function(key) {
			var returnValue = '';

			for(var i=0;i<MAX_NUMBER_OF_SLIDES;i++) {
				returnValue += "<td class='coverageTableCell' sectionKey='" + key + "' index='" + i + "'> </td>";
			}

			return returnValue;
		})(sectionKey) + 
		"</tr>" +
		*/
		"<button class='sectionLevelCoverageMinusBtn' sectionKey='" + sectionKey + "' rowIndex='" + index + "' > - </button>" + 
	    "<input class='sectionLevelCoverageInput' sectionKey='" + sectionKey + "' rowIndex='" + index + "' />" + 
		"<button class='sectionLevelCoveragePlusBtn' sectionKey='" + sectionKey + "' rowIndex='" + index + "' > + </button>" + 
		"</td> </tr>";


}

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

async function getRepresentativeImageURL(queryString) {
	String.prototype.replaceAll = function(search, replacement) {
	   var target = this;
	   return target.replace(new RegExp(search, 'g'), replacement);
	};

    queryString = queryString.replaceAll(' ', '+');

	console.log(queryString);

    var haha = await $.get({
            url:"https://www.googleapis.com/customsearch/v1/siterestrict?fileType=jpg,png,jpeg&key=AIzaSyA160fCjV5GS8HhQtYj2R29huH9lnXURKw&cx=000180283903413636684:oxqpr8tki8w&q="+queryString+"&searchType=image",
            // success: registerImageOnHighlight
            });

	console.log(haha);

	return haha.items[0].link;
}

async function writeHighlight(pageNumber, startWordIndex, endWordIndex, text) {
	var newKey = firebase.database().ref('users/' + userName + '/mapping/' + pageNumber + '/').push().key;

	// var rURL = await getRepresentativeImageURL(text);

	var updates = {};

	updates['/users/' + userName + '/mapping/' + pageNumber + '/' + newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex,
		text: text,
		// imageURL: rURL
	};

	await firebase.database().ref().update(updates);

	if(!("mapping" in highlightDB)) highlightDB.mapping = {};
	if(!(pageNumber in highlightDB.mapping)) highlightDB.mapping[pageNumber] = {};

	highlightDB.mapping[pageNumber][newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex,
		text: text,
		// imageURL: rURL
	};

	mappingPageNumberIndex[newKey] = pageNumber;

	return {
		key: newKey,
		text: text
	    // imageURL: rURL
	}
}

async function registerHighlight(highlightInfo) {
	return new Promise(function (resolve, reject) { var ret = writeHighlight(highlightInfo.pageNumber, highlightInfo.startWordIndex, highlightInfo.endWordIndex, highlightInfo.text);
		resolve(ret);
	});
}

function showDocSlideView(i) {
	console.log(i);

	if(i == -1)	$(".adaptationViewDiv").show();
	else {
		$(".adaptationViewDiv").hide();
		$(".adaptationViewDiv[index='" + i + "']").show();
	}
}

function setDocSlideStructure(dsStructure) {
	var tableBody = '';

	for(var i=0;i<dsStructure.length;i++) {
		tableBody = tableBody + getDocSlideStructureView(i);
	}

	$("#adaptationViewBody").html(tableBody);

	/* Render Resources tab */
}
async function clearDB() {
	var updates = {};

	updates['/users/' + userName + '/slideInfo/'] = {};
	updates['/users/' + userName + '/docSlideStructure/'] = [{}];
	updates['/users/' + userName + '/mapping/'] = {}

	for(var key in structureHighlightDB) {
		if("slideID" in structureHighlightDB[key]) delete structureHighlightDB[key].slideID;
		if("titleObjectID" in structureHighlightDB[key]) delete structureHighlightDB[key].titleObjectID;
		if("bodyObjectID" in structureHighlightDB[key]) delete structureHighlightDB[key].bodyObjectID;
	}

	console.log(structureHighlightDB);

	updates['/users/' + userName + '/structureHighlightInfo/'] = structureHighlightDB;

	await firebase.database().ref().update(updates);
}

async function writeInitializeSlides() {
	var updates = {}

	for(var key in slideDB) {
		updates['/users/' + userName + '/slideInfo/' + key] = {}

		delete slideDB[key]
	}

	await firebase.database().ref().update(updates);
}
async function initializeSlide() {
	writeInitializeSlides().then(() => {
		console.log(slideDB);

		gapi.client.slides.presentations.get({
			presentationId: PRESENTATION_ID
		}).then(function (response) {
			var slides = response.result.slides;

			initialSlideCnt = slides.length;
			removedSlideCnt = 0;

			var requests = [];

			for (var i = 0; i < slides.length; i++) {
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
			/*
				  requests.push({
					 createSlide: {
						  insertionIndex: '1',
						  slideLayoutReference: {
							  predefinedLayout: 'TITLE_AND_BODY'
						  }
					   }
				  }); */

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				// successfully pasted the text
				return true;
			});
		}).catch(function (err) {
			console.log(err);
		});
	});
}

function getSlideHeight(x) {
	return x / RENDER_SLIDE_HEIGHT * GOOGLE_SLIDE_HEIGHT;
}

function getSlideWidth(x) {
	return x / RENDER_SLIDE_WIDTH * GOOGLE_SLIDE_WIDTH;
}

function initializeDB() {
	readData('/users/' + userName).then(result => {
		console.log(result);
		console.log(result.parameters.heavy);

		if("parameters" in result && "heavy" in result.parameters) {
			if(result.parameters.heavy == "text") $("#textHeavyBtn").prop("checked", "true");
			else $("#imageHeavyBtn").prop("checked", "true");
		}
		else $("#textHeavyBtn").prop("checked", "true");

		if(!("parameters" in result && "initialize" in result.parameters && !result.parameters.initialize)) {
			$("#check2").prop("checked", "true");

			if("structureHighlightInfo" in result) 
				structureHighlightDB = result.structureHighlightInfo;
			else
				structureHighlightDB = {};

			clearDB().then( () => {
				initializeSlide().then( () => {
					issueEvent("root_openPDF", null);

					currentSlideDeckConstraints.sparseDense = 0;
					currentSlideDeckConstraints.textLength = 50;
					currentSlideDeckConstraints.descAbst = 0;
					currentSlideDeckConstraints.time = 1;
					currentSlideDeckConstraints.sectionLevelCoverage = {};

					highlightDB.slideInfo = {};
					slideDB = highlightDB.slideInfo;

					docSlideStructure = [{}];

					setDocSlideStructure(docSlideStructure);
					showDocSlideView(0);

					for (var key in structureHighlightDB) {
						currentSlideDeckConstraints.sectionLevelCoverage[key] = 0;
					}

					initializeConstraintsPlane();

					setTimeout(function() {
							$("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");
						}, 1000);
					});
			});
		}
		else {
			// $("#check2").prop("checked", "false");
			// $("#textHeavyBtn").prop("checked", "true");
			$("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");

			highlightDB = result;
			docSlideStructure = result.docSlideStructure;

			setDocSlideStructure(docSlideStructure);
			showDocSlideView(0);

			if(docSlideStructure == null) docSlideStructure = [];

			if(highlightDB == null) {
				highlightDB = {};
				highlightDB['mapping'] = {};
			}

			for(var pgNumber in highlightDB.mapping) {
				for (var k in highlightDB.mapping[pgNumber]) {
					mappingPageNumberIndex[k] = pgNumber;
				}
			}

			slideDB = result.slideInfo;

			if("structureHighlightInfo" in result) 
				structureHighlightDB = result.structureHighlightInfo;
			else
				structureHighlightDB = {};

			if("slideDeckConstraints" in result) {
				setConstraints("slideDeck", result.slideDeckConstraints, null, false);
				console.log(result.slideDeckConstraints);
			}
			else {
				result.slideDeckConstraints = getConstraints("slideDeck");
			}
			
			if ("singleSlideConstraints" in result) {
				setConstraints("singleSlide", result.singleSlideConstraints, "all", false);
			}

			initializeConstraintsPlane();

			setTimeout(function() {
				issueEvent("root_openPDF", null);
			}, 1000);

		}
	}).catch(function(error) {
		console.log(error);
	});
}

function initializeConstraintsPlane() {
	var info = organizeHighlightOnSections();
	console.log(info);

	var res = computeTC(info);

	T = res.T;
	C = res.C;

	$("#constraints_emptyScreen").hide();
	$("#constraints_noHighlightFound").hide();
	$(".presentationObjectiveBody").hide();

	if (T.length <= 0) {
		$("#constraints_emptyScreen").show();

		$("#slideDeck_sparseDenseSlider")[0].value = currentSlideDeckConstraints.sparseDense;
		$("#slideDeck_slideLayoutSlider")[0].value = currentSlideDeckConstraints.descAbst;
		$("#slideDeck_presentationTimeInputBox")[0].value = currentSlideDeckConstraints.time;
		$("#slideDeck_textLengthSlider")[0].value = currentSlideDeckConstraints.textLength;
/*
		for (var s in currentSlideDeckConstraints.sectionLevelCoverage) {
			$(".sectionLevelCoverageInput[sectionKey='" + s + "']")[0].value = currentSlideDeckConstraints.sectionLevelCoverage[s];
		}
		*/

		return;
	}
	else {
		$("#constraints_emptyScreen").hide();
		$("#slideDeckLevelConstraints").show();
	}

	var maxPageNum = -1, minPageNum = 987987987;

	for (var i = T[T.length - 1].length - 1; i >= 0; i--) {
		if (T[T.length - 1][i].l != -1) {
			maxPageNum = Math.max(maxPageNum, i);
			minPageNum = Math.min(minPageNum, i);
		}
	}

	console.log(currentSlideDeckConstraints);

	$("#slideDeck_sparseDenseSlider")[0].max = maxPageNum;
	$("#slideDeck_sparseDenseSlider")[0].min = minPageNum;
	$("#slideDeck_sparseDenseSlider")[0].value = currentSlideDeckConstraints.sparseDense;

	$("#slideDeck_slideLayoutSlider")[0].min = 0;
	$("#slideDeck_slideLayoutSlider")[0].max = 100;
	$("#slideDeck_slideLayoutSlider")[0].value = currentSlideDeckConstraints.descAbst;

	$("#singleSlide_slideLayoutSlider")[0].min = 0;
	$("#singleSlide_slideLayoutSlider")[0].max = 100;

	$("#slideDeck_presentationTimeInputBox")[0].value = currentSlideDeckConstraints.time;

	var maxLength = 0;
	for (var s in info) {
		for (var i = 0; i < info[s].length; i++) {
			maxLength = Math.max(maxLength, info[s][i].text.length)
		}
	}

	$("#slideDeck_textLengthSlider")[0].min = 0;
	$("#slideDeck_textLengthSlider")[0].max = maxLength;
	$("#slideDeck_textLengthSlider")[0].value = currentSlideDeckConstraints.textLength;

	$("#singleSlide_textLengthSlider")[0].min = 0;
	$("#singleSlide_textLengthSlider")[0].max = maxLength;

	updatePresentationObjectiveStructure();

	for (var s in currentSlideDeckConstraints.sectionLevelCoverage) {
		$(".sectionLevelCoverageInput[sectionKey='" + s + "']")[0].value = currentSlideDeckConstraints.sectionLevelCoverage[s];
	}

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

	// console.log(curSlideObjects);

	for(var i=0;i<curSlideObjects.objects.length;i++) {
		var bottom = -1;

		if("0" in curSlideObjects.objects[i].paragraph) { // image
			var objectID = curSlideObjects.objects[i].objectID.substr(7);
			var rectInfo = curSlideObjects.objects[i].paragraph[0];
			var mappedFlag = false;

			if(slideDB[curSlideObjects.pageID][objectID][0].mappingID != "null") {
				mappedFlag = true;
			}

			$("#slidePlaneCanvas").append(
				"<div id='objectIndicator" + tempCnt + "' class='objectIndicator' pageID='" + curSlideObjects.pageID + "'" + 
				" objID='" + objectID + "' paragraphID='" + 0 + "'" + 
				" paragraphIndex=" + 0 + "></div>" + 
				(mappedFlag ? 
				 "<div id='mappingIndicator" + tempCnt + "' class='mappingIndicator mapped' objID='" + objectID + "' paragraphID=" + 0 + " mappingID=" + slideDB[curSlideObjects.pageID][objectID][0].mappingID + "></div>" 
				 : 
				 "<div id='mappingIndicator" + tempCnt + "' class='mappingIndicator' objID='" + objectID + "' paragraphID=" + 0 + "></div>")

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
		else {
			for(k in curSlideObjects.objects[i].paragraph) {
				var objectID = curSlideObjects.objects[i].objectID.substr(7);
				var paragraphID = parseInt(k.substr(7).split('-')[2]);
				var rectInfo = curSlideObjects.objects[i].paragraph[k];
				var mappedFlag = false;

				console.log(curSlideObjects.pageID, objectID, paragraphID);
				if(curSlideObjects.pageID in slideDB && 
				   objectID in slideDB[curSlideObjects.pageID] && 
				   paragraphID in slideDB[curSlideObjects.pageID][objectID])
				   console.log(slideDB[curSlideObjects.pageID][objectID][paragraphID])

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

	// $("#noteSpacePlane").show();

	setFocusBox("noteSpacePlane", {
		top: curSlideObjects.notespace.rect.top + 40,
		left: curSlideObjects.notespace.rect.left,
		width: curSlideObjects.notespace.rect.width - 20,
		height: curSlideObjects.notespace.rect.height - 20
	})
}

async function putText(p, mappingID) {
	return new Promise(function (resolve, reject) { 
		 appendText(curSlideObjects.pageID, curSlideObjects.objects[curSlideObjects.objects.length-1].objectID.substring(7), p.text, mappingID);

		resolve(mappingID);
	});
}

async function removeSlideMappingInPage(pageID) {
	var updates = {};

	for(var key in slideDB[pageID]) {
		updates['/users/' + userName + '/slideInfo/' + pageID] = {}

		delete slideDB[pageID][key]
	}

	await firebase.database().ref().update(updates);
}

async function removeSlideMappingInPages(pageIDs) {
	var updates = {};

	for(var i=0;i<pageIDs.length;i++) {
		var pageID = pageIDs[i];

		for (var key in slideDB[pageID]) {
			updates['/users/' + userName + '/slideInfo/' + pageID] = {}

			delete slideDB[pageID][key]
		}
	}

	await firebase.database().ref().update(updates);
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

async function findImages(queries) {
	var queryStatement = queries.join(" ");

	console.log(queryStatement);

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				type: "all",
				query: queryStatement
			}
		),
	};

	var result = await fetch('http://localhost:8010/proxy/getImages', requestOptions)
		.then(response => response.json())
		.then(data => {
			return data;
		});

	return result;
}

function getParagraphIndexOfDocSlideStructure(s, r) {
	var slideID = docSlideStructure[s].slide.id;
	var mappingKey = docSlideStructure[s].resources[r].mappingKey;
	var slideObjID = docSlideStructure[s].resources[r].currentContent.objID;

	if(slideID in slideDB && slideObjID in slideDB[slideID]) {
		for(var i=0;i<slideDB[slideID][slideObjID].length;i++) {
			if(slideDB[slideID][slideObjID][i].mappingID == mappingKey) {
				return i;
			}
		}

		console.log("***** NOT FOUND *****");
		return -1;
	}
	else{
		console.log("***** NOT FOUND *****");
		return -1;
	}
}

function getImageToShow(imgList) {
	for(var i=0;i<imgList.length;i++) {
		if(!imgList[i].url.includes("fbsbx"))
			return imgList[i];
	}

	console.log("***** NOT FOUND *****");
	return -1;
}

async function substituteTextToFigure(s, r, d) {
	var slidePageID = docSlideStructure[s].slide.id;
	var objectID = docSlideStructure[s].resources[r].currentContent.objID;
	var paragraphIndex = getParagraphIndexOfDocSlideStructure(s, r);

	var originalText = docSlideStructure[s].resources[r].originalContent.contents;

	var imgList = await findImages(d.surfaceWords);
	var finalImage = getImageToShow(imgList);

	var imgObjID = makeid(10);

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

								var requests = [];
								var objDeletionFlag = false;

								if(slidePageID in slideDB &&
									objectID in slideDB[slidePageID] &&
									slideDB[slidePageID][objectID] && 
									paragraphIndex in slideDB[slidePageID][objectID]) {

									mappingKey = slideDB[slidePageID][objectID][paragraphIndex].mappingID;

									var numParagraphs = Object.keys(slideDB[slidePageID][objectID]).length;
									var updates = {};

									console.log(JSON.parse(JSON.stringify(slideDB[slidePageID][objectID])))
									console.log(numParagraphs);

									if(numParagraphs-1 == paragraphIndex) lastParagraphFlag = true;

									for(var l=paragraphIndex;l<numParagraphs-1;l++) {
										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];

										slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];
									}

									if(numParagraphs > 1)  {
										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID + '/' + (numParagraphs - 1)] = {
											mappingID: null
										}

										console.log(JSON.parse(JSON.stringify(slideDB[slidePageID][objectID])))
										slideDB[slidePageID][objectID].pop();

										console.log(JSON.parse(JSON.stringify(slideDB[slidePageID][objectID])))
									}
									else {
										objDeletionFlag = true;

										requests.push({
											"deleteObject": {
												"objectId": objectID,
											},
										});

										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID] = null;
										delete slideDB[slidePageID][objectID];
									}

									slideDB[slidePageID][imgObjID] = [];
									slideDB[slidePageID][imgObjID].push({
										mappingID: mappingKey
									})

									updates['/users/' + userName + '/slideInfo/' + slidePageID+ '/' + imgObjID + '/0'] = {
										mappingID: mappingKey
									}

									docSlideStructure[s].resources[r].currentContent.objID = imgObjID;
									docSlideStructure[s].resources[r].currentContent.type = "image";
									docSlideStructure[s].resources[r].currentContent.contents = finalImage;
									docSlideStructure[s].resources[r].currentContent.contents.index = d.index;
									docSlideStructure[s].resources[r].currentContent.contents.keywords = []

									for (var j = 0; j < d.surfaceWords.length; j++) {
										docSlideStructure[s].resources[r].currentContent.contents.keywords.push({
											keyword: d.surfaceWords[j],
											selected: true
										})
									}

									updates['/users/' + userName + '/docSlideStructure/' + s + '/resources/' + r + '/currentContent/'] = docSlideStructure[s].resources[r].currentContent;

									firebase.database().ref().update(updates);
								}

								requests.push({
									createImage: {
										objectId: imgObjID,
										elementProperties: {
											pageObjectId: slidePageID,
											size: {
												width: {
													magnitude: 220,
													unit: "pt"
												},
												height: {
													magnitude: 220,
													unit: "pt"
												},
											},
										},
										url: finalImage.url
									}
								});

								console.log(lastParagraphFlag);

								if(objDeletionFlag) {
									return gapi.client.slides.presentations.batchUpdate({
										presentationId: PRESENTATION_ID,
										requests: requests
									}).then((createSlideResponse) => {
										return true;
									});
								}
								else {
									return removeRangeInObjWithRequest(slidePageID, objectID, {
										startIndex: (lastParagraphFlag ? (startIndex == 0 ? 0 : startIndex - 1) : startIndex),
										endIndex: endIndex + (lastParagraphFlag ? -1 : 0)
									}, requests)
								}
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





async function removeParagraph(slidePageID, objectID, paragraphIndex) {
    return await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(function(response) {
		paragraphIndex = parseInt(paragraphIndex);

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

									console.log(slideDB[slidePageID][objectID][0]);
									console.log(slideDB[slidePageID][objectID][1]);
									console.log(slideDB[slidePageID][objectID][2]);

									if(numParagraphs-1 == paragraphIndex) lastParagraphFlag = true;

									console.log(paragraphIndex);

									for(var l=paragraphIndex;l<numParagraphs-1;l++) {
										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];

										console.log(l);
										console.log(slideDB[slidePageID][objectID][l]);
										console.log(slideDB[slidePageID][objectID][l+1]);

										slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];

										console.log(slideDB[slidePageID][objectID][l]);
										console.log(slideDB[slidePageID][objectID][l+1]);

									}

									updates['/users/' + userName + '/slideInfo/' + slidePageID+ '/' + objectID+ '/' + (numParagraphs-1)] = {
										mappingID: null
									}

									delete slideDB[slidePageID][objectID][numParagraphs-1];

									console.log(slideDB[slidePageID][objectID]);
									console.log(updates);

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

function getRemoveRangeInObjRequest(slidePageID, objectID, range) {
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

   return requests;
}

async function removeRangeInObjWithRequest(slidePageID, objectID, range, request) {
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

   requests = requests.concat(request);

   return await gapi.client.slides.presentations.batchUpdate({
     presentationId: PRESENTATION_ID,
     requests: requests
   }).then((createSlideResponse) => {
	   return true;
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

	setTimeout(function() { hideLoadingSlidePlane(); }, 5000);
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
		$(rowObject).attr("level", structureHighlightDB[key].level);

		var level = $(rowObject).attr("level");

		if (typeof level !== typeof undefined && level !== false) { // attr is there.
			$(rowObject).children(".documentStructureBodyRowTextBox").css("padding-left", ((level-1) * 20 + 10) + "px");
		}
	}
}

function organizeHighlightOnSections() {
	var info = {};

	console.log(JSON.parse(JSON.stringify(highlightDB)));

	for(var pageNumber in highlightDB.mapping) {
		for(var key in highlightDB.mapping[pageNumber]) {
			var sectionKey = getSectionKey(pageNumber, highlightDB.mapping[pageNumber][key].startWordIndex, highlightDB.mapping[pageNumber][key].endWordIndex);

			if(!(sectionKey in info)) info[sectionKey] = [];
			// if(!(key in info[sectionKey])) info[sectionKey][key] = {};

			info[sectionKey].push( 
			{
				pageNumber: parseInt(pageNumber),
				startWordIndex: highlightDB.mapping[pageNumber][key].startWordIndex,
				endWordIndex: highlightDB.mapping[pageNumber][key].endWordIndex,
				sectionKey: sectionKey,
				text: highlightDB.mapping[pageNumber][key].text,
				mappingKey: key,
				imageURL: highlightDB.mapping[pageNumber][key].imageURL,
			})
			
		}
	}

	for(m in info) {
		info[m].sort( function(first, second) {
			if(first.pageNumber > second.pageNumber) return 1;
			else if(first.pageNumber == second.pageNumber) {
				if(first.startWordIndex > second.startWordIndex) return 1;
				else return -1;
			}
			else return -1;
		})
	}

	return info;
}

function updatePresentationObjectiveStructure() {
	$("#slideDeck_sectionLevelCoverageTable").html('<tr> <th> Section title </th> <th> highlight </th> <th> # slides </th> </tr>');
	var index = 0;

	var info = organizeHighlightOnSections();

	for(var key in structureHighlightDB) {
		$("#slideDeck_sectionLevelCoverageTable").append(
			presentationObjectiveRowElement(key, index)
		);

		var numHighlight = parseInt((key in info ? Object.keys(info[key]).length : 0));

		$(".sectionLevelCoverageRowTitle[rowIndex=" + index + "]").html(structureHighlightDB[key].text);
		$(".sectionLevelCoverageRowHighlight[rowIndex=" + index + "]").html(numHighlight);

		var cur = $(".coverageTableCell[sectionKey='" + key + "'][index='0']");

		for(var i=0;i<MAX_NUMBER_OF_SLIDES;i++) {
			if(i >= numHighlight) $(cur).addClass("disabled");

			cur = $(cur).next();
		}

		index++;
	}
}

function appearDocumentStructureBtn() {
	updateStructure();

	$("#documentStructurePlane").show();
}

function disappearDocumentStructureBtn() {
	$("#documentStructurePlane").hide();
}

function disappearPresentationObjective() {
	$("#presentationObjectivePlane").hide();
}

function appearPresentationObjective() {
	$("#presentationObjectivePlane").show();
}
function setCurLevel(rowObjId, level) {
	console.log(rowObjId, level);

	var updates = {};

	structureHighlightDB[rowObjId].level = level;
	updates['/users/' + userName + '/structureHighlightInfo/' + rowObjId + '/level/'] = level;

	$("#" + rowObjId).attr("level", level);

	firebase.database().ref().update(updates);
}

function chooseElements(info, sectionKey, number) {
	var retValue = [];

	if(number <= 0) return [];

	var keys = Object.keys(info[sectionKey]);
	var n = keys.length;
	
	if(number >= n) {
		for(var i=0;i<n;i++) {
			retValue.push(info[sectionKey][keys[i]]);
		}
	}
	else {
		var optimal_a = parseInt((n-number)/2), optimal_b = 0;
		var optimal_diff = Math.abs(optimal_a - optimal_b);
	
		for(var a=0;a<n/2;a++) {
			if((n-number-(2*a) > 0)) {
				var b = parseInt((n-number-(2*a)) / (number - 1));
	
				if(Math.abs(a-b) < optimal_diff || Math.abs(a-b) == optimal_diff && b > optimal_b) {
					optimal_diff = Math.abs(a-b);
	
					optimal_a = a;
					optimal_b = b;
				}
			}
		}
	
		console.log(optimal_a, optimal_b);
	
		var cur = optimal_a;
	
		for(var i=0;i<number;i++) {
			retValue.push(info[sectionKey][keys[cur]]);
	
			cur += (optimal_b+1);
		}
	}

	return retValue;
}

function setTimeConstraint(value) {
	if (value > T[T.length - 1].length || T[T.length - 1][value].l == -1) {
		$("#slideDeck_presentationTimeInputBox").css("background-color", "red");
	}
	else {
		$("#slideDeck_presentationTimeInputBox").css("background-color", "white");

		var minPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].min);
		var maxPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].max);

		$("#slideDeck_sparseDenseSlider")[0].value = minPageNum + (maxPageNum - value);

		updateSectionLevelCoverageValue();
		checkConstraintsDifference("slideDeck");
	}
}

function printLink(info, T, C, numSlides, coverage, isFlexible) {
	if(T == null || T.length <= 0) return {};

	var res = [];
	var Ckeys = Object.keys(C);
	var curSection = T.length-1;
	var numPages = [];

	console.log(coverage);
	console.log(JSON.parse(JSON.stringify(T)));
	console.log(JSON.parse(JSON.stringify(C)));

	console.log(numSlides);
	console.log(isFlexible);

	var numSlidesChanged = false;

	if(T[curSection][numSlides].l == -1) {
		if(isFlexible) {
			if(T[curSection][numSlides+1].l == -1) {
				alert("STILL NOT POSSIBLE");
				return -1;
			}

			numSlides = numSlides + 1;

			$("#slideDeck_presentationTimeInputBox")[0].value = numSlides;

			var minPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].min);
			var maxPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].max);

			$("#slideDeck_sparseDenseSlider")[0].value = minPageNum + (maxPageNum - numSlides);

			numSlidesChanged = true;
		}
		else {
			alert("NOT POSSIBLE");
			return -1;
		}
	}


	var curSlideNum = numSlides;

	for(var i=0;i<T.length;i++) numPages.push(0);

	if(coverage != null) numPages = coverage;
	else {
		while (1) {
			console.log(curSection, curSlideNum);

			numPages[curSection] = T[curSection][curSlideNum].l;

			if (curSection == 0) break;

			curSlideNum -= T[curSection][curSlideNum].l;

			curSection = curSection - 1;
		}
	}

	console.log(numPages);

	for (var i = 0; i < numPages.length; i++) {
		var p = numPages[i];

		res.push([]);

		for (var j = 0; j < p; j++) res[i].push(0);

		var curPage = p;

		console.log(C);
		console.log(Ckeys);
		console.log(i);
		console.log(C[Ckeys[i]]);

		var curElement = C[Ckeys[i]][0].length - 1;

		while (1) {
			res[i][curPage - 1] = curElement;

			if (curPage == 1) break;

			curElement = C[Ckeys[i]][curPage][curElement].l

			curPage = curPage - 1;
		}
	}

	console.log(res);
	
	var finalRepresentation = {};

	for(var i=0;i<Ckeys.length;i++) {
		finalRepresentation[Ckeys[i]] = [];

		for(var j=0;j<res[i].length;j++){
			var start = j == 0 ? 0 : res[i][j-1] + 1;
			var end = res[i][j];

			finalRepresentation[Ckeys[i]].push([])

			for(var k=start;k<=end;k++) {
				finalRepresentation[Ckeys[i]][j].push(info[Ckeys[i]][k])
			}
		}
	}

	if(numSlidesChanged) {
		$(".sectionLevelCoverageInput").each(function (idx, elem) {
			var sectionKey = $(elem).attr("sectionkey");

			if (sectionKey in finalRepresentation)
				$(elem)[0].value = finalRepresentation[sectionKey].length;
			else
				$(elem)[0].value = 0;
		})

		setConstraints("slideDeck", null);
	}

	return finalRepresentation;
}

async function createSlidesOnGoogleSlide(finalRepresentation) {
	var requests = [];
	var slideInfo = [];
	var slideIndex = 1;
	var updateInfo = [];

	for(var s in finalRepresentation) {
		for (var j = 0; j < finalRepresentation[s].length; j++) {
			var h = [];

			for (var k = 0; k < finalRepresentation[s][j].length; k++) {
				var mappingKey = finalRepresentation[s][j][k].mappingKey;
				var dic = finalRepresentation[s][j][k];

				h.push(dic);
			}

			/*
			var elem = {
				slideID: makeid(10),
				objIDs: [makeid(10), makeid(10)],
				highlightInfo: h
			};

			for (var k = 0; k < finalRepresentation[s][j].length; k++) {
				updateInfo.push({
					slideID: elem.slideID,
					objID: elem.objIDs[1],
					paragraphIndex: k,
					mappingID: elem.highlightInfo[k].mappingKey
				});
			}
			*/

			// requests = requests.concat(genRequest(elem.slideID, slideIndex, "TITLE_AND_BODY", elem.objIDs, [structureHighlightDB[s].text].concat(getListOnKey(elem.highlightInfo, "text"))));

			// slideIndex++;
		}

	}
/*
	for (var sectionKey in info) {
		var keys = Object.keys(info[sectionKey]);

		// var numSlides = parseInt((keys.length % MAX_NUMBER_OF_BULLETS == 0) ? keys.length / MAX_NUMBER_OF_BULLETS : (keys.length / MAX_NUMBER_OF_BULLETS) + 1);
		var numSlides = parseInt($(".coverageTableCell.selected[sectionKey='" + sectionKey + "']").length);
		var numHighlightsPerSlide = parseInt((Object.keys(info[sectionKey]).length) / numSlides);

		var borderline = ((Object.keys(info[sectionKey]).length) % numSlides == 0 ? 0 : (Object.keys(info[sectionKey]).length) - numHighlightsPerSlide * numSlides);
		var cursor = 0;

		for (var j = 0; j < numSlides; j++) {
			var numBullets = numHighlightsPerSlide;
			var highlightInfo = [];

			if (j < borderline) numBullets++;

			for (var k = 0; k < numBullets; k++) {
				highlightInfo.push(info[sectionKey][keys[cursor]]);
				cursor++;
			}

			var elem = {
				slideID: makeid(10),
				objIDs: [makeid(10), makeid(10)],
				highlightInfo: highlightInfo
			};

			for (var k = 0; k < numBullets; k++) {
				updateInfo.push({
					slideID: elem.slideID,
					objID: elem.objIDs[1],
					paragraphIndex: k,
					mappingID: elem.highlightInfo[k].mappingKey
				});
			}

			slideInfo.push(elem);

			requests = requests.concat(genRequest(elem.slideID, slideIndex, "TITLE_AND_BODY", elem.objIDs, [structureHighlightDB[sectionKey].text].concat(getListOnKey(elem.highlightInfo, "text"))));

			slideIndex++;
		}
	}
	*/

	initializeSlide().then(async () => {
			// console.log(highlightDB.slideInfo);

		var myRequest = await getRequestForBulkGeneration(highlightDB.slideInfo, finalRepresentation)

		var slideDeckConstraints = getConstraints("slideDeck");
		var singleSlideConstraints = {};

		console.log(slideDeckConstraints);

		for (var i = 0; i < myRequest.updateInfo.length; i++) {
			singleSlideConstraints[myRequest.updateInfo[i].slideID] = {
				descAbst: slideDeckConstraints.descAbst,
				textLength: slideDeckConstraints.textLength
			}
		}

		setConstraints("singleSlide", singleSlideConstraints, "all", true)

		console.log(JSON.parse(JSON.stringify(myRequest)));

		writeSlideMappingInfoBulk(myRequest.updateInfo).then(() => {
			 gapi.client.slides.presentations.batchUpdate({
				 presentationId: PRESENTATION_ID,
				 requests: myRequest.requests
			 }).then((createSlideResponse) => {
				 //console.log(createSlideResponse);
			 });
		 });
	});
}

async function getRequestForBulkGeneration(slideInfo, finalRepresentation) {
	var updateInfo = [];
	var requests = [];

	for(var s in finalRepresentation) {
		for(var i=0;i<finalRepresentation[s].length;i++) {
			var objects = finalRepresentation[s][i];
			var slideID = makeid(10);

			await loadRecommendationByResources(objects, slideID);

			console.log(slideID);
			console.log(JSON.parse(JSON.stringify(recommendationLoadingHistory[slideID].renderResult)));

			requests.push({
				createSlide: {
					objectId: slideID,
					slideLayoutReference: {
						predefinedLayout: "BLANK" 
					},
				}
			});

			var renderInfo = renderSlideOnGoogle(recommendationLoadingHistory[slideID].renderResult[0], slideID, false);

			updateInfo = updateInfo.concat(renderInfo.updateInfo);
			requests = requests.concat(renderInfo.requests);
		}
	}

	return {
		updateInfo: updateInfo,
		requests: requests
	}
}

function getNumSlides() {
	var time = parseInt($("#slideDeck_presentationTimeInputBox")[0].value);

	return time;
}

function computeTC(info) {
	if(Object.keys(info) <= 0) {
		return {
			T: [],
			C: {}
		}
	}

	function getDist(d, start, end) {
		var keys = Object.keys(d);

		var temp_page_penalty = 2000;
		var res = 0;

		for (var i = start; i <= end; i++) {
			for (var j = i + 1; j <= end; j++) {
				if (d[keys[j]].pageNumber != d[keys[i]].pageNumber) res += temp_page_penalty;
				else res += d[keys[j]].startWordIndex - d[keys[i]].startWordIndex;
			}
		}

		return res;
	}

	var slideInfo = {};
	var heavySwitch = '';
	var mappingList = [];

	for (var m in info) {
		for (var mm in info[m]) {
			mappingList.push(info[m][mm])
		}
	}

	console.log(mappingList);

	console.log(info);

	var T = [];
	var C = {};
	var totalNumHighlight = 0;

	var maxElementsPerSlide = MAX_ELEMENTS_PER_SLIDE;

	for (var m in info) {
		C[m] = [];

		var numElements = info[m].length;

		totalNumHighlight += numElements;

		for (var i = 0; i <= numElements; i++) {
			C[m].push([]);

			for (var j = 0; j < numElements; j++) {
				C[m][i].push({
					v: 987987987,
					l: -1
				});
			}
		}

		for (var j = 0; j < Math.min(numElements, maxElementsPerSlide); j++) C[m][1][j].v = getDist(info[m], 0, j);

		for (var i = 2; i <= numElements; i++) {
			for (var j = i - 1; j < numElements; j++) {
				for (var k = j - 1; k >= i - 2; k--) {
					if (j - k > maxElementsPerSlide) break;

					var dist = getDist(info[m], k + 1, j);

					if (C[m][i][j].v > C[m][i - 1][k].v + dist) {
						C[m][i][j].v = C[m][i - 1][k].v + dist;
						C[m][i][j].l = k;
					}
				}
			}
		}
	}

	var numSections = Object.keys(info).length;
	var sectionKeys = Object.keys(info);

	for (var i = 0; i < numSections; i++) {
		T.push([]);

		for (var j = 0; j <= totalNumHighlight; j++) {
			T[i].push({
				v: 987987987,
				l: -1
			});
		}
	}

	for (var i = 0; i < info[sectionKeys[0]].length; i++) {
		var value = C[sectionKeys[0]][i + 1][info[sectionKeys[0]].length - 1].v;

		if(value >= 987987987) {
			T[0][i + 1].v = 987987987;
			T[0][i + 1].l = -1 ;
		}
		else {
			T[0][i + 1].v = C[sectionKeys[0]][i + 1][info[sectionKeys[0]].length - 1].v;
			T[0][i + 1].l = i + 1;
		}
	}

	for (var i = 1; i < numSections; i++) {
		for (var j = 1; j <= totalNumHighlight; j++) {
			var numElements = info[sectionKeys[i]].length;

			for (var k = 1; k <= numElements; k++) {
				if (j - k <= 0) continue;
				if (T[i - 1][j - k].v >= 987987987) continue;

				if (T[i][j].v > T[i - 1][j - k].v + C[sectionKeys[i]][k][numElements - 1].v) {
					T[i][j].v = T[i - 1][j - k].v + C[sectionKeys[i]][k][numElements - 1].v;
					T[i][j].l = k;
				}
			}
		}
	}

	return {
		T: T,
		C: C
	}
}

function automaticallyUpdateSlides() {
	var info = organizeHighlightOnSections();
	var numSlides = getNumSlides();
	var coverage = [];

	console.log(info);

	for(var k in info) {
		var value = $(".sectionLevelCoverageInput[sectionKey='" + k + "']")[0].value;

		coverage.push(parseInt(value));
	}

	var finalRepresentation = printLink(info, T, C, numSlides, coverage);

	if(finalRepresentation == -1) return;

	console.log(JSON.parse(JSON.stringify(finalRepresentation)));

	createSlidesOnGoogleSlide(finalRepresentation);

	/*
	for(var key in structureHighlightDB) {
		var obj = $(".sectionLevelCoverageInput[sectionKey=" + key + "]");
		var count = $(".coverageTableCell.selected[sectionKey='" + key + "']").length;

		if(count != '') 
			slideInfo[key] = chooseElements(info, key, parseInt(count)*MAX_NUMBER_OF_BULLETS);
	}
	*/

	/*

	if($("#textHeavyBtn").prop("checked")) heavySwitch = 'text';
	else heavySwitch = 'image';
	
	createSlidesBasedOnSelection(slideInfo, heavySwitch);
	*/
}

function getListOnKey(li, key) {
	var retValue = [];

	for(var i=0;i<li.length;i++) {
		retValue.push(li[i][key]);
	}

	return retValue;
}

function createTextHeavySlides(info) {
	var requests = [];
	var slideInfo = []; 
	var slideIndex = 1;
	var updateInfo = [];

	for(var sectionKey in info) {
		var keys = Object.keys(info[sectionKey]);

		// var numSlides = parseInt((keys.length % MAX_NUMBER_OF_BULLETS == 0) ? keys.length / MAX_NUMBER_OF_BULLETS : (keys.length / MAX_NUMBER_OF_BULLETS) + 1);
		var numSlides = parseInt($(".coverageTableCell.selected[sectionKey='" + sectionKey + "']").length);
		var numHighlightsPerSlide = parseInt((Object.keys(info[sectionKey]).length) / numSlides);

		var borderline = ((Object.keys(info[sectionKey]).length) % numSlides == 0 ? 0 : (Object.keys(info[sectionKey]).length) - numHighlightsPerSlide * numSlides);
		var cursor = 0;

		for(var j=0;j<numSlides;j++) {
			var numBullets = numHighlightsPerSlide;
			var highlightInfo = [];

			if(j < borderline) numBullets++;

			for(var k=0;k<numBullets;k++) {
				highlightInfo.push(info[sectionKey][keys[cursor]]);
				cursor++;
			}

			var elem = {
				slideID: makeid(10),
				objIDs: [makeid(10), makeid(10)],
				highlightInfo: highlightInfo
			};

			for(var k=0;k<numBullets;k++) {
				updateInfo.push({
					slideID: elem.slideID,
					objID: elem.objIDs[1],
					paragraphIndex: k,
					mappingID: elem.highlightInfo[k].mappingKey
				});
			}

			slideInfo.push(elem);

			requests = requests.concat(genRequest(elem.slideID, slideIndex, "TITLE_AND_BODY", elem.objIDs, [structureHighlightDB[sectionKey].text].concat(getListOnKey(elem.highlightInfo, "text"))));

			slideIndex++;
		}
	}

	writeSlideMappingInfoBulk(updateInfo).then( () => {
		initializeSlide().then( () => {
   			gapi.client.slides.presentations.batchUpdate({
   			  presentationId: PRESENTATION_ID,
   			  requests: requests
   			}).then((createSlideResponse) => {
				//console.log(createSlideResponse);
   			});
		});
	});
}

function createImageHeavySlides(info) {
	var requests = [];
	var slideInfo = []; 
	var slideIndex = 1;
	var updateInfo = [];

	for(var sectionKey in info) {
		var keys = Object.keys(info[sectionKey]);

		// var numSlides = parseInt((keys.length % MAX_NUMBER_OF_BULLETS == 0) ? keys.length / MAX_NUMBER_OF_BULLETS : (keys.length / MAX_NUMBER_OF_BULLETS) + 1);
		var numSlides = parseInt($(".coverageTableCell.selected[sectionKey='" + sectionKey + "']").length);
		var numHighlightsPerSlide = parseInt((Object.keys(info[sectionKey]).length) / numSlides);

		var borderline = ((Object.keys(info[sectionKey]).length) % numSlides == 0 ? 0 : (Object.keys(info[sectionKey]).length) - numHighlightsPerSlide * numSlides);
		var cursor = 0;

		for(var j=0;j<numSlides;j++) {
			var numBullets = numHighlightsPerSlide;
			var highlightInfo = [];

			if(j < borderline) numBullets++;

			for(var k=0;k<numBullets;k++) {
				highlightInfo.push(info[sectionKey][keys[cursor]]);
				cursor++;
			}

			var elem = {
				slideID: makeid(10),
				objIDs: [makeid(10)],
				highlightInfo: highlightInfo
			};

			for(var k=0;k<numBullets;k++) {
				var figObjID = makeid(10);

				updateInfo.push({
					slideID: elem.slideID,
					objID: figObjID,
					mappingID: elem.highlightInfo[k].mappingKey
				});

				elem.objIDs.push(figObjID);
			}

			slideInfo.push(elem);

			requests = requests.concat(genImageSlideRequest(elem.slideID, slideIndex, "TITLE_ONLY", elem.objIDs, structureHighlightDB[sectionKey].text, getListOnKey(elem.highlightInfo, "imageURL")));

			slideIndex++;
		}
	}

	console.log(requests);

	writeImageSlideMappingInfoBulk(updateInfo).then( () => {
		initializeSlide().then( () => {
   			gapi.client.slides.presentations.batchUpdate({
   			  presentationId: PRESENTATION_ID,
   			  requests: requests
   			}).then((createSlideResponse) => {
				//console.log(createSlideResponse);
   			});
		});
	});
}

function createSlidesBasedOnSelection(info, heavySwitch) {
	if(heavySwitch == 'text') createTextHeavySlides(info);
	else createImageHeavySlides(info);
}

function genImageSlideRequest(slideID, slideIndex, slideType, objIDs, sectionTitleText, imageURLs) {
	var requests = [];

	console.log(objIDs);

	requests.push({
	   createSlide: {
		objectId: slideID,
	   	insertionIndex: slideIndex,
	   	slideLayoutReference: {
	       	predefinedLayout: slideType
	   	},
		placeholderIdMappings: [{
			objectId: objIDs[0],
			layoutPlaceholder: {
				type: "TITLE",
				index: 0
			}
		}
		]
	   }
	});

	requests.push({
		insertText: {
			objectId: objIDs[0],
			text: sectionTitleText,
			insertionIndex: 0
		}
	});

	for(var i=0;i<imageURLs.length;i++) {
		requests.push({
			createImage: {
				objectId: objIDs[i+1],
				elementProperties: {
					pageObjectId: slideID,
					size: {
						width: {
							magnitude: 220,
							unit: "pt"
						},
						height: {
							magnitude: 220,
							unit: "pt"
						},
					},
					transform: {
						scaleX: 1,
						scaleY: 1,
						translateX: 20 + i * 230,
						translateY: 150,
						unit: "pt"
					}
				},
				url: imageURLs[i]
			}
		});
	}

	return requests;
}
function genRequest(slideID, slideIndex, slideType, objIDs, texts) {
	var requests = [];

	requests.push({
	   createSlide: {
		objectId: slideID,
	   	insertionIndex: slideIndex,
	   	slideLayoutReference: {
	       	predefinedLayout: slideType
	   	},
		placeholderIdMappings: [{
			objectId: objIDs[0],
			layoutPlaceholder: {
				type: "TITLE",
				index: 0
			}
		},{
			objectId: objIDs[1],
			layoutPlaceholder: {
				type: "BODY",
				index: 0
			}
		}
		]
	   }
	});
	requests.push({
		insertText: {
			objectId: objIDs[0],
			text: texts[0],
			insertionIndex: 0
		}
	});
	requests.push({
		insertText: {
			objectId: objIDs[1],
			text: texts.slice(1).join('\n'),
			insertionIndex: 0
		}
	});

	return requests;
}

function getLeafBoxes(nodeSet, height, width) {
	return getLeafBoxesInternal(nodeSet, 0, 0, 0, height, width, 0);
}

function getLeafBoxesInternal(nodeSet, curNode, curLeft, curTop, curHeight, curWidth, level) {
	var ret = [];

	if (nodeSet[curNode].splitDir == -1) {
		return [{
			curLeft: curLeft,
			curTop: curTop,
			curHeight: curHeight,
			curWidth: curWidth,
			level: level,
			type: nodeSet[curNode].type
		}]
	}
	else {
		if (nodeSet[curNode].splitDir == 1) {
			var numChild = nodeSet[curNode].childIndexes.length;

			for (var j = 0; j < numChild; j++)
				ret = ret.concat(getLeafBoxesInternal(nodeSet, nodeSet[curNode].childIndexes[j], curLeft + curWidth / numChild * j, curTop, curHeight, curWidth / numChild, level + 1));
		}
		else {
			var numChild = nodeSet[curNode].childIndexes.length;

			for (var j = 0; j < numChild; j++)
				ret = ret.concat(getLeafBoxesInternal(nodeSet, nodeSet[curNode].childIndexes[j], curLeft, curTop + curHeight / numChild * j, curHeight / numChild, curWidth, level + 1));
		}
	}

	return ret;
}

async function loadRecommendationByResources(resource, slideID) {
	var text = [];

	console.log(resource);

	for(var i=0;i<resource.length;i++) {
		var mappingID = resource[i].mappingKey;

		if (mappingID == "null") continue;

		var t = {
			text: resource[i].text,
			mappingID: mappingID
		}

		text.push(t);
	}

	recommendationLoadingHistory[slideID] = {
		loading: true,
		result: {}
	}

	for (var i = 0; i < text.length; i++) {
		text[i] = {
			type: "text",
			contents: text[i].text,
			mappingID: text[i].mappingID
		}
	}

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				resources: text,
				slideNumber: 0
			}
		),
	};

	var data = await fetch('http://server.hyungyu.com:1333/getSlides', requestOptions)
						  .then(response => response.json())

	recommendationLoadingHistory[slideID].loading = false;
	recommendationLoadingHistory[slideID].text = text;
	recommendationLoadingHistory[slideID].result = data;

	var constraints = getConstraints("slideDeck");

	recommendationRender(data, constraints, slideID, false);
}

function getResourcesInternal(r) {
	var retValue = [];

	for(var i=0;i<r.length;i++) {
		var flag = false;
		var k = r[i].mappingKey;

		for(j in highlightDB.mapping) {
			if(k in highlightDB.mapping[j]) {
				retValue.push(highlightDB.mapping[j][k].text)
				flag = true;
				break;
			}
		}
		if(!flag) retValue.push('');
	}

	return retValue;
}

function getResources(pageID) {
	if(!(pageID in highlightDB.slideInfo)) return [];

	console.log(pageID);
	console.log(docSlideStructure);

	for(var i=0;i<docSlideStructure.length;i++) {
		if(docSlideStructure[i] != null && "slide" in docSlideStructure[i] && docSlideStructure[i].slide.id == pageID) {
			var r = getResourcesInternal(docSlideStructure[i].resources);

			return r;
		}
	}

	return [];

	/*
	var curHighlight = highlightDB.slideInfo[pageID];
	var resources = [];

	var resourceDictionary = {};

	for (var obj in curHighlight) {
		for (var k in curHighlight[obj]) {
			var mappingID = curHighlight[obj][k].mappingID;

			if (mappingID == "null") continue;

			var pgNumber = mappingPageNumberIndex[mappingID];

			resourceDictionary[mappingID] = highlightDB.mapping[pgNumber][mappingID].text
		}
	}

	for (var s in resourceDictionary) {
		resources.push( {
			text: resourceDictionary[s],
			mappingID: s
		})
	}

	resources = sortMappings(resources);

	return resources;
	*/
}

function getLocation(mappingID) {
	for(var pageNumber in highlightDB.mapping) {
		if(mappingID in highlightDB.mapping[pageNumber]) {
			return parseInt(pageNumber) * 1000000 + highlightDB.mapping[pageNumber][mappingID].startWordIndex;
		}
	}

	return -1;
}

function sortMappings(resources) {
	var r = JSON.parse(JSON.stringify(resources));

	for(var i=0;i<r.length;i++) {
		r[i].location = getLocation(r[i].mappingID);
		r[i].index = i;
	}

	r.sort(function(first, second) {
		if(first.location > second.location) return 1;
		else if(first.location == second.location) return 0;
		else return -1;
	});
	
	for(var i=0;i<r.length;i++) {
		delete r[i].location;
		delete r[i].index;
	}

	return r;
}

function loadRecommendation(pageID) {
	if(pageID in recommendationLoadingHistory) {
		if(recommendationLoadingHistory[pageID].loading){
			//console.log("NOW LOADING");
		}
		else{
			//console.log(recommendationLoadingHistory[pageID]);
			var constraints = currentSingleSlideConstraints[pageID];

			recommendationRender(recommendationLoadingHistory[pageID].result, constraints, pageID, true);
		}
		return;
	}

	var resources = getResources(pageID);

	if(resources.length <= 0) return;

	recommendationLoadingHistory[pageID] = {
		loading: true,
		result: {}
	}

	for (var i = 0; i < resources.length; i++) {
		resources[i] = {
			type: "text",
			contents: resources[i].text,
			mappingID: resources[i].mappingID
		}
	}

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				resources: resources,
				slideNumber: 0
			}
		),
	};

	console.log(JSON.parse(JSON.stringify(resources)));

	fetch('http://server.hyungyu.com:1333/getSlides', requestOptions)
		.then(response => response.json())
		.then(data => {
			recommendationLoadingHistory[pageID].loading = false;
			recommendationLoadingHistory[pageID].text = resources;
			recommendationLoadingHistory[pageID].result = data;

			var constraints = currentSingleSlideConstraints[pageID];

			recommendationRender(data, constraints, pageID, true);
		});
}

function getConstraints(type) {
	if (type == "slideDeck") {
		var time = parseInt($("#slideDeck_presentationTimeInputBox")[0].value);

		var sparseDense = parseInt($("#slideDeck_sparseDenseSlider")[0].value);
		var descAbst = parseInt($("#slideDeck_slideLayoutSlider")[0].value);
		var textLength = parseInt($("#slideDeck_textLengthSlider")[0].value);
		var imageType =  $("input[name='slideDeck_imgTypeRadioName']:checked").val();
		var sectionLevelCoverage = {};

		$(".sectionLevelCoverageInput").each( function(idx, elem) {
			var sectionKey = $(elem).attr("sectionkey");
			var value = $(elem)[0].value;

			sectionLevelCoverage[sectionKey] = value;
		})

		return {
			time: time,
			sparseDense: sparseDense,
			descAbst: descAbst,
			textLength: textLength,
			imageType: imageType,
			sectionLevelCoverage: sectionLevelCoverage
		}
	}
	else if(type == "singleSlide") {
		var descAbst = parseInt($("#singleSlide_slideLayoutSlider")[0].value);
		var textLength = parseInt($("#singleSlide_textLengthSlider")[0].value);

		return {
			descAbst: descAbst,
			textLength: textLength
		}
	}
	else {
		var textLength = parseInt($("#object_textLengthSlider")[0].value);

		return {
			textLength: textLength
		}
	}
}

function checkMappingSpan(elem, cnt) {
	var mappingSet = {};

	for (var i = 0; i < elem.length; i++) {
		for (var j = 0; j < elem[i].contents.length; j++) {
			mappingSet[elem[i].contents[j].mappingID] = 1;
		}
	}

	if(Object.keys(mappingSet).length >= cnt) return true;
	else return false;

}
function recommendationRender(data, constraints, pageID, renderFlag) {
	// console.log(constraints);

	var __renderResult = [];
	console.log(data);

	var height = RENDER_SLIDE_HEIGHT;
	var width = RENDER_SLIDE_WIDTH;

	var padding = 10;

	var tmpSkeletons = [];
	var dictForLevel = [];

	var treeInfo = data.layout;

	for (var i = 0; i < treeInfo.length; i++) {
		dictForLevel = [];

		var renderResultInstance = getLeafBoxes(treeInfo[i].layoutTree, height, width);

		for (var j = 0; j < renderResultInstance.length; j++) {
			var flag = false;

			for (var k = 0; k < dictForLevel.length; k++) {
				if (dictForLevel[k][0] == renderResultInstance[j].curHeight && dictForLevel[k][1] == renderResultInstance[j].curWidth) {
					flag = true;
					break;
				}
			}

			if (!flag) dictForLevel.push([renderResultInstance[j].curHeight, renderResultInstance[j].curWidth]);
		}

		// if (dictForLevel.length > 1) continue;

		var minHeight = dictForLevel[0][0], maxHeight = dictForLevel[0][0], minWidth = dictForLevel[0][1], maxWidth = dictForLevel[0][1];

		for (var j = 0; j < dictForLevel.length; j++) {
			minHeight = Math.min(minHeight, dictForLevel[j][0]);
			maxHeight = Math.max(maxHeight, dictForLevel[j][0]);
			minWidth = Math.min(minWidth, dictForLevel[j][1]);
			maxWidth = Math.max(maxWidth, dictForLevel[j][1]);
		}

		if (maxHeight / minHeight >= 1.5 || maxWidth / minWidth >= 1.5) continue;

		var curSkeletonIndex = __renderResult.length;
		var slideIdx = 0;

		var tmp = [];
		var prefix = 0;
		var cnt = 0, cnt2 = 0;

		if(constraints == null) 
			constriants = getConstraints("slideDeck", pageID);
	
		tmp = populateSlideElements(data, prefix, curSkeletonIndex, padding, renderResultInstance, constraints);

		for (var j = 0; j < tmp.length; j++) {
			if (tmp[j].length > 0 && checkMappingSpan(tmp[j], data.contents.length)) {
				__renderResult.push({
					className: "parentDiv slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + " slideIndex_" + slideIdx + ' recSlide',
					height: height,
					width: width,
					padding: padding,
					innerBoxes: tmp[j],
				})
			}
		}
	}

	console.log(__renderResult);
	console.log(pageID);

	recommendationLoadingHistory[pageID].renderResult = __renderResult;

//	console.log(recommendationLoadingHistory[pageID].renderResult);

	finalRendering(recommendationLoadingHistory[pageID], data, constraints, renderFlag);
}

function dataClustering(contentsCnt, num) {
	var ret = [];

	for(var i=0;i<num;i++) ret.push([]);

	for(var j=0;j<contentsCnt;j++) {
		ret[j % num].push(j);
	}

	return ret;
}

function populateSlideElements(data, prefix, curSkeletonIndex, padding, renderResultInstance, constraints) {
	var tmp = [];

	var clusteredResult = dataClustering(data.contents.length, renderResultInstance.length);

	/*
	console.log(JSON.stringify(data));
	console.log(JSON.parse(JSON.stringify(data.contents)));
	console.log(data.contents[0]);
	console.log(clusteredResult);
	*/

	var descriptiveValue = constraints.descAbst;
	var maxValue = $("#singleSlide_slideLayoutSlider")[0].max;
	var ratio = descriptiveValue / maxValue;
	
	for (var k = 0; k < 4; k++) {
		tmp.push([]);

		for (var j = 0; j < renderResultInstance.length; j++) {
			var elem = renderResultInstance[j];
			var c = '';

			if(k == 0) {
				if (ratio == 0) {
					var t = [];

					for (var i = 0; i < clusteredResult[j].length; i++) {
						t.push({
							text: data.contents[clusteredResult[j][i]].contents,
							contentIndex: clusteredResult[j][i],
							mappingID: data.contents[clusteredResult[j][i]].mappingID
						})
					}

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + k,
						height: elem.curHeight - 1 * padding,
						width: elem.curWidth - 1 * padding,
						top: elem.curTop + padding,
						left: elem.curLeft + padding,
						type: "text",
						contents: t
					})
				}
			}
			else if(k == 1) {
				if (ratio > 0) {
					var t = [];

					var idx = clusteredResult[j][0]; // heuristic: just pick the first one
					var w = (elem.curWidth) * ratio;
					var h = (elem.curHeight) * ratio;
					var top = (elem.curHeight * (1 - ratio) ) / 2 + elem.curTop;
					var left = (elem.curWidth * (1 - ratio) ) / 2 + elem.curLeft;

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + k,
						height: h,
						width: w,
						top: top,
						left: left,
						type: "image",
						contents: data.imageURL.length > 0 ? {
							imgResult: getImgList(data.imageURL[idx].imgResult[0].linkList),
							contentIndex: idx,
							mappingID: data.contents[idx].mappingID
						}
							: {
								imgResult: [],
								contentIndex: idx,
								mappingID: data.contents[idx].mappingID
							}
					})
				}
			}
			else if(k == 2) {
				if (ratio > 0) {
					var t = [];
					var idx = clusteredResult[j][0]; // heuristic: just pick the first one

					for (var i = 0; i < clusteredResult[j].length; i++) {
						t.push({
							text: data.contents[clusteredResult[j][i]].contents,
							contentIndex: clusteredResult[j][i],
							mappingID: data.contents[clusteredResult[j][i]].mappingID
						})
					}

					var w1, h1, t1, l1;
					var w2, h2, t2, l2;

					if (elem.curHeight > elem.curWidth) {
						w1 = elem.curWidth;
						h1 = elem.curHeight * (1 - ratio);
						t1 = elem.curTop + elem.curHeight * ratio;
						l1 = elem.curLeft;

						w2 = elem.curWidth;
						h2 = elem.curHeight * (ratio);
						t2 = elem.curTop;
						l2 = elem.curLeft;
					}
					else {
						w1 = elem.curWidth * (1 - ratio);
						h1 = elem.curHeight;
						t1 = elem.curTop;
						l1 = elem.curLeft + elem.curWidth * (ratio);

						w2 = elem.curWidth * (ratio);
						h2 = elem.curHeight;
						t2 = elem.curTop;
						l2 = elem.curLeft;
					}

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + k,
						height: h1,
						width: w1,
						top: t1,
						left: l1,
						type: "text",
						contents: t
					})

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + "captionImage",
						height: h2,
						width: w2,
						top: t2,
						left: l2,
						type: "image",
						contents: data.imageURL.length > 0 ? {
							imgResult: getImgList(data.imageURL[idx].imgResult[0].linkList),
							contentIndex: idx,
							mappingID: data.contents[idx].mappingID
						}
							: {
								imgResult: [],
								contentIndex: idx,
								mappingID: data.contents[idx].mappingID
							}
					})
				}
			}
			else if(k == 3) {
				if (ratio > 0) {
					var idx = clusteredResult[j][0]; // heuristic: just pick the first one

					var w = (elem.curWidth) * ratio;
					var h = (elem.curHeight) * ratio;
					var top = (elem.curHeight * (1 - ratio)) / 2 + elem.curTop;
					var left = (elem.curWidth * (1 - ratio)) / 2 + elem.curLeft;

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + "captionText",
						height: 20,
						width: w,
						top: top + h - 20,
						left: left,
						type: "textCaption",
						contents: [
							{
								text: data.imageURL[idx].imgResult[0].entity,
								contentIndex: idx,
								mappingID: data.contents[idx].mappingID
							}]
					})

					tmp[k].push({
						className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j + "_" + k,
						height: h - 20,
						width: w,
						top: top,
						left: left,
						type: "image",
						contents: data.imageURL.length > 0 ? {
							imgResult: getImgList(data.imageURL[idx].imgResult[0].linkList),
							contentIndex: idx,
							mappingID: data.contents[idx].mappingID
						}
							: {
								imgResult: [],
								contentIndex: idx,
								mappingID: data.contents[idx].mappingID
							}
					})
				}
			}

			/*
			else if(k == 1) {
				tmp[k].push({
					className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j,
					height: elem.curHeight,
					width: elem.curWidth,
					top: elem.curTop + padding,
					left: elem.curLeft + padding,
					type: "image",
					contents: makeImage(data, clusteredResult[j]) // data.imageURL[j].imageResult[0].linkList[0]
				})
			}

			if (elem.type == "text") {
				c = data.contents[cnt].contents;
				cnt = cnt + 1;

				tmp[k].push({
					className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j,
					height: elem.curHeight,
					width: elem.curWidth,
					top: elem.curTop + padding,
					left: elem.curLeft + padding,
					type: "text",
					contents: c
				})
			}
			else {
				tmp[k].push({
					className: "slideObj_" + prefix + "_" + curSkeletonIndex + "_" + j,
					height: elem.curHeight,
					width: elem.curWidth,
					top: elem.curTop + padding,
					left: elem.curLeft + padding,
					type: "image",
					contents: "https://images.theconversation.com/files/93616/original/image-20150902-6700-t2axrz.jpg?ixlib=rb-1.1.0&q=30&auto=format&w=600&h=600&fit=crop&dpr=2"
				})
			}
			*/
		}
	}
	
	return tmp;
}

function renderText(t) {
	if(t.length == 1) return t[0].text;
	else {
		var ret = '';

		for(var i=0;i<t.length;i++) {
			ret = ret + '<li class="slideBullet">' + t[i].text + '</li>';
		}

		return '<ul class="slideBulletUl">' + ret + '</ul>';
	}
}

function sortSlides(constraints, slideInfo, numResources) {
	var slideList = [];

	// console.log(constraints);
	// console.log(numResources);

	var targetNumText = numResources - parseInt(numResources * constraints.descAbst / 4)
	var targetNumFigure = numResources - targetNumText;

	// console.log(slideInfo);

	for(var i=0;i<slideInfo.length;i++) {
		slideList.push({
			numObj: slideInfo[i].numObj,
			numText: slideInfo[i].numText,
			numFigure: slideInfo[i].numFigure,
			idx: i
		});

		// console.log(slideInfo[i].numObj, slideInfo[i].numText, slideInfo[i].numFigure);
	}

	for(var i=0;i<slideList.length;i++) {
		var dist = /* Math.abs(value.numObj - slideList[i].numObj) + */
				   Math.abs(targetNumText - slideList[i].numText) + 
				   Math.abs(targetNumFigure - slideList[i].numFigure);

		slideList[i].dist = dist;
	}

	slideList.sort(function(first, second) {
		if(first.dist > second.dist) return 1;
		else if(first.dist == second.dist) return 0;
		else return -1;
    });

	console.log(slideList);
	
	var result = '';

	var newSlideInfo = [];

	for(var i=0;i<slideList.length;i++) {
		newSlideInfo.push(slideInfo[slideList[i].idx]);
	}

	return newSlideInfo;
}

function finalRendering(h, data, constraints, renderFlag) {
	var r = h.renderResult;

	var result = "";
	var maxNumObj = 0, maxNumText = 0, maxNumFigure = 0;

	for (var i = 0; i < r.length; i++) {
		var numText = 0, numObj = 0, numFigure = 0;

		for (var j = 0; j < r[i].innerBoxes.length; j++) {
			var ib = r[i].innerBoxes[j];

			numText = numText + (ib.type == "text" ? 1 /*ib.contents.length*/ : 0);
			numFigure = numFigure + (ib.type == "image" ? 1 : 0);
			numObj = numObj + (ib.type == "text" ? ib.contents.length : 0) + (ib.type == "image" ? 1 : 0);

			maxNumText = Math.max(maxNumText, numText);
			maxNumFigure = Math.max(maxNumFigure, numFigure);
			maxNumObj = Math.max(maxNumObj, numObj);
		}

		r[i].numText = numText;
		r[i].numFigure = numFigure;
		r[i].numObj = numObj;
	}

	// var res = sortSlides( constraints, r, data.contents.length );

	// h.renderResult = res;
	// r = res;

	/*
	"<table>" + 
		"<tr> " + 
			"<td> # obj </td>" + 
			"<td> # text </td>" + 
			"<td> # image </td>" + 
		"</tr>" + 
		"<tr>" + 
			"<td>" + 
				'<div id="objController" class="slideSlider">' + 
					'<input type="range" min="0" max="100" value="50" class="slideSlider" id="slideObjSlider" disabled>' + 
					'<div class="slideValueDiv" id="slideObjValueDiv"> 0 </div>' + 
				'</div>' + 
			"</td>" + 
			"<td>" + 
				'<div id="textController" class="slideSlider">' + 
					'<input type="range" min="0" max="100" value="50" class="slideSlider" id="slideTextSlider">' + 
					'<div class="slideValueDiv" id="slideTextValueDiv"> 0 </div>' + 
				'</div>' + 
			"</td>" + 
			"<td>" + 
				'<div id="imageController" class="slideSlider">' +  
					'<input type="range" min="0" max="100" value="50" class="slideSlider" id="slideImageSlider">' + 
					'<div class="slideValueDiv" id="slideFigureValueDiv"> 0 </div>' + 
				'</div>' + 
			"</td>" + 
		"</tr>" + 
	"</table>";*/
				
	var slideList = [];

	for (var i = 0; i < r.length; i++) {
		var innerBody = '';
		var numText = 0, numObj = 0, numFigure = 0;

		for (var j = 0; j < r[i].innerBoxes.length; j++) {
			var ib = r[i].innerBoxes[j];

			// console.log(ib);
			// console.log(ib.contents);

			innerBody = innerBody +
				"<div style='" +
				"position: absolute; " +
				"height: " + ib.height + "px;" +
				"width: " + ib.width + "px;" +
				"top: " + ib.top + "px;" +
				"left: " + ib.left + "px;" +
				"word-wrap: break-word;" +
				"display: table;" +
				"'> " +
				"<div class='" + ib.className + "' style='" +
				"display: table-cell; " +
				"vertical-align: middle; " +
				(ib.contents.length > 1 ? "" : "text-align: center; ") +
				"border: hide;" +
				"overflow: none; " +
				"text-align: middle; " +
				"height: " + ib.height + "px; " +
				"width: " + ib.width + "px; " +
				"'> " +
				(ib.type == "text" || ib.type == "textCaption" ?
					"<div class='" + ib.className + '_body' + "'> " +
					renderText(ib.contents) +
					"</div>"
					:
					"<div class='" + ib.className + '_img' + "'> " +
					"<img class='imageInSlide' src='" + ib.contents.imgResult + "' style=' " +
					"height: " + ib.height + "px;" +
					"width: " + ib.width + "px;" +
					"' />" +
					"</div>"
				) +
				"</div>" +
				"</div>";

			numText = numText + (ib.type == "text" ? 1 /*ib.contents.length*/ : 0);
			numFigure = numFigure + (ib.type == "image" ? 1 : 0);
			numObj = numObj + (ib.type == "text" ? ib.contents.length : 0) + (ib.type == "image" ? 1 : 0);

			maxNumText = Math.max(maxNumText, numText);
			maxNumFigure = Math.max(maxNumFigure, numFigure);
			maxNumObj = Math.max(maxNumObj, numObj);
		}

		slideList.push({
			html:
				'<div class="' + r[i].className + '" style="' +
				"display: inline-block; " +
				"white-space: normal; " +
				"padding: " + r[i].padding + "px; " +
				"height: " + r[i].height + "px; " +
				"width: " + r[i].width + "px; " +
				"border: 1px solid black;" +
				"position: relative;" +
				"margin: 10px;" +
				"box-sizing: border-box;" +
				'"' + " numText='" + numText + "'" + 
				" numFigure='" + numFigure + "'" + 
				" numObj='" + numObj + "'" +  
				">" +
				innerBody +
				"<div class='slideStat'>" + 
				numObj + '\t' + numText + '\t' + numFigure + 
				"</div>" + 
				"</div>",
		})
	}

	if (renderFlag) {
		result = result + "<div id='recommendedSlideList'>";

		for (var i = 0; i < slideList.length; i++) result = result + slideList[i].html;

		result = result + "</div>";

		$("#SlideRecommendation").html(result);
	}
/*
	$("#slideObjSlider")[0].max = maxNumObj;
	$("#slideTextSlider")[0].max = maxNumText;
	$("#slideImageSlider")[0].max = maxNumFigure;

	$("#slideObjSlider")[0].value = 0; 
	$("#slideTextSlider")[0].value = 0;
	$("#slideImageSlider")[0].value = 0;
	*/

	for (var i = 0; i < r.length; i++) {
		var innerBody = '';
		var objList = document.getElementsByClassName(r[i].className.split(' ')[1]);

	/*	$("#noteSpaceExperiment").html(
			$("." + r[i].className.split(' ')[1]).html()
		);*/

		for (var j = 0; j < r[i].innerBoxes.length; j++) {
			var textResult = [];

			if (r[i].innerBoxes[j].type != "text") continue;

			var objID = r[i].innerBoxes[j].className;

			for (var l = 0; l < r[i].innerBoxes[j].contents.length; l++) {
				var contentIndex = r[i].innerBoxes[j].contents[l].contentIndex;
				var text_to_render = '';

				for(var k=0;k<data.textShortening[contentIndex].result.result.length;k++) {
					var text = data.textShortening[contentIndex].result.result[k].text;

					if(text.length < constraints.textLength) {
						text_to_render = text;
						break;
					}
				}

				textResult.push({text: text_to_render});
				r[i].innerBoxes[j].contents[l].text = text_to_render;

				/*
				var shorten_result = data.textShortening[r[i].innerBoxes[j].contents[l].contentIndex];
				var objID = r[i].innerBoxes[j].className;

				var objs = document.getElementsByClassName(objID + "_body");

				var thisObj = objs[0];

				thisObj.innerHTML = 'a';

				var parentHeight = thisObj.parentElement.offsetHeight;
				var minHeightValue = 987987987, minText = '';

				for (var k = 0; k < shorten_result.result.result.length; k++) {
					thisObj.innerHTML = shorten_result.result.result[k].text;

					for (var k = 0; k < shorten_result.result.result.length; k++) {
						thisObj.innerHTML =
							r[i].innerBoxes[j].contents.length > 1 ?
								"<ul class='slideBulletUl'> <li class='slideBullet'>" + shorten_result.result.result[k].text + "</li> </ul>"
								:
								shorten_result.result.result[k].text;

						var heightValue = Math.abs(thisObj.offsetHeight / parentHeight * 100 -
							(40 / r[i].innerBoxes[j].contents.length));

						if (heightValue < minHeightValue) {
							minHeightValue = heightValue;
							minText = shorten_result.result.result[k].text;
						}
					}

					textResult.push({ text: minText });
					// document.getElementsByClassName(objID + "_body")[1].innerHTML = minText;
				}

				for(var k=0;k<textResult.length;k++) 
					r[i].innerBoxes[j].contents[k].text = textResult[k].text;
				*/ 

			}

			if(renderFlag)
				document.getElementsByClassName(objID + "_body")[0].innerHTML = renderText(textResult);
		}
	}
}

function setConstraints(name, value, slideID, writeFlag) {
	if (value == null) {
		if (name == "slideDeck") {
			currentSlideDeckConstraints = getConstraints("slideDeck");
		}
		else if (name == "singleSlide") {
			currentSingleSlideConstraints[slideID] = getConstraints("singleSlide", slideID);
		}
	}
	else {
		if(name == "slideDeck") currentSlideDeckConstraints = value;
		else if(name == "singleSlide") {
			if(slideID == "all") currentSingleSlideConstraints = value;
			else {
				if(value == "deck") currentSingleSlideConstraints[slideID] = {
					descAbst: currentSlideDeckConstraints.descAbst,
					textLength: currentSlideDeckConstraints.textLength
				}
				else currentSingleSlideConstraints[slideID] = value;
			}
		}
	}

	if(name == "slideDeck") displayConstraints("slideDeck");
	else if(name == 'singleSlide') {
		if(slideID != "all")
			displayConstraints("singleSlide", slideID);
	}

	if (writeFlag) {
		var updates = {};

		if (name == "slideDeck") {
			updates['/users/' + userName + '/slideDeckConstraints/'] = currentSlideDeckConstraints;
		}
		else if (name == "singleSlide") {
			if(slideID == "all") {
				updates['/users/' + userName + '/singleSlideConstraints/'] = currentSingleSlideConstraints;
			}
			else {
				updates['/users/' + userName + '/singleSlideConstraints/' + slideID + '/'] = currentSingleSlideConstraints[slideID]

			}
		}
		firebase.database().ref().update(updates);
	}
}

function displayConstraints(name, slideID) {
	if(name == "slideDeck") {
		$("#slideDeck_presentationTimeInputBox")[0].value = currentSlideDeckConstraints.time;
		$("#slideDeck_sparseDenseSlider")[0].value = currentSlideDeckConstraints.sparseDense;
		$("#slideDeck_slideLayoutSlider")[0].value = currentSlideDeckConstraints.descAbst;
		$("#slideDeck_textLengthSlider")[0].value = currentSlideDeckConstraints.textLength;

		// var imageType =  $("input[name='slideDeck_imgTypeRadioName']:checked").val();
		var sectionLevelCoverage = {};

		$(".sectionLevelCoverageInput").each( function(idx, elem) {
			var sectionKey = $(elem).attr("sectionkey");
			var value = $(elem)[0].value;

			$(elem).text(currentSlideDeckConstraints.sectionLevelCoverage[sectionKey]);
		})

		$("#slideDeckLevelConstraints").show();
	}
	else if(name == "singleSlide") {
		if(slideID in currentSingleSlideConstraints) {
			$("#singleSlide_slideLayoutSlider")[0].value = currentSingleSlideConstraints[slideID].descAbst;
			$("#singleSlide_textLengthSlider")[0].value = currentSingleSlideConstraints[slideID].textLength;
		}
		// Image
	}
	else {

	}
}

function getSlideBody(presentationID, slideInfo) {
	console.log(slideInfo);

	return "<div class='slideDeckItem'>" + 
				"<div class='slideImageDiv' slideIndex='0' presentationId='" + presentationID + "'> " + 
					"<img class='slideDeckThumbnailImage' src='" + slideInfo[0].thumbnailURL + "'> </img>" + 
					"<button class='slideImageLeftBtn'> L </button>" + 
					"<button class='slideImageRightBtn'> R </button>" + 
				"</div>" + 
				"<div class='slideImageDivBottom'> " + 
					"<span class='curSlideNumber'> 1 </span>" + "/" +
					"<span class='totalSlideNumber'> " + slideInfo.length + "</span>" + 
				"</div>" + 
			"</div>"
}

function initializeSlideDeck() {
	readData('/referenceSlides').then(result => {
		console.log(result);

		for(var s in result) {
			slideDeckInfo[s] = result[s].slides;

			$("#slideDeckListDiv").append(getSlideBody(s, result[s].slides));
		}
	});
}

function makeSlideTransition(presentationID, curSlideIndex, dir) {
	var slideObj = $(".slideImageDiv[presentationId='" + presentationID + "']")[0];
	var numSlides = slideDeckInfo[presentationID].length;

	if(0 <= curSlideIndex + dir && curSlideIndex + dir < numSlides) {
		$($(slideObj).find("img")[0]).attr("src", slideDeckInfo[presentationID][curSlideIndex+dir].thumbnailURL)

		$(slideObj).attr("slideIndex", curSlideIndex+dir);
		$($($($(slideObj).parent()).find(".slideImageDivBottom")[0]).find(".curSlideNumber")[0]).html((curSlideIndex + dir + 1) + " ");
	}
}

function getSlideThumbnail(slide) {
	return "<div class='slideThumbnailDiv'>" + 
				"<img class='slideThumbnailImage' src='" + slide.thumbnailURL + "'> </img>" +
			"</div>"
}

function slideDeckAdaptationDivAppear(presentationID) {
	if (presentationID in slideDeckInfo) {
		$("#slideDeckCompareDivOriginalSlidesList").html('');

		var bodyHTML = '';

		for(var i=0;i<slideDeckInfo[presentationID].length;i++) {
			bodyHTML = bodyHTML + getSlideThumbnail(slideDeckInfo[presentationID][i]);
		}

		$("#slideDeckCompareDivOriginalSlidesList").html(bodyHTML);
		$("#slideDeckCompareDiv").show();
	}
}

function showIndividualSlidesOfAll() {
	var slideListDivHTML = '';

	for (var presentationID in slideDeckInfo) {
		for (var i = 0; i < slideDeckInfo[presentationID].length; i++) {
			slideListDivHTML = slideListDivHTML +
				"<div class='slideItem'>" +
				"<img class='slideItemThumbnail' src='" + slideDeckInfo[presentationID][i].thumbnailURL + "'> </img>" +
				"</div>";
		}
	}

	$("#slideListDiv").html(slideListDivHTML);
}

function showIndividualSlides(presentationID) {
	var slideListDivHTML = '';

	for(var i=0;i<slideDeckInfo[presentationID].length;i++) {
		slideListDivHTML = slideListDivHTML + 
							"<div class='slideItem'>" + 
								"<img class='slideItemThumbnail' src='" + slideDeckInfo[presentationID][i].thumbnailURL + "'> </img>" + 
							"</div>";
	}

	$("#slideListDiv").html(slideListDivHTML);
}

function showTextShorteningView(slideIndex, resourceIndex) {
	var originalText = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;
	var currentText = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents;

	$("#textShorteningViewOriginalText").html(originalText)
	$("#textShorteningViewCurrentText").html(currentText)
	$("#textShorteningView").show();
}

function closeTextShorteningView() {
	$("#textShorteningView").hide();
}

function showLoadingAdaptationRow(slideIndex, resourceIndex) {
	var rowObj = $(".adaptationTableRow[slideindex='" + slideIndex + "'][resourceindex='" + resourceIndex + "']");

	$(rowObj).addClass("onLoading");
}

function getObj(key) {

}

function handleChangeImage(slideIndex, resourceIndex) {
	var queryString = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

	console.log(queryString);

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				text: queryString,
			}
		),
	};

	fetch('http://localhost:8010/proxy/findQueriess', requestOptions)
		.then(response => response.json())
		.then(data => function(s, r, d) {
			var rowObj = $(".adaptationTableRow[slideindex='" + s + "'][resourceindex='" + r + "']")

			console.log(rowObj);

			substituteTextToFigure(s, r, d).then(res => {
			//	removeSingleRowOnDocSlideStructure(s, r);

				$(rowObj).removeClass("onLoading");
			})
		}(slideIndex, resourceIndex, data)

		);

}

function removeSingleRowOnDocSlideStructure(s, r) {
	var updates = {};

	docSlideStructure[s].resources.splice(r, 1);

	updates['/users/' + userName + '/docSlideStructure/' + s + '/resources/'] = docSlideStructure[s].resources;

	firebase.database().ref().update(updates);

	$(".adaptationTableRow[slideindex='" + s + "'][resourceindex='" + r + "']").remove();

	for(var rr=r;rr<100;rr++) {
		if($(".adaptationTableRow[slideindex='" + s + "'][resourceindex='" + rr + "']").length > 0) 
			$(".adaptationTableRow[slideindex='" + s + "'][resourceindex='" + rr + "']").attr("resourceindex", rr-1);

		else
			break;
	}

	var v = getDocSlideStructureView(s);

	$(".adaptationViewDiv[index='" + s + "']")[0].outerHTML = v;
}

async function handleChangeText(slideIndex, resourceIndex, deletionFlag) {
	var slideID = docSlideStructure[slideIndex].slide.id;
	var objectID = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID;
	var mappingKey = docSlideStructure[slideIndex].resources[resourceIndex].mappingKey;

	console.log(slideID, objectID);
	console.log(resourceIndex);
	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].resources)));

	if((resourceIndex > 0 && docSlideStructure[slideIndex].resources[resourceIndex-1].currentContent.type == "text") || 
	   (resourceIndex < (docSlideStructure[slideIndex].resources.length-1) && docSlideStructure[slideIndex].resources[resourceIndex+1].currentContent.type == "text")) {
		   var objToPut = -1;

		if(resourceIndex > 0 && docSlideStructure[slideIndex].resources[resourceIndex-1].currentContent.type == "text")  {
			// append to the back
			objToPut = docSlideStructure[slideIndex].resources[resourceIndex - 1].currentContent.objID;

			var requests = [];
			var updates = {};

			if (deletionFlag) {
				var curObjID = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID;

				requests.push({
					"deleteObject": {
						"objectId": curObjID,
					},
				});

				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objectID + '/'] = null;
				delete slideDB[slideID][objectID]
			}

			var ret = await getAppendTextRequest(slideID, objToPut,
				docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents);

			requests = requests.concat(ret.request);

			var paragraphIndex = ret.paragraphIndex + 1;

			console.log(paragraphIndex);
			if (!(objToPut in slideDB[slideID])) slideDB[slideID][objToPut] = [];

			for (var i = 0; i <= paragraphIndex; i++) {
				if (slideDB[slideID][objToPut].length <= i) {
					slideDB[slideID][objToPut].push({
						mappingID: "null"
					})
					updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut + '/' + i] = {
						mappingID: "null"
					};
				}
			}

			slideDB[slideID][objToPut][paragraphIndex] = {
				mappingID: mappingKey
			};

			updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut + '/' + paragraphIndex] = {
				mappingID: mappingKey
			};

			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID = objToPut;
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.type = "text";
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

			updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].resources[resourceIndex].currentContent;

			firebase.database().ref().update(updates);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});
		}
		else  {
			// append to the front
			objToPut = docSlideStructure[slideIndex].resources[resourceIndex+1].currentContent.objID;

			var requests = [];
			var updates = {};

			if (deletionFlag) {
				var curObjID = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID;

				requests.push({
					"deleteObject": {
						"objectId": curObjID,
					},
				});

				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objectID + '/'] = null;
				delete slideDB[slideID][objectID]
			}

			requests.push({
				"insertText": {
					objectId: objToPut,
					text: docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents + '\n',
					insertionIndex: 0
				}
			});

			if (!(objToPut in slideDB[slideID])) slideDB[slideID][objToPut] = [];

			slideDB[slideID][objToPut].push(null); // temporary

			console.log(JSON.parse(JSON.stringify(slideDB[slideID][objToPut])))

			for(var i=slideDB[slideID][objToPut].length-2;i>=0;i--) {
				slideDB[slideID][objToPut][i+1] = slideDB[slideID][objToPut][i];
			}

			slideDB[slideID][objToPut][0] = {
				mappingID: mappingKey
			};

			updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut] = slideDB[slideID][objToPut];

			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID = objToPut;
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.type = "text";
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

			updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].resources[resourceIndex].currentContent;

			firebase.database().ref().update(updates);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});
		}
   }
	else  {
		// create a new textbox or start from a new existing box
		var updates = {};

		if(slideID in slideDB) {
			var curObjID = -1, newObjID = makeid(10);

			if(objectID in slideDB[slideID]) {
				curObjID = objectID;
			}
			else console.log("*** DOES NOT MAKE SENSE ***")

			var flag = false;

			for(var k in slideDB[slideID]) {
				if(slideDB[slideID][k][0].mappingID == "null") {
					// found an empty text box
					newObjID = k;
					flag = true;
				}
			}

			console.log(curObjID, newObjID);

			var requests = [];

			if (deletionFlag) {
				requests.push({
					"deleteObject": {
						"objectId": curObjID,
					},
				});

				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objectID + '/'] = null;
				delete slideDB[slideID][objectID]
			}

			if (flag) { // put to existing blank text
				var ret = await getAppendTextRequest(slideID, newObjID,
					docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents);

				requests = requests.concat(ret.request);
				paragraphIndex = ret.paragraphIndex + 1;

				if (!(newObjID in slideDB[slideID])) slideDB[slideID][newObjID] = [];

				for (var i = 0; i <= paragraphIndex; i++) {
					if (slideDB[slideID][newObjID].length <= i) {
						slideDB[slideID][newObjID].push({
							mappingID: "null"
						})
						updates['/users/' + userName + '/slideInfo/' + slideID + '/' + newObjID + '/' + i] = {
							mappingID: "null"
						};
					}
				}

				slideDB[slideID][newObjID][paragraphIndex] = {
					mappingID: mappingKey
				};
				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + newObjID + '/' + paragraphIndex] = {
					mappingID: mappingKey
				};

				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID = newObjID;
				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.type = "text";
				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

				updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].resources[resourceIndex].currentContent;
			}
			else {
				requests.push({
					"createShape": {
						objectId: newObjID,
						elementProperties: {
							pageObjectId: slideID,
							size: {
								width: {
									magnitude: 300,
									unit: "pt"
								},
								height: {
									magnitude: 100,
									unit: "pt"
								},
							},
						},
						shapeType: "TEXT_BOX"
					}
				});

				requests.push({
					"insertText": {
						objectId: newObjID,
						text: docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents,
						insertionIndex: 0
					}
				});

				slideDB[slideID][newObjID] = [];
				slideDB[slideID][newObjID].push({
					mappingID: mappingKey
				});

				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + newObjID + '/' + 0] = {
					mappingID: mappingKey
				};

				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID = newObjID;
				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.type = "text";
				docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

				updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].resources[resourceIndex].currentContent;
			}

			firebase.database().ref().update(updates);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});
		}
		else console.log("*** DOES NOT MAKE SENSE ***")
	}
}

function getVisualHighlightForImage(slideIndex, resourceIndex) {
	var indexes = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.index;
	var originalText = docSlideStructure[slideIndex].resources[resourceIndex].originalContent.contents;

	for(var i=indexes.length-1;i>=0;i--) {
		var p = indexes[i];

		originalText = originalText.substr(0, p[1]) + "</span>" + originalText.substr(p[1])
		originalText = originalText.substr(0, p[0]) + "<span class='imageViewQueryHighlight'>" + originalText.substr(p[0])
	}

	return originalText;
}

function getQueryKeywordsForImage(slideIndex, resourceIndex) {
	var keywords = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.keywords;
	var retValue = '';

	for(var i=0;i<keywords.length;i++) {
		retValue = retValue + '<span index="' + i + '" class="imageViewQueryKeywordItem ' + (keywords[i].selected ? "keywordSelected" : "") + '">' + keywords[i].keyword + '</span>';
	}

	return retValue;
}

function getSearchResult(slideIndex, resourceIndex) {
	var keywords = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.keywords;
	var queryStatement = '';
	var firstFlag = true;

	for(var i=0;i<keywords.length;i++) {
		if(keywords[i].selected) {
			var k = keywords[i].keyword;

			queryStatement = queryStatement + (firstFlag ? '' : ' ') + k;

			firstFlag = false;
		}
	}

	$("#imageViewResultDiv").addClass("onImageLoading");
 	$("#imageViewResultDiv").html("on loading...");

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				type: "all",
				query: queryStatement
			}
		),
	};

	fetch('http://localhost:8010/proxy/getImages', requestOptions)
		.then(response => response.json())
		.then(data => {
			console.log(data);

			var htmlString = '';

			for (var i = 0; i < data.length; i++) {
				htmlString = htmlString + "<img class='imageResultItem' src='" + data[i].url + "'> </img>"
			}

			$("#imageViewResultDiv").html(htmlString);
		});
}

function showImageSelectionView(slideIndex, resourceIndex) {
	$("#imageView").attr("slideindex", slideIndex);
	$("#imageView").attr("resourceindex", resourceIndex);

	$("#imageViewOriginalSentence").html('');
	$("#imageViewQueryKeywordDiv").html("");
	
	var q = getVisualHighlightForImage(slideIndex, resourceIndex);
	$("#imageViewOriginalSentence").html(q);

	var k = getQueryKeywordsForImage(slideIndex, resourceIndex);
	$("#imageViewQueryKeywordDiv").html(k);

	getSearchResult(slideIndex, resourceIndex);

	$("#imageView").show();
}

function closeImageSelectionView() {
	$("#imageView").hide();
}

$(document).ready(function() {
	$(document).on("click", ".imageResultItem", function(e) {
		var slideIndex = $("#imageView").attr("slideindex");
		var resourceIndex = $("#imageView").attr("resourceindex");
		var imgSrc = $(e.target).attr("src");

		var objID = docSlideStructure[slideIndex].resources[resourceIndex].currentContent.objID;

		requests = [{
			replaceImage: {
				"imageObjectId": objID,
				"imageReplaceMethod": "CENTER_INSIDE",
				"url": imgSrc
			}
		}]

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: requests
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});

		console.log(slideIndex, resourceIndex, imgSrc);
	})

	$(document).on("click", ".imageViewQueryKeywordItem", function(e) {
		var slideIndex = parseInt($("#imageView").attr("slideindex"));
		var resourceIndex = parseInt($("#imageView").attr("resourceindex"));
		var keywordIndex = parseInt($(e.target).attr("index"));

		console.log(slideIndex, resourceIndex, keywordIndex);

		var target = e.target;

		if($(target).hasClass("keywordSelected")) {
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.keywords[keywordIndex].selected = false;
			$(target).removeClass("keywordSelected");
		}
		else {
			docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.keywords[keywordIndex].selected = true;
			$(target).addClass("keywordSelected");
		}
	});

	$(document).on("click", "#imageViewQuerySubmitBtn", function(e) {
		var slideIndex = parseInt($("#imageView").attr("slideindex"));
		var resourceIndex = parseInt($("#imageView").attr("resourceindex"));

		firebase.database().ref("/users/" + userName + '/docSlideStructure/' + slideIndex + "/resources/" + resourceIndex + "/currentContent/contents/keywords/").set(docSlideStructure[slideIndex].resources[resourceIndex].currentContent.contents.keywords);

		getSearchResult(slideIndex, resourceIndex);
	})

	$(document).on("click", "#imageViewCloseBtn", function(e) {
		closeImageSelectionView();
	})

	$(document).on("change", ".adaptationTableTypeSelector", function(e) {
		console.log(e.target);

		var parent = $(e.target).parent().parent();

		var slideIndex = $(parent).attr("slideIndex");
		var resourceIndex = parseInt($(parent).attr("resourceIndex"));
		var selectedIndex = $(e.target)[0].selectedIndex; // 0: text, 1: image

		// showLoadingAdaptationRow(slideIndex, resourceIndex);
		showLoadingSlidePlane();

		if(selectedIndex == 0) { // changed to text
			handleChangeText(slideIndex, resourceIndex, true);
		}
		else { // changed to image
			handleChangeImage(slideIndex, resourceIndex);
		}
	})

	$(document).on("click", ".adaptationTableResourceBody", function(e) {
		console.log(e.target);

		var curRowObj = $(e.target);

		for(var i=0;i<100;i++) {
			if($(curRowObj).hasClass("adaptationTableRow")) break;

			curRowObj = $(curRowObj).parent();
		}

		console.log(curRowObj);

		var slideIndex = parseInt($(curRowObj).attr("slideIndex"));
		var resourceIndex = parseInt($(curRowObj).attr("resourceIndex"));

		console.log(docSlideStructure[slideIndex].resources[resourceIndex])

		if(docSlideStructure[slideIndex].resources[resourceIndex].currentContent.type == "text") {
			console.log("TEXT");

			showTextShorteningView(slideIndex, resourceIndex);
		}
		else {
			console.log("IMAGE");

			showImageSelectionView(slideIndex, resourceIndex);
		}
	})

	$(document).on("click", "#textShorteningViewCloseBtn", function(e) {
		closeTextShorteningView();
	});

	$(document).on("click", "#adaptationViewHideBtn", function(e) {
		adaptivePlaneStatus = 1;

		$("#slideIframe").css("height", "calc(100% - 30px)")
	});

	$(document).on("click", "#adaptationViewEnlargeBtn", function(e) {
		var px = $("#adaptationView").height();

		$(".adaptationViewDiv").height(px);

		if(adaptivePlaneStatus == 0){
			$("#slidePlaneCanvas").hide();

			$("#slideIframe").css("height", "0");
			showDocSlideView(-1); // show all

			adaptivePlaneStatus = 2;
		}
		else {
			$("#slidePlaneCanvas").show();
			$("#slideIframe").css("height", "70%");

			$(".adaptationViewDiv").css("height", "100%");

			var idx = parseInt($(".adaptationViewDiv[slideID='" + curSlidePage + "']").attr("index"));

			showDocSlideView(idx);

			adaptivePlaneStatus = 0;
		}
	});

	$(document).on("click", ".slideRepresentationSlider", function(e) {
		console.log("hello");

		var checkboxObj = $($(".slideRepresentationSlider").parent()).find("input");
		var flag = $(checkboxObj).prop("checked");

		if(flag) { // slide Deck
			$("#slideListDiv").hide();
			$("#slideDeckListDiv").show();
		}
		else {
			$("#slideDeckListDiv").hide();
			$("#slideListDiv").show();
		}
	});

	$(document).on("click", "#slideDeckCompareApplyBtn", function(e) {
		var slideDeckObj = $(".checkedSlideDeck");

		$(".selectedSlideDeck").removeClass("selectedSlideDeck");
		$(".checkedSlideDeck").removeClass("checkedSlideDeck");

		var presentationID = $($(slideDeckObj).find(".slideImageDiv")).attr("presentationid");

		console.log(presentationID);

		$(slideDeckObj).addClass("selectedSlideDeck");

		showIndividualSlides(presentationID);

		$("#slideDeckCompareDiv").hide();
	})

	$(document).on("click", "#slideDeckCompareCancelBtn", function(e) {
		$("#slideDeckCompareDiv").hide();
	})

	$(document).on("click", "#slideDeckCompareDivTopBarCloseBtn", function(e) {
		$("#slideDeckCompareDiv").hide();
	})

	$(document).on("click", ".slideImageLeftBtn", function(e) {
		var slideObj = $(e.target).parents();
		
		var curSlideIndex = parseInt($(slideObj).attr("slideIndex"));
		var presentationID = $(slideObj).attr("presentationId");

		makeSlideTransition(presentationID, curSlideIndex, -1);
	});

	$(document).on("click", ".slideImageRightBtn", function(e) {
		var slideObj = $(e.target).parent();

		var curSlideIndex = parseInt($(slideObj).attr("slideIndex"));
		var presentationID = $(slideObj).attr("presentationId");

		makeSlideTransition(presentationID, curSlideIndex, 1);
	});

	$(document).on("click", ".slideDeckThumbnailImage", function(e) {
		console.log(e.target);

		var slideDeckObj = $($(e.target).parent()).parent();
		var presentationID = $($(e.target).parent()).attr("presentationID");

		$(".selectedSlideDeck").removeClass("checkedSlideDeck");
		slideDeckObj.addClass("checkedSlideDeck");

		slideDeckAdaptationDivAppear(presentationID);
	});

	$(document).on("mouseenter", ".slideImageDiv", function(e) {
		var cur = e.target;

		for(var i=0;i<100;i++) {
			if($(cur).hasClass("slideImageDiv")) break;

			cur = $(cur).parent();
		}

		$($(cur).find(".slideImageLeftBtn")[0]).show();
		$($(cur).find(".slideImageRightBtn")[0]).show();
	});

	$(document).on("mouseleave", ".slideImageDiv", function(e) {
		$(".slideImageLeftBtn").hide();
		$(".slideImageRightBtn").hide();
	});

	$( function() {
		$( "#sourceTabs" ).tabs();

		initializeSlideDeck();
	  } );

        // $("#slideIframe").attr("src", "https://docs.google.com/presentation/d/1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY/edit");

/*
		$(document).on("input", ".slideSlider", function(e) {
			console.log("YAY");

			var numObj = $("#slideObjSlider")[0].value;
			var numText = $("#slideTextSlider")[0].value;
			var numFigure = $("#slideImageSlider")[0].value;

			$("#slideObjValueDiv").html(numObj);
			$("#slideTextValueDiv").html(numText);
			$("#slideFigureValueDiv").html(numFigure);

			sortSlides({
				numObj: numObj,
				numText: numText,
				numFigure: numFigure
			});
		})
		*/

		function enableBtn(name) {
			$(".levelBtn").removeClass("btnSelected");

			if(name == "slideDeck")
				$("#entireSlideDeckBtn").addClass("btnSelected");
			else if(name == "singleSlide")
				$("#singleSlideBtn").addClass("btnSelected");
			else
				$("#objectBtn").addClass("btnSelected");
		}

		$(document).on("click", ".levelBtn", function(e) {
			var obj = $(e.target);

			$(".levelBtn").removeClass("btnSelected");

			$(obj).addClass("btnSelected");

			if($(obj)[0].id == 'singleSlideBtn') {
				displayConstraints("singleSlide", curSlidePage);
			}

			appearConstraints($(obj)[0].id);
		});

		function appearConstraints(name) {
			$(".presentationObjectiveBody").hide();
			$("#constraints_emptyScreen").hide();
			$("#constraints_noHighlightFound").hide();

			if(name == "entireSlideDeckBtn" || name == "slideDeck") {
				var info = organizeHighlightOnSections();

				if(Object.keys(info) <= 0) {
					$("#constraints_emptyScreen").show();
				}
				else {
					$("#slideDeckLevelConstraints").show();
					enableBtn("slideDeck");
				}
			}
			else if(name == "singleSlideBtn" || name == "singleSlide") {
				if (curSlidePage in currentSingleSlideConstraints) {
					$("#singleSlideLevelConstraints").show();
					enableBtn("singleSlide");
				}
				else {
					$("#constraints_noHighlightFound").show();
				}
			}
			else {
				$("#objectLevelConstraints").show();
				enableBtn("object");
			}
		}

		$(document).on("click", ".recSlide", function(e) {
			var t = e.target;
			
			while(1) {
				if(t == null) break;

				if($(t).hasClass("recSlide")) break;

				t = $(t).parent();
			}

			var slideInfo = getSlideInfoOnRecommendation($(t)[0].className, recommendationLoadingHistory[curSlidePage].renderResult );

			if(slideInfo != -1) {
				setConstraints("singleSlide", getConstraints("singleSlide"), curSlidePage, true);
				renderSlideOnGoogle(slideInfo, curSlidePage, true);
			}
		});

		$(document).on("click", ".tablinks", function(event) {
			var cityName = $(this).html();

			// Declare all variables
			var i, tabcontent, tablinks;

			// Get all elements with class="tabcontent" and hide them
			tabcontent = document.getElementsByClassName("tabcontent");
			for (i = 0; i < tabcontent.length; i++) {
				tabcontent[i].style.display = "none";
			}

			// Get all elements with class="tablinks" and remove the class "active"
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}

			// Show the current tab, and add an "active" class to the button that opened the tab
			document.getElementById(cityName.replace(' ', '')).style.display = "block";
			event.currentTarget.className += " active";
		});

		appendDocumentStructureRow();

		initializeGAPI(initializeDB);

		window.scrollTo(0, 0);

		$(document).on("input", "#resourceBoxShortTextSlider", function(e) {
				var curValue = $(e.target).val();
				var curText = $("#resourceBoxShortTextSlider").attr("text" + curValue);

				$("#resourceBoxShortTextBox").attr("value", curText);
		});

		$(document).on("click", "#textHeavyBtn", function(e) {
			firebase.database().ref("/users/" + userName + '/parameters/heavy').set("text");
		});

		$(document).on("click", "#imageHeavyBtn", function(e) {
			firebase.database().ref("/users/" + userName + '/parameters/heavy').set("image");
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

		$(document).on("extension_mouseup", function(e) {
			var p = e.detail;

			if(p.clickedElement > 0){
				clickedElements = true;
				appearConstraints("object");
			} 
			else {
				if(clickedElements) {
					appearConstraints("singleSlide");
					displayConstraints("singleSlide", curSlidePage);
				}

				else if(p.clickedSlide > 0) {
					appearConstraints("singleSlide");
					displayConstraints("singleSlide", curSlidePage);
				}

				clickedElements = false;
			}
		});
/*
		$(document).on("extension_objClicked", function(e) {
			clickedElements = true;

			appearConstraints("object");
		});

		$(document).on("extension_objNotClicked", function(e) {
			if(clickedElements) appearConstraints("singleSlide");

			clickedElements = false;
		});
		*/

	$(document).on("extension_hideLoading", function (e) {
		hideLoadingSlidePlane();
	})

		$(document).on("extension_pageUpdated", function(e) {
			if (adaptivePlaneStatus != 2) {
				console.log(docSlideStructure);

				var tempCnt = 1;
				var p = e.detail;

				console.log(p);

				curSlideObjects = p;

				var pageID = p.pageID;

				curSlidePage = p.pageID;

				var idx = parseInt($(".adaptationViewDiv[slideID='" + pageID + "']").attr("index"));

				showDocSlideView(idx);

				visualizeSlideObjects();
				hideLoadingSlidePlane();

			}
			return;
/*
			var resourceDictionary = {};

			for(var obj in curHighlight) {
				for(var k in curHighlight[obj]) {
					var mappingID = curHighlight[obj][k].mappingID;

					if(mappingID == "null") continue;

					var pgNumber = mappingPageNumberIndex[mappingID];

					resourceDictionary[mappingID] = highlightDB.mapping[pgNumber][mappingID].text
				}
			}
			*/

			for(var i=0;i<resources.length;i++) {
				$("#resourceTable").append(
					'<tr>' +
					'<td> <input type="checkbox" id="checkbox_' + resources[i].mappingID + '"> </td>' +
					'<td> <div class="resourceItem" mappingID="' + resources[i].mappingID + '"> ' +
					resources[i].text +
					'</div> </td>' +
					'</tr>'
				);
			}

			/* Loading recommendations */

			if (pageID in highlightDB.slideInfo) {
				if (curSlidePage != p.pageID) {
					// $("#SlideRecommendation").html("Loading ...");
					// loadRecommendation(pageID);
				}

				for (var i = 0; i < p.objects.length; i++) {
					var objID = p.objects[i].objectID.substr(7);

					if (slideDB == null) slideDB = {};
					if (!(pageID in slideDB)) slideDB[pageID] = {}
					if (!(objID in slideDB[pageID])) slideDB[pageID][objID] = {};

					if ("paragraph" in p.objects[i]) { // if text box
						if (Object.keys(p.objects[i].paragraph).length != Object.keys(slideDB[pageID][objID]).length) {
							if (Object.keys(p.objects[i].paragraph).length < Object.keys(slideDB[pageID][objID]).length) {
								var start = parseInt(p.objects[i].paragraph.length) + 1;
								var end = Object.keys(slideDB[pageID][objID]).length;

								for (var j = start; j <= end; j++) removeSlideMappingInfo(pageID, objID, j);
							}
							else {
								writeSlideMappingInfo(pageID, objID, Object.keys(p.objects[i].paragraph).length - 1, "null");
							}
						}
					}
				}
			}
			else {
				$("#SlideRecommendation").html("No recommendation");
			}

			visualizeSlideObjects();

					/*
			if(curSlidePage == p.pageID) {
			}
			else {
				if(curSlideState == "WAIT")
				else if(curSlideState == "EDIT") {
					editFocus( {
						parent: $("#workspaceRect")[0].getBoundingClientRect(),
						child: $(popoverElement)[0].getBoundingClientRect()
					});
				}
			}
			*/
			hideLoadingSlidePlane();

			curSlidePage = p.pageID;
		});

		$(document).on("click", ".mappingIndicator.mapped", function(e) {
			issueEvent("root_navigateToWord", {
				mappingID: $(e.target).attr("mappingID")
			});
		});

		$(document).on("mousedown", function(e) {
			generalMouseDown++;

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
			generalMouseDown = 0;

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
					/* 
					// Single item has been clicked 

					appearPopoverOnSlideObject(src);
					issueEvent("root_getOriginalText", {
						mappingID: $("#mappingIndicator" + $(src).attr("id").substr(15)).attr("mappingID")
					}, "pdfjs_getOriginalText").then( result => {
							if(result.detail.text != '') {
								constructResourceBox(result.detail.text, []);
								appearResourceBox();
							}
						});
						*/

				}
				else if($(src).attr("objID") == $(dst).attr("objID")) {
					// Item has been dragged
					/*
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
					*/
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
				issueEvent("root_attachMonitor", null);

              //  closeNav();
                });

	$(document).on("pdfjs_pageRendered", function (e) {
		var p = e.detail;

		highlightPage(p.pageNumber);
	});

		$(document).on("pdfjs_getDocumentStructure", function(e) {
			console.log("I got it");

			var info = organizeHighlightOnSections();

			console.log(info);

			issueEvent("root_getDocumentStructure", {
				sectionStructure: structureHighlightDB,
				info: info
			});
		});

		$(document).on("pdfjs_highlighted", function(e) {
			var p = e.detail;
//			var info = organizeHighlightOnSections();

			registerHighlight(p).then(mapping => {
				showLoadingSlidePlane();

				return automaticallyPutContents(p, mapping).then(() => {
					issueEvent("root_sendMappingIdentifier", {
						mappingID: mapping.key,
						pageNumber: p.pageNumber,
						startWordIndex: p.startWordIndex,
						endWordIndex: p.endWordIndex
					});
				})
			});

			/*
			var before_finalRepresentation = printLink(info, T, C, numSlides, null, false);

			registerHighlight(p).then(mapping => {
				showLoadingSlidePlane();

				return automaticallyPutContents(p, mapping, before_finalRepresentation).then(() => {
					issueEvent("root_sendMappingIdentifier", {
						mappingID: mapping.key,
						pageNumber: p.pageNumber,
						startWordIndex: p.startWordIndex,
						endWordIndex: p.endWordIndex
					});
				})
			});
			*/
		});



		$(document).on("click", ".arrow.left", function(e) {
			console.log($(e.target).parent().parent());

			var rowObject = $(e.target).parent().parent();
			var rowInfo = structureHighlightDB[$(rowObject).attr("id")];

			var curLevel = ("level" in rowInfo ? rowInfo.level : 1);
			setCurLevel($(rowObject).attr("id"), curLevel <= 1 ? 1 : curLevel-1);

			updateStructure();
		});
		
		$(document).on("click", ".arrow.right", function(e) {
			console.log($(e.target).parent().parent());

			var rowObject = $(e.target).parent().parent();
			var prevRowObject = $(rowObject).prev();
			var flag = true;

			var rowInfo = structureHighlightDB[$(rowObject).attr("id")];
			var curLevel = ("level" in rowInfo ? rowInfo.level : 1);

			if($(prevRowObject).hasClass("documentStructureBodyRow")) {
				var prevObjLevel = parseInt($(prevRowObject).attr("level"));

				if(curLevel > prevObjLevel) flag = false;
			}

			if(flag) {
				setCurLevel($(rowObject).attr("id"), curLevel+1);
				updateStructure();
			}
		});
	
		$(document).on("click", "#documentStructureDisappearBtn", function(e) {
				disappearDocumentStructureBtn();
		});
		$(document).on("click", "#documentStructureBtn", function(e) {
				appearDocumentStructureBtn();
		});

		$(document).on("click", "#slideDeck_presentationObjectiveConfirmBtn", function(e) {
				setConstraints("slideDeck", getConstraints("slideDeck"), null, true)
				checkConstraintsDifference("slideDeck");

				automaticallyUpdateSlides();
		});

		$(document).on("click", "#presentationObjectiveDisappearBtn", function(e) {
				disappearPresentationObjective();
		});

		$(document).on("input", "#singleSlide_slideLayoutSlider", function(e) {
			var constraints = getConstraints("singleSlide");

			currentSingleSlideConstraints[curSlidePage] = constraints;

			recommendationRender(recommendationLoadingHistory[curSlidePage].result, constraints, curSlidePage, true);
		});

		$(document).on("input", "#singleSlide_textLengthSlider", function(e) {
			var constraints = getConstraints("singleSlide");

			currentSingleSlideConstraints[curSlidePage] = constraints;

			recommendationRender(recommendationLoadingHistory[curSlidePage].result, constraints, curSlidePage, true);
		});

		$(document).on("input", "#slideDeck_sparseDenseSlider", function(e) {
			var value = $("#slideDeck_sparseDenseSlider")[0].value;

			var minPageNum = $("#slideDeck_sparseDenseSlider")[0].min;
			var maxPageNum = $("#slideDeck_sparseDenseSlider")[0].max;

			$("#slideDeck_presentationTimeInputBox")[0].value = maxPageNum - (value - minPageNum);

			updateSectionLevelCoverageValue();
			checkConstraintsDifference("slideDeck");
		});

		$(document).on("input", "#slideDeck_presentationTimeInputBox", function(e) {
			var value = parseInt($("#slideDeck_presentationTimeInputBox")[0].value)

			console.log(T);
			console.log(value);

			setTimeConstraint(value);
		});

		$(document).on("click", "#presentationObjectiveBtn", function(e) {
				appearPresentationObjective();
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

			removeMappingOnPdfjs(pageNumber, mappingID, false).then(result => {
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

		function selectCells(target) {
			var cur = $(target);

			for(var i=0;i<100;i++) {
				if($(cur).hasClass("coverageTableCell")) {
					$(cur).addClass("selected");
				}
				else break;

				cur = $(cur).prev();
			}

			cur = $(target).next();

			for(var i=0;i<100;i++) {
				if($(cur).hasClass("coverageTableCell")) {
					$(cur).removeClass("selected");
				}
				else break;

				cur = $(cur).next();
			}
		}

		$(document).on("click", ".coverageTableCell", function(e) {
			if(!$(e.target).hasClass("disabled")) {
				if($(e.target).hasClass("selected") && $(e.target).attr("index") == '0' && $(".coverageTableCell.selected[sectionKey='" + $(e.target).attr("sectionKey") + "']").length == 1) 
					$(e.target).removeClass("selected");
				else 
					selectCells($(e.target));
			}
		});

		$(document).on("mouseenter", ".coverageTableCell", function(e) {
			if(generalMouseDown > 0 && !$(e.target).hasClass("disabled")) {
				selectCells($(e.target));
			}
		});

		$(document).on("click", ".sectionLevelCoveragePlusBtn", function(e) {
			var sectionKey = $(e.target).attr("sectionKey");
			var value = parseInt($(".sectionLevelCoverageInput[sectionKey='" + sectionKey + "']").val());

			sectionLevelCoverageValueUpdate(e.target, value+1);
		});

		$(document).on("click", ".sectionLevelCoverageMinusBtn", function(e) {
			var sectionKey = $(e.target).attr("sectionKey");
			var value = parseInt($(".sectionLevelCoverageInput[sectionKey='" + sectionKey + "']").val());

			sectionLevelCoverageValueUpdate(e.target, value-1);
		});

		function sectionLevelCoverageValueUpdate(target, value) {
			console.log($(target));

			var timeDOM = $("#slideDeck_presentationTimeInputBox");
			var sectionKey = $(target).attr("sectionKey");
			var inputDOM = $(".sectionLevelCoverageInput[sectionKey='" + sectionKey + "']");

			var numHighlights = parseInt($(".sectionLevelCoverageRowHighlight[sectionKey='" + sectionKey + "']").text());

			if(Math.ceil(numHighlights / MAX_ELEMENTS_PER_SLIDE) <= value && value <= numHighlights) {
				$(inputDOM).val(value);

				console.log(value);

				var sum = 0;

				$(".sectionLevelCoverageInput").each(function (idx, elem) {
					sum = sum + parseInt($(elem).val())
				});

				$(timeDOM).val(sum);

				var minPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].min);
				var maxPageNum = parseInt($("#slideDeck_sparseDenseSlider")[0].max);

				$("#slideDeck_sparseDenseSlider")[0].value = minPageNum + (maxPageNum-sum);
			}

			checkConstraintsDifference("slideDeck");
		}

		function checkConstraintsDifference(name) {
			if(name == "slideDeck") {
				var c = getConstraints("slideDeck");

				var timeDOM = $("#slideDeck_presentationTimeInputBox");

				if(c.time != currentSlideDeckConstraints.time) {
					$(timeDOM).addClass("slideDeck_timeDifferent")
				}
				else {
					$(timeDOM).removeClass("slideDeck_timeDifferent")
				}

				if(c.sparseDense != currentSlideDeckConstraints.sparseDense) {

				}

				if(c.descAbst != currentSlideDeckConstraints.descAbst) {

				}

				if(c.textLength != currentSlideDeckConstraints.textLength) {

				}

				if(c.imageType != currentSlideDeckConstraints.imageType) {

				}

				for(var s in c.sectionLevelCoverage) {
					var inputDOM = $(".sectionLevelCoverageInput[sectionKey='" + s + "']");

					if(c.sectionLevelCoverage[s] != currentSlideDeckConstraints.sectionLevelCoverage[s]) {
						$(inputDOM).addClass("sectionLevelCoverageInputValueDifferent");
					}
					else {
						$(inputDOM).removeClass("sectionLevelCoverageInputValueDifferent");
					}
				}
			}
		}

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

			firebase.database().ref("/users/" + userName + '/parameters/initialize').set(curState);
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

function appendImageQueryResult(response) {
	console.log(response);
	console.log(response.queries.request[0].searchTerms);

	var figDOM = $(".resourceFigureResultBody[searchTerm='" + response.queries.request[0].searchTerms + "']");

	console.log($(figDOM));

    for(var i=0;i<Math.min(response.items.length, 5);i++) {
        var item = response.items[i];

		$(figDOM).append("<img id='imageQueryResultItem" + i + "' class='imageQueryResultItem' src='" + item.link + "' />");
    }
}

function getImageQueryResult(queryString) {
    queryString = queryString.replace(' ', '+');

    curImageQueryString = queryString;

    $.get({
            url:"https://www.googleapis.com/customsearch/v1?key=AIzaSyA160fCjV5GS8HhQtYj2R29huH9lnXURKw&cx=000180283903413636684:oxqpr8tki8w&q="+queryString+"&searchType=image",
            success: appendImageQueryResult
            });
}


function setFiguresOnResourceBox(entities) {
	for(var i=0;i<entities.length;i++) {
		$("#resourceBoxFigureList").append(
				"<div class='resourceBoxHeader' searchTerm='" + entities[i] + "' > Figures (" + entities[i] + ") </div>" + 
				"<div class='resourceFigureResultBody' searchTerm='" + entities[i] + "' > </div>"
				);

		getImageQueryResult(entities[i]);
	}
}

function constructResourceBox(originalText, listOfKeywords) {
 	xmlhttp = new XMLHttpRequest();
 	xmlhttp.open("GET","http://hyungyu.com:3333/?text=" + originalText.replace(" ", "_"), true);
 	xmlhttp.onreadystatechange=function(){
 	   if (xmlhttp.readyState==4 && xmlhttp.status==200){
 		      var data=JSON.parse(xmlhttp.responseText);

			  console.log(data);

		  	  var result = getStrings(data.mySyntax);
			  var entities = data.entity;

			  $("#resourceBoxShortTextSlider").attr("max", result.length-1);
			  $("#resourceBoxShortTextSlider").attr("value", parseInt(result.length / 2));

			  for(var i=0;i<result.length;i++) $("#resourceBoxShortTextSlider").attr("text" + i, result[i]);

			  $("#resourceBoxShortTextBox").attr("value", result[parseInt(result.length/2)]);

			  setFiguresOnResourceBox(entities);
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
	$("#resourceBoxDiv").append('<br>');
	$("#resourceBoxDiv").append('<br>');

	$("#resourceBoxDiv").append("<div id='resourceBoxFigureList'> </div>");
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


async function writeImageSlideMappingInfoBulk(elems) {
	var updates = {};

	for(var e=0;e<elems.length;e++) {
		var elem = elems[e];

		console.log(elem);

		updates['/users/' + userName + '/slideInfo/' + elem.slideID + '/' + elem.objID + '/0'] = {
			mappingID: elem.mappingID
		}

		if(slideDB == null) slideDB = {};
		if(!(elem.slideID in slideDB)) slideDB[elem.slideID] = {};
		if(!(elem.objID in slideDB[elem.slideID])) slideDB[elem.slideID][elem.objID] = [];

		updates['/users/' + userName + '/slideInfo/' + elem.sldieID+ '/' + elem.objID + '/0'] = {
			mappingID: elem.mappingID 
		}

		slideDB[elem.slideID][elem.objID][0] = {
			mappingID: elem.mappingID
		}
	}

	await firebase.database().ref().update(updates);
}

async function writeSlideMappingInfoBulk(elems) {
	var updates = {};

	for(var e=0;e<elems.length;e++) {
		var elem = elems[e];

		updates['/users/' + userName + '/slideInfo/' + elem.slideID + '/' + elem.objID + '/' + elem.paragraphIndex] = {
			mappingID: elem.mappingID
		}

		if(slideDB == null) slideDB = {};
		if(!(elem.slideID in slideDB)) slideDB[elem.slideID] = {};
		if(!(elem.objID in slideDB[elem.slideID])) slideDB[elem.slideID][elem.objID] = [];

		updates['/users/' + userName + '/slideInfo/' + elem.sldieID+ '/' + elem.objID + '/' + elem.paragraphIndex] = {
			mappingID: elem.mappingID 
		}
		slideDB[elem.slideID][elem.objID][elem.paragraphIndex] = {
			mappingID: elem.mappingID
		}
	}

	await firebase.database().ref().update(updates);
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

function getSectionKey(pageNumber, startWordIndex, endWordIndex) {
	var keys = Object.keys(structureHighlightDB);
	var len = keys.length;

	for(var i=len-1;i>=0;i--) {
		var key = keys[i];
		var info = structureHighlightDB[key];

		if(parseInt(info.pageNumber) < parseInt(pageNumber) || 
				(parseInt(info.pageNumber) == parseInt(pageNumber) &&
		   		parseInt(info.startWordIndex) <= parseInt(startWordIndex))) {
			return key;
		}
	}

	return null;
}

function getSlideID(sectionKey) {
	if("slideID" in structureHighlightDB[sectionKey]) {
		return structureHighlightDB[sectionKey].slideID
	}
	else {
		return null;
	}
}

function getTitleAndBodyObjectID(sectionKey) {
	if("slideID" in structureHighlightDB[sectionKey] == null) return {
		bodyObjectID: null,
		titleObjectID: null
	};

	if("bodyObjectID" in structureHighlightDB[sectionKey])  {
		return {
			bodyObjectID: structureHighlightDB[sectionKey].bodyObjectID,
			titleObjectID: structureHighlightDB[sectionKey].titleObjectID
		}
	}
	else return {
		bodyObjectID: null,
		titleObjectID: null
	};
}

function getSlideIndexToPut(sectionKey) {
	var keys = Object.keys(structureHighlightDB);
	var cnt = 1;

	for(var i=0;i<keys.length;i++) {
		if(sectionKey == keys[i]) return cnt;

		if("slideID" in structureHighlightDB[keys[i]])
			cnt++;
	}

	return null;
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function putTextOnSection(textInfo, sectionKey, before_finalRepresentation) {
	var numSlides = getNumSlides();
	var info = organizeHighlightOnSections();

	// var before_finalRepresentation = printLink(info, T, C, numSlides, null, false);
	
	console.log(JSON.parse(JSON.stringify(before_finalRepresentation)));

	initializeConstraintsPlane();

	console.log(info);
	console.log(numSlides);

	var after_finalRepresentation = printLink(info, T, C, numSlides, null, true);
	console.log(JSON.parse(JSON.stringify(after_finalRepresentation)));

	var before_removal_index = [];
	var after_addition_index = [];

	if (sectionKey in before_finalRepresentation && sectionKey in after_finalRepresentation) {
		for (var i = 0; i < before_finalRepresentation[sectionKey].length; i++) {
			var flag = false;

			for (var j = 0; j < after_finalRepresentation[sectionKey].length; j++) {
				if (JSON.stringify(before_finalRepresentation[sectionKey][i]) === JSON.stringify(after_finalRepresentation[sectionKey][j])) {
					flag = true;
					break;
				}
			}

			if (!flag) {
				before_removal_index.push(i);
			}
		}

		for (var i = 0; i < after_finalRepresentation[sectionKey].length; i++) {
			var flag = false;

			for (var j = 0; j < before_finalRepresentation[sectionKey].length; j++) {
				if (JSON.stringify(after_finalRepresentation[sectionKey][i]) === JSON.stringify(before_finalRepresentation[sectionKey][j])) {
					flag = true;
					break;
				}
			}

			if (!flag) {
				after_addition_index.push(i);
			}
		}
	}
	else {
		for(var i=0;i<after_finalRepresentation[sectionKey].length;i++) 
			after_addition_index.push(i);
	}

	console.log(before_removal_index);
	console.log(after_addition_index);

	console.log(JSON.parse(JSON.stringify(before_finalRepresentation)));
	console.log(JSON.parse(JSON.stringify(after_finalRepresentation)));

	var requests = [];
	var updateInfo = [];
	var retValue;

	retValue = slideUpdate_removeSlides(before_finalRepresentation, sectionKey, before_removal_index);

	retValue = slideUpdate_makeBlankPages(before_removal_index);
	requests = requests.concat(retValue);
	console.log(JSON.parse(JSON.stringify(requests)));

	slideUpdate_fillSlides(before_finalRepresentation, after_finalRepresentation, sectionKey, before_removal_index, after_addition_index).then( res => {
		console.log(res);

		requests = requests.concat(JSON.parse(JSON.stringify(res.requests)));
		updateInfo = updateInfo.concat(res.updateInfo);

		var pages = [];

		for(var i=0;i<res.sequence.length;i++) {
			console.log(res.sequence[i]);

			if(!res.sequence[i].flag) {
				requests.unshift({
					createSlide: {
						objectId: res.sequence[i].slideID,
						insertionIndex: res.sequence[i].pos + 1,
						slideLayoutReference: {
							predefinedLayout: "BLANK"
						},
					}
				});

				setConstraints("singleSlide", "deck", res.sequence[i].slideID, true)
			}
			else pages.push(res.sequence[i].slideID);
		}

		console.log(requests);
		console.log(updateInfo);

		removeSlideMappingInPages(pages).then(() => {
			writeSlideMappingInfoBulk(updateInfo).then(() => {
				gapi.client.slides.presentations.batchUpdate({
					presentationId: PRESENTATION_ID,
					requests: requests
				}).then((createSlideResponse) => {
					//console.log(createSlideResponse);
				});
			});
		})
	});
}

function getLastPageOfPreviousSection(sectionKey, finalRepresentation) {
	var keys = Object.keys(structureHighlightDB);

	var idx = keys.indexOf(sectionKey);

	console.log(keys);
	console.log(sectionKey);
	console.log(finalRepresentation);

	for(var i=idx-1;i>=0;i--) {
		if(keys[i] in finalRepresentation) {
			if(finalRepresentation[keys[i]].length <= 0) return -1;

			var l = finalRepresentation[keys[i]];

			console.log(l);

			return findCorrespondingSlide(l[l.length-1]);
		}
	}

	return -1;
}

async function slideUpdate_fillSlides(before_finalRepresentation, after_finalRepresentation, sectionKey, removal_index, addition_index) {
	var result = await issueEvent("root_getSlideIndex", null, "extension_getSlideIndex");
	var Indexes = result.detail;
	var res = [];

	console.log(Indexes);
	console.log(sectionKey);


	if((!(sectionKey in before_finalRepresentation)) || before_finalRepresentation[sectionKey].length <= 0) {
		var page = getLastPageOfPreviousSection(sectionKey, before_finalRepresentation);
		var pageIndex = 0;

		console.log(page);

		if(page != -1) 
			pageIndex = Indexes[page]-1;

		for (var i = 0; i < after_finalRepresentation[sectionKey].length; i++) {
			res.push({
				slideID: makeid(10),
				pos: pageIndex,
				flag: false
			})

			pageIndex++;
		}
	}
	else {

		var currentSlideID = '';
		var before_cursor = 0;
		var before_slide = findCorrespondingSlide(before_finalRepresentation[sectionKey][0]);
		var prev_pos = -1;

		console.log(before_cursor, before_slide);


		console.log(Indexes);
		console.log(removal_index);
		console.log(addition_index);

		var before_position = Indexes[before_slide];

		var i = 0;
		var tmpPos = before_position - 1;

		var flag = false;

		for (var j = 0; j < removal_index.length; j++) {
			if (removal_index[j].index == 0) {
				flag = true;
				break;
			}
		}

		if (!flag) {
			for (; i < after_finalRepresentation[sectionKey].length; i++) {
				if (addition_index.indexOf(i) < 0) break;
				else {
					res.push({
						slideID: makeid(10),
						pos: tmpPos,
						flag: false
					})

					tmpPos++;
				}
			}
		}


		for (; i < after_finalRepresentation[sectionKey].length; i++) {
			if (addition_index.indexOf(i) >= 0) { // newly added
				if (before_cursor < before_finalRepresentation[sectionKey].length) {
					var flag = false;

					for (var j = 0; j < removal_index.length; j++) {
						if (removal_index[j].index == before_cursor) {
							flag = true;
							break;
						}
					}

					if (flag) {
						console.log(JSON.parse(JSON.stringify(before_finalRepresentation[sectionKey][before_cursor])));

						res.push({
							slideID: findCorrespondingSlide(before_finalRepresentation[sectionKey][before_cursor]),
							pos: -1,
							flag: true
						})

						console.log(res[res.length - 1]);

						prev_pos = before_position;

						before_cursor = before_cursor + 1;

						if (before_cursor < before_finalRepresentation[sectionKey].length) {
							before_slide = findCorrespondingSlide(before_finalRepresentation[sectionKey][before_cursor]);
							before_position = Indexes[before_slide];
						}
						else before_cursor = 987987987;
					}
					else {
						res.push({
							slideID: makeid(10),
							pos: prev_pos - 1,
							flag: false
						})

						prev_pos = prev_pos + 1;
					}
				}
				else {
					res.push({
						slideID: makeid(10),
						pos: prev_pos - 1,
						flag: false
					})

					prev_pos++;
				}
			}
			else {
				prev_pos = before_position;

				before_cursor = before_cursor + 1;

				if (before_cursor < before_finalRepresentation[sectionKey].length) {
					before_slide = findCorrespondingSlide(before_finalRepresentation[sectionKey][before_cursor]);
					before_position = Indexes[before_slide];
				}

				console.log(before_cursor, before_slide);
			}
		}
	}

	console.log(JSON.parse(JSON.stringify(res)));

	var updateInfo = [];
	var requests = [];

	console.log(addition_index);
	console.log(after_finalRepresentation[sectionKey]);

	for (var i = 0; i < after_finalRepresentation[sectionKey].length; i++) {
		console.log(i);

		if(addition_index.indexOf(i) >= 0) {
			var idx = addition_index.indexOf(i);

			console.log(idx);

			await loadRecommendationByResources(after_finalRepresentation[sectionKey][i], res[idx].slideID);

			var renderInfo = renderSlideOnGoogle(recommendationLoadingHistory[res[idx].slideID].renderResult[0], res[idx].slideID, false);

			console.log(JSON.parse(JSON.stringify(renderInfo)));

			updateInfo = updateInfo.concat(renderInfo.updateInfo);
			requests = requests.concat(renderInfo.requests);
		}
	}

	console.log(JSON.parse(JSON.stringify(updateInfo)));
	console.log(JSON.parse(JSON.stringify(requests)));

	return {
		updateInfo: updateInfo,
		requests: requests,
		sequence: res
	}
}

function findCorrespondingSlide(elem) {
	var mappingSet = {};

	for (var j = 0; j < elem.length; j++) {
		var mappingID = elem[j].mappingKey;

		mappingSet[mappingID] = 1;
	}

	return getSlideIDWithMappingSet(mappingSet);
}

function slideUpdate_removeSlides(finalRepresentation, sectionKey, removal_index) {
	if(!(sectionKey in finalRepresentation)) return [];

	var requests = [];

	console.log("what?");

	console.log(removal_index);

	for(var i=0;i<finalRepresentation[sectionKey].length;i++) {
		if (removal_index.indexOf(i) >= 0) {
			console.log(finalRepresentation[sectionKey][i]);

			var slideID = findCorrespondingSlide(finalRepresentation[sectionKey][i]);

			console.log(slideID);
			console.log(i);

			for(var j=0;j<removal_index.length;j++) {
				if(i == removal_index[j]) {
					console.log("got it");
					removal_index[j] = {
						slideID: slideID,
						index: i
					}
					console.log(removal_index[j]);
				}
			}
		}
	}

	return requests;
}

function slideUpdate_makeBlankPages(removal_index) {
	var requests = [];

	for(var i=0;i<removal_index.length;i++) {
		var slideID = removal_index[i].slideID;

		for (var key in slideDB[slideID]) {
			requests.push({
				"deleteObject": {
					"objectId": key,
				},
			});
		}
	}

	return requests;
}

function getSlideIDWithMappingSet(mappingSet) {
	for(var s in highlightDB.slideInfo) {
		var mappingSet2 = {};

		for(var obj in highlightDB.slideInfo[s]) {
			for(var i=0;i<highlightDB.slideInfo[s][obj].length;i++) {
				var mappingID = highlightDB.slideInfo[s][obj][i].mappingID;

				mappingSet2[mappingID] = 1;
			}
		}

		if(JSON.stringify(mappingSet) === JSON.stringify(mappingSet2)) 
			return s;
	}

	return -1;
}

function getDocSlideStructureView(index) {
	var tableBody = '';

	console.log(docSlideStructure[index]);

	if (docSlideStructure[index] != null && "slide" in docSlideStructure[index]) {
		var pageID = docSlideStructure[index].slide.id;

		var resources = getResources(pageID);
		var __tableBody = '';

		for (var j = 0; j < resources.length; j++) {
			__tableBody = __tableBody +
				"<tr class='adaptationTableRow' slideIndex='" + index + "' resourceIndex='" + j + "'>" +
					"<td class='adaptationTableIndex'>" + (j + 1) + 

					'<select class="adaptationTableTypeSelector" name="adaptationTableTypeSelector">' + 
  						'<option value="text" ' + (docSlideStructure[index].resources[j].currentContent.type == "text" ? "selected='selected'" : "") + '>Text</option>' + 
  						'<option value="image" ' + (docSlideStructure[index].resources[j].currentContent.type == "image" ? "selected='selected'" : "") + '>Image</option>' + 
					'</select>' + 

					"</td>" +
					"<td class='adaptationTableResourceBody'>" + resources[j] + "</td>" +
				"<tr>"
		}

		tableBody = tableBody +
			"<div class='adaptationViewDiv' index='" + index + "' slideID='" + docSlideStructure[index].slide.id + "'>" +
			"<div class='adaptationViewDocument'>" +
			"<table class='adaptationViewDocumentTable'>" +
			__tableBody +
			"</table>" +
			"</div>" +
			"<div class='adaptationViewSlide'>" +
			"</div>" +
			"</div>";
	}
	else {
		tableBody = tableBody +
			"<div class='adaptationViewDiv' index='" + index + "'>" +
			"<div class='adaptationViewDocument'>" +
			"<table class='adaptationViewDocumentTable'>" +
			"</table>" +
			"</div>" +
			"<div class='adaptationViewSlide'>" +
			"</div>" +
			"</div>";
	}

	return tableBody;
}

function isPossibleToAdd(dsStructure) {
	if(dsStructure.resources.length <= 2) return true;
	else return false;
}

async function automaticallyPutContents(textInfo, mapping) {
	console.log(textInfo);
	console.log(mapping);

	var sectionKey = getSectionKey(textInfo.pageNumber, textInfo.startWordIndex, textInfo.endWordIndex);

	console.log(sectionKey);
	
	var flag = false;
	var index = -1;

	console.log(docSlideStructure);

	for(i=docSlideStructure.length-1;i>=1;i--) {
		if(docSlideStructure[i].sectionKey == sectionKey) {
			index = i;
			
			if(isPossibleToAdd(docSlideStructure[i])) flag = true;

			break;
		}
	}

	/*
		.resources = []
		.sectionKey 
		.template 
	*/

	if(flag) { // add to the current slide
		if (docSlideStructure[index].template.id == "DEFAULT") {
			var slideID = docSlideStructure[index].slide.id;

			docSlideStructure[index].resources.push({
				"mappingKey": mapping.key,
				originalContent: {
					type: "text",
					contents: mapping.text
				},
				currentContent: {
					type: "text",
					contents: mapping.text,
					objID: null
				}
			});

			var updates = {};
			var len = docSlideStructure[index].resources.length;

			updates['/users/' + userName + '/docSlideStructure/' + index + '/resources/' + (len-1)] = docSlideStructure[index].resources[len-1];

			await firebase.database().ref().update(updates);

			handleChangeText(index, len-1, false);

			var v = getDocSlideStructureView(index);

			$(".adaptationViewDiv[index='" + index + "']")[0].outerHTML = v;
		}
		else console.log("*** DO NOT KNOW YET ***");
	}
	else {
		if(index == -1) { // create the section
			index = 0;

			for(var i=docSlideStructure.length-1;i>=1;i--) {
				var sectionIdx = parseInt(docSlideStructure[i].sectionKey.substring(20));
				var myIdx = parseInt(sectionKey.substring(20));

				if(sectionIdx < myIdx) {
					index = i;
					break;
				}
			}
		}

		// add a new slide to (index+1)

		var titleID = makeid(10);
		var bodyID = makeid(10);
		var slideID = makeid(10);

		for(var i=docSlideStructure.length-1;i>=(index+1);i--) {
			$(".adaptionViewDiv[index='" + i + "']").attr("index", i+1);
		}

		docSlideStructure.splice(index+1, 0, {
			resources: [{
				mappingKey: mapping.key,
				originalContent: {
					type: "text",
					contents: mapping.text
				},
				currentContent:  {
					type: "text",
					contents: mapping.text,
					objID: bodyID 
				}
			}],
			sectionKey: sectionKey,
			template: {
				id: "DEFAULT",
				structure: {
					title: titleID,
					body: [bodyID]
				}
			},
			slide: {
				id: slideID
			},
			mapping: [
				{
					source: mapping.key,
					destination: bodyID
				}
			]
		});

		firebase.database().ref("/users/" + userName + '/docSlideStructure').set(docSlideStructure);

		console.log(docSlideStructure);

		var requests = [];

		requests.push({
			createSlide: {
				objectId: slideID,
				insertionIndex: index+1,
				slideLayoutReference: {
					predefinedLayout: 'TITLE_AND_BODY'
				},
				placeholderIdMappings: [{
					objectId: titleID,
					layoutPlaceholder: {
						type: "TITLE",
						index: 0
					}
				}, {
					objectId: bodyID,
					layoutPlaceholder: {
						type: "BODY",
						index: 0
					}
				}
				]
			}
		});

		requests.push({
			insertText: {
				objectId: titleID,
				text: structureHighlightDB[sectionKey].text,
				insertionIndex: 0
			}
		});
		requests.push({
			insertText: {
				objectId: bodyID,
				text: textInfo.text,
				insertionIndex: 0
			}
		});

		var updates = {};

		// updates['/users/' + userName + '/structureHighlightInfo/' + sectionKey] = structureHighlightDB[sectionKey];

		firebase.database().ref().update(updates);

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: requests
		}).then((createSlideResponse) => {
			// successfully pasted the text

			writeSlideMappingInfo(slideID, bodyID, 0, mapping.key).then( () => {
				var v = getDocSlideStructureView(index + 1);
				console.log(v);

				function insertAfter(newNode, referenceNode) {
					referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
				}

				function htmlToElement(html) {
					var template = document.createElement('template');
					html = html.trim(); // Never return a text node of whitespace as the result
					template.innerHTML = html;
					return template.content.firstChild;
				}

				console.log(index);
				console.log($(".adaptationViewDiv[index='" + index + "']")[0]);

				insertAfter(htmlToElement(v), $(".adaptationViewDiv[index='" + index + "']")[0]);
			});

			return true;
		});

	}


	// putTextOnSection(textInfo, sectionKey, before_finalRepresentation);

	/*
	var heavy = $("#textHeavyBtn").prop("checked");

	console.log(heavy);

	if(heavy) {
		return automaticallyPutText(textInfo, mapping.key);
	}
	else {
		return automaticallyPutFigure(textInfo, mapping.key, mapping.imageURL);
	}
	*/
}

async function automaticallyPutFigure(textInfo, mappingID, imageURL) {
	/*
	   textInfo.startWordIndex
	   textInfo.endWordIndex
	   textInfo.pageNumber
	   textInfo.text
	   textInfo.sectionKey
	   */

	var sectionKey = getSectionKey(textInfo.pageNumber, textInfo.startWordIndex, textInfo.endWordIndex);
	var slideID = getSlideID(sectionKey);
	var objIDs = getTitleAndBodyObjectID(sectionKey);

	var titleObjectID = objIDs.titleObjectID;
	var figureObjID = makeid(10);

	var requests = [];

	if(slideID == null) {
		var index = getSlideIndexToPut(sectionKey);
		slideID = makeid(10);
		titleObjectID = makeid(10);

	  	requests.push({
	  	   createSlide: {
			objectId: slideID,
	  	   	insertionIndex: index,
	  	   	slideLayoutReference: {
predefinedLayout: 'TITLE_ONLY'
	  	   	},
			placeholderIdMappings: [{
				objectId: titleObjectID,
				layoutPlaceholder: {
					type: "TITLE",
					index: 0
				}
			}]
	  	   }
	  	});
		requests.push({
			createImage: {
				objectId: figureObjID,
				elementProperties: {
					pageObjectId: slideID
				},
				url: imageURL
			}
		});

		var updates = {};

		structureHighlightDB[sectionKey].slideID = slideID;
		structureHighlightDB[sectionKey].titleObjectID = titleObjectID;

		updates['/users/' + userName + '/structureHighlightInfo/' + sectionKey] = structureHighlightDB[sectionKey];

		firebase.database().ref().update(updates);

        gapi.client.slides.presentations.batchUpdate({
          presentationId: PRESENTATION_ID,
          requests: requests
        }).then((createSlideResponse) => {
            // successfully pasted the text

		    writeSlideMappingInfo(slideID, figureObjID, 0, mappingID);
		    return true;
        });
	}/* // it can be image slide! not a bug
	else if(slideID != null && bodyObjectID == null) { // Let's consider it as bug
		alert("BUG: cannot find objectID")
	}*/ 
	else {
		return addFigure(slideID, imageURL, mappingID);
	}
}

async function automaticallyPutText(textInfo, mappingID) {
	/*
	   textInfo.startWordIndex
	   textInfo.endWordIndex
	   textInfo.pageNumber
	   textInfo.text
	   textInfo.sectionKey
	   */

	var sectionKey = getSectionKey(textInfo.pageNumber, textInfo.startWordIndex, textInfo.endWordIndex);
	var slideID = getSlideID(sectionKey);
	var objIDs = getTitleAndBodyObjectID(sectionKey);

	var titleObjectID = objIDs.titleObjectID;
	var bodyObjectID = objIDs.bodyObjectID;

	var requests = [];

	if(slideID == null) {
		var index = getSlideIndexToPut(sectionKey);
		slideID = makeid(10);
		titleObjectID = makeid(10);
		bodyObjectID = makeid(10);

	  	requests.push({
	  	   createSlide: {
			objectId: slideID,
	  	   	insertionIndex: index,
	  	   	slideLayoutReference: {
	  	       	predefinedLayout: 'TITLE_AND_BODY'
	  	   	},
			placeholderIdMappings: [{
				objectId: titleObjectID,
				layoutPlaceholder: {
					type: "TITLE",
					index: 0
				}
			},{
				objectId: bodyObjectID,
				layoutPlaceholder: {
					type: "BODY",
					index: 0
				}
			}
			]
	  	   }
	  	});
		requests.push({
			insertText: {
				objectId: titleObjectID,
				text: structureHighlightDB[sectionKey].text,
				insertionIndex: 0
			}
		});
		requests.push({
			insertText: {
				objectId: bodyObjectID,
				text: textInfo.text,
				insertionIndex: 0
			}
		});

		var updates = {};

		structureHighlightDB[sectionKey].slideID = slideID;
		structureHighlightDB[sectionKey].titleObjectID = titleObjectID;
		structureHighlightDB[sectionKey].bodyObjectID= bodyObjectID;

		updates['/users/' + userName + '/structureHighlightInfo/' + sectionKey] = structureHighlightDB[sectionKey];

		firebase.database().ref().update(updates);

        gapi.client.slides.presentations.batchUpdate({
          presentationId: PRESENTATION_ID,
          requests: requests
        }).then((createSlideResponse) => {
            // successfully pasted the text

		    writeSlideMappingInfo(slideID, bodyObjectID, 0, mappingID);
		    return true;
        });
	}
	else if(slideID != null && bodyObjectID == null) { // Let's consider it as bug
		alert("BUG: cannot find objectID")
	}
	else {
		return appendText(slideID, bodyObjectID, textInfo.text, mappingID);
	}
}

function addFigure(pageID, imageURL, mappingID) {
	var figureObjID = makeid(10);
	var requests = [];

	requests.push({
		createImage: {
			objectId: figureObjID,
			elementProperties: {
				pageObjectId: pageID 
			},
			url: imageURL
		}
	});

    gapi.client.slides.presentations.batchUpdate({
      presentationId: PRESENTATION_ID,
      requests: requests
    }).then((createSlideResponse) => {
        // successfully pasted the text

	    writeSlideMappingInfo(pageID, figureObjID, 0, mappingID);
	    return true;
    });
}

async function getAppendTextRequest(pageID, objId, myText) {
    return await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(function(response) {
		console.log(response);

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
						else{
							endIndex = 0;
						} 

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
		
		return {
			request: requests,
			paragraphIndex: curParagraphIndex
		};
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
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

function updateSectionLevelCoverageValue() {
	var info = organizeHighlightOnSections();
	var numSlides = getNumSlides();
	var finalRepresentation = printLink(info, T, C, numSlides, null, false);

	$(".sectionLevelCoverageInput").each(function (idx, elem) {
		var sectionKey = $(elem).attr("sectionkey");

		if(sectionKey in finalRepresentation)
			$(elem)[0].value = finalRepresentation[sectionKey].length;
		else 
			$(elem)[0].value = 0;
	})
}

function getSlideInfoOnRecommendation(className, recommendedSlides) {
	console.log(className);
	console.log(recommendedSlides);

	for(var i=0;i<recommendedSlides.length;i++) {
		if(recommendedSlides[i].className == className)
		return recommendedSlides[i];
	}

	return -1;
}

function renderSlideOnGoogle(slideInfo, curSlidePage, applyFlag) {
	var requests = [];

	if(applyFlag) {
		for (var key in slideDB[curSlidePage]) {
			requests.push({
				"deleteObject": {
					"objectId": key,
				},
			});
		}
	}

	var updateInfo = [];

	console.log(slideInfo);
//	console.log(JSON.parse(JSON.stringify(slideInfo)));

	for(var i=0;i<slideInfo.innerBoxes.length;i++) {
		if (slideInfo.innerBoxes[i].type == 'text' || slideInfo.innerBoxes[i].type == 'textCaption') {
			var objID = makeid(10);

			var resText = '';
			var curStartIndex = 0;
			var curEndIndex = 0;
			var listID = makeid(10);

			var isBullet = false;

			if (slideInfo.innerBoxes[i].contents.length > 1) isBullet = true;

			for (var j = 0; j < slideInfo.innerBoxes[i].contents.length; j++) {
				updateInfo.push({
					slideID: curSlidePage,
					objID: objID,
					paragraphIndex: j,
					mappingID: slideInfo.innerBoxes[i].contents[j].mappingID
				});

				resText = resText + (resText == '' ? '' : '\n') + slideInfo.innerBoxes[i].contents[j].text;
			}

			requests.push({
				"createShape": {
					objectId: objID,
					elementProperties: {
						pageObjectId: curSlidePage,
						size: {
							width: {
								magnitude: getSlideWidth(slideInfo.innerBoxes[i].width) * 0.75292857248934,
								unit: "pt"
							},
							height: {
								magnitude: getSlideHeight(slideInfo.innerBoxes[i].height) * 0.75292857248934,
								unit: "pt"
							},
						},
						transform: {
							scaleX: 1,
							scaleY: 1,
							translateX: getSlideWidth(slideInfo.innerBoxes[i].left) * 0.75292857248934,
							translateY: getSlideHeight(slideInfo.innerBoxes[i].top) * 0.75292857248934,
							unit: "pt"
						}
					},
					shapeType: "TEXT_BOX"
				}
			});

			requests.push({
				"updateShapeProperties": {
					objectId: objID,
					shapeProperties: {
						/*
						outline: {
							outlineFill: {
								solidFill: {
									color: {
										rgbColor: {
											red: 0,
											green: 0,
											blue: 0
										}
									}
								}
							},
							weight: {
								magnitude: 1,
								unit: "pt"
							},
							dashStyle: "SOLID",
						},
						*/
						contentAlignment: "MIDDLE"
					},
					fields: "outline.outlineFill.solidFill.color, contentAlignment"
				}
			});

			requests.push({
				"insertText": {
					"objectId": objID,
					"text": resText,
				}
			});

			requests.push({
				"updateTextStyle": {
					objectId: objID,
					style: {
						fontSize: {
							"magnitude": 25.5,
							"unit": "pt"
						},
					},
					fields: "fontSize"
				}
			});

			if (isBullet) {

				requests.push({
					createParagraphBullets: {
						objectId: objID,
						textRange: {
							type: "ALL"
						},
						bulletPreset: "BULLET_DISC_CIRCLE_SQUARE"
					}
				});

				requests.push({
					"updateParagraphStyle": {
						objectId: objID,
						style: {
							lineSpacing: 110,
						},
						textRange: {
							type: "ALL"
						},
						fields: "lineSpacing"
					}
				});
			}
			else {
				requests.push({
					"updateParagraphStyle": {
						objectId: objID,
						style: {
							alignment: "CENTER"
						},
						fields: "alignment"
					}
				});
			}
		}
		else {
			var objID = makeid(10);
			var imageURL = slideInfo.innerBoxes[i].contents.imgResult;

			updateInfo.push({
				slideID: curSlidePage,
				objID: objID,
				paragraphIndex: 0,
				mappingID: slideInfo.innerBoxes[i].contents.mappingID
			});

			requests.push({
				createImage: {
					objectId: objID,
					elementProperties: {
						pageObjectId: curSlidePage,
						size: {
							width: {
								magnitude: getSlideWidth(slideInfo.innerBoxes[i].width) * 0.75292857248934,
								unit: "pt"
							},
							height: {
								magnitude: getSlideHeight(slideInfo.innerBoxes[i].height) * 0.75292857248934,
								unit: "pt"
							},
						},
						transform: {
							scaleX: 1,
							scaleY: 1,
							translateX: getSlideWidth(slideInfo.innerBoxes[i].left) * 0.75292857248934,
							translateY: getSlideHeight(slideInfo.innerBoxes[i].top) * 0.75292857248934,
							unit: "pt"
						}
					},
					url: imageURL
				}
			});
		}
	}

	// requests = requests.concat(genRequest(elem.slideID, slideIndex, "TITLE_AND_BODY", elem.objIDs, [structureHighlightDB[s].text].concat(getListOnKey(elem.highlightInfo, "text"))));

	if (applyFlag) {
		removeSlideMappingInPage(curSlidePage).then(() => {
			console.log(JSON.parse(JSON.stringify(slideDB)));

			writeSlideMappingInfoBulk(updateInfo).then(() => {
				gapi.client.slides.presentations.batchUpdate({
					presentationId: PRESENTATION_ID,
					requests: requests
				}).then((createSlideResponse) => {
					//console.log(createSlideResponse);
				});
			});
		})
	}
	else return {
		updateInfo: updateInfo,
		requests: requests
	}
}