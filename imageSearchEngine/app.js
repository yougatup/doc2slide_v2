const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch');
const app = express()
const sstk = require("shutterstock-api");
sstk.setAccessToken("v2/V2V0Z25XQUxDUmRHeVFPNURvNTlPcFc2clJZTXVhcmcvMjk3MTE2MzM4L2N1c3RvbWVyLzQvdDJyT1U2ZUYwc0tjbGVxUWg0ZlZHZWZQakZxUFRReEpJaFZibTZoQ29QQk9DWEFiRGtoQks4ZmlLajRHbTdYQ1V4MnMtOWV4dU5ER2U4UzZ1MFZ3VlFlQW9KRkhtU014OUV2LTI2bjFieGRWZ2p4eEVfNmNSUVhzdEphclJkLUpsZENWRFpocHQzSFFJSEM0eV9EZ3p0eVBhd2Z4R0hJa0V2R25xZnFPRXVLUjRxaDQwNjhGb3FVREcyaF9HWGtlb0dYRjJRai0wckk1ano2Y1FJdGRQQS9VbGhCSEhCdlFkNVdEQjBxRTVGZEFB");

app.use(cors())

async function getIllustrationFromShutterstock(query) {
    return new Promise(async function(resolve, reject) {
            const imagesApi = new sstk.ImagesApi();

            const queryParams = {
                "query": query,
                "image_type": "illustration"
            };

            imagesApi.searchImages(queryParams)
            .then(({ data }) => {
                    var result = [];

                    for(var i=0;i<data.length;i++) {
                        result.push(data[i].assets.preview.url)
                    }
                    
                    resolve(result)
            })
            .catch((error) => {
                    reject(error);
                    });
    });
}
async function getPhotoFromUnsplash(query) {
    return new Promise(async function(resolve, reject) {
        const url = 'https://api.unsplash.com/search/photos?query=' + query + '&client_id=kWr2uvn5nX9s2aze52DjoP8u7PCuH_g6x-Qp0oCPBP8';
        const options = {
          method: 'GET',
        };
        
        fetch(url, options)
          .then(res => res.json())
          .then(json => {
                  var result = [];

                  for(var i in json.results) {
                    result.push(json.results[i].urls.small);
                  }

                  resolve(result)

                  })
          .catch(err => reject(err));
    });
}
async function getPhotoFromPixabay(query, type) {
    return new Promise(async function(resolve, reject) {
        const url = 'https://pixabay.com/api/?key=20814953-0288b783def99e3ddd3967655&q=' + query + '&image_type=' + type;
        const options = {
          method: 'GET',
        };
        
        fetch(url, options)
          .then(res => res.json())
          .then(json => {
                  var result = [];

                  for(var i in json.hits) {
                    result.push(json.hits[i].previewURL);
                  }

                  resolve(result)

                  })
          .catch(err => reject(err));
    });
}
async function getIconsFromIconfinder(query) {
    return new Promise(async function(resolve, reject) {
        const url = 'https://api.iconfinder.com/v4/icons/search?query=' + query + '&count=10';
        
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer X0vjEUN6KRlxbp2DoUkyHeM0VOmxY91rA6BbU5j3Xu6wDodwS0McmilLPBWDUcJ1'
          }
        };
        
        fetch(url, options)
          .then(res => res.json())
          .then(json => {
                  var result = [];

                  for(var i in json.icons) {
                  result.push(json.icons[i].raster_sizes[json.icons[i].raster_sizes.length-1].formats[0].preview_url);
                  }

                  resolve(result)

                  })
          .catch(err => reject(err));
    });
}

async function getImagesFromGoogle(query, type) {
    return new Promise(async function(resolve, reject) {
        const url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBLn8HDbzhQB5Obwg39AMHYxSvhn_F2vdQ&cx=000180283903413636684:oxqpr8tki8w&searchType=image&q=' + query + '&imgType=' + type;
        
        const options = {
          method: 'GET',
        };
        
        fetch(url, options)
          .then(res => res.json())
          .then(json => {
                  var result = [];

                  for(var i in json.items) {
                  result.push(json.items[i].link);
                  }

                  resolve(result)

                  })
          .catch(err => reject(err));
      });
}

async function getIconsFromNounproject(query) {
    return new Promise(async function(resolve, reject) {
    var result = await nounProject.getIconsByTerm(query, function (err, data) {
        if (!err) {
            var retValue = [];

            for(var e in data.icons) {
                retValue.push(data.icons[e].attribution_preview_url);
            }

            resolve(retValue);
        }
        else{
            resolve([])
        }
    });
            });
}

var NounProject = require('the-noun-project'),

nounProject = new NounProject({
key: '6ea0e913d36044ce89dc893f4ca2a82c',
secret: '109bb0f7299543bea17066226adbe768'
});

app.use(
        express.urlencoded({
             extended: true
        })
)

app.use(express.json())

app.post('/getImage', async (req, res) => {
      var query = req.body.query;
      var type = req.body.imageType;
      var idx = req.body.index;
      var result = {};

      console.log(req.body);

      result["img"] = {};

      if(type == "photo" || type == "all") {
        var unsplashResult = await getPhotoFromUnsplash(query);
        // var pixabayResult = await getPhotoFromPixabay(query, "photo");

        result["img"]["photo"] = {
            unsplash: unsplashResult,
          //  pixabay: pixabayResult
        }
      }
      if(type == "illustration" || type == "all") {
        var shutterStockResult = await getPhotoFromPixabay(query, "illustration")

        result["img"]["illustration"] = {
            shutterStock: shutterStockResult
        }
      }
      if(type == "symbol" || type == "all") {
        var nounProjectResult = await getIconsFromNounproject(query);
        var iconFinderResult = await getIconsFromIconfinder(query);

        result["img"]["symbol"] = {
            nounProject: nounProjectResult,
            iconFinder: iconFinderResult
        }
      }

      result["index"] = idx;
      result["query"] = query;

      res.send(result)
})

app.post('/getImagesFromGoogle', async (req, res) => {
      var query = req.body.query;
      var type = req.body.imageType;
      var idx = req.body.index;
      var result = {};

      console.log(req.body);

      result["img"] = {};

      var _type = "";

      if(type == "symbol") _type = "LINEART";
      else if(type == "illustration") _type="CLIPART";
      else if(type == "photo") _type = "PHOTO";
      else _type = "IMG_TYPE_UNDEFINED";

      var imgResult = await getImagesFromGoogle(query, _type);

      result["index"] = idx;
      result["query"] = query;

      result["img"]["google"] = {};
      result["img"]["google"]["all"] = imgResult;

      res.send(result)
})

var port = 1123;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

/* for testing */
/*
async function main() {
    var result = await getIllustrationFromShutterstock("setting");

    console.log(result);
}

main();

*/
