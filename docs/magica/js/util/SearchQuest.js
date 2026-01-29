define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	'text!template/util/SearchQuest.html',
	'text!css/util/SearchQuest.css',
	'QuestUtil',
	'js/view/quest/QuestListPartsView'
], function (_,Backbone,common,ajaxControl,cmd,pageTemp,css,questUtil,QuestListPartsView) {
	'use strict';

	var playedQuestId = null;

	var pageJson;
	var pageView;
	var PageView = Backbone.View.extend({
		initialize : function(options) {
			this.giftViews = [];
			this.template = _.template(pageTemp);
			this.createDom();
		},
		events: function() {
			var eventObj = {};
			eventObj[common.cgti + " .tabBtns li"] = this.tabFunc;

			// eventObj[common.cgti + " .orderTypeBtn"] = this.orderFunc;
			eventObj[common.cgti + " .orderBtn"]     = this.orderFunc;

			return eventObj;
		},
		render : function() {
			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		createDom: function() {

			// AP半減 ----------------------------------------------------------.
			var that = this;
			this.campaignData = null;
			this.halfAp       = null;
			if(pageJson.campaignList) {
				this.campaignData = common.campaignParse(pageJson.campaignList)
			}
			// ----------------------------------------------------------------.

			common.setGlobalView();

			// ページDOMの追加
			common.content.append(this.render().el);

			this.createView();
		},
		createView: function() {
			common.ready.hide();

			var that = this;

			QuestListPartsView.prototype.parentView = this;
			QuestListPartsView.prototype.template = _.template($("#QuestListParts").text());

			GiftView.prototype.parentView = this;
			GiftView.prototype.template = _.template($('#GiftParts').text());
			createDropItemMap();
			var giftList = pageJson.giftList;
			var flgmntNode01 = common.doc.createDocumentFragment();
			var flgmntNode02 = common.doc.createDocumentFragment();

			_.each(giftList,function(model) {
				// console.log(model)
				// if(model.id >= 600 ) return;

				// model.type{int}
				// 1:オーブ
				// 2:素材(ギフト)
				// 3:キモチ
				// 9:コラボ系(非表示)

				if(model.type === 9) return;

				model.quantity = 0;
				if(common.storage.userGiftList.findWhere({giftId:model.id})) {
					model.quantity = common.storage.userGiftList.findWhere({giftId:model.id}).toJSON().quantity;
				}
				var view = new GiftView({model: model});
				view.el.dataset.giftid     = model.id;
				view.el.dataset.scrollHash = model.id;

				that.giftViews.push(view);

				if(model.type === 1) {
					flgmntNode02.appendChild(view.render().el);
				} else {
					flgmntNode01.appendChild(view.render().el);
				}
			});
			common.doc.querySelector(".itemScrollInner .gift01").appendChild(flgmntNode01);
			common.doc.querySelector(".itemScrollInner .gift02").appendChild(flgmntNode02);

			if(common.searchQuestGiftId) {
				common.forceScrollPreset("itemScrollWrap","itemScrollInner",common.searchQuestGiftId,true);
			}

			common.scrollSet("itemScrollWrap","itemScrollInner",true);
			common.scrollSet("questScrollWrap","questScrollInner",true);

			this.orderInit();

			cmd.getBaseData(common.getNativeObj());

		},
		modelSend : function(e,sectionId,questId) {
			var _sectionId = null;
			var _questBattleId = null;
			if(e) {
				_sectionId = Number(e.currentTarget.parentNode.dataset.sectionid);
				_questBattleId = Number(e.currentTarget.parentNode.dataset.scrollHash);
			} else {
				_sectionId = sectionId;
				_questBattleId = questId;
			}
			// console.log(common.storage)
			var model = common.storage.userSectionList.findWhere({sectionId : _sectionId});
			if(!model) return false;

			var _model = model.toJSON();

			// 章
			var genericId = _model.section.genericId;
			var chapterModel = common.storage.userChapterList.findWhere({chapterId : Number(genericId)});
			if(chapterModel) {
				_model.section.chapterNoForView = chapterModel.toJSON().chapter.chapterNoForView;
				_model.section.chapter          = chapterModel.toJSON().chapter;
			}

			// クエスト
			var questModel = common.storage.userQuestBattleList.findWhere({"questBattleId":_questBattleId});
			if(questModel) {
				_model.questBattle = questModel.toJSON();

				// supportSelect用テキスト
				if (_model.section.questType == 'ENHANCEMENT_AROUSAL') {
					var enhanceText = {
						"FIRE"   : "火属性",
						"WATER"  : "水属性",
						"TIMBER" : "木属性",
						"LIGHT"  : "光属性",
						"DARK"   : "闇属性",
						"ALL"    : "全属性"
					};
					_model.questBattle.weekText = enhanceText[_model.section.parameter];
				}
			}

			return _model;
		},
		tabFunc: function(e,type) {
			var target = null;
			var showType = null;
			var hideType = null;
			if(e) {
				e.preventDefault();
				if(common.isScrolled()) return;
				cmd.startSe(1002);
				target = e.currentTarget;
				showType = e.currentTarget.dataset.type;
			} else if(type) {
				target = common.doc.querySelector('[data-type=' + type + ']');
				showType = type;
			}
			hideType = (showType == 'gift01') ? 'gift02' : 'gift01';

			common.removeClass(common.doc.querySelector('.tabBtns .current'),'current');
			common.addClass(target,'current');

			common.addClass(common.doc.querySelector('.'+hideType),'hide');
			common.removeClass(common.doc.querySelector('.'+showType),'hide');

			var titleTxt = (showType == 'gift01') ? '素材一覧' : 'オーブ・ブック一覧';
			common.doc.querySelector('#itemWrap h2').innerText = titleTxt;

			common.scrollRefresh("itemScrollWrap","itemScrollInner",true);
		},
		orderFunc: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			var sortPrm = common.sfml['SearchQuest'];
			if(e.currentTarget.classList.contains('orderTypeBtn')) { // 難易度・AP消費順
				var orderType = (sortPrm[0] == 'difficulty') ? 'ap' : 'difficulty';
				common.sfml['SearchQuest'][0] = orderType;
			} else { // 昇順・降順
				var order = (sortPrm[1] == 'asc') ? 'desc' : 'asc';
				common.sfml['SearchQuest'][1] = order;
			}
			common.sfm();
			this.orderInit();
			questListSort();
		},
		orderInit: function() {
			var sortPrm = common.sfml['SearchQuest'];

			// if(sortPrm[0] == 'difficulty') {
			// 	common.doc.querySelector('.orderTypeBtn').innerText = '難易度順';
			// } else {
			// 	common.doc.querySelector('.orderTypeBtn').innerText = '消費AP順';
			// }
			if(sortPrm[1] == 'asc') {
				common.doc.querySelector('.orderBtn').className = 'orderBtn TE se_tabs asc';
			} else {
				common.doc.querySelector('.orderBtn').className = 'orderBtn TE se_tabs desc';
			}
		}

	});

	var GiftView = Backbone.View.extend({
		className: 'gift',
		initialize: function() {
			this.listenTo(this.parentView,'removeGiftView',this.removeView);
		},
		events: function() {
			var evtObj = {};
			evtObj[common.cgti] = this.tapGift;
			return evtObj;
		},
		render: function() {
			this.$el.html(this.template({model:this.model}));
			return this;
		},
		tapGift: function(e) {
			var target = null;

			if(e) {
				e.preventDefault();
				if(common.isScrolled()) return;
				target = e.currentTarget;
				cmd.startSe(1002);
			} else {
				target = this.el;
			}

			if(pageView) {
				pageView.trigger('removeView');
			}

			console.log('tapGift')

			if(common.doc.querySelector("#itemWrap .select") == target) {
				common.removeClass(common.doc.querySelector("#itemWrap .select"),"select");
				common.removeClass(common.doc.querySelector("#questWrap .defaultText"),  "hide");
				common.addClass(common.doc.querySelector("#questWrap .questNoneText"),"hide");
				common.searchQuestGiftId = null;
			} else {
				common.removeClass(common.doc.querySelector("#itemWrap .select"),"select");
				common.addClass(target,"select");
				common.addClass(common.doc.querySelector("#questWrap .defaultText"),  "hide");
				common.addClass(common.doc.querySelector("#questWrap .questNoneText"),"hide");

				if(common.dropItemMap[this.model.id] && common.dropItemMap[this.model.id].length !== 0){
					createQuestList(this.model.id);

				} else {
					common.removeClass(common.doc.querySelector("#questWrap .questNoneText"),"hide");
				}
				common.searchQuestGiftId = this.model.id;
			}

		},
		removeView : function() {
			this.off();
			this.remove();
		}
	});

	var createQuestList = function(giftId) {
		// console.log('createQuestList',common.dropItemMap[giftId])
		var flgmntNode = common.doc.createDocumentFragment();
		_.each(common.dropItemMap[giftId],function(model,index) {
			var _model = model;
			var sectionModel = pageView.modelSend(null,_model.questBattle.sectionId,_model.questBattleId);
			var questType    = sectionModel.section.questType

			_model.searchViewObj = {};

			// 章
			if(sectionModel.section.chapter) {
				_model.searchViewObj.partNo = sectionModel.section.chapter.partNo;
				_model.searchViewObj.chapterNoForView = sectionModel.section.chapter.chapterNoForView;
				_model.searchViewObj.chapterId        = sectionModel.section.chapter.chapterId;
			}
			// 話 or セクションTitle
			_model.searchViewObj.title         = questType == 'ENHANCEMENT_AROUSAL' ? sectionModel.section.title : sectionModel.section.genericIndex+"話";

			// クエストタイトル
			_model.searchViewObj.questTitle = "BATTLE " + model.questBattle.sectionIndex;
			if (questType == 'ENHANCEMENT_AROUSAL') {
				switch(model.questBattle.sectionIndex) {
					case 1: _model.questClass = '初級'; break;
					case 2: _model.questClass = '中級'; break;
					case 3: _model.questClass = '上級'; break;
					case 4: _model.questClass = '超級'; break;
				}
				_model.questTitle = 'BATTLE ◆ '+ _model.questClass;
				_model.searchViewObj.questTitle = _model.questTitle;

				// supportSelect用テキスト
				var enhanceText = {
					"FIRE"   : "火属性",
					"WATER"  : "水属性",
					"TIMBER" : "木属性",
					"LIGHT"  : "光属性",
					"DARK"   : "闇属性",
					"ALL"    : "全属性"
				};
				_model.weekText = enhanceText[sectionModel.section.parameter];

				_model.questTypeText = '覚醒強化結界';
				_model.parameter = sectionModel.section.parameter;
			}

			// キャラ名
			if(questType == 'CHARA' && sectionModel.section.genericId) {
				var charaModel = common.storage.userCharaList.findWhere({charaId : sectionModel.section.genericId});
				_model.searchViewObj.chara = (charaModel) ? charaModel.toJSON().chara : {};
			}
			// キャラ名
			if(questType == 'COSTUME' && sectionModel.section.charaId) {
				var l2dCharaModel = common.storage.userCharaList.findWhere({charaId : sectionModel.section.charaId});
				if(l2dCharaModel) {
					var l2dId = (sectionModel.section.genericId + "").slice(-2);
					var l2dMaster = common.storage.userLive2dList.findWhere({charaId: sectionModel.section.charaId, live2dId: l2dId});
					var pushModel = l2dCharaModel.toJSON().chara;
					var pushL2dModel = l2dMaster.toJSON().live2d;
					_model.searchViewObj.chara = pushModel;
					_model.searchViewObj.live2d = pushL2dModel;
				}else{
					_model.searchViewObj.chara = {};
				}
			}
			// ターン制限
			if(_model.questBattle.limitTurn) {
				_model.searchViewObj.limitTurn = true;
			}

			// APと難易度
			_model.searchViewObj.ap = sectionModel.section.ap ? sectionModel.section.ap : model.questBattle.ap;
			_model.searchViewObj.difficulty = sectionModel.section.difficulty ? sectionModel.section.difficulty : model.questBattle.difficulty;
			if(_model.questBattle.questBattleType == 'HARD') {
				_model.searchViewObj.isHard     = true;
				_model.searchViewObj.ap         = model.questBattle.ap;
				_model.searchViewObj.difficulty = model.questBattle.difficulty;
			}

			if(pageView.campaignData && pageView.campaignData.HALF_AP) {
				_.each(pageView.campaignData.HALF_AP.questType ,function(targetQuestType, index) {
					if(targetQuestType == "MAIN" || targetQuestType == "SUB") {
						if(targetQuestType == sectionModel.section.questType &&
						   (pageView.campaignData.HALF_AP.chapterIds.indexOf(String(_model.searchViewObj.chapterId)) >= 0 ||
						   	pageView.campaignData.HALF_AP.chapterIds.length === 0)) {
							_model.searchViewObj.halfAp = Math.ceil(_model.searchViewObj.ap/2);
						}
					} else {
						if(targetQuestType === "ALL" || targetQuestType == sectionModel.section.questType) {
							_model.searchViewObj.halfAp = Math.ceil(_model.searchViewObj.ap/2);
						}
					}
				});
			}

			var view = new QuestListPartsView({model: _model});
			view.el.dataset.scrollHash = _model.questBattleId;
			view.el.dataset.sectionid  = _model.questBattle.sectionId;

			view.el.dataset.difficulty = _model.searchViewObj.difficulty;
			view.el.dataset.ap         = _model.searchViewObj.ap;

			if(questType == 'MAIN') {
				if(_model.questBattle.questBattleType == 'HARD') {
					common.addClass(view.el,"mainHard");
				} else {
					common.addClass(view.el,"main");
				}
				common.addClass(view.el,"season"+_model.searchViewObj.partNo);

			} else if(questType == 'SUB') {
				common.addClass(view.el,"side");
			} else if(questType == 'CHARA') {
				common.addClass(view.el,"chara");
			} else if(questType == 'COSTUME') {
				common.addClass(view.el,"costume");
			} else if(questType == 'ENHANCEMENT_AROUSAL') {
				common.addClass(view.el,"enhancement");
			}

			if(_model.searchViewObj.halfAp) {
				view.model.halfAp = _model.searchViewObj.halfAp;
				common.addClass(view.el,"halfAp");
			}

			flgmntNode.appendChild(view.render().el);
		});
		common.doc.querySelector(".questScrollInner").appendChild(flgmntNode);

		questListSort();

		if(!common.charaListCustomizeSelectId && !common.charaListComposeMagiaSelectId) {
			if(common.searchQuestGiftId && playedQuestId) {
				common.forceScrollPreset("questScrollWrap","questScrollInner",playedQuestId,true);
				playedQuestId = null;
				common.historyArr = ['MyPage','ItemListTop','SearchQuest'];
			}
		} else if(common.charaListCustomizeSelectId) {
			common.historyArr = ["MyPage","CharaListCustomize/"+common.charaListCustomizeSelectId,"SearchQuest"];
		} else if(common.charaListComposeMagiaSelectId) {
			common.historyArr = ["MyPage","CharaListComposeMagia/"+common.charaListComposeMagiaSelectId,"SearchQuest"];
		}

		common.scrollRefresh("questScrollWrap","questScrollInner",true);
	}

	var createDropItemMap = function() {
		common.dropItemMap = {};
		var cnt = 0;
		_.each(pageJson.userQuestBattleList,function(questModel,index) {
			var _sectionId = questModel.questBattle.sectionId;
			// 6万版代：衣装ストーリー
			if((_sectionId >= 400000 && _sectionId < 400070) || (_sectionId >= 500000 && _sectionId < 700000) || _sectionId >= 800000) return;

			var i = 1;
			while(i <= 10) {
				if(questModel.questBattle['dropItem'+i]) {
					_.each(questModel.questBattle['dropItem'+i],function(giftId,key) {
						if(key.indexOf('rewardCode') == -1) return;
						var fileName = giftId.split('_')[1]
						if(!common.dropItemMap[fileName]) common.dropItemMap[fileName] = [];
						if(questModel.cleared) {
							common.dropItemMap[fileName].push(questModel)
						}
					});
				}

				i=(i+1)|0;
			}
			cnt++;
		});

		for(var key in common.dropItemMap) {
			common.dropItemMap[key] = _.unique(common.dropItemMap[key]);
		}

		// console.log(cnt)
		console.log(common.dropItemMap)
	};

	var questListSort = function() {
		var sortPrm = common.sfml['SearchQuest'];
		var ascNum = (sortPrm[1] === "asc") ? -1 : 1;

		var orderCnt  = 0;
		var container = common.doc.querySelector(".questScrollInner");

		[].slice.call(container.querySelectorAll('.quest'))
			.map(function(v){
				var param = v.dataset;
				return { dom: v, param: param};
			})
			.sort(function(a,b){
				if(sortPrm[0] == "ap"){
					// レア度順
					if(Number(b.param.ap) < Number(a.param.ap)) return -1 * ascNum;
					if(Number(b.param.ap) > Number(a.param.ap)) return 1 * ascNum;

				}else if(sortPrm[0] == "difficulty"){
					// レベル順
					if(Number(b.param.difficulty) < Number(a.param.difficulty)) return -1 * ascNum;
					if(Number(b.param.difficulty) > Number(a.param.difficulty)) return 1 * ascNum;
				}

				// レベル順
				if(Number(b.param.scrollHash) < Number(a.param.scrollHash)) return -1 * ascNum;
				if(Number(b.param.scrollHash) > Number(a.param.scrollHash)) return 1 * ascNum;
				return 0;
			})
			.forEach(function(v){
				v.dom.style.WebkitOrder = orderCnt;
				v.dom.style.order       = orderCnt;
				orderCnt = (orderCnt + 1) | 0;
			});
	}

	var init = function(){
		common.mainQuestMode = 'NORMAL';

		if(!common.sfml['SearchQuest']) {
			common.sfml['SearchQuest'] = ['ap','desc'];
			common.sfm();
		}

		common.setStyle(css);
		pageJson = ajaxControl.getPageJson();
		pageView = new PageView();

		questUtil.supportPickUp(pageJson);

		// 初期タブ・初期ギフト
		if(common.searchQuestGiftId) {
			if(Number(common.searchQuestGiftId) < 300 || Number(common.searchQuestGiftId) == 551) {
				pageView.tabFunc(null,'gift02');
			} else {
				pageView.tabFunc(null,'gift01');
			}

			console.log(common.searchQuestGiftId)

			var targetView = _.find(pageView.giftViews,function(view){
				return view.model.id == common.searchQuestGiftId;
			});

			if(targetView) {
				targetView.tapGift();
			} else {
				pageView.tabFunc(null,'gift01');
				common.searchQuestGiftId = null;
			}
		} else {
			pageView.tabFunc(null,'gift01');
		}
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
			{id:"userStatusList"},
			{id:"userCharaList"},
			{id:"userCardList"},
			{id:"userDoppelList"},
			{id:"itemList"},
			{id:"userItemList"},
			{id:"giftList"},
			{id:"userGiftList"},
			{id:"userDailyChallengeList"},
			{id:"userTotalChallengeList"},
			{id:"userLimitedChallengeList"},
			{id:"userPieceList"},
			{id:"userPieceSetList"},
			{id:"userDeckList"},
			{id:"userLive2dList"},
			{id:"userFollowList"},
			{id:"userChapterList"},
			{id:"userSectionList"},
			{id:"userQuestBattleList"},
			{id:"userQuestAdventureList"}

		],
		fetch : function(questId){
			if(questId) playedQuestId = questId;

			ajaxControl.pageModelGet(this.needModelIdObj);
		},
		init : function() {
			init();
		},
		startCommand : function(){
			cmd.startBgm('bgm01_anime07');
			cmd.changeBg('web_common.ExportJson');
		},
		remove : function(callback){
			if(pageView) {
				pageView.trigger('removeView');
				pageView.trigger('removeGiftView');
				pageView.remove();
			}
			playedQuestId = null;
			callback();
		}
	};
});
