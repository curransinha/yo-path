var express = require('express');
var hogan = require('hogan-express');
var path = require('path');
var app = express();

var http = require('http').createServer(app);

app.set('view engine', 'html');
app.set('view options', { layout: false});
app.engine('html', hogan);

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname,'public')));

var uri = "mongodb://hackprinceton:yohackathon@dogen.mongohq.com:10088/yo-path"
var db = require('mongojs')(uri);
console.log("Database connection established");

// Route array
// Key: username
// Value: array of [lat, long] arrays
var routes = {};

// Date() array
// Key: username
// Value: [time start_t, time end]
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
	
	console.log(routes);
	
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

// app.get('findById') function(req,res) {
// 	var user = req.query.username;
// 	for 
// }
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
	
	if (routes[user] == null) {
		res.end();
		return;
	}
	
	routes[user].push([latitude, longitude]);
	times[user][1] = new Date();
	

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
					{ 'api_token': 'fa5016ff-d499-4f25-be79-448c74832a94', 'username': user, 'link':'http://yo-path.azurewebsites.net/path?pid='+seq}}), function(err, response, body) {
		}
			}
				

			res.writeHead(200, {"Content-type" : "text/plain"});
			res.write(JSON.stringify(routes));
			res.write(JSON.stringify(times));
			res.write('{"status": "200"}');
			res.end();
			
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
	console.log("trying pid = " + pid)
	db.collection('paths').findOne({ _id: parseInt(pid) }, function(err, result) {
		console.log(result);
		if (err || result == null) {
			console.log(err);
			res.writeHead(200, {"Content-type" : "text/plain"});
			res.write("No result found\n");
			res.end();
			return;

		} else if (result != null) {
			var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

			var suffix = (result.time[0].getHours() >= 12) ? 'pm' : 'am';

        		var hours0 = (result.time[0].getHours() > 12) ? result.time[0].getHours()-12 : result.time[0].getHours();
                	hours0 = (hours0 == '00') ? 12 : hours0;
        		
			var hours1 = (result.time[1].getHours() > 12) ? result.time[1].getHours()-12 : result.time[1].getHours();
                hours1 = (hours1 == '00') ? 12 : hours1;
    
            var start_t = hours0 + ":" + (result.time[0].getMinutes()<10? "0" : "") + result.time[0].getMinutes() + suffix + " on " + months[result.time[0].getMonth()] + " " + result.time[0].getDate() + ", " + result.time[0].getFullYear();
			var end_t = hours1 + ":" + (result.time[1].getMinutes()<10? "0" : "") + result.time[1].getMinutes() + suffix + " on " + months[result.time[1].getMonth()] + " " + result.time[1].getDate() + ", " + result.time[1].getFullYear();

			var compStart = result.time[0].getTime();
			var compEnd = result.time[1].getTime();


			var elapsed_t = compEnd-compStart;
			//elapsed_t = elapsed_t.get	
			var edays=Math.floor(elapsed_t / 8640000);
			// After deducting the days calculate the number of hours left
			var ehours = Math.floor((elapsed_t - (edays * 8640000))/360000)
			// After days and hours , how many minutes are left
			var eminutes = Math.floor((elapsed_t - (edays * 8640000 ) - (ehours *360000 ))/6000)
			// Finally how many seconds left after removing days, hours and minutes.
			var esecs = Math.floor((elapsed_t - (edays * 86400 ) - (ehours *3600 ) - (eminutes*60)))/100

			elapsed_t = (edays>0 ? (edays + " days, ") : "") + (ehours>0 ? (ehours + " hours, ") : "") + eminutes + " min " + " and " + esecs + " sec";

			res.render('path', {
				pid: result._id,
				main: "["+result.route+"]",
				start: start_t,
				end: end_t,
				elapsed: elapsed_t,
				user: result.user
				traveled: elapsed_t
                        });
		}
	});

});

app.use("/", function(req, res) {
	res.render('index');
});

http.listen(process.env.PORT || 8000);
