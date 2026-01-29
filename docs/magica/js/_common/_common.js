// ----------------------------------------------------------------------------.
if ($) { // jQuery拡張.
	$.fn.num = function () {
		return parseInt(this.text());
	};

	$.fn.exist = function () {
		return ($(this).length > 0);
	};
}

// ----------------------------------------------------------------------------.
if (window.orientation == undefined &&
		location.href.search('ExtendedNotSupportAccessErrorPage') == -1) {
	var not_support_error_link = document.getElementById("not_support_error_link");

	if (not_support_error_link && not_support_error_link.innerText) {
		location.href = not_support_error_link.innerText;
	}
}

// ----------------------------------------------------------------------------.
function getAndroidOSVersion() {
	if (!ua.android) {
		return 0;
	}

	const verStr =
			navigator.userAgent.split('Android ')[1].split(';')[0].split('.');

	var verNum = '';
	for (var i = 0; i < 3; i++) {
		verNum += (i < verStr.length)? verStr[i] : '0';
	}

	return parseInt(verNum);
}

// ----------------------------------------------------------------------------.
// userAgent.
var uaMatch = function () {
	const ua = navigator.userAgent.toLowerCase();
	for (var i = 0; i < arguments.length; i++) {
		if (ua.match(arguments[i])) {
			return true;
		}
	}
	return false;
};

const ua = {
	ios: uaMatch('ipad', 'iphone', 'ipod'),
	ios6: uaMatch('iphone os 6_'),
	ios7: uaMatch('iphone os 7_'),
	ipad: uaMatch('ipad'),
	ipod: uaMatch('ipod'),

	android: uaMatch('android'),
	isAndroidOs5: uaMatch('android 5'),
	isAndroidOs4_4: uaMatch('android 4.4'),
	isAndroidOs4_2: uaMatch('android 4.2'),
	isAndroidOs4_1: uaMatch('android 4.1'),
	isGalaxyNote:uaMatch('sc-02e','sc-01g','sc-05d','scl22','scl24','sc-01f'),
	isGalaxysTab: uaMatch('sc-01e'),
	isGalaxys2: uaMatch('isw11sc', 'sc-02c', 'sc-03d'),
	isGalaxys3: uaMatch('sc-03e', 'sc-06d', 'scl21'),
	isGalaxyNote2: uaMatch('sc-02e'),
	isGalaxys3a: uaMatch('sc-03e'),
	isGalaxyJ: uaMatch('sc-02f'),
	isXperia: uaMatch('is11s', 'is12s', 'so-01b', 'so-01c', 'so-01e', 'so-02e', 'so-03d', 'sol21', 'sol22'),
	isXperiaAX: uaMatch('so-01e'),
	isArrows: uaMatch('f-05d', 'f-10d', 'fjl'),
	isEluga: uaMatch('p-02e'),
	isINFOBAR_A02: uaMatch('htx21'),

	isNexus6: uaMatch('nexus 6'), // Nexus 6.
	isNexus: uaMatch('nexus 6','nexus 5'), // Nexus
	isNexus5x: uaMatch('nexus 5x'), // Nexus
	isSO_04E: uaMatch('so-04e'),
	isLowAnimeRate: uaMatch('201f','201m','202f','203sh','206sh','301f','302hw','302sh','303sh','403sc','404kc','asus_t00p','dm015k','f-01f','f-02e','f-02f','f-04e','f-05e','f-06e','fjl22','htl21','htl22','htl23','l-01e','l-04e','l-05d','l-05e','lgl24','lgv31','n-02e','n-03e','n-04e','n-06e','nexus 10','nexus 7','p-02e','p-03e','sc-01f','sc-01g','sc-02e','sc-02f','sc-03e','sc-04e','sc-06d','scl22','scl24','sh-02e','sh-02f','sh-04f','sh-05f','sh-06e','sh-08e','shl21','shl22','shl23','so-01e','so-04d','sol21','wx10k') //8レート
};

if (ua.ios) {
	ua.iosVersion = parseInt(navigator.userAgent.toLowerCase().
			split('os ')[1].substr(0, 1));

	if (uaMatch('iphone') && screen.availWidth == 480 &&
			screen.availHeight == 320) {
		ua.iphone4 = true;

	} else if (window.devicePixelRatio == 3) {
		ua.iphone6plus = true;
	}
}

uaMatch = null; // 使用済み.

// ----------------------------------------------------------------------------.
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

// ----------------------------------------------------------------------------.
var g_move_span = 0;
var g_move_span_limit = (ua.android) ? 30 : 30;
var g_window_posY = 0;
var g_popup_name = "";
var commonLocal = commonLocal;
var g_iscroll_instance;
var g_iscroll_bottom_event_flag = false;
var g_scrollajax_fin = false;
var g_scrollajax_up_fin = false;
var g_scrollajax_down_fin = false;
var g_scrollajax_loadimg_up;
var g_scrollajax_loadimg_down;
var g_scrollajax_end_type;
var g_body;
var g_historyBackFlag = false;
var g_showStatusPanel = false;
//var g_production_flag = (!commonLocal && location.hostname.indexOf("dev") == -1) ? true : false;
var g_production_flag = (!commonLocal && (location.hostname.indexOf("dev") == -1 || location.hostname.indexOf("127.0.0.1") == -1)) ? true : false;
var g_wkFlag = (window.webkit) ? true : false;

