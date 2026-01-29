define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'js/view/card/CardSortView'
], function (_,Backbone,common,ajaxControl,CardSortView) {
	'use strict';

	var CardSortClass = function(memoryHash,parentView) {
		this.parentView = parentView;
		this.selectCardId = null;
		this.memoryHash = memoryHash;
		this.sortPrm = [];
		this.sortInit();
	};

	// ------------------------------------------------------------------------.
	var atts = {
		FIRE  : 0,
		WATER : 1,
		TIMBER: 2,
		LIGHT : 3,
		DARK  : 4,
		VOID  : 5
	};
	var sortTextObj = {
		"get"      : "入手",
		"level"    : "レベル",
		"rank"     : "レアリティ",
		"atk"      : "ATK",
		"def"      : "DEF",
		"hp"       : "HP",
		"eplv"     : "エピソードLv",
		"rev"      : "魔力解放",
		"mlv"      : "マギアLv",
		"enhance"  : "精神強化",
		"composeAttribute"  : "属性強化"
	};
	var sortClassObj = {
		"get"      : "sortGet",
		"level"    : "sortLv",
		"rank"     : "sortRank",
		"atk"      : "sortAtk",
		"def"      : "sortDef",
		"hp"       : "sortHp",
		"eplv"     : "sortEplv",
		"rev"      : "sortRev",
		"mlv"      : "sortMlv",
		"enhance"  : "sortEnhance",
		"composeAttribute"  : "sortComposeAttribute"
	};
	CardSortClass.prototype.sortStart = function(sortPrm){
		if(!sortPrm) {
			sortPrm = this.sortPrm;
		}
		var ascNum = (sortPrm[1] === "asc") ? -1 : 1;

		var container = common.doc.querySelector('#charaListElms');
		[].slice.call(container.querySelectorAll('.userCharaIcon'))
			.map(function(v){
				var value  = Number(v.querySelector('.prm_' + sortPrm[0]).textContent);
				var value2 = atts[v.querySelector('.prm_att').textContent];
				var value3 = Number(v.querySelector('.prm_charaId').textContent);
				var value4 = Number(v.querySelector('.prm_rank').textContent);


				return { dom: v, value: value , value2: value2, value3: value3, value4: value4};
			})
			.sort(function(a,b){
				if(b.value < a.value) return -1 * ascNum;
				if(b.value > a.value) return 1  * ascNum;

				if(sortPrm[0] !== "get") { // パラメータ同じだったら属性順に
					if(b.value2 < a.value2) return 1;
					if(b.value2 > a.value2) return -1;

					if(b.value4 > a.value4) return 1;
					if(b.value4 < a.value4) return -1;

					if(b.value3 > a.value3) return 1;
					if(b.value3 < a.value3) return -1;
				} else { // 入手順同じだったらキャラID順に
					if(b.value3 < a.value3) return -1;
					if(b.value3 > a.value3) return 1;
				}

				return 0;
			})
			.forEach(function(v){ container.appendChild(v.dom); });

		// _.each(common.doc.querySelectorAll('#charaListElms li'),function(dom){
		// 	console.log(dom.querySelector('.prm_' + sortPrm[0]).textContent);
		// })

		common.doc.querySelector("#sortBtn").dataset.id   = sortPrm[0];
		common.doc.querySelector("#sortBtn").textContent  = sortTextObj[sortPrm[0]];
		common.doc.querySelector(".orderBtn").dataset.id  = sortPrm[1];
		common.doc.querySelector(".orderBtn").className = "orderBtn se_tabs TE " + sortPrm[1];
		common.doc.querySelector("#charaListElms").className = "list " + sortClassObj[sortPrm[0]];

		this.parentView.filterFunc();
	};

	// ------------------------------------------------------------------------.
	CardSortClass.prototype.sortInit = function() {
		if(this.memoryHash) {
			this.localStorageCheck(this.memoryHash);

			if(!this.sortPrm[4]) this.sortPrm[4] = null;
			if(!this.sortPrm[5]) this.sortPrm[5] = null;
		} else {
			this.sortPrm = ["rank","desc",null,null,null,null];
		}
		// console.log("sort Init:",this.sortPrm)
	};
	CardSortClass.prototype.localStorageCheck = function(memoryHash) {
		// memoryHashがあってlocalStorageに保存されてる時
		if(memoryHash && memoryHash in common.sfml) {
			this.sortPrm = common.sfml[memoryHash];
		// memoryHashがあってlocalStorageに保存されてない時
		} else if(memoryHash && !(memoryHash in common.sfml)) {
			this.sortPrm = ["rank","desc",null,null,null,null];
			common.sfml[memoryHash] = this.sortPrm;
			common.sfm();
		}
	};
	CardSortClass.prototype.ascSort = function(ascId) {
		this.sortPrm[1] = ascId;
		if(this.memoryHash) {
			common.sfml[this.memoryHash] = this.sortPrm;
			common.sfm();
		}
		this.multiSort(this.sortPrm);
	};
	CardSortClass.prototype.sortPopupOpen = function(e) {
		CardSortView.prototype.cardSort = this;
		var view = new CardSortView();
		var i = 0;

		new common.PopupClass({
			popupType:"typeB"
		});

		common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(view.render().el);

		// 属性フィルターボタン
		if(this.sortPrm[2]){
			i = 0;
			var attArr = this.sortPrm[2].split(",");
			var attArrLength = attArr.length;
			while(i < attArrLength) {
				common.addClass(common.doc.querySelector("#filterAttList ."+attArr[i]),"current");
				i=(i+1)|0;
			}
		} else {
			common.addClass(common.doc.querySelector("#filterAttList .ALL"),"current");
		}

		// ランクフィルターボタン
		if(this.sortPrm[3]){
			i = 0;
			var rankArr = this.sortPrm[3].split(",");
			var rankArrLength = rankArr.length;
			while(i < rankArrLength) {
				common.addClass(common.doc.querySelector("#filterRankList ."+rankArr[i]),"current");
				i=(i+1)|0;
			}
		} else {
			common.addClass(common.doc.querySelector("#filterRankList .ALL"),"current");
		}

		// 精神強化フィルターボタン
		if(this.sortPrm[4]){
			i = 0;
			common.addClass(common.doc.querySelector("#filterEnhanceList ."+this.sortPrm[4]),"current");
		} else {
			common.addClass(common.doc.querySelector("#filterEnhanceList .ALL"),"current");
		}

		// タイプフィルターボタン
		if(this.sortPrm[5]){
			i = 0;
			var typeArr = this.sortPrm[5].split(",");
			var typeArrLength = typeArr.length;
			while(i < typeArrLength) {
				common.addClass(common.doc.querySelector("#filterInitialList ."+typeArr[i]),"current");
				i=(i+1)|0;
			}
		} else {
			common.addClass(common.doc.querySelector("#filterInitialList .ALL"),"current");
		}

		//属性強化フィルターボタン
		if(this.sortPrm[6]){
			i = 0;
			common.addClass(common.doc.querySelector("#filterComposeAttributeList ."+this.sortPrm[6]),"current");
		} else {
			common.addClass(common.doc.querySelector("#filterComposeAttributeList .ALL"),"current");
		}
	};
	CardSortClass.prototype.multiSort = function(_sortPrm){

		if(_sortPrm) {
			this.sortPrm = _sortPrm;

			if(this.memoryHash) {
				common.sfml[this.memoryHash] = this.sortPrm;
				common.sfm();
			}
		}

		this.sortStart(this.sortPrm);
	};
	CardSortClass.prototype.getSortId = function() {
		return this.sortPrm[0];
	};
	CardSortClass.prototype.getAscId = function() {
		return this.sortPrm[1];
	};
	CardSortClass.prototype.getFilterType = function() {
		return this.sortPrm[2];
	};
	CardSortClass.prototype.getFilterRare = function() {
		return this.sortPrm[3];
	};
	CardSortClass.prototype.getFilterEnhance = function() {
		return this.sortPrm[4];
	};
	CardSortClass.prototype.getFilterInitial = function() {
		return this.sortPrm[5];
	};
	CardSortClass.prototype.getFilterComposeAttribute = function() {
		return this.sortPrm[6];
	};
	return CardSortClass;
});
