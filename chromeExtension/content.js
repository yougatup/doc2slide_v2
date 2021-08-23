var eventList = {
	"pdfjs_renderFinished": ['pdfjs', 'root'],
	"pdfjs_checkPreprocessed": ['pdfjs', 'root'],
	"root_checkPreprocessed": ['root', 'pdfjs'],
	"pdfjs_pageRendered": ['pdfjs', 'root'],
	"pdfjs_highlighted": ['pdfjs', 'root'],
	"root_sendMappingIdentifier": ['root', 'pdfjs'],
	"root_sendMappingIdentifier_2": ['root', 'pdfjs'],
	"root_openPDF": ['root', 'pdfjs'],
	"pdfjs_removeMapping": ['pdfjs', 'root'],
	"root_mappingRemoved": ['root', 'pdfjs'],
	"root_mappingRemoved2": ['root', 'pdfjs'],
	"pdfjs_extensionTemp": ['pdfjs', 'extension'],
	"extension_focusObject": ['extension', 'root'],
	"extension_pageUpdated": ['extension', 'root'],
	"extension_typing": ['extension', 'root'],
	"root_setSlideState": ['root', 'extension'],
	"root_navigateToWord": ['root', 'pdfjs'],
	"root_getLastObject": ['root', 'extension'],
	"extension_getLastObject": ['extension', 'root'],
	"root_getOriginalText": ['root', 'pdfjs'],
	"pdfjs_getOriginalText": ['pdfjs', 'root'],
	"root_getStructureHighlight": ['root', 'pdfjs'],
	"pdfjs_getStructureHighlight": ['pdfjs', 'root'],
	"root_updatePdfTextSection": ['root', 'pdfjs'],
	"extension_mouseup": ["extension", "root"],
	"root_getSlideIndex": ["root", "extension"],
	"extension_getSlideIndex": ["extension", "root"],
	"pdfjs_getDocumentStructure": ["pdfjs", "root"],
	"root_getDocumentStructure": ["root", "pdfjs"],
	"extension_hideLoading": ["extension", "root"],
	"root_updateSlideThumbnail": ["root", "extension"],
	"extension_reviewSelected": ["extension", "root"],
	"extension_thumbnailSelected": ["extension", "root"],
	"root_locateSlide": ["root", "extension"],
	"root_updateDocSlideStructure": ["root", "extension"]
}

var locateSlideID = '';
var locateFlag = false;

var curSlideState = "WAIT";
var curMonitoringParagraph = null;
var removedBorderList = [];
var docSlideStructure = [];

function issueEvent(eventName, data) {
    var myEvent = new CustomEvent(eventName, {detail: data} );

    // window.postMessage(eventName, "*");

    document.dispatchEvent(myEvent);
}

function chromeSendMessage(type, data) {
    chrome.runtime.sendMessage({
        "type": type,
        "data": data
    });
}

function focusObject(objID) {
	var obj = $("#" + objID);
	var workspace = $("#workspace-container");

	var r1 = document.getElementById(objID).getBoundingClientRect()
	var r2 = document.getElementById("workspace-container").getBoundingClientRect()

	issueEvent("extension_focusObject", {
		child: r1,
		parent: r2
	});
}

function filmstripUpdated(mutationsList) {
	console.log(mutationsList);

	var flag = false;

	for(var i=0;i<mutationsList.length;i++) {
		if(mutationsList[i].addedNodes.length > 0 && ((
			mutationsList[i].addedNodes[0].id != null && 
			mutationsList[i].addedNodes[0].id.startsWith("filmstrip-slide-")) || (
				mutationsList[i].addedNodes[0].classList != null && mutationsList[i].addedNodes[0].classList.contains("punch-filmstrip-thumbnail")
			))
			) {
				console.log(mutationsList[i].addedNodes[0]);
				flag = true;
			}

		if(mutationsList[i].removedNodes.length > 0 && ((
			mutationsList[i].removedNodes[0].id!= null && 
			mutationsList[i].removedNodes[0].id.startsWith("filmstrip-slide-")) || (
				mutationsList[i].removedNodes[0].classList != null && mutationsList[i].removedNodes[0].classList.contains("punch-filmstrip-thumbnail")
			))
			) {
				console.log(mutationsList[i].removedNodes[0]);
				flag = true;
			}

		if(flag) {
			updateFilmstripFromDocSlideStructure();
			locateSlideIfExist();
			issueEvent("extension_hideLoading", null);
			// pageUpdated();
			return;
		}
	}
}

