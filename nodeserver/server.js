//
// server.js
//
// Copyright 2013 Derek Ju
//

var
	_ = require('underscore'),
	Express = require('express'),
	WebSocketServer = require('ws').Server,
	Memcached = require('memcached'),
	Url = require('url')
;

// Memcache
var memcached = new Memcached('localhost:11211');

function emptyError(err) {}

// Express

var app = Express();

app.configure(function(){
	app.use(Express.bodyParser());	
});

app.get('/', function (req, res) {
	res.send('');
});

app.get('/ajax/get_messages', function (req, res) {
	res.send('');
});

app.post('/ajax/heartbeat', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	
	Server.Users.heartbeatAndGetUsers(req.body.user, function (response) {
		res.send(response);
	});
});

app.get('/ajax/send_message_to_user', function (req, res) {
	res.send('');
});

app.listen(8000);

// Websockets

var wss = new WebSocketServer({port: 8080});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {	
	ws.on('message', function (data, flags) {
		data = JSON.parse(data);
		
		switch (data.msg) {
			case 'heartbeat':
				Server.Users.heartbeatAndGetUsers(data.user, function (response) {					
					wss.broadcast(JSON.stringify(response));
				});
				break;
			case 'disconnect':
				memcached.get('online', function (err, onlineResults) {

					if (onlineResults == false) {
						onlineResults = {};
					}

					delete onlineResults[data.user];
					memcached.set('online', onlineResults, 86400, function (err) { });

					var resp = {
						message: 'online',
						data: _.keys(onlineResults)
					};
					
					wss.broadcast(JSON.stringify(resp));
				});

				break;			
		}
		
	});	
});

// Classes

var Server = Server || {};

Server.Config = {
	PRESENCE_TIMEOUT: 5
};

Server.Utils = {
	createResponse: function (message, data) {
		return {
			message: message,
			data: data
		};
	},

	getCurrentTime: function () {
		return Math.round((new Date()).getTime() / 1000);
	}
};

Server.Users = {

	cullOfflineUsers: function () {
		memcached.get('online', function (err, onlineResults) {
			if (onlineResults == false) onlineResults = {};

			var writeback = false;
			// Iterate through and timeout those users who have not sent a heartbeat in PRESENCE_TIMEOUT seconds
			_.each(onlineResults, function (element, index, list) {
				if (element + Server.Config.PRESENCE_TIMEOUT < Server.Utils.getCurrentTime()) {
					writeback = true;
					delete list[index];
				}
			});

			if (writeback) {
				// Write back
				memcached.set('online', onlineResults, 86400, emptyError);
				
				// Broadcast immediately to WebSocket connected clients
				// Clients polling will pick up on the next poll
				wss.broadcast(
					Server.Utils.createResponse(
						'online',
						_.keys(onlineResults)
					)
				);
			}			
		});
	},

	heartbeatAndGetUsers: function (user, callback) {
		memcached.get('online', function (err, onlineResults) {

			if (onlineResults == false) onlineResults = {};

			// Update heartbeat for current user
			onlineResults[user] = Server.Utils.getCurrentTime();

			// Write back
			memcached.set('online', onlineResults, 86400, emptyError);

			callback(
				Server.Utils.createResponse(
					'online',
					_.keys(onlineResults)
				)
			);
		});
	}
};

setInterval(Server.Users.cullOfflineUsers, 1000);

console.log('Server up');