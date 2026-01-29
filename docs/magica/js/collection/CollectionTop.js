define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/collection/CollectionTop.html',
	//'text!css/collection/CollectionTop.css'
], function (
	_,Backbone,common,ajaxControl,cmd
	//pageTemp,css
) {
	'use strict';

	var pageJson = {};
	var pageView;
	var PageView = Backbone.View.extend({
		events : function(){
			var evtObj = {};
			evtObj[common.cgti] = this.touch;
			evtObj[common.cgti + " #globalBackBtn"]   = this.tapGlobalBackBtn;
			return evtObj;
		},
		tapGlobalBackBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/TopPage';
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempCollectionTop').innerText
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
			common.ready.hide();
		}
	});

	var init = function(){
		pageJson = ajaxControl.getPageJson();
		//common.setStyle(css);
		pageView = new PageView();

		var charaArr = pageJson.userCharaList;
		var randomChara = charaArr[Math.floor(Math.random() * charaArr.length)];

		live2dShow(randomChara.charaId,randomChara.chara.doubleUnitFlg,randomChara.chara.doubleUnitLive2dDetail);
	};

	var live2dShow = function(charaId,doubleUnit,dUnitId) {
		var _charaId = charaId + "00";

		cmd.endL2d();

		var l2dPrm = {};
		l2dPrm.id = _charaId;
		l2dPrm.x = (!doubleUnit) ? 320 : 480;
		l2dPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) : Math.ceil(common.shortSize / 2);
		if(doubleUnit){
			l2dPrm.subId = dUnitId;
			l2dPrm.subX = -100;
			l2dPrm.subY = 0;
		}

		l2dPrm.type = 1;
		l2dPrm.key  = "idle";

		cmd.startL2d(l2dPrm);
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
			{id:"userCharaList"},
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
		remove : function(callback){
			if(pageView) pageView.remove();
			callback();
		},
		startCommand : function(){
			cmd.changeBg('web_0015.ExportJson');
			cmd.startBgm('bgm02_anime11');

		},
		removeCommand : function(){
			cmd.endL2d();
		}
	};
});