function locateSlideIfExist() {
	if(locateFlag) {
		for(var i=0;i<docSlideStructure.length;i++) {
			if(docSlideStructure[i].slide.id == locateSlideID) {
				window.location.hash = "slide=id." + locateSlideID;
				break;
			}
		}
	}
}

function updateFilmstripFromDocSlideStructure() {
	var retValue = [];
	$(".punch-filmstrip-thumbnail").each(function () {
		var y_coordinate = $(this).attr("transform").split(' ')[1];
		y_coordinate = y_coordinate.substr(0, y_coordinate.length - 1);

		retValue.push({
			outerObj: $(this).find(".punch-filmstrip-thumbnail-background")[0],
			innerObj: $(this).find(".punch-filmstrip-thumbnail-border-inner")[0],
			y_coordinate: parseInt(y_coordinate)
		})
	});

	retValue.sort(function (first, second) {
		if (first.y_coordinate > second.y_coordinate) return 1;
		else if (first.y_coordinate == second.y_coordinate) return 0;
		else return -1;
	});

	// console.log(retValue);
	// console.log(docSlideStructure);

	for(var i=0;i<docSlideStructure.length;i++) {
		if(docSlideStructure[i].type == "hidden") {
			$(retValue[i].outerObj).addClass("hidden");
			$(retValue[i].innerObj).addClass("hidden");
		}
		else {
			$(retValue[i].innerObj).removeClass("hidden");
			$(retValue[i].outerObj).removeClass("hidden");
		}
	}
}

function pageUpdated(mutationsList) {

	// console.log($("g[pointer-events='visiblePainted']").children())
	// console.log($("g[pointer-events='visiblePainted']").children("path[stroke='#1a73e8'], path[fill='#1a73e8']"))	

	/*
	$("g[pointer-events='visiblePainted']").children("path[stroke='#1a73e8']").attr("stroke", null);
	$("g[pointer-events='visiblePainted']").children("path[fill='#1a73e8']").attr("fill", null);
	$("path[stroke='#8ab4f8'][stroke-opacity='0.6']").attr("stroke", null);
	*/

	if(curSlideState == "WAIT") {
		var clickedElement = $("g[pointer-events='visiblePainted']").children("path[stroke='#1a73e8']").length;

		if(clickedElement > 0) {
			issueEvent("extension_objClicked", null);
		}
		else
		 	issueEvent("extension_objNotClicked", null);

		function get_common_ancestor(a, b)
			{
			$parentsa = $(a).parents();
			$parentsb = $(b).parents();
			
			var found = null;
			
			$parentsa.each(function() {
			    var thisa = this;
			
			    $parentsb.each(function() {
			    if (thisa == this)
			    {
			        found = this;
			        return false;
			    }
			    });
			
			    if (found) return false;
			});
			
			return found;
		}

		function DOMtoList(doms) {
			var retValue = [];

			for(var i=0;i<doms.length;i++) {
				retValue.push($(doms[i]).attr("id"));
			}

			return retValue;
		}

    	function getPageID() {
			var retValue = null;

			$(".punch-filmstrip-selected-thumbnail-pagenumber").each(function() {
			    var thumbnaileObj = this;

			    $("g[id^='filmstrip-slide-']").each(function() {
				var id = $(this).attr("id");

				if(id.endsWith("-bg")) {
				    var commonAncestor = get_common_ancestor(thumbnaileObj, this);

				    if($(commonAncestor).is("g")) {

					var splitted = $(this).attr("id").split("-");
					var pageId = splitted[3];

					retValue = pageId;

					return false;
				    }
				}
			    });
			});

			if(retValue == null) return window.location.hash.substr(10);
			else return retValue;
    	}

		// console.log("Page Updated : " + getPageID());

		var retValue = [];
		var filmstripInfo = [];
		var noteSpace = -1;
		
		$("[id^='speakernotes-workspace']").each(function() {
			noteSpace = {
				rect: document.getElementById($(this).attr("id")).getBoundingClientRect(),
			}
		});

		$("[id^='filmstrip-slide-'][id$='-bg']").each(function() {
			console.log($(this).attr("id"));

			filmstripInfo.push({
				filmstripID: $(this).attr("id"),
				rect: document.getElementById($(this).attr("id")).getBoundingClientRect(),
				pageNumber: $(this).attr("id").split('-')[2],
				pageID: $(this).attr("id").split('-')[3]
			});
		});

		$("#editor-" + getPageID()).children("g:not([id$='-bg'])").map((key, value) => { 
			var paragraphs = DOMtoList($(value).find("[id*='-paragraph-']"));
			var res = $(value).find("image");
			var paragraphInfo = {};

			if($(res).length <= 0) {  // text

				paragraphs.forEach(function(elem) {
					paragraphInfo[elem] = document.getElementById(elem).getBoundingClientRect();
				});

				retValue.push({
					objectID: $(value).attr("id"),
					rect: document.getElementById($(value).attr("id")).getBoundingClientRect(),
					paragraph: paragraphInfo
					// rect: $(value).getBoundingClientRect()
				});
			} 
			else { // image
				paragraphInfo[0] = $(res)[0].getBoundingClientRect();

				retValue.push({
					objectID: $(value).attr("id"),
					rect: document.getElementById($(value).attr("id")).getBoundingClientRect(),
					paragraph: paragraphInfo
					// rect: $(value).getBoundingClientRect()
				});
			}
		});

		issueEvent("extension_pageUpdated", {
			pageID: getPageID(),
			objects: retValue,
			filmstrip: filmstripInfo,
			workspace: document.getElementById("canvas-container").getBoundingClientRect(),
			notespace: noteSpace,
		});
	}
	else if(curSlideState == "EDIT") {
		issueEvent("extension_typing", {
			paragraphRect: document.getElementById(curMonitoringParagraph).getBoundingClientRect()
		});
	}
}

