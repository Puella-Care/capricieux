define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	'cardUtil',
	//'text!template/collection/CharaCollection.html',
	//'text!css/collection/CharaCollection.css',
	'js/view/collection/CollectionDetailView'
], function (
	_,Backbone,common,ajaxControl,cmd,cardUtil,
	//pageTemp,css,
	DetailView
) {
	'use strict';

	var Model = Backbone.Model.extend();

	var pageView;
	var pageJson;

	var PageView = Backbone.View.extend({
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempCharaCollection').innerText
			);
			this.createDom();
		},
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + " .tabBtns li"] = this.tabFunc;
			evtObj[common.cgti + " #globalBackBtn"]   = this.tapGlobalBackBtn;
			return evtObj;
		},
		tapGlobalBackBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/CollectionTop';
		},
		render : function() {
			// console.log("render",ajaxControl.getPageJson());
			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		createDom: function() {
			// ページDOMの追加
			common.content.append(this.render().el);

			DetailView.prototype.parentView = this;
			CharaView.prototype.parentView = this;
			CharaView.prototype.template =_.template($("#CharaTemp").text());

			var flgmntNode = common.doc.createDocumentFragment();
			_.each(pageJson.charaList,function(model,index) {

				if(!model.chara) {
					model.chara = common.storage.userCharaList.findWhere({charaId:model.charaId}).toJSON().chara;
				}

				if(model.chara.enemyFlg) return;

				model.charaOpenFlag = false;

				_.each(model.cardList,function(_model, index) {
					if(common.storage.userCardList.findWhere({id:_model.userCardId})) {
						_model.card     = common.storage.userCardList.findWhere({id:_model.userCardId}).toJSON().card;
						_model.openFlag = true;
						_model.rankNum  = Number(_model.card.rank.split("_")[1]);

						var currentCardModel = common.storage.userCardListEx.findWhere({id:_model.userCardId});

						model.currentCard = (currentCardModel) ? currentCardModel.toJSON() : {};
						model.charaOpenFlag = true;
					} else {
						_model.rankNum  = Number(_model.card.rank.split("_")[1]);
						_model.openFlag = false;
					}
				});

				var view = new CharaView({model:model});
				flgmntNode.appendChild(view.render().el);
			});
			common.doc.querySelector("#charaWrapInner").appendChild(flgmntNode);
			cmd.getBaseData(common.getNativeObj());

			common.scrollSet("charaHiddenWrap","charaWrapInner");

			common.ready.hide();
		},
		tabFunc : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			var att = e.currentTarget.getAttribute("data-att").toLowerCase();
			var charaWrap = common.doc.querySelector("#charaWrap");
			charaWrap.className = att + " commonFrame2";

			common.removeClass(common.doc.querySelector(".tabBtns .current"),"current");
			common.addClass(e.currentTarget,"current");

			common.scrollRefresh(null,null,true);
			cmd.stopVoice();
		}
	});

	var CharaView =  Backbone.View.extend({
		className: function() {
			var classTxt = "chara commonFrame4 se_decide ";
			classTxt += this.model.chara.attributeId;
			return classTxt;
		},
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + ""] = this.tapFunc;
			return evtObj;
		},
		render : function() {
			this.$el.html(this.template({model:this.model}));
			return this;
		},
		tapFunc : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			if(!this.model.charaOpenFlag) return;
			if(common.detailView) common.detailView = null;

			var cardId = this.model.currentCard.cardId;
			var chara = this.model.currentCard.chara;
			var maxRevision = this.model.currentCard.maxRevision;

			var maxLevel = this.model.currentCard.maxLevel;

			// console.log("tapFunc:",this.model);
			this.model.maxStatus = cardUtil.getAfterParam(cardId,chara,maxRevision,maxLevel);

			common.detailView = new DetailView({model: new Model(this.model)});

			// 表示を切り替える
			common.doc.querySelector("#baseContainer").appendChild(common.detailView.render().el);
			common.addClass(common.doc.querySelector("#mainContent"),"hide");
			common.addClass(common.doc.querySelector("#globalMenuContainer"),"hide");

			// ボイスボタンの非表示
			voiceBtnViewChange(this.model);

			cmd.getBaseData(common.getNativeObj());
			common.scrollSet("hiddenWrap","scrollInner");

		}
	});

	var voiceBtnViewChange = function(model) {
		var cardModel    = model.currentCard;
		var episodeLevel = cardModel.episodeLevel;
		var magiaLevel   = cardModel.magiaLevel;
		var rank         = Number(cardModel.card.rank.split("_")[1]) || 0;
		var revision     = cardModel.revision;

		if(episodeLevel >= 2) {
			common.removeClass(common.doc.querySelector('[data-voice="15"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="37"]'),"off");
		}
		if(episodeLevel >= 3) {
			common.removeClass(common.doc.querySelector('[data-voice="38"]'),"off");
		}
		if(episodeLevel >= 4) {
			common.removeClass(common.doc.querySelector('[data-voice="39"]'),"off");
		}
		if(episodeLevel >= 5) {
			common.removeClass(common.doc.querySelector('[data-voice="40"]'),"off");
		}

		if(rank >= 3) {
			common.removeClass(common.doc.querySelector('[data-voice="20"]'),"off");
		}
		if(rank >= 4) {
			common.removeClass(common.doc.querySelector('[data-voice="21"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="44"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="64"]'),"off");
		}
		if(rank >= 5) {
			common.removeClass(common.doc.querySelector('[data-voice="22"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="45"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="65"]'),"off");
		}
		if(rank >= 6) {
			common.removeClass(common.doc.querySelector('[data-voice="23"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="46"]'),"off");
			common.removeClass(common.doc.querySelector('[data-voice="66"]'),"off");
		}

		if(magiaLevel >= 2) {
			common.removeClass(common.doc.querySelector('[data-voice="19"]'),"off");
		}

		if(revision >= 1) {
			common.removeClass(common.doc.querySelector('[data-voice="16"]'),"off");
		}
		if(revision >= 2) {
			common.removeClass(common.doc.querySelector('[data-voice="17"]'),"off");
		}
		if(revision >= 3) {
			common.removeClass(common.doc.querySelector('[data-voice="18"]'),"off");
		}
	};

	var init = function(){
		cardUtil.createCardList();
		//common.setStyle(css);
		pageJson = ajaxControl.getPageJson();
		pageView = new PageView();
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
			{id:"charaList"},
			{id:"userDeckList"},
			{id:"userCharaList"},
			{id:"userCardList"},
			{id:"userDoppelList"},
			{id:"userLive2dList"},
			{id:"userPieceList"},
			{id:"userPieceSetList"},
		],
		fetch : function(){
			ajaxControl.pageModelGet(
				this.needModelIdObj,
				null,
				'noConnect'
			);
		},
		init : function() {
			init();
		},
		startCommand: function() {
			cmd.changeBg('web_0015.ExportJson');
		},
		remove : function(callback){
			cmd.stopVoice();
			if(common.detailView) common.detailView = null;
			if(pageView) pageView.remove();
			callback();
		}
	};
});