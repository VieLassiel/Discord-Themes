//META{"name":"dateViewer"}*//
//inspired by Jiiks's "Digital Clock" plugin

class dateViewer {
	constructor() {
		this.plugin_name = "dateViewer";
		this.stylesheet_name = "dv-stylesheet";

		this.stylesheet = `#dv-btn-settings-panel svg path {height: 18px; width: 18px; display: block}
		#dv-container {background-Opacity: 80%; bottom: 0; box-sizing: border-box; color: #fff; height: 95px; position: absolute; width: 100%; z-index: 10}
		#dv-container::after {background: #3b3d42; content: ""; height: 1px; position: absolute; top: 0; width: 200px}
		#dv-date {font-size: small; opacity: .4}
		#dv-day {font-size: 14px}
		#dv-display {font-size: 1em; line-height: 18px; text-align: center; text-transform: uppercase}
		#dv-settings-panel {background: #2f3136; display: none}
		.dv-btn {border-radius: 4px; bottom: calc(100% + 5px); cursor: pointer; height: 32px; opacity: .6; position: absolute; right: 25px; width: 32px}
		.dv-btn:hover, .dv-btn.dv-active {background: rgba(24, 25, 28, .3); opacity: 1}
		.dv-flash {animation: dv-fade-out 2s linear; background: #fff; display: none; z-index: 10}
		.dv-flex {align-items: center; display: flex; justify-content: center}
		.dv-full {height: 100%; left: 0; position: absolute; top: 0; width: 100%}
		.dv-hide {display: none}
		.dv-icon {display: block; fill: #fff; height: 18px; width: 18px}
		.dv-panel {display: flex; -webkit-flex-direction: row; flex-direction: row; font-size: small; text-transform: uppercase}
		.dv-panel input[type="radio"] {display: none}
		.dv-panel input[type="radio"] + label {cursor: pointer}
		.dv-panel input[type="radio"] + label span {background: #99aab5; border-radius: 50%; cursor: pointer; display: inline-block; height: 16px; margin: 0 5px 0 0; position: relative; transition: .15s; vertical-align: -4px; width: 16px}
		.dv-panel input[type="radio"] + label span::after {background: #fff; border-radius: 50%; content: ""; height: 8px; left: 4px; position: absolute; top: 4px; width: 8px}
		.dv-panel input[type="radio"]:checked + label span {background: #7289da}
		.dv-panel .dv-option {font-size: 12px}
		.dv-panel .dv-option:not(:last-child) {margin-bottom: 5px}
		.dv-panel .dv-options {width: 80px}
		.dv-panel .dv-options:not(:first-child) {margin-left: 20px}
		.dv-panel .dv-title {border-bottom: 1px solid #a682c9; color: #663d8f; font-size: 12px; font-weight: bold; margin-bottom: 5px; padding-bottom: 3px}
		.dv-show {display: block}

		.bd-blue .theme-light .dv-icon {fill: #3a71c1}
		.bd-blue .dv-panel input[type="radio"]:checked + label span {background: #3a71c1}
		.bd-blue .theme-light .dv-panel .dv-title {color: #3a71c1}
		.bd-blue .tooltip-bottom-right.tooltip-black::after {border-top-color: #3a71c1}
		.channel-members-wrap .channel-members {height: calc(100% - 95px)}
		.theme-light #dv-container, .theme-light #dv-settings-panel {background: #fff; color: #000}
		.theme-light #dv-container::after {background: rgba(0, 0, 0, .1)}
		.theme-light #dv-date {opacity: .6}
		.theme-light .dv-btn:hover, .theme-light .dv-btn.dv-active {background-color: rgba(24, 25, 28, .15)}
		.theme-light .dv-panel .dv-title {border-bottom: 1px solid rgba(0, 0, 0, .1); color: #7289da}
		.theme-light .dv-icon {fill: #7289da}
		.tooltip-top-right::after {border-top-color: #000; position: absolute; right: 10px; top: 100%}

		@keyframes dv-fade-out {from {opacity: 1} to {opacity: 0}}
		@keyframes dv-modal {from {opacity: 0; transform: scale(.75)} to {opacity: 1; transform: scale(1)}}`;

		this.settings_panel_markup = `<div class="dv-flex dv-full dv-panel">
			<div class="dv-options">
				<h3 class="dv-title">system type</h3>
				<div class="dv-option">
					<input type="radio" id="dv-r1" name="dv-system-type">
					<label for="dv-r1"><span></span>12-hour</label>
				</div>
				<div class="dv-option">
					<input type="radio" id="dv-r2" name="dv-system-type">
					<label for="dv-r2"><span></span>24-hour</label>
				</div>
			</div>
		</div>`;
	};

