define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'js/card/CardPopup',
	'command'
], function (_,Backbone,common,ajaxControl,popupSet,cmd) {
	'use strict';

	var CharaListPartsView = Backbone.View.extend({
		tagName : 'li',
		className: function() {
			var initialType = this.model.toJSON().chara.initialType;
			if(initialType.indexOf("_") > -1){
				initialType = initialType.split("_");
				initialType = initialType[initialType.length - 1];
			}

			var enhanced = (this.model.toJSON().chara.enhancementGroupId) ? "enhanced " : "";

			var classTxt = "userCharaIcon " +
						   this.model.toJSON().card.attributeId + " " +
						   this.model.toJSON().card.rank + " " +
						   initialType + " " + enhanced +
						   " userCardId" + this.model.toJSON().userCardId +
						   " charaId" + this.model.toJSON().charaId;

			if(this.model.toJSON().eventFlag) {
					classTxt += " eventChara";
			}

			return classTxt;
		},
		events : function(){
			var evtObj = {};
			evtObj[common.cgti] = this.charaSelect;
			evtObj.touchstart   = "popupTimeStart";

			return evtObj;
		},
		initialize: function() {
			this.listenTo(this.parentView,'remove',this.removeView);
			this.listenTo(this.model,'charaSelect',this.charaSelectFunc);
			this.listenTo(this.model,'change',this.render);
			this.listenTo(this.model,'change',this.charaObjKeyUpdate);

			// 覚醒した時に更新する用
			this.userCardId = this.model.toJSON().userCardId;
		},
		render : function(rendMode) {
			this.$el.html(this.template({model:this.model.toJSON()}));
			if(rendMode !== "init") cmd.getBaseData(common.getNativeObj());

			return this;
		},
		charaObjKeyUpdate : function() {

			if(
				this.userCardId !== this.model.toJSON().userCardId && 
				this.parentView.charaViews[this.userCardId]
			) {
				// 親のオブジェクトのキーを更新
				this.parentView.charaViews[this.model.toJSON().userCardId] = this.parentView.charaViews[this.userCardId];
				delete this.parentView.charaViews[this.userCardId];
				// 親の選択中IDを更新、このViewのuserCardIdを更新
				this.parentView.selectCardId = this.model.toJSON().userCardId;
				this.userCardId = this.model.toJSON().userCardId;
			}
		},
		popupTimeStart : function(e){
			if(common.patrolDeckList) return;//パトロールなら詳細みせない
			//詳細は見せない
			return;
			// カード詳細POPUP
			var closeEvent = null;
			if( common.location == "CharaListTop"        ||
				common.location == "CharaListCompose"    ||
				common.location == "CharaListLimitBreak" ||
				common.location == "CharaListCustomize"  ||
				common.location == "CharaListComposeMagia" ||
				common.location == "CharaListEquip" || 
				common.location == "CharaListComposeAttribute") {

				var ccommon = common.pageObj.charaCommon();
				var that = this;
				closeEvent = function() {
					ccommon.showMiniChara(that.model.toJSON().card.miniCharaNo,true);
					if(ccommon.charaImgView) {
						var cardJson = common.storage.userCardListEx.findWhere({id:ccommon.charaImgView.model.toJSON().id});
							cardJson = (cardJson) ? cardJson.toJSON() : {};
						ccommon.charaImgView.model.set({displayCardId:cardJson.displayCardId});
						cmd.getBaseData(common.getNativeObj());
					}
				};
			}

			popupSet.cardDetailPopup(e,this.model.toJSON(),closeEvent);
		},
		charaSelect: function(e) {
			e.preventDefault();
			popupSet.popupTimerStop(e);
			if(common.isScrolled()) return;

			if(!common.content.hasClass('hide')) {
				cmd.startSe("1002");
				this.charaSelectFunc();
			}
		},
		charaSelectFunc: function(sortFlag) {
			if(common.pageObj.charaSelect) {
				common.pageObj.charaSelect(this,sortFlag);
			}
			if(common.patrolDeckList){//遠征用
				// console.log(this.parentView.__proto__.rootView,this.parentView.rootView)
				if(this.parentView.rootView){//ルートに送る
					this.parentView.rootView.trigger("chara",this,sortFlag);
				}
			}
		},
		removeView: function() {
			this.off();
			this.remove();
		}
	});

	// todo cardPopupに機能追加
	function eventCharaCheck(charaModel, questBattleModel) {
		if(!charaModel.charaId)              return false;
		if(!questBattleModel)                return false;
		if(!questBattleModel.eventObj)       return false;
		if(!questBattleModel.eventObj.event) return false;

		if(!common.storage.gameUser) return false;
		if(common.storage.gameUser.toJSON().eventTrainingId !== questBattleModel.eventObj.event.eventId) return false;

		var eventCharaFlag = false;

		var charaId        = charaModel.charaId;
		var eventCharaIds  = common.storage.gameUser.toJSON().trainingSelectedCharaNos.split(",");

		// console.log(charaModel, questBattleModel);
		_.each(eventCharaIds,function(id) {
			if(charaId == id) {
				eventCharaFlag = true;
			}
		});

		return eventCharaFlag;
	}

	return CharaListPartsView;

});
