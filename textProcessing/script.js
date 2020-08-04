function doBFS(myGraph, r) {
	var myQueue = [];
	var front = 0;

	myQueue.push([r, 0]);

	var result = [[]];

	while(front < myQueue.length) {
		var cur = myQueue[front];

		console.log(cur);

		front++;

		while(result.length <= cur[1]) result.push([]);

		result[cur[1]].push(cur[0]);

		for(var j=0;j<myGraph[cur[0]].length;j++) {
			myQueue.push([myGraph[cur[0]][j], cur[1]+1]);
		}
	}

	return result;
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
	
	console.log(myGraph, rootIndex);

	var result = doBFS(myGraph, rootIndex);
	var temp = [];
	var text = [];

	console.log(result);

	// $("#resultPlane").append("<div>" + tt.join(' ') + " </div>");

	for(var i=0;i<result.length;i++) {
		var tt = [];

		temp = temp.concat(result[i]);

		for(var j=0;j<data.length;j++) {
			if(temp.includes(j)) {
				tt.push(data[j].text);
			}
		}

		text.push(tt);

		$("#resultPlane").append("<div>" + tt.join(' ') + " </div>");
	}

	console.log(text);
}

$(document).ready(function()  {
		$("#submitBtn").on("click", function(e) {
			$("#resultPlane").html('');

			var txt = $("#inputBox").val();

			console.log(txt);

 			xmlhttp = new XMLHttpRequest();
 			xmlhttp.open("GET","http://127.0.0.1:3000/?text=" + txt.replace(" ", "_"), true);
 			xmlhttp.onreadystatechange=function(){
 			   if (xmlhttp.readyState==4 && xmlhttp.status==200){
 			      var data=JSON.parse(xmlhttp.responseText);

			  	  getStrings(data);
 				  }
 		  	   }
 		    xmlhttp.send();
		});
});

