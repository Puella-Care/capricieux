define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/chara/CharaData.html',
	'js/card/CardPopup',
	'CharaCommon'
], function (
	_,Backbone,common,ajaxControl,cmd,
	//temp,
	popupSet,ccommon
) {
	'use strict';

	var CharaData = Backbone.View.extend({
		id: "charaData",
		events: function() {
			var evtObj = {};
			return evtObj;
		},
		initialize : function(options) {
			this.listenTo(this.rootView,'remove',this.removeView);
			this.listenTo(this.model,'change',this.render);
			this.listenTo(this.model,'change',this.flag);

			this.template = _.template(
				common.doc.getElementById('tempCharaData').innerText
			);
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));

			return this;
		},
		conditionIconSet: function() {
			if(this.lvMaxFlag) {
				common.addClass(this.el.querySelector(".lvMaxFlag"),"on");
			}
			if(this.lbMaxFlag) {
				common.addClass(this.el.querySelector(".lbMaxFlag"),"on");
			}
			if(this.revMaxFlag) {
				common.addClass(this.el.querySelector(".revMaxFlag"),"on");
			}
			if(this.episodeLvMaxFlag) {
				common.addClass(this.el.querySelector(".episodeLvMaxFlag"),"on");
			}
		},
		flag: function() {
			var model = this.model.toJSON();
			var level = model.level;
			var maxLevel = model.maxLevel;
			var revision = model.revision;
			var maxRare = model.maxRare;
			var rare = model.card.rank.split("RANK_")[1];

			this.lvMaxFlag = (level == maxLevel) ? true : false;
			this.rareMaxFlag = (rare == maxRare) ? true : false;

			this.episodeLvMaxFlag = (model.episodeLevel == 5) ? true : false;
			this.conditionIconSet();
		},
		removeView: function() {
			// console.log("removeView");
			this.off();
			this.remove();
		}
	});

	return CharaData;

});