	updateClock() {
		this.pad = function(n) {
			return n < 10 ? `0${n}` : n;
		};

		this.day = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		this.month = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

		let now = new Date(), h = this.pad(now.getHours()), m = this.pad(now.getMinutes()), s = this.pad(now.getSeconds()),
		y = now.getFullYear(), mt = now.getMonth(), d = now.getDate(), session = h > 11 ? "PM" : "AM", end;

		if(d % 10 == 1 && d != 11) {end = "st"}
		else if(d % 10 == 2 && d != 12) {end = "nd"}
		else if(d % 10 == 3 && d != 13) {end = "rd"}
		else {end = "th"}

		if(m == "00" && s == "00") {
			$(".dv-flash").addClass("dv-show");
			setTimeout(function() {
				$(".dv-flash").removeClass("dv-show");
			}, 2000);
		}

		if($("#dv-r1").is(":checked")) {
			if(h > 12) {h -= 12}
			else if(h == 0) {h = 12}
			h = h < 10 ? `0${h}` : h;
			$("#dv-display").html(`${[h, m, s].join(":")}<span id="dv-session"> ${session}</span><span id="dv-date"><br>${[d, end].join("")} of ${this.month[mt]}, ${y}</span><span id="dv-day"><br>${this.day[now.getDay()]}</span>`);
		} else if($("#dv-r2").is(":checked")) {
			$("#dv-display").html(`${[h, m, s].join(":")}<span id="dv-date"><br>${[d, end].join("")} of ${this.month[mt]}, ${y}</span><span id="dv-day"><br>${this.day[now.getDay()]}</span>`);
		}
	};

	appendElements() {
		$(".channel-members-wrap")
		.append($("<div/>", {id: "dv-container", class: "dv-flex"})
			.append($("<div/>", {id: "dv-display"}),
					$("<div/>", {id: "dv-btn-settings-panel", class: "dv-btn dv-flex"}),
					$("<div/>", {id: "dv-settings-panel", class: "dv-flex dv-full"}).html(this.settings_panel_markup),
					$("<div/>", {class: "dv-flash dv-full"})));
		$(".container-iksrDt .button-1aU9q1:last-child svg").clone().attr("class", "dv-icon").appendTo("#dv-btn-settings-panel");
	};

	setTooltip(selector, value) {
		let offset = 8, total = 15;
		$(selector).mouseenter(function() {
			let offsetX = $(window).width() - $(selector).offset().left - $(selector).width() / 2 - total;
			let offsetY = $(window).height() - $(selector).offset().top + offset;
			$(".tooltips").append($("<div/>", {class: "tooltip tooltip-top-right tooltip-black"}).html(value));
			$(".tooltip-top-right").css({"bottom": offsetY, "right": offsetX});
		});

		$(selector).mouseleave(function() {
			$(".tooltips").empty();
		});
	};

	setKey(selector, key, value) {
		if($(selector).is(":checked")) {bdPluginStorage.set(this.plugin_name, key, value)}
		this.updateClock();
	};

	propKey(selector1, selector2, value1, value2, key) {
		if(bdPluginStorage.get(this.plugin_name, key) == value1) {$(selector1).prop("checked", true)}
		else if(bdPluginStorage.get(this.plugin_name, key) == value2) {$(selector2).prop("checked", true)}
	};

	enableEvents() {
		$("#dv-btn-settings-panel").on(`click.${this.plugin_name}`, this.toggleSettingsPanel);
		$("#dv-r1").on(`change.${this.plugin_name}`, x => this.setKey("#dv-r1", "system_type", 12));
		$("#dv-r2").on(`change.${this.plugin_name}`, x => this.setKey("#dv-r2", "system_type", 24));
		this.setTooltip("#dv-btn-settings-panel", "Settings");
	};

	disableEvents() {
		$("#dv-btn-settings-panel").off(`click.${this.plugin_name}`, this.toggleSettingsPanel);
		$("#dv-r1", "#dv-r2").off(`change.${this.plugin_name}`, this.setKey);
	};

	toggleSettingsPanel() {
		$("#dv-settings-panel").fadeToggle(300);
		$("#dv-btn-settings-panel").toggleClass("dv-active");
	};

	start() {
		BdApi.clearCSS(this.stylesheet_name);
		BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
		this.enableEvents();
		this.onSwitch();
	};

	stop() {
		BdApi.clearCSS(this.stylesheet_name);
		clearInterval(this.interval);
		this.disableEvents();

		$("#dv-container").remove();
	};

	load() {};

	unload() {};

	onMessage() {};

	onSwitch() {
		if($("#dv-container").length) return;
		this.appendElements();

		this.propKey("#dv-r1", "#dv-r2", 12, 24, "system_type");
		this.enableEvents();
		this.updateClock();

		this.interval = setInterval(this.updateClock, 1000);
	};

	observer({addedNodes, removedNodes}) {
	    for(let node, i = 0; i < addedNodes.length; i++) {
	    	if(addedNodes[i].classList && addedNodes[i].classList.contains("channel-members-wrap")) return this.onSwitch();
	    }

	    for(let node, i = 0; i < removedNodes.length; i++) {
	    	if(removedNodes[i].id === "friends") return this.onSwitch();
	    }
	};

	getSettingsPanel() {return ""};

	getName() {return "Date Viewer"};

	getDescription() {return "Implements a container on top of the member list, that features digital clock (both 12-hour and 24-hour system), current date and day of the week."};

	getVersion() {return "0.1.5"};

	getAuthor() {return "hammy"};
};
