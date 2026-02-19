define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	//'text!template/collection/CharaCollectionDetail.html'
], function (
	_,Backbone,common,ajaxControl,cmd
	//temp
) {
	'use strict';

	var CollectionDetailView = Backbone.View.extend({
		id: "cardDetail",
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + " #detailCardImage .cardImg"] = this.cardZoom;
			evtObj[common.cgti + " #detailCardImage .zoomImg"] = this.cardZoom;
			evtObj[common.cgti + " #detailTab li"]             = this.tabChange;
			evtObj[common.cgti + " .collectionBack"]           = this.detailClose;
			evtObj[common.cgti + " .voiceBtn"]                 = this.voiceStart;
			evtObj[common.cgti + " .cardIllustWrap .mb_pink"]  = this.visualChangeCard;
			evtObj[common.cgti + " .miniCharaBtn .mb_pink"]    = this.visualChangeCommand;
			evtObj[common.cgti + " .moviePlayBtn"]             = this.charaMoviewPlay;
			evtObj[common.cgti + " .live2dChangeBtn"]          = this.live2dChange;

			evtObj[common.cgti + " .voicePlayBtn"]             = this.playVoice;
			evtObj[common.cgti + " .moviePlayBtn"]             = this.charaMoviewPlay;

			// add:ボイス再生時Live2Dフルスクリーン表示
			evtObj[common.cgti + " .fullScreenEnd"]            = this.finishFullScreen;
			evtObj[common.cgti + " .voiceCheck"]               = this.voiceCheck;

			return evtObj;
		},
		initialize : function(options) {
			common.androidKeyStop = true;
			this.live2dId = "00";
			this.template = _.template(
				common.doc.getElementById('tempCharaCollectionDetail').innerText
			);

			var charaModel = this.model.toJSON().currentCard;
			var live2dModel = currentLive2dModel(this.live2dId,charaModel);
			if(!live2dModel)return;
			this.voicePrefixNo = live2dModel.voicePrefixNo;
			this.voiceFullScreen = false;
		},
		render : function() {
			this.$el.html(this.template({model:this.model.toJSON()}));
			return this;
		},
		cardZoom: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			common.doc.querySelector("#detailCardImage").classList.toggle("zoom");
		},
		tabChange: function(e) {
			var type = e.currentTarget.dataset.type;
			common.doc.querySelector("#cardDetailWrap").className = type;
			if(type == "illust") {
				live2dShow(this.model.toJSON(),null,this.live2dId);
				common.addClass(common.doc.querySelector("#detailCardImage"),"hide");
			} else {
				cmd.endL2d();
				common.removeClass(common.doc.querySelector(".voiceBtn.current"),"current");
				common.removeClass(common.doc.querySelector("#detailCardImage"),"hide");
			}
			common.removeClass(e.currentTarget.parentNode.querySelector(".current"),"current");
			common.addClass(e.currentTarget,"current");
			common.scrollRefresh(null, null, true);
		},
		detailClose: function(e) {
			if(e){
				e.preventDefault();
				if(common.isScrolled()) return;
			}
			cmd.endL2d();
			cmd.stopVoice();

			this.remove();
			common.removeClass(common.doc.querySelector("#mainContent"),"hide");
			common.removeClass(common.doc.querySelector("#globalMenuContainer"),"hide");
			common.androidKeyStop = false;
			common.scrollRefresh();
		},
		voiceStart: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			// 従来の挙動
			var charaId  = this.model.toJSON().charaId;
			var voiceId  = e.currentTarget.dataset.voice;
			var voiceKey = "vo_char_" + charaId + "_" + this.voicePrefixNo + "_" + voiceId;
			cmd.stopVoice();

			// doubleUnit判定
			var isDoubleUnit = false;
			if(this.model.toJSON().chara.doubleUnitFlg && this.live2dId == "00"){
				isDoubleUnit = true;
			}

			var isDoublePAPA = this.model.toJSON().chara.doubleUnitFlg && this.live2dId == "88";

			if(!this.voiceFullScreen){
				common.removeClass(common.doc.querySelector(".voiceBtn.current"),"current");
				common.addClass(e.currentTarget,"current");

				if (isDoublePAPA) {
					cmd.startVoice(voiceKey);
				} else {
					var l2dPrm   = {};
					l2dPrm.id    = String(charaId+this.live2dId);
					l2dPrm.voice = voiceKey;
					cmd.storyMotionL2dVoice(l2dPrm);
				}
			}else{
				if(common.doc.getElementById("charaVoice").getElementsByClassName("current")[0]){
					common.removeClass(common.doc.getElementById("charaVoice").getElementsByClassName("current")[0]);
				}
				common.addClass(common.doc.getElementById("cardDetail"),"showLive2dFullscreen");
				common.tapBlock(true);
				common.androidKeyStop = true;

				var fullL2dPrm = {};
				fullL2dPrm.id    = String(charaId+this.live2dId);
				fullL2dPrm.key = isDoublePAPA ? "idle" : voiceKey;
				fullL2dPrm.type = isDoublePAPA ? 1 : 0;

				fullL2dPrm.x = (!isDoubleUnit) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetWidth / 2) : Math.floor(common.doc.getElementsByTagName("body")[0].offsetWidth / 2) + 180;
				fullL2dPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) : Math.ceil(common.shortSize / 2);

				if(isDoubleUnit){
					fullL2dPrm.subId = this.model.toJSON().chara.doubleUnitLive2dDetail;
					fullL2dPrm.subX = -60;
					fullL2dPrm.subY = 0;
				}

				fullL2dPrm.txtVisible = true;
				cmd.startL2d(fullL2dPrm)
				if (isDoublePAPA) {
					setTimeout(function(){ cmd.startVoice(voiceKey); },200);
				}
				setTimeout(function(){
					common.tapBlock(false);
				},500);
			}
		},
		finishFullScreen: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			common.removeClass(common.doc.getElementById("cardDetail"),"showLive2dFullscreen");
			common.androidKeyStop = false;

			live2dShow(this.model.toJSON(),null,this.live2dId);
		},
		voiceCheck : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			if(!this.voiceFullScreen){
				common.addClass(e.currentTarget,"on");
				this.voiceFullScreen = true;
			}else{
				common.removeClass(e.currentTarget,"on");
				this.voiceFullScreen = false;
			}
		},
		visualChangeCard: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			var target = e.currentTarget;
			if(target.classList.contains("off") || target.classList.contains("selected")) return;

			common.removeClass(common.doc.querySelector(".cardIllustWrap .selected"),"selected");
			common.addClass(target,"selected");

			var model = this.model.get("cardList")[target.dataset.cardarrindex];
			var cardImgElm     = common.doc.querySelector("#detailCardImage .cardImg");
			var cardFrameElm   = common.doc.querySelector("#detailCardImage .cardFrame");
			var zoomCardImgElm = common.doc.querySelector("#detailCardImage .zoomImg img");

			var cardRank = "frame_" + model.card.attributeId.toLowerCase() + "_" + model.card.rank.toLowerCase();
			cardImgElm.dataset.nativeimgkey = "card_" + model.cardId + "_c";
			cardImgElm.dataset.src          = "resource/image_native/card/image/card_" + model.cardId + "_c.png";
			zoomCardImgElm.dataset.nativeimgkey = "card_" + model.cardId + "_c";
			zoomCardImgElm.dataset.src          = "resource/image_native/card/image/card_" + model.cardId + "_c.png";
			cardFrameElm.dataset.nativebgkey = cardRank;
			cardFrameElm.dataset.src         = "resource/image_native/card/frame/"+cardRank+".png";

			cmd.getBaseData(common.getNativeObj());

			common.doc.querySelector(".illustrator").textContent = model.card.illustrator;
			common.doc.querySelector(".illustTitle").textContent = "★" + model.rankNum + "イラスト";
		},
		visualChangeCommand: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			var target = e.currentTarget;
			if(target.classList.contains("off") || target.classList.contains("selected")) return;

			common.removeClass(common.doc.querySelector(".miniCharaBtn .selected"),"selected");
			common.addClass(target,"selected");

			var model;
			if(target.dataset.commandtype == "chara") {
				model = {
					commandType : "CHARA",
					path     : "mini/image/",
					visualId : "mini_" + this.model.toJSON().currentCard.card.miniCharaNo + "_d",
					idNum    : Number(this.model.toJSON().currentCard.card.miniCharaNo)
				};
			} else {
				model = {
					commandType : "CARD",
					path     : "card/image/",
					visualId : "card_" + this.model.get("cardList")[target.dataset.cardarrindex].cardId + "_d",
					idNum    : Number(this.model.get("cardList")[target.dataset.cardarrindex].cardId)
				};
			}

			var commandImgElms = common.doc.querySelectorAll(".discPreview .discWrap img");
			_.each(commandImgElms,function(elm) {
				elm.dataset.nativeimgkey = model.visualId;
				elm.dataset.src          = "resource/image_native/" + model.path + model.visualId + ".png";
			});

			cmd.getBaseData(common.getNativeObj());
		},
		live2dChange: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			var that = this;
			common.removeClass(common.doc.querySelector(".live2dBtns .current"),"current");
			common.addClass(e.currentTarget,"current");
			this.live2dId = e.currentTarget.dataset.live2did;

			live2dShow(this.model.toJSON(),null,this.live2dId);
		},
		charaMoviewPlay: function(e) {
			e.preventDefault();
			return;
			if(common.isScrolled()) return;

			common.androidKeyStop = true;

			cmd.stopVoice();
			var charaId = this.model.toJSON().charaId;

			$(common.ready.target).on("webkitAnimationEnd",function(){
				cmd.changeBg("web_black.jpg");

				$(common.ready.target).off();

				$(common.ready.target).on("webkitAnimationEnd",function(e) {
					if(e.originalEvent.animationName == "readyFadeOut") {
						common.ready.target.className = "";
					}
				});

				$('#commandDiv').on('nativeCallback',function(e,res) {
					common.androidKeyStop = false;

					common.ready.target.className = "nativeFadeOut";

					cmd.startBgm(common.bgm);
					cmd.changeBg(common.background);

					cmd.setWebView();
					$('#commandDiv').off();
				});

				setTimeout(function() {
					cmd.setWebView(false);
					cmd.stopBgm();
					cmd.playCharaMovie(charaId);
				},500);
			});

			common.addClass(common.ready.target,"preNativeFadeIn");
		},
		playVoice: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			cmd.stopVoice();
			var fileName = "vo_char_" + this.model.toJSON().charaId + "_00_01";
			cmd.startVoice(fileName);
		}
	});

	var live2dShow = function(chara,voiceKey,live2dId) {
		var _live2dId = live2dId || "00";
		    _live2dId = chara.charaId + _live2dId;

		var l2dPrm = {};
		l2dPrm.id = String(_live2dId);
		l2dPrm.x = (!chara.chara.doubleUnitFlg || (chara.chara.doubleUnitFlg && (live2dId && live2dId !== "00"))) ? 250 : 400;
		l2dPrm.y = (common.displayWidth === 1024) ? Math.floor(common.doc.getElementsByTagName("body")[0].offsetHeight / 2) : Math.ceil(common.shortSize / 2);

		if(chara.chara.doubleUnitFlg && (!live2dId || live2dId === "00")){
			l2dPrm.subId = chara.chara.doubleUnitLive2dDetail;
			l2dPrm.subX = -80;
			l2dPrm.subY = 0;
		}

		var isDoublePAPA = chara.chara.doubleUnitFlg && live2dId == "88";

		if(voiceKey) {
			l2dPrm.voice = voiceKey;
			l2dPrm.key = voiceKey;

			cmd.storyMotionL2dVoice(l2dPrm);
		} else {
			l2dPrm.type  = 1;
			l2dPrm.key = "idle";
			cmd.endL2d();
			l2dPrm.txtVisible = true;
			cmd.startL2d(l2dPrm);
		}
	};

	var currentLive2dModel = function(live2dId,model) {
		var live2dModel;
		var live2dList = model.live2dList;
		live2dList.filter(function(item, index){
			// console.log(item.live2dId,live2dId)
			if ((item.live2dId).indexOf(live2dId) >= 0) {
				live2dModel = item;
			}
		});
		return live2dModel;
	}

	return CollectionDetailView;
});
