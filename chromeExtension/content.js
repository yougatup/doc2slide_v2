var eventList = {
	"pdfjs_renderFinished": ['pdfjs', 'root'],
	"pdfjs_checkPreprocessed": ['pdfjs', 'root'],
	"root_checkPreprocessed": ['root', 'pdfjs'],
	"pdfjs_pageRendered": ['pdfjs', 'root'],
	"pdfjs_highlighted": ['pdfjs', 'root'],
	"root_sendMappingIdentifier": ['root', 'pdfjs'],
	"root_sendMappingIdentifier_2": ['root', 'pdfjs'],
	"root_openPDF": ['root', 'pdfjs'],
}



/*
var pdfjsEventSender = ['pdfjs_renderFinished', "pdfjs_checkPreprocessed"];
var extensionEventSender = [];
var scriptEventSender = ["root_checkPreprocessed"];

var pdfjsEventReceiver = ["root_checkPreprocessed"];
var extensionEventReceiver = [];
var scriptEventReceiver = ['pdfjs_renderFinished', "pdfjs_checkPreprocessed"];
*/

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
	}
});
