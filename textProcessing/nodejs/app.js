async function quickstart(data) {
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Instantiates a client
  const client = new language.LanguageServiceClient();

  // The text to analyze
  const text = 'Hello, world!';

  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the text
  const [result] = await client.analyzeSyntax({document: document});
  const sentiment = result.documentSentiment;

  console.log(`Text: ${text}`);
  console.log(`Sentiment score: ${sentiment.score}`);
  console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

  return "nice";
}

async function analyzeSyntaxOfText(text) {
  // [START language_syntax_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text








//////////////////

  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Need to specify an encodingType to receive word offsets
  const encodingType = 'UTF8';

//////////////////


	var retEntity = [];

	// Detects entities in the document
	const [result] = await client.analyzeEntities({document});
	
	const entities = result.entities;
	
	console.log('Entities:');
	entities.forEach(entity => {
		retEntity.push(entity.name);
/*
	  console.log(entity.name);
	  console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
	  if (entity.metadata && entity.metadata.wikipedia_url) {
	    console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
	  }
*/
	});
	
	//////////////


  // Detects the sentiment of the document
  const [syntax] = await client.analyzeSyntax({document, encodingType});

  console.log(syntax);
  console.log('Tokens:');

  var retValue = [];

  syntax.tokens.forEach(part => {
    // console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    // console.log(`${part.dependencyEdge}`);
	// console.log(Object.keys(part.dependencyEdge));
    // console.log(`${part.dependencyEdge.headTokenIndex}`);
    // console.log(`${part.dependencyEdge.label}`);
    // console.log('Morphology:', part.partOfSpeech);

	retValue.push({
text: `${part.text.content}`,
parent: `${part.dependencyEdge.headTokenIndex}`
			});
  });

//////////

  console.log(retValue);

  return {
		entity: retEntity,
		mySyntax: retValue,
		syntax: syntax
	}
  // [END language_syntax_text]
}


var express = require('express');
var app = express();

app.use(function(req, res, next) {
		  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
		    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			  next();
			  });

function writeCache(text, result) {
    var mysql = require('sync-mysql');

    var con = new mysql( {
        "host": "localhost",
        "user": "doc2slide",
        "database": "doc2slide",
        "password": "Rhaehfl12!@"
    });

    var queryString = "INSERT INTO GoogleQueryCache (queryString, result) values (?, ?)";

    var res = con.query(queryString, [text, JSON.stringify(result)]);
    console.log("result : " + result);

    con.close()
}

function dbHIT(text) {
    var mysql = require('sync-mysql');

    var con = new mysql( {
        "host": "localhost",
        "user": "doc2slide",
        "database": "doc2slide",
        "password": "Rhaehfl12!@"
    });

    var queryString = "SELECT * from GoogleQueryCache where queryString = ?"
    var res = con.query(queryString, [text]);

    console.log(res);

    con.close()

    if(res.length <= 0) return -1;
    else return res;
}

app.get('/', function(req, res){
		console.log(req.query);

        var cache = dbHIT(req.query.text);

        if(cache != -1){
            console.log(cache[0].result);
            console.log(JSON.parse(cache[0].result));

            res.send(JSON.parse(cache[0].result));
            return;
        }

		analyzeSyntaxOfText(req.query.text.replace("_", ' ')).then(result => {
			res.send(result);
            writeCache(req.query.text, result);
		});
});

app.listen(3333);