// ----------------------------------------------------------------------------.
// 旧media.js
var DeviceMotionData = function () {
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;
};
DeviceMotionData.prototype.copy = function (copy) {
	copy.x = this.x;
	copy.y = this.y;
	copy.z = this.z;
};

var DeviceMotionDatas = function () {
	this.timeStamp = 0;
	this.gyro = new DeviceMotionData();
	this.accl = new DeviceMotionData();
	this.magne = new DeviceMotionData();
	this.att = new DeviceMotionData();
};

var MediaPlayer = function () {
	this.bgmPause = false;
	this.bgmSetting = true;
	this.seSetting = true;
	this.bgmVolumeSetting = 1;
	this.seVolumeSetting = 1;
	this.voiceVolumeSetting = 1;
	this.device = new DeviceMotionDatas();
	this.deviceMotionCallBack = false;

	//wkwebview対応
	//getRequestHeaderとsetRequestHeaderの為に
	this.callback = null;
	this.submitBtnId = null;
};



// ----------------------------------------------------------------------------.
var commandDiv;

MediaPlayer.prototype.sendCommand = function (command) {
	if (commonLocal) {
		commonLocal.audio(command);
		return;
	}

	//console.log("command",command);
	// --------------------------------------------------------------------------.
	// iOS/Android device only.

	const msg = 'game:' + command;
	if (ua.android) {
		alert(msg);

	} else {

		//wk分岐
		if(g_wkFlag){
			webkit.messageHandlers.gameCommand.postMessage(msg);
		}else{
			if(!commandDiv) commandDiv = document.getElementById("commandDiv");
			var object = document.createElement('object');
			object.setAttribute('data', msg);
			commandDiv.appendChild(object);
			object = null;
		}

		// if(!commandDiv) commandDiv = document.getElementById("commandDiv");
		// var object = document.createElement('object');
		// object.setAttribute('data', msg);
		// commandDiv.appendChild(object);
		// object = null;

	}
};
// ----------------------------------------------------------------------------.
const Command = {
    //DATA関連
    DATA_GET_REQUEST_HEADER : 1,
    DATA_CLEAR_WEB_CACHE    : 10,

    //SOUND関連
    SOUND_BGM_PLAY    : 100,
    SOUND_BGM_STOP    : 101,
    SOUND_BGM_RESUME  : 102,
    SOUND_BGM_PAUSE   : 103,
    SOUND_BGM_SET_VOL : 104,
    SOUND_BGM_GET_VOL : 105,

    SOUND_SE_PLAY     : 110,
    SOUND_SE_STOP     : 111,
    SOUND_SE_SET_VOL  : 114,
    SOUND_SE_GET_VOL  : 115,

    SOUND_VO_PLAY     : 120,
    SOUND_VO_STOP     : 121,
    SOUND_VO_SET_VOL  : 124,
    SOUND_VO_GET_VOL  : 125,

    //FILE関連
    FILE_CLEAR_DLC : 200,

    //SCENE関連
    SCENE_CHANGE_QUEST   : 300,
    SCENE_CHANGE_STORY   : 320,

    //表示関連
    DISPLAY_SHOW_MOVIE : 400,
    DISPLAY_HIDE_MOVIE : 401,
    DISPLAY_SHOW_BG    : 410,
    DISPLAY_HIDE_BG    : 411,
    DISPLAY_SHOW_L2D   : 420,
    DISPLAY_HIDE_L2D   : 421,

    //Animation関連
    ANIMATION_COMPOSE_START : 500,
    ANIMATION_COMPOSE_END   : 501,

    ANIMATION_GACHA_START   : 510,
    ANIMATION_GACHA_END     : 511,

    //端末操作関連
    APP_END : 600
}



// ----------------------------------------------------------------------------.
MediaPlayer.prototype.playBGM = function (filename) {
	this.bgmPause = false;
	this.sendCommand(Command.SOUND_BGM_PLAY + "," + filename);
};
MediaPlayer.prototype.stopBGM = function () {
	this.sendCommand(Command.SOUND_BGM_STOP);
};
MediaPlayer.prototype.pauseBGM = function () {
	if (this.bgmPause == false) {
		this.sendCommand(Command.SOUND_BGM_PAUSE);
		this.bgmPause = true;
	} else {
		this.sendCommand(Command.SOUND_BGM_RESUME);
		this.bgmPause = false;
	}
};
MediaPlayer.prototype.BGMVolumeSet = function (per) {
    this.sendCommand(Command.SOUND_BGM_SET_VOL + "," + per);
};

