define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'memoriaUtil'
], function (_,Backbone,common,ajaxControl,memoriaUtil) {
	'use strict';

	var MAX_RARE = 5;

	var cardUtil = {};
	var Collection = Backbone.Collection.extend();
	var Model = Backbone.Model.extend();

	cardUtil.totalEventEffectSet = function(model) {
		// イベント特効メモリア
		var i = 0;
		var canEquioNum = model.revision + 1;
		var bonusFlag   = false;
		var regularBonusFlag   = false;
		var eventType   = null;
		var eventId     = null;

		// 特攻効果アイコン
		model.eventEffect = {};
		//ボーナス合計値
		var __eventEffectValue = 0;
		while(i < canEquioNum) {
			if(model['equipPiece'+(i+1)]) {
				var memoriaModel = model['equipPiece'+(i+1)];
				if(memoriaModel.eventType) {
					model.eventType = memoriaModel.eventType.toLowerCase();
				}
				if(memoriaModel.eventId) {
					model.eventId = memoriaModel.eventId;
				}
				if(memoriaModel.eventEffect) {
					if(!model.eventEffect) {
						model.eventEffect = {};
					}
					if(!model.eventEffectValue) {
						model.eventEffectValue = 0;
					}
					model.bonusFlag = true;
					
					_.each(memoriaModel.eventEffect,function(value,effectKey) {
						if(!(effectKey in model.eventEffect)) {
							model.eventEffect[effectKey] = 0;
						}
						model.eventEffect[effectKey] += (value|0);
						__eventEffectValue = model.eventEffect[effectKey]; //同じ値を入れておく
					});
				}

				// 通常イベント
				if(memoriaModel.regularEventType) {
					model.regularEventType = memoriaModel.regularEventType.toLowerCase();
				}
				if(memoriaModel.regularEventId) {
					model.regularEventId = memoriaModel.regularEventId;
				}
				if(memoriaModel.regularEventEffect) {
					if(!model.regularEventEffect) {
						model.regularEventEffect = {};
					}
					model.regularBonusFlag = true;

					_.each(memoriaModel.regularEventEffect,function(value,effectKey) {
						if(!(effectKey in model.regularEventEffect)) {
							model.regularEventEffect[effectKey] = 0;
						}
						model.regularEventEffect[effectKey] += (value|0);
					});
				}
			}
			i=(i+1)|0;
		}
		// ボーナス合計値追加
		model.eventEffectValue = __eventEffectValue;
		// ----------------------------------------------------------------.
		return model;
	}

	cardUtil.memoriaEventSet = function() {
		var pieceList = common.storage.userPieceList;
		if(!pieceList) {
			// console.log("メモリアリストがありません")
			return;
		}
		pieceList.each(function(model){
			var newModel = cardUtil.memoriaEventCheck(model.toJSON());

			if(newModel) {
				model.set(newModel);
				// console.log(model.toJSON())
			}
		});
	};

	cardUtil.memoriaEventCheck = function(memoriaModel) { // イベント効果があるか確認
		if(!memoriaModel) return false;
		var openEventIds = [];
		var eventArr = {};
		var eventKind = {};
		var pageJson = ajaxControl.getPageJson();
		// 大イベントはかぶらない前提（かぶるなら実装変える必要あり）
		_.each(pageJson.eventList,function(event, index) {
			openEventIds.push(event.eventId);
			eventArr[event.eventId] = event.eventType;
			eventKind[event.eventId] = "EVENT";

			if(event && event.parameterMap && event.parameterMap.PROTECTED_PIECE_ID) {
				if(Number(event.parameterMap.PROTECTED_PIECE_ID) == memoriaModel.pieceId) {
					memoriaModel.unprotectLimitFlag = true;
				}
			}
		});

		// 恒常イベント
		_.each(pageJson.regularEventList,function(event, index) {
			openEventIds.push(event.regularEventId);
			eventArr[event.regularEventId] = event.regularEventType;
			eventKind[event.regularEventId] = "REGULAR";

			if(event && event.parameterMap && event.parameterMap.PROTECTED_PIECE_ID) {
				if(Number(event.parameterMap.PROTECTED_PIECE_ID) == memoriaModel.pieceId) {
					memoriaModel.unprotectLimitFlag = true;
				}
			}
		});

		// LimitedChallenge
		if (common.storage.userLimitedChallengeList) {
			common.storage.userLimitedChallengeList.each(function(model,index){
				var _model = model.toJSON();
				if (_model.challenge.bean === "LIMITED_PIECE_QUEST") {
					if (Number(_model.challenge.parameter2) == memoriaModel.pieceId) {
						memoriaModel.unprotectLimitFlag = true;
						return false;
					}
				}
			});
		}

		if(openEventIds.length == 0) return false; // イベントなかったらスルー
		if(!memoriaModel.piece || !memoriaModel.piece.pieceSkill) return false;  // メモリ構成が不正ならスルー


		var lbCount = memoriaModel.lbCount;
		var pieceSkill = null;
		memoriaModel.eventDescription = "";

		if(lbCount < 4) {
			pieceSkill = memoriaModel.piece.pieceSkill;
		} else {
			pieceSkill = memoriaModel.piece.pieceSkill2;
		}

		var regularEventId = pieceSkill.regularEventId;
		if(regularEventId && openEventIds.indexOf(regularEventId) >= 0) {
			// Regularイベント開催中だったら
			memoriaModel.regularEventId   = regularEventId;
			memoriaModel.regularEventType = eventArr[regularEventId];
			memoriaModel.regularEventEffect      = {};
			for (var i=1; i<=9; i++) {
				var art = pieceSkill["regularEventArt"+i];
				if(art) {
					if(!(art.effectCode in memoriaModel.regularEventEffect)) {
						var newCode = art.effectCode;
						if (art.genericValue) newCode += "_" + art.genericValue;
						memoriaModel.regularEventEffect[newCode] = 0;
					}
					if (art.effectValue) memoriaModel.regularEventEffect[newCode] += art.effectValue;
				}
			}

			memoriaModel.eventDescription += "<span class='c_red'>" + pieceSkill.regularEventDescription + "</span>";
		}

		var eventId = pieceSkill.eventId;
		if(eventId && openEventIds.indexOf(eventId) >= 0) {
			// イベント開催中だったら
			memoriaModel.eventId   = eventId;
			memoriaModel.eventType = eventArr[eventId];
			memoriaModel.eventEffect      = {};

			for(var i=1; i<=3; i++) {
				var art = pieceSkill["eventArt"+i];
				if(art) {
					if(!(art.effectCode in memoriaModel.eventEffect)) {
						var newCode = art.effectCode + "_" + art.genericValue;
						memoriaModel.eventEffect[newCode] = 0;
					}
					memoriaModel.eventEffect[newCode] += art.effectValue;
				}
			}

			memoriaModel.eventDescription += "<span class='c_red'>" + pieceSkill.eventDescription + "</span>";
		}

		if (!memoriaModel.eventId && !memoriaModel.regularEventId) {
			// console.log("イベント開催中じゃない");
			if(!memoriaModel.unprotectLimitFlag) {
				return false;
			}
		}

		return memoriaModel;
	};

	function eventCharaCheck(charaModel,eventMaster) {
		if(!charaModel.charaId)      return false;
		if(!eventMaster)             return false;

		if(!common.storage.gameUser) return false;
		if(common.storage.gameUser.toJSON().eventTrainingId !== eventMaster.eventId) return false;

		var eventCharaFlag = false;

		var charaId        = charaModel.charaId;
		var eventCharaIds  = common.storage.gameUser.toJSON().trainingSelectedCharaNos.split(",");

		_.each(eventCharaIds,function(id) {
			if(charaId == id) {
				eventCharaFlag = true;
			}
		});

		return eventCharaFlag;
	}

	/**
	* userCharaListを元にuserCardListからカード情報を抜き取り、userCardListを作成
	* ついでにcommon.storage.userPieceListに装備者情報を付与
	*/
	cardUtil.createCardList = function() {
		var userCardList = [];
		var that = this;

		// console.log("------ createCardList ------");
		var pageJson = ajaxControl.getPageJson();
		var eventMaster = null;
		if(pageJson.eventList) {
			eventMaster = pageJson.eventList.filter(function(event,index){
				if(event.eventType == "TRAINING")     return true;
			})[0];
		}

		var charaList = common.storage.userCharaList;
		var cardList  = common.storage.userCardList;
		var pieceList = common.storage.userPieceList;
		var deckList  = common.storage.userDeckList;
		var pieceSetList = common.storage.userPieceSetList;

		// 装備しているカードの情報を持っているメモリアを一旦リセット
		// console.log(pieceList)
		pieceList.each(function(model) {
			model.set({
				equipFlag   : false,
				eventType   : null,
				eventId     : null,
				eventEffect : null,
				regularEventId : null,
				regularEventEffect : null,
				eventDescription: null,
				equipDeck   : []
			},{silent:true});

			// console.log(model.toJSON())
		});

		deckList.each(function(model) {
			var _model = model.toJSON();
			_.each(_model,function(value , key) {
				if(key.indexOf('userPieceId') !== -1) {
					var deckKey = (_model.deckType >= 11 && _model.deckType <= 19) ? 'quest' :
								  (_model.deckType == 20) ? 'support' :
								  (_model.deckType == 21) ? 'arena' :
								  (_model.deckType == 22) ? 'eventArena' : 'event';
					var pieceModel = pieceList.findWhere({id:value});
					var _pieceModel = pieceModel.toJSON();
					_pieceModel.equipDeck.push(deckKey);
					pieceModel.set(_pieceModel,{silent:true});
				}
			});
		});

		pieceSetList.each(function(model) {
			var _model = model.toJSON();
			_.each(_model,function(value , key) {
				if(key.indexOf('userPieceId') !== -1) {
					var deckKey = 'pieceSet';
					var pieceModel = pieceList.findWhere({id:value});
					var _pieceModel = pieceModel.toJSON();
					_pieceModel.equipDeck.push(deckKey);
					pieceModel.set(_pieceModel,{silent:true});
				}
			});
		});

		pieceList.each(function(model) {
			var _model = model.toJSON();
			_model.equipDeck.filter( function(value, index) {
				return index === _model.equipDeck.indexOf(value) ;
			});
			if(_model.equipDeck.length !== 0) {
				_model.equipFlag = true;
				// console.log(_model.equipDeck);
			}
			model.set(_model,{silent:true});
		});

		cardUtil.memoriaEventSet();

		_.each(charaList.toJSON(),function(charaModel) {
			var userCardId = charaModel.userCardId;

			if(eventMaster) {
				charaModel.eventFlag = eventCharaCheck(charaModel,eventMaster);
			}

			charaModel.chara.description = charaModel.chara.description.replace(/＠/g, "<br>");
			var createdAt = charaModel.createdAt;//ソート用
			_.each(cardList.toJSON(),function(cardModel) {
				if(userCardId == cardModel.id) {
					// 追加情報を付与
					var model = cardUtil.addExStatus($.extend(charaModel,cardModel));
					model.createdAt = createdAt;// ソート用
					if(model.eventFlag) {
						// console.log('training:',model);
					}
					userCardList.push(model);
				}
			});
		});

		// すでにあったら情報更新
		if(common.hasModel("userCardListEx")) {
			_.each(userCardList ,function(model,index) {
				var oldModel = common.storage.userCardListEx.findWhere({id:model.id});
				oldModel.clear({silent:true});
				oldModel.set(model,{silent:true});
			});
		} else {
			common.storage.userCardListEx = new Collection(userCardList);
		}
	};

	var typeText = {
		'BALANCE' : 'バランス',
		'ATTACK'  : 'アタック',
		'DEFENSE' : 'ディフェンス',
		'MAGIA'   : 'マギア',
		'HEAL'    : 'ヒール',
		'SUPPORT' : 'サポート',
		'ULTIMATE': 'アルティメット',
		'CIRCLE_MAGIA' : '円環マギア',
		'CIRCLE_SUPPORT' : '円環サポート',
		'EXCEED'  : 'エクシード',
		'AKUMA'  : 'あくま',
		'ARUTEMETTO'  : 'あるてぃめっと',
		'INFINITE'  : 'インフィニット',
		'MUGENDAI':'むげんだい',
		'MYSTIC':'ミスティック',
		'DEVIL':'悪魔',
		'LASTCONNECT':'ラストコネクト',
	};

	cardUtil.addExStatus = function(model,memoriaList,doppelList,userDeck) { // memoriaListはsupportSelectページ用
		model.maxRare      = cardUtil.maxRank(model);
		model.maxLevel     = cardUtil.getMaxLevel(model.card.rank);
		model.expRatio     = cardUtil.expRatio(model);
		model.expRequire   = cardUtil.expRequire(model);
		model.nextMaxLevel = cardUtil.getNextMaxLevel(model.card.rank);
		model.nextCard     = cardUtil.nextCard(model);
		model.episodeLevel = cardUtil.getEpisodeLevel(model);
		model.episodeRatio = cardUtil.episodeRatio(model);
		model.epExpRatio   = cardUtil.getEpisodeExpRatio(model);
		model.epExpRequire = cardUtil.getEpisodeExpRequire(model);
		model.charaType    = typeText[model.chara.initialType];

		// 精神強化数の計算
		if (common.storage.userCharaEnhancementCellList) {
			var _opendPointList = common.storage.userCharaEnhancementCellList.where({ charaId: model.charaId });
			model.enhanceCnt = _opendPointList.length ? _opendPointList.length-1 : 0;
		}

		// 属性強化数の計算
		if (common.storage.userCharaAtbEnhancementCellList) {
			var _opendPointList = common.storage.userCharaAtbEnhancementCellList.where({ charaId: model.charaId });
			model.atbEnhanceCnt = _opendPointList.length ? _opendPointList.length : 0;
		}

		// 念の為
		if(!model.addendHp)      model.addendHp = 0;
		if(!model.addendAttack)  model.addendAttack = 0;
		if(!model.addendDefense) model.addendDefense = 0;
		//属性強化の追加
		model.composeAttribute = common.getTargetComposeAttribute({
			attributeId: model.chara.attributeId,
		});

		if(memoriaList) {
			_.each(memoriaList,function(pieceModel) {
				pieceModel = cardUtil.memoriaEventCheck(pieceModel);
			});
		}

		var i;
		if(model.supportFlag) {
			model.chara.description = model.chara.description.replace(/＠/g, "<br>");
			// ドッペル
			// console.log("-----------------------")
			model.doppelOpenFlag = false;
			if(doppelList) {
				if(model.card.doppel) {
					var flag = doppelList.filter(function(doppelModel){
						return (model.card.doppel.id == doppelModel.doppelId);
					});

					var rankFlag = (Number(model.card.rank.split("_")[1]) >= 5);
					var epLvFlag = (model.episodeLevel >= 5);
					var magiaLvFlag = (model.magiaLevel >= 5);

					if(flag.length !== 0 && rankFlag && epLvFlag && magiaLvFlag) {
						model.doppelOpenFlag = true;
					} else {
						model.doppelOpenFlag = false;
					}
				} else {
					model.doppelOpenFlag = false;
				}
			} else {
				model.doppelOpenFlag = false;
			}

			// メモリア
			model.addHp          = model.hp;
			model.addAttack      = model.attack;
			model.addDefense     = model.defense;
			model.memoriaHp      = 0;
			model.memoriaAttack  = 0;
			model.memoriaDefense = 0;
			if(model.isNpc) {
				var i = 0;
				while(i < 4) {
					var equipKey = 'equipPiece' + (i+1);
					if(memoriaList && memoriaList.length && memoriaList[i]) {
						model[equipKey] = memoriaList[i];
						model[equipKey].maxLevel = memoriaUtil.getMaxLevel(model[equipKey].rank,model[equipKey].lbCount);

						model.addHp      += model[equipKey].hp;
						model.addAttack  += model[equipKey].attack;
						model.addDefense += model[equipKey].defense;

						model.memoriaHp      += model[equipKey].hp;
						model.memoriaAttack  += model[equipKey].attack;
						model.memoriaDefense += model[equipKey].defense;

						var eventSetModel = cardUtil.memoriaEventCheck(model[equipKey]);
						if(eventSetModel) {
							var pieceModel = eventSetModel;
							if(eventSetModel.eventId) {
								model.bonusMemoriaFlag = true;
								model.bonusEventId     = eventSetModel.eventId;
								model.bonusEventType   = eventSetModel.eventType;
							}
							if(eventSetModel.regularEventId) {
								model.bonusReuglarMemoriaFlag = true;
								model.bonusReuglarEventId     = eventSetModel.regularEventId;
								model.bonusReuglarEventType   = eventSetModel.regularEventType;
							}
						}

					} else {
						model[equipKey] = null;
					}

					i=(i+1)|0;
				}
			} else {
				_.each(userDeck,function(value,key) {
					if(key.indexOf('userCardId') !== -1 && model.userCardId == value) {
						var index    = ('00' + key.split('userCardId')[1]).slice(-2);
						var pieceKey = 'userPieceId' + index;

						var i = 0;
						while(i < 4) {
							var equipKey = 'equipPiece' + (i+1);
							var _pieceKey = pieceKey + (i+1);

							if(userDeck[_pieceKey]) {
								model[equipKey] = _.findWhere(memoriaList,{"id": userDeck[_pieceKey]});
								model[equipKey].maxLevel = memoriaUtil.getMaxLevel(model[equipKey].rank,model[equipKey].lbCount);

								model.addHp      += model[equipKey].hp;
								model.addAttack  += model[equipKey].attack;
								model.addDefense += model[equipKey].defense;

								model.memoriaHp      += model[equipKey].hp;
								model.memoriaAttack  += model[equipKey].attack;
								model.memoriaDefense += model[equipKey].defense;


								var eventSetModel = cardUtil.memoriaEventCheck(model[equipKey]);
								if (eventSetModel) {
									pieceModel = eventSetModel;
									if(eventSetModel.eventId) {
										model.bonusMemoriaFlag = true;
										model.bonusEventId     = eventSetModel.eventId;
										model.bonusEventType   = eventSetModel.eventType;
									}
									if(eventSetModel.regularEventId) {
										model.bonusReuglarMemoriaFlag = true;
										model.bonusReuglarEventId     = eventSetModel.regularEventId;
										model.bonusReuglarEventType   = eventSetModel.regularEventType;
									}
								}
							} else {
								model[equipKey] = null;
							}

							i=(i+1)|0;
						}
					}
				});
			}
			model = cardUtil.totalEventEffectSet(model);
		} else {
			model.chara.description = model.chara.description.replace(/＠/g, "<br>");
			model = cardUtil.totalEventEffectSet(model);

			// Live2d
			var live2dList      = common.storage.userLive2dList;
			var charaLive2dList = (live2dList.where({charaId:model.charaId})) ? live2dList.where({charaId:model.charaId}) : [];

			if(charaLive2dList.length > 0) {
				charaLive2dList.sort(function(a,b){
					if( a.toJSON().live2dId < b.toJSON().live2dId ) return -1;
					if( a.toJSON().live2dId > b.toJSON().live2dId ) return 1;
					return 0;
				});
			}

			model.live2dList = [];

			// console.log(live2dList);
			_.each(charaLive2dList,function(live2dModel,index) {
				// console.log("live2d",model,live2dModel,index);
				// console.log("-------------");
				var _live2dModel = live2dModel.toJSON();

				if(model.live2dId == _live2dModel.live2dId) {
					model.live2dIndex = index;
				}

				var _model = {};
				_model.live2dId      = _live2dModel.live2dId;
				_model.description   = _live2dModel.live2d.description;
				_model.voicePrefixNo = _live2dModel.live2d.voicePrefixNo;
				model.live2dList.push(_model);
			});
			// console.log("☆",model.live2dList);

			model.live2dList.sort(function(a,b){
				if( a.live2dId < b.live2dId ) return -1;
				if( a.live2dId > b.live2dId ) return 1;
				return 0;
			});

			// ドッペル
			doppelList = common.storage.userDoppelList;
			if(model.card.doppel) {
				if(doppelList.findWhere({doppelId:model.card.doppel.id})) {
					model.doppelOpenFlag = true;
				} else {
					model.doppelOpenFlag = false;
				}
			} else {
				model.doppelOpenFlag = false;
			}

			// Dungeon
			if(model.mp){
				model.mp = Math.floor(model.mp / 10) | 0;
				if(model.mp > 100){
					model.dp = model.mp - 100;
					model.mp = 100;
				}
			}
		}

		// 覚醒ステータス
		model.customizeBonus = {
			"HP"     : "+0%",
			"ATTACK" : "+0%",
			"DEFENSE": "+0%",
			"ACCEL"  : "+0%",
			"BLAST"  : "+0%",
			"CHARGE" : "+0%"
		};
		i = 0;
		while(i < 6) {
			var _model = {};
			var isSet     = model["customized"+(i+1)] || false;
			var bonusCode = (model.card.cardCustomize) ? model.card.cardCustomize["bonusCode"+(i+1)] || null : null;
			var bonusNum  = (model.card.cardCustomize) ? model.card.cardCustomize["bonusNum"+(i+1)] || null : null;

			if(isSet) {
				model.customizeBonus[bonusCode] = "+" + ((bonusNum|0)/10) + "%";
			}

			i=(i+1)|0;
		}
		return model;
	};

	cardUtil.maxRank = function(model) {
		// console.log(model)
		var maxRank = null;
		if(model && model.chara) {
			// maxレアリティを登録 ---------------------------------------.
			for (var i = 1; i <= MAX_RARE; i++) {
				if(!model.chara["evolutionCard"+i]) break;

				maxRank = model.chara["evolutionCard"+i].rank;
				maxRank = Number(maxRank.split("_")[1]);
			}
			if(!maxRank) maxRank = Number(model.card.rank.split("_")[1]);
			// --------------------------------------------------------.
		} else if(model) {
			// maxレアリティを登録 ---------------------------------------.
			for (var i = 1; i <= MAX_RARE; i++) {
				if(!model["evolutionCard"+i]) break;

				maxRank = model["evolutionCard"+i].rank;
				maxRank = Number(maxRank.split("_")[1]);
			}
			if(!maxRank) maxRank = Number(model.defaultCard.rank.split("_")[1]);
			// --------------------------------------------------------.
		}



		return maxRank;
	};

	cardUtil.nextCard = function(model) {
		var chara = model.chara;
		var cardId = model.cardId;
		var currentCardRank =  Number(model.card.rank.split("RANK_")[1]);

		var nextCard =	(chara.defaultCardId === cardId) ? chara.evolutionCard1 :
						(chara.evolutionCardId1 === cardId) ? chara.evolutionCard2 :
						(chara.evolutionCardId2 === cardId) ? chara.evolutionCard3 :
						(chara.evolutionCardId3 === cardId) ? chara.evolutionCard4 :
						(chara.evolutionCardId4 === cardId) ? chara.evolutionCard5 : null;

		return nextCard;
	};

	cardUtil.expRequire = function(model) {
		var baseLv = model.level;
		var nextExp = ((cardUtil.exArr[baseLv]-cardUtil.exArr[baseLv-1]) - model.experience )| 0;

		return nextExp;
	};

	cardUtil.expRatio = function(model) {
		var baseLv = model.level;
		var ratio = (model.experience / (cardUtil.exArr[baseLv]-cardUtil.exArr[baseLv-1])) * 100;
		ratio = Math.floor(ratio);

		if(model.maxLevel && model.level == model.maxLevel) { // LvMaxだったら todo: Lvは定数に
			ratio = 100;
		}
		if(!ratio) {
			ratio = 0;
		}

		return ratio;
	};

	// ------------------------------------------------------------------------.
	// エピソード経験値
	cardUtil.episodeExp = [0,1000,4000,14000,64000];
	cardUtil.getEpisodeLevel = function(model) {
		var epLv = 0;
		_.each(cardUtil.episodeExp,function(exp,index) {
			if(exp <= model.bondsTotalPt) {
				epLv = index+1;
			}
		});

		return epLv;
	};

	cardUtil.getEpisodeExpRequire = function(model) {
		var requirePoint = 0;
		_.each(cardUtil.episodeExp,function(exp,index) {
			if(exp > model.bondsTotalPt && requirePoint == 0) {
				requirePoint = (exp - model.bondsTotalPt) | 0;
			}
		});

		return requirePoint;
	};

	cardUtil.getEpisodeExpRatio = function(model) {
		var exp = 100;
		var epLv = 0;
		_.each(cardUtil.episodeExp,function(exp,index) {
			if(exp <= model.bondsTotalPt) {
				epLv = index+1;
			}
		});

		if(epLv !== 5) {
			exp = (model.bondsTotalPt - cardUtil.episodeExp[epLv - 1]) / (cardUtil.episodeExp[epLv] - cardUtil.episodeExp[epLv-1]) * 100 || 0;
			exp = Math.floor(exp);
		}

		return exp;
	};

	cardUtil.getEpisodeComposeExp = function(itemArr) {
		var itemExp = 0;
		if(itemArr instanceof Array) { // []
			// 獲得経験値登録
			_.each(itemArr,function(item) {
				var itemId = item.model.itemId || item.model.toJSON().itemId;
				if(itemId.indexOf("_PP") != -1) {
					itemExp += cardUtil.itemExp[2];
				} else if(itemId.indexOf("_P") != -1) {
					itemExp += cardUtil.itemExp[1];
				} else {
					itemExp += cardUtil.itemExp[0];
				}
			});
		} else { // {}
			$.each(itemArr,function(key,data) {
				if (key !== "length") {
					var itemId = key;
					if(itemId.indexOf("_PP") != -1) {
						itemExp += (cardUtil.itemExp[2]) * data;
					} else if(itemId.indexOf("_P") != -1) {
						itemExp += (cardUtil.itemExp[1]) * data;
					} else {
						itemExp += (cardUtil.itemExp[0]) * data;
					}
				}
			});
		}

		return itemExp;
	};

	cardUtil.getCanUseEpisodeComposeItemNum = function(exp,itemArr,selectItemId) {
		var itemExp = 0;
		$.each(itemArr,function(key,data) {
			if (key !== "length") {
				var itemId = key;
				if(itemId !== selectItemId) {
					if(itemId.indexOf("_PP") != -1) {
						itemExp += cardUtil.itemExp[2] * data;
					} else if(itemId.indexOf("_P") != -1) {
						itemExp += cardUtil.itemExp[1] * data;
					} else {
						itemExp += cardUtil.itemExp[0] * data;
					}
				}
			}
		});
		var nowExp = exp + itemExp;
		var maxExp = cardUtil.episodeExp[4];

		var selectItemExp = 0;
		if(selectItemId.indexOf("_PP") != -1) {
			selectItemExp = cardUtil.itemExp[2];
		} else if(selectItemId.indexOf("_P") != -1) {
			selectItemExp = cardUtil.itemExp[1];
		} else {
			selectItemExp = cardUtil.itemExp[0];
		}
		var needExp = maxExp - nowExp;

		return Math.ceil(needExp / selectItemExp);
	}

	cardUtil.episodeRatio = function(model) {
		var baseLv = model.episodeLevel;
		var ratio = (model.bondsTotalPt / (cardUtil.episodeExp[baseLv]-cardUtil.episodeExp[baseLv-1])) * 100;
		ratio = Math.floor(ratio);

		if(baseLv == 5) { // LvMaxだったら todo: Lvは定数に
			ratio = 100;
		}
		if(!ratio) {
			ratio = 0;
		}

		return ratio;
	};


	// ------------------------------------------------------------------------.
	// 強化後レベル予想

	//経験値累計
	cardUtil.exArr = [0, 110, 250, 430, 660, 950, 1310, 1750, 2280, 2910, 3640, 4470, 5400, 6430, 7560, 8790, 10120, 11550, 13080, 14710, 16440, 18270, 20200, 22230, 24360, 26590, 28920, 31350, 33880, 36510, 39240, 42070, 45000, 48030, 51160, 54390, 57720, 61150, 64680, 68310, 72040, 75870, 79800, 83830, 87960, 92190, 96520, 100950, 105480, 110110, 114840, 119670, 124600, 129630, 134760, 139990, 145320, 150750, 156280, 161910, 167640, 173470, 179400, 185430, 191560, 197790, 204120, 210550, 217080, 223710, 230440, 237270, 244200, 251230, 258360, 265590, 272920, 280350, 287880, 295510, 303240, 311070, 319000, 327030, 335160, 343390, 351720, 360150, 368680, 377310, 386040, 394870, 403800, 412830, 421960, 431190, 440520, 449950, 459480, 469110];

	// 強化アイテム経験値
	cardUtil.itemExp = [100,500,2500];

	cardUtil.getComposeExp = function(rank,lv,att,itemArr) {
		var itemExp = 0;
		if(itemArr instanceof Array) { // []
			// 獲得経験値登録
			_.each(itemArr,function(item) {
				var itemId = item.model.itemId || item.model.toJSON().itemId;
				// console.log("itemId:",itemId);
				var attrMatch = (itemId.indexOf(att) != -1 || itemId.indexOf("ALL") != -1) ? 1.5 : 1;
				if(itemId.indexOf("_PP") != -1) {
					itemExp += cardUtil.itemExp[2] * attrMatch;
				} else if(itemId.indexOf("_P") != -1) {
					itemExp += cardUtil.itemExp[1] * attrMatch;
				} else {
					itemExp += cardUtil.itemExp[0] * attrMatch;
				}
			});
		} else { // {}
			$.each(itemArr,function(key,data) {
				if (key !== "length") {
					var itemId = key;
					// console.log("itemId:",itemId);
					var attrMatch = (itemId.indexOf(att) != -1 || itemId.indexOf("ALL") != -1) ? 1.5 : 1;
					if(itemId.indexOf("_PP") != -1) {
						itemExp += (cardUtil.itemExp[2] * attrMatch) * data;
					} else if(itemId.indexOf("_P") != -1) {
						itemExp += (cardUtil.itemExp[1] * attrMatch) * data;
					} else {
						itemExp += (cardUtil.itemExp[0] * attrMatch) * data;
					}
				}
			});
		}

		return itemExp;
	};

	cardUtil.getCanUseComposeItemNum = function(level,maxLevel,exp,att,itemArr,selectItemId) {
		var itemExp = 0;
		$.each(itemArr,function(key,data) {
			if (key !== "length") {
				var itemId = key;
				if(itemId !== selectItemId) {
					var attrMatch = (itemId.indexOf(att) !== -1 || itemId.indexOf("ALL") !== -1) ? 1.5 : 1;
					if(itemId.indexOf("_PP") != -1) {
						itemExp += (cardUtil.itemExp[2] * attrMatch) * data;
					} else if(itemId.indexOf("_P") != -1) {
						itemExp += (cardUtil.itemExp[1] * attrMatch) * data;
					} else {
						itemExp += (cardUtil.itemExp[0] * attrMatch) * data;
					}
				}
			}
		});
		var nowExp = cardUtil.exArr[level - 1] + exp + itemExp;
		var maxExp = cardUtil.exArr[maxLevel - 1];

		var selectItemExp = 0;
		var attrMatch     = (selectItemId.indexOf(att) !== -1 || selectItemId.indexOf("ALL") !== -1) ? 1.5 : 1;
		if(selectItemId.indexOf("_PP") != -1) {
			selectItemExp = (cardUtil.itemExp[2] * attrMatch);
		} else if(selectItemId.indexOf("_P") != -1) {
			selectItemExp = (cardUtil.itemExp[1] * attrMatch);
		} else {
			selectItemExp = (cardUtil.itemExp[0] * attrMatch);
		}
		var needExp = maxExp - nowExp;
		if (needExp < 0) needExp = 0;

		return Math.ceil(needExp / selectItemExp);
	}

	// ------------------------------------------------------------------------.

	// ベース係数
	var rankFactorObj = {
		"RANK_1": 1.0,
		"RANK_2": 2.0,
		"RANK_3": 3.0,
		"RANK_4": 4.0,
		"RANK_5": 5.0
	}
	// 素材係数
	var itemFactorObj = {
		"RANK_1": 1.0,
		"RANK_2": 2.0,
		"RANK_3": 3.0
	}
	var episodeItemFactorObj = {
		"RANK_1": 4.0,
		"RANK_2": 8.0,
		"RANK_3": 12.0
	}
	// 素材基礎値
	var itemBaseObj = {
		"RANK_1": 5,
		"RANK_2": 50,
		"RANK_3": 400
	}
	// ------------------------------------------------------------------------.
	// 強化に必要な費用 ランク係数
	cardUtil.getComposeCost = function(rank,level,useItemObj) {
		var cost = 0;
		var itemFactor;
		var itemBase;
		var rankFactor = rankFactorObj[rank] || 0;

		_.each(useItemObj,function(num,itemId) {
			var itemRank = itemId.split("_")[3] || "N";
			switch(itemRank) {
				case "PP":
					itemRank = "RANK_3";
				break;

				case "P":
					itemRank = "RANK_2";
				break;

				case "N":
					itemRank = "RANK_1";
				break;
			}

			itemBase   = itemBaseObj[itemRank];
			itemFactor = itemFactorObj[itemRank];

			cost += Math.floor((itemBase + ((level - 1) * itemFactor)) * rankFactor) * num;
		});

		return cost;
	};
	cardUtil.getEpisodeComposeCost = function(rank,level,useItemObj) {
		var cost = 0;
		var itemFactor;
		var itemBase;
		var rankFactor = rankFactorObj[rank] || 0;

		_.each(useItemObj,function(num,itemId) {
			var itemRank = itemId.split("_")[2] || "N";
			switch(itemRank) {
				case "PP":
					itemRank = "RANK_3";
				break;

				case "P":
					itemRank = "RANK_2";
				break;

				case "N":
					itemRank = "RANK_1";
				break;
			}

			itemBase   = itemBaseObj[itemRank];
			itemFactor = episodeItemFactorObj[itemRank];

			// console.log("レベル:",level);
			// console.log("素材基礎値:",itemBase);
			// console.log("素材係数:",itemFactor);
			// console.log("ベース係数:",rankFactor);

			cost += Math.floor((itemBase + ((level - 1) * itemFactor)) * rankFactor) * num;
		});

		return cost;
	};
	// ------------------------------------------------------------------------.
	// MaxLevel計算

	// カード最大レベル(99)
	var CARD_LEVEL_MAX100 = 100;

	var getMaxLevel = function(rank) {
		switch (rank) {
			case "RANK_1":
				return 40;
			case "RANK_2":
				return 50;
			case "RANK_3":
				return 60;
			case "RANK_4":
				return 80;
			case "RANK_5":
				return 100;
			default:
				return 1;
		}
	};

	var getNextMaxLevel = function(rank) {
		switch (rank) {
			case "RANK_1":
				return 50;
			case "RANK_2":
				return 60;
			case "RANK_3":
				return 80;
			case "RANK_4":
				return 100;
			case "RANK_5":
				return 100;
			default:
				return 1;
		}
	};

	cardUtil.getMaxLevel = function(rank) {
		var maxLevel = getMaxLevel(rank);

		return maxLevel;
	};

	cardUtil.getNextMaxLevel = function(rank) {
		var maxLevel = getNextMaxLevel(rank);

		return maxLevel;
	};



	//****************************************
	// 強化後パラメータ取得
	//
	//****************************************

	cardUtil.getAfterParam = function(cardId,charaData,rev,afterLevel){
		// カード基本情報
		var baseCardData =	(charaData.defaultCardId === cardId) ? charaData.defaultCard :
							(charaData.evolutionCardId1 === cardId) ? charaData.evolutionCard1 :
							(charaData.evolutionCardId2 === cardId) ? charaData.evolutionCard2 :
							(charaData.evolutionCardId3 === cardId) ? charaData.evolutionCard3 :
							(charaData.evolutionCardId4 === cardId) ? charaData.evolutionCard4 : charaData.evolutionCard5;

		var growType  = baseCardData.growthType,
			cardRank  = baseCardData.rank;

		// 上限値の設定
		var maxLevel = cardUtil.getMaxLevel(cardRank);
		if(afterLevel > maxLevel){
			afterLevel = maxLevel;
		}

		// 強化後ステータス格納用
		var afterStatus = {"attack":baseCardData.attack,"defense":baseCardData.defense,"hp":baseCardData.hp};

		// ランクによる成長率
		var rankFactor = levelUpFactor(cardRank,afterLevel);

		// 成長タイプによる倍率
		var growthFactor = customStatus(growType);

		// console.log("base",baseCardData);
		// console.log("rankFactor",rankFactor);
		// console.log("growthFactor",growthFactor);

		afterStatus.attack  = (baseCardData.attack + (baseCardData.attack * rankFactor * growthFactor.atk) | 0);
		afterStatus.defense = (baseCardData.defense + (baseCardData.defense * rankFactor * growthFactor.def) | 0);
		afterStatus.hp      = (baseCardData.hp + (baseCardData.hp * rankFactor * growthFactor.hp) | 0);

		return afterStatus;

	};

	// レベルUPでのステータスアップ率
	var levelUpFactor = function(rank,level){
		var rank1arr = [0,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.41,0.46,0.51,0.56,0.61,0.66,0.71,0.76,0.82,0.87,0.92,0.97,1.02,1.07,1.12,1.17,1.23,1.28,1.33,1.38,1.43,1.48,1.53,1.58,1.64,1.69,1.74,1.79,1.84,1.89,1.94,2];
		var rank2arr = [0,0.04,0.08,0.13,0.17,0.22,0.26,0.31,0.35,0.40,0.44,0.49,0.53,0.58,0.62,0.67,0.71,0.76,0.80,0.85,0.89,0.94,0.98,1.03,1.07,1.12,1.16,1.21,1.25,1.30,1.34,1.39,1.43,1.48,1.52,1.57,1.61,1.66,1.70,1.75,1.79,1.84,1.88,1.93,1.97,2.02,2.06,2.11,2.15,2.2];
		var rank3arr = [0,0.04,0.08,0.12,0.16,0.2,0.24,0.28,0.32,0.36,0.4,0.44,0.48,0.52,0.56,0.61,0.65,0.69,0.73,0.77,0.81,0.85,0.89,0.93,0.97,1.01,1.05,1.09,1.13,1.17,1.22,1.26,1.3,1.34,1.38,1.42,1.46,1.5,1.54,1.58,1.62,1.66,1.7,1.74,1.78,1.83,1.87,1.91,1.95,1.99,2.03,2.07,2.11,2.15,2.19,2.23,2.27,2.31,2.35,2.4];
		var rank4arr = [0,0.03,0.06,0.09,0.13,0.16,0.19,0.23,0.26,0.29,0.32,0.36,0.39,0.42,0.46,0.49,0.52,0.55,0.59,0.62,0.65,0.69,0.72,0.75,0.78,0.82,0.85,0.88,0.92,0.95,0.98,1.02,1.05,1.08,1.11,1.15,1.18,1.21,1.25,1.28,1.31,1.34,1.38,1.41,1.44,1.48,1.51,1.54,1.57,1.61,1.64,1.67,1.71,1.74,1.77,1.81,1.84,1.87,1.9,1.94,1.97,2,2.04,2.07,2.1,2.13,2.17,2.2,2.23,2.27,2.3,2.33,2.36,2.4,2.43,2.46,2.5,2.53,2.56,2.6];
		var rank5arr = [0,0.03,0.06,0.09,0.12,0.15,0.18,0.21,0.24,0.27,0.3,0.33,0.36,0.39,0.42,0.45,0.48,0.51,0.54,0.57,0.6,0.63,0.66,0.69,0.72,0.75,0.78,0.81,0.84,0.87,0.9,0.93,0.96,1,1.03,1.06,1.09,1.12,1.15,1.18,1.21,1.24,1.27,1.3,1.33,1.36,1.39,1.42,1.45,1.48,1.51,1.54,1.57,1.6,1.63,1.66,1.69,1.72,1.75,1.78,1.81,1.84,1.87,1.9,1.93,1.96,2,2.03,2.06,2.09,2.12,2.15,2.18,2.21,2.24,2.27,2.3,2.33,2.36,2.39,2.42,2.45,2.48,2.51,2.54,2.57,2.6,2.63,2.66,2.69,2.72,2.75,2.78,2.81,2.84,2.87,2.9,2.93,2.96,3];

		switch(rank){
			case "RANK_1":
				return rank1arr[level - 1];
			case "RANK_2":
				return rank2arr[level - 1];
			case "RANK_3":
				return rank3arr[level - 1];
			case "RANK_4":
				return rank4arr[level - 1];
			case "RANK_5":
				return rank5arr[level - 1];
			default :
				return 1;
		}

	};

	// カスタムステータス修正値
	var customStatus = function(growType){
		var custom = {};

		switch(growType){
			case "BALANCE" :
				custom.atk = 1;
				custom.def = 1;
				custom.hp  = 1;
				break;
			case "ATTACK" :
				custom.atk = 1.03;
				custom.def = 0.97;
				custom.hp  = 0.98;
				break;
			case "DEFENSE":
				custom.atk = 0.98;
				custom.def = 1.05;
				custom.hp  = 0.97;
				break;
			case "HP":
				custom.atk = 0.97;
				custom.def = 0.98;
				custom.hp  = 1.04;
				break;
			case "ATKDEF":
				custom.atk = 1.02;
				custom.def = 1.01;
				custom.hp  = 0.99;
				break;
			case "ATKHP":
				custom.atk = 1.01;
				custom.def = 0.99;
				custom.hp  = 1.02;
				break;
			case "DEFHP":
				custom.atk = 0.99;
				custom.def = 1.02;
				custom.hp  = 1.01;
				break;
		}


		return custom;
	};

	return cardUtil;
});
