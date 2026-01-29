define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/chara/CharaImg.html',
	'js/card/CardPopup'
], function (_,Backbone,common,ajaxControl,
	//temp,
	popupSet
) {
	'use strict';

	var CharaImg = Backbone.View.extend({
		id: "charaImg",
		initialize : function(options) {
			this.listenTo(this.rootView,'remove',this.removeView);
			this.listenTo(this.model,'change',this.render);
			this.template = _.template(
				common.doc.getElementById('tempCharaImg').innerText
			);
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			return this;
		},
		removeView: function() {
			this.off();
			this.remove();
		}
	});

	return CharaImg;
});
