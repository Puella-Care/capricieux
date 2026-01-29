define([
	"underscore",
	"backbone",
	"backboneCommon",
	"ajaxControl",
	"command",
	'text!template/base/ItemImgView.html',
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	cmd,
	temp
) {
	"use strict";

	var ItemImgView = Backbone.View.extend({
		className: function() {
			var _this = this; 
			var _class = 'itemImgWrap';
			if(_this.model.id){
				_class = _class+' item'+_this.model.id;
			};
			return _class;
		},
		events: function(){
			var _this = this;
			var evtObj = {};
			evtObj[common.cgti] = _this.tapImg;
			return evtObj;
		},
		initialize: function(_args) {
			var _this = this;
			_this.template = _.template(temp);
			_this.model = _args.model;
		},
		render: function() {
			var _this = this;
			_this.$el.html(_this.template({
				model: _this.model,
			}));
			return _this;
		},
		tapImg: function(e) {
			if(e){
				e.preventDefault();
			};
			if(common.isScrolled()) return;
			var _this = this;
			if(_this.model.callback){
				_this.model.callback();
			};
		},
		removeView: function() {
			var _this = this;
			_this.off();
			_this.remove();
		}
	});
	return ItemImgView;
});
