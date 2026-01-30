window.onerror = function (msg, file, line, column, err) {
	if(window.isBrowser) return;
	var errTxt = msg + ' ' + file + ':' + line;
	// console.log(errTxt);
	require([
		'underscore',
		'backbone',
		'backboneCommon',
		'ajaxControl',
		'command'
		// 'fastclick'
	], function (_,Backbone,common,ajaxControl,cmd) {
		cmd.setWebView(true);
		common.tapBlock(false);
		common.loading.hide();
		common.doc.querySelector("#baseContainer").style.display = "none";
		// アンドロイドのバックキーは使えないように
		common.androidKeyStop = true;
		var callback = function() {
			$("#resultCodeError .decideBtn").on(common.cgti,function(e){
				$("#resultCodeError .decideBtn").off();
				// リロード
				cmd.nativeReload("#/TopPage");
			});
		}
		new common.PopupClass({
			title:"エラー",
			popupId:"resultCodeError",
			content :"エラーが発生しました。トップページに遷移します。",
			"decideBtnText":"トップページへ",
			canClose: false
		},null,callback);
		if(common && common.location) {
			errTxt += (" page:" + common.location);
		}
		ajaxControl.ajaxPlainPost(common.linkList.jsErrorSend,errTxt,null);
	});
};

window.app_ver = "";
window.webInitTime = "";
window.sendHostName = location.hostname;

var nativeJsonObj = {};
var nativeCallback = function(res) {
	console.log("nativeCallback:function:",res);
	$('#commandDiv').trigger("nativeCallback",res);
};
var saveDataCallback = function(res) {
	// console.log("saveDataCallback:function:",res);
	$('#commandDiv').trigger("saveDataCallback",res);
};
var appVersionGet = function(appVersion) {
	window.app_ver = appVersion;
	// console.log("app_ver:",appVersion);
};

// base64データを返してもらう
var getBaseData = function(res) {
	// console.log("getBaseData:base:callback:",res);
	$('#baseReceive').trigger("getBaseData",res);
};

var fontDataGet = function(json) {
	var rule = [];
	// console.log("フォントコマンドが実行されました:");
	var styleSheet = document.styleSheets.item(1);
	rule.push("@font-face {font-family: 'motoya'; src: url('data:font/ttf;base64," + String(json.motoya) + "');}");
	rule.push("@font-face {font-family: 'mbm'; src: url('data:font/ttf;base64," + String(json.mbm) + "');}");

	_.each(rule,function(_rule,b,c) {
		var index = styleSheet.cssRules.length;
		styleSheet.insertRule(_rule, index);
	});
};

var purchaseCallback = function(json) {
	// todo:暫定 エラーポップアップとか未対応
	// console.log("function:purchaseCallback:");
	$('#commandDiv').trigger("purchaseCallback",json);
};

// アンドロイドの戻るボタンが押されたときに走らせてもらう
var androidBackKey = function(res){
	$('#androidBackKey').trigger("androidBackKey",res);
};

// クエストリタイア時に走らせてもらう
var questRetire = function(res) {
	$('#questRetire').trigger("questRetire",res);
};

// ネイティブ設定系受取
var configCallback = function(res){
	$('#configCallback').trigger("configCallback",res);
};
// サスペンド起動時に走らせてもらう
var suspendAwake = function(res){
	$('#suspendAwake').trigger("suspendAwake",res);
};
// 端末情報の登録
var setDeviceInfo = function(res) {
	window.modelName = res.modelName;
	window.osVersion = res.osVersion;
	window.bootCount = res.bootCount;
};

