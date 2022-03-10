var MAX_ELEMENTS_PER_SLIDE = 4;
var SLIDES_PER_MIN = 2;

// var API_URL= 'https://server.hyungyu.com:5713/'
var API_URL= 'http://localhost:8010/proxy/'
var rowSelected = false;
var selectedSlideIndex = -1;
var selectedResourceIndex = -1;
var statusFlag = true;

var currentSelectedResourceIndex = -1, currentSelectedSlideIndex, currentResourceSelectedFlag = false;
var current_left_plane = 'document';

var curDocSlideStructureIndex = -1;
var referenceLayout = {};
var referenceStyle = {};

var referenceSlideID = "1HbS5f9IcAJJwWJqjLPEac03OCNu6Oz_iHfPGsbhYYO4";
var DEFAULT_SLIDE_ID = "1HbS5f9IcAJJwWJqjLPEac03OCNu6Oz_iHfPGsbhYYO4";
var LAYOUT_SLIDE_ID = "1ygH_qwVUjIz3N5rBUBVjalDx0gCirOmx0fWZjSZBgnM";
var STYLE_SLIDE_ID = "1Ff5vXbpOX7ZCr3aNeURXFbVcKddVbMXYRRkDffhtsxY";

var slide_deck_adaptation_req;
var num_slides_in_total = 0;
var global_count = 0;
var adaptedSlideURLs = {};
var slide_deck_matching;

var GOOGLE_SLIDE_HEIGHT = 540;
var GOOGLE_SLIDE_WIDTH = 960;

var RENDER_SLIDE_HEIGHT = 225;
var RENDER_SLIDE_WIDTH = 400;

var adaptivePlaneStatus = 0;
var slideDeckInfo = {};

var docSlideStructure = [];

var userName = 'tempUser';

var PRESENTATION_ID = '1-ZGwchPm3T31PghHF5N0sSUU_Jd9BTwntcFf1ypb8ZY'
var TEMP_PRESENTATION_ID = '1SV3S92pjwtGGwKvjJDJ7d6cxUvS2CCfeQ3yh2Tdz8pQ'

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
var curSlideIndex = -1;
var structureHighlightDB = {};
var recommendationLoadingHistory = {};
var clickedElements = false;
var userLevelCoverageConstraints = {};

var currentSlideDeckConstraints = {};
var currentSingleSlideConstraints = {};

var T = null, C = null;

var MAX_NUMBER_OF_BULLETS = 3;
var MAX_NUMBER_OF_SLIDES = 10;

var examplePresentations = [];
var outlineStructure = [];
var selectedOutlineIndex = -1;
var curPresentationDuration = 0;

var waitingOutlineIndex = -1;

function getImgList(x) { 
	for(var i in x) {
		if(x[i].length > 0)
			return x[i][0];
	}
	return -1;
}

function verifyShorteningStructure() {
	for (var pgNumber in highlightDB.mapping) {
		for (var k in highlightDB.mapping[pgNumber]) {
			var r = highlightDB.mapping[pgNumber][k].shortening;

			if( !("shortenings" in r.result) ) r.result.shortenings = [];
			if( !("importantSegments" in r.result) ) r.result.importantSegments = [];
			if( !("phrases" in r.result) ) r.result.phrases = [];
		}
	}
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

async function getExamplePresentationInfo(index) {
	var res = await postRequest(
		API_URL + "get_presentation_info", {
			presentationId: index
		}
	);

	console.log(res);

	for(var i=0;i<res.data.outline.length;i++) {
		res.data.outline[i].colorCode = genColor();
	}

	examplePresentations.push({
		index: index,
		outline: res.data.outline,
		paperSentences: res.data.paperSentences,
		scriptSentences: res.data.scriptSentences,
		slideInfo: res.data.slideInfo
	})
}

function getKeywordDiv(k) {
	var result = '';

	for(var i=0;i<k.length;i++) {
		result = result + "<div class='examplePresentationKeyword'> " + k[i] + "</div>"
	}

	return "<div class='examplePresentationKeywordDiv'> " + result + "</div>";
}

function getDurationString(d) {
	return parseInt(d) + ":" + ("00" + String(parseInt((d-parseInt(d)) * 60))).slice(-2);
}

function getOutlineDiv(outline, slides) {
	var width = $("#examplePresentationListBody").width() - 60;
	var result = "<div class='examplePresentationOutline'>" ;

	var presentationDuration = slides[slides.length-1].endTime - slides[0].startTime;

	console.log(outline);

	result = result + "<div class='examplePresentationOutlineSegmentDiv'>"
	for(var i=0;i<outline.length;i++) {
		var duration = (slides[outline[i].endSlideIndex].endTime - slides[outline[i].startSlideIndex].startTime) 
		var segmentWidth = duration / presentationDuration * 100;

		duration = duration / 60;
 
		result = result +
			"<div class='outlineSegmentElement exampleSegmentElement' segmentIndex='" + i + "' style='width: " + segmentWidth + "%; background-color: " + outline[i].colorCode + "'>" + 
				getDurationString(duration) + 
			"</div>"
	}
	result = result + "</div>"

	result = result + "<div class='examplePresentationOutlineSegmentLabelDiv'>"

	for(var i=0;i<outline.length;i++) {
		var duration = (slides[outline[i].endSlideIndex].endTime - slides[outline[i].startSlideIndex].startTime) 
		var segmentWidth = duration / presentationDuration * 100;

		duration = duration / 60;
 
		result = result +
			"<div class='outlineSegmentLabelElement exampleLabelElement' segmentIndex='" + i + "' style='width: " + segmentWidth + "%;'>" + 
				outline[i].sectionTitle + 
			"</div>"
	}

	result = result + 
	"<div class='examplePresentationDuration'>" + 
		getDurationString(presentationDuration / 60) + 
	 "</div>"

	result = result + "</div>"
	result = result + "</div>"

	return result;
}

function getSlideThumbnail(presentationIndex, outline, slides) {
	var result = '';

	for(var i=0;i<outline.length;i++) {
		result = result + "<div class='examplePresentationSlideThumbnailOutlineSegment' segmentIndex='" + i + "' style='background-color: " + outline[i].colorCode + "'> ";

		for(var j=outline[i].startSlideIndex;j<(i >= outline.length-1 ? slides.length : outline[i+1].startSlideIndex);j++) {
			result = result + "<div class='examplePresentationSlideThumbnailImageDiv'> " + 
				"<div class='examplePresentationSlideThumbnailNumber'>" + j + "</div>" +
				"<img class='examplePresentationSlideThumbnailImage' " + 
				"src='http://localhost:8000/slideThumbnail/" + presentationIndex + "/images/" + j + ".jpg'> </img>" + 
				"<div class='examplePresentationSlideThumbnailLabel'> " + 
					getDurationString((slides[j].endTime - slides[j].startTime) / 60) + 
				"</div>" + 
			"</div>"
		}

		result = result + "</div>"
	}

	return "<div class='examplePresentationSlideThumbnailDiv folded'> " + result + "</div>";
}

function getScriptDiv(slides) {
	var result = '';

	for(var i=0;i<slides.length;i++) {
		result = result + "<div class='examplePresentationScriptInstance' index='" + i + "'>" +
							"<div class='examplePresentationScriptHeader'>"  +
								"<div class='examplePresentationScriptHeaderInside'>" + i + "</div>" + 
							"</div>" + 
							"<div class='examplePresentationScriptBody'>" + slides[i].script + "</div>" +  
					  	  "</div>"
	}

	return "<div class='examplePresentationScriptDiv folded'>" + result + "</div>";
}

function getFoldingBtn(index) {
	return "<div class='examplePresentationFoldingBtn unfold' index='" + index + "'> </div>"
}

function updateExamplePresentation() {
	console.log("??");

	var title = "Seeing Beyond Expert Blind Spots";
	var keywords = ["HCI education", "Instructor belief", "Learning@Scale"];

	var resultHtml = '';

	for(var i=0;i<examplePresentations.length;i++) {
		resultHtml = resultHtml + 
				"<div class='examplePresentationInstance folded' index='" + i + "'> " + 
					"<div class='examplePresentationInstanceTitle'>" + title + "</div>" + 
					getKeywordDiv(keywords) + 
					getOutlineDiv(examplePresentations[i].outline, examplePresentations[i].slideInfo) + 
					getSlideThumbnail(examplePresentations[i].index, examplePresentations[i].outline, examplePresentations[i].slideInfo) + 
					getScriptDiv(examplePresentations[i].slideInfo) + 
					getFoldingBtn(i) + 
				"</div>"
	}

	$("#examplePresentationListBody").html(resultHtml);
}

async function prepare() {
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
    var SCOPES = "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/script.scriptapp https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/script.external_request https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive";

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

    var haha = await $.get({
            url:"https://www.googleapis.com/customsearch/v1/siterestrict?fileType=jpg,png,jpeg&key=AIzaSyA160fCjV5GS8HhQtYj2R29huH9lnXURKw&cx=000180283903413636684:oxqpr8tki8w&q="+queryString+"&searchType=image",
            // success: registerImageOnHighlight
            });

	return haha.items[0].link;
}

async function writeHighlight(pageNumber, startWordIndex, endWordIndex, text) {
	var newKey = firebase.database().ref('users/' + userName + '/mapping/' + pageNumber + '/').push().key;
	// var shortening = await getShortening(text);

	// console.log(shortening);

	// var rURL = await getRepresentativeImageURL(text);

	var updates = {};

	updates['/users/' + userName + '/mapping/' + pageNumber + '/' + newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex,
		text: text,
		// shortening: shortening
		// imageURL: rURL
	};

	await firebase.database().ref().update(updates);

	if(!("mapping" in highlightDB)) highlightDB.mapping = {};
	if(!(pageNumber in highlightDB.mapping)) highlightDB.mapping[pageNumber] = {};

	highlightDB.mapping[pageNumber][newKey] = {
		startWordIndex: startWordIndex,
		endWordIndex: endWordIndex,
		text: text,
		// shortening: shortening
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
	if(i == -1)	$(".adaptationViewDiv").show();
	else {
		$(".adaptationViewDiv").hide();
		$(".adaptationViewDiv[index='" + i + "']").show();
	}
}

function updateDocSlide() {
	setDocSlideStructure(docSlideStructure);
	updateDocSlideToExtension(docSlideStructure);

	var idx = getIndexOfSlide(curSlidePage);

	showDocSlideView(idx);
}

function updateDocSlideStructure(index) {
	var v = getDocSlideStructureView(index);

	$(".adaptationViewDiv[index='" + index + "']")[0].outerHTML = v;
}

function setDocSlideStructure(dsStructure) {
	var tableBody = '';

	for(var i=0;i<dsStructure.length;i++) {
		tableBody = tableBody + getDocSlideStructureView(i);
	}

	// console.log(tableBody);

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
	await writeInitializeSlides();

	var response = await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
	})

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

	var resultingSlideID = "THIS_IS_FIRST_SLIDE";

	requests.push({
		createSlide: {
			objectId: resultingSlideID,
			slideLayoutReference: {
				predefinedLayout: 'TITLE'
			}
		}
	});

	/*
	var res = await createSlide(referenceSlideID, {
		header: {
			currentContent: {
				contents: "Sketching Informal Presentations"
			}
		},
		body: [{
			currentContent: {
				contents: "Sketching Informal Presentations"
			}
		}]
	}, "p", "p", resultingSlideID)

	var objKey = Object.keys(res.matching.pageElements)[0];

	var objID = res.matching.pageElements[objKey].box.objectId;

	docSlideStructure = [{
		"type": "visible",
		"contents": {
			sectionKey: '',
			list: [{
				currentContent: {
					type: "text",
					label: "HEADER_0",
					contents: "Sketching Informal Presentations",
					boxIndex: 0,
				},
				originalContent: {
					contents: "Sketching Informal Presentations",
					type: "text",
				}
			}]
		},
		"layout": {
			mapping: {
				"HEADER_0": objID
			},
			...getLayout(DEFAULT_SLIDE_ID, "p")
		},
		"style": {
			...getStyle(DEFAULT_SLIDE_ID, "p")
		},
		"slide": {
			id: "THIS_IS_FIRST_SLIDE",
			objs: []
		},
		"layoutAlternative": {
			loaded: false,
			loadStarted: false,
			result: []
		},
		"styleAlternative": {
			loaded: false,
			loadStarted: false,
			result: []
		},

	}];

	requests = requests.concat(res.requests);

	*/

	/*
	requests.push({
		createSlide: {
			objectId: "THIS_IS_INITIAL_SLIDE",
			insertionIndex: '0',
			slideLayoutReference: {
				predefinedLayout: 'TITLE'
			}
		}
	});
	*/
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
		// copyCurrentSlide("THIS_IS_FIRST_SLIDE");
		return true;
	});
}

function getSlideHeight(x) {
	return x / RENDER_SLIDE_HEIGHT * GOOGLE_SLIDE_HEIGHT;
}

function getSlideWidth(x) {
	return x / RENDER_SLIDE_WIDTH * GOOGLE_SLIDE_WIDTH;
}

async function createSlide(presentationIDToAdapt, contents, layoutSlideID, styleSlideID, slideID) {
	var r = {};
	var resultSlideID = slideID;

	r.presentationId = presentationIDToAdapt;
	r.targetPageId = resultSlideID;
	r.layoutPageId = layoutSlideID;
	r.stylesPageId = styleSlideID;
	r.pageNum = 1;

	r.settings = {
		fast: true,
		contentControl: false
	};
	r.resources = {};

	r.resources.header = {
		shortenings: [
			{
				text: contents.header.currentContent.contents,
				score: {
					grammatical: 1,
					semantic: 1
				}
			}
		],
		singleWord: {},
		phrases: [],
	};

	r.resources.body = [];

	for(var i=0;i<contents.body.length;i++) {
		r.resources.body.push({
			paragraph: {
				shortenings: [
					{
						text: contents.body[i].currentContent.contents,
						score: {
							grammatical: 1,
							semantic: 1,
							importantWords: 1
						}
					}
				],
				singleWord: {},
				phrases: [],
				id: contents.body[i].mappingKey == "null" ? null : contents.body[i].mappingKey
			}
		});
	}

	console.log(JSON.stringify(r));
	var res = await postRequest(
		API_URL + "generate_slide_requests", r
	);

	return res;
}

async function initializeDB() {
	var presentationList = [
		0, 4, 6,
            7,
            9,
            10,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20
	];

	for (var i = 0; i < presentationList.length; i++) {
		console.log(i);
		await getExamplePresentationInfo(presentationList[i]);
	}

	updateExamplePresentation()

	// testGAPICall();

/*
	var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(LAYOUT_SLIDE_ID);

	gapi.client.slides.presentations.batchUpdate({
		presentationId: LAYOUT_SLIDE_ID,
		requests: req 
	}).then((createSlideResponse) => {
		console.log(createSlideResponse)
	});

	var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(STYLE_SLIDE_ID);

	console.log(req);

	gapi.client.slides.presentations.batchUpdate({
		presentationId: STYLE_SLIDE_ID,
		requests: req 
	}).then((createSlideResponse) => {
		console.log(createSlideResponse)
	});
*/
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
				initializeSlide().then( async () => {
					issueEvent("root_openPDF", null);

					currentSlideDeckConstraints.sparseDense = 0;
					currentSlideDeckConstraints.textLength = 50;
					currentSlideDeckConstraints.descAbst = 0;
					currentSlideDeckConstraints.time = 1;
					currentSlideDeckConstraints.sectionLevelCoverage = {};

					highlightDB.slideInfo = {};
					slideDB = highlightDB.slideInfo;

					referenceSlideID = DEFAULT_SLIDE_ID;

					console.log(JSON.parse(JSON.stringify(docSlideStructure)));

					setDocSlideStructure(docSlideStructure);
					showDocSlideView(0);

					/*
					for (var key in structureHighlightDB) {
						currentSlideDeckConstraints.sectionLevelCoverage[key] = 0;
					}
					*/

					// initializeConstraintsPlane();

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
			referenceSlideID = result.referenceSlideID;

			verifyShorteningStructure();
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

			// initializeConstraintsPlane();

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
	return;

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

				// console.log(curSlideObjects.pageID, objectID, paragraphID);
				if(curSlideObjects.pageID in slideDB && 
				   objectID in slideDB[curSlideObjects.pageID] && 
				   paragraphID in slideDB[curSlideObjects.pageID][objectID])
				   // console.log(slideDB[curSlideObjects.pageID][objectID][paragraphID])

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

	var result = await fetch(API_URL+'getImages', requestOptions)
		.then(response => response.json())
		.then(data => {
			return data;
		});

	return result;
}

function getParagraphIndexOfDocSlideStructure(s, r) {
	var label = docSlideStructure[s].contents.list[r].currentContent.label;
	var pIndex = 0;

	for(var i=0;i<r;i++) {
		if(label == docSlideStructure[s].contents.list[i].currentContent.label)
			pIndex++;
	}

	return pIndex;
	/*
	console.log(slideID, mappingKey, slideObjID);
	console.log(slideDB);

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
	*/
}

function getImageToShow(imgList) {
	for(var i=0;i<imgList.length;i++) {
		if(!imgList[i].url.includes("fbsbx") && imgList[i].url.startsWith("http"))
			return imgList[i];
	}

	console.log("***** NOT FOUND *****");
	return -1;
}

async function substituteTextToFigure(s, r, imgUrl) {
	var slidePageID = docSlideStructure[s].slide.id;
	var label = docSlideStructure[s].contents.list[r].currentContent.label;
	var objectID = docSlideStructure[s].layout.mapping[label];

	var paragraphIndex = getParagraphIndexOfDocSlideStructure(s, r);

	// var imgList = await findImages(d.surfaceWords);
	// var finalImage = getImageToShow(imgList);

	var finalImage = imgUrl;

	console.log(finalImage);
	console.log(objectID);

	var imgObjID = makeid(10);

    return await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		console.log(response);

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

									docSlideStructure[s].contents.list[r].currentContent.type = "image";
									docSlideStructure[s].contents.list[r].currentContent.contents = finalImage;

									var prevLabel = docSlideStructure[s].contents.list[r].currentContent.label;
									var pictureCnt = 0;

									for(var i=0;i<docSlideStructure[s].contents.list[r].length;i++) {
										if(docSlideStructure[s].contents.list[r].currentContent.label.startsWith("PICTURE"))
											pictureCnt++;
									}

									docSlideStructure[s].contents.list[r].currentContent.label = "PICTURE_" + pictureCnt;
									docSlideStructure[s].layout.mapping["PICTURE_" + pictureCnt] = imgObjID;
									
									var obj = JSON.parse(JSON.stringify(docSlideStructure[s].contents.list[r]));
									docSlideStructure[s].contents.list.push(obj);
									docSlideStructure[s].contents.list.splice(r, 1);


									if (objDeletionFlag) {
										delete docSlideStructure[s].layout.mapping[prevLabel];

										for (var i = 0; i < docSlideStructure[s].layout.boxes.length; i++) {
											var b = docSlideStructure[s].layout.boxes[i];

											if (b.type == prevLabel) {
												docSlideStructure[s].layout.boxes.splice(i, 1);
											}
										}
									}

									docSlideStructure[s].layout.boxes.push({
										height: 0,
										id: imgObjID,
										left: 0,
										top: 0,
										type: "PICTURE_" + pictureCnt,
										width: 0
									})

									updates['/users/' + userName + '/docSlideStructure/' + s + '/resources/' + r + '/currentContent/'] = docSlideStructure[s].contents.list[r].currentContent;

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
										url: finalImage
									}
								});

								console.log(lastParagraphFlag);

								console.log(requests);

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