MediaPlayer.prototype.playSE = function (filename) {
    this.sendCommand(Command.SOUND_SE_PLAY + "," + filename);
};
MediaPlayer.prototype.stopSE = function () {
    this.sendCommand(Command.SOUND_SE_STOP);
};
MediaPlayer.prototype.SEVolumeSet = function (per) {
    this.sendCommand(Command.SOUND_SE_SET_VOL + "," + per);
};

MediaPlayer.prototype.playVOICE = function (filename) {
    this.sendCommand(Command.SOUND_VO_PLAY + "," + filename);
};
MediaPlayer.prototype.stopVOICE = function () {
    this.sendCommand(Command.SOUND_VO_STOP);
};
MediaPlayer.prototype.VoiceVolumeSet = function (per) {
    this.sendCommand(Command.SOUND_VO_SET_VOL + "," + per);
};

MediaPlayer.prototype.settingCheck = function () {
    this.sendCommand("SOUND_BGM_GET_VOL");
    this.sendCommand("SOUND_SE_GET_VOL");
    this.sendCommand("SOUND_VO_GET_VOL");
};

MediaPlayer.prototype.clearCache = function () {
    this.sendCommand(Command.FILE_CLEAR_DLC);
};

MediaPlayer.prototype.playMOVIE = function (filename, returnUrl) {
	this.sendCommand(Command.SHOW_MOVIE + "," + filename);
};

MediaPlayer.prototype.webviewClearCache = function (flag) {
    this.sendCommand(Command.DATA_CLEAR_WEB_CACHE);
};

//アプリを終了するコマンド
MediaPlayer.prototype.appEnd = function () {
	this.sendCommand(Command.APP_END);
};

//SNSUserIdとtokenをネイティブにリクエスト
MediaPlayer.prototype.getRequestHeader = function (callback,submitBtnId) {

	//一旦、コマンドは一切実行しない。
	callback();
	return;

	// //本番なら、まだ何もしないとりあず塞ぐ
	// if(g_production_flag) {
	// 	callback();
	// 	return;
	// }

	// //ios6,7はwkWebViewではないので、コマンド実行しない。
	// if(ua.ios6 || ua.ios7){
	// 	callback();
	// 	return;
	// }

	// //ブラウザで見ているときは、コマンド実行しない。
	// if(window.orientation == undefined){
	// 	callback();
	// 	return;
	// }

	// var method;

	// //callback保存
	// if(callback) {
	// 	this.callback = callback;
	// }

	// //サブミットボタンがあるときは、post送信の時のみコマンドを実行し「setRequestHeader」でtrigger("click");
	// if(submitBtnId){
	// 	//formが存在するか確認
	// 	var form = $("#" + submitBtnId).closest("form");
	// 	if(form[0]){
	// 		method = form.attr("method");
	// 		//methodがなければpostとする
	// 		if(method == undefined) method = "post";
	// 		this.submitBtnId = submitBtnId;
	// 	}
	// }
	// console.log("method",method);

	// //サブミットボタンのformMethodがgetならそのままtrigger。コマンド実行はしない。
	// if(submitBtnId && method == "get"){
	// 	if(callback) callback();
	// 	return;
	// }

	// //ローカルではコマンドは動作しないのでそのままcallback実行
	// if(commonLocal){
	// 	gMediaPlayer.setRequestHeader(123456789,123456789);
	// 	return;
	// }

	// //コマンド実行
	// this.sendCommand("GET_REQUEST_HEADER");

	//if(submitBtnId) this.submitBtnId = submitBtnId;
	//if(callback) this.callback = callback;
};

//SNSUserIdとtokenをネイティブから受取
MediaPlayer.prototype.setRequestHeader = function (sns,token) {

	g_sns = sns;
	g_token = token;

	//戻りがあれば
	if(this.callback){
		this.callback();
		this.callback = null;
		this.submitBtnId = null;
	}
};

// ----------------------------------------------------------------------------.
// cocosの画面を呼び出す.
MediaPlayer.prototype.gotoQuest = function (_id) {
    this.sendCommand( Command.SCENE_CHANGE_QUEST + "," + _id);
};
MediaPlayer.prototype.gotoCompose = function (_json) {
	this.sendCommand( Command.SCENE_CHANGE_COMPOSE + "," + _json);
};
MediaPlayer.prototype.gotoGacha = function (_json) {
    this.sendCommand( Command.SCENE_CHANGE_GACHA + "," + _json);
};

// ----------------------------------------------------------------------------.
var gMediaPlayer = new MediaPlayer();

// ----------------------------------------------------------------------------.
//native acsessa
function mediaBGMVolumeSetting(per) {
	gMediaPlayer.bgmVolumeSetting = per;
}
function mediaSEVolumeSetting(per) {
	gMediaPlayer.seVolumeSetting = per;
}
function mediaVoiceVolumeSetting(per) {
	gMediaPlayer.voiceVolumeSetting = per;
}

//entry point
function mediaPlayBgm() {
	var node = document.getElementById("main_bgm");
	if (node != null && node.innerText.length > 0) {
		gMediaPlayer.playBGM(node.innerText);
	}
}

var g_sns,g_token;



