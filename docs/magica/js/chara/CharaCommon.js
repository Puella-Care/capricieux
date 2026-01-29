define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'cardUtil',
	'command',
	'js/view/chara/CharaListView',
	'js/view/chara/CharaDataView',
	'js/view/chara/CharaResultView',
	'js/view/chara/CharaImgView',
	'js/view/chara/RicheView',
], function (_,
			Backbone,
			common,
			ajaxControl,
			cardUtil,
			cmd,
			CharaListView,
			CharaDataView,
			CharaResultView,
			CharaImgView,
			RicheView) {
	'use strict';

	var Model = Backbone.Model.extend();
	var ccommon = {};

	var CurtainView = Backbone.View.extend({
		className: "confirmPopupCurtain",
		render : function() {
			this.$el.html();
			return this;
		}
	});

	ccommon.CharaResultView = CharaResultView;

	var linkBtnTimer = null;

	ccommon.charaViewInit = function(selectCardId) {
		var pageKey = common.location.split("CharaList")[1].toLowerCase();

		if(!ccommon.curtainView) {
			ccommon.curtainView = new CurtainView();
			$("#baseContainer").append(ccommon.curtainView.render().el);
		}
		if(!ccommon.charaDataView) {
			ccommon.charaDataView = new CharaDataView({
				model: new Model()
			});
			ccommon.charaDataView.ccommon = this;
			$("#baseContainer").append(ccommon.charaDataView.render().el);
		}

		ccommon.charaDataView.el.className = pageKey + " show";

		if(!ccommon.richeView) {
			ccommon.richeView = new RicheView({
				model: new Model(ajaxControl.getPageJson())
			});
			$("#baseContainer").append(ccommon.richeView.render().el);
		}

		if(!ccommon.charaImgView) {
			ccommon.charaImgView = new CharaImgView({
				model: new Model()
			});
			common.content.append(ccommon.charaImgView.render().el);
		}

		if(!ccommon.charaListView) {
			// DOM作成
			ccommon.charaListView = new CharaListView({
				model: new Model(),
				collection: common.storage.userCardListEx
			});
			common.content.append(ccommon.charaListView.render().el);

			// 初期選択指定があれば
			ccommon.charaListView.initSelectCardId = selectCardId;

			// 紐付け
			ccommon.charaListView.charaDataView = ccommon.charaDataView;
			ccommon.charaListView.charaImgView = ccommon.charaImgView;

			// ソート・スクロールセット
			ccommon.charaListView.cardSort.multiSort();
			common.scrollSetX("charaListScrollWrap","list");

			cmd.getBaseData(common.getNativeObj());
		} else {
			// 初期選択指定があれば
			ccommon.charaListView.initSelectCardId = selectCardId;
			ccommon.charaListView.cardSort.multiSort();

			common.scrollSetX("charaListScrollWrap","list");
			cmd.getBaseData(common.getNativeObj());
		}

		ccommon.checkCanEnhance();
		ccommon.addIdComposeAttributeBtn(); //属性強化リンク追加
		linkBtnTimer = setTimeout(function() {
			common.removeClass(common.doc.querySelector("#btnArea"),"offLink");
		},750);
	};

	ccommon.charaViewRemove = function() {
		// キャラトップ系ページはデータを使い回す
		if(
			common.location.indexOf("CharaListTop") == -1 &&
			common.location.indexOf("CharaListCompose") == -1 &&
			common.location.indexOf("CharaListComposeMagia") == -1 &&
			common.location.indexOf("CharaListCustomize") == -1 &&
			common.location.indexOf("CharaListEquip") == -1 &&
			common.location.indexOf("CharaListComposeAttribute") == -1
		) {

			if(ccommon.charaListView) ccommon.charaListView.trigger('remove');
			if(ccommon.charaDataView) ccommon.charaDataView.remove();
			if(ccommon.charaImgView)  ccommon.charaImgView.remove();
			if(ccommon.charaListView) ccommon.charaListView.removeView();
			if(ccommon.richeView)     ccommon.richeView.remove();
			if(ccommon.curtainView)   ccommon.curtainView.remove();

			ccommon.charaDataView = null;
			ccommon.charaImgView = null;
			ccommon.charaListView = null;
			ccommon.richeView = null;
			ccommon.curtainView = null;

			showMiniCharaId = null;
			cmd.hideMiniChara();

			if(linkBtnTimer) clearTimeout(linkBtnTimer);
		}
	};

	var showMiniCharaId = null;

	ccommon.showMiniChara = function(charaId,detailPopupFlag,customizeFlag) {
		// console.log("charaId:",charaId);
		// console.log("showMiniCharaId:",showMiniCharaId);
		// console.log("detailPopupFlag:",detailPopupFlag);

		if(charaId != showMiniCharaId || showMiniCharaId && detailPopupFlag || customizeFlag) {
			if(detailPopupFlag) {
				showMiniCharaId = showMiniCharaId;
			} else {
				showMiniCharaId = charaId;
			}

			var sdCharaPrm = {};
			sdCharaPrm.id = String(showMiniCharaId);
			sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
			// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
			sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
			sdCharaPrm.fade = 0.3;
			sdCharaPrm.animeList = [
				common.miniCharaStandPose
			];

			cmd.hideMiniChara();

			setTimeout(function() {
				cmd.showMiniChara(sdCharaPrm);
			},50);
		}
	};

	ccommon.hideMiniChara = function(detailPopupFlag) {
		cmd.hideMiniChara();
		if(!detailPopupFlag) {
			showMiniCharaId = null;
		}
	};

	ccommon.playComposeEffect = function() {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;

		cmd.playComposeEffect(sdCharaPrm);
	};

	var customizeTypeArr = {
		"HP": "HP",
		"ATTACK": "ATK",
		"DEFENSE": "DEF",
		"ACCEL": "ACCEL",
		"BLAST": "BLAST",
		"CHARGE": "CHARGE"
	};
	ccommon.playCustomizeEffect = function(type,value) {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
		sdCharaPrm.type  = type;
		if(value) {
			sdCharaPrm.value = value;
		}
		cmd.playCustomizeEffect(sdCharaPrm);
	};

	ccommon.playBulkCustomizeEffect = function(obj) {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
		sdCharaPrm.abilityList = obj;

		cmd.playBulkCustomizeEffect(sdCharaPrm);
	}

	ccommon.playComposeResultEffect = function(type) {
		var sdCharaPrm = {};
		sdCharaPrm.x    = (common.displayWidth === 1024) ? 400 : 440;
		// sdCharaPrm.y    = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 175;
		sdCharaPrm.type = type || 1;

		cmd.playComposeResultEffect(sdCharaPrm);
	};

	ccommon.playComposeMagiaEffect = function() {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		// sdCharaPrm.y = Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 175;

		cmd.playComposeMagiaEffect(sdCharaPrm);
	};

	// 属性強化用キャラアニメーション
	ccommon.playComposeAttributeEffect = function(type,value) {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
		sdCharaPrm.type  = type;
		if(value) {
			sdCharaPrm.value = value;
		}
		cmd.playComposeAttributeEffect(sdCharaPrm);
	};

	// 属性一括強化用キャラアニメーション
	ccommon.playComposeAttributeBulkEffect = function(abilityList) {
		var sdCharaPrm = {};
		sdCharaPrm.x = (common.displayWidth === 1024) ? 400 : 440;
		sdCharaPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) + 95 : Math.ceil(common.shortSize / 2) + 135;
		sdCharaPrm.abilityList = abilityList;
		cmd.playComposeAttributeEffect(sdCharaPrm);
	};

	ccommon.charaSelect = function(view) {
		$("#charaListElms .select").removeClass("select");
		common.addClass(view.el,'select');
		if( ccommon.charaListView && ccommon.charaListView.selectCardId != view.model.toJSON().userCardId) {
			ccommon.charaListView.selectCardId = view.model.toJSON().userCardId;

			ccommon.charaListView.charaDataView.model.clear({silent:true});
			ccommon.charaListView.charaImgView.model.clear({silent:true});

			ccommon.charaListView.charaDataView.model.set(view.model.toJSON());
			ccommon.charaListView.charaImgView.model.set(view.model.toJSON());

			cmd.getBaseData(common.getNativeObj());

			ccommon.checkCanEnhance();
			ccommon.addIdComposeAttributeBtn(); //属性強化リンク追加
		}
	};

	ccommon.checkCanEnhance = function(){
		if(common.doc.getElementById("btnArea") && ccommon.charaListView.charaDataView.model.toJSON().chara.enhancementGroupId){
			common.removeClass(common.doc.getElementById("btnArea").getElementsByClassName("enhance")[0],"off");
			if(common.historyArr[common.historyArr.length - 1].indexOf("CharaListTop") < 0){
				common.addClass(common.doc.getElementById("btnArea").getElementsByClassName("enhance")[0],"linkBtn");
				common.doc.getElementById("btnArea").getElementsByClassName("enhance")[0].dataset.href = "#/CharaEnhancementTree/" + ccommon.charaListView.charaDataView.model.toJSON().userCardId;
			}
		}else if(common.doc.getElementById("btnArea")){
			common.addClass(common.doc.getElementById("btnArea").getElementsByClassName("enhance")[0],"off");
		}
	};

	//属性強化ボタンにuserCardIdを追加する
	ccommon.addIdComposeAttributeBtn = function(){
		if(common.doc.getElementById("btnArea")){
			$('#btnArea .composeAttribute').attr('data-href', "#/CharaListComposeAttribute/" + ccommon.charaListView.charaDataView.model.toJSON().card.charaNo);
		}
	};

	return ccommon;
});
