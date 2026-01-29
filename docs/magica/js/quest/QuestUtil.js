define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
], function (_,Backbone,common,ajaxControl,cmd) {
	'use strict';

	var QuestUtil = {};
	var searchFlag = false;

	// チャプターIDからセクション、クエストを拾ってくる ---------------------------------.
	QuestUtil.createChapterModel = function(chapterId) {
		var chapterModel = common.storage.userChapterList.findWhere({chapterId: chapterId}).toJSON();
		var sectionList  = _.filter(common.storage.userSectionList.toJSON(),function(sectionModel) {
			return sectionModel.section.genericId == chapterModel.chapterId;
		});
		var mainQuestList = _.filter(common.storage.userQuestBattleList.toJSON(),function(questModel) {
			return questModel.questBattle.sectionId >= 100000 && questModel.questBattle.sectionId < 200000;
		});

		chapterModel.sectionList = [];
		_.each(sectionList,function(section,index){
			section.section.questBattleList = [];
			_.each(mainQuestList,function(questBattle){
				if(section.sectionId === questBattle.questBattle.sectionId){
					if(common.mainQuestMode == questBattle.questBattle.questBattleType) {
						var mission1 = (questBattle.missionStatus1 === 'CLEARED') ? 'cleared' : null;
						var mission2 = (questBattle.missionStatus2 === 'CLEARED') ? 'cleared' : null;
						var mission3 = (questBattle.missionStatus3 === 'CLEARED') ? 'cleared' : null;
						var questState = (questBattle.cleared) ? 'clear' : 'new';
						questBattle.questState = (mission1 && mission2 && mission3) ? 'comp' : questState;

						section.section.questBattleList.push(questBattle);
					}
				}
			});

			if(section.section.questBattleList.length) {
				section.section.questBattleList.sort(function(a,b){
					return a.questBattle.sectionIndex - b.questBattle.sectionIndex;
				});
				chapterModel.sectionList.push(section);
			}
		});

		chapterModel.sectionList.sort(function(a,b){
			if( a.sectionId > b.sectionId ) return -1;
			if( a.sectionId < b.sectionId ) return 1;
			return 0;
		});

		return chapterModel;
	};

	// キャンペーンAPチェック -----------------------------------------------------.
	QuestUtil.openCampaignCheck = function(campaignList) {
		_.each(campaignList,function(campaign, index) {
			// console.log(campaign);
		});
	};

	// イベントチェック ----------------------------------------------------------.
	QuestUtil.openEventCheck = function(eventId,eventList) {
		var eventObj = {
			event         : {},
			eventOpenFlag : false
		};
		_.each(eventList,function(event, index) {
			if(eventId == event.eventId) {
				eventObj.event           = event;
				eventObj.eventOpenFlag   = true;
				eventObj.event.endAtText = common.getTimeText(eventObj.event.endAt);
			}
		});

		return eventObj;
	};

	// プレイ可能クエスト数取得 --------------------------------------------------.
	var questNumObj;
	QuestUtil.canPlayQuestNum = function() {
		questNumObj = {
			"MAIN"  : 0,
			"SUB"   : 0,
			"CHARA" : 0,
			"EVENT" : 0
		};

		var sectionList = common.storage.userSectionList.toJSON().concat();
		var questList   = common.storage.userQuestBattleList.toJSON();

		_.each(sectionList,function(sectionModel,index) {
			if(sectionModel.section.questType == "MAIN") {
				if(sectionModel.canPlay) {
					var notClearFlag = false;
					_.each(questList,function(questModel,index) {
						if(sectionModel.sectionId == questModel.questBattle.sectionId) {
							if(!questModel.cleared) notClearFlag = true;
						}
					});
					//scene0はカウントしない
					if(
						QuestUtil.getIsScene0Info({
							section: sectionModel,
						}).isScene0
					){
						notClearFlag = false;
					};
					if(notClearFlag) {
						questNumObj["MAIN"] += 1;
					}
				}
			} else {
				if(sectionModel.canPlay && !sectionModel.cleared) {
					var key = sectionModel.section.questType;

					// if(key == 'COMPOSE' || key == 'MATERIAL') {
					if(key == 'ENHANCEMENT_AROUSAL') {
						key = 'EVENT';
					} else if(key == 'COSTUME'){
						key = 'CHARA';
					}else{
						if(!(key in questNumObj)) questNumObj[key] = 0;
					}

					if(sectionModel.canPlay) {
						var notClearFlag = false;
						_.each(questList,function(questModel,index) {
							if(sectionModel.sectionId == questModel.questBattle.sectionId) {
								if(!questModel.cleared) notClearFlag = true;
							}
						});

						if(notClearFlag) {
							questNumObj[key] += 1;
						}
					}
				}
			}
		});
		// console.log("questNumObj",questNumObj);
		questNumBatch()
	}
	function questNumBatch() {
		if(questNumObj.MAIN > 0) {
			common.addClass(common.doc.querySelector("#questLinkBtnWrap .main"),"batch");
		}

		if(questNumObj.SUB > 0) {
			common.addClass(common.doc.querySelector("#questLinkBtnWrap .side"),"batch");
		}

		if(questNumObj.CHARA > 0) {
			common.addClass(common.doc.querySelector("#questLinkBtnWrap .chara"),"batch");
			common.doc.querySelector("#questLinkBtnWrap .chara span").textContent = questNumObj.CHARA;
		}

		if(questNumObj.EVENT > 0) {
			common.addClass(common.doc.querySelector("#questLinkBtnWrap .event"),"batch");
			common.doc.querySelector("#questLinkBtnWrap .event span").textContent = questNumObj.EVENT;
		}
	}

	// 大イベント時のクエストタブ対応 -----------------------------------------------.
	// 大イベントページが必要なイベントタイプを追加していく
	var eventTypeArr = [
		"TOWER",
		"DAILYTOWER",
		"BRANCH",
		"ARENAMISSION",
		"SINGLERAID",
		"STORYRAID",
		"TRAINING",
		"ACCOMPLISH",
		"DUNGEON",
		"RAID",
		"PUELLA_RAID",
		"WITCH",
		"WALPURGIS",
	];
	var eventLinkObj = {
		"TOWER"        : "#/EventTowerTop",
		"DAILYTOWER"   : "#/EventDailyTowerTop",
		"BRANCH"       : "#/EventBranchTop",
		"ARENAMISSION" : "#/EventArenaMissionTop",
		"SINGLERAID"   : "#/EventSingleRaidTop",
		"STORYRAID"    : "#/EventStoryRaidTop",
		"TRAINING"     : "#/EventTrainingTop",
		"ACCOMPLISH"   : "#/EventAccomplishTop",
		"DUNGEON"      : "#/EventDungeonTop",
		"RAID"         : "#/EventRaidTop",
		"PUELLA_RAID": "#/PuellaHistoriaRouter",
		"WITCH": "#/EventWitchTopPage",
		"WALPURGIS": "#/EventWalpurgisRaidTop",
	};
	var eventPathObj = {
		"TOWER"        : "tower",
		"DAILYTOWER"   : "dailytower",
		"BRANCH"       : "branch",
		"ARENAMISSION" : "arenaMission",
		"SINGLERAID"   : "singleraid",
		"STORYRAID"    : "storyraid",
		"TRAINING"     : "training",
		"ACCOMPLISH"   : "accomplish",
		"DUNGEON"      : "dungeon",
		"RAID"         : "raid",
		"PUELLA_RAID": "puellaRaid",
		"WITCH": "eventWitch",
		"WALPURGIS": "eventWalpurgis",
	};

	QuestUtil.eventTabSwitch = function(eventList,current) {
		if(!eventList) return; // イベント開催してなかったらスルー
		if(common.tutorialId) return;

		var _current = "se_decide linkBtn";
		if(current) {
			_current = current;
		}

		var eventModel = null;
		// 大イベントはかぶらない前提（かぶるなら実装変える必要あり）
		_.each(eventList,function(event, index) {
			var result = eventTypeArr.indexOf(event.eventType);
			if(result > -1) {
				eventModel = event;
			}
		});

		if(!eventModel) return; // 大イベントなかったらスルー

		var btns = common.doc.querySelector("#questLinkBtnWrap .btns");
		common.addClass(btns,"type_s");

		var eventTypeLowerCase = eventModel.eventType.toLowerCase();
		var btnElm = document.createElement('li');
		btnElm.innerHTML    = "<span></span><div class='bg'></div>"
		btnElm.className    = "limitedEvent " + _current;
		btnElm.dataset.href = eventLinkObj[eventModel.eventType];

		var imagePath = '';
		switch (eventPathObj[eventModel.eventType]) {
			case 'training':
				imagePath = 'url("/magica/resource/image_web/event/training/common/tab_limited_quest_s_a.png")';
				break;
			case 'puellaRaid':
					imagePath = 'url("/magica/resource/image_web/page/quest/puellaHistoria_lastBattle/event/1198/tab_limited_quest_s.png")';
					break;
			default:
				imagePath = 'url("/magica/resource/image_web/event/'+ eventPathObj[eventModel.eventType] +'/' + eventModel.eventId + '/tab_limited_quest_s.png")';
		}
		btnElm.querySelector(".bg").style.background = imagePath;

		if(
			questNumObj[eventModel.eventType] > 0 && 
			eventModel.eventType !== "BRANCH" && 
			eventModel.eventType !== "ACCOMPLISH"
		) {
			common.addClass(btnElm,"batch");
			if(
				eventModel.eventType !== "PUELLA_RAID" || 
				eventModel.eventType !== "WALPURGIS"
			){ //特定のイベントのときは数字を表示しない
				btnElm.querySelector("span").textContent = questNumObj[eventModel.eventType];
			};
		}
		btns.appendChild(btnElm);
	}

	// 魔法少女 条件 ------------------------------------------------------------.
	QuestUtil.charaConditionText = function(questBattleModel) {
		var type;
		if(questBattleModel.onlyCharaIds)    type = "ONLY";
		if(questBattleModel.containCharaIds) type = "CONTAIN";

		var nameMap  = questBattleModel.charaIdNameMap;
		var charaIds = questBattleModel.onlyCharaIds || questBattleModel.containCharaIds;
		var idArr = charaIds.split(",");

		var conditionText = "このクエストには以下の開始条件があります<br>";

		var nameText = "";
		_.each(idArr,function(idStr,index) {
			if(index !== 0) {
				nameText += ","
			}
			nameText += ("<span class='c_pink'>" + nameMap[idStr] + "</span>");
		});

		conditionText += nameText;

		if(type == "ONLY") {
			conditionText += "<br>のみのチームでクエストを開始";
		} else if(type == "CONTAIN") {
			conditionText += "<br>を含むチームでクエストを開始";
		}

		return conditionText;
	};

	QuestUtil.charaConditionCheck = function(questBattleModel,userCardIdArr) {
		// trueが条件クリア　falseが条件未クリア
		if(!common.storage.userCardListEx) {
			// console.log("カードリストがありません");
			return false;
		}

		var type;
		if(questBattleModel.onlyCharaIds)    type = "ONLY";
		if(questBattleModel.containCharaIds) type = "CONTAIN";

		var charaIds       = questBattleModel.onlyCharaIds || questBattleModel.containCharaIds;
		var charaIdArr     = charaIds.split(",");
		var deckCharaIdArr = [];

		// 条件の魔法少女を含んでいるかのチェック
		var clearCheckObj = {};
		_.each(charaIdArr,function(idStr,index) {
			clearCheckObj[idStr] = false;
			_.each(userCardIdArr,function(userCardId,index) {
				var cardModel = common.storage.userCardListEx.findWhere({userCardId:userCardId}).toJSON();
				// console.log("cardModel:",cardModel.charaId);
				if(idStr == cardModel.charaId) {
					clearCheckObj[idStr] = true;
				}

				deckCharaIdArr.push(cardModel.charaId);
			});
		});

		var conditionClearFlag = true;
		_.each(clearCheckObj,function(check,index) {
			if(!check) {
				conditionClearFlag = false;
			}
		});

		// それ以外の魔法少女がいないかチェック
		if(type == "ONLY") {
			_.each(deckCharaIdArr,function(deckCharaId,index) {
				var clearFlag = false;
				_.each(charaIdArr,function(idStr,index) {
					if(deckCharaId == idStr) {
						clearFlag = true;
					}
				});
				if(!clearFlag) {
					conditionClearFlag = false;
				}
			});
		}

		return conditionClearFlag;
	};

	// ドロップアイテム ----------------------------------------------------------.
	QuestUtil.dropItemJson = function(questBattleModel) {
		var dropItemModelList = dropItemModelListCreate(questBattleModel);
		var dropItemObj = dropItemExtract(dropItemModelList);

		return dropItemObj;
	}

	function dropItemModelListCreate(questBattleModel) {
		var dropItemModelList = [];

		var model = questBattleModel.questBattle;

		if(!questBattleModel.cleared && model.firstClearRewardCodes) { // 初回クリア報酬
			var codes = model.firstClearRewardCodes.split(",");
			_.each(codes, function(rewardCode,index){
				dropItemModelList.push({
					"firstClearRewardCode": rewardCode
				});
			});
		}

		if(model.addDropItemId) { // 初回クリア報酬
			dropItemModelList.push({
				"addDropItemId": model.addDropItemId
			});
		}

		if(model.defaultDropItem) {
			dropItemModelList.push(model.defaultDropItem);
		}

		var i = 0;
		var dropItemListLeng = 5;
		while(i < dropItemListLeng) {
			if(model['dropItem'+(i+1)]) {
				dropItemModelList.push(model['dropItem'+(i+1)]);
			}

			i=(i+1)|0;
		}

		return dropItemModelList;
	}

	function dropItemExtract(dropItemModelList) {
		// console.log("dropItemExtract:",dropItemModelList);
		var firstClearReward = null;
		var addDropItemId    = null;
		var dropItemList     = [];
		var itemList         = [];
		var dropItemObj      = {};
		var firstClearRewards = [];
		//itemSetListも保存しておく
		var _itemSetList = [];
		_.each(dropItemModelList,function(model, index) {
			// console.log("itemId調査",model)

			if(model.firstClearRewardCode) {
				firstClearRewards.push(model.firstClearRewardCode);
			} else if(model.addDropItemId) {
				addDropItemId = model.addDropItemId;
			} else {
				var i = 0;
				var dropItemLeng = 10;
				while(i < dropItemLeng) {
					if(model["rewardCode" + (i + 1)]) {
						dropItemList.push(model["rewardCode" + (i + 1)]);
						// console.log(dropItemList);
					}
					i=(i+1)|0;
				}
			}
		});

		// 初回クリア報酬
		if(firstClearRewards.length > 0) {
			dropItemObj.firstClearReward = [];
			dropItemObj.firstClearRewardName = [];
			dropItemObj.firstClearRewardQuantity = [];
			_.each(firstClearRewards,function(rewardCode){
				var _firstClearReward = common.itemSet(rewardCode);
				_firstClearReward.isFirstClear = true;
				_itemSetList.push(_firstClearReward);
				var code = _firstClearReward.itemCode.toLowerCase();

				dropItemObj.firstClearReward.push(code);
				// dropItemObj.firstClearRewardName = itemModel.toJSON().name;

				var itemModel = null;
				var hasItemModel = null;

				if(code.indexOf("gift") !== -1) {
					itemModel    = common.storage.giftList.findWhere({"id":Number(code.split("item_gift_")[1])});
					hasItemModel = common.storage.userGiftList.findWhere({"giftId":Number(code.split("item_gift_")[1])});
				} else {
					itemModel    = common.storage.itemList.findWhere({"itemCode":code.toUpperCase()});
					hasItemModel = common.storage.userItemList.findWhere({"itemId":code.toUpperCase()});
				}

				if(itemModel) {
					dropItemObj.firstClearRewardName.push(itemModel.toJSON().name);
					if(hasItemModel) {
						dropItemObj.firstClearRewardQuantity.push(hasItemModel.toJSON().quantity);
					} else {
						dropItemObj.firstClearRewardQuantity.push("0");
					}
					// console.log(dropItemObj,"☆")
				} else {
					switch(code) {
						case "riche":
								dropItemObj.firstClearRewardName.push("カースチップ");
								dropItemObj.firstClearRewardQuantity.push(common.storage.gameUser.toJSON().riche);
							break;
					}
				}
			});
		}

		// 追加ドロップ
		if(addDropItemId) {
			dropItemObj.addDropItem = addDropItemId.toLowerCase();

			var code = dropItemObj.addDropItem;
			var itemModel = null;
			var hasItemModel = null;
			itemModel    = common.storage.itemList.findWhere({"itemCode":code.toUpperCase()});
			hasItemModel = common.storage.userItemList.findWhere({"itemId":code.toUpperCase()});

			if(itemModel) {
				dropItemObj.addDropItemName = itemModel.toJSON().name;
				if(hasItemModel) {
					dropItemObj.addDropItemQuantity = hasItemModel.toJSON().quantity;
				} else {
					dropItemObj.addDropItemQuantity = "0";
				}
				// console.log(dropItemObj,"☆")
			}
		}

		// ドロップリスト
		_.each(dropItemList,function(itemCode,index) {
			var _itemCode = common.itemSet(itemCode);
			_itemSetList.push(_itemCode);
			if(_itemCode) {
				_itemCode = _itemCode.itemCode.toLowerCase();
				itemList.push(_itemCode);
			}
		});
		itemList = itemList.filter(function (x, i, self) {
			return self.indexOf(x) === i;
		});

		// console.log(itemList);

		var itemNameList = [];
		var itemQuantityList = [];
		_.each(itemList,function(code) {
			var model;
			var hasModel;
			var name;
			var quantity;

			if(code == "riche") {
				name = "カースチップ";
				quantity = common.storage.gameUser.toJSON().riche;
			} else if(code.indexOf("gift") !== -1) {
				model    = common.storage.giftList.findWhere({"id":Number(code.split("item_gift_")[1])});
				hasModel = common.storage.userGiftList.findWhere({"giftId":Number(code.split("item_gift_")[1])});

				// console.log(model)
				if(model) name = model.toJSON().name;
				if(hasModel) {
					quantity = hasModel.toJSON().quantity;
				} else {
					quantity = "0";
				}
			} else {
				model = common.storage.itemList.findWhere({"itemCode":code.toUpperCase()});
				hasModel = common.storage.userItemList.findWhere({"itemId":code.toUpperCase()});

				if(model) name = model.toJSON().name;
				if(hasModel) {
					quantity = hasModel.toJSON().quantity;
				} else {
					quantity = "0";
				}
			}
			itemNameList.push(name);
			itemQuantityList.push(quantity);
		});

		dropItemObj.list = itemList;
		dropItemObj.nameList = itemNameList;
		dropItemObj.quantityList = itemQuantityList;
		dropItemObj.itemSetList = _itemSetList;

		return dropItemObj;
	}

	// 宝箱の色 ----------------------------------------------------------------.
	QuestUtil.clearRewardChestColor = function(clearReward) {

		switch(clearReward.presentType) {
			case "ITEM":
				return clearReward.item.treasureChestColor;

			case "GIFT":
				return rankColor(clearReward.gift.rank);

			case "CARD":
				return rankColor(clearReward.card.rank);

			case "PIECE":
			case "MAXPIECE":
				return rankColor(clearReward.piece.rank);

			case "DOPPEL":
			case "LIVE2D":
			case "FORMATIONSHEET":
			case "GEM":
				return "GOLD";

			case "RICHE":
				return "BRONZE";
		}

		function rankColor(rank) {
			var _rank;
			if(typeof rank == "string" && rank.indexOf("RANK_") !== -1) {
				_rank = rank.split("_")[1] | 0;
			} else {
				_rank = rank;
			}
			switch(_rank) {
				case 1:
					return "BRONZE";
				case 2:
					return "SILVER";
				default:
					return "GOLD";
			}
		}
	}

	// 解放条件 ----------------------------------------------------------------.
	var openConditionRankObj = {
		"RANK_1": "★1",
		"RANK_2": "★2",
		"RANK_3": "★3",
		"RANK_4": "★4",
		"RANK_5": "★5"
	}
	QuestUtil.openConditionJson = function(sectionData,charaName,resultFlag) {
		// console.log("解放条件リストを作成:param:",sectionData,charaName);

		var _resultFlag  = (resultFlag) ? true : false; // 強化リザルトかどうか
		var _charaName   = (charaName) ? charaName : "";
		var charaNameTxt = (_resultFlag) ? "" : _charaName + " ";

		var openConditionList = [];

		if(sectionData.questType == "CHARA") {
			var genericId    = sectionData.genericId;
			var genericIndex = sectionData.genericIndex;
			var prevSectionData    = null;
			var prevSectionDataArr = common.storage.userSectionList.filter(function(model) {
				return model.toJSON().section.genericId == genericId;
			});
			_.each(prevSectionDataArr,function(model,index) {
				if(genericIndex - 1 == model.toJSON().section.genericIndex) {
					prevSectionData = model.toJSON().section;
				}
			});
			if(prevSectionData) {
				var text = _charaName + " ストーリー" + prevSectionData.genericIndex + "話をクリア";
				openConditionList.push(text);
			}
		}

		if(sectionData.openConditionSection) {
			// console.log("★openConditionChapter",sectionData.openConditionChapter);
			// console.log("★openConditionSection",sectionData.openConditionSection);
			var partNo = sectionData.openConditionChapter.partNo;
			var chapterNoForView = sectionData.openConditionChapter.chapterNoForView;
			var sectionNo = sectionData.openConditionSection.genericIndex;
			var text = "メインストーリー 第" + partNo + "部 " + chapterNoForView + " " + sectionNo + "話をクリア";
			openConditionList.push(text);
		}

		if(sectionData.openConditionSectionId == 999999) {
			var text = "今後追加のストーリーをクリア";
			openConditionList.push(text);
		}

		if(sectionData.openConditionCharaBondsPt) {
			var text = charaNameTxt + "エピソードLv" + sectionData.openConditionCharaBondsPt + "以上";
			openConditionList.push(text);
		}

		if(sectionData.openConditionMagiaLevel) {
			var text = charaNameTxt + "マギアLv" + sectionData.openConditionMagiaLevel;
			openConditionList.push(text);
		}

		if(sectionData.openConditionRank) {
			var text = charaNameTxt + "レアリティ" + openConditionRankObj[sectionData.openConditionRank] + "以上";;
			openConditionList.push(text);
		}

		return openConditionList;
	}

	// サポートID取得 -----------------------------------------------------------.
	QuestUtil.supportPickUp = function(pageJson) {
		if(!pageJson.gameUser) return;
		if(common.strSupportPickUpUserIds) return;
		if(common.tutorialId) return;

		var query;
		var gameUser = pageJson.gameUser;
		var min = (gameUser.level < 70) ? 70 : gameUser.level - 5;
		var max = (gameUser.level < 70) ? 85 : gameUser.level + 5;

		// 24時間以内のユーザー見つけたい
		var nowDateTime = Date.parse(pageJson.currentTime) / 1000;
		var minDate = (gameUser.level < 70) ? new Date((nowDateTime  - 86400) * 1000) :
											  new Date((nowDateTime  - 864000) * 1000);
		var nowDate = new Date((nowDateTime  + 600) * 1000);
		var m = {};
		var n = {};
		// console.log(minDate);
		m.M = (minDate.getMonth() + 1 < 10) ? "0" + (minDate.getMonth() + 1) : (minDate.getMonth() + 1);
		m.D = (minDate.getDate() < 10) ? "0" + minDate.getDate() : minDate.getDate();
		m.H = (minDate.getHours() < 10) ? "0" + minDate.getHours() : minDate.getHours();
		m.i = (minDate.getMinutes() < 10) ? "0" + minDate.getMinutes() : minDate.getMinutes();
		n.M = (nowDate.getMonth() + 1 < 10) ? "0" + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1);
		n.D = (nowDate.getDate() < 10) ? "0" + nowDate.getDate() : nowDate.getDate();
		n.H = (nowDate.getHours() < 10) ? "0" + nowDate.getHours() : nowDate.getHours();
		n.i = (nowDate.getMinutes() < 10) ? "0" + nowDate.getMinutes() : nowDate.getMinutes();

		var Gte = minDate.getFullYear() + "-" + m.M + "-" + m.D + "T" + m.H + ":" + m.i + ":00.000+0900";
		var Lte = nowDate.getFullYear() + "-" + n.M + "-" + n.D + "T" + n.H + ":" + n.i + ":00.000+0900";

		query = {
			"size": 30,
			"query": {
				"function_score": {
					"query": {
						"bool": {
							"must": [
								{ "range": { "userRank": { "gte": min, "lte": max } } },
								{ "range": { "lastAccessDate": { "gte": Gte, "lte": Lte } } }
							],
							"must_not": {
								"term": {
									"_id": String(common.storage.gameUser.get('userId'))
								}
							}
						}
					},
					"functions": [ { "random_score": {} } ]
				}
			},
			"stored_fields": [
				"id",
				"userName",
				"attributeId",
				"lastAccessDate",
				"inviteCode",
				"userRank",
				"cardId",
				"cardRank",
				"displayCardId",
				"level",
				"revision",
				"lbCount"
			]
		};

		console.log("searchQuery",query);

		searchFunc(query,pageJson);
	};

	var searchFunc = function(query,pageJson) {
		if(common.tutorialId) return;
		if(!pageJson.gameUser) return;
		if(common.supportUserList) return;

		common.supportPickUpUserIds = [];
		common.strSupportPickUpUserIds = "";

		var callback = function(res) {
			// console.log('supportPickup:res:',res);
			var pickUpSupportUser = res.hits.hits;
			var userFollowList = (common.storage.userFollowList) ? common.storage.userFollowList.toJSON() : [];

			// debugFlg elasticSearchの返り値にfieldsがあった場合それを優先する
			// 新しいelasticSearchの場合はコンソールログでnewSearchが出る。
			var newFlg = false;
			if(pickUpSupportUser[0] && pickUpSupportUser[0].fields){
				// console.log("newSearch");
				newFlg = true;
			}

			_.each(pickUpSupportUser,function(supportModel) {
				var _supportModel;
				if(newFlg){
					_supportModel = {};
					for(var key in supportModel.fields){
						_supportModel[key] = supportModel.fields[key][0];
					}
				}else{
					_supportModel = supportModel._source;
				}

				var followFlag = false;
				_.each(userFollowList,function(followModel) {
					if(_supportModel.id == followModel.followUserId) {
						followFlag = true;
					}
				});

				if(!followFlag) {
					var model = {
						"userRank":_supportModel.userRank,
						"id":_supportModel.id
					};
					common.supportPickUpUserIds.push(model);
				}
			});

			if(common.supportPickUpUserIds.length == 0 && !searchFlag) {
				searchFlag = true;
				var gameUser = pageJson.gameUser;
				if(gameUser.level < 70) {
					query.query.function_score.query.bool.must[0].range.userRank.gte = (gameUser.level - 15 < 1) ? 1 : gameUser.level - 15;
					query.query.function_score.query.bool.must[0].range.userRank.lte = gameUser.level + 15;

					var nowDateTime = Date.parse(pageJson.currentTime) / 1000;
					var minDate = new Date((nowDateTime  - 864000) * 1000);
					var nowDate = new Date((nowDateTime  + 600) * 1000);
					var m = {};
					var n = {};
					// console.log(minDate);
					m.M = (minDate.getMonth() + 1 < 10) ? "0" + (minDate.getMonth() + 1) : (minDate.getMonth() + 1);
					m.D = (minDate.getDate() < 10) ? "0" + minDate.getDate() : minDate.getDate();
					m.H = (minDate.getHours() < 10) ? "0" + minDate.getHours() : minDate.getHours();
					m.i = (minDate.getMinutes() < 10) ? "0" + minDate.getMinutes() : minDate.getMinutes();
					n.M = (nowDate.getMonth() + 1 < 10) ? "0" + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1);
					n.D = (nowDate.getDate() < 10) ? "0" + nowDate.getDate() : nowDate.getDate();
					n.H = (nowDate.getHours() < 10) ? "0" + nowDate.getHours() : nowDate.getHours();
					n.i = (nowDate.getMinutes() < 10) ? "0" + nowDate.getMinutes() : nowDate.getMinutes();

					var Gte = minDate.getFullYear() + "-" + m.M + "-" + m.D + "T" + m.H + ":" + m.i + ":00.000+0900";
					var Lte = nowDate.getFullYear() + "-" + n.M + "-" + n.D + "T" + n.H + ":" + n.i + ":00.000+0900";
					query.query.function_score.query.bool.must[1].range.lastAccessDate.gte = Gte;
					query.query.function_score.query.bool.must[1].range.lastAccessDate.lte = Lte;

				} else if (gameUser.level > 145) {
					query.query.function_score.query.bool.must[0].range.userRank.gte = 115;
					query.query.function_score.query.bool.must[0].range.userRank.lte = 200;

					var nowDateTime = Date.parse(pageJson.currentTime) / 1000;
					var minDate = new Date((nowDateTime  - 864000) * 1000);
					var nowDate = new Date((nowDateTime  + 600) * 1000);
					var m = {};
					var n = {};
					// console.log(minDate);
					m.M = (minDate.getMonth() + 1 < 10) ? "0" + (minDate.getMonth() + 1) : (minDate.getMonth() + 1);
					m.D = (minDate.getDate() < 10) ? "0" + minDate.getDate() : minDate.getDate();
					m.H = (minDate.getHours() < 10) ? "0" + minDate.getHours() : minDate.getHours();
					m.i = (minDate.getMinutes() < 10) ? "0" + minDate.getMinutes() : minDate.getMinutes();
					n.M = (nowDate.getMonth() + 1 < 10) ? "0" + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1);
					n.D = (nowDate.getDate() < 10) ? "0" + nowDate.getDate() : nowDate.getDate();
					n.H = (nowDate.getHours() < 10) ? "0" + nowDate.getHours() : nowDate.getHours();
					n.i = (nowDate.getMinutes() < 10) ? "0" + nowDate.getMinutes() : nowDate.getMinutes();

					var Gte = minDate.getFullYear() + "-" + m.M + "-" + m.D + "T" + m.H + ":" + m.i + ":00.000+0900";
					var Lte = nowDate.getFullYear() + "-" + n.M + "-" + n.D + "T" + n.H + ":" + n.i + ":00.000+0900";
					query.query.function_score.query.bool.must[1].range.lastAccessDate.gte = Gte;
					query.query.function_score.query.bool.must[1].range.lastAccessDate.lte = Lte;
				} else {
					query.query.function_score.query.bool.must[0].range.userRank.gte = gameUser.level - 30;
				}

				searchFunc(query,pageJson);
				// console.log('サポートキャラが検索結果にいなかったので再検索');
			} else {
				searchFlag = false;
				idFilterFunc();
			}
		};

		ajaxControl.ajaxPost(common.searchLinkList.friend,query,callback);
	}

	var idFilterFunc = function() {
		common.strSupportPickUpUserIds = "";
		common.supportPickUpUserIds.sort(function(a,b){
			if( a.userRank > b.userRank ) return -1;
			if( a.userRank < b.userRank ) return 1;
			return 0;
		});
		common.supportPickUpUserIds = common.supportPickUpUserIds.slice(0,15);

		_.each(common.supportPickUpUserIds,function(model,index) {
			// console.log("idFilterFunc:",model,index)
			var comma = ",";
			if(index === 0) {
				comma = "";
			}
			common.strSupportPickUpUserIds += (comma + model.id);
		});
	}

	QuestUtil.getQuestLoopStatus = function(questBattleModel) {
		if (!questBattleModel) return "none";

		var questLoopStatus = "able";

		if(
			// クリアしてないと自動周回不可
			!questBattleModel.cleared ||
			// ミッションコンプしてないと自動周回不可
			questBattleModel.missionStatus1 !== 'CLEARED' ||
			questBattleModel.missionStatus2 !== 'CLEARED' ||
			questBattleModel.missionStatus3 !== 'CLEARED' ||
			// サポートなしは自動周回不可
			questBattleModel.questBattle.skipHelper ||
			// 条件付きクエスト
			questBattleModel.questBattle.onlyCharaIds ||
			questBattleModel.questBattle.containCharaIds
		) {
			questLoopStatus = "none";
		}

		// 自動周回不可クエスト
		if (!questBattleModel.questBattle.autoRun) {
			questLoopStatus = "none";
		}

		return questLoopStatus;
	}

	//scene0のsectionかどうかを返す
	QuestUtil.getIsScene0Info = function(_args){
		var _section = _args.section;
		var _scene0Info = {
			filmNum: false, //Film番号
			challengeBattleNum: false, //チャレンジバトル番号
			sideStoryNum: false, //サイドストーリー番号
			isScene0: false, //Scene0のsectionかどうか
		}
		if(
			_section && 
			_section.section
		){
			var __section = _section.section;
			if(
				__section.viewParameterMap && 
				__section.viewParameterMap.SCENE0_FILM_NUM
			){
				_scene0Info.filmNum = Number(__section.viewParameterMap.SCENE0_FILM_NUM);
				_scene0Info.isScene0 = true;
			};
			if(
				__section.viewParameterMap && 
				__section.viewParameterMap.SCENE0_CHALLENGEBATTLE_NUM
			){
				_scene0Info.challengeBattleNum = Number(__section.viewParameterMap.SCENE0_CHALLENGEBATTLE_NUM);
				_scene0Info.isScene0 = true;
			};
			if(
				__section.viewParameterMap && 
				__section.viewParameterMap.SCENE0_SIDESTORY_NUM
			){
				_scene0Info.sideStoryNum = Number(__section.viewParameterMap.SCENE0_SIDESTORY_NUM);
				_scene0Info.isScene0 = true;
			};
		};
		return _scene0Info;
	};

	return QuestUtil;
});
