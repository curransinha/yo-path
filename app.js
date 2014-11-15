var express = require('express');
var hogan = require('hogan-express');

var app = express();

var http = require('http').createServer(app);

app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', hogan);
app.set('views', __dirname + '/views');

var uri = "mongodb://hackprinceton:yohackathon@dogen.mongohq.com:10088/yo-path"
var db = require('mongojs')(uri);
console.log("Database connection established");

// Route array
// Key: username
// Value: array of [lat, long] arrays
var routes = {};

// Date() array
// Key: username
// Value: [time start, time end]
var times = {};

app.get('/yo-start', function(req, res) {
	var user = req.query.username;
	var loc = req.query.location;
	if (user == null || loc == null) {
		res.end();
		return;
	}

	var latitude = parseFloat(loc.substring(0, loc.indexOf(';')));
	var longitude = parseFloat(loc.substring(loc.indexOf(';') + 1));

	console.log("Yo-Start called by user " + user + " at location " + "[" + latitude +", " + longitude + "]");

	if (routes[user] == null) {
		routes[user] = [];
		routes[user].push([latitude, longitude]);
		times[user] = [null, null];
		times[user][0] = new Date();
	}
	
	res.writeHead(200, {"Content-type" : "text/plain"});
	res.write(JSON.stringify(routes));
	res.write(JSON.stringify(times));
	res.write('{"status": "200"}');
	res.end();
});


app.get('/yo-plot', function(req, res) {
	var user = req.query.username;
	var loc = req.query.location;
	if (user == null || loc == null) {
		res.end();
		return;
	}
	
	var latitude = parseFloat(loc.substring(0, loc.indexOf(';')));
	var longitude = parseFloat(loc.substring(loc.indexOf(';') + 1));

	console.log("Yo-Plot called by user " + user + " at location " + "[" + latitude +", " + longitude + "]");
	
	if (routes[user] != null) {
		routes[user].push([latitude, longitude]);
	}
	
	res.writeHead(200, {"Content-type" : "text/plain"});
	res.write(JSON.stringify(routes));
	res.write(JSON.stringify(times));
	res.write('{"status": "200"}');
	res.end();
});


app.get('/yo-end', function(req, res) {
	var user = req.query.username;
	var loc = req.query.location;
	if (user == null || loc == null) {
		res.end();
		return;
	}

	var latitude = parseFloat(loc.substring(0, loc.indexOf(';')));
	var longitude = parseFloat(loc.substring(loc.indexOf(';') + 1));
	
	console.log("Yo-End called by user " + user + " at location " + "[" + latitude +", " + longitude + "]");
	
	if (routes[user] != null) {
		routes[user].push([latitude, longitude]);
		times[user][1] = new Date();
	}

	// Create a JSON object, store it in MongoDB 
	function getNextSequence(name, callback) {
		db.collection('counters').findAndModify({
		    query: { _id: name },
		    update: { $inc: { seq: 1 } },
		    new: true
		}, function(err, doc) {
			if (err) {
				console.log("Database error.");
				callback(err);
				return;
			}
			callback(doc.seq);
		});
		
	}

	getNextSequence("pid", function(seq) {
		var path = {
			_id: seq,
			user: user,
			route: routes[user],
			time: times[user]
		};

		db.collection('paths').insert(path, function(err, records) {
			if (err) {
				console.log("There was a database error.");
			} else {

				console.log("Stored in database:\n" + records);
				// Clean up
				delete routes[user];
				delete times[user];

				var request = require('request');
				var url  =  "http://api.justyo.co/yo/";

				request.post(url, { form:
					{ 'api_token': 'fa5016ff-d499-4f25-be79-448c74832a94', 'username': 'endpath', 'link':'http://yo-path.herokuapp.com/path/'+seq}}), function(err, response, body) {
		}
	}
				

				res.writeHead(200, {"Content-type" : "text/plain"});
				res.write(JSON.stringify(routes));
				res.write(JSON.stringify(times));
				res.write('{"status": "200"}');
				res.end();
			}
		});
	});

});


app.get('/path', function(req, res) {
	if (req.query.pid == undefined) {
		res.writeHead(200, {"Content-type" : "text/plain"});
		res.write("No pid given\n");
		res.end();
		return;
	}
	var pid = req.query.pid;

	db.collection('paths').findOne({ "_id" : pid }, function(err, result) {
		if (err) {
			console.log(err);
			res.writeHead(200, {"Content-type" : "text/plain"});
			res.write("No result found\n");
			res.end();
			return;
		} else {
			res.render('index', {
				main: result.route,
				start: result.time[0],
				end: result.time[1],
				user: user
                        });
			console.log(result);
			res.writeHead(200, {"Content-type" : "text/plain"});
			res.write(JSON.stringify(result));
			res.end();
		}
	});

});

http.listen(8000);
