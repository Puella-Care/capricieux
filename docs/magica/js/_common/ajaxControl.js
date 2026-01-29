/*global define*/
define([
	"jquery",
	'backbone',
	"backboneCommon",
	"command"
], function ($,Backbone,common,cmd) {
	'use strict';
	var callback;

	var fetchCount = 0;
	var fetchCountMax = 0;
	var resObj = {};
	var pageJsonObj = {};
	var purePageJsons = {};
	var xhrArray = []; // 個別に通信するため、リトライ用に通信内容を完了まで保持しておく

	var isMaintenance = false;

	// ------------------------------------------------------------------------.
	// ajax共通処理
	// ------------------------------------------------------------------------.
	//wkWebView、プロキシ無し対応（仮）
	$(document).ajaxSend(function(e,xhr,settings){
		if(window.g_sns){
			// SNS USER ID
			xhr.setRequestHeader("USER-ID-FBA9X88MAE" , window.g_sns);

			// テスト環境用 アクセストークン
			if (window.isDebug && window.g_token) xhr.setRequestHeader("F4-Access-Token", window.g_token);
			// バージョン
			if (window.app_ver) xhr.setRequestHeader("F4S-CLIENT-VER", window.app_ver);
			// ドメイン部
			// if (window.sendHostName) xhr.setRequestHeader("X-Platform-Host", window.sendHostName);
			if (window.sendHostName){
				xhr.setRequestHeader("X-Platform-Host", window.sendHostName);
			}else{
				window.sendHostName = location.hostname;
				xhr.setRequestHeader("X-Platform-Host", window.sendHostName);
			}
			// ネイティブからもらったモデル名
			if (window.modelName) xhr.setRequestHeader("CLIENT-MODEL-NAME", window.modelName);
			// ネイティブからもらったOSバージョン
			if (window.osVersion) xhr.setRequestHeader("CLIENT-OS-VER", window.osVersion);
			// ネイティブからもらう予定のアプリ起動ID(タイムスタンプ)
			if (window.bootCount) xhr.setRequestHeader("CLIENT-SESSION-ID", window.bootCount);
			// Webで生成したWebView起動ID(タイムスタンプ)
			if (window.webInitTime) xhr.setRequestHeader("WEBVIEW-SESSION-ID" , window.webInitTime);
		} else if(!window.isDebug && !window.isBrowser) {
			stopAllAjax();
		}
	});

	// ------------------------------------------------------------------------.
	// ajax通信開始
	// ------------------------------------------------------------------------.
	$(document).ajaxStart(function(e) {
		// console.log("ajaxStart",e);
		common.loading.show();
	});

	// ------------------------------------------------------------------------.
	// ajax通信エラー
	// ------------------------------------------------------------------------.
	$(document).ajaxError(function() {
		// console.log("ajaxError:",arguments);

		//タイムアウトエラー
		if(arguments[3] == "timeout"){
			common.tapBlock(false);
			common.loading.hide();

			// アンドロイドのバックキーは使えないように
			common.androidKeyStop = true;

			var callback = function() {
				$("#resultCodeError .decideBtn").on(common.cgti,function(e){
					$("#resultCodeError .decideBtn").off();
					// リロード
					cmd.nativeReload("#/TopPage");

					if(window.isDebug && window.isBrowser){
						location.href = "#/TopPage";
						location.reload();
					}
				});
			};

			new common.PopupClass({
				title:"通信エラー",
				popupId:"resultCodeError",
				content :"通信環境の良い所で再度お試しください。",
				"decideBtnText":"リロード",
				canClose: false
			},null,callback);
			return;
		}

		//無理やり中断
		if(arguments[3] == "abort"){
			common.tapBlock(false);
			common.loading.hide();
			return;
		}

		if(arguments[1].responseJSON) {
			if (arguments[1].responseJSON.resultCode == "maintenance") {
				if(isMaintenance) return;
				isMaintenance = true;

				var spl     = window.app_ver.split(".");
				var g_cwVer = spl.join('') | 0;
				if(g_cwVer < 160){
					oldVersionFunction();
					location.href = "#/Maintenance";
					location.reload();
				}else{
					cmd.nativeReload("#/Maintenance");
				}
				return;
			}
		}

		if(arguments[1].status == 429 || arguments[1].status == 502 || arguments[1].status == 503) {
			return;
		}
	});

	// ------------------------------------------------------------------------.
	// ajax通信完了
	// ------------------------------------------------------------------------.
	$(document).ajaxComplete(function(res){
		// console.log("arg: ",arguments);
		// foxデータ送信
		if(arguments[1].status == 200 && arguments[1].responseJSON && arguments[1].responseJSON["fox"]) {
			if(arguments[1].responseJSON["adjust"]){
				cmd.setFoxData(arguments[1].responseJSON["fox"],arguments[1].responseJSON["adjust"]);
			}else{
				cmd.setFoxData(arguments[1].responseJSON["fox"]);
			}
		}

		// webが起動した時間を持っておく
		if(!window.webInitTime && arguments[1].responseJSON && arguments[1].responseJSON.currentTime) {
			var newDate  = arguments[1].responseJSON.currentTime.split(" ");
			var _newDate = "";
			_.each(newDate[0].split("/"),function(num) {
				_newDate += num;
			});
			_.each(newDate[1].split(":"),function(num) {
				_newDate += num;
			});
			window.webInitTime = _newDate;
		}

		// --------------------------------------------------------------------.
		if(arguments[1].status == 400) {
			common.loading.hide();
			return;
		}

		if(arguments[1].responseJSON) {
			if (arguments[1].responseJSON.resultCode == "maintenance") {
				if(isMaintenance) return;
				isMaintenance = true;

				var spl     = window.app_ver.split(".");
				var g_cwVer = spl.join('') | 0;
				if(g_cwVer < 160){
					oldVersionFunction();
					location.href = "#/Maintenance";
					location.reload();
				}else{
					cmd.nativeReload("#/Maintenance");
				}
				return;
			}
		}

		if(arguments[1].status !== 200 && arguments[1].status !== 429 && arguments[1].status !== 502 && arguments[1].status !== 503) {
			var statusCode = (!arguments[1].status) ? "-" : arguments[1].status;

			if(window.isBrowser && arguments[1].status == 404) {
				return;
			}

			callback = function() {
				common.tapBlock(false);
				common.loading.hide();
				$("#resultCodeError .decideBtn").on(common.cgti,function(e){
					$("#resultCodeError .decideBtn").off();
					// リロード
					cmd.nativeReload("#/TopPage");

					if(window.isDebug && window.isBrowser){
						location.href = "#/TopPage";
						location.reload();
					}
				});
			};

			// アンドロイドのバックキーは使えないように
			common.androidKeyStop = true;

			//タイムアウトエラー
			if(statusCode == "-") {
				new common.PopupClass({
					title:"通信エラー",
					popupId:"resultCodeError",
					content :"通信環境の良い所で再度お試しください。",
					"decideBtnText":"リロード",
					canClose: false
				},null,callback);
				return;
			}

			// 予期せぬエラー
			new common.PopupClass({
				title:   "予期せぬエラー",
				popupId: "resultCodeError",
				content :"予期せぬエラーが発生しました。<br />ご迷惑をおかけし、申し訳ございません。["+statusCode+"]",
				"decideBtnText":"トップページへ",
				canClose: false
			},null,callback);
			return;
		}

		if(arguments[1].responseJSON && arguments[1].responseJSON.resultCode == "error") {
			common.tapBlock(false);
			common.loading.hide();
			new common.PopupClass({
				title:arguments[1].responseJSON.title,
				popupId:"resultCodeError",
				content :arguments[1].responseJSON.errorTxt,
				closeBtnText : "閉じる"
			});
			return;
		}
	});

	$.ajaxSetup({timeout:20000});

	// ------------------------------------------------------------------------.
	// storage/pageJsonへの保存処理 local確認用
	// ------------------------------------------------------------------------.
	//保存 model
	function fetchModel(arr,url){
		var modelId = arr.id;
		var Model = Backbone.Model.extend({
			url:url,
			parse: function(resJson) {
				return resJson[modelId];
			}
		});
		var model = new Model();
		var fetch = model.fetch({
			success : function(model,res){
				common.setStorage(model,modelId);
				pageJsonObj[modelId] = res[modelId];

				fetchCompLocal(res);
			}
		});
		xhrArray.push(fetch);
	};

	//保存 collection
	function fetchCollection(arr,url){
		var collectionId = arr.id;
		var Collection = Backbone.Collection.extend({
			url:url,
			parse: function(resJson) {
				return resJson[collectionId];
			}
		});
		var collection = new Collection();
		var fetch = collection.fetch({
			success : function(collection,res){
				// console.log(res);
				common.setStorage(collection,collectionId);
				pageJsonObj[collectionId] = res[collectionId];
				fetchCompLocal(res);
			}
		});
		xhrArray.push(fetch);
	};

	//保存しない使いきりJson
	function fetchJson(arr,url){
		var id = arr.id;
		var ajax = $.ajax({
			url: url,
			type: "GET",
			dataType: "json"
		}).done(function( res ) {
			console.log("fetch",res)
			for(var key in res) {
				purePageJsons.push(key);
				pageJsonObj[key] = res[key];
			}
			fetchCompLocal(res);
		});
		xhrArray.push(ajax);
	};

	function fetchCompLocal(res){
		if(typeof res.resultCode !== "undefined") {
			if (res.resultCode == "error") stopAllAjax();
		}
		$.extend(resObj,res);
		fetchCount += 1;
		if(fetchCount == (fetchCountMax + 1)){
			//レスポンスをcommonに保存しておく
			common.responseJson = resObj;
			$(that).trigger("complete",resObj);
		}
	};

	// ------------------------------------------------------------------------.
	// storage/pageJsonへの保存処理
	// ------------------------------------------------------------------------.
	function fetchComp(res){
		if(typeof res.resultCode !== "undefined") {
			if (res.resultCode == "error") stopAllAjax();

			if (res.resultCode == "maintenance") {
				if(isMaintenance) return;
				isMaintenance = true;

				var spl     = window.app_ver.split(".");
				var g_cwVer = spl.join('') | 0;
				if(g_cwVer < 160){
					oldVersionFunction();
					location.href = "#/Maintenance";
					location.reload();
				}else{
					cmd.nativeReload("#/Maintenance");
				}
				return;
			}
		}
		common.responseJson = res;
		$(that).trigger("complete",res);
	};

	
	function stopAllAjax(){
		var leng = xhrArray.length;
		for(var i = 0;i<leng ; i++){
			if(xhrArray[i].readyState != 4) xhrArray[i].abort();
		}
	};

	function oldVersionFunction(){
		// 旧バージョン403用特殊処理
		// この先はベタがきのHTMLが読まれるのでここでトップページ準拠のリムーブを行う。
		cmd.startBgm('bgm00_system01');
		cmd.changeBg('web_common.ExportJson');

		cmd.stopMemoriaTop();
		cmd.endQuest();
		cmd.endArena();
		cmd.endL2d();
		cmd.hideMiniChara();
		cmd.hideMultiMiniChara();
		cmd.popEventBranch();
		cmd.hideSubQuestBg();
		cmd.popEventSingleRaid();
		cmd.deleteEventWitchExchangeAnime();
		cmd.callTouchesClear();
		cmd.weekQuestTopUnset();
		cmd.stopComposeEffect();
		cmd.turnOffCamera();
		cmd.stopNormalGachaMemoria();
		cmd.formationPreviewRemove();
		cmd.enemyFormationPreviewRemove();
		cmd.endGachaAnimation();
		cmd.endPlayMovie();
		cmd.hideEventDungeon();
		cmd.hideEventRaid();

		// webview非表示だと出ないので起動しておく。
		cmd.setWebView();
	}

	// ------------------------------------------------------------------------.
	var that = {
		interruptCheck: function(respJson,noInterruptFlag) {                    // 割り込み処理
			// 強制キャッシュクリア
			if(respJson.forceClearCache) {
				cmd.clearWebCache();
			}

			// 強制ダウンロードリソース
			if(respJson.resourceUpdated) {
				common.androidKeyStop = true;
				var callback = function() {
					common.tapBlock(false);
					common.loading.hide();

					$("#resultCodeError .decideBtn").on(common.cgti,function(e){
						$("#resultCodeError .decideBtn").off();
						// リロード
						cmd.nativeReload("#/TopPage");
						if(window.isDebug && window.isBrowser){
							location.href = "#/TopPage";
							location.reload();
						}
					});
				};
				new common.PopupClass({
					"title"        :"データ更新",
					"popupId"      :"resultCodeError",
					"content"      :"データが更新されました。<br>トップページに遷移します。",
					"decideBtnText":"トップページへ",
					"canClose"     : false
				},null,callback);
				return true;
			}

			if(respJson.interrupt && !noInterruptFlag){
				if(respJson.interrupt.page.indexOf(common.location) == -1) {
					common.interrupt = respJson.interrupt.page;
				}
				location.href = respJson.interrupt.page;
				var spl     = window.app_ver.split(".");
				var g_cwVer = spl.join('') | 0;
				if(respJson.interrupt.page == ("#/TopPage")){
					if(g_cwVer < 160 || (window.isDebug && window.isBrowser)){
						oldVersionFunction();
						location.href = "#/TopPage";
						location.reload();
					}else{
						cmd.nativeReload("#/TopPage");
					}
				}else if(respJson.interrupt.page == ("#/NewVersionRecommend")) {
					if(g_cwVer < 160 || (window.isDebug && window.isBrowser)){
						oldVersionFunction();
						location.href = "#/NewVersionRecommend";
						location.reload();
					}else{
						cmd.nativeReload("#/NewVersionRecommend");
					}
				}else if(respJson.interrupt.page == ("#/Ban")) {
					if(g_cwVer < 160 || (window.isDebug && window.isBrowser)){
						oldVersionFunction();
						location.href = "#/Ban";
						location.reload();
					}else{
						cmd.nativeReload("#/Ban");
					}
				}
			}

			return false;
		},
		ajaxPost : function(url,prm,callback) {
			xhrArray = [];
			var ajax = $.ajax({
				url: url,
				type: "POST",
				contentType: 'application/JSON',
				dataType: "JSON",
				data: JSON.stringify(prm),
				error: function(res) {
					console.log("通信エラーのポップアップ出したい");
					var x = this;
					accessBusyCallback(x,res);
				},
				success: function(res) {
					if(that.interruptCheck(res,false)) return;
					apiAccessCallback(res,callback);
				}
			});
			xhrArray.push(ajax);
		},
		ajaxPlainPost : function(url,prm,callback) {
			xhrArray = [];
			var ajax = $.ajax({
				url: url,
				type: "POST",
				contentType: 'text/plain',
				dataType: "text",
				data: prm,
				error: function(res) {
					var x = this;
					accessBusyCallback(x,res);
				},
				success: function(res) {
					if(that.interruptCheck(res,false)) return;
					apiAccessCallback(res,callback);
				}
			});
			xhrArray.push(ajax);
		},
		ajaxSimpleGet : function(url,id,callback) {
			xhrArray = [];
			var getUrl;
			getUrl = (id !== "") ? url + "/" + id : url;
			var ajax = $.ajax({
				url: getUrl,
				type: "GET",
				error: function(res) {
					var x = this;
					accessBusyCallback(x,res);
				},
				success: function(res) {
					if(window.isLocal) {
						try {
							res = JSON.parse(res);
						} catch (error) {
							//エラー時の処理
						}
					}
					if(that.interruptCheck(res,false)) return;
					apiAccessCallback(res,callback);
				}
			});
			xhrArray.push(ajax);
		},
		simplePageModelGet: function(pageId,prm,callback) {
			var url = pageId ? pageId : common.location;
			if (!window.isLocal) {
				url = window.serverUrl + "/magica/api/page/" + url;
			} else {
				url = "/magica/json/page/" + url + ".json";
			}
			this.ajaxPost(url,prm,callback);
		},
		pageModelGet: function(jsonIdArray,noInterrupt,postPrm) {
			// SNS USER IDがなければ取得する
			if(!window.g_sns) cmd.getSNS();

			// テスト環境でトークンがなければ取得する
			if(window.isDebug && !window.g_token) cmd.getAccessToken();
			
			if(window.isLocal) { // localだったら
				this.eachGet(jsonIdArray,noInterrupt,postPrm);
			} else {
				this.onceGet(jsonIdArray,noInterrupt,postPrm);
			}
		},
		eachGet : function(jsonIdArray,noInterrupt,postPrm){ // localのファイルを取得する
			pageJsonObj = null;
			pageJsonObj = {};

			fetchCount = 0;
			xhrArray = [];

			purePageJsons = null;
			purePageJsons = [];

			if(
				window.isLocal && 
				postPrm != 'noConnect'
			) {
				fetchJson({id:common.location},"/magica/json/page/" + common.location + ".json");
			}

			var i = 0;
			resObj = {};
			fetchCountMax = jsonIdArray.length;
			if(postPrm == 'noConnect'){
				//保存済みのデータを入れておく
				while(i < jsonIdArray.length) {
					console.log('jsonIdArray[i].id', jsonIdArray[i].id);
					pageJsonObj[jsonIdArray[i].id] = common.storage[jsonIdArray[i].id].toJSON();
					i=(i+1)|0;
				}
				//通信しないで実行する
				$(that).trigger("complete",resObj);
				return;
			};
			while(i < fetchCountMax) {
				var saveType = common.storageType[jsonIdArray[i].id] || null;
				var fetchUrl = common.linkList[jsonIdArray[i].id];
				var hasModel = common.hasModel(jsonIdArray[i].id);
				//保存されていない もしくは リロード希望
				if(!hasModel || jsonIdArray[i].refresh){
					switch(saveType){
						case "model":       fetchModel(jsonIdArray[i],fetchUrl);      break;
						case "collection":  fetchCollection(jsonIdArray[i],fetchUrl); break;
						case null:          fetchJson(jsonIdArray[i],fetchUrl);       break;
					}
				//保存済み
				}else{
					pageJsonObj[jsonIdArray[i].id] = common.storage[jsonIdArray[i].id].toJSON();
					fetchCompLocal(common.storage[jsonIdArray[i].id].toJSON());
				}
				i=(i+1)|0;
			}
		},
		onceGet: function(jsonIdArray,noInterrupt,postPrm) {
			var xhrType = (postPrm) ? "POST" : "GET";
			pageJsonObj = null;
			pageJsonObj = {};

			purePageJsons = null;
			purePageJsons = [];

			var noInterruptFlag = (noInterrupt) ? true : false;
			var getPrm = "";
			var postValuePrm = "";

			var i = 0;
			var cnt = 0;
			while(i < jsonIdArray.length) {
				var saveType = common.storageType[jsonIdArray[i].id] || null;

				// 保持していたらパラメータから除外する（保持していても更新パラメータがついていたら含める）
				// idをパラメータ用に,区切りでまとめる
				var hasModel = common.hasModel(jsonIdArray[i].id);
				var refreshFlag = jsonIdArray[i].refresh;

				// 保持していない or 保持しているけどrefreshの必要がある場合
				if(!hasModel || hasModel && refreshFlag) {

					// collectionを更新する場合、一旦resetしてひも付けているViewにイベント発火させる
					if(saveType === "collection" && hasModel) {
						common.storage[jsonIdArray[i].id].reset();
					}
					delete common.storage[jsonIdArray[i].id];

					if(xhrType == "GET") {
						getPrm += (cnt === 0) ? "value=" + jsonIdArray[i].id : "," + jsonIdArray[i].id;
					} else if(xhrType == "POST") {
						postValuePrm += (cnt === 0) ? "" + jsonIdArray[i].id : "," + jsonIdArray[i].id;
					}

					// console.log("getPrm:",getPrm);
					cnt=(cnt+1)|0;
				} else {
					pageJsonObj[jsonIdArray[i].id] = common.storage[jsonIdArray[i].id].toJSON();
				}

				i=(i+1)|0;
			}

			var dataPrm;
			if(xhrType == "GET") {
				if(getPrm.indexOf("value=") != -1) {
					getPrm += "&timeStamp=" + new Date().getTime();
				} else {
					getPrm += "timeStamp=" + new Date().getTime();
				}
				dataPrm = getPrm;
			} else if(xhrType == "POST") {
				if(postValuePrm !== "") {
					postPrm.value = postValuePrm;
				}
				dataPrm = JSON.stringify(postPrm);
			}
			var ajaxPrm = {
				url:      window.serverUrl + "/magica/api/page/" + common.location,
				type:     xhrType,
				dataType: "json",
				data:     dataPrm
			};

			if(xhrType == "POST") {
				ajaxPrm.contentType = 'application/JSON';
			}

			// 通信処理
			ajaxPrm.error = function(res) {
				var x = this;
				accessBusyCallback(x,res);
			};
			ajaxPrm.success = function(res) {
				//console.log("pageAccess:success:",res);
				pageAccessCallback(res,noInterruptFlag);
			};
			if(postPrm == 'noConnect'){
				//通信しないで実行する
				pageAccessCallback({
					dummy: ""
				},noInterruptFlag);
			}else{
				var ajax = $.ajax(ajaxPrm);
			};
		},
		getPageJson : function(){
			return pageJsonObj;
		},
		getPagePureJsons : function(){
			return purePageJsons;
		},
		ApiPageAccessCallback : function(res,noInterruptFlag){
			pageJsonObj = null;
			pageJsonObj = {};
			purePageJsons = null;
			purePageJsons = [];
			return pageAccessCallback(res,noInterruptFlag);
		},
	};

	// ------------------------------------------------------------------------.

	function apiAccessCallback(res,callback) {
		if(res.resultCode !== "error") {
			if(callback) callback(res);
		}
		common.loading.hide();
	}

	function pageAccessCallback(res,noInterruptFlag) {
		var modelCnt = 0;
		_.each(res,function(model,key,res){
			var saveType = common.storageType[key] || null;

			var _model;
			purePageJsons.push(key);
			pageJsonObj[key] = res[key];

			switch(saveType){
				case "model":
					_model = {};
					var Model = Backbone.Model.extend({
						url: common.linkList[key]
					});

					if(common.hasModel(key)) {
						_model[key] = model;
						common.responseSetStorage(_model);
					} else {
						_model = new Model(model);
						common.setStorage(_model,key);
					}

					break;
				case "collection":
					_model = {};
					var Collection = Backbone.Collection.extend({
						url: common.linkList[key]
					});

					if(common.hasModel(key)) {
						_model[key] = model;
						common.responseSetStorage(_model);
					} else {
						var collection = new Collection(model);
						common.setStorage(collection,key);
					}

					break;
			}

			if(Object.keys(res).length - 1 == modelCnt) {
				if(that.interruptCheck(res,noInterruptFlag)) return;
				fetchComp(res);
			}
			modelCnt = (modelCnt+1) || 0;
		});
	}

	function accessBusyCallback(xhr,res,type) {
		// console.log("xhr",xhr)
		// console.log("res",res)
		// console.log("type",type)
		if(arguments[1].responseJSON) {
			if (arguments[1].responseJSON.resultCode == "maintenance") {
				if(isMaintenance) return;
				isMaintenance = true;

				var spl     = window.app_ver.split(".");
				var g_cwVer = spl.join('') | 0;
				if(g_cwVer < 160){
					oldVersionFunction();
					location.href = "#/Maintenance";
				}else{
					cmd.nativeReload("#/Maintenance");
				}
				return;
			}
		}

		// 通信エラー
		if(arguments[1].status == 0){
			common.tapBlock(false);
			common.loading.hide();

			// アンドロイドのバックキーは使えないように
			common.androidKeyStop = true;

			var callback = function() {
				$("#resultCodeError .decideBtn").on(common.cgti,function(e){
					$("#resultCodeError .decideBtn").off();
					// リロード
					cmd.nativeReload("#/TopPage");

					if(window.isDebug && window.isBrowser){
						location.href = "#/TopPage";
						location.reload();
					}
				});
			};

			new common.PopupClass({
				title:"通信エラー",
				popupId:"resultCodeError",
				content :"通信環境の良い所で再度お試しください。",
				"decideBtnText":"リロード",
				canClose: false
			},null,callback);
			return;
		}


		if(arguments[1].status == 429 || arguments[1].status == 502 || arguments[1].status == 503) {
			cmd.setWebView();
			common.loading.hide();
			common.tapBlock(false);

			callback = function(){
				$("#resultCodeError .decideBtn").on(common.cgti,function(e){
					$("#resultCodeError .decideBtn").off();
					cmd.nativeReload("#/TopPage");

					if(window.isDebug && window.isBrowser){
						location.href = "#/TopPage";
						location.reload();
					}
				});
			};

			// アンドロイドのバックキーは使えないように
			common.androidKeyStop = true;

			new common.PopupClass({
				title:"通信エラー",
				popupId:"resultCodeError",
				content :"現在、アクセスが集中しております。<br>しばらくたってからアクセスをお願いいたします。",
				decideBtnText:"トップページへ",
				canClose: false
			},null,callback);
			return;
		}
	}

	return that;
});
