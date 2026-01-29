define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//"text!template/top/TopPage.html",
	//"text!css/top/Top.css",
	//'js/top/RefundPoup',
	//'text!../../../../../localUserData.json', //テストデータ
	//'text!template/announce/tempTakeover.html',
	//'text!template/announce/tempNotice01.html',
	//'text!template/announce/tempNotice02.html',
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	cmd,
	//pageTemp,
	//css,
	//RefundPoup,
	//localUserData, //テストデータ
	//tempTakeover,
	//tempNotice01,
	//tempNotice02
) {
	'use strict';

	var pageView;
	var pageJson;
	var cacheClearFlg = false;
	var gameUserCreateFlag = false;
	var _userData;
	common.displayedTop = false; //トップを一度でも起動したかどうか

	var preInit = function() { // gameUserがあったときに実行される
		//なぜかネイティブでエラーになるのでコメントアウトしておく
		//noticeRegist();
		
		// PUSH通知系はすべて起動しない
		// PUSH通知初期値の入力 -------------------------------.
		// 曜日クエストなくなったので全部オフに
		//var weekArr = '["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]';
		//cmd.noticeOffWeekly(weekArr);
		var checkQuestResumeFunc = function(){
			// AP回復PUSH通知のフラグを取得(ここで取っておかないとクエスト再開時に登録できない)
			//$('#configCallback').on('configCallback',function(e,res) {
			//	$('#configCallback').off();
			//	common.noticeAp = (res.ap === 1) ? true : false;
			//});
			//cmd.noticeApConfig("configCallback");
			if(common.location !== "TopPage") {
				cmd.setWebView();
				return;
			}
			$('#commandDiv').on('saveDataCallback',function(e,res) { // クエスト中断データ確認が終わったら
				$('#commandDiv').off();
				// console.log("中断データ: ",res);
				//if(res) {
				//	common.resumeData = res;
				//	common.responseSetStorage(res);
				//	beforeQuestDataCreate(res);
				//	common.questHelperId = res.userQuestBattleResultList[0].helpUserId;
				//	if(res.userQuestBattleResultList[0].questBattle.questBattleType && res.userQuestBattleResultList[0].questBattle.questBattleType == "HARD") {
				//		common.mainQuestMode = "HARD";
				//	}
				//	location.href = "#/QuestBackground";
				//} else {
				//	$('#commandDiv').on('nativeCallback',function(e,res) { // Topの描画処理が終わったら
				//		$('#commandDiv').off();
				//		init();
				//		cmd.noticeRegist();
				//	});
				//	cmd.startTop();
				//}
				if(!common.displayedTop){ //初回起動のみ
					//中断データがあってもクエストは再開しない
					$('#commandDiv').on('nativeCallback',function(e,res) { // Topの描画処理が終わったら
						$('#commandDiv').off();
						init();
						//cmd.noticeRegist();
					});
					cmd.startTop();
				}else{
					init();
				};
			});
			cmd.checkQuestStored();
		};

		var startFunc = function(){ // コールバックの設定
			$('#commandDiv').on('nativeCallback',function(e,res) { // movieのダウンロードが終わったら
				$('#commandDiv').off();
				common.nativeDownload = false;
				checkQuestResumeFunc();
			});
			if(common.displayedTop){ //初回起動ではなかったら
				checkQuestResumeFunc();
			};
		};
		common.nativeDownload = true;

		// VP9デバッグ（1.6.3かつテスト環境時のみ）
		var spl     = window.app_ver.split(".");
		var g_cwVer = spl.join('') | 0;
		if(g_cwVer > 162){
			if(!common.displayedTop){ //初回起動のみ
				var movieConfig = 0;
				$('#configCallback').on('configCallback',function(e,res) {
					$('#configCallback').off();
					common.nativeDownload = false;
					checkQuestResumeFunc();
					return;
					//以下リソースがすべて中に入る予定なので実行しない
					//入り切らなかったらダウンロードする
					movieConfig = (res.movie) ? res.movie : 0;
					$('#commandDiv').on('nativeCallback',function(e,res) { // commonのダウンロードが終わったら
						$('#commandDiv').off();
						if(movieConfig !== 0){ // ムービーダウンロードあったら
							startFunc(); // コールバックの設定
							var dlObj = {};
								dlObj.isVisibleCancel = true;
								dlObj.description     = true;
								dlObj.note            = true;
							cmd.downloadFile("movie",dlObj); // ダウンロードチェック
						}else{
							// ムービーダウンロードなかったら
							common.nativeDownload = false;
							checkQuestResumeFunc();
						}
					});
					//cmd.downloadFile("common"); // ダウンロードチェック
					//cmd.awakePurchase(); // 課金再開処理
				});
				cmd.getDownloadConfig("configCallback");
			}else{
				startFunc();
			};
		}else{
			// 既存処理
			checkQuestResumeFunc();
			//startFunc();
			//if(!common.displayedTop){ //初回起動のみ
			//	cmd.downloadFile("common"); // ダウンロードチェック
			//	cmd.awakePurchase(); // 課金再開処理
			//};
		}
	};

	var init = function() {
		pageJson = ajaxControl.getPageJson();
		//common.setStyle(css);
		//強制タップブロック解除
		common.forceTapBlock({
			isBlock: false,
		});
		var _dispPage = function(){
			//背景強制変更
			cmd.endTop();
			cmd.changeBg('web_common.ExportJson');
			// webView起動
			cmd.setWebView();
			pageView = new PageView();
			if(common.globalMenuView){
				common.globalMenuView.removeView();
			}
			//初回起動済みフラグを立てる
			common.displayedTop = true;
		};
		//アカウントが存在しなかったら自動的にユーザー作成
		//引き継ぎ用のユーザー
		if(!_.has(pageJson.user, "id")) {
			var _callback = function(res) {
				common.responseSetStorage(res);
				// console.log("createUser:",res);
				// PNoteの初期値は全て0
				var noticePrm = {
					'tag1' : 0,//user.purchaseTag
					'tag2' : 0,//gameUser.levelTag
					'tag3' : 0 //gameUser.progressTag
				};
				//cmd.noticeTurnOn(noticePrm);
				//ローカルストレージクリアの場所変更
				localStorage.clear();
				$('#commandDiv').on('nativeCallback',function(e) {
					$('#commandDiv').off();
					_dispPage();
				});
				cmd.configDataInitilize(); //ネイティブの設定を初期化
				if (window.isBrowser) nativeCallback();
				// ------------------------------------------------------------.
			};
			ajaxControl.ajaxPost(common.linkList.createUser,null,_callback);
		}else{
			_dispPage();
		}
	};

	// --------------------------------------------------------------------.
	// pageView
	// --------------------------------------------------------------------.
	var PageView = Backbone.View.extend({
		events : function(){
			var evtObj = {};
			evtObj[common.cgti + " #transferBtn"] = this.transferPop;
			evtObj[common.cgti + " #CharaListTopBtn"] = this.tapCharaListTopBtn;
			evtObj[common.cgti + " #ArchiveBtn"] = this.tapArchiveBtn;
			evtObj[common.cgti + " #TakeoverBtn"] = this.tapTakeoverBtn;
			evtObj[common.cgti + " #RefundBtn"] = this.tapRefundBtn;
			evtObj[common.cgti + " .noticeText"] = this.tapNoticeText;
			return evtObj;
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById("tempTopPage").innerText
			);
			pageJson.isServerActive = checkServerActive();
			this.createDom();
		},
		render : function() {
			if(window.isDebug) {
				var eventMaster = _.findWhere(pageJson.eventList,{"eventType":"AJ2018"});
				if(eventMaster) {
					pageJson.aj2018 = true;
				}
			}
			this.$el.html(this.template({model:pageJson}));
			return this;
		},
		createDom : function(){
			common.content.append(this.render().el);
			common.ready.hide();
		},
		tapCharaListTopBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/CharaListTop';
		},
		tapArchiveBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/CollectionTop';
		},
		tapTakeoverBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			common.targetAnnounceOpen({
				announceData: {
					subject: '『魔法少女まどか☆マギカMagia Exedra』連携コードのご案内',
					startAt: '2024-7-31 00:00:00',
					text: common.doc.getElementById("tempAnnounceTakeover").innerText,
				},
				dispCallback: function(){
					//連携コード挿入
					//一応エラー出ないようにチェックしておく
					var __code = '';
					if(
						pageJson.user && 
						pageJson.user.personalId
					){
						__code = pageJson.user.personalId;
						$('.codeSec').removeClass('noDisp');
						$('#takeOverCode').html(__code);
						// スクローラーをリフレッシュする
						setTimeout(function() {
							common.scrollRefresh("scrollTextWrap","newsField",true);
						}, 50);
					};
				},
			});
		},
		tapNoticeText : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			//お知らせ内容取得
			var __tempList = {
				Notice01: common.doc.getElementById("tempAnnounceNotice01").innerText,
				Notice02: common.doc.getElementById("tempAnnounceNotice02").innerText,
			}
			var _temp = (function(){
				return __tempList[e.currentTarget.dataset.id];
			})();
			var _title = $(e.currentTarget).text();
			common.targetAnnounceOpen({
				announceData: {
					subject: _title,
					startAt: '2024-7-31 00:00:00',
					text: _temp,
				},
			});
		},
		tapRefundBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			//何もしない
		},
		transferPop : function(e) {
			if(e){
				e.preventDefault();
			};
			if(common.isScrolled()) return;
			//何もしない
		},
	});

	//サーバー通信期間かどうか返す
	//ローカル用なので常に通信できない
	var checkServerActive = function() {
		var _isServerActive = false;
		return _isServerActive;
	};

	//ネイティブにユーザーデータを返す
	//持っていなかったらfalse
	var checkDownloadedUserData = function(_args) {
		var _callback = _args.callback;
		var __userData = false;
		$('#commandDiv').on('nativeCallback',function(e,res) {
			$('#commandDiv').off();
			__userData = res;
			_callback(__userData);
		});
		//ブラウザテスト用
		//if (window.isBrowser) nativeCallback(JSON.parse(localUserData));
		if (window.isBrowser) nativeCallback('');
		//ユーザーデータ確認用ネイティブコマンド
		cmd.getUserJson();
	};

	return {
		needModelIdObj : [
			{id:"user"},
			{id:"gameUser"},
			{id:"userItemList"},
			{id:"userStatusList"},
			{id:"userCharaList"},
			{id:"userCardList"},
			{id:"pieceList"},
			{id:"userPieceList"},
			{id:"userPieceSetList"},
			{id:"userPieceArchiveList"},
			{id:"userDeckList"},
			{id:"userLive2dList"},
			{id:"userDoppelList"},
			{id:"userCharaEnhancementCellList"},
		],
		fetch : function(){
			var that = this;
			if(!common.displayedTop){
				//WebViewの初期化は初回のみ
				cmd.setWebView(false);
			};
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
			cmd.popEventStoryRaid();
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
			cmd.popEmotionBoard();
			cmd.deletePuellaHistoriaObject();
			cmd.deleteScene0StorySelectObject();
			cmd.deleteScene0StoryListObject();

			var __callback = function(__userData){
				//ユーザーデータ格納
				_userData = __userData;
				//サーバー通信期間が終了したとき
				console.log('サーバー通信終了');
				//ネイティブにデータを持っているか確認する
				if(_userData){
					//ユーザーデータを持っていたらそれを使って描画する
					console.log('ユーザーデータ持っている');
					//console.log('_userData', _userData);
					ajaxControl.ApiPageAccessCallback(
						_userData
					);
				}else{
					//ユーザーデータを持っていなかったらダミーデータでトップページだけを描画する
					console.log('ユーザーデータ持ってない');
					ajaxControl.ApiPageAccessCallback(
						{
							user: {
								id: 12345,
							},
							gameUser: {
								userId: 12345,
							},
							noUserData: true,
						}
					);
				};
			};
			if(
				common.hasModel('gameUser')
			){ //この段階でgameUser持ってたらデータを取得しない
				ajaxControl.pageModelGet(
					this.needModelIdObj,
					null,
					'noConnect'
				);
			}else{
				//ここで日付とネイティブにデータが有るかによって分岐する
				//ネイティブにユーザーデータを持っているか確認する
				checkDownloadedUserData({
					callback: __callback,
				});
			};
		},
		init : function() {
			pageJson = ajaxControl.getPageJson();
			//gameUserがある前提
			//ユーザーidをネイティブに送る
			if((typeof pageJson.gameUser !== "undefined")) {
				cmd.setUserId(pageJson.gameUser.userId);
			};
			var checkArr = window.deleteAssetArr();
			// ファイル削除確認が増えたので起動用関数にまとめる
			var startUp = function(){
				if((typeof pageJson.gameUser !== "undefined")) {// gameUserある
					preInit();
				} else {
					$('#commandDiv').on('nativeCallback',function(e,res) { // Topの描画処理が終わったら
						$('#commandDiv').off();
						init();
						//cmd.noticeRegist();
					});
					//init();//そのまま起動
					cmd.startTop();
					//cmd.changeBg("web_black.jpg");
				}
			};
			// ネイティブリソース削除確認
			var checkLoop = function(){
					$('#commandDiv').on('nativeCallback',function(e,res){
						$('#commandDiv').off();
						// ファイルが存在しなければそのまま起動
						if(!res.isExist){
							// 配列の１つ目を削除
							checkArr.shift();
							// 削除用配列が１個でもあれば再度削除確認処理に入れる
							if(checkArr.length > 0){
								checkLoop();
							}else{
								startUp();
							}
						} else {
							// 削除対象が存在すれ場合はjsonを取得して削除コマンドを叩く
							$('#commandDiv').on('nativeCallback',function(e,res){
								$('#commandDiv').off();
								// 配列の１つ目を削除
								checkArr.shift();
								// 削除用配列が１個でもあれば再度削除確認処理に入れる
								if(checkArr.length > 0){
									checkLoop();
								}else{
									startUp();
								}
							});
							var bustTime = ((((new Date()).getTime() / 60000) | 0) * 60000);
							require(['text!'+checkArr[0].jsonFilePath+'?bust='+bustTime],function(deleteJson){
								var json = JSON.parse(deleteJson);
								cmd.removeFile(json.list);
							});
						}
					});
					// ファイル存在確認コマンド
					cmd.existFile(checkArr[0].confirmFileNames);
			};
			if(!window.isBrowser){
				// 削除用配列が１個でもあれば削除確認処理に入れる
				if(
					checkArr.length > 0 && 
					!common.displayedTop
				){
					checkLoop();
				}else{
					// なければ今まで通りの起動
					startUp();
				}
			}else{
				// ブラウザの場合はそのまま起動
				init();
			}
		},
		remove : function(callback){
			if(pageView) {
				pageView.remove();
			}
			cmd.endTop();
			callback();
		}
	};
});
