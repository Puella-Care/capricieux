define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/chara/CharaTop.html',
	//'text!css/chara/CharaTop.css',
	//'text!css/chara/CharaCommon.css',
	'cardUtil',
	'CharaCommon'
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	cmd,
	//pageTemp,
	//css,
	//charaCommonCss,
	cardUtil,
	charaCommon
) {
	'use strict';

	var pageJson;
	var composeGreatFactor;
	var composeExcellentFactor;
	// マイページから遷移した際に、初期表示したいキャラのカードIDが入る
	var selectCardId = null;

	// ------------------------------------------------------------------------.

	var pageView;
	var PageView = Backbone.View.extend({
		events : function(){
			var evtObj = {};
			evtObj[common.cgti] = this.touch;
			evtObj[common.cgti + " #poseChangeBtn"]   = this.standPoseChange;
			evtObj[common.cgti + " .miniCharaWrap"]   = this.miniCharaMotion;
			evtObj[common.cgti + " #globalBackBtn"]   = this.tapGlobalBackBtn;
			return evtObj;
		},
		tapGlobalBackBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/TopPage';
		},
		miniCharaMotion : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			var sdCharaPrm = {};
			sdCharaPrm.id = String(charaCommon.charaDataView.model.toJSON().card.miniCharaNo);
			sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
			// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
			sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
			sdCharaPrm.fade = 0.3;
			sdCharaPrm.animeList = [
				'reaction',
				common.miniCharaStandPose
			];
			cmd.showMiniChara(sdCharaPrm);
			// charaCommon.showMiniChara(view.model.toJSON().card.miniCharaNo);
		},
		standPoseChange : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			cmd.startSe(1008);

			var currentPose = common.miniCharaStandPose;
			var changePose  = (currentPose == 'wait') ? 'stance' : 'wait';
			localStorage.setItem("miniCharaStandPose",changePose);
			common.miniCharaStandPose = changePose;

			var sdCharaPrm = {};
			sdCharaPrm.id = String(charaCommon.charaDataView.model.toJSON().card.miniCharaNo);
			sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
			// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
			sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
			sdCharaPrm.fade = 0.3;
			sdCharaPrm.animeList = [
				common.miniCharaStandPose
			];
			cmd.showMiniChara(sdCharaPrm);
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById("tempCharaTop").innerText
			);
			this.createDom();
		},
		render : function() {
			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		createDom : function() {
			common.content.prepend(this.render().el);
			this.createView();
		},
		createView : function() {
			// userCardListの作成
			cardUtil.createCardList();
			common.tapBlock(false);
			common.ready.hide();
		},
		touch: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			var touchObj = (!e.originalEvent.changedTouches) ? e.originalEvent : e.originalEvent.changedTouches[0];
			var prm = {
				"x":touchObj.pageX,
				"y":touchObj.pageY
			};
			// cmd.touchMiniChara(prm);
		}
	});

	// ------------------------------------------------------------------------.
	// お気に入り/サポートボタンの見た目更新
	var confChara = function(model) {
		var leaderBtn = common.doc.querySelector("#leaderChangeBtn");
		if(common.storage.gameUser.toJSON().leaderId == model.userCardId) {
			common.addClass(leaderBtn,"off");
		} else {
			common.removeClass(leaderBtn,"off");
		}
	};

	var selectedAttributeId = "";
	var setComposeAttributeBtn = function(_args){
		var _attributeId = _args.attributeId.toLowerCase();
		if(selectedAttributeId){ //キャラが選択済みの時
			$('.composeAttribute').removeClass(selectedAttributeId);
		};
		$('.composeAttribute').addClass(_attributeId);
		selectedAttributeId = _attributeId; //保存しておく
	};//setComposeAttributeBtn

	var init = function(){
		common.questBattleModel = null;
		pageJson = ajaxControl.getPageJson();
		
		//common.setStyle(css+charaCommonCss);
		pageView = new PageView();
		charaCommon.charaViewInit(selectCardId);

		// キャンペーン ----------------------------------------------------------.
		composeGreatFactor     = 1;
		composeExcellentFactor = 1;
		if(pageJson.campaignList) {
			var campaignData = common.campaignParse(pageJson.campaignList);
			if(campaignData.POINT_UP && campaignData.POINT_UP.CARD_COMPOSE) {
				if(campaignData.POINT_UP.CARD_COMPOSE.EXCELLENT || campaignData.POINT_UP.CARD_COMPOSE.GREAT) {
					// console.log("キャンペーン",campaignData);
					composeGreatFactor     = campaignData.POINT_UP.CARD_COMPOSE.EXCELLENT || 1;
					composeExcellentFactor = campaignData.POINT_UP.CARD_COMPOSE.GREAT     || 1;
				}
			}
		}
		if(composeGreatFactor !== 1 || composeExcellentFactor !== 1) {
			common.addClass(common.doc.querySelector("#btnArea"),"campaignIcon")
		}
		// --------------------------------------------------------------------.

		// 装備ページから返ってきた時用
		var charaId = charaCommon.charaDataView.model.toJSON().card.miniCharaNo;
		charaCommon.showMiniChara(charaId);
		
		// 属性強化ボタンの属性変更
		setComposeAttributeBtn({
			attributeId: charaCommon.charaDataView.model.attributes.chara.attributeId,
		});

		common.tapBlock(false);
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
		],
		charaSelect : function(view) {
			charaCommon.charaSelect(view);
			confChara(view.model.toJSON());
			charaCommon.showMiniChara(view.model.toJSON().card.miniCharaNo);
			// 属性強化ボタンの属性変更
			setComposeAttributeBtn({
				attributeId: view.model.attributes.chara.attributeId,
			});
		},
		fetch : function(id){
			selectCardId = (id) ? id : null;
			ajaxControl.pageModelGet(
				this.needModelIdObj,
				null,
				'noConnect'
			);
		},
		init : function() {
			init();
		},
		startCommand : function(){
			cmd.changeBg('web_common.ExportJson');
			cmd.startBgm(common.settingBgm);
		},
		remove : function(callback){
			if(pageView) {
				selectCardId = null;
				charaCommon.charaViewRemove();
				pageView.trigger('remove');
				pageView.remove();
			}
			callback();
		},
		charaCommon: function() {
			return charaCommon;
		}

	};
});