//iosのロード
// function loadToWebviewStart(){
// 	if(ua.ios && g_wkFlag){
// 		if(document.getElementById("commonAjaxLoading")){
// 			document.getElementById("commonAjaxLoading").style.display ="block";
// 			document.getElementById("commonAjaxLoading").style.background ="rgba(0, 0, 0, 0.8)";
// 		}
// 	}
// }

// function loadToWebviewEnd(){
// 	if(ua.ios && g_wkFlag){
// 		if(document.getElementById("commonAjaxLoading")){
// 			document.getElementById("commonAjaxLoading").style.display ="none";
// 			document.getElementById("commonAjaxLoading").style.background ="";
// 		}
// 	}
// }



function mediaHeaderFooter_set() {
	var node = document.getElementById("isNativeHeaderEnabled")
	if (node){
		var str = node.innerText;
		gMediaPlayer.headerfooterOn(str);
	}else{
		gMediaPlayer.headerfooterOff();
	}
}
function mediaHeaderFooter_show() {
	var node = document.getElementById("isNativeHeaderEnabled")
	if (node){
		var str = node.innerText;
		gMediaPlayer.headerfooterOn(str);
	}
}
function mediaHeaderFooter_hide() {
	var node = document.getElementById("isNativeHeaderEnabled")
	if (node){
		gMediaPlayer.headerfooterOff();
	}
}
function mediaFooterTouch(index) {
	var node = document.getElementById("isNativeHeaderEnabled")
	if (node){
		gMediaPlayer.footerTouch(index);
	}
}

//ajaxタイムアウトエラー
function ajaxTimeoutError(reloadURL){
	var commonAjaxLoading = document.getElementById("commonAjaxLoading");
	var commonJsErrorPopup = document.getElementById("commonJsErrorPopup");
	var touchBlock = document.getElementById("touchBlock");

	//ローディングを消す
	if(commonAjaxLoading){
		commonAjaxLoading.style.display = "none";
	}

	//エラーポップアップを出す
	if(commonJsErrorPopup){
		//閉じるボタン
		document.getElementById("commonJsErrorLinkBtn").addEventListener(cgti,function(){
			if(reloadURL){
				location.href = reloadURL;
			}else{
				location.reload();
			}
		});
		document.getElementById("commonJsErrorCautionText").innerHTML = "通信エラーが発生しました。<span style='display:block;margin-top:20px;font-size:20px'>※内部処理は実行されている可能性がございます。</span>"
		document.getElementById("commonJsErrorLinkBtn").innerText = "リロード";
		//ポップアップ立ち上げ
		popupStart("commonJsErrorPopup");
	}

	//ブロックをけす
	if(touchBlock){
		touchBlock.style.display = "none";
	}
}

// ----------------------------------------------------------------------------.
// popup.
var curtainMoveEvent = function (e) {
	e.preventDefault();
	e.stopPropagation();
	return false;
};

var popupStart = function (objID, callBackFunc) {
	//自身だったら実行しない
	if(g_popup_name == objID){
		return;
	}

	//他にポップアップが開いていたら閉じる
	if (g_popup_name) {
		popupClose(g_popup_name);
	}

	//Backboneのレイヤー問題対応
	//一旦CardBase系のページの為に。今後増えていかも

	if(document.getElementById("backboneContent") && objID != "commonJsErrorPopup"){
		document.getElementById("globalNaviFix").style.zIndex = "990";
	}

	g_popup_name = objID;
	var content = document.getElementById(objID);
	var inner = content.getElementsByClassName("popupInner")[0];
	var closeBtn = Array.prototype.slice.call(content.getElementsByClassName("popupCloseBtn"));

	var w = parseInt(content.getAttribute("data-width"));
	var h = content.getAttribute("data-height");
	var top = content.getAttribute("data-top");
	var right = content.getAttribute("data-right");
	var animType = content.getAttribute("data-anim-type");

	//アンドロイド4.4対応、スケールがぼやける対策で、スライド
	animType = (animType == 2 && ua.isAndroidOs4_4) ? 3 : animType;

	var contentStyle = content.style;
	var innerStyle = inner.style;
	var curtain = content.getElementsByClassName("popupCurtain")[0];
	var curtainStyle = curtain.style;

	//下スクロール効かなくする対策
	//var popupScrollWrap = content.getElementsByClassName("popupScrollWrap");
	var popupScrollWrap;
	if (content.getElementsByClassName("popupScrollWrap")) popupScrollWrap = content.getElementsByClassName("popupScrollWrap");

	if (popupScrollWrap.length == 0 ) {
		document.addEventListener("touchmove",curtainMoveEvent);
	} else {
		//android4.0系でポップアップの中身がスクロールしない問題
		if (ua.android && getAndroidOSVersion() < 430) {
			contentStyle.position = "fixed";
		}
	}

	//幅と高さ換算
	if (w) {
		innerStyle.left = (1280 - w) / 2 + "px";
		//if (ua.android && objID != "popupCardDetail") w = w - 10;
		innerStyle.width = w + "px";
	}
	if (h) {
		innerStyle.top = (720 - h) / 2 + "px";
		//if (ua.android && objID != "popupCardDetail") h = h - 10;
		innerStyle.height = h + "px";
	}
	if (top) {
		innerStyle.top = top + "px";
	}
	if(right){
		innerStyle.left = "auto";
		innerStyle.right = right + "px";
	}
	//カーテン
	if (!curtain.hasEvent) {
		curtain.addEventListener(cgti, close, false);
	}
	curtain.hasEvent = true;


	//開く
	animType = (animType) ? " anim" + animType : "";
	content.className = "popupContent open" + animType;
	contentStyle.display = "block";

	//サウンド
	gMediaPlayer.playSE("se_kettei02");

	//閉じるボタンイベント登録
	var l = closeBtn.length;
	for (var i = 0; i < l; i++) {
		var closeButton = closeBtn[i];
		if (!closeButton.hasEvent) {
			closeButton.addEventListener(cgti, close);
		}
		closeButton.hasEvent = true;
	}

	//WKWebViewヘルプ非表示になる現象対応
	if(ua.ios) {
		window.scrollBy(0,1);
		setTimeout(function() {
			window.scrollBy(0,-1);
		}, 100);
	}

	//閉じる関数
	function close(e) {
		if (g_move_span < g_move_span_limit) {
			e.preventDefault();
			if (content.className.indexOf("close") == -1) {
				gMediaPlayer.playSE("se_cancel");
				popupClose(objID, callBackFunc);
			}
		}
	}

	//##########################
	//var content = null;
	var inner = null;
	var closeBtn = null;

	var w = null;
	var h = null;
	var top = null;
	var right = null;
	var animType = null;

	var contentStyle = null;
	var innerStyle = null;
	var curtain = null;
	var curtainStyle = null;

	var popupScrollWrap = null;

};

