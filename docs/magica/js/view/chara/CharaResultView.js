define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/chara/CharaResult.html',
	'QuestUtil'
], function (_,Backbone,common,ajaxControl,cmd,
	//temp,
	questUtil
) {
	'use strict';

	var Model = Backbone.Model.extend();
	var voiceTypeObj = {
		"level"       : "13",
		"maxLevel"    : "14",
		"episode"     : "15",
		"limitBreak1" : "16", // 魔力解放1回目
		"limitBreak2" : "17", // 魔力解放2回目
		"limitBreak3" : "18", // 魔力解放3回目
		"magiaLevel"  : "19",
		"evolve1"     : "20", // 覚醒☆2☆3
		"evolve2"     : "21", // 覚醒☆4
		"evolve3"     : "22", // 覚醒☆5
		"evolve4"     : "23"  // 覚醒☆6
	};

	var voicePickUp = function(type,model) {
		switch(type) {
			case "level":
				if(model.after.level !== model.after.maxLevel) {
					return voiceTypeObj.level;
				} else {
					return voiceTypeObj.maxLevel;
				}
			break;
			case "episode":
				return voiceTypeObj.episode;

			case "limitBreak":
				if(model.after.revision == 1) {
					return voiceTypeObj.limitBreak1;
				} else if(model.after.revision == 2) {
					return voiceTypeObj.limitBreak2;
				} else if(model.after.revision == 3) {
					return voiceTypeObj.limitBreak3;
				}
			break;

			case "magiaLevel":
				return voiceTypeObj.magiaLevel;

			case "evolve":
				var rank = model.after.card.rank;
				if(rank == "RANK_2" || rank == "RANK_3") {
					return voiceTypeObj.evolve1;
				} else if(rank == "RANK_4") {
					return voiceTypeObj.evolve2;
				} else if(rank == "RANK_5") {
					return voiceTypeObj.evolve3;
				} else if(rank == "RANK_6") {
					return voiceTypeObj.evolve4;
				}
			break;
		}
	};

	var voiceTimer;
	var tapTimer;
	var CharaData = Backbone.View.extend({
		id: "charaComposeResult",
		className: "show",
		events: function() {
			var evtObj = {};
			evtObj[common.cgti] = this.hideResult;
			return evtObj;
		},
		hideResult: function(e){
			if (e) {
				e.preventDefault();
				if(common.isScrolled()) return;
			}
			if(this.tapBlock) return;

			var model = this.model.toJSON();

			if(common.location.indexOf("Result") === -1){
				// Android戻るキー制御
				// クエストリザルトでは解除しない。
				common.androidKeyStop = false;
			}

			if(model.type == 'evolve' && model.after.card.rank == 'RANK_5' && model.questArr && model.questArr[3]) {
				var that = this;
				this.tapBlock = true;

				this.model.set({"type":"doppelStory","silent":true});
				this.messageView.removeView();

				this.messageView = new MessageView({model:this.model.toJSON()});
				$(this.el.querySelector(".resultMessageWrap")).append(this.messageView.render().el);

				tapTimer = setTimeout(function() {
					that.tapBlock = false;
					// 自動で閉じる
					if (that.autoFlag) that.hideResult();
				},2000);
			} else {
				this.removeView();
			}
		},
		initialize : function(options,closeFunction,autoFlag) {
			this.tapBlock = true;
			if(closeFunction) this.closeFunction = closeFunction;
			this.autoFlag = autoFlag;
			this.listenTo(this.rootView,'remove',this.removeView);
			this.template = _.template(
				common.doc.getElementById('tempCharaResult').innerText
			);
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			var that = this;

			switch(this.model.toJSON().type) {
				case 'episode':
					cmd.startSe(1607);
				break;

				default :
					cmd.startSe(1101);
				break;
			}
			voiceTimer = setTimeout(function() {
				that.startVoice();
			},300);

			tapTimer = setTimeout(function() {
				that.tapBlock = false;
				// 自動で閉じる
				if (that.autoFlag) that.hideResult();
			},1000);
			var questArr = [];

			if(this.model.toJSON().type == "magiaLevel" || this.model.toJSON().type == "episode" || this.model.toJSON().type == "evolve") {
				var charaId   = this.model.toJSON().after.charaId;
				var charaName = this.model.toJSON().after.chara.name;
				if(this.model.toJSON().after.chara.title) {
					charaName += "(" +this.model.toJSON().after.chara.title + ")";
				}
				common.storage.userSectionList.each(function(model) {
					if(model.toJSON().section.genericId == charaId && model.toJSON().section.questType == "CHARA") {
						var _model = {};
						if(!model.toJSON().canPlay) {
							_model.closeFlag = true;
							_model.openConditionList = questUtil.openConditionJson(model.toJSON().section,charaName,"result");
							// console.log("---------未解放---------",_model);
						}
						questArr.push($.extend(model.toJSON(),_model));
					}
				});

				questArr.sort(function(a,b){
					if( a.section.sectionId < b.section.sectionId ) return -1;
					if( a.section.sectionId > b.section.sectionId ) return 1;
					return 0;
				});

				// console.log(charaId,charaName,questArr);
			}

			if(questArr.length > 0) {
				this.model.set({"questArr":questArr,"silent":true});
			}

			var messageModel = this.model.toJSON();

			MessageView.prototype.rootView = this;
			MessageView.prototype.template = _.template($(this.el.querySelector("#MessageTemplate")).text());
			this.messageView = new MessageView({model:messageModel});
			$(this.el.querySelector(".resultMessageWrap")).append(this.messageView.render().el);

			return this;
		},
		startVoice: function() {
			var type = this.model.toJSON().type;
			var voiceId = voicePickUp(type,this.model.toJSON());
			if(voiceId) {
				var fileName = "vo_char_" + this.model.toJSON().after.charaId + "_00_" + voiceId;
				cmd.startVoice(fileName);
			}
		},
		removeView: function() {
			clearTimeout(voiceTimer);
			clearTimeout(tapTimer);
			voiceTimer = null;
			tapTimer = null;

			this.messageView.removeView();
			cmd.stopVoice();
			if(this.closeFunction) this.closeFunction();
			this.off();
			this.remove();
		}
	});

	var MessageView = Backbone.View.extend({
		id: "messageInner",
		className: "show",
		render : function() {
			this.$el.html(this.template({model:this.model}));
			return this;
		},
		removeView: function() {
			this.off();
			this.remove();
		}
	});

	return CharaData;

});
