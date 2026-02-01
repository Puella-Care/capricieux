define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
	'cardUtil',
	//'text!template/chara/CharaDetail.html'
], function (
	_,Backbone,common,ajaxControl,cmd,
	cardUtil //,temp
) {
	'use strict';

	var CharaDetailView = Backbone.View.extend({
		id: "cardDetail",
		events: function() {
			var evtObj = {};
			evtObj[common.cgti + " #detailCardImage .cardImg"]         = this.cardZoom;
			evtObj[common.cgti + " #detailCardImage .zoomImg img"]     = this.cardZoom;
			evtObj[common.cgti + " #detailCardImage .zoomImg .textToggleBtn"] = this.zoomProfileToggle;
			evtObj[common.cgti + " #detailTab li"]            = this.tabChange;
			evtObj[common.cgti + " .collectionBack"]          = this.detailClose;
			evtObj[common.cgti + " .cardIllustWrap .mb_pink"] = this.visualChangeCard;
			evtObj[common.cgti + " .miniCharaBtn .mb_pink"]   = this.visualChangeCommand;
			evtObj[common.cgti + " .voicePlayBtn"]            = this.playVoice;
			evtObj[common.cgti + " .moviePlayBtn"]            = this.charaMoviewPlay;
			evtObj[common.cgti + " .live2dChangeBtn"]         = this.live2dChange;

			return evtObj;
		},
		initialize : function(options) {
			this.template = _.template(
				common.doc.getElementById('tempCharaDetail').innerText
			);
			this.live2dId = this.model.get("live2dId");
			this.live2dSetFlag     = false;
			this.visualSetFlag     = false;
			this.displayCardId     = this.model.get("displayCardId");
			this.commandVisualType = this.model.get("commandVisualType"); // CARD or CHARA
			this.commandVisualId   = this.model.get("commandVisualId");   // cardId or miniCharaNo
		},
		render : function() {
			var enhancementSkills = [];
			// console.log('charaDetailModel', this.model.toJSON())
			// console.log('common.storage.gameUser.attributes', common.storage.gameUser.attributes);
			if(!this.model.toJSON().supportFlag && !this.model.toJSON().isShop && common.storage.userCharaEnhancementCellList){
				var _opendPointList = common.storage.userCharaEnhancementCellList.where({ charaId: (this.model.toJSON().charaId | 0) });
				_.each(_opendPointList, function(model) {
	                var _model = model.toJSON();
	                if(_model.charaEnhancementCell.enhancementType){
	                    switch(_model.charaEnhancementCell.enhancementType){
	                        case "SKILL" :
	                        case "ABILITY" :
	                            enhancementSkills.push(_model.charaEnhancementCell.emotionSkill);
	                            break;
	                        default :
	                            break;
	                    }
	                }
	            });

			} else if(this.model.toJSON().supportFlag && this.model.toJSON().emotionSkillList) {
				enhancementSkills = this.model.toJSON().emotionSkillList;
			}

			// 属性強化機能対応
			var _composeAttribute = common.getTargetComposeAttribute({
				attributeId: this.model.toJSON().card.attributeId,
			});
			if(this.model.toJSON().supportFlag){ // サポートの時はuserStatusListを別に持ってくる
				_composeAttribute = common.getTargetComposeAttribute({
					attributeId: this.model.toJSON().card.attributeId,
					userStatusList: this.model.toJSON().userStatusList,
				});
			};
			this.$el.html(this.template({
				model:this.model.toJSON(),
				enhance:enhancementSkills,
				composeAttribute:_composeAttribute,
			}));

			if(this.model.toJSON().supportFlag || this.model.toJSON().isShop) {
				common.addClass(this.el.querySelector('[data-type="setting"]'),'off');
				this.el.querySelector(".composeLinks").style.display = "none";
			}

			if(this.model.toJSON().initTabType) {
				var dataTypeVal = '[data-type="' + this.model.toJSON().initTabType + '"]';
				this.el.querySelector("#cardDetailWrap").className = this.model.toJSON().initTabType;
				common.removeClass(this.el.querySelector("#detailTab .current"),"current");
				common.addClass(this.el.querySelector(dataTypeVal),"current");
			}

			return this;
		},
		cardZoom: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			common.doc.querySelector("#detailCardImage").classList.toggle("zoom");

			if(common.displayWidth !== 1024 && common.doc.querySelector("#detailCardImage").classList.contains("zoom")){
				// console.log('common.doc.querySelector("#detailCardImage .zoomImg")',common.doc.querySelector("#detailCardImage .zoomImg"))
				common.doc.querySelector("#detailCardImage .zoomImg").style = "top: -webkit-calc(50% + 16px - 440px);";
			}else{
				common.doc.querySelector("#detailCardImage .zoomImg").style = "";
			}
		},
		zoomProfileToggle: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			common.doc.querySelector(".zoomProfile").classList.toggle("show");
			var btnText = common.doc.querySelector('.textToggleBtn').textContent;
			if(btnText.indexOf('OFF') !== -1) {
				common.doc.querySelector('.textToggleBtn').textContent = 'プロフィールON';
			} else {
				common.doc.querySelector('.textToggleBtn').textContent = 'プロフィールOFF';
			}
		},
		tabChange: function(e) {
			common.doc.querySelector("#cardDetailWrap").className = e.currentTarget.dataset.type;

			common.removeClass(e.currentTarget.parentNode.querySelector(".current"),"current");
			common.addClass(e.currentTarget,"current");

			common.scrollRefresh(null, null, true);
		},
		detailClose: function(e) {
			if(e) {
				e.preventDefault();
				if(common.isScrolled()) return;
			}

			cmd.stopVoice();
			if(this.live2dSetFlag) {
				this.live2dSet();
			}

			if(this.visualSetFlag) {
				this.visualSet(this.model.toJSON().closeEvent);
			} else if(this.model.toJSON().closeEvent) {
				this.model.toJSON().closeEvent();
			}

			this.remove();

			_.each(common.doc.querySelector("#baseContainer").children,function(elm) {
				common.removeClass(elm,"hide");
			});

			if( 
				common.location == "CharaListCustomize" || 
				common.location == "CharaListComposeAttribute"
			) {
				// カースチップ非表示対応
				common.addClass(common.doc.querySelector("#richeWrap"),"hide");
			}

			common.androidKeyStop = false;
			common.detailView = null;
		},
		visualChangeCard: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			var target = e.currentTarget;
			if(target.classList.contains("off") || target.classList.contains("selected")) return;

			common.removeClass(common.doc.querySelector(".cardIllustWrap .selected"),"selected");
			common.addClass(target,"selected");

			if(!this.visualSetFlag) {
				this.visualSetFlag = true;
			}

			var model = this.model.get("cardArr")[target.dataset.cardarrindex];
			var cardImgElm     = common.doc.querySelector("#detailCardImage .cardImg");
			var zoomCardImgElm = common.doc.querySelector("#detailCardImage .zoomImg img");

			cardImgElm.dataset.nativeimgkey = "card_" + model.cardId + "_c";
			cardImgElm.dataset.src          = "resource/image_native/card/image/card_" + model.cardId + "_c.png";
			zoomCardImgElm.dataset.nativeimgkey = "card_" + model.cardId + "_c";
			zoomCardImgElm.dataset.src          = "resource/image_native/card/image/card_" + model.cardId + "_c.png";
			cmd.getBaseData(common.getNativeObj());

			this.displayCardId = model.cardId;
		},
		visualChangeCommand: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			var target = e.currentTarget;
			if(target.classList.contains("off") || target.classList.contains("selected")) return;

			common.removeClass(common.doc.querySelector(".miniCharaBtn .selected"),"selected");
			common.addClass(target,"selected");

			if(!this.visualSetFlag) {
				this.visualSetFlag = true;
			}
			var model;
			if(target.dataset.commandtype == "chara") {
				model = {
					commandType : "CHARA",
					path     : "mini/image/",
					visualId : "mini_" + this.model.toJSON().card.miniCharaNo + "_d",
					idNum    : Number(this.model.toJSON().card.miniCharaNo)
				};
			} else {
				model = {
					commandType : "CARD",
					path     : "card/image/",
					visualId : "card_" + this.model.get("cardArr")[target.dataset.cardarrindex].cardId + "_d",
					idNum    : Number(this.model.get("cardArr")[target.dataset.cardarrindex].cardId)
				};
			}

			var commandImgElms = common.doc.querySelectorAll(".discPreview .discWrap img");
			_.each(commandImgElms,function(elm) {
				elm.dataset.nativeimgkey = model.visualId;
				elm.dataset.src          = "resource/image_native/" + model.path + model.visualId + ".png";
			});

			cmd.getBaseData(common.getNativeObj());

			this.commandVisualType = model.commandType;
			this.commandVisualId   = model.idNum;
		},
		visualSet: function(closeEvent) {
			var sendFlag = false;
			var model = this.model.toJSON();

			var callback = function(res) {
				common.responseSetStorage(res);

				var cardModel   = (res.userCardList)  ? res.userCardList[0]  : common.storage.userCardList.findWhere({id:model.userCardId}).toJSON();
				var charaModel  = (res.userCharaList) ? res.userCharaList[0] : common.storage.userCharaList.findWhere({charaId:model.charaId}).toJSON();
				var extendModel = cardUtil.addExStatus($.extend(cardModel,charaModel));

				if(common.storage.userCardListEx) {
					var cardExModel = common.storage.userCardListEx.findWhere({id:model.id});
					if(cardExModel) {
						cardExModel.clear({silent:true});
						cardExModel.set(extendModel);
					}
				}
				if(closeEvent) {
					closeEvent();
				}

				if(common.pageObj && common.pageObj.charaDetailClose) {
					common.pageObj.charaDetailClose();
				}
			};
			var prm = {};
			prm.charaId           = this.model.get("charaId");
			prm.commandVisualType = this.commandVisualType;
			prm.commandVisualId   = this.commandVisualId;
			prm.displayCardId     = this.displayCardId;
			if(this.model.get("commandVisualType") !== this.commandVisualType) {
				sendFlag = true;
			}
			if(this.model.get("commandVisualId") !== this.commandVisualId) {
				sendFlag = true;
			}
			if(this.model.get("displayCardId") !== this.displayCardId) {
				sendFlag = true;
			}
			if(sendFlag) {
				ajaxControl.ajaxPost(common.linkList.userCharaVisualize,prm,callback);
			} else {
				if(closeEvent) {
					closeEvent();
				}
			}

		},
		live2dSet: function() {
			var sendFlag = false;
			var model = this.model.toJSON();
			var callback = function(res) {
				common.responseSetStorage(res);
				var cardModel   = (res.userCardList)  ? res.userCardList[0]  : common.storage.userCardList.findWhere({id:model.userCardId}).toJSON();
				var charaModel  = (res.userCharaList) ? res.userCharaList[0] : common.storage.userCharaList.findWhere({charaId:model.charaId}).toJSON();
				var extendModel = cardUtil.addExStatus($.extend(cardModel,charaModel));

				var cardExModel = common.storage.userCardListEx.findWhere({id:model.id});
					cardExModel.clear({silent:true});
					cardExModel.set(extendModel);
			};
			var prm = {};
			prm.charaId  = this.model.get("charaId");
			prm.live2dId = this.live2dId;
			if(this.model.get("live2dId") !== this.live2dId) {
				sendFlag = true;
			}
			if(sendFlag) {
				ajaxControl.ajaxPost(common.linkList.live2dSet,prm,callback);
			}
		},
		charaMoviewPlay: function(e) {
			e.preventDefault();
			return;
			if(common.isScrolled()) return;

			cmd.stopVoice();
			common.androidKeyStop = true;

			var charaId = this.model.toJSON().charaId;

			$(common.ready.target).on("webkitAnimationEnd",function(){
				cmd.changeBg("web_black.jpg");

				$(common.ready.target).off();

				if(common.pageObj && common.pageObj.beforeMovieStart) {
					common.pageObj.beforeMovieStart();
				}

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

					if(common.pageObj && common.pageObj.afterMovieEnd) {
						common.pageObj.afterMovieEnd();
					}
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
		},
		live2dChange: function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;

			this.live2dSetFlag = true;

			common.removeClass(common.doc.querySelector(".live2dBtns .current"),"current");
			common.addClass(e.currentTarget,"current");
			this.live2dId = e.currentTarget.dataset.live2did;
		}
	});

	return CharaDetailView;
});
