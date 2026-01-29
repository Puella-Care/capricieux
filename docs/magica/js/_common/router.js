/*global define*/
define([
	"underscore",
	"backbone",
	"backboneCommon",
	"ajaxControl",
	"command",
	"routes",
	"eRoutes",
	"bRoutes"
], function (_,Backbone,common,ajaxControl,cmd,routes,eRoutes,bRoutes){
	'use strict';

	//各シーンのajaxの終了イベント監視
	$(ajaxControl).on("complete",function(e,res){
		// console.log("ajaxComplete")
		common.loading.hide();
		common.imgData = {}; // nativeから取得した画像をメモリから削除

		common.settingThemeInit();

		//前画面がいたら、消す処理
		if(common.prevPageObj){
			//ページ削除に必要なコマンド全部実行
			if(common.prevPageObj.removeCommand){
				common.prevPageObj.removeCommand();
			}

			common.prevPageObj.remove(function(){
				if(common.interrupt) {
					common.interrupt = null;
					setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
					return;
				}
				startCommand();
				common.pageObj.init();
				setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
			});
		}else{
			if(common.interrupt) {
				common.interrupt = null;
				setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
				return;
			}
			startCommand();
			common.pageObj.init();
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
		}
	});

	var startCommand = function() {
		if(common.location !== "TopPage" && common.location !== "NewVersionRecommend") {
			//ページ表示時に必要なコマンド全部実行
			if(common.pageObj.startCommand){
				common.pageObj.startCommand();
			}else{
				//デフォルトの背景とか、デフォルトBGMとか？
				if(common.location !== "QuestResult" && common.location !== "ArenaResult"){
					// クエストリザルトとアリーナリザルトは背景を変更しない。
					cmd.changeBg(common.background);
				}
				cmd.startBgm(common.bgm);
			}
		}
	};

	// 遷移時の表示パターン分岐
	var readyLayer = function() {
		var current = common.location;
		var prev = (common.historyArr[common.historyArr.length - 1]) ? common.historyArr[common.historyArr.length - 1].split("/")[0] : "";

		if(current == prev) {
			prev = (common.locationPrev) ? common.locationPrev : "";
		}

		// Chara関連ページ間の遷移では表示を消さない
		if(current.indexOf("CharaList") !== -1 && prev.indexOf("CharaList") !== -1) {
			return;
		};

		common.ready.show();
	};

	// ページ遷移時はuserCardListExを削除すること
	var userCardExDelete = function() {
		var current = common.location;
		var prev = (common.historyArr[common.historyArr.length - 1]) ? common.historyArr[common.historyArr.length - 1].split("/")[0] : "";

		// Chara関連ページ間の遷移ではカード情報を削除しない
		if(current.indexOf("CharaList") !== -1 && prev.indexOf("CharaList") !== -1) return;

		if(common.hasModel("userCardListEx")) {
			common.storage.userCardListEx.reset();
		}
		delete common.storage.userCardListEx;
	};

	// ページのフェードアウトが終わったらclassをはずす
	$(common.ready.target).on("webkitAnimationEnd",function(e) {
		if(e.originalEvent.animationName == "readyFadeOut") {
			common.ready.target.className = "";
		}
	});

	// ページのフェードインが終わったらタップブロックとスクロールリフレッシュを実行
	$(common.ready.content).on("webkitAnimationEnd",function(e) {
		if(e.originalEvent.animationName == "readyFadeIn") {
			common.tapBlock(false);
			// ページ表示のアニメーションとスクロールのアニメーションがぶつかってバグるので、
			// アニメーションが終わったタイミングでリフレッシュをかける
			common.scrollRefresh(null,null,null,true);
		}
	});

	// android戻るキー処理
	$("#androidBackKey").on("androidBackKey",function(e,res){
		if(common.isTouching()) return;
		if(common.androidKeyStop) return;
		if(common.androidKeyForceStop) return;
		if(common.tutorialId) return;
		common.androidKeyForceStop = true;// 端末依存対策 2回走る場合がある

		// スクロールが残ってると動かないのでリセットする
		common.androidResetHandler();

		// ポップアップがあるときは閉じるだけ
		if (common.g_popup_instance) {
			if(!common.g_popup_instance.popupModel.toJSON().canClose){
				setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
				return;
			}
			cmd.startSe(1003);
			common.g_popup_instance.popupView.close();
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
			return;
		}else if (common.detailPopup){
			common.detailPopup.removeHandler();
			common.detailPopup = null;
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
			return;
		}else if(common.detailView) {
			// 魔法少女詳細の削除
			cmd.startSe(1003);
			common.detailView.detailClose();
			common.detailView = null;
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
			return;
		}else if(common.arenaConfirmView){
			// アリーナ対戦相手詳細の削除
			common.arenaConfirmView.removeView();
			common.arenaConfirmView = null;
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
			return;
		}else if(location.hash !== "" &&
				 location.hash !== "#/MyPage" &&
				 location.hash !== "#/TopPage" &&
				 location.hash !== "#/NewVersionRecommend"){
			// Mypageやトップページ以外かつサイドメニューが開いていた時
			if(common.doc.getElementById("sideMenu") && common.doc.getElementById("sideMenu").classList.contains("anim")){
				cmd.startSe(1002);
				var menuDOM = common.doc.getElementById("sideMenu");
				common.addClass(menuDOM,"close");
				common.removeClass(menuDOM,"anim");
				common.addClass(common.doc.getElementById("sideMenuBg"),"close");
				common.removeClass(common.doc.getElementById("sideMenuBg"),"anim");
				setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
				return;
			}else{
				cmd.startSe(1003);
				common.backLinkHandler();
				setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止
				return;
			}
		}else if(location.hash === "" ||
				 location.hash === "#/MyPage" ||
				 location.hash === "#/TopPage" ||
				 location.hash === "#/NewVersionRecommend"){
			setTimeout(function(){common.androidKeyForceStop = false;},500);//連打防止

			new common.PopupClass({
				title:"終了確認",
				content:"アプリを終了しますか？",
				closeBtnText:"キャンセル",
				decideBtnText:"終了"
			});

			var decide = common.doc.getElementById("popupArea").getElementsByClassName("decideBtn")[0];

			decide.addEventListener(common.cgti,function(){
				cmd.closeGame();
			});
			return;
		}
	});

	// クエストリタイア時動作
	$('#questRetire').on("questRetire",function(e,res){
		// console.log("retire func:",res);
		common.responseSetStorage(res);

		// 再開データがあった場合はリタイア時に破棄する
		if(common.resumeData) common.resumeData = null;

		// アリーナだった場合は遷移させる
		if(common.arenaBattleType){
			var arenaTypes = (common.arenaBattleType === "FREE_RANK") ? "ArenaFreeRank" : "ArenaRanking";
			common.historyArr = ["MyPage","ArenaTop",arenaTypes];
			common.arenaBattleType = null;
			common.battleEnemy = null;

		}else{
			// アリーナじゃないとき
			// 保存してるレスポンスデータはリタイア時には削除する
			common.responseSetStorage(common.questNativeResponse);
			if (common.questBattleModel && !common.questBattleModel.raidId && common.questBattleModel.questType !== "GROUPBATTLE") {
				common.questNativeResponse = null;
			}
			common.questHelperId = null;
			common.historyArr = ["MyPage"];
		}

		common.strSupportPickUpUserIds = "";
		common.supportUserList         = null;

		// ap回復のプッシュ通知が設定されていたら回復までの残り時間を送る
		if(common.noticeAp !== undefined && common.noticeAp === true){
			if(!common.storage.userStatusList) return;
			var nowAp = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
			var maxAp = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON();
			var remainTime = common.getApRemainTime(nowAp,maxAp,ajaxControl.getPageJson().currentTime);
			cmd.noticeApFullSet(remainTime);

		}else if(common.noticeAp === undefined){
			$('#configCallback').on('configCallback',function(e,res) {
				$('#configCallback').off();
				common.noticeAp = (res.ap === 1) ? true : false;
				if(common.noticeAp){
					var nowAp = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
					var maxAp = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON();
					var remainTime = common.getApRemainTime(nowAp,maxAp,ajaxControl.getPageJson().currentTime);
					cmd.noticeApFullSet(remainTime);
				}
			});
			cmd.noticeApConfig("configCallback");
		}

		cmd.setWebView(true);
	});

	// サスペンド復帰時
	// "YYYY/mm/dd HH:ii:ss"でレスポンスが帰ってくる
	$('#suspendAwake').on("suspendAwake",function(e,res){
		if(common.globalMenuView) common.globalMenuView.awakeSuspend(res);
	});

	var historyCheck = function(prm) {
		var historyFlag = true;
		var notPushArr = [
			"Animation",
			"Result",
			"Stub",
			"LoginBonus",
			"QuestBackground",
			"MemoriaEquip",
			"MemoriaSetEquip",
			"EventTrainingCharaSelect",
			"CharaEnhancementTree"
		];

		_.each(notPushArr, function(model) {
			if(prm[0].indexOf(model) !== -1) {
				historyFlag = false;
			}
		});

		return historyFlag;
	};

	var AppRouter = Backbone.Router.extend({
		routes: function() {
			var rObj = {};
			var _routes = {
				"" : "TopPage"
			};

			Object.assign(rObj, routes, eRoutes);
			if(window.isDebug) {
				Object.assign(rObj, bRoutes);
			}

			_.each(rObj, function (val, key) {
				var url      = val.url;
				var pageInit = val.pageInit;

				if(!_routes[url]) {
					_routes[url] = key;
					this.setRouteCallback(key, pageInit);
				}
			}, this);

			return _routes;
		},
		setRouteCallback : function _setRouteCallback(moduleName, PageInit) {
			this.on('route:' + moduleName, function () {
				PageInit.apply(this,arguments);
			});
		},
		before: function (prm) {
			// 遷移中はアンドロイドのバックキーを効かないようにする
			common.androidKeyForceStop = true;

			common.location = (prm === "") ? "TopPage" : prm.split("/")[0];

			// 暗転の確認
			readyLayer();

			// 詳細ポップアップ系あったらここで止めておく
			if(common.popupTimerObj) clearTimeout(common.popupTimerObj);

			// 魔法少女詳細の削除
			if(common.detailView) {
				common.detailView.detailClose();
			}

			// userCardListExを削除
			userCardExDelete();

			var historyFlag = historyCheck(arguments);

			// どんな遷移でもマイページを経由した場合は一度遷移を切る
			if(prm === "MyPage"){
				common.historyArr = ["MyPage"];
			}else{
				if(historyFlag){
					var arr = location.hash.split('/');

					//履歴に現在のページがあったら更新のため古いものを削除する※実験(ヴァルコネ式)
					if(arr.length <= 2){
						if(common.historyArr.indexOf(arguments[0]) > -1) {
							common.historyArr.splice(common.historyArr.indexOf(arguments[0]),1);
						}
					} else {
						// パラメータがある場合、それも含めて削除
						var searchVal = "";
						_.each(arr,function(value) {
							if(value !== "#") {
								if(searchVal == "") {
									searchVal += value;
								} else {
									searchVal += '/' + value;
								}
							}
						});
						if(common.historyArr.indexOf(searchVal) > -1) {
							common.historyArr.splice(common.historyArr.indexOf(searchVal),1);
						}
					}

					//最後に記憶されてるのが同一ページだったら記憶しない
					// console.log('backCheck:push:',common.historyArr[common.historyArr.length-1],location.hash.split("/")[1]);
					if(common.historyArr[common.historyArr.length-1] !== location.hash.split("/")[1]) {
						if(arr.length <= 2) {
							common.historyArr.push(arguments[0]);
						} else {
							// パラメータがある場合、それも含めて保存
							var setValue = "";
							_.each(arr,function(value) {
								if(value !== "#") {
									if(setValue == "") {
										setValue += value;
									} else {
										setValue += '/' + value;
									}
								}
							});
							common.historyArr.push(setValue);
						}
					}
				}
			}

			// 編集中のデッキを削除
			if(common.location !== 'DeckFormation' &&
			   common.location !== 'EventAccomplishDeck' &&
			   common.location !== 'EventAccomplishRecovery' &&
			   common.location !== 'MemoriaList' &&
			   common.location !== 'MemoriaEquip' &&
			   common.location !== 'MemoriaSetEquip' ) {
				common.holdDeck = null;
			}

			// 選択中の魔法少女のIDを削除
			var charaListSeleftIdResetArr = [
				"CharaListTop",
				"CharaListCustomize",
				"CharaListComposeMagia",
				"MemoriaTop",
				"GachaTop",
				"MissionTop",
				"ShopTop",
				"FormationTop",
				"MainQuest",
				"ArenaTop",
				"EventDungeonMap"
			];
			var charaListSeleftIdResetFlag = false;
			_.each(charaListSeleftIdResetArr,function(key) {
				if(common.location == key) {
					charaListSeleftIdResetFlag = true;
				}
			});
			if(charaListSeleftIdResetFlag) {
				common.charaListCustomizeSelectId = null;
				common.charaListComposeMagiaSelectId = null;

				// add: キャラクエスト関連も削除
				common.charaQuestBeforeType    = null;
				common.charaQuestBeforeCharaId = null;
			}


			// ポップアップあったら閉じる
			if(common.g_popup_instance) {
				common.g_popup_instance.remove();
			}
			if(common.detailPopup) {
				common.detailPopup.removeHandler();
			}

			// ネイティブから戻り時に問題発生するので必ず1度切る
			$('#commandDiv').off();

			// iScrollが設定されている場合はすべて破棄する
			if(common.myScroll){
				common.scrollBarControl("destroy");
			}
			//自作スクロールも同様
			if(common.scrollArr || common.scrollArrX){
				common.scrollDestroy();
				common.forceScrollFlag = false;
			}

			if(common.pageObj) common.prevPageObj = common.pageObj;
		}
	});

	return AppRouter;
});