require([
	"jquery",
	'underscore',
	'backbone',
	'router',
	'backboneCommon',
	'ajaxControl',
	'command',
	'apiPathMapping',
	'searchPathMapping',
	'backboneCustom',
	'commonEvent',
	// 'fastclick'
], function ($,_,Backbone,Router,common,ajaxControl,cmd,apiObj,searchObj,css) {
	// スクロール禁止 ------------------------------------------------------------.
	var body = document.body;
	body.scrollTop = 1;
	window.addEventListener('touchmove', function(e) {
	  if(e.target.type === "range") return;

	  if (e.target === body && body.scrollTop !== 0 && body.scrollTop + body.clientHeight !== body.scrollHeight) {
	    e.stopPropagation();
	  } else {
	    e.preventDefault();
	  }
	},{useCapture: true,passive: false});
	body.addEventListener('scroll', function(e) {
	  if (body.scrollTop === 0) {
	    body.scrollTop = 1;
	  }
	  else if (body.scrollTop + body.clientHeight === body.scrollHeight) {
	    body.scrollTop = body.scrollTop - 1;
	  }
	});
	// ------------------------------------------------------------------------.

	// overlapContainer 内のカーテンにイベント登録
	$("#curtain").on(common.cgti,function() {
		return;
	});

	// ------------------------------------------------------------------------.
	// browser環境
	var platform = window.clientInformation.platform;
	// console.log(platform);

	var gameInit = function(){
		if(window.isBrowser && !window.isDebug) return;
		if(window.isBrowser && window.isDebug){
			// localの処理
			if(location.href.match("file://") || location.href.match("http://localhost:5963")){
				window.isLocal = true;
				window.app_ver = "TEST_LOCAL_FILE";
			}
			require(['isBrowser']);
		}
		if(window.isDebug && !window.g_token) cmd.getAccessToken();
		cmd.getAppVersion();
		cmd.getDeviceInfo("setDeviceInfo");
		var init = function() {
			new Router();
			Backbone.history.start();
			// viewPortの設定(iPhoneX対応)
			var htmlHeightFlg = false;
			var htmlWidthFlg  = false;
			var deviceSize = window.parent.screen;
			var longSize  = (deviceSize.height > deviceSize.width) ? deviceSize.height : deviceSize.width;
			var shortSize = (deviceSize.height > deviceSize.width) ? deviceSize.width : deviceSize.height;
			var calcAspect = shortSize / longSize;
			common.scaleHeight = false;
			common.displayWidth  = 1024;
			common.longSize  = longSize; // iPhoneX対応。画面の幅を保存
			common.shortSize = shortSize;// iPhoneX対応。画面の高さを保存
			common.displayHeight = 0;
			var spl     = window.app_ver.split(".");
			var g_cwVer = spl.join('') | 0;
			//iphoneのアスペクト比確認
			common.ua.isIphoneXOrMore = false;
			/* ios11対策 */
			if(common.ua.ios){
				common.addClass(common.doc.getElementsByTagName("body")[0],"ios");
			}else{
				common.addClass(common.doc.getElementsByTagName("body")[0],"android");
			}
			if(common.ua.ios && calcAspect < 0.53){
				common.scaleHeight = true;
				common.doc.getElementById("viewport").setAttribute("content","width=1280, user-scalable=no");
				common.displayWidth = 1280;
				var dispWidth;
				var dispHeight;
				if(!htmlHeightFlg || !htmlWidthFlg){
					dispWidth  = common.displayWidth;
					dispHeight = (!common.scaleHeight) ? (window.innerHeight | 0) : (window.innerHeight * (1280 / 1024) | 0);
				}
				if(!htmlHeightFlg){ // 画面の高さを取得する
					if(common.doc.getElementsByTagName("html")[0].style.height === "" && dispHeight !== 0){
						common.doc.getElementsByTagName("html")[0].style.height = dispHeight + "px";
						common.displayHeight = dispHeight;
						htmlHeightFlg = true;
					}
				}
				if(!htmlWidthFlg && common.scaleHeight){
					if(common.doc.getElementById("baseContainer")){
						var calcFactor = dispHeight - 36;
						var afterCalc  = calcFactor / dispHeight;
						// var afterLeft  = ((1280 - (1024 * afterCalc)) / 2) | 0;
						// var afterLeft = 0;
						// common.doc.getElementById("baseContainer").style.cssText += '-webkit-transform:scale('+ afterCalc +');-webkit-transform-origin:0 0;left:'+afterLeft+'px;overflow:visible;';
						common.doc.getElementById("baseContainer").style.cssText += '-webkit-transform:scale('+ afterCalc +');-webkit-transform-origin:0 0;left:-webkit-calc((100% - 1024px * '+afterCalc+') / 2);overflow:visible;';
						htmlWidthFlg = true;
					}
				}
				common.ua.isIphoneXOrMore = true;
			}
			cmd.getFontData();
		};
		var that = {
			init : function() {
				init();
			}
		};
		common.baseObj = that;
		// ------------------------------------------------------------------------.
		// apiPathをcommon.linkListにセット
		// common.baseObjのinitが起動
		// ------------------------------------------------------------------------.
		apiObj.pathSet();
		searchObj.pathSet();
	}
	var __beforeGameInit = function(){
		//環境ごとのサーバーUrl取得
		window.serverUrl = '';
		$('#commandDiv').on('nativeCallback',function(e,res) {
			$('#commandDiv').off();
			window.serverUrl = String(res);
			window.sendHostName = window.serverUrl;
			//デバッグフラグ変更
			if(window.serverUrl.indexOf("magi-reco.com") == -1) {
				window.isDebug = true;
			}
			//本番はログを出さない
			if(!window.isDebug) {
				window.console.log = function(){};
			}
			console.log('window.serverUrl', window.serverUrl);
			//game起動
			gameInit();
		});
		cmd.getServerUrl();
		if(window.isBrowser) nativeCallback('');
	};
	//環境を分ける
	if( true || platform === 'Win32' ||  platform === 'Win64' ){
		window.isBrowser = true;
		__beforeGameInit();
	} else if(platform === 'MacIntel'){
		cmd.getSNS();
		setTimeout(function(){
			if(!window.g_sns){
				window.isBrowser = true;
			}else{
				common.ua.ios = true;
			}
			__beforeGameInit();
		},500);
	} else {
		cmd.getSNS();
		__beforeGameInit();
	}
	// ------------------------------------------------------------------------.
});
