
var _ = require('underscore');
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8080});

var Memcached = require('memcached');
var memcached = new Memcached('localhost:11211');

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {	
	ws.on('message', function (data, flags) {
		data = JSON.parse(data);
		
		switch (data.msg) {
			case 'heartbeat':

				memcached.get('online', function (err, onlineResults) {
					if (onlineResults == false) {
						onlineResults = {};
					}

					onlineResults[data.user] = Math.round((new Date()).getTime() / 1000);

					memcached.set('online', onlineResults, 86400, function (err) { });

					var resp = {
						message: 'online',
						data: _.keys(onlineResults)
					};
					
					wss.broadcast(JSON.stringify(resp));
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

	ws.on('close', function (code, message) {

	});
	
});