// ----------------------------------------------------------------------------.
var popupClose = function (objID, callBackFunc) {
	//Backboneのレイヤー問題対応
	//CardBase系のページの為に
	if(document.getElementById("backboneContent")){
		document.getElementById("globalNaviFix").style.zIndex = "1001";
	}

	var content = document.getElementById(objID),
	inner = content.querySelectorAll(".popupInner")[0],
	animType = content.getAttribute("data-anim-type");

	//下スクロール効かなくする対策
	document.removeEventListener("touchmove",curtainMoveEvent);

	//WKWebViewヘルプ非表示になる現象対応(元の位置に戻す)
	if(ua.ios) {
		window.scrollBy(0,-1);
		setTimeout(function() {
			window.scrollBy(0,1);
		}, 100);
	}

	//閉じた後のイベント（開いた瞬間のイベント登録と２段構え）############################################
	if(!inner.hasCloseEvent) inner.addEventListener("webkitAnimationEnd", motionEnd);
	function motionEnd(e) {


		if (content.className.indexOf("close") == -1) return;

		content.style.display = "none";
		$(content).removeClass("close");
		if (callBackFunc != undefined && callBackFunc != null && typeof(callBackFunc) == "function") {
			callBackFunc();
		}

		//カスタムイベント
		var customEvent = document.createEvent("HTMLEvents");
		customEvent.initEvent(objID + "Close", true, false);
		var result = content.dispatchEvent(customEvent);
		customEvent = null;
		result = null;

		//グローバル変数更新
		g_popup_name = (objID == g_popup_name) ? "" : g_popup_name;

	}
	inner.hasCloseEvent = true;
	//################################################################################################

	//閉じるアニメスタート
	animType = (animType) ? " anim" + animType : "";
	content.className = "popupContent close" + animType;
	animType = null;
};



//アンドロイドネイティブから実行される関数
var popupCloseAll_historyBack = function () {


	var doc = document;

	var globalMenuBackBtn = doc.getElementById("globalMenuBackBtn");
	//特定のページで操作不可！
	if(doc.getElementById("Tutorial020SectionPage")) return;
	if(doc.getElementById("Tutorial110SectionPage")) return;
	if(doc.getElementById("Tutorial080ComposeTopPage")) return;
	if(doc.getElementById("Tutorial120QuestAssistSelectPage")) return;
	if(doc.getElementById("ClanNavi")) return;

	var popup_common_menu = doc.getElementById("popup_common_menu");

	//ポップアップが開いていたら閉じる
	if (g_popup_name) {
		popupClose(g_popup_name);
		g_popup_name = "";
		//サウンド（キャンセル）
		gMediaPlayer.playSE("se_cancel");

	}else if(popup_common_menu){

		if(popup_common_menu.className == "show"){
			popup_common_menu.className = "";

		//backboneページのCardBaseかEventBCBasePageがいたら（戻る保存対応）
		}else if(doc.getElementById("CardBasePage") || doc.getElementById("EventBCBasePage")){

			//UnitTop以外は戻るボタンタップ！
			if(location.href.indexOf("UnitTop") == -1 || location.href.indexOf("EventBCTop") == -1){
				//$("#globalMenuBackBtn").trigger(cgti);
				var customEvent = doc.createEvent("HTMLEvents");
				customEvent.initEvent("androidBackBtn", true, false);
				var result = globalMenuBackBtn.dispatchEvent(customEvent);
			}else{
				//nothing
			}

		//戻るボタンがある時はリンク
		}else if(globalMenuBackBtn){
			location.href = globalMenuBackBtn.href;
		}
	}

	var MyPage = doc.getElementById("MyPage");
	if (MyPage) {
		popupStart("popupAppEndConf");
	}

	doc = null;


};

