define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/base/GlobalMenu.html',
	'js/view/user/APPopup',
], function (_,Backbone,common,ajaxControl,cmd,pageTemp,APPopup) {
	'use strict';
	var patrolTimer = "";//パトロール用のタイマー

	var UserStatusView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model, "change", this.render);

			this.render();
		},
		render: function() {
			var userStatus = common.storage.userStatusList;
			var userStatusModel = {};
			var MyPageStatusModel = Backbone.Model.extend();

			userStatusModel.ACP =     userStatus.findWhere({"statusId":"ACP"}).toJSON().point || "0";
			userStatusModel.MAX_ACP = userStatus.findWhere({"statusId":"MAX_ACP"}).toJSON().point || "0";

			this.model = new MyPageStatusModel(userStatusModel);

			var _model = this.model.toJSON();

			_.each(_model,function(point,key) {
				var _key = "." + key;
				common.doc.querySelector(_key).textContent = point;
			});

			var domACP = common.doc.querySelector(".ACP");
			common.removeClass(domACP, "limit");
			common.removeClass(domACP, "over");
			if(userStatusModel.ACP >= userStatusModel.MAX_ACP*3){
				common.addClass(domACP, "limit");
			}
			else if(userStatusModel.ACP > userStatusModel.MAX_ACP){
				common.addClass(domACP, "over");
			}
		},
		removeView: function() {
			this.model.clear();
			delete this.model;
			this.off();
			this.remove();
		}
	});

	var purchaseView;
	var PageView = Backbone.View.extend({
		events : function(){
			var evtObj = {};
			evtObj[common.cgti + " #menu"]           = this.menuToggle;
			evtObj[common.cgti + " #ap"]             = this.apPopup;
			evtObj[common.cgti + " #money"]          = this.moneyPopup;
			evtObj[common.cgti + " .backLinkBtn"]    = this.backLinkHandler;
			evtObj[common.cgti + " .helpBtn"]        = this.helpPop;
			evtObj[common.cgti + " .globalBattleBtn"] = this.globalBattleBtn;
			evtObj[common.cgti + " .globalRegularEventBtn"] = this.globalRegularEventBtn;

			evtObj[common.cgti + " .linkBtn.btnOverlay"] = this.locationCheck;

			return evtObj;
		},
		initialize : function(options) {
			this.listenTo(this,"removeView",this.removeView);
			this.listenTo(this,"firstPopup",this.firstPopup);
			this.listenTo(this,"optionSet",this.optionSet);

			this.campaignBadgeView = null;

			this.template = _.template(pageTemp);

			this.createDom(options);
		},
		render : function() {
			this.$el.html(this.template(common.storage));
		},
		createDom :function(options){
			this.render();

			// どこでも監視開始できるように
			common.setTitleCollectionObserved();

			// モデルに変更があった場合更新をかける項目をセット
			this.listenTo(common.storage.userItemList,"change",this.itemChangeHandler);
			this.listenTo(common.storage.userStatusList,"change",this.statusDisplay);
			this.listenTo(common.storage.userDailyChallengeList,"change",this.missionBadgeCnt);
			this.listenTo(common.storage.userTotalChallengeList,"change",this.missionBadgeCnt);
			this.listenTo(common.storage.userLimitedChallengeList,"change",this.missionBadgeCnt);

			// ヘルプがある場合はセットする
			var helpObj = this.helpArraySet(common.location);
			var hideHelp = options ? options.hideHelp : false;
			if(!hideHelp && helpObj.setType !== "noneActive"){
				common.addClass(this.el.getElementsByClassName("helpBtn")[0],"on");
				this.el.getElementsByClassName("helpBtn")[0].dataset.type = helpObj.setType.toString();
				this.el.getElementsByClassName("helpBtn")[0].dataset.title = helpObj.popTitle;
			}

			common.doc.getElementById("globalMenuContainer").appendChild(this.el);

			// AP表示
			this.statusDisplay();

			// 石、無料ガチャバッジの確認
			this.itemChangeHandler();

			// ミッションのバッジの確認
			this.missionBadgeCnt();

			// ページ振り分け処理の確認
			this.pagePerHandler(options);

			// ユーザーランク・EXPゲージの生成
			this.userRankHandler();

			// 恒常イベント（RegularEvent）
			var pageJson = ajaxControl.getPageJson();
			var currentTime = Date.parse(pageJson.currentTime);

			var regularEventMaster = pageJson.regularEventList ? pageJson.regularEventList[0] : null;
			if (regularEventMaster) {
				var regularEventBtnClass = "";
				switch (regularEventMaster.regularEventType) {
					case "GROUPBATTLE":
						regularEventBtnClass = "groupBattle";
						var preliminaryRoundStartAt = Date.parse(regularEventMaster.regularEventGroupBattle.preliminaryRoundStartAt);
						if (currentTime > preliminaryRoundStartAt) {
							// 開催前
							regularEventBtnClass += " open";
						} else {
							regularEventBtnClass += " close";
						}
						break;
					default:
						regularEventBtnClass = regularEventMaster.regularEventType.toLowerCase();
				}

				common.doc.getElementsByClassName("globalRegularEventBtn")[0].className = "globalRegularEventBtn globalBigBtn " + regularEventBtnClass;
			}

			// エイプリルフールキャンペン開催中か判定
			var aprilFoolStartAt = Date.parse("2022/04/01 00:00:00");
			var aprilFoolEndAt = Date.parse("2022/04/01 23:59:59");
			this.isAprilSumoOpen = (currentTime >= aprilFoolStartAt && currentTime <= aprilFoolEndAt);
			var arenaBtn = common.doc.getElementsByClassName("globalBattleBtn")[0];
			if (this.isAprilSumoOpen && !arenaBtn.classList.contains("limited")) {
					common.addClass(arenaBtn, "campaignSumo");
			}

			// 共通処理
			if(!common.thisPlatform){
				common.setPlatForm(ajaxControl.getPageJson());
			}

			// AP自動回復回り
			// すでに設定されている場合、現在APが最大AP以上の場合はなにもしない
			if(common.acpTimeCure){
				clearInterval(common.acpTimeCure);
				common.acpTimeCure = null;
			}
			if(!common.storage.userStatusList) return;
			if(common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON().point >= common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point) return;

			this.autoCureSet();
		},
		userRankHandler : function(){
			// ユーザーランクの数字の画像化
			var gameUser = common.storage.gameUser.toJSON();
			var flgmnt = common.doc.createDocumentFragment();
			var userRank = gameUser.level + "";
			var userRankArr = userRank.split("");
			for(var i=0,leng=userRankArr.length;i<leng;i++){
				var numberNode = common.doc.createElement("img");
				numberNode.src = resDir+"/magica/resource/image_web/common/number/"+userRankArr[i]+".png";
				flgmnt.appendChild(numberNode);
			}
			common.doc.getElementById("exp").getElementsByClassName("userRank")[0].appendChild(flgmnt);
			flgmnt = null;


			// 現在のEXP計算
			var remainExp = gameUser.totalExpForNextLevel ;
			var beforeRemainExp = gameUser.totalExpForCurrentLevel || 0;//debug
			var nowExp = gameUser.exp;
			var expLeft = remainExp - nowExp;
			common.doc.getElementById("exp").getElementsByClassName("pointWrap")[0].textContent = "あと"+expLeft;

			// 現在のEXPゲージ計算
			// (現在の経験値 - 現在のレベルに必要な経験値) / (次のレベルに必要な経験値 - 現在のレベルに必要な経験値)が基本
			var guageLeng = Math.round((nowExp - beforeRemainExp) / (remainExp - beforeRemainExp) * 100) + "%";
			common.doc.getElementById("exp").getElementsByClassName("gaugeInner")[0].style.width = guageLeng;
		},
		autoCureSet : function(option){
			if(!common.storage.userStatusList) return;
			if(!common.storage.userStatusList.findWhere({"statusId":"ACP"}) || !common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"})) return;
			// 現在時刻を取得できないときは回復しない
			if(!ajaxControl.getPageJson().currentTime) return;
			var apModel = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
			this.currentTime = (!option) ? Date.parse(ajaxControl.getPageJson().currentTime) / 1000 : option;

			var nextCureTime = Date.parse(apModel.checkedAt) /1000 + apModel.checkPeriod * 60;

			// 初回発火 何らかの理由(サスペンドとか)でステータスが最新でなかったとき用
			var checksTime = nextCureTime - this.currentTime;
			var me = this;
			if(checksTime < -1){
				var changePoint = 0;
				var firstCureApModel = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
				var maxAp  = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point;
				while(checksTime < 0 && changePoint + apModel.point < maxAp){
					changePoint++;
					nextCureTime = nextCureTime + firstCureApModel.checkPeriod * 60;
					checksTime = nextCureTime - me.currentTime;
				}
				// 情報のセットしなおし
				// ストレージに保存するために時間の形式を整える
				var u2s = new Date((nextCureTime - apModel.checkPeriod * 60) * 1000),
					nextYear  = u2s.getFullYear(),
					nextMonth = (u2s.getMonth() < 10) ? "0" + (u2s.getMonth() + 1) : (u2s.getMonth() + 1),
					nextDay   = (u2s.getDate() < 10)   ? "0" + u2s.getDate() : u2s.getDate(),
					nextHour  = (u2s.getHours() < 10) ? "0" + u2s.getHours() : u2s.getHours(),
					nextMin   = (u2s.getMinutes() < 10) ? "0" + u2s.getMinutes() : u2s.getMinutes(),
					nextSec   = (u2s.getSeconds() < 10) ? "0" + u2s.getSeconds() : u2s.getSeconds();
				var nextPeriod = nextYear + "/" + nextMonth + "/" + nextDay + " " + nextHour + ":" + nextMin + ":" + nextSec;

				var setAP = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
				setAP.checkedAt = nextPeriod;
				setAP.point = changePoint + apModel.point;

				var model = common.storage.userStatusList.findWhere({"statusId":"ACP"});
				model.clear({silent:true});
				model.set(setAP);

				apModel = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
			}

			// 上記計算で最大まで回復していたらここで終了する
			if(apModel.point >= common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point) return;

			// ****************************************************************************//
			// クエスト行く前などのWebが手動でなくなるときにはclearInterval(common.acpTimeCure)で止めてください
			// （再開はGlobalMenuのファンクション呼ばれなおすと自動で始まります
			//
			// 秒数経過をインターバルの稼働回数に任せてたけどやめる(所詮jsなんで端末スペックとかでずれる)
			// サスペンド復帰時はサーバにアクセスし直して時間取得し直し＆AP計算し直してるので、秒数に関しては端末時間をとって計算するように変更する
			// インターバルをセットする前に必ず開始の端末時間を取得するようにする。
			// toDo:正しく動けばBPにも追加する
			//****************************************************************************//

			common.cureSpTimeCount = 0;
			common.cureSpTimeCountStartAt = Date.parse(new Date());

			common.acpTimeCure = setInterval(function(){
				// userStatusListをリフレッシュするタイミングで走るとエラーが起きるので一度止める（その後またセットされる)
				// 処理はMAXまで回復した時と同じもの。
				if(!common.storage.userStatusList){
					clearInterval(common.acpTimeCure);
					// AP回復ポップアップがあった場合
					if(common.doc.getElementById("apPointWrap")){
						APPopup.apCureEvents();
					}
					common.cureSpTimeCount = 0;
					me.currentTime = null;
					nextCureTime = null;
					cureApModel = null;
					return;
				}

				// 必ず整数化する
				common.cureSpTimeCount = (Math.floor((Date.parse(new Date()) - common.cureSpTimeCountStartAt) / 1000) | 0);
				// console.log("common.cureSpTimeCount:",common.cureSpTimeCount);
				if(!common.storage.userStatusList.findWhere({"statusId":"ACP"}) || !common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"})) return;
				var cureApModel = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
				var maxApModel = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON();
				//回復薬などで回復した場合に備え、インターバル解除のチェックは最初に行う
				if(cureApModel.point < maxApModel.point){

					//AP回復ポップアップが開いている場合はタイマー表示を動かす
					if(common.doc.getElementById("apPointWrap")){
						var dispTime = nextCureTime - me.currentTime - common.cureSpTimeCount;
						var dispTimeFull = dispTime + (5 * 60 * (maxApModel.point - cureApModel.point - 1));

						var m = dispTime / 60 | 0;
						var s = dispTime - m * 60 | 0;

						var fullH = dispTimeFull / 60 / 60 | 0;
						var fullM = dispTimeFull / 60 - fullH * 60 | 0;
						var fullS = dispTimeFull - fullM * 60 - fullH * 60 * 60 | 0;

						common.doc.getElementById("apFullTime").textContent = m+":"+("0"+s).slice(-2);
						common.doc.getElementById("apFullTime2").textContent = (fullH > 0) ? fullH + ":" + ("0"+fullM).slice(-2) + ":" + ("0"+fullS).slice(-2) : fullM + ":" + ("0"+fullS).slice(-2)
						;
					}
					if(me.currentTime + common.cureSpTimeCount < nextCureTime) return;

					//次の更新時間を取得する
					me.currentTime  = nextCureTime;
					nextCureTime = nextCureTime + cureApModel.checkPeriod * 60;
					// common.cureSpTimeCount = 0;
					common.cureSpTimeCountStartAt = Date.parse(new Date());

					// ストレージに保存するために時間の形式を整える
					var u2s = new Date((me.currentTime) * 1000),
						nextYear  = u2s.getFullYear(),
						nextMonth = (u2s.getMonth() < 10) ? "0" + (u2s.getMonth() + 1) : (u2s.getMonth() + 1),
						nextDay   = (u2s.getDate() < 10)   ? "0" + u2s.getDate() : u2s.getDate(),
						nextHour  = (u2s.getHours() < 10) ? "0" + u2s.getHours() : u2s.getHours(),
						nextMin   = (u2s.getMinutes() < 10) ? "0" + u2s.getMinutes() : u2s.getMinutes(),
						nextSec   = (u2s.getSeconds() < 10) ? "0" + u2s.getSeconds() : u2s.getSeconds();
					var nextPeriod = nextYear + "/" + nextMonth + "/" + nextDay + " " + nextHour + ":" + nextMin + ":" + nextSec;

					var setAP = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
					setAP.checkedAt = nextPeriod;
					setAP.point = cureApModel.point + cureApModel.periodicPoint;

					var model = common.storage.userStatusList.findWhere({"statusId":"ACP"});
					model.clear({silent:true});
					model.set(setAP);
				}else{
					// APが上限値もしくはそれ以上の場合はインターバルを解除して保存していた変数は全部消す(メモリリーク対策)
					clearInterval(common.acpTimeCure);
					// AP回復ポップアップがあった場合
					if(common.doc.getElementById("apPointWrap")){
						APPopup.apCureEvents();
					}
					common.cureSpTimeCount = 0;
					me.currentTime = null;
					nextCureTime = null;
					cureApModel = null;
				}
			},1000);
		},
		statusDisplay: function(){ // AP更新
			if(this.userStatusView){
				this.userStatusView.render();
			}else{
				UserStatusView.prototype.parentView = this;
				this.userStatusView = new UserStatusView({
					el: common.doc.getElementById('status')
				});
			}

			// AP回復ポップアップがあった場合
			if(common.doc.getElementById("apPointWrap")){
				APPopup.apCureEvents();
			}
		},
		itemChangeHandler: function(){ // 課金石表示更新
			var userItemList = common.storage.userItemList;
			var presentMoney =  (userItemList.findWhere({"itemId":"PRESENTED_MONEY"})) ? userItemList.findWhere({"itemId":"PRESENTED_MONEY"}).toJSON().quantity : 0;
			var money =  (userItemList.findWhere({"itemId":"MONEY"})) ? userItemList.findWhere({"itemId":"MONEY"}).toJSON().quantity : 0;
			var before = common.doc.querySelector("#money .pointWrap");
			if((before.textContent | 0) !== (presentMoney + money)){
				before.textContent = (presentMoney + money);
			}
			if(!common.storage.userItemList) return;
			if(!ajaxControl.getPageJson().currentTime) return;
			// 無料ガチャ判定（なければ引ける回数)
			var _pageJson = ajaxControl.getPageJson();
			//ガチャバッジ制御
			controlGachaBadge({
				pageJson: _pageJson,
			});
		},
		missionBadgeCnt : function(){
			if(!common.storage.userDailyChallengeList) return;
			if(!common.storage.userTotalChallengeList) return;

			// モデル変更を含むため連続出回らないようにフラグで処理する
			if(this.onceTimeFlg) return;
			this.onceTimeFlg = true;

			// ミッションのバッジ表示
			var missionBadgeCnt = 0;

			// ミッションカウント判定
			var today = (ajaxControl.getPageJson().currentTime) ? ajaxControl.getPageJson().currentTime.substr(0,10) : null;
			common.storage.userDailyChallengeList.each(function(model,index){
				var _model = model.toJSON();
				// 日またぎ用特殊処理
				var limitFlg = false;
				if(!_model.limitAt){
					// モデルに期限がない場合は期限をモデルに持たせる
					model.set({limitAt:today});
				}else{
					// モデルに期限がセットされている場合は、当日中じゃなければフラグを立てる
					if(_model.limitAt !== today) limitFlg = true;
				}

				// フラグが立っていなければカウント処理に入れる
				if(!limitFlg){
					if(!_model.receivedAt || _model.receivedAt.substr(0,10) !== today){
						if(_model.clearedCount >= _model.challenge.count) missionBadgeCnt++;
					}
				}
			});

			common.storage.userTotalChallengeList.each(function(model,index){
				var _model = model.toJSON();
				if(!_model.receivedAt){
					if(_model.clearedCount >= _model.challenge.count) missionBadgeCnt++;
				}
			});

			// イベントミッションあれば
			var todayTimestamp = Date.parse(ajaxControl.getPageJson().currentTime);
			if(!ajaxControl.getPageJson().currentTime) return;
			common.storage.userLimitedChallengeList.each(function(model,index){
				var _model = model.toJSON();
				if(_model.viewType === "PANEL") return;// パネルミッションはカウントしない
				if(_model.viewType === "SUMMER") return;// サマーミッションもカウントしない
				var limitFlg = false;
				// 終了期限判定
				if(!_model.limitAt){
					// モデルに期限がない場合は期限をモデルに持たせる
					model.set({limitAt:Date.parse(_model.endAt)});
				}else{
					// 期限が過ぎている場合はフラグを立てる
					if(_model.limitAt < todayTimestamp) limitFlg = true;
				}

				// フラグが立っていなければカウント処理に入れる
				if(!limitFlg){
					if(!_model.receivedAt){
						if(_model.clearedCount >= _model.challenge.count) missionBadgeCnt++;
					}
				}
			});


			if(missionBadgeCnt > 0){
				common.addClass(common.doc.getElementById("missionBadge"),"on");
				common.doc.getElementById("missionBadge").textContent = missionBadgeCnt;
			}else{
				common.removeClass(common.doc.getElementById("missionBadge"),"on");
			}

			this.onceTimeFlg = false;
		},
		pagePerHandler : function(options){
			var optLeng = 0;
			_.each(options,function() {
				optLeng ++;
			});

			// ページによって変更される処理をここで行う
			if(optLeng > 0) {
				if(options.hideMenu) {
					common.addClass(common.doc.getElementById("menu"),"noneDisp");
				}
				if(options.hideBackLink) {
					common.addClass(common.doc.getElementsByClassName("backLinkBtn")[0],"noneDisp");
				}
				if(options.hideStatus) {
					common.addClass(common.doc.getElementById("status"),"noneDisp");
				}
			} else {
				if(common.location !== "MyPage"){
					// マイページ以外で行われる処理
					common.addClass(common.doc.getElementById("rank"),"noneDisp");
					common.addClass(common.doc.getElementById("etcMenu"),"noneDisp");
				} else {
					// マイページだった場合
					common.addClass(common.doc.getElementById("sideMenuBg"),"noneDisp");
					common.addClass(common.doc.getElementsByClassName("homeBtn")[0],"noneDisp");
					common.addClass(common.doc.getElementsByClassName("backLinkBtn")[0],"noneDisp");
				}
				if(common.location == "DeckFormation" ||
				   common.location == "EventAccomplishDeck") {
					common.addClass(common.doc.getElementById("status"),"noneDisp");
				}
				if(common.location == "MemoriaEquip" ||
				   common.location == "MemoriaSetEquip") {
					common.addClass(common.doc.getElementById("menu"),"noneDisp");
				}
			}
		},
		menuToggle : function(e){
			// ライトメニューの開閉
			if(common.isScrolled()) return;
			e.preventDefault();
			if(common.isDoubleTouch()) return;

			// デッキ編集中だったら
			if(common.location == 'DeckFormation'       && common.holdDeck ||
			   common.location == 'EventAccomplishDeck' && common.holdDeck) {
				common.pageObj.deckChangeConf();
				return;
			}

			var menuDOM = common.doc.getElementById("sideMenu");
			if(menuDOM.classList.contains("anim")) {
				common.addClass(menuDOM,"close");
				common.removeClass(menuDOM,"anim");
				common.addClass(common.doc.getElementById("sideMenuBg"),"close");
				common.removeClass(common.doc.getElementById("sideMenuBg"),"anim");

				// マイページだったら
				if(common.location === "MyPage"){
					common.removeClass(common.doc.getElementById("status"),"myPageShow");
					common.addClass(common.doc.getElementById("status"),"myPageHide");

					if(common.doc.getElementById("mypageBanner")){
						common.addClass(common.doc.getElementById("mypageBanner"),"hide");
					}
					common.pageObj.menuHide();
				}
			} else {
				common.addClass(menuDOM,"anim");
				common.removeClass(menuDOM,"close");
				common.addClass(common.doc.getElementById("sideMenuBg"),"anim");
				common.removeClass(common.doc.getElementById("sideMenuBg"),"close");

				// マイページだったら
				if(common.location === "MyPage"){
					common.removeClass(common.doc.getElementById("status"),"myPageHide");
					common.addClass(common.doc.getElementById("status"),"myPageShow");
					if(common.doc.getElementById("mypageBanner")){
						common.removeClass(common.doc.getElementById("mypageBanner"),"hide");
					}
					common.pageObj.menuShow();
				}
			}
		},
		backLinkHandler : function(e){
			// 戻るボタンを押したときに呼ばれる
			e.preventDefault();
			e.stopPropagation();
			if(common.isScrolled()) return;
			if(common.isDoubleTouch()) return;

			// キャンセル音
			cmd.startSe(1003);

			//data-noLinkがtrueで設定されている場合は一度目はリンクさせない。(戻るボタンに機能置きたい時用)
			if(e.currentTarget.getAttribute("data-noLink") === "true"){
				e.currentTarget.setAttribute("data-noLink","");
				return;
			}

			//遷移
			common.backLinkHandler();
		},
		apPopup: function(e,message,callback){
			// AP回復ポップアップを開く
			if(e){
				e.preventDefault();
				if(common.isScrolled()) return;
				if(common.isDoubleTouch()) return;
			}
			APPopup.instantPopup(message,callback);
		},
		moneyPopup: function(e){
			// 石購入ポップアップを開く
			if(e) e.preventDefault();
			if(common.isScrolled()) return;
			if(common.isDoubleTouch()) return;

			common.tapBlock(true);

			// 既にviewがある場合は一度閉じる
			if(purchaseView) purchaseView.removeView();

			var me = this;
			require(['js/view/purchase/PurchasePopup'],function(PurchasePop) {
				var callback = function(res){
					common.tapBlock(false);
					if(!PurchasePop.prototype.parentView) PurchasePop.prototype.parentView = me;
					purchaseView = new PurchasePop(res);
				};
				if(!window.isLocal){
					ajaxControl.ajaxSimpleGet(common.linkList.moneyShopList,"",callback);
				}else{
					require(["text!/magica/json/money/shop/list.json"],function(res){
						callback(res);
					});
				}
			});
		},
		helpPop : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			common.setHelpPopup(e.currentTarget.dataset.type,e.currentTarget.dataset.title);
		},
		helpArraySet : function(loc){
			// ヘルプボタン（上部に表示される?の処理)
			var setObj = {};
			// 現在の頁に合わせてヘルプを出す内容を変える
			switch(loc){
				case "CharaListTop" :
					setObj.popTitle = "魔法少女について";
					setObj.setType  = ["03","14_02"];
					break;
				case "CharaListCompose" :
				case "CharaListCustomize" :
				case "CharaListComposeMagia" :
				case "CharaListEquip" :
					setObj.popTitle = "魔法少女強化について";
					setObj.setType  = ["04","14_03"];
					break;
				case "CharaEnhancementTree" :
					setObj.popTitle = "精神強化について";
					setObj.setType  = ["04_08","03_13","14_11"];
					break;
				case "CharaListComposeAttribute" :
					setObj.popTitle = "属性強化について";
					setObj.setType  = ["04_08","04_10","14_12"];
				break;
				case "MemoriaTop" :
				case "MemoriaList" :
				case "MemoriaCompose" :
					setObj.popTitle = "メモリアについて";
					setObj.setType  = ["05","14_04"];
					break;
				case "GachaTop" :
					setObj.popTitle = "ガチャについて";
					setObj.setType  = ["11","14_01"];
					break;
				case "MissionTop" :
					setObj.popTitle = "ミッションについて";
					setObj.setType  = ["12"];
					break;
				case "ShopTop" :
					setObj.popTitle = "ショップについて";
					setObj.setType  = ["13"];
					break;
				case "MainQuest" :
					setObj.popTitle = "クエストについて";
					setObj.setType  = ["06","07"];
					break;
				case "CharaQuest":
					setObj.popTitle = "クエストについて";
					setObj.setType  = ["06","07","14_09","14_10"];
					break;
				case "SubQuest"  :
					setObj.popTitle = "クエストについて";
					setObj.setType  = ["06","07","14_08"];
					break;
				case "FormationTop" :
				case "DeckFormation" :
					setObj.popTitle = "チームについて";
					setObj.setType  = ["08","14_06","14_07"];
					break;
				case "ArenaTop" :
				case "ArenaFreeRank" :
				case "ArenaRanking" :
				case "ArenaReward" :
				case "ArenaHistory" :
				case "ArenaSimulate" :
					setObj.popTitle = "ミラーズについて";
					setObj.setType  = ["10","14_05"];
					break;
				case "PresentList" :
				case "PresentHistory" :
					setObj.popTitle = "プレゼントについて";
					setObj.setType  = ["15_01","15_02"];
					break;
				case "ItemListTop" :
					setObj.popTitle = "アイテムについて";
					setObj.setType  = ["04_07"];
					break;
				case "FollowTop" :
					setObj.popTitle = "フォローについて";
					setObj.setType  = ["09"];
					break;
				case "MemoriaSetList" :
					setObj.popTitle = "メモリアセットについて";
					setObj.setType  = ["05_04"];
					break;
				case "StoryCollection" :
					setObj.popTitle = "ストーリーアーカイブについて";
					setObj.setType  = ["06_06","06_07"];
					break;
				case "PatrolTop" :
					setObj.popTitle = "パトロールについて";
					setObj.setType  = ["19"];
					break;
				// case "RegularEventTop" :
				// case "RegularEventGroupBattleTop" :
				// 	setObj.popTitle = "キモチ戦について";
				// 	setObj.setType  = ["16"];
				// 	break;
				default :
					setObj.setType = "noneActive";
					break;
			}

			return setObj;
		},
		getUserStatus: function() {
			return this.userStatusView.model.toJSON();
		},
		optionSet : function(options){
			// 再読み込み
			this.createDom(options);
		},
		globalBattleBtn : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			if (e.currentTarget.classList.contains("limited")) return;

			// エイプリルフールキャンペン開催中
			if (this.isAprilSumoOpen) {
				location.href = "#/CampaignSumoTop";
			} else {
				location.href = "#/ArenaTop";
			}
		},
		globalRegularEventBtn : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;

			var currentTime = Date.parse(pageJson.currentTime);

			var regularEventMaster = pageJson.regularEventList ? pageJson.regularEventList[0] : null;
			if (regularEventMaster) {
				var regularEventBtnClass = "";
				switch (regularEventMaster.regularEventType) {
					case "GROUPBATTLE":
						var preliminaryRoundStartAt = Date.parse(regularEventMaster.regularEventGroupBattle.preliminaryRoundStartAt);
						var preliminaryRoundEndAt = Date.parse(regularEventMaster.regularEventGroupBattle.preliminaryRoundEndAt);
						var finalRoundStartAt = Date.parse(regularEventMaster.regularEventGroupBattle.finalRoundStartAt);
						var finalRoundEndAt = Date.parse(regularEventMaster.regularEventGroupBattle.finalRoundEndAt);
						var finalRoundSummarizedAt = Date.parse(regularEventMaster.regularEventGroupBattle.finalRoundSummarizedAt);
						if (currentTime < finalRoundSummarizedAt && currentTime > finalRoundEndAt) {
							// 後半ー結果集計中
							new common.PopupClass({
								title    : "キモチ戦",
								content: "ただいま集計中です。<br>最終結果は"+common.getTimeText(finalRoundSummarizedAt)+"から確認いただけます。",
								popupType:"typeA",
								popupId: "groupBattlePopup",
								closeBtnText: "OK"
							});
						} else if (currentTime < finalRoundStartAt && currentTime > preliminaryRoundEndAt) {
							// 前半ー後半集計中
							new common.PopupClass({
								title    : "キモチ戦",
								content: "ただいま集計中です。<br>後半戦は"+common.getTimeText(finalRoundStartAt)+"から開始いたします。",
								popupType:"typeA",
								popupId: "groupBattlePopup",
								closeBtnText: "OK"
							});
						} else if (currentTime < preliminaryRoundStartAt) {
							common.announceOpen(regularEventMaster.regularEventId);
						} else {
							location.href = "#/RegularEventGroupBattleTop";
						}
						break;
					case "EXTERMINATION":
						location.href = "#/RegularEventExterminationTop";
						break;
					case "ACCOMPLISH":
						location.href = "#/RegularEventAccomplishTop";
						break;
					default :
				}
			} else {
				// イベントクローズ
				location.href = "#/EventRecord";
			}
		},
		locationCheck : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			if(e.currentTarget.dataset.href === ("#/"+common.location)){
				this.menuToggle(e);
			}

		},
		awakeSuspend : function(time){
			// サスペンド復帰時
			// currentTimeを取り直す
			// 時間を再計算
			// Date.parse(ajaxControl.getPageJson().currentTime) / 1000;
			// time をパースしてthis.autoCureSet(time)でぶん投げる
			var me = this;
			var callback = function(res){
				var val = (!window.isLocal) ? res : JSON.parse(res);
				me.suspendRefresh(val.currentTime);
			};

			//pageの情報を取るためのURLを生成
			// 現在のページアクセスはわりと問題おきるっぽいので、ResumeBackgroundで取得するようにする
			var pageUrl = "/magica/api/page/ResumeBackground?timeStamp=" + new Date().getTime();

			// ローカルチェック用
			if(window.isLocal){
				require(["text!/magica/json/page/ResumeBackground.json"],function(res){
					callback(res);
				});
				return;
			}

			ajaxControl.ajaxSimpleGet(pageUrl,"",callback);
		},
		suspendRefresh : function(newTime){
			var stamp = Date.parse(newTime) / 1000;
			if(common.acpTimeCure){
				clearInterval(common.acpTimeCure);
				this.autoCureSet(stamp);
			}else{
				this.autoCureSet(stamp);
			}

			// console.log("newTime---------",newTime,stamp);

			// アリーナ系ページだった場合はさらにBPもチェック
			switch (common.location) {
				case "EventRaidTop":
				case "ArenaTop":
				case "ArenaFreeRank":
				case "ArenaRanking":
					common.pageObj.awakeSuspend(stamp);
					break;
				case "PatrolTop":
				case "EventAprilFoolTop":
					common.pageObj.awakeSuspend(newTime);
					break;
				default:

			}

			//遠征用
			if(common.location == "PatrolTop") return;
			var pageJson = ajaxControl.getPageJson();
			if(pageJson.userPatrolList && patrolTimer != ""){
				clearInterval(patrolTimer);
				this.addPatrolBadge(newTime);
			}

		},
		addCampaignBanner: function() {
			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;
			this.removeCampaignBanner();
			if(pageJson.campaignList) {
				var campaignData = common.campaignParse(pageJson.campaignList);
				if(campaignData.BOX_GACHA) {
					this.campaignBannerView = new CampaignBannerView({cpData:campaignData});
					this.el.querySelector("#sideBigBtns").appendChild(this.campaignBannerView.render().el);
				}
			}
		},
		addCampaignBadge: function() {
			// console.log("キャンペーン",common.location)
			// マイページからしか呼ばれないと思っている

			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;

			var campaignBadge = {
				"expp"  : false,
				"yell"  : false,
				"expc"  : false,
				"cc"    : false,
				"ep"    : false,
				"freeAtNotClear" : false,
				"arena" : false,
				"dropUp": false
			};

			// キャンペーンバッジ todo: 次回までに方針考えとく
			// ghostDOM対策(すでにviewがある場合は１度消す)
			this.removeCampaignBadge();
			if(pageJson.campaignList) {
				var campaignData = common.campaignParse(pageJson.campaignList);
				// console.log("campaignData:",campaignData)
				if(campaignData.POINT_UP && campaignData.POINT_UP.globalBadge){
					if(campaignData.POINT_UP.EXPP) {
						campaignBadge.expp = true;
					}
					if(campaignData.POINT_UP.YELL) {
						campaignBadge.yell = true;
					}
				}
				if(campaignData.HALF_AP) {
					campaignBadge.halfAp = campaignData.HALF_AP.bgImgPath;
				}

				if(campaignData.ARENA_REWARD_UP) {
					campaignBadge.arena = campaignData.ARENA_REWARD_UP.magnification;
				}

				if(campaignData.QUEST_DROP_FACTOR) {
					campaignBadge.dropUp = campaignData.QUEST_DROP_FACTOR.bgImgPath;
				}

				// console.log(campaignBadge)
				var flgmntNode = null;
				var Model = null;
				if(campaignBadge.expp ||
				   campaignBadge.yell ||
				   campaignBadge.expc ||
				   campaignBadge.cc ||
				   campaignBadge.ep ||
				   campaignBadge.halfAp ||
				   campaignBadge.freeAtNotClear ||
					 campaignBadge.dropUp
				   ) {
					Model = Backbone.Model.extend({});
					// console.log(this.el.querySelector("#CampaignBadgeTemp").textContent)
					CampaignBadgeView.prototype.template = _.template(this.el.querySelector("#CampaignBadgeTemp").textContent);

					flgmntNode = common.doc.createDocumentFragment();

					this.campaignBadgeView = new CampaignBadgeView({model: new Model(campaignBadge)});
					flgmntNode.appendChild(this.campaignBadgeView.render().el);
					this.el.querySelector("#sideBigBtns").appendChild(flgmntNode);
				}

				// ミラーズ未解放の場合は止める
				if(common.storage.gameUser.toJSON().closeFunctions && common.storage.gameUser.toJSON().closeFunctions.indexOf("ARENA") > -1) return;
				if(campaignBadge.arena){
					Model = Backbone.Model.extend({});
					// console.log(this.el.querySelector("#CampaignBadgeTemp").textContent)
					CampaignBadgeView.prototype.template = _.template(this.el.querySelector("#ArenaCampaignBadgeTemp").textContent);

					flgmntNode = common.doc.createDocumentFragment();

					this.arenaCampaignBadgeView = new CampaignBadgeView({model: new Model(campaignBadge)},true);
					flgmntNode.appendChild(this.arenaCampaignBadgeView.render().el);
					this.el.querySelector("#sideBigBtns").appendChild(flgmntNode);
				}
			}
		},
		getBadgeText: function(time) {
			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return "";
			if(!ajaxControl.getPageJson().currentTime) return;

			var currentTime = pageJson.currentTime.split(" ")[0];

			var ret = "";

			var endTime     = time.split(" ")[0];
			var endAt       = time.split(" ")[1];
			if(currentTime == endTime) {
				ret = endAt.split(":")[0] + ":" + endAt.split(":")[1] + "まで";
			} else {
				ret = Number(endTime.split("/")[1]) + "/" + Number(endTime.split("/")[2]) + "まで";
			}

			return ret;
		},
		addEventBadge: function() {
			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;

			// イベントバッジ todo: 次回までに方針考えとく
			// ghostDOM対策(すでにviewがある場合は１度消す)
			this.removeEventBadge();
			if(pageJson.eventList) {
				var eventBadge = {};
				var closeFunctionsArr = common.storage.gameUser.toJSON().closeFunctions.split(",");

				// イベントデータ
				var eventMaster = null;
				    eventMaster = pageJson.eventList.filter(function(event,index){
					if(event.eventType == "TOWER")        return true;
					if(event.eventType == "DAILYTOWER")   return true;
					if(event.eventType == "BRANCH")       return true;
					if(event.eventType == "ARENAMISSION") return true;
					if(event.eventType == "SINGLERAID")   return true;
					if(event.eventType == "STORYRAID")    return true;
					if(event.eventType == "TRAINING")     return true;
					if(event.eventType == "ACCOMPLISH")   return true;
					if(event.eventType == "DUNGEON")      return true;
					if(event.eventType == "RAID")         return true;
					if(event.eventType == "PUELLA_RAID") return true;
					if(event.eventType == "WITCH") return true;
					if(event.eventType == "WALPURGIS") return true;
					if(event.eventType == "ARENARANKING" && closeFunctionsArr.indexOf("ARENA") === -1) {
						return true;
					};
				});

				if(pageJson.regularEventList) { //ミラーズランクマッチ追加
					var regulatEventMaster = pageJson.regularEventList.filter(function(event,index){
						if(event.regularEventType == "ARENARANKMATCH" && closeFunctionsArr.indexOf("ARENA") === -1) {
							return true;
						};
					});
					eventMaster = eventMaster.concat(regulatEventMaster);
				}
				
				if(eventMaster) {
					var Model = Backbone.Model.extend({});
					EventBadgeView.prototype.template = _.template(this.el.querySelector("#EventBadgeTemp").textContent);
					EventBadgeView.prototype.rootView = this;
					var flgmntNode = common.doc.createDocumentFragment();
					this.eventBadgeView = [];
					var i=0, leng=eventMaster.length;
					while (i<leng) {
						eventMaster[i].endAtText   = this.getBadgeText(eventMaster[i].endAt);
						var eventBadgeView = new EventBadgeView({model: new Model(eventMaster[i])});
						flgmntNode.appendChild(eventBadgeView.render().el);
						this.eventBadgeView.push(eventBadgeView);
						i=(i+1)|0;
					}
					this.el.querySelector("#sideBigBtns").appendChild(flgmntNode);
				}
			}
		},
		addRegularEventBadge: function() {
			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;

			// ghostDOM対策(すでにviewがある場合は１度消す)
			this.removeRegularEventBadge();

			var eventMaster = null;
			var currentTime = Date.parse(pageJson.currentTime);
			if(!ajaxControl.getPageJson().currentTime) return;
			var btn = common.doc.getElementsByClassName("globalRegularEventBtn")[0];
			//ミラーズランクマッチの時は何もしない
			if (btn.classList.contains("arenarankmatch")) {
				return;
			}			
			if (btn.classList.contains("groupBattle")) {
				// キモチ戦は期間によってテキストを出し分ける
				eventMaster = _.findWhere(pageJson.regularEventList,{"regularEventType":"GROUPBATTLE"});
				if(eventMaster) {
					EventBadgeView.prototype.template = _.template(this.el.querySelector("#EventBadgeTemp").textContent);
					EventBadgeView.prototype.rootView = this;

					var preliminaryRoundStartAt = Date.parse(eventMaster.regularEventGroupBattle.preliminaryRoundStartAt);
					var preliminaryRoundEndAt = Date.parse(eventMaster.regularEventGroupBattle.preliminaryRoundEndAt);
					var finalRoundStartAt = Date.parse(eventMaster.regularEventGroupBattle.finalRoundStartAt);
					var finalRoundEndAt = Date.parse(eventMaster.regularEventGroupBattle.finalRoundEndAt);
					var finalRoundSummarizedAt = Date.parse(eventMaster.regularEventGroupBattle.finalRoundSummarizedAt);
					if ((currentTime < finalRoundSummarizedAt && currentTime > finalRoundEndAt) ||
							(currentTime < finalRoundStartAt && currentTime > preliminaryRoundEndAt)
					) {
						eventMaster.endAtText = "集計中";
					} else if (currentTime < preliminaryRoundStartAt) {
						// 開催前
						var startTime = eventMaster.regularEventGroupBattle.preliminaryRoundStartAt.split(" ")[0];
						eventMaster.endAtText = Number(startTime.split("/")[1]) + "/" + Number(startTime.split("/")[2]) + "開催予定";

					} else if (currentTime < finalRoundEndAt) {
						// 開催中
						var _currentTime = pageJson.currentTime.split(" ")[0];
						var endTime     = eventMaster.regularEventGroupBattle.finalRoundEndAt.split(" ")[0];
						var endAt       = eventMaster.regularEventGroupBattle.finalRoundEndAt.split(" ")[1];
						eventMaster.endAtText   = "";

						if(_currentTime == endTime) {
							eventMaster.endAtText = endAt.split(":")[0] + ":" + endAt.split(":")[1] + "まで";
						} else {
							eventMaster.endAtText = Number(endTime.split("/")[1]) + "/" + Number(endTime.split("/")[2]) + "まで";
						}
					} else if (currentTime > finalRoundSummarizedAt) {
						eventMaster.endAtText = "結果発表中";
					}
				}
			} else {
				// 殲滅戦はイベント終了日時を表示する
				eventMaster = pageJson.regularEventList ? pageJson.regularEventList[0]: null;
				if(eventMaster) {
					eventMaster.endAtText = this.getBadgeText(eventMaster.endAt);
				}
			}

			if (eventMaster) {
				var Model = Backbone.Model.extend({});
				var flgmntNode = common.doc.createDocumentFragment();
				this.regularEventBadgeView = new EventBadgeView({model: new Model(eventMaster)});
				flgmntNode.appendChild(this.regularEventBadgeView.render().el);
				this.el.querySelector("#sideBigBtns").appendChild(flgmntNode);
			}
		},
		addPatrolBadge: function(_newTime) {
			var pageJson = ajaxControl.getPageJson();
			if(!pageJson) return;
			if(!ajaxControl.getPageJson().currentTime) return;

			// ghostDOM対策(すでにviewがある場合は１度消す)
			this.removePatrolBadge();

			//userPatrolList：パトロールのエリアごとの実行データがある予定  patrolAreaList：パトロールのエリア情報

			var eventMaster = {};
			var currentTime;
			if(_newTime){
				currentTime = _newTime;
			}else{
				currentTime = pageJson.currentTime;
			}

			var schedule    = [];//パトロールの時間を見る

			if(pageJson.userPatrolList){
				_.each(pageJson.userPatrolList,function(_data){//各エリアのdurationを見る
					if(_data.userPatrolResult && _data.userPatrolResult.status == "EXPEDITION"){
						if(!_data.patrolArea) return;
						var durationTime = _data.patrolArea.duration;
						var miri = ((durationTime.substr(0,2)-0)*60*60 + (durationTime.substr(2,2)-0)*60 + (durationTime.substr(4,2)-0)) * 1000;//遠征にかかる時間をミリ秒に
						schedule.push(miri + Date.parse(_data.userPatrolResult.startedAt));//開始した時間にmiriを足すといつ終わるかわかる
					}
				});
			}

			var aryMin = function (a, b) {return Math.min(a, b);};//並び替え用

			if(schedule.length == 0) return;//スケジュールが無ければバッジ処理なくす

			if(common.location != "PatrolTop"){
				EventBadgeView.prototype.template = _.template(this.el.querySelector("#EventBadgeTemp").textContent);
				EventBadgeView.prototype.rootView = this;

				var recent = schedule.reduce(aryMin);//一番少ないものを
				// console.log(recent,new Date(recent).toLocaleString());//終わる時刻

				//バッジ用のmodelを作る
				eventMaster.patrol = true;
				eventMaster.time   = recent;

				var Model = Backbone.Model.extend({});
				var flgmntNode = common.doc.createDocumentFragment();
				this.patrolBadgeView = new EventBadgeView({model: new Model(eventMaster)});
				flgmntNode.appendChild(this.patrolBadgeView.render().el);
				this.el.querySelector("#sideBigBtns").appendChild(flgmntNode);

				this.patrolBadgeView.el.dataset.href = "#/PatrolTop";
				var _time  = new Date(this.patrolBadgeView.model.attributes.time);
				var _text  = this.patrolBadgeView.el.getElementsByClassName("endAtText")[0];
				var _ctime = new Date(currentTime)-0 + 1000;//表示までの差分を1秒追加

				//初期表示
				var firstShow = this.countdownTimer(_time,_ctime);
				if(firstShow.ms < 0){
					_text.innerText = "帰還しました";
				}else{
					_text.innerText = "完了まで" + firstShow.h + ":" + firstShow.m + ":" + firstShow.s;

					patrolTimer = setInterval(function(){
						_ctime = _ctime-0 + 1000;
						//etime.ms＝ミリ秒,etime.d＝日,etime.h＝時間,etime.m＝分,etime.s＝秒
						var etime = this.countdownTimer(_time,_ctime);//終わる時間

						if(etime.ms < 0){
							_text.innerText = "帰還しました";
							clearInterval(patrolTimer);
						}else{
							_text.innerText = "完了まで" + etime.h + ":" + etime.m + ":" + etime.s;
						}

					}.bind(this),1000);
				}
			}

		},
		countdownTimer : function(_time,_ctime){//遠征用
			var now    = _ctime; //現在時刻を取得
			var future = _time; //予定時刻
			var diff   = future.getTime() - now; //時間の差を取得（ミリ秒）
			var Day    = Math.floor(diff / 1000 / 60 / 60 / 24);//取っておく
			var Hour   = Math.floor(diff / 1000 / 60 / 60);
			if(Hour < 10) Hour = "0" + Hour;
			var Min    = Math.floor(diff / 1000 / 60) % 60;
			if(Min < 10) Min = "0" + Min;
			var Sec    = (Math.floor(diff / 1000) % 60);
			if(Sec < 10) Sec = "0" + Sec;

			var timeObj = {"ms":diff,"d":Day,"h":Hour,"m":Min,"s":Sec};
			return timeObj;
		},
		removeCampaignBanner: function() {
			if(!this.campaignBannerView) return;
			this.campaignBannerView.removeView();
			this.campaignBannerView = null;
		},
		removeCampaignBadge: function() {
			if(!this.campaignBadgeView) return;
			this.campaignBadgeView.removeView();
			this.campaignBadgeView = null;
		},
		removeEventBadge: function() {
			if(!this.eventBadgeView) return;

			var i=0, leng=this.eventBadgeView.length;
			while (i<leng) {
				this.eventBadgeView[i].removeView();
				i=(i+1)|0;
			}
			this.eventBadgeView = null;
		},
		removeRegularEventBadge: function() {
			if(!this.regularEventBadgeView) return;
			this.regularEventBadgeView.removeView();
			this.regularEventBadgeView = null;
		},
		removePatrolBadge: function() {
			if(!this.patrolBadgeView) return;
			this.patrolBadgeView.removeView();
			this.patrolBadgeView = null;
			if(patrolTimer != ""){
				clearInterval(patrolTimer);
			}
		},
		removeView : function(){
			if(common.acpTimeCure){
				clearInterval(common.acpTimeCure);
				common.acpTimeCure = null;
			}
			if(this.bannerView) this.bannerView.removeView();
			if(this.userStatusView) this.userStatusView.removeView();
			if(this.eventBadgeView) this.removeEventBadge();
			if(this.campaignBadgeView) this.campaignBadgeView.removeView();
			if(this.regularEventBadgeView) this.removeRegularEventBadge();
			if(this.patrolBadgeView) this.removePatrolBadge();

			common.globalMenuView = null;
			this.off();
			this.remove();
		},
	});

	var CampaignBannerView = Backbone.View.extend({
		tagName: "li",
		className: "campaignBanner TE se_decide linkBtn",
		attributes: { 'data-href': '#/CampaignBoxGachaTop' },
		initialize: function(options) {
			this.template = "<img src='"+options.cpData.BOX_GACHA.bannerImgPath+"' />";
		},
		render: function() {
			this.$el.html(this.template);
			return this;
		},
		removeView : function(){
			this.off();
			this.remove();
		}
	});

	var CampaignBadgeView = Backbone.View.extend({
		tagName: "li",
		className: "campaignBadgeWrap",
		events: function() {
			var evtObj = {};
			evtObj["webkitAnimationEnd .campaignBadge"] = this.animationTrigger;
			return evtObj;
		},
		initialize: function(model,options) {
			if(options) this.arenaBadge = true;
			this.cnt = 0;
		},
		render: function() {
			// console.log(this.model)
			this.$el.html(this.template({model:this.model.toJSON()}));

			this.domCnt = this.el.querySelectorAll(".campaignBadge").length;

			if(this.domCnt == 1) {
				common.addClass(this.el.querySelectorAll(".campaignBadge")[0],"only");
			} else {
				common.addClass(this.el.querySelectorAll(".campaignBadge")[0],"off");
			}

			if(this.arenaBadge) common.addClass(this.el,"ARENA");

			return this;
		},
		animationTrigger: function(e) {
			if(e.currentTarget.classList.contains("off")) {
				common.removeClass(e.currentTarget,"off");
				this.cnt = ((this.cnt + 1) >= this.domCnt) ? 0 : this.cnt + 1;
				common.addClass(this.el.querySelectorAll(".campaignBadge")[this.cnt],"on");
			} else {
				common.addClass(e.currentTarget,"off");
				common.removeClass(e.currentTarget,"on");
			}
		},
		removeView : function(){
			this.off();
			this.remove();
		}
	});


	var eventLinkObj = {
		"TOWER"        : "#/EventTowerTop",
		"DAILYTOWER"   : "#/EventDailyTowerTop",
		"BRANCH"       : "#/EventBranchTop",
		"ARENAMISSION" : "#/EventArenaMissionTop",
		"ARENARANKING" : "#/ArenaTop",
		"SINGLERAID"   : "#/EventSingleRaidTop",
		"STORYRAID"    : "#/EventStoryRaidTop",
		"TRAINING"     : "#/EventTrainingTop",
		"DUNGEON"      : "#/EventDungeonTop",
		"RAID"         : "#/EventRaidTop",
		"GROUPBATTLE"  : "#/RegularEventGroupBattleTop",
		"EXTERMINATION": "#/RegularEventExterminationTop",
		"ACCOMPLISH"   : "#/RegularEventAccomplishTop",
		"ARENARANKMATCH": "#/ArenaTop",
		"PUELLA_RAID": "#/PuellaHistoriaRouter",
		"WITCH": "#/EventWitchTopPage",
		"WALPURGIS": "#/EventWalpurgisRaidTop",
	};
	var eventPathObj = {
		"TOWER"        : "tower",
		"DAILYTOWER"   : "dailytower",
		"BRANCH"       : "branch",
		"ARENAMISSION" : "arenaMission",
		"ARENARANKING" : "arenaranking",
		"SINGLERAID"   : "singleraid",
		"STORYRAID"    : "storyraid",
		"TRAINING"     : "training",
		"DUNGEON"      : "dungeon",
		"RAID"         : "raid",
		"GROUPBATTLE"  : "groupBattle",
		"EXTERMINATION": "extermination",
		"ACCOMPLISH"   : "accomplish",
		"PUELLA_RAID": "puellaRaid",
		"WITCH": "eventWitch",
		"WALPURGIS": "eventWalpurgis",
	};

	var EventBadgeView = Backbone.View.extend({
		tagName: "li",
		events: function(){
			var evtObj = {};
			evtObj[common.cgti] = this.locationCheck;
			return evtObj;
		},
		className: function() {
			var classTxt = "eventBadgeWrap TE se_decide";
			var eventType;
			if (this.model.get("eventType")) {
				eventType = this.model.get("eventType");
				classTxt += (" linkBtn " + eventType.toLowerCase());
			}
			else {
				if(this.model.get("regularEventType")){
					eventType = this.model.get("regularEventType");
					if (eventLinkObj[eventType]) classTxt += " linkBtn";
					if(eventType == 'ARENARANKMATCH'){ //ミラーズランクマッチの時
						classTxt += " "+ eventType.toLowerCase();
					}else{
						classTxt += " regularevent";
					};
				}else{
					classTxt += " linkBtn patrol";
				}
			}

			return classTxt;
		},
		initialize: function(options) {
			var imagePath = '';
			if (this.model.get("eventType")) {
				this.eventType = this.model.get("eventType");
				switch (eventPathObj[this.eventType]) {
					case 'puellaRaid':
						imagePath = '/magica/resource/image_web/page/quest/puellaHistoria_lastBattle/event/' + this.model.toJSON().eventId + '/event_pop.png';
						break;
					case 'arenaranking':
						imagePath = '/magica/resource/image_web/event/arenaranking/common/event_pop.png';
						break;
					case 'training':
						imagePath = '/magica/resource/image_web/event/training/common/event_pop_a.png';
						break;
						default:
						imagePath = '/magica/resource/image_web/event/' + eventPathObj[this.model.get("eventType")] + '/' + this.model.toJSON().eventId + '/event_pop.png';
					}
			} else {
				if(this.model.get("regularEventType")){
					this.eventType = this.model.get("regularEventType");
					imagePath = '/magica/resource/image_web/common/global/event_pop.png';
					if(this.eventType == 'ARENARANKMATCH'){ //ミラーズランクマッチの時
						imagePath = '/magica/resource/image_web/event/arenaRankMatch/common/event_pop.png';
					};
				}else{//遠征用
					imagePath = '/magica/resource/image_web/regularEvent/groupBattle/common2/event_pop.png';
				}
			}

			this.model.set({
				imagePath: imagePath
			});

		},
		render: function() {
			// console.log(this);
			this.$el.html(this.template({model:this.model.toJSON()}));
			if(this.eventType){
				var text = this.eventType.toLowerCase().charAt(0).toUpperCase() + this.eventType.toLowerCase().slice(1).toLowerCase();
			}

			if (eventLinkObj[this.eventType]) {
				this.el.dataset.href = eventLinkObj[this.eventType];
			}

			return this;
		},
		locationCheck : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			if(e.currentTarget.dataset.href === ("#/"+common.location)){
				this.rootView.menuToggle(e);
			}
		},
		removeView : function(){
			this.off();
			this.remove();
		}
	});

	//ガチャバッジ制御関数
	var controlGachaBadge = function(_args){
		var _pageJson = _args.pageJson;
		var _campaignList = [];
		if(_pageJson.campaignList){
			_campaignList = _pageJson.campaignList;
		};
		//idの大きい順に並び替え
		_campaignList.sort(function(a,b){
			return b.id - a.id;
		});
		var _isDispBadge = false;
		_.each(_campaignList, function(_val, _index, _list){
			var _remainCount = 0;
			if(
				_val.campaignType == 'FREE_GACHA' && 
				_val.imagePath && 
				_val.parameterMap && 
				_val.parameterMap.GACHAKINDID && 
				!_isDispBadge
			){
				//parameterMapでガチャID取得して残り回数を確認
				_remainCount = getTargetGachaRemainCount({
					gachaKindId: _val.parameterMap.GACHAKINDID,
					pageJson: _pageJson,
				});
				//回数が残っているときだけ表示する
				if(_remainCount > 0){
					setGachaBadge({
						imagePath: _val.imagePath,
					});
					_isDispBadge = true; //表示したら終了
				};
			};
		});
		//無料レアガチャでも表示されてなかったら無料ガチャ表示
		if(!_isDispBadge){
			setFreeGachaBadge({
				pageJson: _pageJson,
			});
		};
	};

	var getTargetGachaRemainCount = function(_args){
		var _gachaKindId = Number(_args.gachaKindId);
		var _pageJson = _args.pageJson;
		var _remainCount = 0;
		var _userGachaKindList = [];
		if(
			common.storage && 
			common.storage.userGachaKindList
		){
			_userGachaKindList = common.storage.userGachaKindList.toJSON();
		};
		_.each(_userGachaKindList, function(_val, _index, _list){
			if(
				_val.gachaKindId == _gachaKindId
			){
				if(_val.canRemainCount){
					//残り回数があるときはそれを使う
					_remainCount = _val.canRemainCount - _val.totalCount;
				}else if(
					_val.gachaKind && 
					_val.gachaKind.type == 'DAILY' && 
					_val.recentGachaAt
				){
					//単発レアガチャのとき日付が違うときは表示する
					if(
						(function(){
							var __isSameDay = false;
							var __current = (function(){
								var ___d = common.getDateShortening({
									date: _pageJson.currentTime,
								});
								return ___d.yr+'/'+___d.mo+'/'+___d.da;
							})();
							var __gachaAt = (function(){
								var ___d = common.getDateShortening({
									date: _val.recentGachaAt,
								});
								return ___d.yr+'/'+___d.mo+'/'+___d.da;
							})();
							if(__current != __gachaAt){
								__isSameDay = true;
							};
							return __isSameDay;
						})()
					){
						_remainCount = 1;
					};
				};
			};
		});
		return _remainCount;
	};

	var setGachaBadge = function(_args){
		var _imagePath = _args.imagePath;
		var gachaBadge = common.doc.getElementById("gachaBadge");
		common.addClass(gachaBadge, "freeRareGacha");
		gachaBadge.style.backgroundImage = "url('" + _imagePath + "')";
	};

	var setFreeGachaBadge = function(_args){
		var _pageJson = _args.pageJson;
		var _currentTime = _pageJson.currentTime;
		var gachaBadgeCnt = 0;
		var beforeFreeGacha = (common.storage.gameUser.get("freeGachaAt")) ? common.storage.gameUser.get("freeGachaAt") : "";
		if(beforeFreeGacha === "" || beforeFreeGacha.substr(0,10) !== _currentTime.substr(0,10)){
			common.addClass(common.doc.getElementById("gachaBadge"),"on");
			common.doc.getElementById("gachaBadge").textContent = "Free";
		}else{
			var yellPoint = (common.storage.userItemList.findWhere({itemId:"YELL"})) ? common.storage.userItemList.findWhere({itemId:"YELL"}).toJSON().quantity : 0;
			if(yellPoint > 199){
				gachaBadgeCnt = Math.floor(yellPoint / 200);
				common.addClass(common.doc.getElementById("gachaBadge"),"on");
				common.doc.getElementById("gachaBadge").textContent = gachaBadgeCnt;
			}else{
				common.removeClass(common.doc.getElementById("gachaBadge"),"on");
			}
		}
	};

	return PageView;
});
