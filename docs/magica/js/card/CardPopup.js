define([
	'underscore',
	'backbone',
	"backboneCommon",
	'js/view/chara/CharaDetailView',
	'command'
], function (_,Backbone,common,DetailView,cmd) {

	var popupJson;
	var Model = Backbone.Model.extend();
	var openEvent;

	//アンドロイド用
	if(common.ua.android){
		common.doc.addEventListener("touchmove",function(){
			clearTimeout(common.popupTimerObj);
		},true);
	}

	//アビリティ周りのイベント設定
	var popupEventSet = function(){
		popupJson.cardArr = [];
		// console.log(popupJson);
		popupJson.cardArr.push({
			attributeId : popupJson.card.attributeId,
			cardId      : popupJson.chara.defaultCardId,
			rank        : popupJson.chara.defaultCard.rank,
			rankNum     : popupJson.chara.defaultCard.rank.split("_")[1],
			openFlag    : true,
			currentCardFlag : (popupJson.displayCardId == popupJson.chara.defaultCardId) ? true : false,
			currentCommandFlag : (popupJson.commandVisualId == popupJson.chara.defaultCardId) ? true : false,
			illustrator : popupJson.card.illustrator
		});
		var i = 0;
		var MaxRare = 5;
		var currentRank = Number(popupJson.card.rank.split("_")[1]);
		while(i < MaxRare) {
			if(popupJson.chara["evolutionCardId"+(i+1)]) {
				var rank = Number(popupJson.chara["evolutionCard"+(i+1)].rank.split("_")[1]);
				var model = {};

				model.attributeId = popupJson.card.attributeId;
				model.cardId      = popupJson.chara["evolutionCardId"+(i+1)];
				model.rank        = popupJson.chara["evolutionCard"+(i+1)].rank;
				model.rankNum     = popupJson.chara["evolutionCard"+(i+1)].rank.split("_")[1];
				model.openFlag    = (rank <= currentRank) ? true : false;
				model.currentCardFlag = (popupJson.displayCardId == popupJson.chara["evolutionCardId"+(i+1)]) ? true : false;
				model.currentCommandFlag = (popupJson.commandVisualId == popupJson.chara["evolutionCardId"+(i+1)]) ? true : false;
				model.illustrator = popupJson.card.illustrator;

				popupJson.cardArr.push(model);
			}

			i=(i+1)|0;
		}

		_.each(popupJson.cardArr,function(cardModel) {
			if(cardModel.currentCardFlag) {
				popupJson.illustrator = cardModel.illustrator;
			}
		});

		cmd.hideMiniChara();

		_.each(common.doc.querySelector("#baseContainer").children,function(elm) {
			common.addClass(elm,"hide");
		});

		// console.log("popupJson",popupJson)

		common.detailView = new DetailView({model: new Model(popupJson)});
		common.doc.querySelector("#baseContainer").appendChild(common.detailView.render().el);

		common.scrollSet("hiddenWrap","scrollInner");
		cmd.startSe(1002);
		cmd.getBaseData(common.getNativeObj());
	};

	return {
		cardDetailPopup : function(e,model,closeEvent){
			if(!model.rentalMemoriaUse){//メモリアレンタル用
				if(model.isNpc) return;
			}
			if(common.tutorialId) return;
			clearTimeout(common.popupTimerObj);
			common.popupTimerObj = setTimeout(function(){
				if(common.isScrolled()) return;
				if(common.ua.android){
					var scrollTop = common.doc.body.scrollTop;
					if(scrollTop - common.g_window_posY > 30 || scrollTop - common.g_window_posY < -30){
						return;
					}
				}
				e.preventDefault();
				e.stopPropagation();

				// console.log(model)
				popupJson = model;
				popupJson.closeEvent = (closeEvent) ? closeEvent : null;
				popupEventSet();
			},800);
		},
		shopCardDetailPopup : function(e,model,closeEvent){
			clearTimeout(common.popupTimerObj);
			common.popupTimerObj = setTimeout(function(){
				if(common.isScrolled()) return;
				if(common.ua.android){
					var scrollTop = common.doc.body.scrollTop;
					if(scrollTop - common.g_window_posY > 30 || scrollTop - common.g_window_posY < -30){
						return;
					}
				}
				e.preventDefault();
				e.stopPropagation();

				// 特殊処理系
				model.isShop  = true;
				model.customizeBonus = {
					"HP"     : "+0%",
					"ATTACK" : "+0%",
					"DEFENSE": "+0%",
					"ACCEL"  : "+0%",
					"BLAST"  : "+0%",
					"CHARGE" : "+0%"
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
				model.charaType     = typeText[model.chara.initialType];
				model.displayCardId = model.card.cardId;

				// 最大値
				model.level   = model.maxLevel;
				model.hp      = model.maxStatus.hp;
				model.attack  = model.maxStatus.attack;
				model.defense = model.maxStatus.defense;
				model.episodeLevel = 5;
				model.chara.description = model.chara.description.replace(/＠/g, "<br>");

				// 最小値
				model.revision   = 0;
				model.magiaLevel = 1;

				popupJson = model;
				popupJson.closeEvent = (closeEvent) ? closeEvent : null;

				cmd.endL2d();
				popupEventSet();
			},800);
		},
		popupTimerStop : function(e){
			clearTimeout(common.popupTimerObj);
		},
		instantPopup : function(e,model,closeEvent){
			if(model.isNpc) return;
			clearTimeout(common.popupTimerObj);
			popupJson = model;
			popupJson.closeEvent = (closeEvent) ? closeEvent : null;
			popupEventSet();
		}
	};

});