// ----------------------------------------------------------------------------.
// ajaxScroll.
(function ($) {
	$.fn.scrollAjax = function (options) {
		var defaults = {
			// how close to the scrollbar is to the bottom before triggering the event
			proximity: 0,
			upAjax: false
		};
		var options = $.extend(defaults, options);
		//console.log(options)
		return this.each(function () {
			var obj = this;

			$(obj).bind("scroll", function () {
				var scrollHeight = 0;
				if (obj == window) {
					scrollHeight = $(document).height();
				} else {
					scrollHeight = $(obj)[0].scrollHeight;
				}

				scrollPosition = $(obj).height() + $(obj).scrollTop();

				if ((scrollHeight - scrollPosition) / scrollHeight <= options.proximity) {
					if(g_scrollajax_end_type && g_scrollajax_end_type.value != "") {
						return false;
					}
					$(obj).trigger("scrollLimit","down");
				}
				if ($(obj).height() == scrollPosition && options.upAjax == true) {
					if(g_scrollajax_end_type && g_scrollajax_end_type.value != "") {
						return false;
					}
					$(obj).trigger("scrollLimit","up");
				}
			});
			return false;
		});
	};
	$.fn.scrollAjaxOff = function (options) {
		return this.each(function () {
			var obj = this;
			$(obj).off("scroll");
			return false;
		});
	};
})(jQuery);


var scrollAjax = function (scrollWrapjQueryWord, targetInputjQueryWord, scrollAjaxUP) {

	var optionUp = scrollAjaxUP ? scrollAjaxUP : false;
	var reloadBtn = $(targetInputjQueryWord);
	g_scrollajax_end_type = document.getElementById("scroll-end-type");
	g_scrollajax_loadimg_up = document.getElementById("scrollAjaxLoadingUp");
	g_scrollajax_loadimg_down = document.getElementById("scrollAjaxLoadingDown");

	var scrollAjaxWrapObj = (scrollWrapjQueryWord != "window") ? $(scrollWrapjQueryWord) : $(window);
	if (scrollAjaxWrapObj != null && scrollAjaxWrapObj.length != 0) {
		if (reloadBtn != null && reloadBtn.length != 0) {
			scrollAjaxWrapObj.scrollAjax({proximity: 0.002,upAjax: optionUp});
			scrollAjaxWrapObj.bind("scrollLimit", function (e,motionType) {
				if (!g_scrollajax_fin) {
					//console.log(motionType)

					if(g_scrollajax_end_type) {
						if (motionType == "down" && g_scrollajax_down_fin || motionType == "up" && g_scrollajax_up_fin){
							return;
						}
						g_scrollajax_end_type.value = motionType;
						//console.log("g_scrollajax_end_type = " + g_scrollajax_end_type.value);
					}

					//console.log("scroll");
					reloadBtn.trigger("click");

					if (g_scrollajax_loadimg_down && motionType == "down") {
						g_scrollajax_loadimg_down.style.display = "block";
					}
					if (g_scrollajax_loadimg_up && motionType == "up") {
						g_scrollajax_loadimg_up.style.display = "block";
					}
				}
			});
		}
	}
};

var iscrollStart = function () {
	var wrap = document.getElementById("scene_wrap");
	wrap.style.height = "720px";
	setTimeout(function () {
		g_iscroll_instance = new IScroll("#scene_wrap", {
			bounce: false,
			hScroll: false
		});
	}, 100);
};
//スクロールAjaxが終わりました。
var scrollAjaxLoadComp = function () {
	scrollAjaxCompFunc();
};
//スクロールAjaxが終わりました。もうこれ以上ありません。
var scrollAjaxLoadFin = function () {
	if(g_scrollajax_end_type) {
		if (g_scrollajax_end_type.value == "down"){g_scrollajax_down_fin = true;}
		else {g_scrollajax_up_fin = true;}
		if (g_scrollajax_down_fin && g_scrollajax_up_fin){g_scrollajax_fin = true;}
	} else {
		g_scrollajax_fin = true;
	}
	scrollAjaxCompFunc();
};

var scrollAjaxCompFunc = function () {
	if (g_iscroll_instance) {
		g_iscroll_instance.refresh();
		g_iscroll_bottom_event_flag = false;
	}
	if(g_scrollajax_end_type) {
		g_scrollajax_end_type.value = "";
	}
	if (g_scrollajax_loadimg_down) {
		g_scrollajax_loadimg_down.style.display = "none";
	}
	if (g_scrollajax_loadimg_up) {
		g_scrollajax_loadimg_up.style.display = "none";
	}
};