function testGAPICall() {
	var requests = [
		{
			"createSlide": {
				"objectId": "b86b616b-14b0-4aac-bbe1-0755a44fb649",
				"insertionIndex": 0
			}
		},
		{
			"createShape": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"elementProperties": {
					"pageObjectId": "b86b616b-14b0-4aac-bbe1-0755a44fb649",
					"size": {
						"width": {
							"magnitude": 3000000,
							"unit": "EMU"
						},
						"height": {
							"magnitude": 3000000,
							"unit": "EMU"
						}
					},
					"transform": {
						"scaleX": 2.8402,
						"scaleY": 0.1909,
						"translateX": 311700,
						"translateY": 445025,
						"unit": "EMU",
						"shearX": 0,
						"shearY": 0
					}
				},
				"shapeType": "RECTANGLE"
			}
		},
		{
			"insertText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"text": "TEXT_BOX",
				"insertionIndex": 0
			}
		},
		{
			"deleteText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"textRange": {
					"type": "ALL"
				}
			}
		},
		{
			"insertText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"text": "TITLE"
			}
		},
		{
			"updateParagraphStyle": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"style": {
					"lineSpacing": 100,
					"alignment": "START",
					"indentStart": {
						"unit": "PT"
					},
					"indentEnd": {
						"unit": "PT"
					},
					"spaceAbove": {
						"unit": "PT"
					},
					"spaceBelow": {
						"unit": "PT"
					},
					"indentFirstLine": {
						"unit": "PT"
					},
					"direction": "LEFT_TO_RIGHT",
					"spacingMode": "NEVER_COLLAPSE"
				},
				"textRange": {
					"type": "ALL"
				},
				"fields": "lineSpacing,alignment,indentStart.unit,indentEnd.unit,spaceAbove.unit,spaceBelow.unit,indentFirstLine.unit,direction,spacingMode"
			}
		},
		{
			"updateTextStyle": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"style": {
					"backgroundColor": {},
					"foregroundColor": {
						"opaqueColor": {
							"themeColor": "DARK1"
						}
					},
					"bold": false,
					"italic": false,
					"fontSize": {
						"magnitude": 28,
						"unit": "PT"
					},
					"baselineOffset": "NONE",
					"smallCaps": false,
					"strikethrough": false,
					"underline": false,
					"weightedFontFamily": {
						"fontFamily": "Arial",
						"weight": 400
					}
				},
				"textRange": {
					"type": "ALL"
				},
				"fields": "foregroundColor.opaqueColor.themeColor,bold,italic,fontSize.magnitude,fontSize.unit,baselineOffset,smallCaps,strikethrough,underline,weightedFontFamily.fontFamily,weightedFontFamily.weight"
			}
		},
		{
			"updateShapeProperties": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"shapeProperties": {
					"shapeBackgroundFill": {
						"propertyState": "NOT_RENDERED",
						"solidFill": {
							"color": {
								"rgbColor": {
									"red": 1,
									"green": 1,
									"blue": 1
								}
							},
							"alpha": 1
						}
					},
					"outline": {
						"outlineFill": {
							"solidFill": {
								"color": {
									"rgbColor": {}
								},
								"alpha": 1
							}
						},
						"weight": {
							"magnitude": 9525,
							"unit": "EMU"
						},
						"dashStyle": "SOLID",
						"propertyState": "NOT_RENDERED"
					},
					"contentAlignment": "TOP"
				},
				"fields": "shapeBackgroundFill.propertyState,shapeBackgroundFill.solidFill.color.rgbColor.red,shapeBackgroundFill.solidFill.color.rgbColor.green,shapeBackgroundFill.solidFill.color.rgbColor.blue,shapeBackgroundFill.solidFill.alpha,outline.outlineFill.solidFill.alpha,outline.weight.magnitude,outline.weight.unit,outline.dashStyle,outline.propertyState,contentAlignment"
			}
		},
		{
			"createShape": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"elementProperties": {
					"pageObjectId": "b86b616b-14b0-4aac-bbe1-0755a44fb649",
					"size": {
						"width": {
							"magnitude": 3000000,
							"unit": "EMU"
						},
						"height": {
							"magnitude": 3000000,
							"unit": "EMU"
						}
					},
					"transform": {
						"scaleX": 2.8402,
						"scaleY": 1.1388,
						"translateX": 311700,
						"translateY": 1152475,
						"unit": "EMU",
						"shearX": 0,
						"shearY": 0
					}
				},
				"shapeType": "RECTANGLE"
			}
		},
		{
			"insertText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"text": "TEXT_BOX",
				"insertionIndex": 0
			}
		},
		{
			"deleteText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"textRange": {
					"type": "ALL"
				}
			}
		},
		{
			"insertText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"text": "BODY"
			}
		},
		{
			"updateParagraphStyle": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"style": {
					"lineSpacing": 115,
					"alignment": "START",
					"indentStart": {
						"unit": "PT",
						"magnitude": 36
					},
					"indentEnd": {
						"unit": "PT"
					},
					"spaceAbove": {
						"unit": "PT"
					},
					"spaceBelow": {
						"magnitude": 16,
						"unit": "PT"
					},
					"indentFirstLine": {
						"unit": "PT",
						"magnitude": 18
					},
					"direction": "LEFT_TO_RIGHT",
					"spacingMode": "COLLAPSE_LISTS"
				},
				"textRange": {
					"type": "ALL"
				},
				"fields": "lineSpacing,alignment,indentStart.unit,indentStart.magnitude,indentEnd.unit,spaceAbove.unit,spaceBelow.magnitude,spaceBelow.unit,indentFirstLine.unit,indentFirstLine.magnitude,direction,spacingMode"
			}
		},
		{
			"updateTextStyle": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"style": {
					"backgroundColor": {},
					"foregroundColor": {
						"opaqueColor": {
							"themeColor": "DARK2"
						}
					},
					"bold": false,
					"italic": false,
					"fontSize": {
						"magnitude": 18,
						"unit": "PT"
					},
					"baselineOffset": "NONE",
					"smallCaps": false,
					"strikethrough": false,
					"underline": false,
					"weightedFontFamily": {
						"fontFamily": "Arial",
						"weight": 400
					}
				},
				"textRange": {
					"type": "ALL"
				},
				"fields": "foregroundColor.opaqueColor.themeColor,bold,italic,fontSize.magnitude,fontSize.unit,baselineOffset,smallCaps,strikethrough,underline,weightedFontFamily.fontFamily,weightedFontFamily.weight"
			}
		},
		{
			"updateShapeProperties": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"shapeProperties": {
					"shapeBackgroundFill": {
						"propertyState": "NOT_RENDERED",
						"solidFill": {
							"color": {
								"rgbColor": {
									"red": 1,
									"green": 1,
									"blue": 1
								}
							},
							"alpha": 1
						}
					},
					"outline": {
						"outlineFill": {
							"solidFill": {
								"color": {
									"rgbColor": {}
								},
								"alpha": 1
							}
						},
						"weight": {
							"magnitude": 9525,
							"unit": "EMU"
						},
						"dashStyle": "SOLID",
						"propertyState": "NOT_RENDERED"
					},
					"contentAlignment": "TOP"
				},
				"fields": "shapeBackgroundFill.propertyState,shapeBackgroundFill.solidFill.color.rgbColor.red,shapeBackgroundFill.solidFill.color.rgbColor.green,shapeBackgroundFill.solidFill.color.rgbColor.blue,shapeBackgroundFill.solidFill.alpha,outline.outlineFill.solidFill.alpha,outline.weight.magnitude,outline.weight.unit,outline.dashStyle,outline.propertyState,contentAlignment"
			}
		},
		{
			"createShape": {
				"objectId": "3b7dfe47-934f-43c3-ba36-90e496d6e9de",
				"elementProperties": {
					"pageObjectId": "b86b616b-14b0-4aac-bbe1-0755a44fb649",
					"size": {
						"width": {
							"magnitude": 500,
							"unit": "PT"
						},
						"height": {
							"magnitude": 40,
							"unit": "PT"
						}
					}
				},
				"shapeType": "TEXT_BOX"
			}
		},
		{
			"insertText": {
				"objectId": "3b7dfe47-934f-43c3-ba36-90e496d6e9de",
				"text": "Page: 2"
			}
		},
		{
			"insertText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"text": "TEXT_BOX",
				"insertionIndex": 0
			}
		},
		{
			"deleteText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"textRange": {
					"type": "ALL"
				}
			}
		},
		{
			"insertText": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"text": "Introduction"
			}
		},
		{
			"updateParagraphStyle": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"style": {
					"lineSpacing": 100,
					"alignment": "START",
					"indentStart": {
						"unit": "PT"
					},
					"indentEnd": {
						"unit": "PT"
					},
					"spaceAbove": {
						"unit": "PT"
					},
					"spaceBelow": {
						"unit": "PT"
					},
					"indentFirstLine": {
						"unit": "PT"
					},
					"direction": "LEFT_TO_RIGHT",
					"spacingMode": "NEVER_COLLAPSE"
				},
				"textRange": {
					"startIndex": 0,
					"endIndex": 12,
					"type": "FIXED_RANGE"
				},
				"fields": "lineSpacing,alignment,indentStart.unit,indentEnd.unit,spaceAbove.unit,spaceBelow.unit,indentFirstLine.unit,direction,spacingMode"
			}
		},
		{
			"updateTextStyle": {
				"objectId": "5143ff34-db51-4f4f-927c-717b8b11ac94",
				"style": {
					"backgroundColor": {},
					"foregroundColor": {
						"opaqueColor": {
							"themeColor": "DARK1"
						}
					},
					"bold": false,
					"italic": false,
					"fontSize": {
						"magnitude": 28,
						"unit": "PT"
					},
					"baselineOffset": "NONE",
					"smallCaps": false,
					"strikethrough": false,
					"underline": false,
					"weightedFontFamily": {
						"fontFamily": "Arial",
						"weight": 400
					}
				},
				"textRange": {
					"startIndex": 0,
					"endIndex": 12,
					"type": "FIXED_RANGE"
				},
				"fields": "foregroundColor.opaqueColor.themeColor,bold,italic,fontSize.magnitude,fontSize.unit,baselineOffset,smallCaps,strikethrough,underline,weightedFontFamily.fontFamily,weightedFontFamily.weight"
			}
		},
		{
			"insertText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"text": "TEXT_BOX",
				"insertionIndex": 0
			}
		},
		{
			"deleteText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"textRange": {
					"type": "ALL"
				}
			}
		},
		{
			"insertText": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"text": "Communication takes place over time."
			}
		},
		{
			"updateParagraphStyle": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"style": {
					"lineSpacing": 115,
					"alignment": "START",
					"indentStart": {
						"unit": "PT",
						"magnitude": 36
					},
					"indentEnd": {
						"unit": "PT"
					},
					"spaceAbove": {
						"unit": "PT"
					},
					"spaceBelow": {
						"magnitude": 16,
						"unit": "PT"
					},
					"indentFirstLine": {
						"unit": "PT",
						"magnitude": 18
					},
					"direction": "LEFT_TO_RIGHT",
					"spacingMode": "COLLAPSE_LISTS"
				},
				"textRange": {
					"startIndex": 0,
					"endIndex": 36,
					"type": "FIXED_RANGE"
				},
				"fields": "lineSpacing,alignment,indentStart.unit,indentStart.magnitude,indentEnd.unit,spaceAbove.unit,spaceBelow.magnitude,spaceBelow.unit,indentFirstLine.unit,indentFirstLine.magnitude,direction,spacingMode"
			}
		},
		{
			"updateTextStyle": {
				"objectId": "6cef77e7-f123-48d1-bf6d-b068d8309e7c",
				"style": {
					"underline": false,
					"backgroundColor": {},
					"foregroundColor": {
						"opaqueColor": {
							"themeColor": "DARK2"
						}
					},
					"bold": false,
					"italic": false,
					"fontSize": {
						"magnitude": 18,
						"unit": "PT"
					},
					"baselineOffset": "NONE",
					"smallCaps": false,
					"strikethrough": false,
					"weightedFontFamily": {
						"fontFamily": "Arial",
						"weight": 400
					}
				},
				"textRange": {
					"startIndex": 0,
					"endIndex": 36,
					"type": "FIXED_RANGE"
				},
				"fields": "underline,foregroundColor.opaqueColor.themeColor,bold,italic,fontSize.magnitude,fontSize.unit,baselineOffset,smallCaps,strikethrough,weightedFontFamily.fontFamily,weightedFontFamily.weight"
			}
		},
		{
			"deleteText": {
				"objectId": "3b7dfe47-934f-43c3-ba36-90e496d6e9de",
				"textRange": {
					"type": "ALL"
				}
			}
		},
		{
			"insertText": {
				"objectId": "3b7dfe47-934f-43c3-ba36-90e496d6e9de",
				"text": "Page 2 readability: 72.23, engagement: 0, grammatical: 100, semantic: 100, importantWords: 100, similarity: 22.67, "
			}
		}
	];

	return gapi.client.slides.presentations.batchUpdate({
		presentationId: "1H1yHtJcQ5lzkfFkPpc85qvb97d2OIKmPS60ZhbFP4mE",
		requests: requests
	}).then((createSlideResponse) => {
		return true;
	});
}


async function replaceParagraph(slidePageID, objectID, paragraphIndex, _text) {
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

									if(numParagraphs-1 == paragraphIndex) lastParagraphFlag = true;

									console.log(paragraphIndex);
									console.log(slideDB[slidePageID][objectID]);
									console.log(updates);
								}

								console.log(lastParagraphFlag);

								var r = [{
									insertText: {
										"objectId": objectID,
										"text": _text + (lastParagraphFlag ? "" : "\n"),
										"insertionIndex": (lastParagraphFlag ? (startIndex == 0 ? 0 : startIndex) : startIndex)
										}
								}]

								return removeRangeInObj(slidePageID, objectID, {
									startIndex: (lastParagraphFlag? (startIndex == 0 ? 0 : startIndex) : startIndex),
									endIndex: endIndex + (lastParagraphFlag? -1 : 0)
								}, r)
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
async function removeParagraph(slidePageID, objectID, paragraphIndex, removeHighlightFlag, __requests) {
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

									if(numParagraphs-1 == paragraphIndex) lastParagraphFlag = true;

									console.log(paragraphIndex);

									for(var l=paragraphIndex;l<numParagraphs-1;l++) {
										updates['/users/' + userName + '/slideInfo/' + slidePageID + '/' + objectID+ '/' + l] = slideDB[slidePageID][objectID][l+1];

										slideDB[slidePageID][objectID][l] = slideDB[slidePageID][objectID][l+1];
									}

									updates['/users/' + userName + '/slideInfo/' + slidePageID+ '/' + objectID+ '/' + (numParagraphs-1)] = {
										mappingID: null
									}

									slideDB[slidePageID][objectID].splice(numParagraphs-1, 1)

									console.log(slideDB[slidePageID][objectID]);
									console.log(updates);

									firebase.database().ref().update(updates);
								}

								if (removeHighlightFlag) {
									if (mappingKey) {
										var myPageNumber = null;

										for (var pageNumber in highlightDB.mapping) {
											if (mappingKey in highlightDB.mapping[pageNumber]) {
												myPageNumber = pageNumber;
												break;
											}
										}

										if (myPageNumber != null) {
											removeMappingOnPdfjs(pageNumber, mappingKey, false).then(result => {
												issueEvent("root_mappingRemoved2", {
													mappingID: result
												});
											});
										}
									}
								}

								return removeRangeInObj(slidePageID, objectID, {
									startIndex: (lastParagraphFlag? (startIndex == 0 ? 0 : startIndex-1) : startIndex),
									endIndex: endIndex + (lastParagraphFlag? -1 : 0)
								}, __requests)
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

   console.log(requests);

   if(request != null) requests = requests.concat(request);

   return await gapi.client.slides.presentations.batchUpdate({
     presentationId: PRESENTATION_ID,
     requests: requests
   }).then((createSlideResponse) => {
	   return true;
   });
}
async function removeRangeInObj(slidePageID, objectID, range, __requests) {
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

   if(__requests != null) requests = requests.concat(__requests);

   console.log(requests);

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

function moveParagraphBetweenObj(slidePageID, srcObjID, dstObjID, srcParagraphIndex, dstParagraphIndex) {
	console.log(srcObjID, srcParagraphIndex);
	console.log(dstObjID, dstParagraphIndex);

    gapi.client.slides.presentations.get({
	presentationId: PRESENTATION_ID
    }).then(function(response) {
		var presentation = response.result;
		var length = presentation.slides.length;
	
		console.log(response);
		// slideDB = {};

		var srcText = null, dstText = null;
		var srcStartIndex, srcEndIndex, dstStartIndex, dstEndIndex;
		var srcEndFlag = false, dstEndFlag = false;
	
		for (i = 0; i < length; i++) {
			var slide = presentation.slides[i];

			var slideID = slide.objectId;

			if (slideID == slidePageID) {
				for (var j = 0; j < slide.pageElements.length; j++) {
					var slideItem = slide.pageElements[j];

					console.log(slideItem.objectId, srcObjID, dstObjID);

					if (slideItem.objectId == srcObjID) {
						var curParagraphIndex = -1, startIndex = -1, endIndex = -1;

						for (var k = 0; k < slideItem.shape.text.textElements.length; k++) {
							var textElem = slideItem.shape.text.textElements[k];

							if (textElem.endIndex != endIndex) {
								curParagraphIndex++;

								if ("startIndex" in textElem) startIndex = textElem.startIndex;
								else startIndex = 0;

								endIndex = textElem.endIndex;
							}

							if ("textRun" in textElem && curParagraphIndex == srcParagraphIndex) {
								srcText = textElem.textRun.content;
								srcStartIndex = startIndex;
								srcEndIndex = endIndex;
							}
						}

						if (curParagraphIndex < srcParagraphIndex) {
							srcStartIndex = endIndex - 1;
							srcEndFlag = true;
						}
					}

					if (slideItem.objectId == dstObjID) {
						var curParagraphIndex = -1, startIndex = -1, endIndex = -1;

						for (var k = 0; k < slideItem.shape.text.textElements.length; k++) {
							var textElem = slideItem.shape.text.textElements[k];

							if (textElem.endIndex != endIndex) {
								curParagraphIndex++;

								if ("startIndex" in textElem) startIndex = textElem.startIndex;
								else startIndex = 0;

								endIndex = textElem.endIndex;
							}

							if ("textRun" in textElem && curParagraphIndex == dstParagraphIndex) {
								dstText = textElem.textRun.content;
								dstStartIndex = startIndex;
								dstEndIndex = endIndex;
							}
						}

						if (curParagraphIndex < dstParagraphIndex) {
							dstStartIndex = endIndex - 1;
							dstEndFlag = true;
						}
					}
				}

				break;
			}
		}

		console.log(srcText, srcStartIndex, srcEndIndex, srcEndFlag);
		console.log(dstText, dstStartIndex, dstEndIndex, dstEndFlag);

		var requests;

		requests = [{
			insertText: {
				"objectId": dstObjID,
				"text": (dstEndFlag ? '\n' + srcText.trim() : srcText),
				"insertionIndex": dstStartIndex
			}
		}, {
			deleteText: {
				"objectId": srcObjID,
				"textRange": {
					"startIndex": (!srcEndFlag ? (srcStartIndex == 0 ? 0 : srcStartIndex - 1) : srcStartIndex),
					"endIndex": (!srcEndFlag ? (srcStartIndex == 0 ? srcEndIndex : srcEndIndex - 1) : srcEndIndex),
					"type": "FIXED_RANGE"
				}
			}
		}];

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: requests
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});
			// slideDB[slideID] = slideObjId;
    }, function(response) {
		console.log(response);
		//appendPre('Error: ' + response.result.error.message);
   	}).catch(function(er) {
		console.log("WHAT?");
		console.log(er);
    });
}

function moveParagraphWithinObj(slidePageID, objectID, srcParagraphIndex, dstParagraphIndex) {
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
	$("#loadingPlane").show();
/*
	$("#loadingSlidePlane").show();
	$("#slidePlaneCanvas").css("background-color", "rgb(0, 0, 0, 0.3)");
*/
	// setTimeout(function() { hideLoadingSlidePlane(); }, 5000);
}

function hideLoadingSlidePlane() {
	/*
	$("#loadingSlidePlane").hide();
	$("#slidePlaneCanvas").css("background-color", "transparent");
	*/

	$("#loadingPlane").hide();
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
	console.log(JSON.parse(JSON.stringify(docSlideStructure)));

	for(var i=1;i<docSlideStructure.length;i++) {
		var sectionKey = docSlideStructure[i].contents.sectionKey;

		if(!(sectionKey in info)) info[sectionKey] = [];

		info[sectionKey] = info[sectionKey].concat(docSlideStructure[i].contents.list.slice(1))
	}

	return info;

	/*
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

	*/

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
	if(!(pageID in slideDB)) return [];

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
	readData('/').then(result => {
		for(var s in result.referenceSlides) {
			slideDeckInfo[s] = result.referenceSlides[s].slides;

			$("#slideDeckListDiv").append(getSlideBody(s, result.referenceSlides[s].slides));
		}

		referenceLayout = result.referenceLayout;
		referenceStyle = result.referenceStyle;

		console.log(referenceLayout);
		console.log(referenceStyle);
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

/*
function getSlideThumbnail(slide) {
	return "<div class='slideThumbnailDiv'>" + 
				"<img class='slideThumbnailImage' src='" + slide.thumbnailURL + "'> </img>" +
			"</div>"
}
*/

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
				"<div class='slideItem' presentationID='" + presentationID + "' slideID='" + slideDeckInfo[presentationID][i].slideID + "'>" +
				"<img class='slideItemThumbnail' src='" + slideDeckInfo[presentationID][i].thumbnailURL + "'> </img>" +
				"</div>";
		}
	}

	$("#slideListDivBody").html(slideListDivHTML);
}

function showIndividualSlides(presentationID) {
	var slideListDivHTML = '';

	for(var i=0;i<slideDeckInfo[presentationID].length;i++) {
		slideListDivHTML = slideListDivHTML + 
			"<div class='slideItem' presentationID='" + presentationID + "' slideID='" + slideDeckInfo[presentationID][i].slideID + "'>" +
			"<img class='slideItemThumbnail' src='" + slideDeckInfo[presentationID][i].thumbnailURL + "'> </img>" +
			"</div>";
	}

	$("#slideListDiv").html(slideListDivHTML);
}

async function showTextShorteningView(slideIndex, resourceIndex) {
	var originalText = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

	var shortening = await getShortening(originalText);

	console.log(shortening);

	var curSlideIndex = parseInt($("#textShorteningViewAlternativeTextDiv").attr("slideindex"));
	var curResourceIndex = parseInt($("#textShorteningViewAlternativeTextDiv").attr("resourceindex"));

	if(curSlideIndex == slideIndex && curResourceIndex == resourceIndex) {
		var shorteningHtml = '';

		for(var i=0;i<shortening.result.shortenings.length;i++) {
			shorteningHtml += '<tr class="textShorteningViewAlternativeTextItem">' + 
								'<td>' + 
									shortening.result.shortenings[i].text +
								'</td>' + 
							'</tr>';
		}

		$("#textShorteningViewAlternativeTextDiv").html(
			"<table id='textShorteningViewAlternativeTable'> " +
				shorteningHtml + 
			"</table>"
		)
	}
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
	var queryString = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

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

	fetch(API_URL+'findQueriess', requestOptions)
		.then(response => response.json())
		.then(data => function(s, r, d) {
			console.log(s);
			console.log(r);
			console.log(d);

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
	var objectID = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID;
	var mappingKey = docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey;

	console.log(slideID, objectID);
	console.log(resourceIndex);
	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].contents.list)));

	if((resourceIndex > 0 && docSlideStructure[slideIndex].contents.list[resourceIndex-1].currentContent.type == "text") || 
	   (resourceIndex < (docSlideStructure[slideIndex].contents.list.length-1) && docSlideStructure[slideIndex].contents.list[resourceIndex+1].currentContent.type == "text")) {
		   var objToPut = -1;

		if(resourceIndex > 0 && docSlideStructure[slideIndex].contents.list[resourceIndex-1].currentContent.type == "text")  {
			// append to the back
			objToPut = docSlideStructure[slideIndex].contents.list[resourceIndex - 1].currentContent.objID;

			var requests = [];
			var updates = {};

			if (deletionFlag) {
				var curObjID = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID;

				requests.push({
					"deleteObject": {
						"objectId": curObjID,
					},
				});

				updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objectID + '/'] = null;
				delete slideDB[slideID][objectID]
			}

			var ret = await getAppendTextRequest(slideID, objToPut,
				docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents);

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

			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = objToPut;
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type = "text";
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

			updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;

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
			objToPut = docSlideStructure[slideIndex].contents.list[resourceIndex+1].currentContent.objID;

			var requests = [];
			var updates = {};

			if (deletionFlag) {
				var curObjID = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID;

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
					text: docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents + '\n',
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

			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = objToPut;
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type = "text";
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

			updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;

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
					docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents);

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

				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = newObjID;
				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type = "text";
				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

				updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;
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
						text: docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents,
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

				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = newObjID;
				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type = "text";
				docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

				updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;
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
	var indexes = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageIndex;
	var originalText = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

	for(var i=indexes.length-1;i>=0;i--) {
		var p = indexes[i];

		originalText = originalText.substr(0, p[1]) + "</span>" + originalText.substr(p[1])
		originalText = originalText.substr(0, p[0]) + "<span class='imageViewQueryHighlight'>" + originalText.substr(p[0])
	}

	return originalText;
}

function getQueryKeywordsForImage(slideIndex, resourceIndex) {
	var keywords = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords;
	var retValue = '';

	for(var i=0;i<keywords.length;i++) {
		retValue = retValue + '<span index="' + i + '" class="imageViewQueryKeywordItem ' + (keywords[i].selected ? "keywordSelected" : "") + '">' + keywords[i].keyword + '</span>';
	}

	retValue += "<button id='imageQueryKeywordAddBtn'> + </button>"

	return retValue;
}

function getSearchResult(slideIndex, resourceIndex) {
	var keywords = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords;
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

	console.log(queryStatement);

	if(queryStatement.length <= 0) {
		$("#imageViewResultDiv").html("No keyword has been identified. Please add keywords.");
	}
	else {
		fetch(API_URL + 'getImages', requestOptions)
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
}

async function showImageSelectionView(slideIndex, resourceIndex) {
	var queryString = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
		),
	};

	var res = await postRequest(API_URL+'findQueriess', 
		{
			text: queryString,
		}
	)

	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageIndex = res.index;
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords = []

	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex])));

	for (var j = 0; j < res.surfaceWords.length; j++) {
		docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords.push({
			keyword: res.surfaceWords[j],
			selected: true
		})
	}

	var q = getVisualHighlightForImage(slideIndex, resourceIndex);
	$("#imageViewOriginalSentence").html(q);

	var k = getQueryKeywordsForImage(slideIndex, resourceIndex);
	$("#imageViewQueryKeywordDiv").html(k);

	getSearchResult(slideIndex, resourceIndex);

	/*
	fetch(API_URL+'findQueriess', requestOptions)
		.then(response => response.json())
		.then(data => function(s, r, d) {
			console.log(s);
			console.log(r);
			console.log(d);

			var rowObj = $(".adaptationTableRow[slideindex='" + s + "'][resourceindex='" + r + "']")

			console.log(rowObj);

			substituteTextToFigure(s, r, d).then(res => {
			//	removeSingleRowOnDocSlideStructure(s, r);

				$(rowObj).removeClass("onLoading");
			})

		}(slideIndex, resourceIndex, data)

		);
		*/
		/*
	var q = getVisualHighlightForImage(slideIndex, resourceIndex);
	$("#imageViewOriginalSentence").html(q);

	var k = getQueryKeywordsForImage(slideIndex, resourceIndex);
	$("#imageViewQueryKeywordDiv").html(k);

	getSearchResult(slideIndex, resourceIndex);
	*/
}

function closeImageSelectionView() {
	$("#imageView").hide();
}

async function constructRequestForSlideDeckAdaptation(presentationId, flag) {
	var userSlideInfo = await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID 
	});
	
	var result = userSlideInfo.result;

	var retValue = {};

	retValue.userPresentation = result;
	retValue.presentationId = presentationId;
	retValue.settings = {
		fast: true,
		contentControl: false,
		method: "greedy",
		debug: false,
		putOriginalContent: true,
		adaptLayout: flag.layout,
		adaptStyles: flag.style
	}

	retValue.resources = {};

	retValue.resources.title = {
		"shortenings": [
			{
				"text": "Sketching Informal Presentations",
				"score": {
					"grammatical": 1,
					"semantic": 0,
					"importantWords": 0.8469365983028845
				}
			}
		],
		// "id": "temp"
	};
	retValue.resources.sections = [];
	var labels = {};

	for(var i=0;i<docSlideStructure.length;i++) {
		for(var k in docSlideStructure[i].layout.mapping) {
			labels[docSlideStructure[i].layout.mapping[k]] = k;
		}
	}

	retValue.labels = labels;

	for(var i=0;i<docSlideStructure.length;i++) {
		var sectionItem = {};

		sectionItem.header = {
			"shortenings": [
				{
					"text": docSlideStructure[i].contents.list[0].currentContent.contents,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				}
			],
			"singleWord": {
					"text": docSlideStructure[i].contents.list[0].currentContent.contents,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				},
			"phrases": [
				{
					"text": docSlideStructure[i].contents.list[0].currentContent.contents,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				},
			],
			// "id": "temp"
		};

		sectionItem.body = [];

		for(var j=1;j<docSlideStructure[i].contents.list.length;j++) {
			if(docSlideStructure[i].contents.list[j].currentContent.type == "image") {
				sectionItem.body.push({
					paragraph: {
						shortenings: [{
							text: "",
							score: {
								"grammatical": 0,
								"semantic": 0,
								"importantWords": 0
							}
						}],
						"singleWord": {
							text: "",
							score: {
								"grammatical": 0,
								"semantic": 0,
								"importantWords": 0
							}
						},
						"phrases": [
							{
								text: "",
								score: {
									"grammatical": 0,
									"semantic": 0,
									"importantWords": 0
								}
							}
						],
					},
					id: (docSlideStructure[i].contents.list[j].mappingKey == "null" ? makeid(20) : docSlideStructure[i].contents.list[j].mappingKey),
					images: [
						{
							url: docSlideStructure[i].contents.list[j].currentContent.contents
						}
					],
					"format": "image",
					"type": docSlideStructure[i].contents.list[j].currentContent.label
				})
			}
			else {
				sectionItem.body.push({
					paragraph: {
						shortenings: [{
							text: docSlideStructure[i].contents.list[j].currentContent.contents,
							score: {
								"grammatical": 1,
								"semantic": 1,
								"importantWords": 1
							}
						}],
						"singleWord": {
							text: docSlideStructure[i].contents.list[j].currentContent.contents,
							score: {
								"grammatical": 1,
								"semantic": 1,
								"importantWords": 1
							}
						},
						"phrases": [
							{
								text: docSlideStructure[i].contents.list[j].currentContent.contents,
								score: {
									"grammatical": 1,
									"semantic": 1,
									"importantWords": 1
								}
							}
						],
						'id': (docSlideStructure[i].contents.list[j].mappingKey == "null" ? makeid(20): docSlideStructure[i].contents.list[j].mappingKey),
						"format": "text",
						"type": docSlideStructure[i].contents.list[j].currentContent.label
					}
				})
			}
		}

		retValue.resources.sections.push(sectionItem);
	}

	/*
	for(var sectionKey in info) {
		var sectionItem = {};

		sectionItem.header = {
			"shortenings": [
				{
					"text": structureHighlightDB[sectionKey].text,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				}
			],
			"singleWord": {
					"text": structureHighlightDB[sectionKey].text,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				},
			"phrases": [
				{
					"text": structureHighlightDB[sectionKey].text,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				},
			],
			// "id": "temp"
		};

		sectionItem.body = [];

		for(var i=0;i<info[sectionKey].length;i++) {
			sectionItem.body.push({
				paragraph: {
					shortenings: [{
						text: info[sectionKey][i].originalContent.contents,
						score: {
							"grammatical": 1,
							"semantic": 1,
							"importantWords": 1
						}
					}],
					"singleWord": {
						text: info[sectionKey][i].originalContent.contents,
						score: {
							"grammatical": 1,
							"semantic": 1,
							"importantWords": 1
						}
					},
					"phrases": [
						{
							text: info[sectionKey][i].originalContent.contents,
							score: {
								"grammatical": 1,
								"semantic": 1,
								"importantWords": 1
							}
						}
					],
					'id': (info[sectionKey][i].mappingKey == "null" ? null : info[sectionKey][i].mappingKey)
				}
			})
		}
		
		retValue.resources.sections.push(sectionItem);
	}
	*/

	console.log(retValue);
	console.log(JSON.stringify(retValue));

	return retValue;
}

