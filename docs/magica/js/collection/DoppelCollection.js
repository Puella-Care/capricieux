define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/collection/DoppelCollection.html',
	//'text!css/collection/DoppelCollection.css',
	'command',
], function (
	_,Backbone,common,ajaxControl,
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
			evtObj[common.cgti + " #doppelBackBtn"] = this.backLinkHandler;
			return evtObj;
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempDoppelCollection').innerText
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

			DoppelPartsView.prototype.parentView = this;
			DoppelPartsView.prototype.template = _.template($("#DoppelPartsTemp").text());
			DoppelDetailView.prototype.parentView = this;
			DoppelDetailView.prototype.template = _.template($("#DoppelDetailTemp").text());

			// ドッペルリスト作成
			var flgmntNode = common.doc.createDocumentFragment();
			_.each(pageJson.doppelList,function(model,index) {
				model.description = model.description.replace(/＠/g, "<br>");

				var doppelModel = common.storage.userDoppelList.findWhere({doppelId:model.id});
				if(doppelModel) {
					var view = new DoppelPartsView({model: new Model(model)});
				} else {
					var noneModel = {
						id: null
					}
					var view = new DoppelPartsView({model: new Model(noneModel)});
				}
				flgmntNode.appendChild(view.render().el);
			});
			common.doc.querySelector(".doppelListInner").appendChild(flgmntNode);

			// console.log('userDoppelList:',common.storage.userDoppelList);

			// ドッペル数を表示
			var doppelCount = 0;
			common.storage.userDoppelList.each(function(model,index){
				if(model.toJSON().doppel.archive) doppelCount++;
			});
			common.doc.querySelector(".hasNum").textContent = doppelCount;// debug
			common.doc.querySelector(".totalNum").textContent = pageJson.doppelList.length;

			common.scrollSet('doppelList','doppelListInner');
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
				common.doc.querySelector("#doppelListWrap").className = "show";
				common.doc.querySelector("h1").className = "show";
				common.doc.querySelector("#doppelDetailWrap").className = "hide";
				doppelDetailView.remove();
				return;
			}
			//遷移
			location.href = '#/CollectionTop';
		}
	});

	var DoppelPartsView = Backbone.View.extend({
		className: "doppel se_decide",
		events: function() {
			var evtObj = {};
			evtObj[common.cgti] = this.doppelDetailShow;
			return evtObj;
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			return this;
		},
		doppelDetailShow: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			if(!this.model.toJSON().id) return;

			common.doc.querySelector("#doppelBackBtn").setAttribute("data-noLink",true);

			common.doc.querySelector("#doppelListWrap").className = "hide";
			common.doc.querySelector("h1").className = "hide";
			common.doc.querySelector("#doppelDetailWrap").className = "show";

			doppelDetailView = new DoppelDetailView({model: this.model});
			common.doc.querySelector("#doppelDetailWrap").appendChild(doppelDetailView.render().el);

			cmd.getBaseData(common.getNativeObj());

			// console.log(this.model.toJSON());
		}
	});

	var doppelDetailView;
	var DoppelDetailView = Backbone.View.extend({
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
			{id:"doppelList"},
			{id:"userDoppelList"},
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
			cmd.changeBg("web_0010.jpg");
			cmd.startBgm('bgm02_anime07');

		},
		remove : function(callback){
			if(pageView) pageView.remove();
			callback();
		}
	};
});