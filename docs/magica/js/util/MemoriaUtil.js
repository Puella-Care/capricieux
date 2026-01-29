define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl'
], function (_,Backbone,common,ajaxControl) {
	'use strict';

	var memoriaUtil = {};
	var Collection = Backbone.Collection.extend();
	var Model = Backbone.Model.extend();

	// ------------------------------------------------------------------------.
	// 強化後レベル予想

	// 各レベルごとの累積経験値
	memoriaUtil.exArr = [0,100,210,330,460,600,760,950,1180,1460,1800,2210,2690,3240,3860,4550,5310,6140,7040,8010,9050,10160,11340,12590,13910,15300,16760,18290,19890,21560,23300,25110,26990,28940,30960,33050,35210,37440,39740,42110,44550,47060,49640,52290,55010,57800,60660,63590,66590,69660];
	// 各レベルごとのレベルアップ必要経験値
	memoriaUtil.parExArr = [0,100,110,120,130,140,160,190,230,280,340,410,480,550,620,690,760,830,900,970,1040,1110,1180,1250,1320,1390,1460,1530,1600,1670,1740,1810,1880,1950,2020,2090,2160,2230,2300,2370,2440,2510,2580,2650,2720,2790,2860,2930,3000,3070];


	memoriaUtil.getComposeExp = function(rank,lv,itemArr,basePieceModel) {
		var itemExp = 0;
		var rankPhase = [1,0.8,0.6,0.45,0.3,0.3,0.3];

		var rankBaseExp = [100,200,500,1000];

		// 獲得経験値登録
		_.each(itemArr,function(view) {
			switch(view.piece.rank){
				case "RANK_1" :
					itemExp += (rankBaseExp[0] + (view.experience + memoriaUtil.exArr[view.level-1]) / 10);
					break;
				case "RANK_2" :
					itemExp += (rankBaseExp[1] + (view.experience + memoriaUtil.exArr[view.level-1]) / 10);
					break;
				case "RANK_3" :
					itemExp += (rankBaseExp[2] + (view.experience + memoriaUtil.exArr[view.level-1]) / 10);
					break;
				case "RANK_4" :
					itemExp += (rankBaseExp[3] + (view.experience + memoriaUtil.exArr[view.level-1]) / 10);
					break;
				default :
					itemExp += 0;
					break;
			}
		});
		return itemExp;
	};

	memoriaUtil.getNextExp = function(exp,lv){
		var next = memoriaUtil.parExArr[lv] - exp;
		return next;
	};

	memoriaUtil.getGuageLength = function(exp,lv){
		var length = Math.floor(exp / memoriaUtil.parExArr[lv] * 100);
		length = (length > 100) ? 100 : length;
		return length;
	};

	// ------------------------------------------------------------------------.

	// itemIdからpieceモデルを作成する
	memoriaUtil.getPieceModeFromItemModel = function(itemModel) {
		var model = {};
		model.piece = {};

		switch (itemModel.itemId) {
			case "MEMORIA_CIRCUIT":
				model.rank = "RANK_2";
				model.piece.pieceKind = "REINFORCEMENT";
				break;
			case "MEMORIA_CIRCUIT_CORE":
				model.rank = "RANK_4";
				model.piece.pieceKind = "REINFORCEMENT";
				break;
			case "OVER_LIMITTER_PIECE":
				model.rank = "RANK_2";
				model.piece.pieceKind = "LIMIT_BREAK";
				break;
			case "OVER_LIMITTER":
				model.rank = "RANK_3";
				model.piece.pieceKind = "LIMIT_BREAK";
				break;
			case "OVER_LIMITTER_CORE":
				model.rank = "RANK_4";
				model.piece.pieceKind = "LIMIT_BREAK";
				break;
			default:
				return null;
		}

		model.itemId = itemModel.itemId;
		model.experience = 0;
		model.lbCount = 4;
		model.level = memoriaUtil.getMaxLevel(model.rank, model.lbCount);
		model.piece.name = itemModel.item.name;
		model.piece.rank = model.rank;
		return model;
	};

	// ------------------------------------------------------------------------.
	// 強化に必要な費用 ランク係数
	memoriaUtil.getComposeFactor = function(rank) {
		switch (rank) {
			case "RANK_1":
				return 1.0;
			case "RANK_2":
				return 2.0;
			case "RANK_3":
				return 3.0;
			case "RANK_4":
				return 4.0;
			default:
				break;
		}
		return 60;
	};

	// ------------------------------------------------------------------------.
	// MaxLevel計算

	// カード最大レベル(50)
	var CARD_LEVEL_MAX50 = 50;

	var getMaxLevel = function(rank) {
		switch (rank) {
			case "RANK_1":
				return 10;
			case "RANK_2":
				return 15;
			case "RANK_3":
				return 20;
			case "RANK_4":
				return 30;
			case "RANK_5":
				return 50;
			default://固定値をとりあえず10にしておく
				return 30;
		}
	};


	memoriaUtil.getMaxLevel = function(rank,lbCount) {
		var _lbCount = (lbCount > 4) ? 4 : lbCount;
		var maxLevel = getMaxLevel(rank) + 5 * _lbCount;

		if(maxLevel > CARD_LEVEL_MAX50) {
			maxLevel = CARD_LEVEL_MAX50;
		}
		return maxLevel;
	};

	// ---------------------------------------------------------------------------.
	// メモリアパラメータ計算
	// ---------------------------------------------------------------------------.
	var prmRank1 = [1,1,1.05,1.11,1.16,1.22,1.27,1.33,1.38,1.44,1.5,1.55,1.6,1.65,1.7,1.75,1.8,1.85,1.9,1.95,2,2.05,2.1,2.15,2.2,2.25,2.3,2.35,2.4,2.45,2.5];
	var prmRank2 = [1,1,1.03,1.07,1.1,1.14,1.17,1.21,1.25,1.28,1.32,1.35,1.39,1.42,1.46,1.5,1.55,1.6,1.65,1.7,1.75,1.8,1.85,1.9,1.95,2,2.05,2.1,2.15,2.2,2.25,2.3,2.35,2.4,2.45,2.5];
	var prmRank3 = [1,1,1.02,1.05,1.07,1.1,1.13,1.15,1.18,1.21,1.23,1.26,1.28,1.31,1.34,1.36,1.39,1.42,1.44,1.47,1.5,1.55,1.6,1.65,1.7,1.75,1.8,1.85,1.9,1.95,2,2.05,2.1,2.15,2.2,2.25,2.3,2.35,2.4,2.45,2.5];
	var prmRank4 = [1,1,1.01,1.03,1.05,1.06,1.08,1.1,1.12,1.13,1.15,1.17,1.18,1.2,1.22,1.24,1.25,1.27,1.29,1.31,1.32,1.34,1.36,1.37,1.39,1.41,1.43,1.44,1.46,1.48,1.5,1.55,1.6,1.65,1.7,1.75,1.8,1.85,1.9,1.95,2,2.05,2.1,2.15,2.2,2.25,2.3,2.35,2.4,2.45,2.5];


	memoriaUtil.getParam = function(memoria,level){
		var hp  = memoria.piece.hp | 0;
		var atk = memoria.piece.attack | 0;
		var def = memoria.piece.defense | 0;
		var rank = memoria.piece.rank;
		var factor = (rank === "RANK_1") ? prmRank1 : (rank === "RANK_2") ? prmRank2 : (rank === "RANK_3") ? prmRank3 : prmRank4;

		var afterData = {};
		afterData.hp      = Math.floor(hp * factor[level]) | 0;
		afterData.attack  = Math.floor(atk * factor[level]) | 0;
		afterData.defense = Math.floor(def * factor[level]) | 0;

		return afterData;
	};

	// ---------------------------------------------------------------------------.
	// 売却価格計算
	// 売却レアリティ係数
	memoriaUtil.priceArr = [0,100,300,1000,5000,2000];

	// カード売却価格計算
	memoriaUtil.priceCalc = function(rank,lbCount){
		var price = 0;
		var memoriaRare = rank.split("_")[1];
		if(lbCount > 4) lbCount = 4;
		// level = (level | 0);
		price = memoriaUtil.priceArr[memoriaRare] * (lbCount + 1);

		return price;
	};

	// メモリアの効果分類
	memoriaUtil.getEffect = function(piece){
		var _model = piece;
		var art = (_model.lbCount < 4) ? _model.piece.pieceSkill : _model.piece.pieceSkill2;
		var loopFlg = true;
		var cnt = 1;
		var effect = [];
		// 全effectCodeをチェック
		while(loopFlg){
			if(art["art"+cnt]){
				var newEffect = "";
				var _art = art["art"+cnt];

				switch(_art.verbCode){
					case "HEAL" :
					case "RESURRECT" :
					case "REVOKE" :
						newEffect = "HEAL";
						break;
					case "BUFF" :
					case "BUFF_DYING" :
					case "BUFF_HPMAX" :
					case "BUFF_PARTY_DIE" :
					case "BUFF_DIE" :
						newEffect = "BUFF";
						break;
					case "DEBUFF" :
					case "DEBUFF_DIE" :
						newEffect = "ANTI";
						break;
					case "CONDITION_GOOD" :
					case "IGNORE" :
					case "ENCHANT" :
						newEffect = "EFFECT";
						break;
					case "CONDITION_BAD" :
						newEffect = "BADSTATUS";
						break;
					default :
						newEffect = "ETC";
						break;
				}

				// メモリアサーキット系をバフから除外してその他へ
				if(_model.pieceId === 1148 || _model.pieceId === 1147) {
					newEffect = "ETC";
				}

				if(newEffect !== "" && effect.indexOf(newEffect) === -1) {
					effect.push(newEffect);
				}
			}else{
				loopFlg = false;
			}
			cnt++;
		}

		// 万が一用
		if(effect.length === 0) effect = ["ETC"];
		return effect;
	};

	return memoriaUtil;
});
