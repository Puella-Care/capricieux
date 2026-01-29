define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/card/CardSort.html'
], function (
	_,Backbone,common,ajaxControl
	//pageTemp
) {
	'use strict';

	var cardSort;
	var SortView = Backbone.View.extend({
		events : function(){
			var evtObj = {};
			evtObj[common.cgti + ' #filterAttList .filterAtt']   = this.typeFilter;
			evtObj[common.cgti + ' #filterRankList .filterRank'] = this.rankFilter;
			evtObj[common.cgti + ' #filterEnhanceList .filterEnhance'] = this.enhanceFilter;
			evtObj[common.cgti + ' #filterInitialList .filterInitial'] = this.initialFilter;
			evtObj[common.cgti + ' #cardSortBtnsArea .sort']     = this.reSort;
			return evtObj;
		},
		initialize : function() {
			cardSort = this.cardSort;
			this.template = _.template(
				common.doc.getElementById('tempCardSort').innerText
			);
			this.memoryHash = cardSort.memoryHash;
			this.sortPrm    = cardSort.sortPrm.concat();
		},
		render : function() {
			this.$el.html(this.template(ajaxControl.getPageJson()));
			return this;
		},
		typeFilter : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var currents;
			if(e.currentTarget.dataset.typeFilter == "ALL") {
				if(!e.currentTarget.classList.contains("current")) {
					currents = common.doc.getElementById("filterAttList").getElementsByClassName("filterAtt");
					this.sortPrm[2] = null;

					// console.log(currents)
					_.each(currents,function(dom) {
						common.removeClass(dom,"current");
					});
					e.currentTarget.classList.toggle("current");
				}
			} else {
				common.removeClass(common.doc.querySelector("#filterAttList .ALL"),"current");
				e.currentTarget.classList.toggle("current");

				currents = common.doc.getElementById("filterAttList").getElementsByClassName("current");
				if(currents.length > 0){
					var value = "";
					for(var i = 0, leng = currents.length; i < leng; i++){
						if(value !== "") value += ",";
						value += currents[i].dataset.typeFilter;
					}
					this.sortPrm[2] = value;
				} else {
					common.addClass(common.doc.querySelector("#filterAttList .ALL"),"current");
					this.sortPrm[2] = null;
				}
			}
		},
		rankFilter : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var currents;
			if(e.currentTarget.dataset.rankfilterId == "ALL") {
				if(!e.currentTarget.classList.contains("current")) {
					currents = common.doc.getElementById("filterRankList").getElementsByClassName("filterRank");
					this.sortPrm[3] = null;

					// console.log(currents)
					_.each(currents,function(dom) {
						common.removeClass(dom,"current");
					});
					e.currentTarget.classList.toggle("current");
				}
			} else {
				common.removeClass(common.doc.querySelector("#filterRankList .ALL"),"current");
				e.currentTarget.classList.toggle("current");

				currents = common.doc.getElementById("filterRankList").getElementsByClassName("current");
				if(currents.length > 0){
					var value = "";
					for(var i = 0, leng = currents.length; i < leng; i++){
						if(value !== "") value += ",";
						value += currents[i].dataset.rankfilterId;
					}
					this.sortPrm[3] = value;
				} else {
					common.addClass(common.doc.querySelector("#filterRankList .ALL"),"current");
					this.sortPrm[3] = null;
				}
			}
		},
		enhanceFilter : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var currents;
			if(e.currentTarget.dataset.enhancefilterId == "ALL") {
				if(!e.currentTarget.classList.contains("current")) {
					currents = common.doc.getElementById("filterEnhanceList").getElementsByClassName("filterEnhance");
					this.sortPrm[4] = null;

					// console.log(currents)
					_.each(currents,function(dom) {
						common.removeClass(dom,"current");
					});
					e.currentTarget.classList.toggle("current");
				}
			} else {
				common.removeClass(common.doc.querySelector("#filterEnhanceList .ALL"),"current");
				if(e.currentTarget.classList.contains("current")){
					e.currentTarget.classList.toggle("current");
				} else {
					common.removeClass(common.doc.querySelector("#filterEnhanceList .flexBox .current"),"current");
					e.currentTarget.classList.toggle("current");
				}

				currents = common.doc.getElementById("filterEnhanceList").getElementsByClassName("current");
				if(currents.length > 0){
					this.sortPrm[4] = e.currentTarget.dataset.enhancefilterId;
				} else {
					common.addClass(common.doc.querySelector("#filterEnhanceList .ALL"),"current");
					this.sortPrm[4] = null;
				}
			}
		},
		initialFilter : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var currents;
			if(e.currentTarget.dataset.initialfilterId == "ALL") {
				if(!e.currentTarget.classList.contains("current")) {
					currents = common.doc.getElementById("filterInitialList").getElementsByClassName("filterInitial");
					this.sortPrm[5] = null;

					// console.log(currents)
					_.each(currents,function(dom) {
						common.removeClass(dom,"current");
					});
					e.currentTarget.classList.toggle("current");
				}
			} else {
				common.removeClass(common.doc.querySelector("#filterInitialList .ALL"),"current");
				e.currentTarget.classList.toggle("current");

				currents = common.doc.getElementById("filterInitialList").getElementsByClassName("current");
				console.log("currents",currents)
				if(currents.length > 0 && currents.length < 7){
					var value = "";
					for(var i = 0, leng = currents.length; i < leng; i++){
						if(value !== "") value += ",";
						value += currents[i].dataset.initialfilterId;
					}
					this.sortPrm[5] = value;
				} else {
					if(currents.length > 6){
						// _.each(currents,function(dom) {
						// 	console.log("delete currents",currents);
						// 	console.log("delete dom",dom)
						// 	common.removeClass(dom,"current");
						// });
						var l = currents.length;
						while(l > 0){
							l--;
							common.removeClass(currents[l],"current");
						}
					}
					common.addClass(common.doc.querySelector("#filterInitialList .ALL"),"current");
					this.sortPrm[5] = null;
				}
			}
		},
		reSort : function(){
			if(this.memoryHash) {
				common.sfml[this.memoryHash] = this.sortPrm;
				common.sfm();
			}
			cardSort.multiSort(this.sortPrm);
		}
	});

	return SortView;

});