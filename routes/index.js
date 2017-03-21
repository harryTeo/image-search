var express = require('express');
var router = express.Router();
var request = require('request');

var QueryHistory = require("../models/query");

router.get('/', function(req, res, next) {		
  res.render('index');
});

router.get("/search/:searchTerm", function(req, res, next) {
	var searchTerm = req.params.searchTerm;
	var offset = 0;
	if (Number.isInteger(Number(req.query.offset)) && Number(req.query.offset)>0) {
		offset = Number(req.query.offset);
	}
  // Add to QueryHistory
	var newQueryHistory = new QueryHistory({
		term: searchTerm,
		created: Date.now()
	});
	newQueryHistory.save(function(err, newEntry) {
		if (err) throw err;
		// console.log(newEntry);					
	});

	// Get and show query results from API
	var APIurl = "https://www.googleapis.com/customsearch/v1?key=" + process.env.API_KEY + "&cx=" + process.env.SEARCH_ENGINE_ID + "&q=" + encodeURI(searchTerm) + "&start=" + (offset+1) + "&num=10" + "&searchType=image";

	request({url: APIurl}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var results = [];
			var data = JSON.parse(body);
			if (data.items) {
		    data.items.forEach(function(item) {     
		      results.push({
		        url: item.link,
		        description: item.snippet,
		        thumbnail: item.image.thumbnailLink,
		        parentPage: item.image.contextLink
		      });
		    });			
				return res.json(results);				
			}
			else {
				return res.json({msg: "No results round!"});
			}
		}
		else {
			if (offset>90) { return res.json({msg: 'Error. Try 1<=offset<=90'}); }
			else { return res.json({msg: "Error!"}); }
		}
	});
});

router.get("/latest", function(req, res, next) {
	QueryHistory.find({}, {_id: 0, __v: 0}).sort({created: -1}).limit(10).exec(function(err, data) {
		if (err) throw err;
		return res.json(data);
		// The below commented code would be necessary, if I did't exclude the "_id" and "__v" fields by using "{_id: 0, __v: 0}" as a 2nd argument in function "find()" 
		// var results = [];
		// data.forEach(function(result) {
		// 	results.push({
		// 		term: result.term,
		// 		created: result.created				
		// 	});
		// });
		// return res.json(results);		
	});	
});

module.exports = router;