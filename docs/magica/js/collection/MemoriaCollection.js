define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/collection/MemoriaCollection.html',
	//'text!css/collection/MemoriaCollection.css',
	'js/memoria/MemoriaPopup',
	'cardUtil'
], function (
	_,Backbone,common,ajaxControl,cmd,
	//pageTemp,css,
	popupSet,cardUtil
) {
	'use strict';

	var pageView;
	var PageView = Backbone.View.extend({
		events: function() {
			var evtObj = {};
			// メモリア表示サイズ変更ボタン
			evtObj[common.cgti + ' #sizeChange'] = this.sizeChange;
			evtObj[common.cgti + " #globalBackBtn"]   = this.tapGlobalBackBtn;
			return evtObj;
		},
		tapGlobalBackBtn : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			location.href = '#/CollectionTop';
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempMemoriaCollection').innerText
			);
			this.createDom();
		},
		render : function() {

			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		createDom: function() {
			this.model = ajaxControl.getPageJson();
			common.content.append(this.render().el);

			this.createView();
		},
		createView: function() {
			MemoriaView.prototype.parentView = this;
			MemoriaView.prototype.template = _.template($("#MemoriaListParts").text());

			var that = this;
			var openCnt = 0;
			var flgmntNode = common.doc.createDocumentFragment();
			_.each(this.model.pieceList,function(model,index) {
				var _model;
				// 持ってるかの確認
				var isHad = _.findWhere(that.model.userPieceCollectionList,{pieceId:model.pieceId});

				_model = (!isHad) ? model : isHad;
				if(isHad){
					_model.openFlag = (isHad) ? true : false;

					// イベント特効を追記
					if(cardUtil.memoriaEventCheck(_model)) {
						_model = cardUtil.memoriaEventCheck(_model);
					}

					openCnt++;
				}

				var view = new MemoriaView({model: _model});
				flgmntNode.appendChild(view.render().el);
			});

			common.doc.querySelector("#memoriaWrapInner").appendChild(flgmntNode);
			cmd.getBaseData(common.getNativeObj());

			common.doc.getElementById("info_memoriaCount").innerText = openCnt;
			common.doc.getElementById("info_memoriaCapacity").innerText = this.model.pieceList.length;

			common.scrollSet("memoriaScrollWrap","memoriaWrapInner");

			common.ready.hide();
		},
		sizeChange : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var dom = common.doc.getElementById("memoriaWrap");
			var key = e.currentTarget.dataset.size;
			switch(key){
				case "smaller" :
					common.addClass(dom,"smaller");
					e.currentTarget.dataset.size = "smallest";
					common.addClass(e.currentTarget,"smaller");
					break;
				case "smallest" :
					common.removeClass(dom,"smaller");
					common.addClass(dom,"smallest");
					e.currentTarget.dataset.size = "normal";
					common.removeClass(e.currentTarget,"smaller");
					common.addClass(e.currentTarget,"smallest");
					break;
				default :
					common.removeClass(dom,"smallest");
					e.currentTarget.dataset.size = "smaller";
					common.removeClass(e.currentTarget,"smallest");
					break;
			}

			common.scrollRefresh();
		},
		removeView : function(){
			this.trigger("childRemove");
			this.off();
			this.remove();
		}
	});

	var memoriaView;
	var MemoriaView = Backbone.View.extend({
		events: function() {
			var evtObj = {};
			evtObj[common.cgti] = this.tapFunc;
			return evtObj;
		},
		className: function() {
			var pieceType = (this.model.piece) ? this.model.piece.pieceType : this.model.pieceType;
			return "userMemoriaIcon " + pieceType;
		},
		initialize : function(options) {
			this.listenTo(this.parentView,"childRemove",this.removeView);
		},
		render : function() {
			this.$el.html(this.template({model:this.model}));
			return this;
		},
		tapFunc: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			if(!this.model.openFlag) return;

			popupSet.maxParamPopup(e,this.model,true);
		},
		removeView : function(){
			this.off();
			this.remove();
		}
	});

	var init = function(){
		//common.setStyle(css);
		pageView = new PageView();
	};

	return {
		needModelIdObj: [
			{id:"user"},
			{id:"gameUser"},
			{id:"pieceList"},
			{id:"userStatusList"},
			{id:"userPieceList"},
			{id:"userPieceCollectionList"},
			{id:"userPieceArchiveList"},
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
			if(pageView) pageView.removeView();
			callback();
		}
	};
});
