define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	'js/view/chara/CharaListPartsView',
	//'text!template/chara/CharaList.html',
	//'text!template/chara/CharaListParts.html',
	'sortUtil'
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	cmd,
	CharaListPartsView,
	//temp,
	//partsTemp,
	CardSort
) {
	'use strict';

	var CharaList = Backbone.View.extend({
		id: "charaListWrap",
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + ' #sortPopup'] = this.sortPop;
			evtObj[common.cgti + ' #sortBtn']   = this.sortStart;
			evtObj[common.cgti + ' .orderBtn']  = this.sortOrder;

			return evtObj;
		},
		initialize : function(options) {
			this.listenTo(this,'remove',this.removeView);

			this.template = _.template(
				common.doc.getElementById('tempCharaList').innerText
			);

			CharaListPartsView.prototype.template   = _.template(
				common.doc.getElementById('tempCharaListParts').innerText
			);
			CharaListPartsView.prototype.parentView = this;

			this.cardSort = new CardSort("CharaTop_chara",this);

			this.charaViews       = {};
			this.selectCardId     = null;
			this.initSelectCardId = null;
		},
		charaSelect:function(cardId,sortFlag) {
			if(cardId) {
				_.each(this.charaViews,function(view) {
					if(cardId == view.model.toJSON().userCardId) {
						view.charaSelectFunc(sortFlag);
					}
				});
				this.selectCardId = cardId;
			}
		},
		filterFunc : function() {
			if(this.cardSort) {
				var selectId = null;
				var isSelectHidden = false; // 選択中の魔法少女が非表示かどうかフラグ

				// フィルター処理
				var i = 0;
				var attFilter  = this.cardSort.getFilterType();
				var rankFilter = this.cardSort.getFilterRare();
				var enhanceFilter = this.cardSort.getFilterEnhance();
				var initialFilter = this.cardSort.getFilterInitial();
				var composeAttributeFilter = this.cardSort.getFilterComposeAttribute();
				var attArr  = (attFilter) ? attFilter.split(",") : [];
				var rankArr = (rankFilter) ? rankFilter.split(",") : [];
				var initialArr = (initialFilter) ? initialFilter.split(",") : [];
				var composeAttributeArr = (composeAttributeFilter) ? composeAttributeFilter.split(",") : [];

				var that = this;

				_.each(this.charaViews,function(view) {
					var viewAttFlag = false;
					var viewRankFlag = false;
					var viewEnhanceFlag = false;
					var viewInitialFlag = false;
					var viewComposeAttributeFlag = false;

					if(attArr.length) {
						_.each(attArr,function(att) {
							if(view.el.classList.contains(att)) viewAttFlag = true; // パラメータにある属性だけ表示
						});
					} else {
						viewAttFlag = true; // 全表示
					}

					if(rankArr.length) {
						_.each(rankArr,function(rank) {
							if(view.el.classList.contains(rank)) viewRankFlag = true; // パラメータにあるレアだけ表示
						});
					} else {
						viewRankFlag = true; // 全表示
					}

					if(enhanceFilter) {
						if(enhanceFilter === "enable" && view.el.classList.contains("enhanced")){
							viewEnhanceFlag = true; // 精神強化解放済みの場合表示
						}else if(enhanceFilter === "disable" && !view.el.classList.contains("enhanced")){
							viewEnhanceFlag = true; // 精神強化未解放の場合表示
						}
					} else {
						viewEnhanceFlag = true; // 全表示
					}

					if(initialArr.length) {
						_.each(initialArr,function(initial) {
							if(view.el.classList.contains(initial)) viewInitialFlag = true; // パラメータにあるタイプだけ表示
						});
					} else {
						viewInitialFlag = true; // 全表示
					}

					if(composeAttributeFilter) {
						_.each(composeAttributeArr,function(atb) {
							if(view.el.classList.contains(atb)) viewAttFlag = true; // パラメータにある属性だけ表示
						});
					} else {
						viewComposeAttributeFlag = true; // 全表示
					}

					if(viewAttFlag && viewRankFlag && viewEnhanceFlag && viewInitialFlag && viewComposeAttributeFlag ||
					   view.el.classList.contains("formationRemove") ||
					   view.el.classList.contains("formationCurrent")) {
						common.removeClass(view.el,"hide");
						if(!selectId) selectId = view.model.toJSON().userCardId;
					} else {
						common.addClass(view.el,"hide");
						if(!that.selectCardId || that.selectCardId == view.model.toJSON().userCardId) {
							isSelectHidden = true;
						}
					}
				});

				if(attArr.length || rankArr.length || enhanceFilter || initialArr.length || composeAttributeArr.length) {
					common.addClass(common.doc.querySelector('#sortPopup'),'filterOn');
				} else {
					common.removeClass(common.doc.querySelector('#sortPopup'),'filterOn');
				}
				if(this.cardSort.memoryHash) {
					common.sfml[this.cardSort.memoryHash] = this.cardSort.sortPrm;
					common.sfm();
				}
			}

			// 該当の魔法少女がいない時のテキスト表示 ---------------------------------.
			var showDomCnt = 0;
			_.each(this.el.querySelectorAll(".userCharaIcon"),function(dom) {
				if(!dom.classList.contains("hide")) showDomCnt++;
			});
			if(showDomCnt == 0) {
				common.removeClass(common.doc.querySelector(".charaListCaution"),"hide");
			} else {
				common.addClass(common.doc.querySelector(".charaListCaution"),"hide");
			}
			// ----------------------------------------------------------------.

			var that = this;
			if(this.initSelectCardId) { // 初期指定があれば
				that.charaSelect(this.initSelectCardId,true);
				that.initSelectCardId = null;
			} else if(!this.selectCardId || // 指定がなければ
					   this.selectCardId && this.charaViews[this.selectCardId].el.classList.contains('hide')) { // 選択されている魔法少女がhideされてたら
				var selectId = null;
				_.each(this.el.querySelectorAll("#charaListElms li"),function(dom,index) {
					// hideされてない最初の魔法少女を選択
					if(!selectId && !(dom.classList.contains('hide'))) {
						selectId = dom.querySelector(".prm_userCardId").textContent;
						that.charaSelect(selectId,true);
					}
				});
				if(!selectId) { // 全員hideだったら
					_.each(this.el.querySelectorAll("#charaListElms li"),function(dom,index) {
						// hideされてない最初の魔法少女を選択
						if(!selectId) {
							selectId = dom.querySelector(".prm_userCardId").textContent;
							that.charaSelect(selectId,true);
						}
					});
				}
			}

			common.scrollRefresh();
		},
		render : function() {
			var flgmntNode = common.doc.createDocumentFragment();
			var that = this;

			this.$el.html(this.template({model:this.model.toJSON()}));

			this.collection.each(function(model,index) {
				var _opendPointList = common.storage.userCharaEnhancementCellList.where({ charaId: model.get("charaId") });
				model.set({enhanceCnt : _opendPointList.length ? _opendPointList.length-1 : 0});

				var view = new CharaListPartsView({model: model});
				that.charaViews[model.toJSON().userCardId] = view;

				flgmntNode.appendChild(view.render("init").el);
			});

			this.el.querySelector("#charaListElms").appendChild(flgmntNode);

			cmd.getBaseData(common.getNativeObj());

			return this;
		},
		sortPop: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			this.cardSort.sortPopupOpen(e);
		},
		sortStart: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			var sortKeyObj = {
				"get"      : "level",
				"level"    : "rank",
				"rank"     : "atk",
				"atk"      : "def",
				"def"      : "hp",
				"hp"       : "eplv",
				"eplv"     : "rev",
				"rev"      : "mlv",
				"mlv"      : "enhance",
				"enhance"  : "composeAttribute",
				"composeAttribute"  : "get"
			};

			this.cardSort.sortPrm[0] = sortKeyObj[this.cardSort.sortPrm[0]];
			this.cardSort.multiSort(this.cardSort.sortPrm);
		},
		sortOrder: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			if(this.cardSort.getAscId() === "asc"){
				this.cardSort.sortPrm[1] = 'desc';
			}else{
				this.cardSort.sortPrm[1] = 'asc';
			}

			this.cardSort.ascSort(this.cardSort.sortPrm[1]);
		},
		removeView: function() {
			// console.log("removeView");
			this.off();
			this.remove();
		}
	});

	return CharaList;
});