//ajaxが終わったら関数
var ajaxCompFuncHref = function (url) {
	location.href = url;
};
var ajaxCompFuncReplace = function (url) {
	location.replace(url);
};

//サーバーサイドから実行するクエストスタート
var questStartFunc = function (quest_id) {

	//デバックのために
	// var img = document.createElement("img");
	// img.src = document.getElementById("resDir").innerText + "/common/dummy/dummy.png?" + new Date().getTime();

	gMediaPlayer.gotoQuest(quest_id);
};

var gvgStartFunc = function (_id) {
	gMediaPlayer.gotoGvG(_id);
};

// ----------------------------------------------------------------------------.
// popup_common_menu
function menuGvgTimeSet() {
	var popup_common_menu = document.getElementById("popup_common_menu");

	// 未解放？
	if(document.getElementById("naviCombat").className.indexOf("lock") != -1) return;
	var menuGVGTimeer;
	var popupGuildTimer = document.getElementById("popupGuildTimer");
	var popupGuildTimerView = document.getElementById("popupGuildTimerView");
	var nowTime = new Date().getTime() / 1000 | 0;
	var battleEndTime = nowTime + parseInt(popupGuildTimer.innerText);

	//loc対策！
	var locBattleBtn = document.getElementById("locBattleBtn");

	//停戦中
	if(popupGuildTimer.innerText == "-1"){
		popupGuildTimerView.innerText = "停戦中";
	} else {

		menuGVGTimeer = setInterval(function () {
			var currentTime = new Date().getTime() / 1000 | 0;
			var spanS = battleEndTime - currentTime;

			var s = spanS | 0;
			var m = s / 60 | 0;
			var h = m / 60 | 0;
			var ss = s % 60;	//あとm分とss秒でmaxになる

			m %= 60;
			s %= 60;

			s = String(s + 100).substr(1, 2);
			m = String(m + 100).substr(1, 2);
			h = String(h + 100).substr(1, 2);

			 if (spanS <= 0) {
				popupGuildTimerView.innerText = "00:00:00";
				 if(locBattleBtn){
				 	locBattleBtn.innerText = "00:00:00";
				 }
				$("#naviCombat").removeClass("battle");
				document.getElementById("naviCombat").href = document.getElementById("popupCombatLink").innerText;

				//カスタムイベント レイド戦終了用　使用マンスリークエストTOP
				var customEvent = document.createEvent("HTMLEvents");
				customEvent.initEvent("battleEnd", true, false);
				var result = popupGuildTimerView.dispatchEvent(customEvent);

				clearInterval(menuGVGTimeer);
			} else {
				 popupGuildTimerView.innerText = h + ":" + m + ":" + s;
				 if(locBattleBtn){
				 	locBattleBtn.innerText = h + ":" + m + ":" + s;
				 }
			}
		}, 1000);
	}
}

var StatusFunc = function () {
	var doc = document;

	//AP値があるか確認
	var menuStatusApMaxTime;
	var nowTime;
	var ApMaxTime;
	var statusMenuApTime;
	var statusMenuApTimeWrap;
	var nowAp;
	var maxAP;
	var menuApGaugeStyle;
	var menuStatusApCurrent;
	var headTime;
	var currentAP;
	var switchFlag = false;

	var apTimeFunc = function () {
		var currentTime = new Date().getTime() / 1000 | 0;
		var spanS = ApMaxTime - currentTime;

		var s = spanS;
		var m = 1 + s / 60 | 0;
		var h = m / 60 | 0;
		var remainAp =1 + s / 300 | 0;


		//console.log("remainAp",remainAp,"  s",s);
		 if (spanS <= 0) {
			statusMenuApTimeWrap.style.display = "none";
			menuStatusApCurrent.innerText = maxAP;
			menuApGaugeStyle.width = "100%";

			//カスタムイベント
			var customEvent = doc.createEvent("HTMLEvents");
			customEvent.initEvent("APMax", true, false);
			var result = menuStatusApMaxTime.dispatchEvent(customEvent);

			clearInterval(headTime);
		} else {
			currentAP = maxAP - remainAp;
			menuStatusApCurrent.innerText = currentAP;
			menuApGaugeStyle.width = (currentAP / maxAP) * 100 + "%";

			//レイドトップ用カスタムイベント
			if(switchFlag){
				var customEvent = doc.createEvent("HTMLEvents");
				customEvent.initEvent("APCountDown", true, false);
				var result = menuStatusApMaxTime.dispatchEvent(customEvent);
				switchFlag = false;
			}
			if(s % 300 == 0){
				switchFlag = true;
			}

			m %= 60;
			s %= 60;

			m = String(m + 100).substr(1, 2);
			h = String(h + 100).substr(1, 2);

			statusMenuApTime.innerText = h + ":" + m;
		}
	};

	return {
		statusApTimeStart: function () {
			menuStatusApMaxTime = doc.getElementById("menuStatusApMaxTime");

			if(!menuStatusApMaxTime) return;

			nowTime = new Date().getTime() / 1000 | 0;
			ApMaxTime = nowTime + parseInt(menuStatusApMaxTime.innerText);
			statusMenuApTime = doc.getElementById("statusMenuApTime");
			statusMenuApTimeWrap = doc.getElementById("statusMenuApTimeWrap");
			menuApGaugeStyle = doc.getElementById("menuApGauge").style;
			menuStatusApCurrent = doc.getElementById("menuStatusApCurrent");
			nowAp = parseInt(menuStatusApCurrent.innerText);
			maxAP = parseInt(doc.getElementById("menuStatusApMax").innerText);

			//APがMAX超え対応
			if(nowAp){
				if(nowAp > maxAP){
					statusMenuApTimeWrap.style.display = "none";
					menuApGaugeStyle.width = "100%";
					menuStatusApCurrent.className = "c_gold";
					return;
				}
			}

			//ヘッダータイマー
			if(menuStatusApMaxTime) apTimeFunc();
			headTime = setInterval(function () {
				apTimeFunc();
			}, 1000);
		},
		resetTime: function (ap,maxTime){
			t = new Date().getTime() / 1000 | 0;
			ApMaxTime = t + parseInt(maxTime);

			//APがMAX超え対応
			if(ap > maxAP){
				clearInterval(headTime);
				currentAP = ap;
				menuStatusApCurrent.innerText = ap;
				statusMenuApTimeWrap.style.display = "none";
				menuApGaugeStyle.width = "100%";

				//カスタムイベント
				var customEvent = doc.createEvent("HTMLEvents");
				customEvent.initEvent("APMax", true, false);
				var result = menuStatusApMaxTime.dispatchEvent(customEvent);

				return;

			}else if(maxTime == 0){
				currentAP = maxAP;
			}
			apTimeFunc();
		},
		getCurrentAp : function(){
			//console.log("currentAP",currentAP);
			return currentAP;
		}
	}
}();

