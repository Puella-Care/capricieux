define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/collection/EnemyCollection.html',
	//'text!css/collection/EnemyCollection.css',
	'command',
], function (_,Backbone,common,ajaxControl,
	//pageTemp,css,
	cmd
) {
	'use strict';

	var pageJson;
	var Model = Backbone.Model.extend();

	var pageView;
	var PageView = Backbone.View.extend({
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + " #enemyBackBtn"] = this.backLinkHandler;
			return evtObj;
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempEnemyCollection').innerText
			);
			this.createDom();
		},
		render : function() {
			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		createDom: function() {
			// ページDOMの追加
			common.content.append(this.render().el);

			EnemyPartsView.prototype.parentView = this;
			EnemyPartsView.prototype.template = _.template($("#EnemyPartsTemp").text());
			EnemyDetailView.prototype.parentView = this;
			EnemyDetailView.prototype.template = _.template($("#EnemyDetailTemp").text());

			// ドッペルリスト作成
			var flgmntNode = common.doc.createDocumentFragment();
			_.each(pageJson.enemyList,function(model,index) {
				var enemyModel = pageJson.userEnemyList.filter(function(_model){
					return (model.enemyId == _model.enemyId);
				});
				if(enemyModel.length) {
					enemyModel = enemyModel[0].enemy;
					if(enemyModel.description) {
						enemyModel.description = model.description.replace(/＠/g, "<br>");
					}
				} else {
					enemyModel = {
						enemyId : model.enemyId,
						type    : model.type || 1,
						isClose : true
					}
				}
				enemyModel.idText = ('00' + model.enemyId).slice(-3);
				var view = new EnemyPartsView({model: new Model(enemyModel)});
				flgmntNode.appendChild(view.render().el);
			});
			common.doc.querySelector(".enemyListInner").appendChild(flgmntNode);
			common.scrollSet('enemyList','enemyListInner');
			common.scrollRefresh();
			cmd.getBaseData(common.getNativeObj());
			common.ready.hide();
		},
		backLinkHandler : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			//data-noLinkがtrueで設定されている場合は一度目はリンクさせない。(戻るボタンに機能置きたい時用)
			if(e.currentTarget.getAttribute("data-noLink") === "true"){
				e.currentTarget.setAttribute("data-noLink","");
				common.doc.querySelector("#enemyListWrap").className = "show";
				common.doc.querySelector("h1").className = "show";
				common.doc.querySelector("#enemyDetailWrap").className = "hide";
				enemyDetailView.remove();
				return;
			}
			location.href = '#/CollectionTop';
		}
	});

	var enemyTypeArr = {
		1: 'witch',
		2: 'satellite',
		3: 'rumor'
	};
	var EnemyPartsView = Backbone.View.extend({
		className: function(){
			var classTxt = 'se_decide enemy ';
			if(this.model.toJSON().type) {
				classTxt += enemyTypeArr[this.model.toJSON().type];
			}
			return classTxt;
		},
		events: function() {
			var evtObj = {};
			evtObj[common.cgti] = this.enemyDetailShow;
			return evtObj;
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			return this;
		},
		enemyDetailShow: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			if(this.model.toJSON().isClose) return;

			common.doc.querySelector("#enemyBackBtn").setAttribute("data-noLink",true);

			common.doc.querySelector("#enemyListWrap").className = "hide";
			common.doc.querySelector("h1").className = "hide";
			common.doc.querySelector("#enemyDetailWrap").className = "show";

			enemyDetailView = new EnemyDetailView({model: this.model});
			common.doc.querySelector("#enemyDetailWrap").appendChild(enemyDetailView.render().el);

			cmd.getBaseData(common.getNativeObj());

			// console.log(this.model.toJSON());
		}
	});

	var enemyDetailView;
	var EnemyDetailView = Backbone.View.extend({
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			return this;
		}
	});

	var init = function(){
		pageJson = ajaxControl.getPageJson();

		//common.setStyle(css);
		if(common.globalMenuView) {
			common.globalMenuView.remove();
			common.globalMenuView = null;
		}
		pageView = new PageView();
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
			{id:"userStatusList"},
			{id:"enemyList"},
			{id:"userEnemyList"},
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
		startCommand : function(){
			cmd.changeBg("web_0010.jpg");
			cmd.startBgm('bgm03_story14');
		},
		remove : function(callback){
			if(pageView) {
				pageView.trigger('remove');
				pageView.remove();
			}
			callback();
		}
	};
});