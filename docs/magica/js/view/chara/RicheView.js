define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/chara/Riche.html',
	'js/card/CardPopup',
	'CharaCommon'
], function (_,Backbone,common,ajaxControl,
	//temp,
	popupSet,ccommon
) {
	'use strict';

	var CharaData = Backbone.View.extend({
		id: "richeWrap",
		className: "commonFrame3",
		initialize : function(options) {
			this.listenTo(this.rootView,'remove',this.removeView);
			this.listenTo(this.model,'change',this.render);

			this.template = _.template(
				common.doc.getElementById('tempCharaRiche').innerText
			);
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));

			return this;
		},
		removeView: function() {
			// console.log("removeView");
			this.off();
			this.remove();
		}
	});

	return CharaData;

});