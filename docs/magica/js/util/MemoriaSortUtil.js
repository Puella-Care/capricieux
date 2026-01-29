define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'js/view/memoria/MemoriaSortView',
	'js/view/memoria/bulkSelectPopupView',
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	MemoriaSortView,
	bulkSelectPopupView
) {
	'use strict';

	var ranks = {};
	ranks.RANK_1 = 0;
	ranks.RANK_2 = 1;
	ranks.RANK_3 = 2;
	ranks.RANK_4 = 3;
	ranks.RANK_5 = 4;

	// 0:ソート順
	// 1:昇降
	// 2:属性（タイプ）
	// 3:レア度
	// 4:イベント
	// 5:Lock
	// 6:表示サイズ
	// 7:メモリア種類フィルタ
	// 8:装備中優先表示
	// 9:強化状態
	// 10:特殊条件（一括選択のみ使う）
	var sortParamInit = ["get","desc",null,null,null,null,1.0,null,null,null];
	var selecttParamInit = [
		"get",
		"desc",
		null,
		null,
		null,
		null,
		1.0,
		null,
		null,
		null,
		null,
	];

	var CardSortClass = function(memoryHash,parentView) {
		this.memoryHash = memoryHash;
		this.parentView = parentView;
		this.sortPrm = [];
		this.selectPrm = selecttParamInit;
		this.sortInit();
	};

	// ------------------------------------------------------------------------.
	// 初期ソート
	CardSortClass.prototype.sortStart = function(sortPrm){
		if(!sortPrm) {
			sortPrm = this.sortPrm;
		}
		var ascNum = (sortPrm[1] === "asc") ? 1 : -1;

		var container;
		var inner;
		var orderCnt = 0;

		// メモリア一覧側か、強化側か
		if(common.location === "MemoriaList" || common.location === "PieceArchive"){
			container = common.doc.getElementById("memoriaWrapInner");
		}else if(common.location === "MemoriaCompose"){
			container = common.doc.getElementById("cardWrap");
		}else if(common.location === "MemoriaEquip"){
			container = common.doc.getElementById("scrollInner");
		}

		// 親DOMがflexかどうかを確認
		// 実際の並び替え処理の切り分け
		var flexFlg  = false;
		var styleDisplay = window.getComputedStyle(container).display;
		if(styleDisplay === "flex" || styleDisplay === "-webkit-flex"){
			flexFlg = true;
		}

		[].slice.call(container.querySelectorAll('.userMemoriaIcon'))
			.map(function(v){
				var param = v.getElementsByClassName("paramWrap")[0].dataset;
				return { dom: v, param: param};
			})
			.sort(function(a,b){
				if(sortPrm[0] == "rank"){
					// レア度順
					if(ranks[b.param.rank] < ranks[a.param.rank]) return -1 * ascNum;
					if(ranks[b.param.rank] > ranks[a.param.rank]) return 1 * ascNum;

				}else if(sortPrm[0] == "level"){
					// レベル順
					if(Number(b.param.level) < Number(a.param.level)) return -1 * ascNum;
					if(Number(b.param.level) > Number(a.param.level)) return 1 * ascNum;

				}else if(sortPrm[0] == "atk"){
					// 攻撃力順
					if(Number(b.param.atk) < Number(a.param.atk)) return -1 * ascNum;
					if(Number(b.param.atk) > Number(a.param.atk)) return 1 * ascNum;

				}else if(sortPrm[0] == "def"){
					// 防御順
					if(Number(b.param.def) < Number(a.param.def)) return -1 * ascNum;
					if(Number(b.param.def) > Number(a.param.def)) return 1 * ascNum;

				}else if(sortPrm[0] == "hp"){
					// HP順
					if(Number(b.param.hp) < Number(a.param.hp)) return -1 * ascNum;
					if(Number(b.param.hp) > Number(a.param.hp)) return 1 * ascNum;

				}else if(sortPrm[0] == "lb"){
					// 限界突破順
					if(Number(b.param.lb) < Number(a.param.lb)) return -1 * ascNum;
					if(Number(b.param.lb) > Number(a.param.lb)) return 1 * ascNum;

				}

				//同カードが並ぶように(入手順のときは発火順序の関係であとに)
				if(sortPrm[0] !== "get"){
					if(Number(b.param.pieceId) < Number(a.param.pieceId)) return -1 * ascNum;
					if(Number(b.param.pieceId) > Number(a.param.pieceId)) return 1 * ascNum;
				}

				//単純な昇順降順用（同一カードでも入れ替わるように)
				if(Date.parse(b.param.created) < Date.parse(a.param.created)) return -1 * ascNum;
				if(Date.parse(b.param.created) > Date.parse(a.param.created)) return 1  * ascNum;

				if(sortPrm[0] === "get"){
					if(Number(b.param.pieceId) < Number(a.param.pieceId)) return -1 * ascNum;
					if(Number(b.param.pieceId) > Number(a.param.pieceId)) return 1 * ascNum;
				}


				return 0;
			})
			.forEach(function(v){
				// メモリア数が多すぎてappendするよりこっちのが軽い
				// flexのorderでうわがき
				// 昇降順並び替え 478枚時 約8ms vs 約20ms
				if(flexFlg){
					var setCnt = orderCnt;
					// 装備中優先表示対策
					if(sortPrm[8] && v.dom.classList.contains("equiped")){
						setCnt = (setCnt - 1000) | 0;
					}

					// 倉庫のみの特殊ロジック
					if(common.location === "PieceArchive" && sortPrm[4] && v.dom.classList.contains("effective")){
						setCnt = (setCnt - 1000) | 0;
					}

					// classで-1などつける場合はimportant必須
					v.dom.style.WebkitOrder = setCnt;
					v.dom.style.order       = setCnt;

					// orderCnt増やす
					// 流石に数多いので int++じゃなくて、+1して整数化して高速化
					orderCnt = (orderCnt + 1) | 0;
				}else{
					// flexBoxじゃなかった時は従来のやり方
					if(sortPrm[8] && v.dom.classList.contains("equiped")){
						v.dom.style.WebkitOrder = "-1000";
						v.dom.style.order       = "-1000";
					}
					container.appendChild(v.dom);
				}
			});

		// ソート実行後に実行するものがある場合
		if(this.parentView){
			this.parentView.afterFilterFunc();
		}
	};

	// ------------------------------------------------------------------------.

	CardSortClass.prototype.sortInit = function() {
		if(this.memoryHash) {
			this.localStorageCheck(this.memoryHash);

			// 条件追加したのでバグ対策(イベントフィルタ追加前にlocalStorageにあるとundefinedとなるので、初期値を追加して１度保存する)
			var i=4;
			while(i<sortParamInit.length) {
				if(this.sortPrm[i] === undefined){
					this.sortPrm[i] = sortParamInit[i];
				}
				i = (i+1)|0;
			}
			common.sfml[this.memoryHash] = this.sortPrm;
			common.sfm();
		} else {
			this.sortPrm = sortParamInit;
		}

	};
	CardSortClass.prototype.localStorageCheck = function(memoryHash) {
		// memoryHashがあってlocalStorageに保存されてる時
		if(memoryHash && memoryHash in common.sfml) {
			this.sortPrm = common.sfml[memoryHash];

		// memoryHashがあってlocalStorageに保存されてない時
		} else if(memoryHash && !(memoryHash in common.sfml)) {
			this.sortPrm = sortParamInit;
			common.sfml[memoryHash] = this.sortPrm;
			common.sfm();
		}
	};
	CardSortClass.prototype.ascSort = function(ascId) {
		this.sortPrm[1] = ascId;
		this.multiSort(this.sortPrm);
	};
	CardSortClass.prototype.sortPopupOpen = function(e) {
		var view;

		MemoriaSortView.prototype.cardSort = this;
		view = new MemoriaSortView();

		var afterClose = function(){
			view.removeView();
		}

		new common.PopupClass({ popupType:"typeB" },null,null,afterClose);

		common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(view.render().el);

		var filterList = common.doc.getElementById('sortfilter').getElementsByClassName('filterList');

		var i=0,leng1= filterList.length;
		while(i<leng1) {
			var sortId = parseInt(filterList[i].dataset.sortid);

			if(this.sortPrm[sortId]){
				var split = this.sortPrm[sortId].split(",");
				var filterBtn = filterList[i].getElementsByClassName('filterBtn');

				var j=0,leng2= filterBtn.length;
				while(j<leng2) {

					if (!filterBtn[j].classList.contains("ALL")) {
						if (split.indexOf(filterBtn[j].dataset.filter) > -1) {
							filterBtn[j].classList.add("current");
						}
					}

					j=(j+1)|0;
				}
			}else{
				filterList[i].getElementsByClassName("ALL")[0].classList.add("current");
			}

			i=(i+1)|0;
		}
	};
	CardSortClass.prototype.bulkSelectPopupOpen = function(_args) {
		var view;
		bulkSelectPopupView.prototype.cardSort = this;
		view = new bulkSelectPopupView({
			rootView: _args.rootView,
		});
		var afterClose = function(){
			view.removeView();
		}
		new common.PopupClass({ popupType:"typeB" },null,null,afterClose);
		common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(view.render().el);
		// 選択の場合は全てに戻しておくこと
		var filterList = common.doc.getElementById('sortfilter').getElementsByClassName('filterList');
		var i=0,leng1= filterList.length;
		while(i<leng1) {
			filterList[i].getElementsByClassName("ALL")[0].classList.add("current");
			i=(i+1)|0;
		}
	};//bulkSelectPopupOpen
	CardSortClass.prototype.firstSort = function(){
		if(!this.sortPrm) return;
		this.sortStart(this.sortPrm);
	};
	CardSortClass.prototype.multiSort = function(_sortPrm){
		this.sortPrm = _sortPrm;
		this.sortStart(this.sortPrm);

		var sortPrm = [];
		var i=0;
		while(i<sortParamInit.length) {
			sortPrm.push(this.sortPrm[i]);
			i = (i+1)|0;
		}

		if(this.memoryHash) {
			common.sfml[this.memoryHash] = sortPrm;
			common.sfm();
		}
	};
	CardSortClass.prototype.saveMemory = function(){
		if(!this.sortPrm) return;
		if(!this.memoryHash) return;

		var sortPrm = [];
		var i=0;
		while(i<sortParamInit.length) {
			sortPrm.push(this.sortPrm[i]);
			i = (i+1)|0;
		}

		common.sfml[this.memoryHash] = sortPrm;
		// console.log(common.sfml[this.memoryHash]);
		common.sfm();
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
	CardSortClass.prototype.getFilterEvent = function() {
		return this.sortPrm[4];
	};
	CardSortClass.prototype.getFilterLock = function() {
		return this.sortPrm[5];
	};
	CardSortClass.prototype.getDisplaySize = function() {
		return this.sortPrm[6];
	};
	CardSortClass.prototype.getEffectType = function() {
		return this.sortPrm[7];
	};
	CardSortClass.prototype.getPrimary = function() {
		return this.sortPrm[8];
	};
	CardSortClass.prototype.getFilterCompose = function() {
		return this.sortPrm[9];
	};
	CardSortClass.prototype.isFilterOn = function() {
		return (
			this.sortPrm[2] !== null ||
			this.sortPrm[3] !== null ||
			this.sortPrm[5] !== null ||
			this.sortPrm[7] !== null ||
			this.sortPrm[9] !== null
		);
	};
	CardSortClass.prototype.isHideFilterType = function(pieceModel) {
		var hideFlg = false;

		if(this.sortPrm[2] !== null) {
			var targetReinforcement = ["REINFORCEMENT", "LIMIT_BREAK"];
			var filterType = this.getFilterType();

			if (filterType.indexOf("REINFORCEMENT") > -1) {
				if (targetReinforcement.indexOf(pieceModel.piece.pieceKind) < 0 && filterType.indexOf(pieceModel.piece.pieceType) < 0) {
					hideFlg = true;
				}
			}
			else {
				if (targetReinforcement.indexOf(pieceModel.piece.pieceKind) > -1 || filterType.indexOf(pieceModel.piece.pieceType) < 0) {
					hideFlg = true;
				}
			}
		}

		return hideFlg;
	};
	CardSortClass.prototype.isHideFilterEffect = function(pieceModel) {
		var hideFlg = false;

		if(this.sortPrm[7] !== null){
			var typeCheck = false;
			_.each(pieceModel.effectType,function(effect,index){
				if(this.sortPrm[7].indexOf(effect) !== -1) typeCheck = true;
			}.bind(this));
			if(!typeCheck) hideFlg = true;
		}

		return hideFlg;
	};
	CardSortClass.prototype.isHideFilterRank = function(pieceModel) {
		var hideFlg = false;

		if(this.sortPrm[3] !== null &&
			this.sortPrm[3].indexOf(pieceModel.piece.rank) < 0){
			hideFlg = true;
		}

		return hideFlg;
	};
	CardSortClass.prototype.isHideFilterLock = function(pieceModel) {
		var hideFlg = false;

		if(this.sortPrm[5] !== null) {
			if(this.sortPrm[5] === "LOCKED" && !pieceModel.protect){
				hideFlg = true;
			}else if(this.sortPrm[5] === "UNLOCKED" && pieceModel.protect){
				hideFlg = true;
			}
		}

		return hideFlg;
	};
	CardSortClass.prototype.isHideFilterCompose = function(pieceClass) {
		var hideFlg = false;

		if (this.sortPrm[9] !== null) {
			var noHideFlag = false;
			var isFilterLvMax = this.sortPrm[9].indexOf("LV_MAX") > -1;
			var isFilterLbMax = this.sortPrm[9].indexOf("LB_MAX") > -1;
			var isFilterEtc = this.sortPrm[9].indexOf("ETC") > -1;
			var isLvMax = pieceClass.indexOf("lvMax") > -1;
			var isLbMax = pieceClass.indexOf("lbMax") > -1;

			if(isFilterLvMax && isFilterLbMax && isLvMax && isLbMax){
				noHideFlag = true;
			}else if(isFilterLvMax && !isFilterLbMax && isLvMax && !isLbMax){
				noHideFlag = true;
			}else if(!isFilterLvMax && isFilterLbMax && !isLvMax && isLbMax){
				noHideFlag = true;
			}else if(isFilterEtc && !isLvMax && !isLbMax){
				noHideFlag = true;
			}

			hideFlg = !noHideFlag;
		}

		return hideFlg;
	};
	CardSortClass.prototype.checkBulkSelect = function(_args) {
		var pieceModel = _args.pieceModel;
		var pieceClassText = _args.pieceClassText;
		var hideFlg = _args.hideFlg;
		var selectPrm = this.selectPrm;
		var selectFlg = false;
		var CN = { //コンバート番号
			type: 2,
			rank: 3,
			lock: 5,
			compose: 9,
			special: 10,
		}
		var selectFlgList = {
			type: false,
			rank: false,
			lock: false,
			compose: false,
			special: false,
		};
		// タイプチェック
		if(selectPrm[CN.type] !== null) {
			var _selectFlg = false;
			var targetReinforcement = ["REINFORCEMENT", "LIMIT_BREAK"];
			var filterType = selectPrm[CN.type];
			if (filterType.indexOf("REINFORCEMENT") > -1) {
				if (targetReinforcement.indexOf(pieceModel.piece.pieceKind) < 0 && filterType.indexOf(pieceModel.piece.pieceType) < 0) {
					_selectFlg = true;
				}
			}
			else {
				if (targetReinforcement.indexOf(pieceModel.piece.pieceKind) > -1 || filterType.indexOf(pieceModel.piece.pieceType) < 0) {
					_selectFlg = true;
				}
			}
			selectFlgList.type = !_selectFlg;
			// すべて選択のときは無条件で選択する
			if(selectPrm[CN.type].indexOf("ALL") > -1){
				selectFlgList.type = true;
			};
		}
		// ランクチェック
		if(
			selectPrm[CN.rank] !== null
		){
			if(selectPrm[CN.rank].indexOf(pieceModel.piece.rank) > -1){
				selectFlgList.rank = true;
			};
			// すべて選択のときは無条件で選択する
			if(selectPrm[CN.rank].indexOf("ALL") > -1){
				selectFlgList.rank = true;
			};
		}
		// ロックチェック
		if(
			selectPrm[CN.lock] !== null
		) {
			var _selectFlg = false;
			if(selectPrm[CN.lock] === "LOCKED" && !pieceModel.protect){
				_selectFlg = true;
			}else if(selectPrm[CN.lock] === "UNLOCKED" && pieceModel.protect){
				_selectFlg = true;
			}
			selectFlgList.lock = !_selectFlg;
			// すべて選択のときは無条件で選択する
			if(selectPrm[CN.lock].indexOf("ALL") > -1){
				selectFlgList.lock = true;
			};
		}
		// 強化状態チェック
		if (
			selectPrm[CN.compose] !== null
		) {
			var isFilterLvMax = selectPrm[CN.compose].indexOf("LV_MAX") > -1;
			var isFilterLbMax = selectPrm[CN.compose].indexOf("LB_MAX") > -1;
			var isFilterEtc = selectPrm[CN.compose].indexOf("ETC") > -1;
			var isLvMax = pieceClassText.indexOf("lvMax") > -1;
			var isLbMax = pieceClassText.indexOf("lbMax") > -1;
			// 表示フィルタと同じ仕組みで選択する
			if(isFilterLvMax && isFilterLbMax && isLvMax && isLbMax){
				selectFlgList.compose = true;
			}else if(isFilterLvMax && !isFilterLbMax && isLvMax && !isLbMax){
				selectFlgList.compose = true;
			}else if(!isFilterLvMax && isFilterLbMax && !isLvMax && isLbMax){
				selectFlgList.compose = true;
			}else if(isFilterEtc && !isLvMax && !isLbMax){
				selectFlgList.compose = true;
			}
			// すべて選択のときは無条件で選択する
			if(selectPrm[CN.compose].indexOf("ALL") > -1){
				selectFlgList.compose = true;
			};
		}
		// 特殊チェック
		if (
			selectPrm[CN.special] !== null
		) {
			var _specialArr = selectPrm[CN.special].split(",");
			_.each(_specialArr, function(_val, _index, _list){
				// イベントチェックの時
				if(_val == 'EVENT'){
					if(
						pieceClassText.indexOf('effective') > -1 || 
						pieceClassText.indexOf('regularEffective') > -1 || 
						pieceClassText.indexOf('overEffective') > -1
					){
						// いずれかが含まれていたら
						selectFlgList.special = true;
					};
				};
			});
			// すべて選択のときは無条件で選択する
			if(selectPrm[CN.special].indexOf("ALL") > -1){
				selectFlgList.special = true;
			};
		}
		// 選択対象チェック
		var _listCount = 0;
		var _selectFlgCount = 0;
		_.each(selectFlgList, function(_val, _index, _list){
			_listCount++;
			if(_val){
				_selectFlgCount++;
			};
		});
		// すべての条件を満たしたもののみ選択する
		if(_listCount == _selectFlgCount){
			selectFlg = true;
		};
		// 以下は強制選択対象
		// 選択中のアイテムは選択のママ
		if(pieceClassText.indexOf("selected") > -1){
			selectFlg = true;
		};
		// 装備中のアイテムは選択しない
		if(pieceClassText.indexOf("equiped") > -1){
			selectFlg = false;
		};
		// 非表示中のアイテムは選択しない
		if(hideFlg){
			selectFlg = false;
		};
		return selectFlg;
	};
	// 一括選択用パラメータリセット
	CardSortClass.prototype.resetSelectPrm = function() {
		this.selectPrm = selecttParamInit;
	};
	// 一括選択用パラメータデフォルト
	CardSortClass.prototype.setDefaultSelectPrm = function() {
		this.selectPrm = [
			"get",
			"desc",
			'ALL', //タイプ
			'ALL', //レアリティ
			'ALL', //イベント
			'ALL', //ロック
			1.0,
			null,
			null,
			'ALL', //強化状態
			'ALL', //特殊条件
		];
	};
	CardSortClass.prototype.getSortPrm = function(view) {
		view.filterType			= this.sortPrm[2];
		view.rankFilter			= this.sortPrm[3];
		view.lockFilter			= this.sortPrm[5];
		view.effectFilter		= this.sortPrm[7];
		view.equipedPrimary	= this.sortPrm[8];
		view.composeFilter	= this.sortPrm[9];
	};
	// CardSortClass.prototype.getSortName = function() {
	// 	var sortName;
	// 	switch(this.sortPrm[0]){
	// 		case "level" :
	// 			sortName = "レベル順";
	// 			break;
	// 		case "atk" :
	// 			sortName = "攻撃力順";
	// 			break;
	// 		case "def" :
	// 			sortName = "防御力順";
	// 			break;
	// 		case "rank" :
	// 			sortName = "レアリティ順";
	// 			break;
	// 		case "get" :
	// 			sortName = "入手順";
	// 			break;
	// 		case "lb" :
	// 			sortName = "限界突破順";
	// 			break;
	// 		case "hp" :
	// 			sortName = "HP順";
	// 			break;
	// 	}
	// 	return sortName;
	// };
	// CardSortClass.prototype.getFilterName = function(){
	// 	var filterName = "";
  //
	// 	if(this.sortPrm[2] || this.sortPrm[3] || this.sortPrm[5] || this.sortPrm[7] || this.sortPrm[9]){
  //
	// 		filterName = "フィルタON";
	// 	}else{
	// 		filterName = "全表示";
	// 	}
  //
	// 	return filterName;
	// };
	return CardSortClass;
});
