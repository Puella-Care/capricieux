define([
	'underscore',
	'backbone',
	"backboneCommon",
	'ajaxControl',
	'command'
], function (_,Backbone,common,ajaxControl,cmd) {

	var apPopupCallback;
	var apPopupMessage;
	var popupTemp;
	var popupTemp2;
	var userStatusModel = {};
	var targetItem;
	var disableFlg = false;

	//アビリティ周りのイベント設定
	var popupEventSet = function(message,callback){
		apPopupCallback = null;// 必ず初期化
		apPopupMessage  = null;// 必ず初期化
		disableFlg = false;// 必ず初期化する:2重送信防止フラグ
		if(callback) apPopupCallback = callback;// callbackがあるとき保存する
		if(message)  apPopupMessage  = message;

		new common.PopupClass({
			title:     "AP回復",
			content:   "",
			exClass:   "apPopup",
			popupType: "typeB"
		});

		var frgmntNode = common.doc.createDocumentFragment();
		var newEle = common.doc.createElement("div");

		var models = {};
		var userItem = common.storage.userItemList;

		if(userItem.findWhere({"itemId":"CURE_AP_50"})){
			models.ap50 = userItem.findWhere({"itemId":"CURE_AP_50"}).toJSON();
		}else{
			models.ap50 = {"quantity":0};
		}

		if(userItem.findWhere({"itemId":"CURE_AP"})){
			models.apMax = userItem.findWhere({"itemId":"CURE_AP"}).toJSON();
		}else{
			models.apMax = {"quantity":0};
		}

		require(['text!template/user/APPopup.html'],function(pageTemp) {
			popupTemp = _.template(pageTemp);
			newEle.innerHTML = popupTemp({model:models,userItemList:common.storage.userItemList,message:apPopupMessage});

			common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(newEle);

			userStatusModel.ACP     = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON().point;
			userStatusModel.MAX_ACP = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point;

			var domACP = common.doc.getElementById("popupArea").getElementsByClassName("popACP")[0];

			//塞ぐの一旦やめる
			if(userStatusModel.ACP >= userStatusModel.MAX_ACP*3){
				common.addClass(domACP, "limit");
				allNoEvents();
			}
			else if(userStatusModel.ACP > userStatusModel.MAX_ACP){
				common.addClass(domACP, "over");
			}

			domACP.textContent = userStatusModel.ACP;
			common.doc.getElementById("popupArea").getElementsByClassName("popMAX_ACP")[0].textContent = userStatusModel.MAX_ACP;

			common.doc.getElementById("useItemWrap").addEventListener(common.cgti,useItemHandler);
		});
	};

	var useItemHandler = function(e){
		if(!e.target.classList.contains("cureBtn") || e.target.classList.contains("off")) return;
		if(common.isScrolled()) return;
		e.preventDefault();

		if(common.globalMenuView) common.globalMenuView.awakeSuspend(); //念のため時間を最新化(回復ずれ防止)

		targetItem = e.target.dataset.item;
		var newEle = common.doc.createElement("div");

		var items = {};

		items.nowACP = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON().point;
		items.nowMAX = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point;
		var userItem = common.storage.userItemList;
		var _template = 'text!template/user/APPopup2.html';
		var _popupType = 'typeC';
		var _exClass = 'apPopup';
		switch(targetItem){
			case "CURE_AP_50":
				items.itemName = "AP回復薬50";
				items.after = (items.nowACP | 0) + 50;
				items.quantity = userItem.findWhere({"itemId":"CURE_AP_50"}).toJSON().quantity;
				break;
			case "CURE_AP":
				items.itemName = "AP回復薬MAX";
				items.after = (items.nowACP | 0) + (userStatusModel.MAX_ACP | 0);
				items.quantity = userItem.findWhere({"itemId":"CURE_AP"}).toJSON().quantity;
				break;
			case "MONEY":
				_template = 'text!template/user/APPopupForMoney.html';
				_popupType = 'typeA';
				_exClass = 'apPopup forMoney';
				items.itemName = "マギアストーン";
				items.after = (items.nowACP | 0) + (userStatusModel.MAX_ACP | 0);
				//消費数はtemplateにベタ書きだったのでこちらで処理する
				var _consumeNum = 5;
				items.moneyObj = common.getTotalStone();
				items.remainStone = common.calcExpendStone({
					quantity:_consumeNum,
					isPurchasedMoneyOnly:false,
				});
				break;
		}
		//ポップアップ起動
		new common.PopupClass({
			title:"回復確認",
			content: "",
			exClass: _exClass,
			popupType:_popupType,
		});
		require([_template],function(pageTemp2) {
			popupTemp2 = _.template(pageTemp2);
			newEle.innerHTML = popupTemp2({model:common.storage,item:items});
			common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(newEle);
			common.doc.getElementById("confirmBtns").addEventListener(common.cgti,itemUse);
		});
		setTimeout(function() {
			//所持数と消費数が同じかどうかをチェックしてclassを変更
			_.map(items.moneyObj, function(value, key){
				$('.APPopWrap #remain_'+key).removeClass('same'); //一回消す
				if(value == items.remainStone[key]){
					$('.APPopWrap #remain_'+key).addClass('same');
				};
			});
			//AP回復後の値を確認して3倍以上でclassを変更
			_.map([
				'Arrow',
				'AfterText'
			], function(value, key){
				$('.APPopWrap #AP'+value).removeClass('limit'); //一回消す
				if(items.after >= items.nowMAX*3){
					$('.APPopWrap #AP'+value).addClass('limit');
				};
			});
		}, 150);
	};

	var itemUse = function(e){
		e.preventDefault();
		if(common.isScrolled()) return;
		if(!e.target.classList.contains("btn")) return;
		if(disableFlg) return;
		disableFlg = true;

		var action = e.target.dataset.action;

		if(action === "cancel"){
			disableFlg = false;
			checkApPopup(apPopupMessage,apPopupCallback);
		}else{
			var callback;
			if(targetItem === "MONEY"){
				callback = function(res){
					if(res.resultCode !== "error") {
						res = JSON.parse(res);
						common.responseSetStorage(res);

						// AP回復通知がONになってた場合
						// 石使用時は全快するので強制的に0秒とする
						if(common.noticeAp !== undefined && common.noticeAp === true){
							cmd.noticeApFullSet(0);
						}else if(common.noticeAp === undefined){
							$('#configCallback').on('configCallback',function(e,res) {
								$('#configCallback').off();
								common.noticeAp = (res.ap === 1) ? true : false;
								if(common.noticeAp){
									cmd.noticeApFullSet(0);
								}
							});
							cmd.noticeApConfig("configCallback");
						}
						if(apPopupCallback){
							if(common.g_popup_instance) common.g_popup_instance.popupView.close();
							disableFlg = false;
							apPopupCallback();
						}else{
							disableFlg = false;
							checkApPopup();
						}
					}
				};

				ajaxControl.ajaxPlainPost(common.linkList.useMoneyProcess,"COMMAND_TYPE=2&ITEM_TYPE=1&ITEM_NUMBER=1",callback);

			}else{

				callback = function(res){
					if(res.resultCode !== "error") {
						common.responseSetStorage(res);

						// AP回復通知がONになってた場合
						if(common.noticeAp !== undefined && common.noticeAp === true){
							if(!common.storage.userStatusList) return;
							if(!ajaxControl.getPageJson().currentTime) return;
							var nowAp = common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON();
							var maxAp = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON();
							if(nowAp.point >= maxAp.point){
								cmd.noticeApFullSet(0);
							}else{
								var remainTime = common.getApRemainTime(nowAp,maxAp,ajaxControl.getPageJson().currentTime);
								cmd.noticeApFullSet(remainTime);
							}
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

						if(apPopupCallback){
							if(common.g_popup_instance) common.g_popup_instance.popupView.close();
							disableFlg = false;
							apPopupCallback();
						}else{
							disableFlg = false;
							checkApPopup();
						}
					}
				};

				var itemNum = 1;
				var postItems = {"itemId":targetItem,"num":itemNum};

				ajaxControl.ajaxPost(common.linkList.useItem,postItems,callback);
			}
		}
	};

	var apDispChange = function(){
		var userStatus = common.storage.userStatusList;
		var userStatusModel = {};

		userStatusModel.ACP =     userStatus.findWhere({"statusId":"ACP"}).toJSON().point;
		userStatusModel.MAX_ACP = userStatus.findWhere({"statusId":"MAX_ACP"}).toJSON().point;
		var domACP = common.doc.getElementById("apPointWrap").getElementsByClassName("popACP")[0];
		domACP.textContent = userStatusModel.ACP;
		common.doc.getElementById("apPointWrap").getElementsByClassName("popMAX_ACP")[0].textContent = userStatusModel.MAX_ACP;

		if(userStatusModel.ACP >= userStatusModel.MAX_ACP*3){
			common.addClass(domACP, "limit");
			allNoEvents();
		}
		else if(userStatusModel.ACP > userStatusModel.MAX_ACP){
			common.addClass(domACP, "over");
		}
	};

	var allNoEvents = function(){
		var loopDom = common.doc.getElementById("useItemWrap").getElementsByClassName("cureBtn");
		var loopLen = loopDom.length;
		while(loopLen > 0){
			loopLen = (loopLen - 1) | 0;
			common.addClass(loopDom[loopLen],"off");
		}

		common.addClass(common.doc.querySelector('.maxTime'),"none");
		common.removeClass(common.doc.querySelector('#apPointWrap'),"timeShow");
	};

	var checkApPopup = function(message,callback){
		var acp =     common.storage.userStatusList.findWhere({"statusId":"ACP"}).toJSON().point;
		var maxAcp = common.storage.userStatusList.findWhere({"statusId":"MAX_ACP"}).toJSON().point;
		if(acp >= maxAcp*3){
			var popupModel = {
				title    : "AP回復",
				content: "APはこれ以上回復できません。<br>クエストをプレイしてAPを消費することで<br>再度回復が可能になります。",
				popupType:"typeA",
				closeBtnText: "OK"
			};
			if(common.location !== "MainQuest" && common.location !== "SubQuest" && common.location !== "CharaQuest" && common.location !== "EventQuest") {
				popupModel.decideBtnText = "クエスト";
				popupModel.decideBtnLink = "#/MainQuest";
			}
			new common.PopupClass(popupModel);
		} else {
			popupEventSet(message,callback);
		}
	};

	return {
		instantPopup : function(message,callback){
			checkApPopup(message,callback);
		},
		apCureEvents : function(){
			apDispChange();
		}
	};

});