async function getRequestsForRemovingAllObjectsOnPage(presentationID, slideID) {
	return await gapi.client.slides.presentations.get({
		presentationId: presentationID
	}).then(function (response) {
		console.log(response);
		var slides = response.result.slides;

		initialSlideCnt = slides.length;
		removedSlideCnt = 0;

		var requests = [];
		var retValue = [];

		for (var i = 0; i < slides.length; i++) {
			var pageID = slides[i].objectId;

			if(pageID == slideID) {
				for(var j=0;j<slides[i].pageElements.length;j++) {
					var objID = slides[i].pageElements[j].objectId;

					retValue.push(objID);
				}
			}
		}

		return retValue;
	}).catch(function (err) {
	})
}
async function getRequestsForRemovingAllSlidesOnGoogleSlide(presentationID) {
	return await gapi.client.slides.presentations.get({
		presentationId: presentationID
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

		return requests;
	}).catch(function (err) {
	})
}

function genSlideThumbnail(presentationID) {
	var slide = presentationID;

	gapi.client.slides.presentations.get({
		presentationId: slide,
	}).then(function (response) {
		console.log(response);

		var s = response.result.slides;

		global_count = 0;
		num_slides_in_total = s.length;
		adaptedSlideURLs = {};

		console.log(num_slides_in_total);

		for (var j = 0; j < s.length; j++) {
			var s_id = s[j].objectId;

			console.log(s_id);

			gapi.client.slides.presentations.pages.getThumbnail({
				presentationId: slide,
				pageObjectId: s_id
			}).then((function (my_index, my_s_id) {
				return async function (response) {
					console.log(response);
					console.log(response.result.contentUrl);

					const requestOptions = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							url: response.result.contentUrl
						}),
					};

					var blob = await fetch(API_URL+"get_image_file", requestOptions)
						.then(response => response.blob())
						.then(data => {
							return data;
						});

					// console.log(blob);

					/*
					adaptedSlideURLs[my_index] = {
						slideID: my_s_id,
						thumbnailURL: response.result.contentUrl
					}

					global_count++;

					if (global_count >= num_slides_in_total) {
						showAdaptedSlidesOnCompareDivResult();
					}
					*/
					// setTimeout(() => {  fetch(response.result.contentUrl).then(res => res.blob()).then(blob => { console.log(blob); }) }, 10000);

					// Here's where you get access to the blob
					// And you can use it for whatever you want
					// Like calling ref().put(blob)

					// Here, I use it to make an image appear on the page
					console.log(blob);

					const ref = firebase.storage().ref("/adapted/" + slide);

					ref.child(my_index + "___" + my_s_id + ".png").put(blob).then(function (obj) {
						obj.ref.getDownloadURL().then(u => {
							console.log(u);

							var updates = {};

							updates['/adaptedSlides/' + slide + '/slides/' + my_index] = {
								slideID: my_s_id,
								thumbnailURL: u
							}

							global_count++;
							adaptedSlideURLs[my_index] = {
								slideID: my_s_id,
								thumbnailURL: u
							}

							firebase.database().ref().update(updates);

							console.log(global_count, num_slides_in_total);

							if (global_count >= num_slides_in_total) {
								showAdaptedSlidesOnCompareDivResult();
							}
						})
					});
				}
			})(j, s_id)
			);
		}
	});

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

function genAlternativeThumbnail(presentationID, slideList, docSlideIndex, subject) {
	var slide = presentationID;

	gapi.client.slides.presentations.get({
		presentationId: slide,
	}).then(function (response) {
		console.log(response);

		var s = response.result.slides;

		global_count = 0;
		num_slides_in_total = slideList.length;
		adaptedSlideURLs = {};

		docSlideStructure[docSlideIndex][subject].result = [];

		console.log(num_slides_in_total);
		console.log(slideList);

		for (var j = 0; j < s.length; j++) {
			var s_id = s[j].objectId;

			console.log(s_id);

			var flag = false;
			var obj = null;

			for(var k=0;k<slideList.length;k++) {
				if(slideList[k].requestInstance.pageId == s_id) {
					flag = true;
					obj = slideList[k];
					break;
				}
			}

			if(!flag) continue;

			gapi.client.slides.presentations.pages.getThumbnail({
				presentationId: slide,
				pageObjectId: s_id
			}).then((function (my_index, my_s_id, my_obj) {
				return async function (response) {
					console.log(response);
					console.log(response.result.contentUrl);

					const requestOptions = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							url: response.result.contentUrl
						}),
					};

					var blob = await fetch(API_URL+"get_image_file", requestOptions)
						.then(response => response.blob())
						.then(data => {
							return data;
						});

					// console.log(blob);

					const ref = firebase.storage().ref("/alternatives/" + docSlideIndex);

					ref.child(my_index + "___" + my_s_id + ".png").put(blob).then(function (obj) {
						obj.ref.getDownloadURL().then(u => {
							console.log(u);

							docSlideStructure[docSlideIndex][subject].result.push({
								url: u,
								requests: my_obj.requestInstance.requests,
								mapping: my_obj.mappingInstance,
								matching: my_obj.matchingInstance,
							});

							console.log(docSlideStructure[docSlideIndex][subject].result.length,  num_slides_in_total); 

							if (docSlideStructure[docSlideIndex][subject].result.length >= num_slides_in_total) {
								console.log(docSlideIndex);
								console.log(curDocSlideStructureIndex);
								console.log(docSlideStructure[docSlideIndex][subject]);

								docSlideStructure[docSlideIndex][subject].loaded = true;

								if(docSlideIndex == curDocSlideStructureIndex) {
									showAlternative(docSlideIndex, subject);
								}
							}
						})
					});
				}
			})(j, s_id, obj)
			);
		}
	});

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

function showAlternative(index, subject) {
	console.log(index);
	console.log(docSlideStructure[index]);

	var obj = null;

	if(subject == "layoutAlternative") obj = $("#slideListDivBodyLayout");
	else obj = $("#slideListDivBodyStyle");

	$(obj).attr("slideid", docSlideStructure[index].slide.id);

	var h = '';

	if (docSlideStructure[index][subject].result.length > 0) {
		for (var i = 0; i < docSlideStructure[index][subject].result.length; i++) {
			var flag = false;

			for (var k in docSlideStructure[index][subject].result[i].mapping) {
				if (docSlideStructure[index][subject].result[i].mapping[k].wasMatched == false) {
					flag = true;
					break;
				}
			}
			h = h + "<img class='" + subject + " alternativeThumbnail " + (flag ? "disabled" : "") + "' docslideindex='" + index + "' subject='" + subject + "' index='" + i + "' src='" + docSlideStructure[index][subject].result[i].url + "'></img>"
		}
	}
	else {
		h = "...Now Loading";
	}

	$(obj).html(h);
}

function getIndexOfSlide(slideID) {
	for(var i=0;i<docSlideStructure.length;i++) {
		if("slide" in docSlideStructure[i] && docSlideStructure[i].slide.id == slideID)
			return i;
	}

	return -1;
}
function updateSlide(slideID) {
	var slideIndex = getIndexOfSlide(slideID);

	console.log(slideIndex);

	updateDocSlideStructure(slideIndex);

	var refPresentationID = referenceSlideID;
	var refSlideID = docSlideStructure[slideIndex].template.id;

	console.log(refPresentationID, refSlideID);

	adaptSingleSlide(slideID, refPresentationID, refSlideID);
}

function showLoadingScreenOnCompareDivResult() {
	$("#slideDeckCompareDivResultSlidesList").html("on loading");
}

function showAdaptedSlidesOnCompareDivResult() {
	var bodyHTML = '';

	for (var i = 0; i < num_slides_in_total; i++) {
		var s = adaptedSlideURLs[i];
		bodyHTML = bodyHTML + getSlideThumbnail(s);
	}

	$("#slideDeckCompareDivResultSlidesList").html(bodyHTML);
}

function constructRequestForSingleSlideAdaptation(presentationID, slideID, targetSlideID) {
	var retValue = {};
	var curSlideIndex = getIndexOfSlide(targetSlideID);

	retValue.presentationId = presentationID;
	retValue.sourcePageId = slideID;
	retValue.targetPageId = targetSlideID
	retValue.pageNum = 0

	retValue.resources = {};

	var h = {
		"shortenings": [
			{
				"text": "SECTION_TITLE_HERE",
				"score": {
					"grammatical": 1,
					"semantic": 1,
					"importantWords": 1
				}
			}
		],
		"singleWord": {
			"text": "SECTION_TITLE_HERE",
			"score": {
				"grammatical": 1,
				"semantic": 0,
				"importantWords": 1
			}
		},
		"phrases": [],
		"id": null
	};

	var b = [];
	var resources = docSlideStructure[curSlideIndex].contents.list;

	for (var i = 0; i < resources.length; i++) {
		if (resources[i].mappingKey != "null") {
			var shorteningResult = findShortening(resources[i].mappingKey);

			var obj = {
				"paragraph": shorteningResult.result
			}

			b.push(obj);
		}
	}

	retValue.resources.header = h;
	retValue.resources.body = b;

	return retValue;
}

function getLayoutForAdaptation(m_body) {
	var retValue = {};

	retValue.boxes = [];
	retValue.mapping = {};
	retValue.pageSize = m_body.pageSize;
	retValue.slideID = m_body.layoutPageId;
	retValue.thumbnailURL = '';

	var cnt = {};

	for (var obj in m_body.pageElements) {
		var b = m_body.pageElements[obj].box;

		var label = b.type;
		var objID = b.objectId;
		var e = 0;

		m_body.pageElements[obj].box.type = label;

		retValue.mapping[label] = objID;

		retValue.boxes.push({
			height: b.height,
			left: b.left,
			objectId: objID,
			top: b.top,
			type: label,
			width: b.width
		})
	}

	return retValue;
}

function updateMappingInternal(slideID, m_body, pushFlag) {
	console.log(docSlideStructure);
	console.log(slideID);
	console.log(m_body);

	slideDB[slideID] = {};

	var obj = {};

	if(!pushFlag) {
		var slideIndex = getIndexOfSlide(slideID);
		
		obj = docSlideStructure[slideIndex]

		obj.type = "visible";
		obj.contents = {
			sectionKey: '',
			list: []
		};
		obj.layout = getLayoutForAdaptation(m_body);
		obj.style = {
			... getStyle(referenceSlideID, m_body.stylesPageId)
		}
		obj.slide = {
			id: slideID,
			objs: []
		}
	}
	else obj = {
		type: "visible",
		contents: {
			sectionKey: '',
			list: []
		},
		layout: getLayoutForAdaptation(m_body),
		style: {
			... getStyle(referenceSlideID, m_body.stylesPageId)
		},
		slide: {
			id: slideID,
			objs: []
		},
		layoutAlternative: {
								loaded: false,
								loadStarted: false,
								result: []
		},
		styleAlternative: {
								loaded: false,
								loadStarted: false,
								result: []
		},
	};
	/*
{
			type: "hidden",
			contents: {
				sectionKey: sectionKey,
				list: [{
					mappingKey: "null",
					originalContent: {
						type: "text",
						contents: structureHighlightDB[sectionKey].text,
					},
					currentContent: {
						type: "text",
						contents: structureHighlightDB[sectionKey].text,
						objID: titleID,
						boxIndex: 0,
					},
				},
				{
					mappingKey: mapping.key,
					originalContent: {
						type: "text",
						contents: mapping.text,
					},
					currentContent: {
						type: "text",
						contents: mapping.text,
						objID: bodyID,
						boxIndex: 1,
					},
				}]
			},
			layout: {
				index: 1,
			},
			style: {
				index: 0,
			},
			slide: {
				id: slideID,
				objs: [{
					id: titleID
					},
					{
						id: bodyID
					}
				]
			}
		}
		*/
	for (var objID in m_body.pageElements) {
		slideDB[slideID][objID] = [];

		for (var j = 0; j < m_body.pageElements[objID].contents.length; j++) {
			if(m_body.pageElements[objID].box.type.startsWith("PICTURE")) {
				obj.contents.list.push({
					currentContent: {
						type: "image",
						label: m_body.pageElements[objID].box.type,
						contents: m_body.pageElements[objID].contents[0].url,
					},
					mappingKey: m_body.pageElements[objID].contents[0].contentId,
					originalContent: {
						type: "image",
						contents: m_body.pageElements[objID].contents[0].url
					}
				})

				slideDB[slideID][objID] = [{
					mappingID: m_body.pageElements[objID].contents[0].contentId
				}]
			}
			else {
				var textKey = m_body.pageElements[objID].contents[j].contentId;

				if (textKey != null && textKey.startsWith('-')) {
					obj.contents.list.push({
						currentContent: {
							type: "text",
							label: m_body.pageElements[objID].box.type,
							contents: m_body.pageElements[objID].contents[j].text,
						},
						mappingKey: textKey,
						originalContent: {
							type: "text",
							contents: getOriginalText(textKey)
						}
					})

					slideDB[slideID][objID].push({
						mappingID: textKey
					})
				}
				else {
					obj.contents.list.push({
						currentContent: {
							type: "text",
							label: m_body.pageElements[objID].box.type,
							contents: m_body.pageElements[objID].contents[j].text,
						},
						mappingKey: "null",
						originalContent: {
							type: "text",
							contents: ''
						}
					})

					slideDB[slideID][objID].push({
						mappingID: "null" 
					})
				}
			}
/*
			var label = m_body.pageElements[objID].box.type;
			var layoutID = m_body.layoutPageId;
			var boxIndex = -1;

			for(var k=0;k<referenceLayout[referenceSlideID][layoutID].boxes.length;k++) {
				if(referenceLayout[referenceSlideID][layoutID].boxes[k].type == label) {
					boxIndex = k;
					break;
				}
			}

			if (textKey != null && !m_body.pageElements[objID].contents[j].isOriginalContent) {
				slideDB[slideID][objID].push({
					mappingID: textKey
				})

				obj.contents.list.push({
					currentContent: {
						type: "text",
						objID: objID,
						contents: m_body.pageElements[objID].contents[j].text,
						rect: m_body.pageElements[objID].box,
						boxIndex: boxIndex
					},
					mappingKey: textKey,
					originalContent: {
						type: "text",
						contents: getOriginalText(textKey)
					}
				})
			}
			else {
				slideDB[slideID][objID].push({
					mappingID: "null"
				})

				obj.contents.list.push({
					currentContent: {
						type: "text",
						objID: objID,
						contents: m_body.pageElements[objID].contents[j].text,
						rect: m_body.pageElements[objID].box,
						boxIndex: boxIndex
					},
					mappingKey: "null",
					originalContent: {
						type: "text",
						contents: m_body.pageElements[objID].contents[j].text,
					}
				})
			}
			*/
		}
	}

	if(pushFlag) docSlideStructure.push(obj);
	else {
		var slideIndex = getIndexOfSlide(slideID);
		
		docSlideStructure[slideIndex] = obj;
	}

	// DB Sync

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

async function adaptSingleSlide(curSlidePage, presentationID, slideID) {
	var slideIndex = getIndexOfSlide(curSlidePage);
	var req = constructRequestForSingleSlideAdaptation(presentationID, slideID, curSlidePage);

	console.log(JSON.parse(JSON.stringify(docSlideStructure)));
	console.log(req);

	var result = await getSingleSlideAdaptationRequest(req);

	var requests = result.requests;

	if(curSlidePage in slideDB) {
		for(var obj in slideDB[curSlidePage]) {
			requests = requests.concat(
			[{
				"deleteObject": {
					"objectId": obj,
				},
			}])
		}
	}

	console.log(requests);

	var mapping = result.matching;
	var newSlideID = curSlidePage

	console.log(mapping);

	updateMappingInternal(newSlideID, mapping, false);

	console.log(docSlideStructure);
	console.log(slideDB);

	firebase.database().ref("/users/" + userName + '/docSlideStructure/' + slideIndex).set(docSlideStructure[slideIndex]);
	firebase.database().ref("/users/" + userName + '/slideInfo/' + newSlideID).set(slideDB[newSlideID]);

	updateDocSlideStructure(slideIndex);

	gapi.client.slides.presentations.batchUpdate({
		presentationId: PRESENTATION_ID,
		requests: requests
	}).then((createSlideResponse) => {
		console.log(createSlideResponse);
	});
}

async function getSingleSlideAdaptationRequest(input) {
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	};

	var res = await fetch(API_URL+'generate_slide_requests', requestOptions)
		.then(response => response.json())
		.then(data => {
			return data;
		});

	return res;
}

function selectSlideDeck(presentationID){
	setDocSlideStructure(docSlideStructure);
}

function getOriginalText(key) {
	for (var pgNumber in highlightDB.mapping) {
		if (key in highlightDB.mapping[pgNumber]) {
			return highlightDB.mapping[pgNumber][key].text;
		}
	}
}

function getInsertPosition(dsIndex) {
	var cur = 0;

	for(var i=0;i<dsIndex;i++) {
		var obj = docSlideStructure[i];

		if(obj.type == "visible")
			cur++;
	}

	return cur;
}

function hideReviewSlide() {
	$("#reviewFinishBtn").hide();
	$("#reviewCancelBtn").hide();
	$("#reviewSlide").hide();
}

function showReviewSlide() {
	/*
	curDocSlideStructureIndex = index;
	constructReviewSlide(index);

	$(".objectIndicator").remove();
	$(".filmstripIndicator").remove();
	$(".mappingIndicator").remove();

	$("#reviewFinishBtn").show();
	$("#reviewCancelBtn").show();
	$("#reviewSlide").show();
	*/

	$("#reviewFinishBtn").show();
	$("#reviewCancelBtn").show();
	$("#reviewSlide").show();
}

function constructReviewSlide(index) {
	$("#reviewSlide").html('');

	console.log(index);
	console.log(docSlideStructure);

	var layoutObj = referenceLayout[referenceSlideID][docSlideStructure[index].layout.index];
	var styleObj = referenceStyle[referenceSlideID][docSlideStructure[index].style.index];

	console.log(layoutObj);
	console.log(styleObj);

	for(var i=0;i<layoutObj.boxes.length;i++) {
		var boxObj = layoutObj.boxes[i];

		var reviewSlideWidth = $("#reviewSlide").width();
		var reviewSlideHeight = $("#reviewSlide").height();

		var top = boxObj.top / layoutObj.height * reviewSlideHeight;
		var left = boxObj.left / layoutObj.width * reviewSlideWidth;
		var height = boxObj.height/ layoutObj.height * reviewSlideHeight;
		var width = boxObj.width / layoutObj.width * reviewSlideWidth;

		var thisStyle = (boxObj.type in styleObj ? styleObj[boxObj.type] : {});

		$("#reviewSlide").append("<div class='reviewSlideObj' index='" + i + "'" + 
										"style='top: " + top + "; " +
											   "left: " + left + "; " +
											   "height: " + height + "; " +
											   "width: " + width + "; " + 
											   (() => {var s=''; for(var k in thisStyle) s += (k + ':' + thisStyle[k] + ';'); return s;})() +
											   
											   "'>" +
											   "</div>");
	}

	var layout = referenceLayout[referenceSlideID][parseInt(docSlideStructure[index].layout.index)];

	console.log(layout);
	console.log(docSlideStructure[index]);

	for(var i=0;i<docSlideStructure[index].contents.list.length;i++) {
		var item = docSlideStructure[index].contents.list[i];

		console.log(item.currentContent.boxIndex);

		appendTextToBox(item.currentContent.contents, item.currentContent.boxIndex);
	}
}
/*
function locateSlide(slideID, reviewFlag) {
	issueEvent("root_locateSlide", {
		slideID: slideID,
		reviewFlag: reviewFlag
	});
}
*/

function locateSlide(slideID) {
	issueEvent("root_locateSlide", {
		slideID: slideID,
	});
}

function locateSlideDirectly(slideID) {
	issueEvent("root_locateSlideDirectly", {
		slideID: slideID,
	});
}

function appendTextToBox(contents, boxIndex) {
	var boxObj = $(".reviewSlideObj[index='" + boxIndex + "']");

	$(boxObj).append("<div>" + contents + "</div>");
}

function constructRequestForStyleAlternatives(index) {
	var r = {};

	r.presentationId = referenceSlideID;
	r.sort = true;
	r.maxCnt = 10;
	r.layoutPageId = docSlideStructure[index].layout.slideId;
	r.stylesPageId = null;

	r.settings = {
		putOriginalContent: false,
		fast: true,
		contentControl: false,
		debug: false
	};

	r.resources = {};

	r.resources.header = {
		"shortenings": [
			{
				"text": docSlideStructure[index].contents.list[0].currentContent.contents,
				"score": {
					"grammatical": 1,
					"semantic": 1,
					"importantWords": 1
				}
			}
		],
		"singleWord": {
			"text": docSlideStructure[index].contents.list[0].currentContent.contents,
			"score": {
				"grammatical": 1,
				"semantic": 1,
				"importantWords": 1
			}
		},
		"phrases": [],
		"images": [],
		"type": "TEXT"
	};

	r.resources.body = []

	for(var i=1;i<docSlideStructure[index].contents.list.length;i++) {
		console.log(docSlideStructure[index].contents.list[i].currentContent.contents)
		r.resources.body.push(
			{
                "paragraph": {
                    "shortenings": [
                        {
                            "text": docSlideStructure[index].contents.list[i].currentContent.contents,
                            "score": {
                                "grammatical": 1,
                                "semantic": 1,
                                "importantWords": 1
                            }
                        },
                        {
                            "text": docSlideStructure[index].contents.list[i].currentContent.contents,
                            "score": {
                                "grammatical": 1,
                                "semantic": 1,
                                "importantWords": 1
                            }
                        }
                    ],
                    "singleWord": {
						"text": docSlideStructure[index].contents.list[i].currentContent.contents,
						"score": {
							"grammatical": 1,
							"semantic": 1,
							"importantWords": 1
						}
					},
                    "phrases": [],
                    "id": (docSlideStructure[index].contents.list[i].mappingKey == "null" ? null : docSlideStructure[index].contents.list[i].mappingKey)
                }
            },	
		)
	}

	return r;
}

async function constructRequestForLayoutStyleAlternatives(index, subject, defaultFlag) {
	var r = {};

	var response = await gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
	})

	console.log(response);
	var labels = {};

	for (var k in docSlideStructure[index].layout.mapping) {
		labels[docSlideStructure[index].layout.mapping[k]] = k;
	}

	var r = {
		userPresentation: response.result,
		pageId: curSlidePage,
		labels: labels
	}

	console.log(r);

	var res = await postRequest(
		API_URL + "get_data_single_slide", r);

	console.log(JSON.parse(JSON.stringify(res)));

	for (var i = 0; i < res.layout.boxes.length; i++) {
		var boxObjID = res.layout.boxes[i].originalId;

		for (var k in docSlideStructure[index].layout.mapping) {
			if (docSlideStructure[index].layout.mapping[k] == boxObjID) {
				res.layout.boxes[i].type = k;
			}
		}
	}

	var layout = res.layout;
	var styles = res.styles;

	console.log(JSON.parse(JSON.stringify(docSlideStructure[index])));
	console.log(res);

	r.presentationId = (defaultFlag ? DEFAULT_SLIDE_ID : referenceSlideID);
	r.sort = true;
	r.maxCnt = 10;
// 	r.layoutPageId = (subject == "layoutAlternative" ? null : docSlideStructure[index].layout.slideID);
//  r.stylesPageId = (subject == "styleAlternative" ? null : docSlideStructure[index].style.slideID);

	r.settings = {
		putOriginalContent: false,
		fast: true,
		contentControl: false,
		debug: false
	};

	r.resources = {};

	r.resources.header = {
		"shortenings": [
			{
				"text": docSlideStructure[index].contents.list[0].currentContent.contents,
				"score": {
					"grammatical": 1,
					"semantic": 1,
					"importantWords": 1
				}
			}
		],
		"singleWord": {
			"text": docSlideStructure[index].contents.list[0].currentContent.contents,
			"score": {
				"grammatical": 1,
				"semantic": 1,
				"importantWords": 1
			}
		},
		"phrases": [],
		"images": [],
		"type": "TEXT"
	};

	r.resources.body = []

	for(var i=1;i<docSlideStructure[index].contents.list.length;i++) {
		r.resources.body.push(
			{
                "paragraph": {
                    "shortenings": [
                        {
                            "text": docSlideStructure[index].contents.list[i].currentContent.contents,
                            "score": {
                                "grammatical": 1,
                                "semantic": 1,
                                "importantWords": 1
                            }
                        },
                        {
                            "text": docSlideStructure[index].contents.list[i].currentContent.contents,
                            "score": {
                                "grammatical": 1,
                                "semantic": 1,
                                "importantWords": 1
                            }
                        }
                    ],
                    "singleWord": {
						"text": docSlideStructure[index].contents.list[i].currentContent.contents,
						"score": {
							"grammatical": 1,
							"semantic": 1,
							"importantWords": 1
						}
					},
                    "phrases": [],
                    "id": (docSlideStructure[index].contents.list[i].mappingKey == "null" ? null : docSlideStructure[index].contents.list[i].mappingKey)
                }
            },	
		)
	}

	r.layout = (subject == "layoutAlternative" ? null : layout);
	r.styles = (subject == "styleAlternative" ? null : styles);

	return r;