// ----------------------------------------------------------------------------.
// ローカル用Ajax関数.
function localAjax(path) {
	var scriptDummy = document.getElementById("scriptDummy");
	$.ajax({
		url: path,
		dataType: "html",
		cache: false
	}).done(function (data) {
		scriptDummy.innerHTML = data;

		//読み込んだhtml内のスクリプトを実行
		var ajaxScript = scriptDummy.getElementsByClassName("ajaxScript");
		if (ajaxScript) {
			for (var e = 0; e < ajaxScript.length; e++) {
				eval(ajaxScript[e].innerHTML);
			}
		}
	});
}

/*Array.prototype.shuffle = function () {
	var i = this.length;
	while (i) {
		var j = Math.floor(Math.random() * i);
		var t = this[--i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
}*/

// ----------------------------------------------------------------------------.
function isScrolled() {
	return (g_move_span < g_move_span_limit)? false : true;
}

// ----------------------------------------------------------------------------.
const cgti = (function () { // commonGetTouchId. 端末によって効き具合が異なる.
	if (!ua.ios && !ua.android) {
		return 'click'; // pc browser.

	} else if (ua.isGalaxys2 || ua.isGalaxys3) {
		return 'click'; // !touchend.
	}

	return 'touchend'; // default. iOS=!click.
})();

// ----------------------------------------------------------------------------.
function spf() { // sprintf.
	var s = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		s = s.replace(/%d|%f|%s/, arguments[i]);
	}

	return s;
}

// ----------------------------------------------------------------------------.
function cpf() { // console printf.
	if (!commonLocal) {
		return;
	}

	var s = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		s = s.replace(/%d|%f|%s/, arguments[i]);
	}

	//console.log(s);
}

// ----------------------------------------------------------------------------.
function cpt() { // copy $.text to.
	const args = arguments;

	switch (args.length) {
	case 2: // $0.text <- $1.text(or string).
		(function () {
			const src = ($(args[1]).exist())? $(args[1]).text() : args[1];
			$(args[0]).text(src);
		})();
		break;

	case 3: // $0.$1 <- $2.text(or string).
		(function () {
			const src = ($(args[2]).exist())? $(args[2]).text() : args[2];

			switch (args[1]) {
			case 'html':
				$(args[0]).html(src);
				break;

			case 'class':
				$(args[0]).attr('class', src);
				break;

			default:
				$(args[0]).attr(args[1], src);
				break;
			}
		})();
		break;
	}

	return $(args[0]);
}

// ----------------------------------------------------------------------------.
function sendMessageToApp(message) {
	if (commonLocal) {
		return;
	}

	const MESSAGE_FOR_APP = 'game:' + message;

	if (ua.android) {
		alert(MESSAGE_FOR_APP);

	} else if (ua.ios) {
		var object = document.createElement('object');
		object.setAttribute('hight', '0px');
		object.setAttribute('width', '0px');
		object.setAttribute('data', MESSAGE_FOR_APP);

		document.documentElement.appendChild(object);

		object.parentNode.removeChild(object);
		object = null;
	}
}

// ----------------------------------------------------------------------------.
function hideLoadingWait() {
	sendMessageToApp('LOAD_HIDE');
}
