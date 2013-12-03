

var NS = {};

NS.Config = {
	localStoreNamespace: "ChatPHPComet."
};

NS.getUserName = function () {
	var key = NS.Config.localStoreNamespace + "username";
	if (window.localStorage.getItem(key) == null) {
		var randomNum = Math.ceil(Math.random() * 100000);
		window.localStorage.setItem(key, "User" + randomNum);

		return "User" + randomNum;
	} else {
		return window.localStorage.getItem(key);
	}
};

NS.Network = {

	Ws: null,

	connectWebSocket: function () {
		if (NS.Network.Ws == null) {
			NS.Network.Ws = new WebSocket("ws://localhost:8080");
		}

		NS.Network.Ws.onopen = function () {
			NS.Network.Ws.send(JSON.stringify({msg: 'heartbeat', user: NS.getUserName()}));
		};
			
		NS.Network.Ws.onmessage = function (msg) {
			var resp = JSON.parse(msg.data);
			console.log(resp);
			if (resp.message == "online") {
				NS.UI.updateOnlineUsers(resp.data);
			}
		};

		$(window).unload(function() {
  			NS.Network.Ws.send(JSON.stringify({msg: 'disconnect', user: NS.getUserName()}));
		});		
	},

	heartbeat: function () {
		$.ajax({
			type: 'POST',
			url: 'http://server.localhost/ajax/heartbeat.php',
			data: {
				user: NS.getUserName()
			},			
			success: function (data, textStatus, jqXHR) {
				var users = data.users;
				NS.UI.updateOnlineUsers(users);
			}
		});
	},

	loadChat: function (forUser) {

		if (forUser == NS.getUserName()) {
			return;
		}

		$.ajax({
			type: 'POST',
			url: 'http://server.localhost/ajax/get_messages.php',
			data: {
				user: NS.getUserName(),
				forUser: forUser
			},			
			success: function (data, textStatus, jqXHR) {
				var chat = data.chat;
				console.log(chat);
			}
		});
	},

	chatTo: function (forUser, msg) {

		if (forUser == NS.getUserName()) {
			return;
		}

		$.ajax({
			type: 'POST',
			url: 'http://server.localhost/ajax/send_message_to_user.php',
			data: {
				user: NS.getUserName(),
				forUser: forUser,
				msg: msg
			},			
			success: function (data, textStatus, jqXHR) {
				var chat = data.chat;
				console.log(chat);
			}
		});
	}
};

NS.UI = {

	boot: function () {
		$('.current select').on('click', function (e) {
			NS.UI.userClicked(e.toElement.innerText);			
		});
	},

	updateOnlineUsers: function(users) {
		$('.current select').html('');
		$.each(users, function (index, value) {
			$('.current select').append('<option value="' + value + '">' + value + '</option>');
		});
	},

	userClicked: function(user) {
		var history = NS.Network.loadChat(user);
	}
};

$(function() {
	$('h3').text("Welcome " + NS.getUserName());

	NS.UI.boot();

	if (typeof WebSocket == "function") {
		NS.Network.connectWebSocket();
	} else {
		NS.Network.heartbeat();
		setInterval(
			function () {
				NS.Network.heartbeat();			
			},
			5000
		);
	}
});