/*
	gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
	}).then(async function (response) {
		var retValue = {};

		retValue.userPresentation = response.result;
		retValue.presentationId = referenceSlideID;
		retValue.sort = true;
		retValue.maxCnt = 40;
		retValue.userPageId = null;
		retValue.styles = {
			"styles": {
				"HEADER_0": {
					"type": "HEADER_0",
					"objectId": docSlideStructure[index].layout.mapping["HEADER_0"],
					"originalContents": [],
					"fontSize": 39,
					"fontFamily": "Arial",
					"foregroundColor": {
						"rgbColor": {
							"red": 0,
							"green": 0,
							"blue": 0
						}
					},
					"bold": false,
					"italic": false,
					"strikethrough": false,
					"underline": false,
					"textAlign": "center",
					"prefix": "none",
					"lineHeight": 100,
					"spaceAbove": 0,
					"spaceBelow": 0,
					"recommendedLength": 25
				},
				"BODY_0": {
					"type": "BODY_0",
					"objectId": docSlideStructure[index].layout.mapping["BODY_0"],
					"originalContents": [],
					"fontSize": 21,
					"fontFamily": "Arial",
					"foregroundColor": {
						"rgbColor": {
							"red": 0.34901962,
							"green": 0.34901962,
							"blue": 0.34901962
						}
					},
					"bold": false,
					"italic": false,
					"strikethrough": false,
					"underline": false,
					"textAlign": "center",
					"prefix": "none",
					"lineHeight": 100,
					"spaceAbove": 0,
					"spaceBelow": 0,
					"recommendedLength": 12
				}
			}
		};

		retValue.resources = {};

		retValue.resources.header = {
			"shortenings": [
				{
					"text": docSlideStructure[index].contents.list[0].currentContent.contents,
					"score": {
						"grammatical": 1,
						"semantic": 1,
						"importantWords": 1
					}
				}
			],
			"singleWord": {
				"text": docSlideStructure[index].contents.list[0].currentContent.contents,
				"score": {
					"grammatical": 1,
					"semantic": 1,
					"importantWords": 1
				}
			},
			"phrases": [],
			"images": [],
			"type": "TEXT"
		};

		retValue.resources.body = []

		for (var i = 1; i < docSlideStructure[index].contents.list.length; i++) {
			console.log(docSlideStructure[index].contents.list[i].currentContent.contents)
			retValue.resources.body.push(
				{
					"paragraph": {
						"shortenings": [
							{
								"text": docSlideStructure[index].contents.list[i].currentContent.contents,
								"score": {
									"grammatical": 1,
									"semantic": 1,
									"importantWords": 1
								}
							},
							{
								"text": docSlideStructure[index].contents.list[i].currentContent.contents,
								"score": {
									"grammatical": 1,
									"semantic": 1,
									"importantWords": 1
								}
							}
						],
						"singleWord": {
							"text": docSlideStructure[index].contents.list[i].currentContent.contents,
							"score": {
								"grammatical": 1,
								"semantic": 1,
								"importantWords": 1
							}
						},
						"phrases": [],
						"id": (docSlideStructure[index].contents.list[i].mappingKey == "null" ? null : docSlideStructure[index].contents.list[i].mappingKey)
					}
				},
			)
		}

		retValue.settings = {
			"fast": true,
			"contentControl": false,
			"debug": false,
			"putOriginalContent": false
		}

		console.log(retValue);
		
		console.log(JSON.stringify(retValue));
		var res1 = await postRequest(
			API_URL+"generate_duplicate_alternatives_requests", retValue);

		console.log(res1);
	});
	*/

	return r;
}

async function getAlternativeSlides(index, subject) {
	console.log(docSlideStructure);
	console.log(index);

	if(subject in docSlideStructure[index]) {
		if (!docSlideStructure[index][subject].loaded && !docSlideStructure[index][subject].loadStarted) {
			docSlideStructure[index][subject].loadStarted = true;

			if (subject == "layoutAlternative")
				$("#slideListDivBodyLayout").html("... Now Loading ");
			else
				$("#slideListDivBodyStyle").html("... Now Loading ");

			var slideList = [];
			var req = [];

			console.log(DEFAULT_SLIDE_ID, referenceSlideID);

			var r = await constructRequestForLayoutStyleAlternatives(index, subject, false);

			console.log(r);
			console.log(JSON.stringify(r));

			var res1 = await postRequest(
				API_URL + "generate_alternatives_requests_explicit", r);

			console.log(JSON.parse(JSON.stringify(res1)));

			for (var i = 0; i < res1.requestsList.length; i++) slideList.push({
				requestInstance: res1.requestsList[i],
				matchingInstance: res1.matchings[i],
				mappingInstance: res1.mappings[i]
			});

			for (var i = 0; i < res1.requestsList.length; i++) {
				req = req.concat(res1.requestsList[i].requests);
			}

			if (req != null && req.length > 0) {
				gapi.client.slides.presentations.batchUpdate({
					presentationId: (subject == "layoutAlternative" ? LAYOUT_SLIDE_ID : STYLE_SLIDE_ID),
					requests: req
				}).then((createSlideResponse) => {
					console.log(createSlideResponse);

					genAlternativeThumbnail((subject == "layoutAlternative" ? LAYOUT_SLIDE_ID : STYLE_SLIDE_ID), slideList, index, subject);
				});
			}
			else {
				$("#slideListDivBodyLayout").html("No results");
			}
		}
		else {
			showAlternative(index, subject);
		}
	}
/*
	if(!("styleAlternatives" in docSlideStructure[index])) {
		$("#slideListDivBodyLayout").html("... Now Loading ");

		docSlideStructure[index].styleAlternative = [];

		var r = constructRequestForStyleAlternatives(index);

		console.log(r);

		var res = await postRequest(
			API_URL+"generate_alternatives_requests", r);

		console.log(res);

		var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(TEMP_PRESENTATION_ID);

		req = req.concat(res.requests);

		gapi.client.slides.presentations.batchUpdate({
			presentationId: TEMP_PRESENTATION_ID,
			requests: req
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);

			genAlternativeThumbnail(TEMP_PRESENTATION_ID, index, "styleAlternative");
		});
	}
	*/
}

async function moveItemToDifferentSlide(slideIndex, resourceIndex, targetSlideID) {
	var slideID = docSlideStructure[slideIndex].slide.id;

	var targetSlideIndex = getIndexOfSlide(targetSlideID);

	var sourceItem = docSlideStructure[slideIndex].contents.list[resourceIndex];

	var label = sourceItem.currentContent.label;
	var targetLabel = docSlideStructure[targetSlideIndex].contents.list[docSlideStructure[targetSlideIndex].contents.list.length-1].currentContent.label;

	var sourceObjID = docSlideStructure[slideIndex].layout.mapping[label];
	var destObjID = docSlideStructure[targetSlideIndex].layout.mapping[targetLabel];

	console.log(slideIndex, resourceIndex);
	console.log(label, targetLabel);
	console.log(targetSlideIndex);
	console.log(sourceObjID, destObjID);

	var before_paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);
	var after_paragraphIndex = getParagraphIndexOfDocSlideStructure(targetSlideIndex, docSlideStructure[targetSlideIndex].contents.list.length-1) + 1;

	console.log(before_paragraphIndex, after_paragraphIndex);
	console.log(targetSlideID, destObjID);

	/*
	if (slideID in slideDB && sourceObjID in slideDB[slideID] && slideDB[slideID][sourceObjID].length > before_paragraphIndex) {
		console.log(JSON.parse(JSON.stringify(slideDB)));

		slideDB[slideID][sourceObjID].splice(before_paragraphIndex, 1);

		console.log(JSON.parse(JSON.stringify(slideDB)));
	}
	*/

	if (!(targetSlideID in slideDB)) slideDB[targetSlideID] = {};
	if (!(destObjID in slideDB[targetSlideID])) slideDB[targetSlideID][destObjID] = [];

	while(slideDB[targetSlideID][destObjID].length <= after_paragraphIndex) {
		slideDB[targetSlideID][destObjID].push({mappingID: "null"});
	}

	slideDB[targetSlideID][destObjID][after_paragraphIndex].mappingID = sourceItem.mappingKey;

	console.log(before_paragraphIndex);

	var ret = await getAppendTextRequest(targetSlideID, destObjID, sourceItem.currentContent.contents);

	removeParagraph(slideID, sourceObjID, before_paragraphIndex, false, ret.request);

	/*
	var mappingKey = docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey;

	console.log(slideID, objectID);
	console.log(resourceIndex);
	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].contents.list)));
	console.log(mappingKey);

	var destinationObjID = docSlideStructure[slideIndex].layout.mapping[targetLabel];
	var objToPut = destinationObjID;

	// append to the back
	var requests = [];
	var updates = {};

	var ret = await getAppendTextRequest(slideID, objToPut,
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents);

	requests = requests.concat(ret.request);

	var paragraphIndex = ret.paragraphIndex + 1;

	if (!(objToPut in slideDB[slideID])) slideDB[slideID][objToPut] = [];

	while(slideDB[slideID][objToPut].length <= paragraphIndex) {
		slideDB[slideID][objToPut].push({mappingID: "null"});
	}

	slideDB[slideID][objToPut][paragraphIndex] = {
		mappingID: mappingKey
	};

	updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut + '/' + paragraphIndex] = {
		mappingID: mappingKey
	};

	console.log(slideDB[slideID][objToPut]);

	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = objToPut;
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label = targetLabel;

	await removeParagraph(slideID, objectID, before_paragraphIndex, false, requests);

	updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;

	firebase.database().ref().update(updates);

	*/
}

async function moveItemToIndex(slideIndex, resourceIndex, targetSlideIndex, targetResourceIndex, beforeAfter) {
	var slideID = docSlideStructure[slideIndex].slide.id;

	var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
	var targetLabel = docSlideStructure[targetSlideIndex].contents.list[targetResourceIndex].currentContent.label;

	var sourceObjID = docSlideStructure[slideIndex].layout.mapping[label];
	var destObjID = docSlideStructure[targetSlideIndex].layout.mapping[targetLabel];

	console.log(slideIndex, resourceIndex);
	console.log(targetSlideIndex, targetResourceIndex);

	var before_paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);
	var after_paragraphIndex = getParagraphIndexOfDocSlideStructure(targetSlideIndex, targetResourceIndex);

	console.log(before_paragraphIndex, after_paragraphIndex);

	if(sourceObjID == destObjID) { // within the same obj
		moveParagraphWithinObj(slideID, sourceObjID, before_paragraphIndex, after_paragraphIndex + (targetResourceIndex == beforeAfter ? 0 : 1));

		if(before_paragraphIndex < after_paragraphIndex) {
			var source = slideDB[slideID][sourceObjID][before_paragraphIndex];

			slideDB[slideID][sourceObjID].splice(before_paragraphIndex, 1);
			slideDB[slideID][sourceObjID].splice(after_paragraphIndex + (targetResourceIndex == beforeAfter ? 0 : 1) - 1, 0, source);
		}
		else {
			var source = slideDB[slideID][sourceObjID][before_paragraphIndex];

			slideDB[slideID][sourceObjID].splice(before_paragraphIndex, 1);
			slideDB[slideID][sourceObjID].splice(after_paragraphIndex + (targetResourceIndex == beforeAfter ? 0 : 1), 0, source);
		}
	}
	else {
		var source = slideDB[slideID][sourceObjID][before_paragraphIndex];
		console.log(JSON.parse(JSON.stringify(slideDB)));

		moveParagraphBetweenObj(slideID, sourceObjID, destObjID, before_paragraphIndex, after_paragraphIndex + (targetResourceIndex == beforeAfter ? 0 : 1));

		slideDB[slideID][sourceObjID].splice(before_paragraphIndex, 1);
		slideDB[slideID][destObjID].splice(after_paragraphIndex + (targetResourceIndex == beforeAfter ? 0 : 1), 0, source);

		console.log(JSON.parse(JSON.stringify(slideDB)));
	}

	/*
	var mappingKey = docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey;

	console.log(slideID, objectID);
	console.log(resourceIndex);
	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].contents.list)));
	console.log(mappingKey);

	var destinationObjID = docSlideStructure[slideIndex].layout.mapping[targetLabel];
	var objToPut = destinationObjID;

	// append to the back
	var requests = [];
	var updates = {};

	var ret = await getAppendTextRequest(slideID, objToPut,
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents);

	requests = requests.concat(ret.request);

	var paragraphIndex = ret.paragraphIndex + 1;

	if (!(objToPut in slideDB[slideID])) slideDB[slideID][objToPut] = [];

	while(slideDB[slideID][objToPut].length <= paragraphIndex) {
		slideDB[slideID][objToPut].push({mappingID: "null"});
	}

	slideDB[slideID][objToPut][paragraphIndex] = {
		mappingID: mappingKey
	};

	updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut + '/' + paragraphIndex] = {
		mappingID: mappingKey
	};

	console.log(slideDB[slideID][objToPut]);

	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = objToPut;
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label = targetLabel;

	await removeParagraph(slideID, objectID, before_paragraphIndex, false, requests);

	updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;

	firebase.database().ref().update(updates);

	*/
}

async function moveItem(slideIndex, resourceIndex, targetLabel) {
	var slideID = docSlideStructure[slideIndex].slide.id;
	var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
	var objectID = docSlideStructure[slideIndex].layout.mapping[label];

	var mappingKey = docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey;
	var before_paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);

	console.log(slideID, objectID);
	console.log(resourceIndex);
	console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].contents.list)));
	console.log(mappingKey);

	var destinationObjID = docSlideStructure[slideIndex].layout.mapping[targetLabel];
	var objToPut = destinationObjID;

	// append to the back
	var requests = [];
	var updates = {};

	var ret = await getAppendTextRequest(slideID, objToPut,
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents);

	requests = requests.concat(ret.request);

	var paragraphIndex = ret.paragraphIndex + 1;

	if (!(objToPut in slideDB[slideID])) slideDB[slideID][objToPut] = [];

	while(slideDB[slideID][objToPut].length <= paragraphIndex) {
		slideDB[slideID][objToPut].push({mappingID: "null"});
	}

	slideDB[slideID][objToPut][paragraphIndex] = {
		mappingID: mappingKey
	};

	updates['/users/' + userName + '/slideInfo/' + slideID + '/' + objToPut + '/' + paragraphIndex] = {
		mappingID: mappingKey
	};

	console.log(slideDB[slideID][objToPut]);

	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID = objToPut;
	docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label = targetLabel;

	await removeParagraph(slideID, objectID, before_paragraphIndex, false, requests);

	updates['/users/' + userName + '/docSlideStructure/' + slideIndex + '/resources/' + resourceIndex + '/currentContent'] = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent;

	firebase.database().ref().update(updates);
/*
	gapi.client.slides.presentations.batchUpdate({
		presentationId: PRESENTATION_ID,
		requests: requests
	}).then((createSlideResponse) => {
		console.log(createSlideResponse);
	});
	*/
}

function test() {
	function printFile(fileId) {
		var request = gapi.client.drive.files.get({
		  'fileId': fileId
		});
		request.execute(function(resp) {
		  console.log('Title: ' + resp.title);
		  console.log('Description: ' + resp.description);
		  console.log('MIME type: ' + resp.mimeType);
		});
	  }
	  
	  /**
	   * Download a file's content.
	   *
	   * @param {File} file Drive File instance.
	   * @param {Function} callback Function to call when the request is complete.
	   */
	  function downloadFile(file, callback) {
		if (file.downloadUrl) {
		  var accessToken = gapi.auth.getToken().access_token;
		  var xhr = new XMLHttpRequest();
		  xhr.open('GET', file.downloadUrl);
		  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		  xhr.onload = function() {
			callback(xhr.responseText);
		  };
		  xhr.onerror = function() {
			callback(null);
		  };
		  xhr.send();
		} else {
		  callback(null);
		}
	  }

	function copyFile(originFileId, copyTitle) {
		var body = { 'title': copyTitle };
		var request = gapi.client.drive.files.copy({
			'fileId': originFileId,
			'resource': body
		});
		request.execute(function (resp) {
			console.log('Copy ID: ' + resp.id);
		});
	}

	copyFile("1zVgYIrE3QgRySBa16zuYzG4YAe0nnVOHZhKR4t6CheQ", "hahaha");
}

function hideAlternativeView() {
	currentResourceSelectedFlag = false;

	$(".selectedForAlternative").removeClass("selectedForAlternative");
	$("#alternativeElementView").hide();
}

async function copyCurrentSlide(slideId) {
	/*
	var body = { 'title': copyTitle };
	var request = gapi.client.drive.files.copy({
		'fileId': PRESENTATION_ID,
		'resource': body
	});
	request.execute(function (resp) {
		console.log('Copy ID: ' + resp.id);
	});
	*/

    gapi.client.slides.presentations.get({
		presentationId: PRESENTATION_ID
    }).then(async function(response) {
		console.log(response);

		var r = {
			"userPresentation": response.result,
			"pageId": slideId
		}

		var res = await postRequest(
			API_URL + "get_data_single_slide", r);

		console.log(res);
	});
}

function addBlankMessage(index) {
	outlineStructure[index].messages.push({
		status: "blank",
	});

	updateMessageBox();
}

function addMessage(index, message, mapping) {
	outlineStructure[index].messages.push({
		status: "okay",
		body: message,
		mapping: mapping
	});

	updateMessageBox();
}

function updateMessageBox() {
	var html = '';

	if(selectedOutlineIndex == -1) return;

	for(var i=0;i<outlineStructure[selectedOutlineIndex].messages.length;i++) {
		var msgObj = outlineStructure[selectedOutlineIndex].messages[i];

		console.log(msgObj);

		if(msgObj.status == "okay") {
			var body = outlineStructure[selectedOutlineIndex].messages[i].body;
			var mapping = outlineStructure[selectedOutlineIndex].messages[i].mapping;

			html = html +
				"<div class='outlineMessageElement' index='" + i + "' " +
				(mapping != null ? "mapping='" + mapping + "' " : "") +
				"> " + body + 
				"<button class='outlineMessageElementRemoveBtn outlineMessageElementXBtn' index='" + i + "'> X </button>" + 
				"</div>"
		}
		else if(msgObj.status == "blank") {
			html = html +
				"<div class='outlineMessageElement' index='" + i + "'> " + 
					"<input class='outlineMessageElementInput' index='" + i + "'> </input>" + 
					"<button class='outlineMessageElementSubmitBtn' index='" + i + "'> Confirm </button>" + 
					"<button class='outlineMessageElementRemoveBtn' index='" + i + "'> Cancel </button>" + 
				"</div>"
		}
		else if(msgObj.status == "edit") {
			html = html +
				"<div class='outlineMessageElement' index='" + i + "'> " + 
					"<input class='outlineMessageElementInput' index='" + i + "' value='" + msgObj.body + "'> </input>" + 
					"<button class='outlineMessageElementSubmitBtn' index='" + i + "'> Confirm </button>" + 
					"<button class='outlineMessageElementCancelBtn' index='" + i + "'> Cancel </button>" + 
				"</div>"
		}
	}

	$("#outlineMessageElements").html(html);
}

function getLinearSlidesFromOutline() {
	var returnValue = [];

	for(var i=0;i<outlineStructure.length;i++) {
		returnValue = returnValue.concat(outlineStructure[i].slideIDs);
	}

	return returnValue;
}

function handleOutlineEvent(relX, p) {
	/*
	if(outlineStructure.length > 0 && outlineStructure[outlineStructure.length-1].endX >= relX) {
		// dupliate. 

		$("#outlineSegmentEventLeft").css("border-right",  "0px");
		$("#outlineSegmentEventLeft").css("left", "0px");
		$("#outlineSegmentEventLeft").width(relX);

		$("#outlineSegmentEventLeft").html('');
		$("#outlineSegmentLabelTemp").html('');

		var curHoveredIndex = -1;

		for(var i=0;i<outlineStructure.length;i++) {
			if(outlineStructure[i].startX <= relX && relX <= outlineStructure[i].endX) {
				curHoveredIndex = i;
				break;
			}
		}

		if(curHoveredIndex != -1) {
			var hoveredObj = $(".outlineSegmentElement[index='" + curHoveredIndex + "']");

			if(!$(hoveredObj).hasClass("outlineSegmentHovered") && !$(hoveredObj).hasClass("outlineSegmentElementWaiting")) {
				$(".outlineSegmentHovered").removeClass("outlineSegmentHovered");

				$(hoveredObj).addClass("outlineSegmentHovered");
			}
		}
	}
	else {
		*/
		// if((".outlineSegmentEventLeftWaiting").length > 0) return;

		var len = $(".outlineSegmentEventLeftWaiting").length;
		if(len > 0) return;

		var thisTime = Math.max(Math.min(p, 1), 0) * curPresentationDuration;
		var x = 0;
/*
		if(outlineStructure.length > 0){
			x = outlineStructure[outlineStructure.length-1].endX;
			thisTime = thisTime - outlineStructure[outlineStructure.length-1].endTime;
		} 
		*/

		var thisMin = parseInt(thisTime);
		var thisSec = parseInt((thisTime - parseInt(thisTime)) * 60)

		$("#outlineSegmentEventLeft").css("border-right",  "5px solid #ff7777");

		// $("#outlineSegmentEventLeft").css("left", x + "px");
		$("#outlineSegmentEventLeft").width(relX);

		$("#outlineSegmentEventLeft").prop("duration", thisTime);
		$("#outlineSegmentEventLeft").html(thisMin + ":" + thisSec);

		// $("#outlineSegmentLabelTemp").css("left", x + "px");
		$("#outlineSegmentLabelTemp").width(relX);

		$("#outlineSegmentLabelTemp").html('Create a segment');
	// }
}

function getOutlineLabel(index) {
	if(outlineStructure[index].status == "need_name") {
		return "<input class='outlineLabelInput' index='" + index + "'> </input>" + 
		"<button class='outlineLabelInputBtn' index='" + index + "'> Confirm </button>"
	}
	else {
		return outlineStructure[index].label;
	}
}

function updateOutlineSegments() {
	$("#outlineSegments").html('');

	var htmls = '';
	var labelHtml = '';

	for(var i=0;i<outlineStructure.length;i++) {
		htmls = htmls + 

		"<div class='outlineSegmentElement " + (outlineStructure[i].status == "need_name" ? "outlineSegmentElementWaiting" : "") + "' " + 
			 "index='" + i + "'> " + 
				parseInt(outlineStructure[i].duration) + ":" + parseInt((outlineStructure[i].duration - parseInt(outlineStructure[i].duration)) * 60) + 
				( outlineStructure[i].status == "okay" ? 
			 		"<div class='outlineSegmentElementSlideIndex'>" + 
			 			"Slide " + outlineStructure[i].endSlideIndex + 
					"</div>"
					:
					"" )  + 
		"</div>";

		labelHtml = labelHtml + 

		"<div class='outlineSegmentLabelElement " + (outlineStructure[i].status == "need_name" ? "underWriting" : "") + "' " + 
			"index='" + i + "' > " + 
			getOutlineLabel(i) + 
			"</div>"
	}

	$("#outlineSegments").html(htmls);
	$("#outlineSegmentLabelArray").html(labelHtml);

	for(var i=0;i<outlineStructure.length;i++) {
		// $(".outlineSegmentElement[index='" + i + "']").css("left", outlineStructure[i].startX);
		$(".outlineSegmentElement[index='" + i + "']").width(outlineStructure[i].endX - outlineStructure[i].startX);
		$(".outlineSegmentElement[index='" + i + "']").css("background-color", outlineStructure[i].colorCode);

		$(".outlineSegmentLabelElement[index='" + i + "']").width(outlineStructure[i].endX - outlineStructure[i].startX);
	}

	$("#outlineSegmentEvent").css("left", outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endX);
	$("#outlineSegmentEvent").css("width", $("#outlineSegments").width() - (outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endX) );

	issueEvent("root_highlightSlideThumbnail", {outlineStructure: outlineStructure})

	selectSegment(selectedOutlineIndex);

	$("#outlineSegments").sortable({
		items: $(".outlineSegmentElement"),
		axis: "x",
		tolerance: "pointer",
		distance: 20,
		stop: function(e, ui) {
			console.log(e);
			console.log(ui);

			var startPoint = $(ui.item[0]).attr("index");

			var newOutlineStructure = [];
			var slideIndex = 2;
			var changeFlag = false;

			$("#outlineSegments").children().each(function(i) {
				console.log(i);
				console.log($(this));

				var idx = parseInt($(this).attr("index"));

				if(idx != i) changeFlag = true;

				newOutlineStructure.push(JSON.parse(JSON.stringify(outlineStructure[idx])));

				var lastIdx = newOutlineStructure.length-1;

				newOutlineStructure[lastIdx].startSlideIndex = slideIndex == 2 ? 1 : slideIndex;
				newOutlineStructure[lastIdx].endSlideIndex = slideIndex + newOutlineStructure[lastIdx].slideIDs.length - 1;
				newOutlineStructure[lastIdx].startX = lastIdx == 0 ? 0 : newOutlineStructure[lastIdx-1].endX;
				newOutlineStructure[lastIdx].endX = newOutlineStructure[lastIdx].startX + $("#outlineSegmentDiv").width() * newOutlineStructure[lastIdx].duration / curPresentationDuration;

				slideIndex += newOutlineStructure[lastIdx].slideIDs.length;

				$(this).attr("index", i);
			})

			if(!changeFlag){
				return;
			} 

			showLoadingSlidePlane();

			var startIndex = -1, endIndex = -1;

			for(var i=0;i<outlineStructure.length;i++) {
				if(outlineStructure[i].slideIDs[0] != newOutlineStructure[i].slideIDs[0]) {
					startIndex = i;
					break;
				}
			}

			for(var i=outlineStructure.length-1;i>=0;i--) {
				if(outlineStructure[i].slideIDs[0] != newOutlineStructure[i].slideIDs[0]) {
					endIndex = i;
					break;
				}
			}

			var requests = [];

			console.log(JSON.parse(JSON.stringify(outlineStructure)));
			console.log(JSON.parse(JSON.stringify(newOutlineStructure)));

			console.log(startIndex, endIndex);

			if(startIndex == startPoint) {
				// from start to end
				requests.push({
					updateSlidesPosition: {
						slideObjectIds: outlineStructure[startIndex].slideIDs,
						insertionIndex: outlineStructure[endIndex].endSlideIndex
					}
				});

				waitingOutlineIndex = endIndex;
			}
			else {
				// from end to start
				requests.push({
					updateSlidesPosition: {
						slideObjectIds: outlineStructure[endIndex].slideIDs,
						insertionIndex: startIndex == 0 ? 1 : outlineStructure[startIndex-1].endSlideIndex
					}
				});

				waitingOutlineIndex = startIndex;
			}

			console.log(requests);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});

			outlineStructure = newOutlineStructure;

			updateOutlineSegments();

		}
	})
}

