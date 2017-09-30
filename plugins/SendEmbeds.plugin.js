//META{"name":"SendEmbeds"}*//

function SendEmbeds() {
	return;
}

SendEmbeds.prototype.load = function() {};

SendEmbeds.prototype.unload = function() {};

SendEmbeds.prototype.start = function() {
	this.attachHandler();
};

SendEmbeds.prototype.onSwitch = function() {
	this.attachHandler();
};

SendEmbeds.prototype.stop = function() {
	var el = $('.channel-textarea textarea');
	if (el.length == 0) return;

	// Remove handlers and injected script
	el.unbind("click focus", this.focusHandler);
	el[0].removeEventListener("keydown", this.handleKeypress);
};

SendEmbeds.prototype.getName = function() {
	return "Send Embeds";
};

SendEmbeds.prototype.getDescription = function() {
	return "Allows you to create fancy embed text.";
};

SendEmbeds.prototype.getVersion = function() {
	return "0.1";
};

SendEmbeds.prototype.getAuthor = function() {
	return "Septeract";
};

var token = "PUT YOUR TOKEN HERE"; // Have to do this because localStorage.token no longer works

let sendEmbed = function(title, text, color) {
	var channelID = window.location.pathname.split('/').pop();
	var embed = {
		type : "rich",
		description : text
	};

	if (color) {
		embed.color = color;
	}

	if (title) {
		embed.title = title;
	}
	
	var data = JSON.stringify({embed : embed});
	
	console.log(data);
	
	$.ajax({
		type : "POST",
		url : "https://discordapp.com/api/channels/" + channelID + "/messages",
		headers : {
			//"authorization": localStorage.token.slice(1, -1)
			"authorization": token
		},
		dataType : "json",
		contentType : "application/json",
		data: data,
		error: (req, error, exception) => {
			console.log(req.responseText);
		}
	});
}

SendEmbeds.prototype.attachHandler = function() {
	var el = $('.channel-textarea textarea');
	if (el.length == 0) return;
	var self = this;

	// Handler to catch key events
	this.handleKeypress = function (e) {
		var code = e.keyCode || e.which;
		if (code !== 13) {
//			console.log(`Ignored keypress: ${code}`);
			return;
		}

		var text = $(this).val();
		if (!text.startsWith("/e")) {
//			console.log(`Ignored text entry: ${text}`);
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		var color;
		var msg;
		if (text[3] == "#") {
			color = parseInt(text.slice(4, 10), 16);
			msg = text.substring(11);
		} else {
			msg = text.substring(3);
		}

		var title;
		if (msg[0] == "\"") {
			msg = msg.substring(1);
			let index = msg.indexOf("\"");

			title = msg.substring(0, index);
			msg = msg.substring(index + 2);
		}

		sendEmbed(title, msg, color);
		
		$(this).val("");
	}

	// bind handlers
	el[0].addEventListener("keydown", this.handleKeypress, false);
}
