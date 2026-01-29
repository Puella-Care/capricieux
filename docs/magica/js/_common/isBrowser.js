define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	'text!css/test/isBrowser.css'
], function (_,Backbone,common,ajaxControl,cmd,browserCss,localCss) {

	window.app_ver = "TEST_BROWSER";


	// ------------------------------------------------------------------------.
	var style;
	// styleの追加
	style = document.createElement('style');
	style.type = "text/css";
	style.innerHTML = browserCss;
	document.getElementsByTagName('head').item(0).appendChild(style);

	// フォントローカルストレージにあったら
	if(localStorage.getItem("motoya")) {
		var rule = [];
		var styleSheet = document.styleSheets.item(1);
		rule.push("@font-face {font-family: 'motoya'; src: url('data:font/ttf;base64," + String(localStorage.getItem("motoya")) + "');}");
		_.each(rule,function(_rule,b,c) {
			var index = styleSheet.cssRules.length;
			styleSheet.insertRule(_rule, index);
		});
	}

	// ------------------------------------------------------------------------.
	// localの処理
	if(location.href.match("file://") || location.href.match("http://localhost:5963") || location.href.match("http://localhost:5963")){
		window.isLocal = true;
		window.app_ver = "TEST_LOCAL_FILE";
		//require(['text!css/test/isLocal.css'],function(localCss) {
		//	var style = document.createElement('style');
		//	style.type = "text/css";
		//	style.innerHTML = localCss;
		//	document.getElementsByTagName('head').item(0).appendChild(style);
		//});
	}

	// ------------------------------------------------------------------------.
	// ネイティブへのコマンドの書き換え
	cmd.sendCommand = function(command) {
		var _command = String(command);
		if(_command.indexOf("QuestStub") != -1) {
			console.log("debug:command: "+_command+"\nクエストスタブページへ遷移します。");
			location.href = "#/QuestStub";
			return;
		}
		if(_command.indexOf("ArenaStub") != -1) {
			console.log("debug:command: "+_command+"\nアリーナスタブページへ遷移します。");
			location.href = "#/ArenaStub";
			return;
		}
		if(_command.indexOf("EventArenaMissionStub") != -1) {
			console.log("debug:command: "+_command+"\nイベントアリーナスタブページへ遷移します。");
			location.href = "#/EventArenaMissionStub";
			return;
		}

		if(_command.split(",")[0] == "60") {
			var arr = JSON.parse(command.substr(3));

			_.each(arr,function(model,key) {
				arr[key] = "/magica/" + model;
			});

			$("#baseReceive").trigger("getBaseDataBrowser",arr);

			// console.log("native:command: getBaseData");

			return;
		}

		if(_command.split(",")[0] == "80") {
			// console.log("native:command: FOX");
			// return;
		}

		if(_command.split(",")[0] == "241") {
			$("#commandDiv").trigger("nativeCallback");
		}

		if(_command.split(",")[0] == "320") {
			$('#commandDiv').trigger('nativeCallback');
		}

		if(_command.split(",")[0] == "99"){
			console.log("native:command: 99 json続く");
		}else if(_command.split(",")[0] == "98"){
			console.log("native:command: 98 json続く");
		}else{
			console.log("native:command: "+_command);
		};
	};
	// ------------------------------------------------------------------------.

	$("#baseReceive").on("getBaseDataBrowser",function(e,res) {
		$.extend(common.imgData,res);
		setNativeImg();
		// console.log("getBaseData:baseReceive:pageObj:",common.pageObj);
		// console.log("getBaseData:baseReceive:res:",res);
	});
	var setNativeImg = function() {
		_.each(common.imgData,function(path,key) {
			var elm = common.doc.querySelectorAll('[data-nativeimgkey='+ key +']');
			if(elm) {
				_.each(elm,function(target) {
					target.dataset.nativeimgkey = "";
					target.src = path;
				});
			}

			var elmBg = common.doc.querySelectorAll('[data-nativebgkey='+ key +']');
			if(elmBg) {
				_.each(elmBg,function(target) {
					target.dataset.nativebgkey = "";
					target.style.backgroundImage = "url(" + path + ")";
				});
			}
		});
	};
});