function genColor() {
	let color = "#";

	for (let i = 0; i < 3; i++)
		color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);

	return color;
}

function selectSegment(index, locateFlag) {
	selectedOutlineIndex = index;

	$(".outlineSegmentElement").removeClass("selectedSegment");

	$(".outlineSegmentElement[index='" + index + "']").addClass("selectedSegment");

	if(locateFlag) locateSlideDirectly(outlineStructure[index].slideIDs[0]);

	updateMessageBox();
}

$(document).ready(function() {
	$(document).on("click", ".examplePresentationFoldingBtn", function(e) {
		var idx = parseInt($(this).attr("index"));

		console.log(idx);

		var presentationInstanceObj = $(".examplePresentationInstance[index='" + idx + "']");

		if($(presentationInstanceObj).hasClass("folded")) {
			$(presentationInstanceObj).removeClass("folded").addClass("unfolded");
			$(presentationInstanceObj).find(".examplePresentationSlideThumbnailDiv").removeClass("folded").addClass("unfolded");
			$(presentationInstanceObj).find(".examplePresentationScriptDiv").removeClass("folded").addClass("unfolded");
			$(presentationInstanceObj).find(".examplePresentationFoldingBtn").removeClass("unfold").addClass("fold");
		}
		else {
			$(presentationInstanceObj).removeClass("unfolded").addClass("folded");
			$(presentationInstanceObj).find(".examplePresentationSlideThumbnailDiv").removeClass("unfolded").addClass("folded");
			$(presentationInstanceObj).find(".examplePresentationScriptDiv").removeClass("unfolded").addClass("folded");
			$(presentationInstanceObj).find(".examplePresentationFoldingBtn").removeClass("fold").addClass("unfold");
		}
	})

	$(document).on("click", ".outlineMessageElementRemoveBtn", function(e) {
		var idx = parseInt($(this).attr("index"));

		outlineStructure[selectedOutlineIndex].messages.splice(idx, 1);

		updateMessageBox();
	})

	$(document).on("click", ".outlineMessageElementCancelBtn", function(e) {
		var idx = parseInt($(this).attr("index"));

		outlineStructure[selectedOutlineIndex].messages[idx].status = "okay";

		updateMessageBox();
	})
	
	$(document).on("keydown", function(e) {
		console.log(e);
	})

	$(document).on("click", "#outlineMessageAddBtn", function(e) {
		addBlankMessage(selectedOutlineIndex);
	});

	$(document).on("click", ".outlineSegmentElement", function(e) {
		var idx = parseInt($(e.target).attr("index"));

		selectSegment(idx, true);
	})

	$(document).on("click", ".outlineMessageElement", function(e) {
		console.log(e);

		if ($(e.target).hasClass("outlineMessageElement")) {
			var idx = parseInt($(e.target).attr("index"));

			if (outlineStructure[selectedOutlineIndex].messages[idx].status == "okay") {
				outlineStructure[selectedOutlineIndex].messages[idx].status = "edit";

				updateMessageBox();
			}
		}
	})

	$(document).on("click", ".outlineMessageElementSubmitBtn", function(e) {
		var index = parseInt($(e.target).attr("index"));
		
		var body = $(".outlineMessageElementInput[index='" + index + "']").val();

		outlineStructure[selectedOutlineIndex].messages[index].status = "okay";
		outlineStructure[selectedOutlineIndex].messages[index].body = body;

		updateMessageBox();
	})

	$(document).on("mouseleave", "#outlineSegmentEvent", function(e) {
		$(".outlineSegmentHovered").removeClass("outlineSegmentHovered");
	})
	
	$(document).on("click", ".outlineLabelInputBtn", function(e) {
		var index = parseInt($(e.target).attr("index"));

		var inputLabel = $(".outlineLabelInput[index='" + index + "']").val();

		outlineStructure[index].label = inputLabel;
		outlineStructure[index].status = "ready_slide";

		$(".outlineSegmentElementWaiting").removeClass("outlineSegmentElementWaiting");
		$("#outlineSegmentEventLeft").removeClass("outlineSegmentEventLeftWaiting");

		var slideIndex = -1;

		if(index == 0){
			slideIndex = 1;
			outlineStructure[index].startSlideIndex = 1;
			outlineStructure[index].endSlideIndex = 2;
		} 
		else slideIndex = outlineStructure[index-1].endSlideIndex;

		var requests = [];

		requests.push({
			createSlide: {
				objectId: outlineStructure[index].slideIDs[0],
				insertionIndex: slideIndex,
				slideLayoutReference: {
					predefinedLayout: 'TITLE_AND_BODY'
				},
				/*
				placeholderIdMappings: [{
					objectId: titleObjectID,
					layoutPlaceholder: {
						type: "TITLE",
						index: 0
					}
				}, {
					objectId: bodyObjectID,
					layoutPlaceholder: {
						type: "BODY",
						index: 0
					}
				}
				]*/
			}
		});

		showLoadingSlidePlane();
		waitingOutlineIndex = index;

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: requests
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});

		updateOutlineSegments();
	})

	$(document).on("click", "#outlineSegmentEvent", function(e) {
		$("#outlineSegmentEventLeft").html('');
		$("#outlineSegmentLabelTemp").html('');

		var relX = e.pageX - $(this).offset().left;

		console.log(relX);

		/*
		if(outlineStructure.length > 0 && outlineStructure[outlineStructure.length-1].endX > relX) {
			var hoveredObj = $(".outlineSegmentHovered") // it should be hovered.

			if($(hoveredObj).length <= 0) {
				console.log("*** SOMETHING WENT WRONG ***");
			}
			else {
				var outlineIndex = $(hoveredObj).attr("index");

				console.log(outlineIndex);

				selectSegment(outlineIndex, true);
			}
		}
		else {
			*/
			var curWidth = $("#outlineSegmentEvent").width();
			var curLeft = $("#outlineSegmentEvent").css("left")

			curLeft = parseFloat(curLeft.substr(0, curLeft.length-2));

			var leftValue = parseFloat(String($("#outlineSegmentEvent").css("left")).slice(0, -2))
			var widthValue = $("#outlineSegmentEventLeft").width();
			
			var startX = leftValue;
			var endX = leftValue + widthValue;

			var duration = parseFloat($("#outlineSegmentEventLeft").prop("duration"));
			var slideIndex = outlineStructure.length <= 0 ? -1 : outlineStructure[outlineStructure.length-1].endSlideIndex+1;

			var slideID = makeid(10);

			outlineStructure.push({
				messages: [],
				status: "need_name",
				startX: startX,
				endX: endX,
				duration: duration,
				startSlideID: slideID,
				startSlideIndex: outlineStructure.length <= 0 ? 2 : slideIndex,
				endSlideIndex: outlineStructure.length <= 0 ? 2 : slideIndex,
				slideIDs: [slideID],
				colorCode: genColor(),
				startTime: outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endTime,
				endTime: (outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endTime) + duration
			})

			console.log(outlineStructure);

			$("#outlineSegmentEventLeft").addClass("outlineSegmentEventLeftWaiting");

			updateOutlineSegments();
		// }
	})

	$(document).on("mousemove", "#outlineSegmentEvent", function(e) {
		var relX = e.pageX - $(this).offset().left;
		var relY = e.pageY - $(this).offset().top;

		var totalWidth = $("#outlineSegmentDiv").width();

		relX = Math.max(Math.min(relX, totalWidth), 0);

		var p = relX / totalWidth;

		handleOutlineEvent(relX, p);
	});

	$(document).on("input", "#outlineTimeInput", function(e) {
		var time = parseInt($(e.target).val());

		curPresentationDuration = time;

		$("#outlineSegmentLabelMaxTime").html(curPresentationDuration + " min")

		updateOutlineSegments();
	});

	$(document).on("click", ".slideDeckCompareDivControllerCheckbox", async function(e) {
		var presentationID = $(".checkedSlideDeck").attr("presentationid");

		var segmentationChecked = $("#slideDeckCompareDivControllerSegmentationCheckbox")[0].checked;
		var layoutChecked = $("#slideDeckCompareDivControllerLayoutCheckbox")[0].checked;
		var styleChecked =  $("#slideDeckCompareDivControllerStyleCheckbox")[0].checked

		showLoadingScreenOnCompareDivResult();
		slideDeckAdaptationDivAppear(presentationID);

		var req = await constructRequestForSlideDeckAdaptation(presentationID, {
			segmentation: segmentationChecked,
			layout: layoutChecked,
			style: styleChecked
		});

		console.log(JSON.stringify(req));

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		};

		fetch(API_URL + 'generate_presentation_requests', requestOptions)
			.then(response => response.json())
			.then(async data => {
				console.log(data);

				var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(TEMP_PRESENTATION_ID);

				if (req == null) req = data.requests;
				else req = req.concat(data.requests);

				slide_deck_adaptation_req = data.requests;
				slide_deck_matching = data.matchings;

				console.log(slide_deck_matching);
				gapi.client.slides.presentations.batchUpdate({
					presentationId: TEMP_PRESENTATION_ID,
					requests: req
				}).then((createSlideResponse) => {
					console.log(createSlideResponse);

					genSlideThumbnail(TEMP_PRESENTATION_ID);
				});

				return data;
			});
	});

	$(document).on("click", ".resourceRemoveBtn", function(e) {
		var t = $(e.target);

		for(var i=0;i<100;i++) {
			if($(t).hasClass("adaptationTableResourceBody")) break;

			t = $(t).parent();
		}

		var slideIndex = $(t).attr("slideindex");
		var resourceIndex = $(t).attr("resourceindex");

		var slideID = docSlideStructure[slideIndex].slide.id;

		var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
		var objID = docSlideStructure[slideIndex].layout.mapping[label];

		var paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);

		if(docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type == "text") {
			console.log(paragraphIndex);
			console.log(JSON.parse(JSON.stringify(docSlideStructure[slideIndex].contents.list)))

			if(paragraphIndex == 0 && docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents == "") return;

			showLoadingSlidePlane();

			removeParagraph(slideID, objID, paragraphIndex, true, null);

			docSlideStructure[slideIndex].contents.list.splice(resourceIndex, 1);
		}
		else {
			showLoadingSlidePlane();

			var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
			var objID = docSlideStructure[slideIndex].layout.mapping[label];

			var req = [];

			req.push({
				"deleteObject": {
					"objectId": objID
				},
			});

			if (docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey != "null") {
				issueEvent("root_mappingRemoved2", {
					mappingID: docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey
				});
			}

			docSlideStructure[slideIndex].contents.list.splice(resourceIndex, 1);
			delete slideDB[slideID][objID];

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: req
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});
		}
	});

	$(document).on("click", "#alternativeRefreshBtn", function(e) {
		console.log($(e.target));

		if ($(".slideRepresentationSwitch").find("input")[0].checked) {
			if ($(".dimensionSelectionSwitch").find("input")[0].checked) current_left_plane = "singleslide_style";
			else current_left_plane = "singleslide_layout";
		}
		else current_left_plane = "slidedeck";

		console.log(current_left_plane);


		if (current_left_plane == 'singleslide_layout') {
			docSlideStructure[curDocSlideStructureIndex].layoutAlternative.loaded = false;
			docSlideStructure[curDocSlideStructureIndex].layoutAlternative.loadStarted = false;

			$("#slideListDivBodyLayout").show();
			$("#slideListDivBodyStyle").hide();

			getAlternativeSlides(curDocSlideStructureIndex, "layoutAlternative");
		}
		else if (current_left_plane == 'singleslide_style') {
			docSlideStructure[curDocSlideStructureIndex].styleAlternative.loaded = false;
			docSlideStructure[curDocSlideStructureIndex].styleAlternative.loadStarted = false;

			$("#slideListDivBodyLayout").hide();
			$("#slideListDivBodyStyle").show();

			getAlternativeSlides(curDocSlideStructureIndex, "styleAlternative");
		}
	})

	$(document).on("extension_getDocSlideStructure", function(e) {
		issueEvent("root_getDocSlideStructure", docSlideStructure);
	});

	$(document).on("extension_thumbnailSelected", function(e) {
		/*
		hideReviewSlide();

		var slideIndex = getIndexOfSlide(curSlidePage);

		visualizeSlideObjects();
		showDocSlideView(slideIndex);
		*/
	});

	$(document).on("extension_reviewSelected", function(e) {
		var slideID = e.detail.slideID;
		var rect = e.detail.pageRect;

		console.log(slideID);

		var index = parseInt($(".adaptationViewDiv[slideID='" + slideID + "']").attr("index"));

		console.log(index);
		console.log(docSlideStructure[index]);

		curDocSlideStructureIndex = index;

		showReviewSlide(index);
		// updateDocSlideStructure(index);
		showDocSlideView(index);
	})

	$(document).on("click", ".alternativeThumbnail", async function(e) {
		var t = $(e.target);
		
		var docslideindex = parseInt($(t).attr("docslideindex"));
		var index = parseInt($(t).attr("index"));

		showLoadingSlidePlane();

		var response = await gapi.client.slides.presentations.get({
			presentationId: PRESENTATION_ID
		})

		console.log(response);
		var labels = {};

		for(var k in docSlideStructure[docslideindex].layout.mapping) {
			labels[docSlideStructure[docslideindex].layout.mapping[k]] = k;
		}

		var r = {
			userPresentation: response.result,
			pageId: curSlidePage,
			labels: labels
		}

		console.log(r);

		var res = await postRequest(
			API_URL + "get_data_single_slide", r);

		console.log(JSON.parse(JSON.stringify(res)));

		for(var i=0;i<res.layout.boxes.length;i++) {
			var boxObjID = res.layout.boxes[i].originalId;

			for(var k in docSlideStructure[docslideindex].layout.mapping) {
				if(docSlideStructure[docslideindex].layout.mapping[k] == boxObjID) {
					res.layout.boxes[i].type = k;
				}
			}
		}

		console.log(JSON.parse(JSON.stringify(docSlideStructure[docslideindex])));
		console.log(res);

		var r2 = {
			presentationId: PRESENTATION_ID,
			targetPageId: curSlidePage,
			layout: res.layout,
			styles: res.styles,
			pageNum: 1,
			resources: {},
			settings: {
				fast: false,
				contentControl: false,
				debug: false,
				putOriginalContent: true
			}
		}

		console.log(r2);
		console.log(JSON.stringify(r2));

		var res2 = await postRequest(
			API_URL + "generate_slide_requests_explicit", r2
		)

		console.log(res2);

		/*
		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: res2.requests
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});
		*/


		var subject = $(t).attr("subject");

		console.log(docslideindex, subject, index);

		if (docSlideStructure[docslideindex].type == "visible") {
			docSlideStructure[docslideindex].previousVersion = {};

			docSlideStructure[docslideindex].previousVersion.requests = res2.requests;
			docSlideStructure[docslideindex].previousVersion.matching = res2.matching;
			docSlideStructure[docslideindex].previousVersion.contents = JSON.parse(JSON.stringify(docSlideStructure[docslideindex].contents));
			docSlideStructure[docslideindex].previousVersion.layout = JSON.parse(JSON.stringify(docSlideStructure[docslideindex].layout));
			docSlideStructure[docslideindex].previousVersion.style = JSON.parse(JSON.stringify(docSlideStructure[docslideindex].style));
		}

		var obj = docSlideStructure[docslideindex][subject].result[index];
		var slideid = obj.requests[0].createSlide.objectId;

		console.log(slideid, docSlideStructure[docslideindex].slide.id);

		var req = [];
		var requests = JSON.parse(JSON.stringify(obj.requests).replaceAll(slideid, docSlideStructure[docslideindex].slide.id));

		updateMappingInternal(docSlideStructure[docslideindex].slide.id, obj.matching, false);
		setDocSlideStructure(docSlideStructure);
		showDocSlideView(docslideindex);

		if(subject == "layoutAlternative") {
			docSlideStructure[docslideindex].styleAlternative.loaded = false;
			docSlideStructure[docslideindex].styleAlternative.loadStarted = false;
			docSlideStructure[docslideindex].styleAlternative.result = [];
		}
		else {
			docSlideStructure[docslideindex].layoutAlternative.loaded = false;
			docSlideStructure[docslideindex].layoutAlternative.loadStarted = false;
			docSlideStructure[docslideindex].layoutAlternative.result = [];
		}
		var objIDs = await getRequestsForRemovingAllObjectsOnPage(PRESENTATION_ID, docSlideStructure[docslideindex].slide.id);

		for(var i=0;i<objIDs.length;i++){
			req.push({
				"deleteObject": {
					"objectId": objIDs[i]
				},
			});
		}

		req = req.concat(requests.slice(1));

		console.log(req);

		docSlideStructure[docslideindex].type = "hidden";

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: req
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});
	});

	$(document).on("click", ".imageResultItem", function(e) {
		showLoadingSlidePlane();

		var slideIndex = $("#imageView").attr("slideindex");
		var resourceIndex = $("#imageView").attr("resourceindex");
		var imgSrc = $(e.target).attr("src");

		console.log(slideIndex, resourceIndex, imgSrc);

		if(docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.type == "image") {
			var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
			var objID = docSlideStructure[slideIndex].layout.mapping[label];

			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = imgSrc;

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
		}
		else {
			substituteTextToFigure(slideIndex, resourceIndex, imgSrc);
		}
		/*
		var objID = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.objID;

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
		*/
	})

	$(document).on("click", ".imageViewQueryKeywordItem", function(e) {
		var slideIndex = parseInt($("#imageView").attr("slideindex"));
		var resourceIndex = parseInt($("#imageView").attr("resourceindex"));
		var keywordIndex = parseInt($(e.target).attr("index"));

		console.log(slideIndex, resourceIndex, keywordIndex);

		var target = e.target;

		if($(target).hasClass("keywordSelected")) {
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords[keywordIndex].selected = false;
			$(target).removeClass("keywordSelected");
		}
		else {
			docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.imageKeywords[keywordIndex].selected = true;
			$(target).addClass("keywordSelected");
		}
	});

	$(document).on("click", "#imageViewQuerySubmitBtn", function(e) {
		var slideIndex = parseInt($("#imageView").attr("slideindex"));
		var resourceIndex = parseInt($("#imageView").attr("resourceindex"));

		// firebase.database().ref("/users/" + userName + '/docSlideStructure/' + slideIndex + "/resources/" + resourceIndex + "/currentContent/contents/keywords/").set(docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents.keywords);

		getSearchResult(slideIndex, resourceIndex);
	})

	$(document).on("click", "#imageViewCloseBtn", function(e) {
		closeImageSelectionView();
	})

	$(document).on("change", ".adaptationTableLabelSelector", function(e) {
		showLoadingSlidePlane();

		console.log(e.target);

		var parent = $(e.target).parent().parent();

		var slideIndex = parseInt($(parent).attr("slideIndex"));
		var resourceIndex = parseInt($(parent).attr("resourceIndex"));
		var selectedIndex = $(e.target)[0].selectedIndex; // 0: text, 1: image

		var layoutTypes = getLayoutTypes(slideIndex);

		console.log(layoutTypes);

		var type = layoutTypes[selectedIndex].type;

		var destinationObjID = docSlideStructure[slideIndex].layout.mapping[type];

		console.log(slideIndex, resourceIndex, selectedIndex, type);
		console.log(destinationObjID)

		moveItem(slideIndex, resourceIndex, type);

/*
		if(docSlideStructure[slideIndex].type == "hidden") {

		}
		else {
			// showLoadingAdaptationRow(slideIndex, resourceIndex);
			showLoadingSlidePlane();

			if (selectedIndex == 0) { // changed to text
				handleChangeText(slideIndex, resourceIndex, true);
			}
			else { // changed to image
				handleChangeImage(slideIndex, resourceIndex);
			}
		}
		*/
	})

	$(document).on("change", ".adaptationTableTypeSelector", function(e) {
		console.log(e.target);

		var parent = $(e.target).parent().parent();

		var slideIndex = parseInt($(parent).attr("slideIndex"));
		var resourceIndex = parseInt($(parent).attr("resourceIndex"));
		var selectedIndex = $(e.target)[0].selectedIndex; // 0: text, 1: image

		if(docSlideStructure[slideIndex].type == "hidden") {

		}
		else {
			// showLoadingAdaptationRow(slideIndex, resourceIndex);
			showLoadingSlidePlane();

			if (selectedIndex == 0) { // changed to text
				handleChangeText(slideIndex, resourceIndex, true);
			}
			else { // changed to image
				handleChangeImage(slideIndex, resourceIndex);
			}
		}
	})

	$(document).on("click", ".slideItem", async function(e) {
		console.log("clicked");

		var t = e.target;

		console.log(t);

		for(var i=0;i<100;i++) {
			if($(t).hasClass("slideItem")) break;

			t = $(t).parent();
		}

		var presentationID = $(t).attr("presentationid");
		var slideID = $(t).attr("slideid");

		adaptSingleSlide(curSlidePage, presentationID, slideID);
	});

	$(document).on("mouseover", ".styleRow", function(e) {
		console.log("nice");
		console.log(e.target);
	})

	$(document).on("mouseleave", ".styleRow", function(e) {
		console.log("nice");
		console.log(e.target);
	})

	$(document).on("mouseover", ".adaptationTableResourceBody", function(e) {
		var root = e.target;

		console.log(root);

		var t = root;
		var div = root;

		for(var i=0;i<100;i++) {
			if($(t).hasClass("adaptationTableResourceBody")) break;
			t = $(t).parent();
		}

		$($(t).find(".resourceRemoveBtn")[0]).addClass("removeBtnActivated");

		for(var i=0;i<100;i++) {
			if($(div).hasClass("adaptationViewDiv")) break;
			div = $(div).parent();
		}

		var slideIndex = $(t).attr("slideindex");
		var resourceIndex = $(t).attr("resourceindex");

		var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
		var objID = docSlideStructure[slideIndex].layout.mapping[label];

		var paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);

		var objectIndicator = $(".objectIndicator[objid='" + objID + "'][paragraphindex='" + paragraphIndex + "']");

		console.log(objID, paragraphIndex);
		console.log(objectIndicator);

		$(objectIndicator).addClass("highlighted");

		console.log($(t));

		// console.log(rect);

		var adaptationViewSlideObj = $(div).find(".adaptationViewSlide")[0];

		// console.log(adaptationViewSlideObj);

		/*
		var temp_id = makeid(10);

		$(adaptationViewSlideObj).append("<div id='" + temp_id + "' class='adaptationViewSlideHighlight'> </div>")

		$("#" + temp_id).css("top", (rect.startY / 9525) + "px")
		$("#" + temp_id).css("left", (rect.startX / 9525) + "px")
		$("#" + temp_id).css("width", ((rect.finishX - rect.startX) / 9525) + "px")
		$("#" + temp_id).css("height", ((rect.finishY - rect.startY) / 9525) + "px") 
		*/
	})

	$(document).on("mouseleave", ".adaptationTableResourceBody", function(e) {
		// console.log("MOUSE LEAVE");

		$(".objectIndicator.highlighted").removeClass("highlighted");
		$(".removeBtnActivated").removeClass("removeBtnActivated");
	})

	function getParents(curRowObj, className) {
		for(var i=0;i<100;i++) {
			if(curRowObj == null) break;

			if($(curRowObj).hasClass(className)) return curRowObj;

			curRowObj = $(curRowObj).parent();
		}

		return null;
	}

	$(document).on("mousedown", ".adaptationTableResourceBody", function(e) {
		console.log($(e.target));

		if($(e.target).hasClass("resourceRemoveBtn")) return;

		rowSelected = true;

		var curRowObj = $(e.target);

		for(var i=0;i<100;i++) {
			if($(curRowObj).hasClass("adaptationTableResourceBody")) break;

			curRowObj = $(curRowObj).parent();
		}

		var slideIndex = parseInt($(curRowObj).attr("slideindex"));
		var resourceIndex = parseInt($(curRowObj).attr("resourceindex"));

		selectedSlideIndex = slideIndex;
		selectedResourceIndex = resourceIndex;

		$(curRowObj).addClass("mousedown");
		$(curRowObj).find(".temptemp").addClass("rowObjClicked");
		$(".temptemp").addClass("activated");

		issueEvent("root_getThumbnailPosition", null,
				"extension_getThumbnailPosition").then(result => {
					var data = result.detail.thumbnailInfo;
					var rootRect = result.detail.rootRect;

					$("#thumbnailDiv").css("top", rootRect.top + 38);
					$("#thumbnailDiv").css("left", rootRect.left);
					$("#thumbnailDiv").css("width", rootRect.width);
					$("#thumbnailDiv").css("height", rootRect.height);

					console.log(data);
					console.log(rootRect);

					$("#thumbnailDiv").html('');

					for(var i=0;i<data.length;i++) {
						$("#thumbnailDiv").append(
							"<div class='thumbnailBox'" + 
							' style="top: ' + (data[i].rect.top - rootRect.top) + 'px; ' +
							'left: ' + (data[i].rect.left - rootRect.left) + 'px; ' +
							'width: ' + data[i].rect.width + 'px; ' +
							'height: ' + (data[i].rect.height+5) + 'px;" slideid="' + data[i].slideID + '" slideindex="' + i + '"> ' + 
								"<div class='thumbnailBoxTop thumbnailDest'> </div>" + 
								"<div class='thumbnailBoxMiddle thumbnailDest'> </div>" + 
								"<div class='thumbnailBoxBottom thumbnailDest'> </div>" + 
							"</div>"
						)
					}

					$("#thumbnailTotalDiv").show();
				});
	});

	$(document).on("click", "#reviewCancelBtn", async function(e) {
		showLoadingSlidePlane();

		if(docSlideStructure[curDocSlideStructureIndex].previousVersion == null) {
			var requests = [];

			for(var i=0;i<docSlideStructure[curDocSlideStructureIndex].contents.list.length;i++) {
				var obj = docSlideStructure[curDocSlideStructureIndex].contents.list[i];

				if(obj.mappingKey != "null") {
					issueEvent("root_mappingRemoved2", {
						mappingID: obj.mappingKey
					});
				}
			}

			requests.push({
				"deleteObject": {
					"objectId": docSlideStructure[curDocSlideStructureIndex].slide.id,
				},
			});

			var slideID = docSlideStructure[curDocSlideStructureIndex].slide.id;

			for(var i=0;i<docSlideStructure[curDocSlideStructureIndex].contents.list.length;i++) {
				var obj = docSlideStructure[curDocSlideStructureIndex].contents.list[i];

				if (obj.mappingKey != "null") {
					issueEvent("root_mappingRemoved2", {
						mappingID: obj.mappingKey
					});
				}
			}

			delete slideDB[slideID]

			docSlideStructure.splice(curDocSlideStructureIndex, 1);

			updateDocSlideToExtension();
			setDocSlideStructure(docSlideStructure);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});
		}
		else {
			var requests = docSlideStructure[curDocSlideStructureIndex].previousVersion.requests;
			var matching = docSlideStructure[curDocSlideStructureIndex].previousVersion.matching;

			var contents = docSlideStructure[curDocSlideStructureIndex].previousVersion.contents;
			var layout = docSlideStructure[curDocSlideStructureIndex].previousVersion.layout;
			var style = docSlideStructure[curDocSlideStructureIndex].previousVersion.style;

			var slideID = docSlideStructure[curDocSlideStructureIndex].slide.id;

			docSlideStructure[curDocSlideStructureIndex].contents = JSON.parse(JSON.stringify(contents));
			docSlideStructure[curDocSlideStructureIndex].layout = JSON.parse(JSON.stringify(layout));
			docSlideStructure[curDocSlideStructureIndex].style = JSON.parse(JSON.stringify(style));

			slideDB[slideID] = {};

			for(var objID in matching.pageElements) {
				var label = matching.pageElements[objID].box.type;

				docSlideStructure[curDocSlideStructureIndex].layout.mapping[label] = objID;

				slideDB[slideID][objID] = [];
			}

			console.log(JSON.parse(JSON.stringify(docSlideStructure[curDocSlideStructureIndex])));

			var pIndex = {};

			for(var i=0;i<docSlideStructure[curDocSlideStructureIndex].contents.list.length;i++) {
				var item = docSlideStructure[curDocSlideStructureIndex].contents.list[i];
				var key = item.mappingKey;

				var objID = docSlideStructure[curDocSlideStructureIndex].layout.mapping[item.currentContent.label];

				console.log(objID);

				if(key != "null") {
					slideDB[slideID][objID].push( {mappingID: key} );
				}
				else {
					slideDB[slideID][objID].push( {mappingID: "null"} );
				}
			}

			docSlideStructure[curDocSlideStructureIndex].type = "visible";

			var objIDs = await getRequestsForRemovingAllObjectsOnPage(PRESENTATION_ID, slideID);
			var req = [];

			for (var i = 0; i < objIDs.length; i++) {
				req.push({
					"deleteObject": {
						"objectId": objIDs[i]
					},
				});
			}

			requests = requests.concat(req);

			updateDocSlideToExtension();
			updateSlideThumbnail();

			var idx = getIndexOfSlide(curSlidePage);

			setDocSlideStructure(docSlideStructure);
			showDocSlideView(idx);

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests 
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});

		}
		/*
		if (("list" in docSlideStructure[curDocSlideStructureIndex].contents)) {
			for (var i = 0; i < docSlideStructure[curDocSlideStructureIndex].contents.list.length; i++) {
				var item = docSlideStructure[curDocSlideStructureIndex].contents.list[i];
				var mappingKey = ("mappingKey" in item ? item.mappingKey : '');

				if(mappingKey != '') {
					for (var pgNumber in highlightDB.mapping) {
						if (mappingKey in highlightDB.mapping[pgNumber]) {
							removeMappingOnPdfjs(pgNumber, mappingKey, false).then(result => {
								issueEvent("root_mappingRemoved2", {
									mappingID: result
								});
							});
						}
					}
				}
			}
		}

		console.log(JSON.parse(JSON.stringify(docSlideStructure)));
		console.log(curDocSlideStructureIndex);

		docSlideStructure.splice(curDocSlideStructureIndex, 1);

		console.log(JSON.parse(JSON.stringify(docSlideStructure)));

		var idx = parseInt($(".adaptationViewDiv[slideID='" + curSlidePage + "']").attr("index"));

		curDocSlideStructureIndex = idx;
		setDocSlideStructure(docSlideStructure);
		showDocSlideView(idx);

		updateSlideThumbnail();
		hideReviewSlide();
		*/
	});

	$(document).on("click", "#reviewFinishBtn", function(e) {
		docSlideStructure[curDocSlideStructureIndex].type = "visible";

		setDocSlideStructure(docSlideStructure);
		showDocSlideView(curDocSlideStructureIndex);

		updateSlideThumbnail();

		hideReviewSlide();
		/*
		showLoadingSlidePlane();

		var insertPosition = getInsertPosition(curDocSlideStructureIndex);
		var layoutIndex = docSlideStructure[curDocSlideStructureIndex].layout.index;
		var requests = [];
		var mappingInfo = [];

		if(referenceSlideID == "Default") {
			if(layoutIndex == 0) {

			}
			else if (layoutIndex == 1) {
				var slideID = docSlideStructure[curDocSlideStructureIndex].slideID;
				var titleObjectID = makeid(10);
				var bodyObjectID = makeid(10);

				requests.push({
					createSlide: {
						objectId: slideID,
						insertionIndex: insertPosition,
						slideLayoutReference: {
							predefinedLayout: 'TITLE_AND_BODY'
						},
						placeholderIdMappings: [{
							objectId: titleObjectID,
							layoutPlaceholder: {
								type: "TITLE",
								index: 0
							}
						}, {
							objectId: bodyObjectID,
							layoutPlaceholder: {
								type: "BODY",
								index: 0
							}
						}
						]
					}
				});

				var concat = {};

				for (var i = 0; i < docSlideStructure[curDocSlideStructureIndex].contents.list.length; i++) {
					var c = docSlideStructure[curDocSlideStructureIndex].contents.list[i].currentContent;

					if (!(c.boxIndex in concat)) {
						concat[c.boxIndex] = {
							str: '',
							cnt: 0
						};
					}

					if (c.boxIndex == 0) c.objID = titleObjectID;
					else {
						c.objID = bodyObjectID;

						mappingInfo.push({
							pageID: slideID,
							objID: bodyObjectID,
							paragraphIndex: concat[c.boxIndex].cnt,
							mappingID: docSlideStructure[curDocSlideStructureIndex].contents.list[i].mappingKey
						})
					}

					concat[c.boxIndex].str += (concat[c.boxIndex].cnt == 0 ? '' : '\n') + c.contents;
					concat[c.boxIndex].cnt++;
				}

				for (var k in concat) {
					if (k == 0) {
						requests.push({
							insertText: {
								objectId: titleObjectID,
								text: concat[0].str,
								insertionIndex: 0
							}
						});
					}
					else if (k == 1) {
						requests.push({
							insertText: {
								objectId: bodyObjectID,
								text: concat[1].str,
								insertionIndex: 0
							}
						});
					}
				}

				console.log(requests);
				var updates = {};

				firebase.database().ref().update(updates);
				docSlideStructure[curDocSlideStructureIndex].type = "visible";
				docSlideStructure[curDocSlideStructureIndex].slideID = slideID;

				setDocSlideStructure(docSlideStructure);

				gapi.client.slides.presentations.batchUpdate({
					presentationId: PRESENTATION_ID,
					requests: requests
				}).then((createSlideResponse) => {
					// successfully pasted the text

					writeSlideMappingInfoBulk(mappingInfo).then(() => {
						console.log(JSON.parse(JSON.stringify(docSlideStructure)));

						showDocSlideView(curDocSlideStructureIndex);
						updateSlideThumbnail();

						locateSlide(slideID, false);

						hideReviewSlide();
					});

					return true;
				});
			}
		}
		*/
	});

	function updateAlternativeIfNeeded() {
		if(current_left_plane == "singleslide_layout" || current_left_plane == "singleslide_style") {
			var alternativeSlideID = '';

			if(current_left_plane == "singleslide_layout")
				alternativeSlideID = $("#slideListDivBodyLayout").attr("slideid");
			else 
				alternativeSlideID = $("#slideListDivBodyStyle").attr("slideid");

			console.log(alternativeSlideID, curSlidePage);
			console.log(curDocSlideStructureIndex);

			if(alternativeSlideID != curSlidePage) {
				// update!

				if(current_left_plane == "singleslide_layout")
					getAlternativeSlides(curDocSlideStructureIndex, "layoutAlternative");

				if(current_left_plane == "singleslide_style")
					getAlternativeSlides(curDocSlideStructureIndex, "styleAlternative");

			}
		}
	}

	function getContentsOnSlides(index) {
		var contentsObj = docSlideStructure[index].contents.list;
	}

	$(document).on("click", ".slideRepresentationSwitch", function(e) {
		if ($(e.target).prop("tagName") == "INPUT") {
			if($(".slideRepresentationSwitch").find("input")[0].checked)  {
				if($(".dimensionSelectionSwitch").find("input")[0].checked) current_left_plane = "singleslide_style";
				else current_left_plane = "singleslide_layout";
			}
			else current_left_plane = "slidedeck";

			console.log(current_left_plane);

			if(current_left_plane == 'singleslide_layout') {
				$("#slideListDivBodyLayout").show();
				$("#slideListDivBodyStyle").hide();

				getAlternativeSlides(curDocSlideStructureIndex, "layoutAlternative");
			}
			else if(current_left_plane == 'singleslide_style') {
				$("#slideListDivBodyLayout").hide();
				$("#slideListDivBodyStyle").show();

				getAlternativeSlides(curDocSlideStructureIndex, "styleAlternative");
			}
		}
	});

	$(document).on("click", ".dimensionSelectionSwitch", function(e) {
		console.log($(e.target));
		console.log($(e.target).prop("tagName"));

		if ($(e.target).prop("tagName") == "INPUT") {
			if ($(".slideRepresentationSwitch").find("input")[0].checked) {
				if ($(".dimensionSelectionSwitch").find("input")[0].checked) current_left_plane = "singleslide_style";
				else current_left_plane = "singleslide_layout";
			}
			else current_left_plane = "slidedeck";

			console.log(current_left_plane);

			if(current_left_plane == 'singleslide_layout') {
				$("#slideListDivBodyLayout").show();
				$("#slideListDivBodyStyle").hide();

				getAlternativeSlides(curDocSlideStructureIndex, "layoutAlternative");
			}
			else if(current_left_plane == 'singleslide_style') {
				$("#slideListDivBodyLayout").hide();
				$("#slideListDivBodyStyle").show();

				getAlternativeSlides(curDocSlideStructureIndex, "styleAlternative");
			}
		}

	});

	$(document).on("click", ".ui-tabs-tab",function(e) {
		var cur = $(e.target);

		console.log($(e.target));
		console.log($(e.target).parent());
		console.log($($(e.target).parent()).attr("tabindex"));

		if ($($(e.target).parent()).attr("aria-labelledby") == "ui-id-1") current_left_plane = "document";
		else {
			if ($(".slideRepresentationSwitch").find("input")[0].checked) {
				if ($(".dimensionSelectionSwitch").find("input")[0].checked) current_left_plane = "singleslide_style";
				else current_left_plane = "singleslide_layout";
			}
			else current_left_plane = "slidedeck";
		}

		console.log(current_left_plane);

		if (current_left_plane == 'singleslide_layout') {
			$("#slideListDivBodyLayout").show();
			$("#slideListDivBodyStyle").hide();

			getAlternativeSlides(curDocSlideStructureIndex, "layoutAlternative");
		}
		else if (current_left_plane == 'singleslide_style') {
			$("#slideListDivBodyLayout").hide();
			$("#slideListDivBodyStyle").show();

			getAlternativeSlides(curDocSlideStructureIndex, "styleAlternative");
		}
	});

	$(document).on("mouseup", function(e) {
		return;
		 
		console.log("MOUSE UP");
		console.log($(e.target));
		$(".adaptationTableResourceBody.mousedown").removeClass("mousedown");

		var p = null;
		if ($(e.target).hasClass("temptemp")) {
			p = getParents(e.target, "adaptationTableResourceBody");

			if (rowSelected && p != null && $(".mousein").length > 0) {
				console.log("GOT IT!");

				var slideIndex = parseInt($(p).attr("slideindex"));
				var resourceIndex = parseInt($(p).attr("resourceindex"));

				if (!(slideIndex == selectedSlideIndex && resourceIndex == selectedResourceIndex)) {
					showLoadingSlidePlane();

					console.log(slideIndex, resourceIndex);

					var mouseinObj = $(".mousein")[0];

					var resourceIndexToInsert = -1;

					if ($(mouseinObj).hasClass("lower")) resourceIndexToInsert = resourceIndex + 1;
					else resourceIndexToInsert = resourceIndex;

					if (slideIndex == selectedSlideIndex) {
						var targetLabel = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
						var targetIndex = resourceIndexToInsert;

						console.log(targetLabel);

						moveItemToIndex(selectedSlideIndex, selectedResourceIndex, slideIndex, resourceIndex, resourceIndexToInsert);

						docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex].currentContent.label = targetLabel;

						var source = JSON.parse(JSON.stringify(docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex]));
						docSlideStructure[selectedSlideIndex].contents.list.splice(selectedResourceIndex, 1);

						if (selectedResourceIndex < resourceIndex)
							docSlideStructure[selectedSlideIndex].contents.list.splice(resourceIndexToInsert - 1, 0, source);
						else
							docSlideStructure[selectedSlideIndex].contents.list.splice(resourceIndexToInsert, 0, source);

						setDocSlideStructure(docSlideStructure);
						showDocSlideView(slideIndex);

						firebase.database().ref("/users/" + userName + '/docSlideStructure/' + slideIndex + '/resources/').set(docSlideStructure[selectedSlideIndex].contents.list);
					}
					else console.log("*** SOMETHING WENT WRONG ***")
				}
			}
		}
		else if($(e.target).hasClass("thumbnailDest")) {
			showLoadingSlidePlane();

			var targetSlideID = $($(e.target).parent()).attr("slideid");
			var slideindex = $($(e.target).parent()).attr("slideindex");

			console.log(targetSlideID, slideindex);

			if($(e.target).hasClass("thumbnailBoxTop")) option = "top";
			else if($(e.target).hasClass("thumbnailBoxMiddle")) option = "middle";
			else option = "bottom";

			if(option == "middle") {
				moveItemToDifferentSlide(selectedSlideIndex, selectedResourceIndex, targetSlideID);

				var source = JSON.parse(JSON.stringify(docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex]));
				var sourceSlideID = docSlideStructure[selectedSlideIndex].slide.id;

				docSlideStructure[selectedSlideIndex].contents.list.splice(selectedResourceIndex, 1);

				var idx = getIndexOfSlide(targetSlideID);

				source.currentContent.label = docSlideStructure[idx].contents.list[docSlideStructure[idx].contents.list.length-1].currentContent.label;
				docSlideStructure[idx].contents.list.push(source);

				setDocSlideStructure(docSlideStructure);
				showDocSlideView(selectedSlideIndex);
			}
			else {
				var insertIndex = -1;

				if(option == "top")  insertIndex = parseInt(slideindex);
				else insertIndex = parseInt(slideindex) + 1;

				console.log(insertIndex);
				
				// add a new slide to (index+1)

				var source = JSON.parse(JSON.stringify(docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex]));
				
				var sourceLabel = source.currentContent.label;
				var sourceSlideID = docSlideStructure[selectedSlideIndex].slide.id;
				var sourceObjID = docSlideStructure[selectedSlideIndex].layout.mapping[sourceLabel];

				console.log(source);

				var titleID = makeid(10);
				var bodyID = makeid(10);
				var slideID = makeid(10);

				// var shorteningResult = findShortening(mapping.key);
				// console.log(shorteningResult);

				var mappingKey = source.mappingKey;
				var myPageNumber, startWordIndex, endWordIndex
				var sectionKey = null;

				if (mappingKey != "null") {
					for (var pageNumber in highlightDB.mapping) {
						if (mappingKey in highlightDB.mapping[pageNumber]) {
							myPageNumber = pageNumber;
							startWordIndex = highlightDB.mapping[pageNumber][mappingKey].startWordIndex;
							endWordIndex = highlightDB.mapping[pageNumber][mappingKey].endWordIndex;

							break;
						}
					}

					console.log(mappingKey);
					console.log(startWordIndex);
					console.log(endWordIndex);

					sectionKey = getSectionKey(myPageNumber, startWordIndex, endWordIndex);
				}

				console.log(sectionKey);
				console.log(JSON.parse(JSON.stringify(docSlideStructure)));

				if (source.currentContent.type == "text") { // text
					var requests = [];

					requests.push({
						createSlide: {
							objectId: slideID,
							insertionIndex: insertIndex,
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
							text: sectionKey == null ? '' : structureHighlightDB[sectionKey].text,
							insertionIndex: 0
						}
					});
					requests.push({
						insertText: {
							objectId: bodyID,
							text: source.currentContent.contents,
							insertionIndex: 0
						}
					});

					if (!(slideID in slideDB)) slideDB[slideID] = {};

					slideDB[slideID][titleID] = [];
					slideDB[slideID][titleID].push({ mappingID: "null" });

					slideDB[slideID][bodyID] = [];
					slideDB[slideID][bodyID].push({ mappingID: source.mappingKey });

					var updates = {};

					// updates['/users/' + userName + '/structureHighlightInfo/' + sectionKey] = structureHighlightDB[sectionKey];

					firebase.database().ref().update(updates);

					console.log(requests);
					console.log(selectedSlideIndex, selectedResourceIndex);

					var sourceParagraphIndex = getParagraphIndexOfDocSlideStructure(selectedSlideIndex, selectedResourceIndex);

					console.log(sourceParagraphIndex);
					console.log(JSON.parse(JSON.stringify(slideDB[sourceSlideID][sourceObjID])));
					console.log(JSON.parse(JSON.stringify(docSlideStructure[selectedSlideIndex].contents)));

					docSlideStructure[selectedSlideIndex].contents.list.splice(selectedResourceIndex, 1);

					docSlideStructure.splice(insertIndex, 0, {
						type: "visible",
						contents: {
							sectionKey: sectionKey,
							list: [{
								mappingKey: "null",
								originalContent: {
									type: "text",
									contents: sectionKey != null ? structureHighlightDB[sectionKey].text : '',
								},
								currentContent: {
									type: "text",
									label: "HEADER_0",
									contents: sectionKey != null ? structureHighlightDB[sectionKey].text : '',
								},
							},
							{
								mappingKey: source.mappingKey,
								originalContent: source.originalContent,
								currentContent: {
									type: "text",
									label: "BODY_0",
									contents: source.currentContent.contents,
								},
							}]
						},
						layout: {
							mapping: {
								"HEADER_0": titleID,
								"BODY_0": bodyID
							},
							...getLayout(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						style: {
							...getStyle(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						slide: {
							id: slideID,
							objs: [{
								id: titleID
							},
							{
								id: bodyID
							}
							]
						},
						layoutAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						styleAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						previousVersion: null
						/*
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
						*/
					});

					removeParagraph(sourceSlideID, sourceObjID, sourceParagraphIndex, false, requests)
				}
				else { // image
					var label = docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex].currentContent.label;
					var objID = docSlideStructure[selectedSlideIndex].layout.mapping[label];

					var source = JSON.parse(JSON.stringify(docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex]));

					var imageURL = docSlideStructure[selectedSlideIndex].contents.list[selectedResourceIndex].currentContent.contents;

					var slideID = makeid(10);
					var imageObjID = makeid(10);

					var requests = [];

					requests.push({
						"deleteObject": {
							"objectId": objID,
						},
					});

					requests.push({
						createSlide: {
							objectId: slideID,
							insertionIndex: insertIndex,
							slideLayoutReference: {
								predefinedLayout: "BLANK"
							},
						}
					});

					requests.push({
						createImage: {
							objectId: imageObjID,
							elementProperties: {
								pageObjectId: slideID
							},
							url: imageURL
						}
					});

					source.label = "PICTURE_0";

					docSlideStructure.splice(insertIndex, 0, {
						type: "visible",
						contents: {
							sectionKey: sectionKey,
							list: [
								source
							]
						},
						layout: {
							mapping: {
								"PICTURE_0": imageObjID
							},
							...getLayout(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						style: {
							...getStyle(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						slide: {
							id: slideID,
						},
						layoutAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						styleAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						previousVersion: null
						/*
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
						*/
					});

					docSlideStructure[insertIndex].layout.boxes = [{
						height: 0,
						left: 0,
						top: 0,
						width: 0,
						type: "PICTURE_0"
					}];

					slideDB[slideID] = {};
					slideDB[slideID][imageObjID] = [];
					slideDB[slideID][imageObjID].push({
						mappingID: source.mappingKey
					});

					docSlideStructure[selectedSlideIndex].contents.list.splice(selectedResourceIndex, 1);

					gapi.client.slides.presentations.batchUpdate({
						presentationId: PRESENTATION_ID,
						requests: requests
					}).then((createSlideResponse) => {
						console.log(createSlideResponse);
					});
				}

				updateDocSlideToExtension();
				setDocSlideStructure(docSlideStructure);

				// showReviewSlide(index+1);

				var idx = getIndexOfSlide(sourceSlideID);
				showDocSlideView(idx);

				// locateSlide(docSlideStructure[index+1].slide.id, true)

				console.log(JSON.parse(JSON.stringify(slideDB[sourceSlideID][sourceObjID])));
			}
		}

		rowSelected = false;
		selectedSlideIndex = -1;
		selectedResourceIndex = -1;

		$(".rowObjClicked").removeClass("rowObjClicked");
		$(".temptemp.activated").removeClass("activated");
		$(".temptemp.mousein").removeClass("mousein");

		$(".thumbnailDest").removeClass("mousein");

		$("#thumbnailTotalDiv").hide();
	})

	$(document).on("click", ".adaptationTableResourceBody", function(e) {
		console.log(e.target);

		var curRowObj = $(e.target);

		if($(e.target).hasClass("resourceRemoveBtn")) return;

		for(var i=0;i<100;i++) {
			if($(curRowObj).hasClass("adaptationTableResourceBody")) break;

			curRowObj = $(curRowObj).parent();
		}

		console.log(curRowObj);

		var slideIndex = parseInt($(curRowObj).attr("slideIndex"));
		var resourceIndex = parseInt($(curRowObj).attr("resourceIndex"));
		var originalText = docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents;

		$("#textShorteningViewOriginalText").html(originalText)

		$("#textShorteningViewAlternativeTextDiv").attr("loading", true);
		$("#textShorteningViewAlternativeTextDiv").attr("slideindex", slideIndex);
		$("#textShorteningViewAlternativeTextDiv").attr("resourceindex", resourceIndex);

		$("#textShorteningViewAlternativeTextDiv").html("Loading... ");

		$("#imageView").attr("slideindex", slideIndex);
		$("#imageView").attr("resourceindex", resourceIndex);

		$("#imageViewOriginalSentence").html('');
		$("#imageViewQueryKeywordDiv").html("Loading...");
		$("#imageViewResultDiv").html("on Loading...");

		$(".selectedForAlternative").removeClass("selectedForAlternative");

		$(curRowObj).addClass("selectedForAlternative");

		currentResourceSelectedFlag = true;
		currentSelectedResourceIndex = resourceIndex;
		currentSelectedSlideIndex = slideIndex;

		var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
		var objID = docSlideStructure[slideIndex].layout.mapping[label];

		var paragraphIndex = getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);

		var objectIndicator = $(".objectIndicator[objid='" + objID + "'][paragraphindex='" + paragraphIndex + "']");

		$(objectIndicator).addClass("selectedForAlternative");

		console.log(docSlideStructure[slideIndex].contents.list[resourceIndex])

		$("#alternativeElementView").show();

		showTextShorteningView(slideIndex, resourceIndex);
		showImageSelectionView(slideIndex, resourceIndex);
	})

	$(document).on("click", "#alternativeElementViewCloseBtn", function(e) {
		hideAlternativeView();
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

	$(document).on("click", "#slideDeckCompareApplyBtn", async function(e) {
		showLoadingSlidePlane();

		var slideDeckObj = $(".checkedSlideDeck");

		console.log(slideDeckObj);

		$(".selectedSlideDeck").removeClass("selectedSlideDeck");
		$(".checkedSlideDeck").removeClass("checkedSlideDeck");

		var presentationID = $(slideDeckObj).attr("presentationid");

		referenceSlideID = presentationID;
		firebase.database().ref("/users/" + userName + '/referenceSlideID/').set(referenceSlideID);

		$(slideDeckObj).addClass("selectedSlideDeck");

		// showIndividualSlides(presentationID);

		$("#slideDeckCompareDiv").hide();

		updateMapping(slide_deck_matching);
		updateDocSlideToExtension();

		var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(PRESENTATION_ID);
		req = req.concat(slide_deck_adaptation_req);

		console.log(req);

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: req
		}).then((createSlideResponse) => {
			console.log(createSlideResponse);
		});
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

	$(document).on("click", ".slideDeckThumbnailImage", async function(e) {
		$("#slideDeckCompareDivControllerSegmentationCheckbox")[0].checked = false;
		$("#slideDeckCompareDivControllerLayoutCheckbox")[0].checked = true;
		$("#slideDeckCompareDivControllerStyleCheckbox")[0].checked = true

		var segmentationChecked = $("#slideDeckCompareDivControllerSegmentationCheckbox")[0].checked;
		var layoutChecked = $("#slideDeckCompareDivControllerLayoutCheckbox")[0].checked;
		var styleChecked = $("#slideDeckCompareDivControllerStyleCheckbox")[0].checked

		var presentationID = $(e.target).parent().attr("presentationid");
		$(e.target).parent().addClass("checkedSlideDeck");

		showLoadingScreenOnCompareDivResult();
		slideDeckAdaptationDivAppear(presentationID);

		var req = await constructRequestForSlideDeckAdaptation(presentationID, {
			segmentation: segmentationChecked,
			layout: layoutChecked,
			style: styleChecked
		});

		console.log(JSON.stringify(req));
/*
		var r = await postRequest(
			API_URL+"get_data_single_presentation", {
				"presentationId": presentationID
			});

		console.log(r);
		*/

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		};

		fetch(API_URL+'generate_presentation_requests', requestOptions)
			.then(response => response.json())
			.then(async data => {
				console.log(data);

				var req = await getRequestsForRemovingAllSlidesOnGoogleSlide(TEMP_PRESENTATION_ID);

				if(req == null) req = data.requests;
				else req = req.concat(data.requests);

				slide_deck_adaptation_req = data.requests;
				slide_deck_matching = data.matchings;

				console.log(slide_deck_matching);
				gapi.client.slides.presentations.batchUpdate({
					presentationId: TEMP_PRESENTATION_ID,
					requests: req
				}).then((createSlideResponse) => {
					console.log(createSlideResponse);

					genSlideThumbnail(TEMP_PRESENTATION_ID);
				});

				return data;
			});
	});

	function updateMapping(m) {
		console.log(m);

		slideDB = {};

		var temp = JSON.parse(JSON.stringify(docSlideStructure));
		docSlideStructure = [];

		for(var i=0;i<m.length;i++) {
			var slideID = m[i].objectId;

			updateMappingInternal(slideID, m[i], true);
		}

		console.log(JSON.parse(JSON.stringify(docSlideStructure)));
		console.log(JSON.parse(JSON.stringify(temp)));

		for(var i=0;i<docSlideStructure.length;i++) {
			docSlideStructure[i].contents.sectionKey = temp[i].contents.sectionKey;
		}

		console.log(docSlideStructure);
		console.log(slideDB);

		setDocSlideStructure(docSlideStructure);

		firebase.database().ref("/users/" + userName + '/docSlideStructure/').set(docSlideStructure);
		firebase.database().ref("/users/" + userName + '/slideInfo').set(slideDB);
	}

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

			removeParagraph(slidePageID, objectID, paragraphIndex, true, null)
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

		$(document).on("extension_slideRemoved", function(e) {
			var p = e.detail;

			console.log(p);
			console.log(JSON.parse(JSON.stringify(docSlideStructure)))

			for(var i=0;i<p.length;i++) {
				var slideID = p[i].slideID;
				var idx = p[i].index;

				for(var obj in slideDB[slideID]) {
					console.log(JSON.parse(JSON.stringify(slideDB[slideID][obj])));

					for(var j=0;j<slideDB[slideID][obj].length;j++) {
						if(slideDB[slideID][obj][j].mappingID != "null") {
							var myPageNumber = null;
							var mappingKey = slideDB[slideID][obj][j].mappingID;

							console.log(mappingKey);

							for (var pageNumber in highlightDB.mapping) {
								if (mappingKey in highlightDB.mapping[pageNumber]) {
									myPageNumber = pageNumber;
									break;
								}
							}

							if (myPageNumber != null) {
								removeMappingOnPdfjs(pageNumber, mappingKey, false).then(result => {
									issueEvent("root_mappingRemoved2", {
										mappingID: result
									});
								});
							}
						}
					}
				}

				delete slideDB[slideID];

				docSlideStructure.splice(idx-i, 1);
			}

			updateDocSlideToExtension();
			updateSlideThumbnail();
		})

		$(document).on("extension_slideAdded", function(e) {
			var p = e.detail;

			console.log(JSON.parse(JSON.stringify(p)));

			for (var i = 0; i < p.length; i++) {
				var index = p[i].index;

				// newly created. update docSlideStructure
				console.log(index);

				if (p[i].objs.length > 0) {
					docSlideStructure.splice(index, 0, {
						type: "visible",
						contents: {
							sectionKey: '',
							list: []
						},
						layout: {
							mapping: {
								HEADER_0: p[i].objs[0],
								BODY_0: p[i].objs[1]
							},
							...getLayout(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						style: {
							...getStyle(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						slide: {
							id: p[i].slideID,
							objs: []
						},
						layoutAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						styleAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
					});

					if(!(p[i].slideID in slideDB)) slideDB[p[i].slideID] = {};
					else console.log(" **** HMM NEED TO CHECK ***");

					for(var j=0;j<p[i].objs.length;j++) {
						slideDB[p[i].slideID][p[i].objs[j]] = [{
							mappingID: "null"
						}]

						docSlideStructure[index].contents.list.push({
							mappingKey: "null",
							originalContent: {
								type: "text",
								contents: ''
							},
							currentContent: {
								type: "text",
								label: (j == 0 ? "HEADER_0" : "BODY_0"),
								contents: ''
							},
						})
					}
				}
				else {
					docSlideStructure.splice(index, 0, {
						type: "visible",
						contents: {
							sectionKey: '',
							list: []
						},
						layout: {
							mapping: {},
							boxes: [],
							pageSize: { height: 303.75, width: 540},
							slideID: 'BLANK_SLIDE',
							thumbnailURL: "BLANK_SLIDE"
							// ...getLayout(referenceSlideID, "ge93a171212_0_5")
						},
						style: {
							...getStyle(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
						},
						slide: {
							id: p[i].slideID,
							objs: []
						},
						layoutAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
						styleAlternative: {
							loaded: false,
							loadStarted: false,
							result: []
						},
					});


				}
			}

			console.log(JSON.parse(JSON.stringify(docSlideStructure)));

			updateDocSlideToExtension();
			updateSlideThumbnail();

			var idx = getIndexOfSlide(curSlidePage);

			setDocSlideStructure(docSlideStructure);
			showDocSlideView(idx);
			visualizeSlideObjects();

			if (docSlideStructure[idx].type == "hidden") showReviewSlide();
			else hideReviewSlide();
		})

	$(document).on("extension_hideLoading", function (e) {
		hideLoadingSlidePlane();
	})

	$(document).on("extension_deletionCheck", function(e) {
		return;

			if (adaptivePlaneStatus != 2) {
				var tempCnt = 1;
				var p = e.detail;

				console.log(p);
				curSlideObjects = p;

				if(curSlidePage != p.pageID) {
					console.log("*** SOMETHING WENT WRONG ***")
				}

				var idx = getIndexOfSlide(p.pageID);

				// layout 
	
				var objList = [];

				for(var i=0;i<p.objects.length;i++) {
					objList.push(p.objects[i].objectID.split('-')[1]);
				}

				var mappingKeys = Object.keys(docSlideStructure[idx].layout.mapping);

				for(var kk=0;kk<mappingKeys.length;kk++) {
					var k = mappingKeys[kk];

					var objID = docSlideStructure[idx].layout.mapping[k]

					if(objList.indexOf(objID) < 0) {
						// found. remove the box.

						for(var i=0;i<docSlideStructure[idx].layout.boxes.length;i++) {
							if(docSlideStructure[idx].layout.boxes[i].type == k) {
								docSlideStructure[idx].layout.boxes.splice(i, 1);
								delete docSlideStructure[idx].layout.mapping[k];
							}
						}

						for(var i=0;i<docSlideStructure[idx].contents.list.length;i++) {
							if(docSlideStructure[idx].contents.list[i].currentContent.label == k) {
								if (docSlideStructure[idx].contents.list[i].mappingKey != "null") {
									issueEvent("root_mappingRemoved2", {
										mappingID: docSlideStructure[idx].contents.list[i].mappingKey
									});
								}

								docSlideStructure[idx].contents.list.splice(i, 1);
								i--;
							}
						}

						delete slideDB[p.pageID][objID];
					}
				}

				if (curSlidePage == p.pageID) {
					setDocSlideStructure(docSlideStructure);
					showDocSlideView(idx);
					visualizeSlideObjects();

					if (curDocSlideStructureIndex != idx && current_left_plane == "singleslide_layout") { // slide number changed
						getAlternativeSlides(idx, "layoutAlternative");
					}

					if (curDocSlideStructureIndex != idx && current_left_plane == "singleslide_style") { // slide number changed
						getAlternativeSlides(idx, "styleAlternative");
					}

					curDocSlideStructureIndex = idx;

					if (docSlideStructure[idx].type == "hidden") showReviewSlide();
					else hideReviewSlide();
				}

				console.log("DONE");

				statusFlag = true;

				setStatusLight("green");
				hideLoadingSlidePlane();
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
			}

	})

	function setStatusLight(color) {
		$("#statusLight").css("background-color", color);
	}

	$(document).on("click", "#alternativeBtn", function(e) {
		console.log("cool");
		console.log(curSlidePage);

		gapi.client.slides.presentations.get({
			presentationId: PRESENTATION_ID
		}).then(async function (response) {
			var textSet = [];

			var presentation = response.result;
			var length = presentation.slides.length;

			// slideDB = {};

			var startIndex = -1, endIndex = -1;
			var myText, myStartIndex = -1, myEndIndex = -1;
			var curParagraphIndex = -1;

			for (i = 0; i < length; i++) {
				if (endIndex != -1) break;

				var slide = presentation.slides[i];

				var slideID = slide.objectId;
				var slideObjId = {};

				if (slideID == curSlidePage) {
					console.log(slide);

					for(var j=0;j<slide.pageElements.length;j++) {
						for(var k=0;k<slide.pageElements[j].shape.text.textElements.length;k++) {
							if("textRun" in slide.pageElements[j].shape.text.textElements[k]) {
								var tt = slide.pageElements[j].shape.text.textElements[k].textRun.content;

								tt = tt.trim();

								if(tt.length > 0) 
									textSet.push(tt);
							}
						}
					}
				}
			}

			console.log(textSet);

			var res = await postRequest(
				API_URL + "getImagesFromMultipleText", {text: textSet}
			);

			console.log(res);
		});
		
	})

		$(document).on("extension_pageUpdated", function(e) {
			var p = e.detail;

			var slidesFromOutline = getLinearSlidesFromOutline();
			var diffFlag = -1;

			if(slidesFromOutline.length != p.filmstripStructure.length-1) {
				// slide added or deleted
				console.log(slidesFromOutline.length, p.filmstripStructure.length-1);

				if(slidesFromOutline.length > p.filmstripStructure.length-1) {
					diffFlag = 1; // removed
				}
				else {
					diffFlag = 2; // added
				}
			}

			if (diffFlag == -1) {
				for (var i = 1; i < p.filmstripStructure.length; i++) {
					if (slidesFromOutline[i - 1] != p.filmstripStructure[i].slideID) {
						diffFlag = 2;
						break;
					}
				}
			}

			if(diffFlag != -1) {
				console.log(slidesFromOutline);
				console.log(p.filmstripStructure);

				if(diffFlag == 1) { // slides removed
					var slideDict = {};

					for (var i = 1; i < p.filmstripStructure.length; i++) {
						slideDict[p.filmstripStructure[i].slideID] = 1;
					}

					console.log(slideDict);

					var removedSlideCnt = 0;
					var delta_X = 0;

					for(var i=0;i<outlineStructure.length;i++) {
						outlineStructure[i].startSlideIndex -= removedSlideCnt;
						outlineStructure[i].endSlideIndex -= removedSlideCnt;

						outlineStructure[i].startX -= delta_X;
						outlineStructure[i].endX -= delta_X;

						for(var j=0;j<outlineStructure[i].slideIDs.length;j++) {
							if(!(outlineStructure[i].slideIDs[j] in slideDict)) {
								outlineStructure[i].slideIDs.splice(j, 1);
								outlineStructure[i].endSlideIndex--;

								removedSlideCnt++;

								j--;
							}
						}

						if(outlineStructure[i].slideIDs.length <= 0) {
							delta_X += (outlineStructure[i].endX - outlineStructure[i].startX);
							outlineStructure.splice(i, 1);
							i--;
						}
					}
				}
				else if(diffFlag == 2) { // slides added
					var addedSlides = [];
					var prevSlide = -1;

					for(var i=1;i<p.filmstripStructure.length;i++) {
						if(!slidesFromOutline.includes(p.filmstripStructure[i].slideID)) {
							addedSlides.push(p.filmstripStructure[i].slideID);

							if(prevSlide == -1) prevSlide = p.filmstripStructure[i-1].slideID;
						}
					}

					console.log(addedSlides);

					if(prevSlide == "THIS_IS_FIRST_SLIDE") {
						for(var i=0;i<outlineStructure.length;i++) {
							outlineStructure[i].startSlideIndex += numAddedSlides;
							outlineStructure[i].endSlideIndex += numAddedSlides;

							if(i == 0) {
								outlineStructure[i].slideIDs.splice(0, 0, ...addedSlides);

								numAddedSlides += addedSlides.length;
								outlineStructure[i].endSlideIndex += numAddedSlides;
							}
						}
					}
					else {
						var numAddedSlides = 0;

						console.log(addedSlides);
						console.log(prevSlide);

						for(var i=0;i<outlineStructure.length;i++) {
							console.log(i, numAddedSlides);

							outlineStructure[i].startSlideIndex += numAddedSlides;
							outlineStructure[i].endSlideIndex += numAddedSlides;

							if(outlineStructure[i].slideIDs.includes(prevSlide)) {
								var idx = outlineStructure[i].slideIDs.indexOf(prevSlide);

								outlineStructure[i].slideIDs.splice(idx+1, 0, ...addedSlides);

								numAddedSlides += addedSlides.length;
								outlineStructure[i].endSlideIndex += numAddedSlides;
							}
						}
					}
				}
				else { // slide moved
					
				}
				
				updateOutlineSegments();
			}

			console.log(waitingOutlineIndex);

			console.log(p.pageID);
			console.log(outlineStructure);

			if(waitingOutlineIndex != -1) {
				hideLoadingSlidePlane();

				outlineStructure[waitingOutlineIndex].status = "okay";

				updateOutlineSegments();
				selectSegment(waitingOutlineIndex, true);

				waitingOutlineIndex = -1;
			}
			else {
				for(var i=0;i<outlineStructure.length;i++) {
					if(outlineStructure[i].slideIDs.includes(p.pageID)) {
						selectSegment(i, false);
						updateMessageBox();
					}
				}
			}

			statusFlag = false;
			setStatusLight("red");

			console.log(JSON.parse(JSON.stringify(docSlideStructure)));

			if (adaptivePlaneStatus != 2) {
				var tempCnt = 1;
				var p = e.detail;

				console.log("PAGE UPDATED");
				console.log(p);

				curSlideObjects = p;

				var pageID = p.pageID;
				curSlidePage = p.pageID;

				// var idx = getIndexOfSlide(curSlidePage);
				// console.log(idx);

				// if(idx == -1) {
					// // newly created. will be handled in filestrip updated
					// return;
				// }

				// // layout 
	
				// var objList = [];

				// for(var i=0;i<p.objects.length;i++) {
					// objList.push(p.objects[i].objectID.split('-')[1]);
				// }


				// var mappingKeys = Object.keys(docSlideStructure[idx].layout.mapping);

				// for(var kk=0;kk<mappingKeys.length;kk++) {
					// var k = mappingKeys[kk];

					// var objID = docSlideStructure[idx].layout.mapping[k]

					// if(objList.indexOf(objID) < 0) {
						// // found. remove the box.

						// for(var i=0;i<docSlideStructure[idx].layout.boxes.length;i++) {
							// if(docSlideStructure[idx].layout.boxes[i].type == k) {
								// docSlideStructure[idx].layout.boxes.splice(i, 1);
								// delete docSlideStructure[idx].layout.mapping[k];
							// }
						// }
					// }
				// }

				// for(var i=0;i<p.objects.length;i++) {
					// var objID = p.objects[i].objectID.split('-')[1];
					// var flag = false;

					// var w, h, l, t;

					// w = p.objects[i].rect.width / p.workspace.width;
					// h = p.objects[i].rect.height / p.workspace.height;
					// l = (p.objects[i].rect.left - p.workspace.left) / p.workspace.width;
					// t = (p.objects[i].rect.top - p.workspace.top) / p.workspace.height;

					// var widthString = $(".layoutSlide").css("width");
					// var heightString = $(".layoutSlide").css("height");

					// var pageSize = {
						// width: parseInt(widthString.substring(0, widthString.length - 2)),
						// height: parseInt(heightString.substring(0, heightString.length - 2)),
					// }

					// for(var j=0;j<docSlideStructure[idx].layout.boxes.length;j++) {
						// var label = docSlideStructure[idx].layout.boxes[j].type
						// var objID2 = docSlideStructure[idx].layout.mapping[label];

						// if(objID == objID2) {
							// flag = true;

							// docSlideStructure[idx].layout.boxes[j].height = pageSize.height * h;
							// docSlideStructure[idx].layout.boxes[j].width = pageSize.width * w;
							// docSlideStructure[idx].layout.boxes[j].left = pageSize.width * l;
							// docSlideStructure[idx].layout.boxes[j].top = pageSize.height * t;

							// break;
						// }
					// }

					// if(!flag) {
						// // newly created. add to docSlideStructure

						// if(docSlideStructure[idx].contents.list.length <= 0) {
							// var label = "BODY";
							// var cnt = 0;

							// docSlideStructure[idx].layout.boxes.push({
								// height: pageSize.height * h,
								// width: pageSize.width * w,
								// left: pageSize.width * l,
								// top: pageSize.height * t,
								// type: (label + "_" + cnt)
							// })

							// docSlideStructure[idx].layout.mapping["BODY_0"] = objID;
						// }
						// else {
							// var label = "BODY";
							// var cnt = 0;

							// for (var k in docSlideStructure[idx].layout.mapping) {
								// var l = k.split('_')[0];

								// if (label == l)
									// cnt++;
							// }

							// docSlideStructure[idx].layout.boxes.push({
								// height: pageSize.height * h,
								// width: pageSize.width * w,
								// left: pageSize.width * l,
								// top: pageSize.height * t,
								// type: (label + "_" + cnt)
							// })

							// docSlideStructure[idx].layout.mapping[label + "_" + cnt] = objID;
						// }
					// }
				// }

				// // content

				// if(curDocSlideStructureIndex == idx) {
					// var contents = p.objects;

					// var numParagraphsOnSlides = 0;

					// for(var i=0;i<contents.length;i++) {
						// numParagraphsOnSlides += Object.keys(contents[i].paragraph).length;
					// }

					// if(numParagraphsOnSlides == docSlideStructure[idx].contents.list.length) {
						// var objID = '';

						// for(var i=0;i<contents.length;i++) {
							// var objID = contents[i].objectID.split('-')[1];
							// var cur = -1;

							// for(var k in docSlideStructure[idx].layout.mapping) {
								// if(docSlideStructure[idx].layout.mapping[k] == objID) {
									// for(var j=0;j<docSlideStructure[idx].contents.list.length;j++) {
										// if(docSlideStructure[idx].contents.list[j].currentContent.label == k) {
											// cur = j;
											// break;
										// }
									// }
									// break;
								// }
							// }

							// if(cur == -1) {
								// console.log("*** SOMETHING WENT WRONG ***");
							// }
							// else {
								// for(var k in contents[i].paragraph) {
									// if(!docSlideStructure[idx].contents.list[cur].currentContent.label.startsWith("PICTURE"))  {
										// docSlideStructure[idx].contents.list[cur].currentContent.contents = contents[i].paragraph[k].text;

										// if(docSlideStructure[idx].contents.list[cur].mappingKey == "null") {
											// docSlideStructure[idx].contents.list[cur].originalContent.contents = contents[i].paragraph[k].text;
										// }
									// }

									// cur++;
								// }
							// }
						// }
					// }
					// else {

						// /*
						// var typeList = [];

						// for (var i = 0; i < docSlideStructure[idx].contents.list.length; i++) {
							// if (i == 0 || docSlideStructure[idx].contents.list[i].currentContent.label != docSlideStructure[idx].contents.list[i - 1].currentContent.label) {
								// typeList.push({
									// label: docSlideStructure[idx].contents.list[i].currentContent.label,
									// index: i
								// });
							// }
						// }

						// for (var i = 0; i < typeList.length; i++) {
							// var objID = docSlideStructure[idx].layout.mapping[typeList[i].label];
							// var labelIndex = typeList[i].index;

							// for (var j = 0; j < contents.length; j++) {
								// var objID2 = contents[j].objectID.split('-')[1];

								// if (objID == objID2) {
									// for (var k in contents[j].paragraph) {
										// var t = contents[j].paragraph[k].text;

									// }
								// }
							// }
						// }
						// */

						// var slideID = docSlideStructure[idx].slide.id;
						// var objID = '';

						// for(var i=0;i<contents.length;i++) {
							// var objID = contents[i].objectID.split('-')[1];
							// var pCnt = 0;
							// var firstIdx = -1, myLabel = -1;

							// for(var k in docSlideStructure[idx].layout.mapping) {
								// if(docSlideStructure[idx].layout.mapping[k] == objID) {
									// myLabel = k;

									// for(var j=0;j<docSlideStructure[idx].contents.list.length;j++) {
										// if(docSlideStructure[idx].contents.list[j].currentContent.label == k) {
											// pCnt++;
											// firstIdx = (firstIdx == -1 ? j : firstIdx);
										// }
									// }
									// break;
								// }
							// }

							// if(firstIdx == -1) { 
								// if(myLabel == -1)  {
									// console.log("*** SOMETHING WENT WRONG ***");
								// }
								// else {
									// docSlideStructure[idx].contents.list.push(
										// {
											// "mappingKey": "null",
											// originalContent: {
												// type: "text",
												// contents: ''
											// },
											// currentContent: {
												// label: myLabel,
												// type: "text",
												// contents: ''
											// }
										// }
									// )
									// slideDB[slideID][objID] = [{
										// mappingID: "null"
									// }]
								// }
							// }
							// else {
								// if(pCnt != Object.keys(contents[i].paragraph).length) {
									// var cur = 0;
									// var keys = Object.keys(contents[i].paragraph);
									// var startIdx = -1, endIdx = keys.length;

									// cur = firstIdx;
									// for(var j=0;j<keys.length;j++) {
										// if(cur < docSlideStructure[idx].contents.list.length && contents[i].paragraph[keys[j]].text == docSlideStructure[idx].contents.list[cur].currentContent.contents)
											// startIdx = j;
										// else break;

										// cur++;
									// }

									// cur = docSlideStructure[idx].contents.list.length-1;

									// for(var j=keys.length-1;j>=0;j--) {
										// if(cur >= 0 && contents[i].paragraph[keys[j]].text == docSlideStructure[idx].contents.list[cur].currentContent.contents)
											// endIdx = j;
										// else break;

										// cur--;
									// }

									// // contents added

									// docSlideStructure[idx].contents.list.splice(firstIdx+(startIdx+1), pCnt-(startIdx+1)-(keys.length-endIdx));

									// for(var j=firstIdx+(startIdx+1);j<(firstIdx+(startIdx+1) + (pCnt-(startIdx+1)-(keys.length-endIdx)));j++) {
										// if(j-firstIdx < slideDB[slideID][objID].length && slideDB[slideID][objID][j-firstIdx].mappingID != "null") {
											// issueEvent("root_mappingRemoved2", {
												// mappingID: slideDB[slideID][objID][j-firstIdx].mappingID
											// });
										// }
									// }

									// slideDB[slideID][objID].splice(startIdx+1, pCnt-(startIdx+1)-(keys.length-endIdx));

									// for (var j = firstIdx + (startIdx + 1); j <= firstIdx + (endIdx - 1); j++) {
										// console.log(j);

										// docSlideStructure[idx].contents.list.splice(j, 0, {
											// "mappingKey": "null",
											// originalContent: {
												// type: "text",
												// contents: ""
											// },
											// currentContent: {
												// label: myLabel,
												// type: "text",
												// contents: contents[i].paragraph[keys[j - firstIdx]].text
											// }
										// })

										// slideDB[slideID][objID].splice(j - firstIdx, 0, {
											// mappingID: "null"
										// })
									// }
								// }
							// }
						// }
					// }
				// }


				// // style

				// setDocSlideStructure(docSlideStructure);
				// showDocSlideView(idx);
				visualizeSlideObjects();

				// if (curDocSlideStructureIndex != idx && current_left_plane == "singleslide_layout") { // slide number changed
					// getAlternativeSlides(idx, "layoutAlternative");
				// }

				// if (curDocSlideStructureIndex != idx && current_left_plane == "singleslide_style") { // slide number changed
					// getAlternativeSlides(idx, "styleAlternative");
				// }


				// if(docSlideStructure[idx].type == "hidden") showReviewSlide();
				// else hideReviewSlide();

				// curDocSlideStructureIndex = idx;

				// hideLoadingSlidePlane();
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
			}
		});

		$(document).on("extension_filmstripInfo", function(e) {
			console.log(e);

		})

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

	$(document).on("click", ".textShorteningViewAlternativeTextItem", function(e) {
		showLoadingSlidePlane();

		console.log($(e.target));

		var text = $(e.target).html();
		var cur = $(e.target);

		for (var i = 0; i < 100; i++) {
			console.log($(cur));
			console.log($(cur).hasClass("textShorteningViewAlternativeTextDiv"));

			if ($(cur).attr("id") == "textShorteningViewAlternativeTextDiv")
				break;

			cur = $(cur).parent();
		}

		console.log($(cur));

		var slideIndex = parseInt($(cur).attr("slideindex"));
		var resourceIndex = parseInt($(cur).attr("resourceindex"));
		
		console.log(slideIndex, resourceIndex);

		docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.contents = text;

		if(docSlideStructure[slideIndex].contents.list[resourceIndex].mappingKey == "null")
			docSlideStructure[slideIndex].contents.list[resourceIndex].originalContent.contents = text;

		var slideID = docSlideStructure[slideIndex].slide.id;
		var label = docSlideStructure[slideIndex].contents.list[resourceIndex].currentContent.label;
		var objectID = docSlideStructure[slideIndex].layout.mapping[label];
		var pIndex =  getParagraphIndexOfDocSlideStructure(slideIndex, resourceIndex);

		replaceParagraph(slideID, objectID, pIndex, text);
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

		$(document).on("pdfjs_addSegment", function(e) {
			var p = e.detail;

			var startX = outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endX;
			var duration = 1;
			var width = duration / curPresentationDuration * $("#outlineSegmentEvent").width();
			var endX = startX + width;

			var slideID = makeid(10);
			var slideIndex = outlineStructure.length <= 0 ? 2 : outlineStructure[outlineStructure.length-1].endSlideIndex+1;

			outlineStructure.push({
				messages: [],
				status: "ready_slide",
				startX: startX,
				endX: endX,
				duration: duration,
				startSlideID: slideID,
				startSlideIndex: slideIndex,
				endSlideIndex: slideIndex,
				slideIDs: [slideID],
				colorCode: genColor(),
				startTime: outlineStructure.length <= 0 ? 0 : outlineStructure[outlineStructure.length-1].endTime,
				endTime: (outlineStructure.length <= 0 ? duration : outlineStructure[outlineStructure.length-1].endTime + duration),
				label: p.title
			})

			console.log(outlineStructure);

			var requests = [];

			requests.push({
				createSlide: {
					objectId: slideID,
					insertionIndex: slideIndex-1,
					slideLayoutReference: {
						predefinedLayout: 'TITLE_AND_BODY'
					},
					/*
					placeholderIdMappings: [{
						objectId: titleObjectID,
						layoutPlaceholder: {
							type: "TITLE",
							index: 0
						}
					}, {
						objectId: bodyObjectID,
						layoutPlaceholder: {
							type: "BODY",
							index: 0
						}
					}
					]*/
				}
			});

			showLoadingSlidePlane();
			waitingOutlineIndex = outlineStructure.length-1;

			gapi.client.slides.presentations.batchUpdate({
				presentationId: PRESENTATION_ID,
				requests: requests
			}).then((createSlideResponse) => {
				console.log(createSlideResponse);
			});

			console.log(p);

			registerHighlight(p).then(mapping => {
				console.log(mapping);

				addMessage(outlineStructure.length-1, p.body, mapping.key);
					
				issueEvent("root_sendMappingIdentifier", {
					mappingID: mapping.key,
					pageNumber: p.pageNumber,
					startWordIndex: p.startWordIndex,
					endWordIndex: p.endWordIndex
				});
			});

			updateOutlineSegments();
		})

		$(document).on("pdfjs_getSectionTitle", function(e) {
			var p = e.detail;

			console.log(p);
			console.log(structureHighlightDB);

			var result = '';

			for(var k in structureHighlightDB) {
				console.log(k);

				if(structureHighlightDB[k].pageNumber < p.pageNumber || 
				   structureHighlightDB[k].pageNumber == p.pageNumber && 
					structureHighlightDB[k].startWordIndex <= p.startWordIndex) result = structureHighlightDB[k].text;
				else break;
			}

			issueEvent("root_getSectionTitle", { title: result });
		});

		$(document).on("pdfjs_addHighlight", function(e) {
			var p = e.detail;

			console.log(p);

			var flag = false;
			var index = -1;

			for(var i=0;i<outlineStructure.length;i++) {
				if(outlineStructure[i].label == p.title) {
					flag = true;
					index = i;

					break;
				}
			}

			if(!flag) {
				issueEvent("root_segmentNotFound", p);
			}
			else {
				registerHighlight(p).then(mapping => {
					console.log(mapping);

					addMessage(index, p.text, mapping.key);

					issueEvent("root_sendMappingIdentifier", {
						mappingID: mapping.key,
						pageNumber: p.pageNumber,
						startWordIndex: p.startWordIndex,
						endWordIndex: p.endWordIndex
					});
				});

				updateMessageBox();
			}
		})

		$(document).on("pdfjs_highlighted", function(e) {
			var p = e.detail;
//			var info = organizeHighlightOnSections();

		// 	showLoadingSlidePlane();

			registerHighlight(p).then(mapping => {
				/*
				return automaticallyPutContents(p, mapping).then(() => {
					issueEvent("root_sendMappingIdentifier", {
						mappingID: mapping.key,
						pageNumber: p.pageNumber,
						startWordIndex: p.startWordIndex,
						endWordIndex: p.endWordIndex
					});
				})
				*/
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
	
		$(document).on("click", "#imageQueryKeywordAddBtn", function(e) {

		})

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

		$(document).on("mouseenter", ".thumbnailBoxTop, .thumbnailBoxBottom", function(e) {
			if (rowSelected) {
				var t = e.target;

				console.log(t);

				$(t).addClass("mousein");
			}
		});

		$(document).on("mouseenter", ".thumbnailBoxMiddle", function(e) {
			if (rowSelected) {
				var t = $(e.target).parent();

				console.log(t);

				var top = $(t).find(".thumbnailBoxTop")[0];
				var middle = $(t).find(".thumbnailBoxMiddle")[0];
				var bottom = $(t).find(".thumbnailBoxBottom")[0];

				$(top).addClass("mouseMiddleIn");
				$(middle).addClass("mousein");
				$(bottom).addClass("mouseMiddleIn");
			}
		});

		$(document).on("mouseleave", ".thumbnailBoxTop, .thumbnailBoxMiddle, .thumbnailBoxBottom", function(e) {
			if(rowSelected) {
				console.log("leave");

				$(".mousein").removeClass("mousein");
				$(".mouseMiddleIn").removeClass("mouseMiddleIn");
			}
		});

		$(document).on("mouseenter", ".temptemp.upper", function(e) {
			if (rowSelected) {
				var t = e.target;

				$(t).addClass("mousein");
			}
		})

		$(document).on("mouseenter", ".temptemp.lower", function(e) {
			if (rowSelected) {
				var t = e.target;

				$(t).addClass("mousein");
			}
		})

		$(document).on("mouseleave", ".temptemp", function(e) {
			if(rowSelected) {
				console.log("leave");

				$(".mousein").removeClass("mousein");
			}
		})

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

		updates['/users/' + userName + '/slideInfo/' + elem.pageID + '/' + elem.objID + '/' + elem.paragraphIndex] = {
			mappingID: elem.mappingID
		}

		if(slideDB == null) slideDB = {};
		if(!(elem.pageID in slideDB)) slideDB[elem.pageID] = {};
		if(!(elem.objID in slideDB[elem.pageID])) slideDB[elem.pageID][elem.objID] = [];

		updates['/users/' + userName + '/slideInfo/' + elem.pageID + '/' + elem.objID + '/' + elem.paragraphIndex] = {
			mappingID: elem.mappingID 
		}
		slideDB[elem.pageID][elem.objID][elem.paragraphIndex] = {
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

function getThumbnailOfOriginalSlide(refSlideID, template_id) {
	if(refSlideID == null) return '';
	if(!(refSlideID in slideDeckInfo)) return '';
	
	for(var i=0;i<slideDeckInfo[refSlideID].length;i++) {
		if(slideDeckInfo[refSlideID][i].slideID == template_id) {
			return slideDeckInfo[refSlideID][i].thumbnailURL;
		}
	}

	return '';
}

function getStyle(slideID, styleSlideID) {
	retValue = JSON.parse(JSON.stringify(referenceStyle[slideID][styleSlideID]));

	return JSON.parse(JSON.stringify({
		slideID: styleSlideID,
		styles: referenceStyle[slideID][styleSlideID].styles
	}));
}

function getLayout(slideID, layoutSlideID) {
	console.log(slideID, layoutSlideID);
	retValue = JSON.parse(JSON.stringify(referenceLayout[slideID][layoutSlideID]));

	for(var i=0;i<retValue.boxes.length;i++) {
		retValue.boxes[i].top = retValue.boxes[i].top * 0.6;
		retValue.boxes[i].left = retValue.boxes[i].left * 0.6;
		retValue.boxes[i].height = retValue.boxes[i].height * 0.6;
		retValue.boxes[i].width = retValue.boxes[i].width* 0.6;
	}

	return retValue;
}

function getAdaptationViewBodyLayout(idx) {
	var retString = '';

	var ratio = 0.6;

	if (referenceSlideID != null && referenceSlideID in referenceLayout) {
		var width = docSlideStructure[idx].layout.pageSize.width;
		var height = docSlideStructure[idx].layout.pageSize.height;
		var url = docSlideStructure[idx].layout.thumbnailURL;

		var innerString = '';

		for (var j = 0; j < docSlideStructure[idx].layout.boxes.length; j++) {
			var box = docSlideStructure[idx].layout.boxes[j];

			innerString += '<div id="' + box.id + '" class="layoutInnerBox"' +
				' style="top: ' + box.top + 'px; ' +
				'left: ' + box.left + 'px; ' +
				'width: ' + box.width + 'px; ' +
				'height: ' + box.height + 'px;" type="' + box.type + '"> ' +
				(box.type.split('_')[0]) + '<sub>' + (box.type.split('_')[1]) + '</sub>' + 
				'</div> '
		}

		retString = retString +
			'<div class="layoutSlide" ' +
			'style="width: ' + width * ratio + 'px; ' +
			'height: ' + height * ratio + 'px; ' + 
			// 'background-image: url(' + url + '); ' + 
			// 'background-size: contain; ' + 
			// 'background-repeat: no-repeat; ' + 
			'top: calc(50% - ' + (height * ratio / 2) + 'px); ' + 
			'left: calc(50% - ' + (width * ratio / 2) + 'px); ' + 
			'"> ' +

			innerString +
			'</div>'
	}

	return retString;
}
function getAdaptationViewBodyStyle(idx)  {
	var resultString = '';
	var styleSlideID = docSlideStructure[idx].style.slideID;

	var obj = docSlideStructure[idx].style.styles; 
	var retString = '';

	for (var type in obj) {
		retString = retString + (retString == '' ? '' : '<br>') + type + " { ";

		for (var k in obj[type]) {
			if (k != "type" && k != "recommendedLength") {
				if (k == "foregroundColor") {
					retString = retString + '<br> &emsp;' + k + ': ' + '<div class="fontForegroundColorDiv" style="background-color: rgb(' + obj[type][k].rgbColor.red * 255 + ", " + obj[type][k].rgbColor.green * 255 + ", " + obj[type][k].rgbColor.blue * 255 + ');")> </div>'
				}
				else if (k == "fontSize") {
					retString = retString + '<br> &emsp;' + k + ': ' + obj[type][k].toFixed(2);
				}
				else {
					retString = retString + '<br> &emsp;' + k + ': ' + obj[type][k];
				}
			}
		}
		retString = retString + "<br> }"
	}

	return retString;
}

function getLayoutTypes(index) {
	var layoutID = docSlideStructure[index].layout.slideId;
	var layoutBoxes = docSlideStructure[index].layout.boxes;
	var returnValue = [];

	for(var i=0;i<layoutBoxes.length;i++) {
		var boxID = '';

		if("id" in layoutBoxes[i]) boxID = layoutBoxes[i].id;
		else {
			boxID = makeid(10);
			layoutBoxes[i].id = boxID;
		}

		returnValue.push({
			id: boxID,
			type: layoutBoxes[i].type
		})
	}

	return returnValue;
}

function getAdaptationViewBodyContents(index) {
	var resultString = '';

	var boxTypes = getLayoutTypes(index);
	var curDivID = makeid(10);

	if(("contents" in docSlideStructure[index]) && ("list" in docSlideStructure[index].contents) && docSlideStructure[index].contents.list.length > 0) {
		for(var i=0;i<docSlideStructure[index].contents.list.length;i++) {
			var item = docSlideStructure[index].contents.list[i];
			var layoutID = docSlideStructure[index].layout.slideId;

			/*
			var typeOptionString = '';

			for(var j=0;j<boxTypes.length;j++) {
				typeOptionString += '<option value="'+ boxTypes[j].type +'" ' + (boxTypes[j].type == item.currentContent.label? "selected='selected'" : "") + '>' + boxTypes[j].type + '</option>';
			}
			*/

			if(i == 0 || docSlideStructure[index].contents.list[i].currentContent.label != docSlideStructure[index].contents.list[i-1].currentContent.label) {
				resultString += (resultString != '' ? "</div></div>" : '') + 
					"<div class='adaptationViewDocumentLabelDiv' label='" + docSlideStructure[index].contents.list[i].currentContent.label + "'> " + 
						"<div class='adaptationViewDocumentLabelDivHeader'> <span class='adaptationViewDocumentLabelDivHeaderSpan'> " + 
							docSlideStructure[index].contents.list[i].currentContent.label.split('_')[0] + '<sub>' + docSlideStructure[index].contents.list[i].currentContent.label.split('_')[1] + "</sub></span> </div>" +
						"<div class='adaptationViewDocumentLabelDivBody'>";
			}

			/*
			resultString += "<tr class='adaptationTableRow' slideIndex='" + index + "' resourceIndex='" + i + "'>" +
								"<td class='adaptationTableIndex'>" + 
									'<select class="adaptationTableLabelSelector" name="adaptationTableLabelSelector">' + 
										typeOptionString +
									'</select>' + 

								"</td>" +
								"<td class='adaptationTableResourceBody'>" + item.originalContent.contents + 
									"<div class='temptemp upper'> </div>" + 
									"<div class='temptemp lower'> </div>"
								"</td>" +
							"</tr>"
							*/

			resultString += "<div class='adaptationTableResourceBody' slideIndex='" + index + "' resourceIndex='" + i + "'>" + 
					( item.currentContent.label.startsWith("PICTURE") ? "<img class='adaptationTableImage' src='" + item.currentContent.contents + "'> </img>" : item.currentContent.contents ) + 
									"<div class='temptemp upper'> </div>" + 
									"<div class='temptemp lower'> </div>" +
									"<button class='resourceRemoveBtn'> X </button>" + 
								"</div>";
		}

		resultString += "</div></div>";

		// console.log(resultString);

		return resultString;
	}
	else return '';
}

function getDocSlideStructureView(index) {
	if(docSlideStructure.length <= 0) return '';

	var tableBody = '';

	return '';
	
	// "<div class='adaptationViewDiv' index='" + index + "' " + ("slide" in docSlideStructure[index] && "id" in docSlideStructure[index].slide ? ("slideid='" + docSlideStructure[index].slide.id) + "'": '') + ">" +
		// "<div class='adaptationViewDocument'>" +
		// // "<table class='adaptationViewDocumentTable'>" +
			// getAdaptationViewBodyContents(index) + 
		// // "</table>" +
		// "</div>" +

		// "<div class='adaptationViewBodyLayout'> " +
		// getAdaptationViewBodyLayout(index) +
		// "</div>" +
		// "<div class='adaptationViewBodyStyle'> " +
		// getAdaptationViewBodyStyle(index) +
		// "</div>" +

		// // "<div class='adaptationViewSlide'>" +
		// // "</div>" +
		// "</div>";

/*
	if (docSlideStructure[index] != null && "slide" in docSlideStructure[index]) {
		var pageID = docSlideStructure[index].slide.id;

		var resources = getResources(pageID);
		var __tableBody = '';

		console.log(resources);

		for (var j = 0; j < resources.length; j++) {
			__tableBody = __tableBody +
				"<tr class='adaptationTableRow' slideIndex='" + index + "' resourceIndex='" + j + "'>" +
					"<td class='adaptationTableIndex'>" + (j + 1) + 

					'<select class="adaptationTableTypeSelector" name="adaptationTableTypeSelector">' + 
  						'<option value="text" ' + (docSlideStructure[index].resources[j].currentContent.type == "text" ? "selected='selected'" : "") + '>Text</option>' + 
  						'<option value="image" ' + (docSlideStructure[index].resources[j].currentContent.type == "image" ? "selected='selected'" : "") + '>Image</option>' + 
					'</select>' + 

					"</td>" +
					"<td class='adaptationTableResourceBody'>" + resources[j] + 
					"<div class='temptemp upper'> </div>" + 
					"<div class='temptemp lower'> </div>"
					"</td>" +
				"<tr>"
		}

		tableBody = tableBody +
			"<div class='adaptationViewDiv' index='" + index + "' slideID='" + docSlideStructure[index].slide.id + "'>" +

				"<div class='adaptationViewDocument'>" +
					"<table class='adaptationViewDocumentTable'>" +
						__tableBody +
					"</table>" +
				"</div>" +

				"<div class='adaptationViewBodyLayout'> " + 
					getAdaptationViewBodyLayout() + 
				"</div>" + 
				"<div class='adaptationViewBodyStyle'> " + 
					getAdaptationViewBodyStyle() + 
				"</div>" + 

			// "<div class='adaptationViewSlide'>" +
				// "<img class='adaptationViewSlideThumbnail' src='" + getThumbnailOfOriginalSlide(referenceSlideID, docSlideStructure[index].template.id) + "'> </img>" + 
			// "</div>" +
			"</div>";
	}
	else {
		tableBody = tableBody +
			"<div class='adaptationViewDiv' index='" + index + "'>" +
				"<div class='adaptationViewDocument'>" +
				"<table class='adaptationViewDocumentTable'>" +
				"</table>" +
				"</div>" +

				"<div class='adaptationViewBodyLayout'> " + 
					getAdaptationViewBodyLayout() + 
				"</div>" + 
				"<div class='adaptationViewBodyStyle'> " + 
					getAdaptationViewBodyStyle() + 
				"</div>" + 

			// "<div class='adaptationViewSlide'>" +
			// "</div>" +
			"</div>";
	}
	*/

	return tableBody;
}

function isPossibleToAdd(dsStructure) {
	if(dsStructure.contents.list.length <= 3) return true;
	else return false;
}

async function getShortening(text) {
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(
			{
				"content": {
					"text": text
				}
			}
		),
	};

	var res = await fetch(API_URL+'get_shortenings_abstract', requestOptions)
		.then(response => response.json())
		.then(data => {
			return data;
		});

	return res;
}

function findShortening(key) {
	for (var pgNumber in highlightDB.mapping) {
		if(key in highlightDB.mapping[pgNumber]) {
			console.log(highlightDB.mapping[pgNumber][key]);

			return highlightDB.mapping[pgNumber][key].shortening;
		}
	}

	console.log("****** SHORTENING NOT FOUND *****")
	return -1;
}

function updateSlideThumbnail() {
	issueEvent("root_updateSlideThumbnail", docSlideStructure);
}

function putContentsToDocSlide(index, c) {
	showLoadingSlidePlane();

	var label = '';
	var idx = -1;

	console.log(JSON.parse(JSON.stringify(docSlideStructure)));

	for(var i=docSlideStructure[index].contents.list.length-1;i>=0;i--) {
		var l = docSlideStructure[index].contents.list[i].currentContent.label;

		if(!l.startsWith("PICTURE")) {
			label = l;
			idx = i;
			break;
		}
	}

	if(label == '') {
		console.log("*** SOMETHING WENT WRONG ***");
	}

	var slideID = docSlideStructure[index].slide.id;
	var objID = docSlideStructure[index].layout.mapping[label];
	var text = c.contents;
	var mappingID = c.mapping;

	docSlideStructure[index].contents.list.splice(idx+1, 0, {
		"mappingKey": c.mapping,
		originalContent: {
			type: c.type,
			contents: c.contents
		},
		currentContent: {
			label: label,
			type: c.type,
			contents: c.contents
		}
	});

	locateSlide(slideID);

	updateDocSlideToExtension();
	setDocSlideStructure(docSlideStructure);
	showDocSlideView(index);

	console.log(slideID, objID, text, mappingID);

	appendText(slideID, objID, text, mappingID);
}

function updateDocSlideToExtension() {
	issueEvent("root_updateDocSlideStructure", docSlideStructure);
}

async function automaticallyPutContents(textInfo, mapping) {
	var sectionKey = getSectionKey(textInfo.pageNumber, textInfo.startWordIndex, textInfo.endWordIndex);

	var flag = false;
	var index = -1;

	for(i=docSlideStructure.length-1;i>=1;i--) {
		if(docSlideStructure[i].contents.sectionKey == sectionKey) {
			index = i;
			
			if(docSlideStructure[i].type != "visible" && isPossibleToAdd(docSlideStructure[i])) flag = true;

			break;
		}
	}

	var resourceIndex = -1;

	if(flag) { // add to the current slide
		docSlideStructure[index].layoutAlternative.loaded = false;
		docSlideStructure[index].layoutAlternative.loadStarted = false;
		docSlideStructure[index].layoutAlternative.result = [];

		docSlideStructure[index].styleAlternative.loaded = false;
		docSlideStructure[index].styleAlternative.loadStarted = false;
		docSlideStructure[index].styleAlternative.result = [];

		putContentsToDocSlide(index, {
			type: "text",
			contents: mapping.text,
			mapping: mapping.key
		})
	}
	else {
		showLoadingSlidePlane();

		if(index == -1) { // create the section
			index = 0;

			for(var i=docSlideStructure.length-1;i>=1;i--) {
				if ("sectionKey" in docSlideStructure[i].contents) {
					var sectionIdx = parseInt(docSlideStructure[i].contents.sectionKey.substring(20));
					var myIdx = parseInt(sectionKey.substring(20));

					if (sectionIdx < myIdx) {
						index = i;
						break;
					}
				}
			}
		}

		// add a new slide to (index+1)

		var titleID = makeid(10);
		var bodyID = makeid(10);
		var slideID = makeid(10);

		// var shorteningResult = findShortening(mapping.key);

		// console.log(shorteningResult);

		docSlideStructure.splice(index+1, 0, {
			type: "hidden",
			contents: {
				sectionKey: sectionKey,
				list: [{
					mappingKey: "null",
					originalContent: {
						type: "text",
						contents: structureHighlightDB[sectionKey].text,
					},
					currentContent: {
						type: "text",
						label: "HEADER_0",
						contents: structureHighlightDB[sectionKey].text,
					},
				},
				{
					mappingKey: mapping.key,
					originalContent: {
						type: "text",
						contents: mapping.text,
					},
					currentContent: {
						type: "text",
						label: "BODY_0",
						contents: mapping.text,
					},
				}]
			},
			layout: {
				mapping: {
					"HEADER_0": titleID,
					"BODY_0": bodyID
				},
				...getLayout(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
			},
			style: {
				...getStyle(DEFAULT_SLIDE_ID, "ge93a171212_0_5")
			},
			slide: {
				id: slideID,
				objs: [{
					id: titleID
					},
					{
						id: bodyID
					}
				]
			},
			layoutAlternative: {
								loaded: false,
								loadStarted: false,
								result: []
			},
			styleAlternative: {
								loaded: false,
								loadStarted: false,
								result: []
						},
			previousVersion: null
			/*
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
			*/
		});

		locateSlide(slideID);
		updateDocSlideToExtension();
		curDocSlideStructureIndex = index+1;

		setDocSlideStructure(docSlideStructure);

		// showReviewSlide(index+1);
		showDocSlideView(curDocSlideStructureIndex);
		// locateSlide(docSlideStructure[index+1].slide.id, true)

		resourceIndex = 0;

		console.log(JSON.parse(JSON.stringify(docSlideStructure)));

		// firebase.database().ref("/users/" + userName + '/docSlideStructure').set(docSlideStructure);


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

		if(!(slideID in slideDB)) slideDB[slideID] = {};

		slideDB[slideID][titleID] = [];
		slideDB[slideID][titleID].push({mappingID: "null"});

		var updates = {};

		// updates['/users/' + userName + '/structureHighlightInfo/' + sectionKey] = structureHighlightDB[sectionKey];

		firebase.database().ref().update(updates);

		gapi.client.slides.presentations.batchUpdate({
			presentationId: PRESENTATION_ID,
			requests: requests
		}).then((createSlideResponse) => {
			// successfully pasted the text

			writeSlideMappingInfo(slideID, bodyID, 0, mapping.key).then( () => {
				/*
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
				*/
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

			console.log(createSlideResponse);
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
