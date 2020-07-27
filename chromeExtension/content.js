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
	"root_navigateToWord": ['root', 'pdfjs']
}

var curSlideState = "WAIT";
var curMonitoringParagraph = null;

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

function pageUpdated(mutationsList) {
	// console.log(mutationsList);
	if(curSlideState == "WAIT") {
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
		
		$("#editor-" + getPageID()).children("g:not([id$='-bg'])").map((key, value) => { 
			var paragraphs = DOMtoList($(value).find("[id*='-paragraph-']"));

			var paragraphInfo = {};

			paragraphs.forEach(function(elem) {
				paragraphInfo[elem] = document.getElementById(elem).getBoundingClientRect();
			});

			retValue.push({
				objectID: $(value).attr("id"),
				rect: document.getElementById($(value).attr("id")).getBoundingClientRect(),
				paragraph: paragraphInfo
				// rect: $(value).getBoundingClientRect()
			});
		});

		issueEvent("extension_pageUpdated", {
			pageID: getPageID(),
			objects: retValue,
			workspace: document.getElementById("workspace-container").getBoundingClientRect()
		});
	}
	else if(curSlideState == "EDIT") {
		issueEvent("extension_typing", {
			paragraphRect: document.getElementById(curMonitoringParagraph).getBoundingClientRect()
		});
	}
}

function setObserver() {
	if(document.getElementById("pages") != null) {
		pageUpdateObserver = new MutationObserver(pageUpdated);

		pageUpdateObserverConfig = { attributes: true, subtree: true };
		pageUpdateObserver.observe(document.getElementById("pages"), pageUpdateObserverConfig);
	}
}

function chromeExtensionBody() {
	setObserver();
	
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
	if(this.location.hostname == "localhost" && this.location.pathname == '/') { 
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
	else if(this.location.hostname == "localhost"){
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