function setObserver() {
	console.log(document.getElementById("pages"));
	console.log(document.getElementById("filmstrip"));

	pageUpdated();

	if(document.getElementById("pages") != null) {
		pageUpdateObserver = new MutationObserver(pageUpdated);

		pageUpdateObserverConfig = { attributes: true, subtree: true };
		pageUpdateObserver.observe(document.getElementById("pages"), pageUpdateObserverConfig);
	}

	if(document.getElementById("filmstrip") != null) {
		filmstripObserver = new MutationObserver(filmstripUpdated);

		filmstripObserverConfig = { subtree: true, childList: true };
		filmstripObserver.observe(document.getElementById("filmstrip"), filmstripObserverConfig);
	}
}

function chromeExtensionBody() {
	setObserver();

	$(document).on("click", "#filmstrip", function(e) {

		if($(e.target).hasClass("testtest")) {
			$(".testtest.selected").removeClass("selected");

			$(e.target).addClass("selected");

			console.log($(e.target));

			var slideID = $(e.target).attr("slideid");

			console.log(slideID);

			issueEvent("extension_reviewSelected", {
				slideID: slideID,
				pageRect: $("#pages").find("svg")[0].getBoundingClientRect()
			});
		}
		else {
			/*
			console.log($(".testtest"));
			console.log($(".testtest.selected"));

			$(".testtest.selected").removeClass("selected");
			issueEvent("extension_thumbnailSelected", null);
			*/
		}
	})

	$(document).on("mouseup", function(e) {
		var clickedElement = $("g[pointer-events='visiblePainted']").children("path[stroke='#1a73e8']").length;
		var clickedSlide = $(".punch-filmstrip-thumbnail").children("rect[style='stroke: rgb(242, 153, 0); stroke-width: 3px;']").length;
/*
		console.log(clickedElement);
		console.log(clickedSlide);
		*/

		issueEvent("extension_mouseup", {
			clickedElement: clickedElement,
			clickedSlide: clickedSlide
		});
	})

	$(document).on("root_updateDocSlideStructure", function(e) {
		docSlideStructure = e.detail;

		console.log(docSlideStructure);
	});

	$(document).on("root_locateSlide", function(e) {
		var p = e.detail;

		locateFlag = true;
		locateSlideID = p.slideID;
	})

	$(document).on("root_getSlideIndex", function(e) {
		var retValue = [];

		$("[id^='filmstrip-slide-']").each(function () {

			var id = $(this).attr("id");

			if (id.endsWith("-bg")) {
				var pageId = id.split('-')[3];
				var current = $(this);

				for (var i = 0; i < 1000; i++) {
					if ($(current).hasClass("punch-filmstrip-thumbnail")) break;

					current = $(current).parent();
				}

				var y_coordinate = $(current).attr("transform").split(' ')[1];
				y_coordinate = y_coordinate.substr(0, y_coordinate.length-1);

				retValue.push({
					pageID: pageId,
					y_coordinate: parseInt(y_coordinate)
				})
			}
		});

		retValue.sort(function (first, second) {
			if (first.y_coordinate > second.y_coordinate) return 1;
			else if (first.y_coordinate == second.y_coordinate) return 0;
			else return -1;
		});

		var retValue2 = {};

		for(var i=0;i<retValue.length;i++) {
			retValue2[retValue[i].pageID] = i+1;
		}

		issueEvent("extension_getSlideIndex", retValue2);
	})

	$(document).on("root_updateSlideThumbnail", function(e) {
		var p = e.detail;

		docSlideStructure = p;

		updateFilmstripFromDocSlideStructure();

		$(window).trigger("resize");
	});

	$(document).on("root_getLastObject", function(e) {
		var p = e.detail;
		var pageID = p.pageID;

		/*
		console.log($("[id^='filmstrip-slide'][id$='" + pageID + "']"));
		console.log($("[id^='filmstrip-slide'][id$='" + pageID + "']").children("[id^='filmstrip']"));
		*/

		var objs = $("[id^='filmstrip-slide'][id$='" + pageID + "']").children("[id^='filmstrip']");
		var lastObj = $(objs)[$(objs).length-1];

		issueEvent("extension_getLastObject", {
			objID: $(lastObj).attr("id").split('-')[3]
		});
	});


	$(document).on("root_setSlideState", function(e) {
		var p = e.detail;

		curSlideState = p.state;

		if(curSlideState == "EDIT")
			curMonitoringParagraph = p.argument.paragraphID;
		else
			curMonitoringParagraph = null;
	});

	$(document).on("pdfjs_extensionTemp", function(e) {
		// focusObject("editor-SLIDES_API1856961054_1-paragraph-0");
		// console.log($("[pointer-events='visiblePainted']"));
	});
}

$(document).ready(function() {
	if((this.location.hostname == "localhost" || this.location.hostname == "d2stest.web.app") && this.location.pathname == '/') { 
	    // root script
		var scriptEventSender = [];
		var scriptEventReceiver = [];

		for(var key in eventList) {
			if(eventList[key][0] == 'root') scriptEventSender.push(key);
			if(eventList[key][1] == 'root') scriptEventReceiver.push(key);
		}

	    chrome.runtime.onMessage.addListener(function(details) {
            if(scriptEventReceiver.includes(details.type)) 
                issueEvent(details.type, details.data);
	    });

        for(var i=0;i<scriptEventSender.length;i++) {
	        $(document).on(scriptEventSender[i], function(e) {
	    	    chromeSendMessage(e.type, e.detail);
	        });
        }
	}

	// pdf.js contents script
	else if(this.location.hostname == "localhost" || this.location.hostname == "d2stest.web.app"){
		var pdfjsEventSender = [];
		var pdfjsEventReceiver = [];

		for(var key in eventList) {
			if(eventList[key][0] == 'pdfjs') pdfjsEventSender.push(key);
			if(eventList[key][1] == 'pdfjs') pdfjsEventReceiver.push(key);
		}

	    chrome.runtime.onMessage.addListener(function(details) {
            if(pdfjsEventReceiver.includes(details.type)) 
                issueEvent(details.type, details.data);
	    });

        for(var i=0;i<pdfjsEventSender.length;i++) {
	        $(document).on(pdfjsEventSender[i], function(e) {
	    	    chromeSendMessage(e.type, e.detail);
	        });
        }
	}

	// chrome extension
	if(this.location.hostname == "docs.google.com" && this.location.pathname[1] == 'p') {
		var extensionEventSender = [];
		var extensionEventReceiver = [];

		for(var key in eventList) {
			if(eventList[key][0] == 'extension') extensionEventSender.push(key);
			if(eventList[key][1] == 'extension') extensionEventReceiver.push(key);
		}

	    chrome.runtime.onMessage.addListener(function(details) {
            if(extensionEventReceiver.includes(details.type)) 
                issueEvent(details.type, details.data);
	    });

        for(var i=0;i<extensionEventSender.length;i++) {
	        $(document).on(extensionEventSender[i], function(e) {
	    	    chromeSendMessage(e.type, e.detail);
	        });
        }

		chromeExtensionBody();
	}
});
