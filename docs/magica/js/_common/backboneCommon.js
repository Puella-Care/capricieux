/*global define*/
define([
	"jquery",
	"underscore",
	'backbone'
], function ($,_,Backbone) {
	'use strict';

	// ------------------------------------------------------------------------.
	//共通パラメータ用オブジェクト
	var common = {};

	common.nativeDownload = false;
	common.background = "web_common.ExportJson"; // 背景を変えるたびに格納される
	common.bgm        = "bgm01_anime07";         // BGMを開始するたびに格納される

	common.settingBg  = 'web_0011.ExportJson';
	common.settingBgm = "bgm01_anime07";

	common.mainQuestMode = "NORMAL";

	common.settingThemeInit = function() {
		if(common.storage.gameUser) {
			// console.log(common.storage.gameUser);
			var bgId   = common.storage.gameUser.get("bgItemId");
			var bgItem = common.storage.gameUser.get("bgItem");
			if(bgId && bgItem) {
				common.settingBg = bgItem.backgroundImage;
				if(bgItem.parameter) {
					common.settingBgm = bgItem.parameter;
				} else {
					common.settingBgm = "bgm01_anime07";
				}
			} else {
				common.settingBg  = 'web_0011.ExportJson';
				common.settingBgm = "bgm01_anime07";
			}
		} else {
			common.settingBg  = 'web_0011.ExportJson';
			common.settingBgm = "bgm01_anime07";
		}
	};

	// 強制リソースダウンロードフラグ
	common.resourceUpdated = false;

	common.tutorialId   = null;
	common.tutorialUtil = null;

	common.historyArr = [];
	common.doc = document;
	common.content = $("#mainContent");
	common.location = "";
	common.imgData = {};

	// ------------------------------------------------------------------------.
	// タップ時エフェクト
	common.EffectView = Backbone.View.extend({
		className: "commonEffect",
		events : function(){
			var evtObj = {};
			evtObj.webkitAnimationEnd = this.removeView;

			return evtObj;
		},
		render : function() {
			this.$el.html(this.template({model:this.model}));
			this.el.style.top = (this.model.y - 128) + "px";
			this.el.style.left = (this.model.x - 128) + "px";

			return this;
		},
		removeView: function() {
			this.remove();
		}
	});
	common.EffectView.prototype.template = _.template($('#TapEffect').text());

	// ------------------------------------------------------------------------.
	// ネイティブから画像を取得
	common.getNativeObj = function() {
		var nativeSendObj = {};

		var imgArr = common.doc.querySelectorAll('[data-nativeimgkey]') || [];
		var bgArr = common.doc.querySelectorAll('[data-nativebgkey]') || [];

		_.each(imgArr,function(elm) {
			var key = elm.dataset.nativeimgkey;
			if(!common.imgData[key] && key !== "") {
				nativeSendObj[key] = elm.dataset.src;
			}
		});

		_.each(bgArr,function(elm) {
			var key = elm.dataset.nativebgkey;
			if(!common.imgData[key] && key !== "") {
				nativeSendObj[key] = elm.dataset.src;
			}
		});

		return nativeSendObj;
	};

	// ------------------------------------------------------------------------.
	// 期間チェック
	common.periodCheck = function(currentTime,endTime) {
		if(!currentTime || !endTime) return false;
		var _currentTime = currentTime.replace(/-/g,"\/");
		var _endTime     = endTime.replace(/-/g,"\/");

		var currentDate = new Date(_currentTime);
		var endDate     = new Date(_endTime);

		var currentMS = currentDate.getTime();
		var endMS     = endDate.getTime();

		// console.log("currentTime: ",currentTime);
		// console.log("endTime: ",endTime);
		// console.log("currentDate: ",currentDate);
		// console.log("endDate: ",endDate);
		// console.log("currentMS: ",currentMS);
		// console.log("endMS: ",endMS);

		if(endMS >= currentMS) {
			// console.log('終了前')
			return false;
		} else {
			// console.log('終了後')
			return "end"
		}
	};
	// クライアントの日時を返す
	common.getClientTime = function() {
		var clientTime;
		var date = new Date();

		clientTime = [date.getFullYear(),
					  ( '0' + (date.getMonth() + 1) ).slice( -2 ),
					  ( '0' + date.getDate()).slice( -2 )
					 ].join( '/' ) + ' '
					+ [( '0' + date.getHours()).slice( -2 ),
					  ('0' + date.getMinutes()).slice( -2 ),
					  ('0' + date.getSeconds()).slice( -2 )
					].join( ':' );

		return clientTime;
	};
	// 日付フォーマットを　月日時分　に
	common.getTimeText = function(date,flag) {
		var timeText;
		var _date = new Date(date);

		if(flag) {
			timeText = (_date.getMonth() + 1) + "月" +
						_date.getDate()     + "日 " +
						_date.getHours()    + ":" +
						('0' + _date.getMinutes()).slice( -2 );
		} else {
			timeText = (_date.getMonth() + 1) + "月" +
						_date.getDate()     + "日 " +
						_date.getHours()    + "時" +
						('0' + _date.getMinutes()).slice( -2 ) + "分";
		}
		return timeText;
	};

	//dateフォーマットの短縮形
	common.getDateShortening = function(_args){
		if(!_args.date){ //何もないときは何もしない
			return false;
		};
    var _date = {};
    var _dateOrg = new Date(_args.date);
    _date.yobi = ["日", "月", "火", "水", "木", "金", "土"][_dateOrg.getDay()];
    _date.yr = _dateOrg.getFullYear();
    //月日は0をつけない
    _date.mo = (""+(_dateOrg.getMonth()+1)).slice(-2);
    _date.da = (""+_dateOrg.getDate()).slice(-2);
    _date.ho = ("0"+_dateOrg.getHours()).slice(-2);
    _date.mi = ("0"+_dateOrg.getMinutes()).slice(-2);
    _date.se = ("0"+_dateOrg.getSeconds()).slice(-2);
    return _date;
  }//getDateShortening

	//date計算処理
	common.getAddDate = function(_args){
		if(!_args.date){ //何もないときは何もしない
			return false;
		};
		var _amount = _args.amount; //追加量
		var _type = _args.type; //追加の種類
    var _addDate = '';
    var _dateOrg = new Date(_args.date);
		if(_type == 'year'){
			_dateOrg.setFullYear(_dateOrg.getFullYear() + _amount);
		}else if(_type == 'month'){
			_dateOrg.setMonth(_dateOrg.getMonth() + _amount);
		}else if(_type == 'date'){
			_dateOrg.setDate(_dateOrg.getDate() + _amount);
		}else if(_type == 'hours'){
			_dateOrg.setHours(_dateOrg.getHours() + _amount);
		}else if(_type == 'minutes'){
			_dateOrg.setMinutes(_dateOrg.getMinutes() + _amount);
		}else if(_type == 'seconds'){
			_dateOrg.setSeconds(_dateOrg.getSeconds() + _amount);
		}else{
			//指定種類がなければ処理しない
		};
		//タイムゾーンは日本限定
		_addDate = _dateOrg.toLocaleString(
			'ja-JP',
			{
				timeZone: 'Asia/Tokyo',
			}
		);
    return _addDate;
  }//getAddDate

	//ローカルの時間経過を使って、ページアクセス時のサーバーのcurrentTimeから現在の経過時間を計算して
	//関数実行時に指定時間を経過しているかを返す
	common.getIsElapsedTargetTime = function(_args){
		var _pageAccessLocalTime = _args.pageAccessLocalTime; //ページにアクセスしたローカル時間
		var _pageAccessServerTime = _args.pageAccessServerTime; //ページにアクセスしたサーバー時間
		var _targetTime = _args.targetTime; //指定時間
		var _nowLocal = new Date();
		var _pageAccess = new Date(_pageAccessLocalTime);
		var _diff = _nowLocal.getTime() - _pageAccess.getTime();
		var _now = new Date(_pageAccessServerTime).getTime() + _diff;
		var _limit = new Date(_targetTime).getTime();
		var _isElapsed = false;
		if(_now >= _limit){
			_isElapsed = true;
		};
		return _isElapsed;
	};

	//現在時刻が指定した期間内かどうかを返す
	common.getStatusTargetTermInCurrentTime = function(_args){
		var _startAt = new Date(_args.startAt); //開始時間
		var _endAt = new Date(_args.endAt); //終了時間
		var _currentTime = new Date(_args.currentTime); //現在時間
		var _isInTerm = false;
		if(
			_startAt <= _currentTime && _currentTime < _endAt
		){
			_isInTerm = true;
		};
		return _isInTerm;
	};

	//カウントダウン関数
  //currentTime, endTime は必ず「 0000/00/00 00:00:00 」の形式にする
  common.countDownTimerManager = function(_args){
    var _callback = _args.callback;
    var _endTime = new Date(_args.endTime);
    var _currentTime = new Date(_args.currentTime);
    var _setSelector = _args.setSelector;
    var _isDispH = true; //H時間を表示するかどうか
    if(_args.isDispH != undefined){ //存在してれば
      _isDispH = _args.isDispH;
    }
		var _isOnlyS = false; //秒数のみ表示するかどうか
    if(_args.isOnlyS != undefined){ //存在してれば
      _isOnlyS = _args.isOnlyS;
    }
    var _timer;
    var _countNum = 1000;
    var _secondCount = 0;
		var _timerString = '';
		var spanS = _endTime - _currentTime - (_secondCount*_countNum);
    var _count = function(){
      spanS = _endTime - _currentTime - (_secondCount*_countNum);
      if(spanS < 0){//時間が過ぎたら
				var __h = '';
      	if(_isDispH){
      	  __h = "00:";
      	}
				var __time = '00:00';
				if(_isOnlyS){
					__h = '';
					__time = '00';
				};
				$(_setSelector).html(__h + __time); //0を出力しておく
        clearInterval(_timer);
        _callback();//コールバック実行
        return;
      }
      var s = Math.floor(spanS / 1000);
      var m = Math.floor(s / 60);
      var h = Math.floor(m / 60);
      m %= 60;
      s %= 60;
      s = String(s + 100).substring(1, 3);
      m = String(m + 100).substring(1, 3);
      h = String(h + 100).substring(1, 3);
      var __h = '';
      if(_isDispH){
        __h = h + ":";
      }
			_timerString = __h + m + ":" + s;
			if(_isOnlyS){
				_timerString = s;
			};
      $(_setSelector).html(_timerString);
      _secondCount = _secondCount+1;
    }
    var _manager = {};
    _manager.start = function(){
      _count();
			if(spanS >= 0){//時間が過ぎてなかったらカウント開始
				_timer = setInterval(_count, _countNum);
      }
    }
		_manager.getString = function(){
      return _timerString;
    }
    _manager.stop = function(){
			_timerString = '';
      clearInterval(_timer);
    }
    return _manager;
  }//countDownTimerManager

	// ------------------------------------------------------------------------.
	// Live2dパラメータ
	common.live2dDetail = function(detail) {
		var l2dPrm = {};
		if(!detail) return;

		if(detail.live2dDetail) {
			var splitArr = detail.live2dDetail.split("");
			l2dPrm.motionId = Number(splitArr[0]+splitArr[1]);
			l2dPrm.faceId = String(splitArr[2]+splitArr[3]+splitArr[4]);
			// l2dPrm.lipSync = float;

			if(detail.live2dDetail.split("").length == 8) {
				l2dPrm.cheekId = Number(splitArr[5]+splitArr[6]);
				l2dPrm.tearId = Number(splitArr[7]);
			} else {
				l2dPrm.cheekId = Number(splitArr[5]);
				l2dPrm.tearId = Number(splitArr[6]);
			}
		} else {
			l2dPrm = {};
		}

		l2dPrm.voice = "vo_char_"+detail.charaNo+"_"+detail.messageId;

		return l2dPrm;
	};

	// ------------------------------------------------------------------------.
	// ソート・フィルター記憶
	common.sfml = JSON.parse(localStorage.getItem("SortFilterMemoryList")) || {};
	common.sfm = function() {
		localStorage.setItem("SortFilterMemoryList",JSON.stringify(common.sfml));
		common.sfml = JSON.parse(localStorage.getItem("SortFilterMemoryList"));
	};

	// 魔法少女立ちポーズ
	common.miniCharaStandPose = localStorage.getItem("miniCharaStandPose") || 'wait';

	// ------------------------------------------------------------------------.
	// クエスト用
	common.questBattleModel = null;
	common.questSupportModel = null;

	// ------------------------------------------------------------------------.
	// 戻るボタンにイベントセット
	common.addBackHandler = function(event) {
		if(!event) {
			return;
		}
		// バックボタンがないときは何もしない
		if(!common.doc.getElementById("globalBackBtn")){
			// console.log("バックボタンがない")
			return;
		}

		// フラグを立てる
		common.eventBackHandler = true;

		var globalBackBtn = common.doc.getElementById("globalBackBtn");
		globalBackBtn.setAttribute("data-noLink","true");

		$(globalBackBtn).off(common.cgti);
		$(globalBackBtn).on(common.cgti,event);
	};
	common.removeBackHandler = function() {
		// DOMがないときはフラグとイベントを折って終了する
		common.eventBackHandler = false;
		if(!common.doc.getElementById("globalBackBtn")){
			$(globalBackBtn).off(common.cgti);
			// console.log("バックボタンがない")
			return;
		}

		// イベントを削除する
		var globalBackBtn = common.doc.getElementById("globalBackBtn");
		globalBackBtn.setAttribute("data-noLink","");
		$(globalBackBtn).off(common.cgti);
	};

	// ------------------------------------------------------------------------.
	// 初期ポップアップチェック
	var firstNaviPage = {
		GachaTop              : ["navi_011","navi_012_b"], // ガチャトップ
		CharaListTop          : ["navi_021_c"],            // 魔法少女一覧
		CharaListCustomize    : ["navi_031"],            // 魔法少女覚醒
		CharaListComposeMagia : ["navi_041"],            // 魔法少女マギア強化
		CharaListEquip        : ["navi_051_a","navi_052_a"], // 魔法少女装備
		MemoriaTop            : ["navi_061"],            // メモリアトップ
		ArenaTop              : ["navi_071_b"],          // ミラーズトップ
		FormationSupport      : ["navi_081_b"],          // サポート編成
		FormationTop          : ["navi_091_a","navi_092_a","navi_093","navi_094_a"], // 編成
		SubQuest              : ["navi_101"],             // 外伝
		MemoriaSetList        : ["navi_111"],             // メモリアセット編集
		MemoriaSetEquip       : ["navi_121"],             // メモリアセット呼び出し
		CharaQuest            : ["navi_131","navi_132"],     // 魔法少女＆衣装ストーリー
		CharaEnhancementTree  : ["navi_141"], // 精神強化
		CharaListComposeAttribute  : ["navi_151"] // 属性強化
	}
	common.firstNaviCheck = function(pageJson) {
		// console.log("firstNaviCheck:",pageJson.firstNavi);
		if(!pageJson) return;
		if(pageJson.firstNavi) {
			require(['js/view/tutorial/TutorialPopupView'],function(TutorialPopupView) {

				var tutorialPopupView;
				var imgArr = firstNaviPage[common.location];

				if(!imgArr) return;

				var callback = function() {
					TutorialPopupView.prototype.parentView = this;
					tutorialPopupView = new TutorialPopupView({
						imgArr : imgArr,
						type   : "tutorial"
					});
					common.doc.getElementsByClassName("popupInner")[0].appendChild(tutorialPopupView.render().el);
				};
				var closeEvent = function() {
					tutorialPopupView.removeView();
				};
				new common.PopupClass({
					"popupType"  : "tutorial"
				},null,callback,closeEvent);
			});
		}
	}

	common.eventFirstNavi = function(imgArr,eventId,eventType,closeCallback,eventDetail,dirName) {
		// console.log("firstNaviCheck:",pageJson.firstNavi);
		if(!imgArr || !eventId || !eventType) return
		require(['js/view/tutorial/TutorialPopupView'],function(TutorialPopupView) {
			var tutorialPopupView;

			var callback = function() {
				TutorialPopupView.prototype.parentView = this;
				tutorialPopupView = new TutorialPopupView({
					imgArr:imgArr,
					type: dirName ? dirName : "event",
					eventId: eventId,
					eventType: eventType,
					callback: closeCallback,
					eventDetail: eventDetail,
					dirName: dirName
				});
				common.doc.getElementsByClassName("popupInner")[0].appendChild(tutorialPopupView.render().el);
			};
			var closeEvent = function() {
				tutorialPopupView.removeView();
			};
			new common.PopupClass({
				"popupType"  : "tutorial"
			},null,callback,closeEvent);
		});
	}

	common.announceOpen = function(eventId,campaignId) {
		common.tapBlock(true);
		// 負荷軽減のため、テンプレートをあと読みにしている。
		// ただし、バナーとお知らせは都度読み込むためにrequire.jsの仕様からbust=を設定
		var announceView;
		var bustTime = ((((new Date()).getTime() / 60000) | 0) * 60000);
		require(['js/view/system/AnnounceView',
			'text!template/user/AnnouncePopupTemp.html',
			'text!json/event_banner/event_banner.json?bust='+bustTime,
			'text!json/announcements/announcements.json?bust='+bustTime
			],function(AnnounceView,announcePopTemp,eventBannerJson,announcementJson) {
			var callBack = function(){
				if(announceView) announceView.trigger("removeView");
			};
			var popCall = function(){
				setTimeout(function(){
					// 開ききるまで操作は受け付けない
					common.tapBlock(false);
				},500);
			};
			// ポップアップを表示
			new common.PopupClass({
				title:"お知らせ",
				exClass:"announcementPopup",
				announce:true
			},announcePopTemp,popCall,callBack);
			// リセット用に変数に保存
			announceView = new AnnounceView({
				bannerJson       : eventBannerJson,
				announcementJson : announcementJson,
				targetEvent      : Number(eventId),
				targetCampaign   : Number(campaignId)
			});
		});
	}

	//指定お知らせ表示
	common.targetAnnounceOpen = function(_args) {
		var _announceData = _args.announceData;
		var _dispCallback = function(){
			//何もしない
		};
		if(_args.dispCallback){
			_dispCallback = _args.dispCallback;
		};
		common.tapBlock(true);
		// 負荷軽減のため、テンプレートをあと読みにしている。
		// ただし、バナーとお知らせは都度読み込むためにrequire.jsの仕様からbust=を設定
		var bustTime = ((((new Date()).getTime() / 60000) | 0) * 60000);
		var announceView;
		require(['js/view/system/AnnounceView',
			//'text!template/user/AnnouncePopupTemp.html',
		],function(
			AnnounceView, 
			//announcePopTemp,
		) {
			var callBack = function(){
				if(announceView) announceView.trigger("removeView");
			};
			var popCall = function(){
				setTimeout(function(){
					// 開ききるまで操作は受け付けない
					common.tapBlock(false);
					_dispCallback(); //コールバック実行
				},500);
			};
			// ポップアップを表示
			new common.PopupClass({
				title:"お知らせ",
				exClass:"announcementPopup",
				announce:true
			},
			common.doc.getElementById("tempAnnouncePopup").innerText,
			popCall,
			callBack);
			// リセット用に変数に保存
			announceView = new AnnounceView({
				bannerJson: JSON.stringify({}),
				announcementJson: JSON.stringify({}),
				announceData: _announceData,
			});
		});
	}

	// ------------------------------------------------------------------------.
	// キャンペーン情報整形
	common.campaignParse = function(campaignList) {
		var campaignArr = {};
		_.each(campaignList,function(campaign, index) {

			switch(campaign.campaignType) {
				case "POINT_UP":
					var arr = {
						"campaignId" : campaign.id,
						"CARD_COMPOSE":{},
						"EXPP":{},
						"YELL":{},
						"EXPC":{},
						"CC":{},
						"EP":{},
						"pointUpType":[],
						"globalBadge":false
					};

					_.each(campaign.parameterMap,function(factor,key) {
						// console.log("キャンペーン",factor,key,arr);
						if(key.indexOf("CARD_COMPOSE_") !== -1) {
							arr.CARD_COMPOSE[key.split("CARD_COMPOSE_")[1]] = (factor | 0) / 1000;
						}
						if(key.indexOf("EXPP_") !== -1) {
							arr.EXPP[key.split("EXPP_")[1]] = (factor | 0) / 1000;
							arr.pointUpType.push(key.split("EXPP_")[1]);
							if(key.split("EXPP_")[1] === "ALL") arr.globalBadge = true;
						}
						if(key.indexOf("YELL_") !== -1) {
							arr.YELL[key.split("YELL_")[1]] = (factor | 0) / 1000;
							arr.pointUpType.push(key.split("YELL_")[1]);
							if(key.split("YELL_")[1] === "ALL") arr.globalBadge = true;
						}
						if(key.indexOf("EXPC_") !== -1) {
							arr.EXPC[key.split("EXPC_")[1]] = (factor | 0) / 1000;
							arr.pointUpType.push(key.split("EXPC_")[1]);
							if(key.split("EXPC_")[1] === "ALL") arr.globalBadge = true;
						}
						if(key.indexOf("CC_") !== -1) {
							arr.CC[key.split("CC_")[1]] = (factor | 0) / 1000;
							arr.pointUpType.push(key.split("CC_")[1]);
							if(key.split("CC_")[1] === "ALL") arr.globalBadge = true;
						}
						if(key.indexOf("EP_") !== -1) {
							arr.EP[key.split("EP_")[1]] = (factor | 0) / 1000;
							arr.pointUpType.push(key.split("EP_")[1]);
							if(key.split("EP_")[1] === "ALL") arr.globalBadge = true;
						}
					});
					campaignArr[campaign.campaignType] = arr;
				break;

				case "HALF_AP":
					var arr = {
						"campaignId" : campaign.id,
						"questType"  : [],
						"chapterIds" : [],
						"bgImgPath"  : ""
					};

					arr.questType  = campaign.parameterMap.TARGET_QUEST_TYPES.split(",");
					arr.chapterIds = (campaign.parameterMap.TARGET_GENERIC_IDS) ? campaign.parameterMap.TARGET_GENERIC_IDS.split(",") : [];
					if (campaign.imagePath) {
						arr.bgImgPath  = 'url('+campaign.imagePath+') left top no-repeat'
					} else {
						arr.bgImgPath  = 'url(/magica/resource/image_web/campaign/half_ap/common/global_icon_all.png) left top no-repeat'
					}

					campaignArr[campaign.campaignType] = arr;
				break;

				case "QUEST_DROP_FACTOR":
					var arr = {
						"campaignId" : campaign.id,
						"questType"  : [],
						"chapterIds" : [],
						"bgImgPath"  : ""
					};

					arr.questType  = campaign.parameterMap.TARGET_QUEST_TYPES.split(",");
					arr.chapterIds = (campaign.parameterMap.TARGET_GENERIC_IDS) ? campaign.parameterMap.TARGET_GENERIC_IDS.split(",") : [];
					arr.bgImgPath  = 'url(/magica/resource/image_web/campaign/drop_up/' + arr.campaignId + '/global_icon.png) left top no-repeat'

					campaignArr[campaign.campaignType] = arr;
				break;

				case "ARENA_REWARD_UP":
					var arr = {
						"campaignId"    : campaign.id,
						"magnification" : campaign.parameterMap.ARENA_REWARD_UP | 0
					};

					campaignArr[campaign.campaignType] = arr;
				break;

				case "BOX_GACHA":
					var arr = {
						"campaignId"    : campaign.id,
						"bannerImgPath" : campaign.parameterMap.MYPAGE_BANNER_IMAGE
					};

					campaignArr[campaign.campaignType] = arr;
				break;

				case "FREE_AT_NOT_CLEAR":
					var arr = {
						"campaignId" : campaign.id,
						"questType"  : [],
						"chapterIds" : [],
						"sectionIds" : []//,
						// "bgImgPath"  : ""
					};

					arr.questType  = (campaign.parameterMap.TARGET_QUEST_TYPES) ? campaign.parameterMap.TARGET_QUEST_TYPES.split(",") : [];
					arr.chapterIds = (campaign.parameterMap.TARGET_GENERIC_IDS) ? campaign.parameterMap.TARGET_GENERIC_IDS.split(",") : [];
					arr.sectionIds = (campaign.parameterMap.TARGET_SECTION_IDS) ? campaign.parameterMap.TARGET_SECTION_IDS.split(",") : [];
					campaignArr[campaign.campaignType] = arr;
				break;
			}
		});
		// console.log("キャンペーン",campaignArr);
		return campaignArr;
	}

	//キャンペーン情報から消費APの変更をquestBattleModelに埋め込む
	common.inputOverwriteApInfo = function(_args){
		var _campaignList = _args.campaignList;
		var _sectionModel = _args.sectionModel;
		var _questBattleModel = _args.questBattleModel;
		//キャンペーンでのAP変換
		var _campaignData = common.campaignParse(_campaignList);
		var _halfAp = null; //ap半減値
		var _freeAtNotClear = false; //AP消費なし
		if(_campaignData) {
			if(_campaignData.FREE_AT_NOT_CLEAR){
				if(_campaignData.FREE_AT_NOT_CLEAR.sectionIds.length > 0 && _campaignData.FREE_AT_NOT_CLEAR.sectionIds.indexOf(String(_sectionModel.sectionId)) >= 0){
					_freeAtNotClear = true;
				}else if(_campaignData.FREE_AT_NOT_CLEAR.chapterIds.length > 0 && _campaignData.FREE_AT_NOT_CLEAR.chapterIds.indexOf(String(_sectionModel.section.genericId)) >= 0){
					_freeAtNotClear = true;
				}else if(!_freeAtNotClear && _campaignData.FREE_AT_NOT_CLEAR.questType){
					_.each(_campaignData.FREE_AT_NOT_CLEAR.questType ,function(targetQuestType, index) {
						if(targetQuestType === "ALL" || targetQuestType == _sectionModel.section.questType){
							_freeAtNotClear = true;
						}
					});
				}
			}
			if(_campaignData.HALF_AP){
				_.each(_campaignData.HALF_AP.questType ,function(targetQuestType, index) {
					if(targetQuestType == "MAIN" || targetQuestType == "SUB") {
						if(targetQuestType == _sectionModel.section.questType &&
							(_campaignData.HALF_AP.chapterIds.indexOf(String(_sectionModel.section.genericId)) >= 0 ||
							_campaignData.HALF_AP.chapterIds.length === 0)
						){
							_halfAp = Math.ceil(_sectionModel.section.ap/2);
							if(_questBattleModel.questBattle.ap){ //クエスト用ap優先
								_halfAp = Math.ceil(_questBattleModel.questBattle.ap/2);
							};
						}
					} else {
						if(targetQuestType == "ALL" || targetQuestType == _sectionModel.section.questType) {
							_halfAp = Math.ceil(_sectionModel.section.ap/2);
							if(_questBattleModel.questBattle.ap){ //クエスト用ap優先
								_halfAp = Math.ceil(_questBattleModel.questBattle.ap/2);
							};
						}
					}
				});
			}
		}
		//対象の_questBattleModelに追加
		if(_halfAp){
			_questBattleModel.halfAp = _halfAp;
			_questBattleModel.overwriteAp = _halfAp;
		};
		if(_freeAtNotClear){
			_questBattleModel.campaignFreeAtNotClear = _freeAtNotClear;
			_questBattleModel.overwriteAp = 0;
		};
	};

	common.preNativeFadeIn = function(callback, delay) {
		var _delay = delay ? delay : 300;

		require(["command"],function(cmd){
			common.androidKeyStop = true;
			$(common.ready.target).on("webkitAnimationEnd",function(){
				$(common.ready.target).off();

				$(common.ready.target).on("webkitAnimationEnd",function(e) {
					if(e.originalEvent.animationName == "readyFadeOut") {
						common.ready.target.className = "";
					}
				});
				cmd.changeBg("web_black.jpg");

				setTimeout(function() {
					cmd.setWebView(false);
					callback();
				},_delay);
			});
			common.addClass(common.ready.target,"preNativeFadeIn");
		});
	};

	common.storyPlayCheck = function(storyId,callback,userQuestAdventureList) {
		if(!storyId || !callback) return false;

		// 既読チェック
		var storyPlay = true;
		var _userQuestAdventureList = userQuestAdventureList || common.storage.userQuestAdventureList.toJSON();
		_.each(_userQuestAdventureList, function(model) {
			if(storyId === model.adventureId) {
				storyPlay = false;
			}
		});

		if(storyPlay) { // 暗転
			$(common.ready.target).off();
			$(common.ready.target).on("webkitAnimationEnd",function(){
				cmd.changeBg("web_black.jpg");
				$(common.ready.target).off();
				$(common.ready.target).on("webkitAnimationEnd",function(e) {
					if(e.originalEvent.animationName == "readyFadeOut") {
						common.ready.target.className = "";
					}
				});

				var prm = {
					"adventureId": String(storyId)
				}
				ajaxControl.ajaxPost(common.linkList.userQuestAdventureRegist,prm,callback.bind(null,true));
			});

			if(common.ready.target.classList.contains('preNativeFadeIn')) {
				$(common.ready.target).trigger("webkitAnimationEnd");
			} else {
				common.addClass(common.ready.target,"preNativeFadeIn");
			}
		} else {
			callback(false);
		}
	};

	//ストーリーを読んだかどうかを返す
	common.isPlayStory = function(_args) {
		var storyId = _args.storyId;
		var userQuestAdventureList = _args.userQuestAdventureList;
		var __isPlayStory = false;
		//storyIdがなかったらここで終わり
		if(!storyId){
			return __isPlayStory;
		};
		// 既視聴チェック
		var _userQuestAdventureList = userQuestAdventureList || common.storage.userQuestAdventureList.toJSON();
		_.each(_userQuestAdventureList,function(model) {
			if(storyId === model.adventureId) {
				__isPlayStory = true;
			}
		});
		return __isPlayStory;
	};

	// ストーリー再生機能
	common.playStory = function(_args){
		var cmd = _args.cmd;
		var ajaxControl = _args.ajaxControl;
		var storyId = _args.storyId;
		var mainCallback = _args.callback;
		// 上記は必須の引数
		if(
			!storyId || 
			!mainCallback
		){
			return false;
		};
		var userQuestAdventureList = _args.userQuestAdventureList;
		var isForcePlay = false; //強制再生フラグ
		if(_args.isForcePlay){
			isForcePlay = _args.isForcePlay;
		};
		var fullVoiceSectionId = false; //フルボイス対応
		if(_args.fullVoiceSectionId){
			fullVoiceSectionId = _args.fullVoiceSectionId;
		};
		// 既視聴チェック
		var startStoryPlay = true;
		var _userQuestAdventureList = userQuestAdventureList || common.storage.userQuestAdventureList.toJSON();
		_.each(_userQuestAdventureList,function(model) {
			if(storyId === model.adventureId) {
				startStoryPlay = false;
			}
			if(isForcePlay){ //該当のstoryIdがあっても強制再生フラグがあれば再生する
				startStoryPlay = true;
			};
		});

		//再生開始
		var __callbackStoryPlay = function() {
			// ストーリー再生後のネイティブ側からのcallback
			$('#commandDiv').on('nativeCallback',function() {
				$('#commandDiv').off();
				cmd.setWebView(true);
				mainCallback();
			});
			setTimeout(function() {
				cmd.setWebView(false);
				cmd.startStory(storyId); // ストーリー再生開始
				if (window.isBrowser) $('#commandDiv').trigger('nativeCallback');
			},500);
		};

		// リソースダウンロードチェックがある場合に走る処理
		var __callbackDonwloadCheck = function(res){
			if(res) {
				common.responseSetStorage(res);
				if(!fullVoiceSectionId){ //フルボイス用SectionIdが無いなら
					__callbackStoryPlay(); //そのまま再生
					return;
				};
				// フルボイス対応用
				// 最初に該当ストーリーのリソースがダウンロード済みかのチェックを行う
				$('#commandDiv').on('nativeCallback',function() {
					$('#commandDiv').off();
					__callbackStoryPlay(); //ストーリー再生
				});
				setTimeout(function() {
					// セクションIDを文字列化
					var targetSection = "section_" + fullVoiceSectionId;
					cmd.setWebView(false);
					cmd.downloadFileFullVoice(targetSection);
					if(window.isBrowser) $('#commandDiv').trigger('nativeCallback');
				},500);
			} else {
				mainCallback();
			}
		};

		if(startStoryPlay) { //未視聴だったら再生
			// 暗転処理
			$(common.ready.target).off();
			$(common.ready.target).on("webkitAnimationEnd",function(){
				cmd.changeBg("web_black.jpg");
				$(common.ready.target).off();
				$(common.ready.target).on("webkitAnimationEnd",function(e) {
					if(
						e.originalEvent &&
						e.originalEvent.animationName == "readyFadeOut"
					) {
						common.ready.target.className = "";
					}
				});
				// userQuestAdventureList に追加する
				ajaxControl.ajaxPost(
					common.linkList.userQuestAdventureRegist,
					{
						"adventureId": String(storyId)
					},
					__callbackDonwloadCheck
				);
			});
			if(common.ready.target.classList.contains('preNativeFadeIn')) {
				$(common.ready.target).trigger("webkitAnimationEnd");
			} else {
				common.addClass(common.ready.target,"preNativeFadeIn");
			}
		} else {
			// 再生しない時はそのまま実行
			__callbackDonwloadCheck();
		}
	};

	// ------------------------------------------------------------------------.
	// Storage
	// 保持しておきたいmodelはキーを予めここにいれとく。
	// リスト系はcollection、それ以外はmodelで・・・
	// ここに無いものはページ読み込み時必ずfetchされて保持されない。
	// ------------------------------------------------------------------------.
	common.storage = {};
	common.storageType = {
		// "key":"model or collection"
		"user":            "model",
		"userList":        "model",
		"gameUser":        "model",
		"itemList":        "collection",
		"giftList":        "collection",
		"pieceList":       "collection",
		"titleList":       "collection",
		"userStatusList":  "collection",
		"userCharaList":   "collection",
		"userCharaEnhancementCellList" : "collection",
		"userCharaAtbEnhancementCellList" : "collection",
		"atbEnhancementCellList" : "collection",
		"userCardList":    "collection",
		"userDoppelList":  "collection",
		"userDeckList":    "collection",
		"userPieceList":   "collection",
		"userPieceSetList": "collection",
		"userPieceArchiveList": "collection",
		"userPieceStorageList": "collection",
		"userLive2dList":  "collection",
		"userItemList":    "collection",
		"userGiftList":    "collection",
		"userFollowList":  "collection",
		"userFormationSheetList":  "collection",
		"userQuestAdventureList":  "collection",
		"userArenaBattle": "model",
		"userChapterList":     "collection",
		"userSectionList":     "collection",
		"userQuestBattleList": "collection",
		"presentList":            "collection",
		"userDailyChallengeList": "collection",
		"userTotalChallengeList": "collection",
		"userLimitedChallengeList": "collection",
		"userTitleList": "collection",
		"userTotalForces": "model",
		"patrolList":     "collection",
		"patrolAreaList": "collection",
		"userPatrolList": "collection",
		"userEventPuellaRaid": "model",
		"userGachaKindList": "collection",
		"charaList": "collection",
		"doppelList": "collection",
		"enemyList": "collection",
		"userEnemyList": "collection",
		"userPieceCollectionList": "collection",
	};
	common.checkStorageType = function(modelId) {
		return common.storageType[modelId] || null;
	};
	common.setStorage = function(instance,id) {
		common.storage[id] = {};
		common.storage[id] = instance;
	};
	common.hasModel = function(modelId) {
		var hasFlag = (common.storage[modelId]) ? true : false;
		return hasFlag;
	};
	common.responseSetStorage = function(resJson) {
		// console.log("responseSetStorage:start:",resJson);
		for(var key in resJson) {
			if(key == "resultCode") continue;
			// console.log("-------------------------------");
			// console.log("key2:",key);
			if(resJson[key] instanceof Array) {                                 // collectionにレスポンスをセットする
				// console.log("collection:",key);
				// console.log(common.hasModel(key));
				if(common.hasModel(key)) {
					// console.log("hasModel:true:",common.hasModel(key));
					_.each(resJson[key],function(resJson,index,obj) {
						// console.log("responseSetStorage:",resJson,index,obj);
						// todo:検索idいろいろあるからcollectionとして保持するものについてるid名を検索して返すような関数作る
						var searchId;
						if(resJson.id) {
							searchId = {"id":resJson.id};
						} else if(resJson.itemId) {
							searchId = {"itemId":resJson.itemId};
						} else if(resJson.statusId) {
							searchId = {"statusId":resJson.statusId};
						} else if(resJson.charaId) {
							searchId = {"charaId":resJson.charaId};
						} else if(resJson.challengeId){
							searchId = {"challengeId":resJson.challengeId};
						} else if(resJson.giftId){
							searchId = {"giftId":resJson.giftId};
						} else if(resJson.chapterId) {
							searchId = {"chapterId":resJson.chapterId};
						} else if(resJson.sectionId) {
							searchId = {"sectionId":resJson.sectionId};
						} else if(resJson.questBattleId) {
							searchId = {"questBattleId":resJson.questBattleId};
						} else if(resJson.areaMapId) {
							searchId = {"areaMapId":resJson.areaMapId};
						} else if(resJson.followUserId){
							searchId = {"followUserId":resJson.followUserId};
						} else if(resJson.deckType) {
							searchId = {"deckType":resJson.deckType};
						} else if(resJson.doppelId) {
							searchId = {"doppelId":resJson.doppelId};
						} else if(resJson.formationSheetId) {
							searchId = {"formationSheetId":resJson.formationSheetId};
						} else if(resJson.adventureId) {
							searchId = {"adventureId":resJson.adventureId};
						} else if(resJson.setNum) {
							searchId = {"setNum":resJson.setNum};
						} else if(resJson.titleId){
							searchId = {"titleId":resJson.titleId};
						}
						// ------------------------------------------------.

						// 図鑑バグ対策とかとか
						if(key === "pieceList"){
							searchId = {"pieceId":resJson.pieceId};
						}else if(key === "itemList"){
							searchId = {"itemCode":resJson.itemCode};
						}else if(key == "userLive2dList") {
							searchId.charaId  = resJson.charaId;
							searchId.live2dId = resJson.live2dId;
						}

						// 感情調整関連だったら
						// charaIdなども入ってるのでcharaEnhancementCellIdを優先
						if(resJson.charaEnhancementCellId){
							searchId = {"charaEnhancementCellId":resJson.charaEnhancementCellId};
						}

						var model = common.storage[key].findWhere(searchId);

						// userCharaAtbEnhancementCellList の時は追加処理
						if(key === "userCharaAtbEnhancementCellList"){
							model = false;
						}

						// findWhere(searchId)においてsearchIdが空の場合は破綻するので気をつける！
						if(model) {
							if(key !== "userFollowList"){
								model.clear({silent:true});
								model.set(resJson);
								// console.log("responseSetStorage:set:",key,model,resJson);
							}else{
								// userFollowListのみのスペシャルロジック
								// 該当のモデルは変更があった項目のみが帰ってくるため（フォロー一覧で使っているような情報がこない

								// 当日使ったユーザー判定 ネイティブget時のwebDataでくる
								if(!resJson.inviteCode && resJson.recentUsedAt){
									model.set({recentUsedAt:resJson.recentUsedAt});
									// console.log("common.storage[userFollowList]",common.storage.userFollowList.toJSON());
								}else{
									model.clear({silent:true});
									model.set(resJson);
								}
							}
						} else {
							common.storage[key].add(resJson);
							// console.log("responseSetStorage:add:",key,common.storage[key],resJson);
						}
					});
				} else {
					// console.log("resJson[key]",resJson[key]);
					var collectionId = key;
					var Collection = Backbone.Collection.extend({
						url:common.linkList[collectionId]
					});
					var collection = new Collection(resJson[key]);
					common.setStorage(collection,collectionId);
				}

			} else {                                                            // modelにレスポンスをセットする
				// console.log("model:",key,resJson[key]);

				if(common.storage[key]) {
					common.storage[key].set(resJson[key]);
				} else {
					var modelId = key;
					var Model = Backbone.Model.extend({
						url: common.linkList[modelId]
					});
					var model = new Model(resJson[key]);
					// console.log("setStorage:",model,modelId);
					common.setStorage(model,modelId);
				}
			}
		}

		// console.log("end",common.storage);
	};
	// todo
	common.refreshStorage = function() {
		common.storage = {};
	};

	// ------------------------------------------------------------------------.
	// ローディングあれこれ
	// loading: ajax通信時に表示　ready: ページ遷移時に表示
	// ------------------------------------------------------------------------.
	common.loading = {};
	common.loading.target = common.doc.getElementById("loading");

	common.loading.hide = function() {
		setTimeout(function(){common.androidKeyForceStop = false},500);// 連打防止でディレイをかける
		common.loading.target.style.display = "none";
	};
	common.loading.show = function() {
		common.androidKeyForceStop = true;
		common.loading.target.style.display = "block";
	};

	common.ready = {};
	common.ready.target      = common.doc.getElementById("ready");
	common.ready.content     = common.doc.getElementById("baseContainer");

	common.ready.hide = function() { // 内容を表示する
		// ネイティブへの遷移時に暗転していたら暗転を解除する
		if($(common.ready.target).hasClass("show") ||
			 $(common.ready.target).hasClass("fadein") ||
			 $(common.ready.target).hasClass("preNativeFadeIn")) {
			setTimeout(function() {
				common.ready.target.className = "fadeout";
				common.androidKeyForceStop = false;
			},100);
		}

		if($(common.ready.target).hasClass("tutorialStart")) {
			setTimeout(function() {
				common.ready.target.className = "tutorialStartFadeout";
				common.androidKeyForceStop = false;
			},100);
		}

		if($(common.ready.target).hasClass("gameStartFadeIn")) {
			setTimeout(function() {
				common.ready.target.className = "gameStartFadeOut";
				common.androidKeyForceStop = false;
			},100);
		}

		// ページの内容を表示する
		if($(common.ready.content).hasClass("fadeout")) {
			setTimeout(function() {
				common.removeClass(common.ready.content,"fadeout");
				common.addClass(common.ready.content,"fadein");
				common.androidKeyForceStop = false;
			},300);
		}
	};

	common.ready.show = function() { // 内容を隠す
		// ページの内容を隠す
		common.androidKeyForceStop = true;

		common.removeClass(common.ready.content,"fadein");
		common.addClass(common.ready.content,"fadeout");
		common.tapBlock(true);
	};

	// ------------------------------------------------------------------------.
	common.tapBlock = function(flag) {
		// console.log("★tapBlock:",flag);
		if(flag && !common.tutorialId){
			common.doc.querySelector("#tapBlock").style.display = "block";
			common.addClass(common.doc.getElementById("globalBackBtn"),"off");
		}else{
			var time = (common.tutorialId && !flag) ? 1000 : 10;
			setTimeout(function() {
				if(flag) {
					common.doc.querySelector("#tapBlock").style.display = "block";
					common.addClass(common.doc.getElementById("globalBackBtn"),"off");
				} else {
					common.doc.querySelector("#tapBlock").style.display = "";
					common.removeClass(common.doc.getElementById("globalBackBtn"),"off");
				}
			},time);
		}
	};

	//ページ遷移時に解除されないタップブロック
	common.forceTapBlock = function(_args) {
		var _isBlock = _args.isBlock;
		if(_isBlock){
			common.doc.querySelector("#forceTapBlock").style.display = "block";
		}else{
			common.doc.querySelector("#forceTapBlock").style.display = "";
		};
	};

	// ------------------------------------------------------------------------.
	// userAgent.
	// ------------------------------------------------------------------------.
	var uaMatch = function () {
		var ua = navigator.userAgent.toLowerCase();
		for (var i = 0; i < arguments.length; i++) {
			if (ua.match(arguments[i])) {
				return true;
			}else if(arguments[i] === "ipad" && window.clientInformation.platform === "MacIntel" && typeof document.ontouchstart !== 'undefined'){
				// iPad専用判定
				return true;
			}
		}
		return false;
	};

	common.ua = {
		ios: uaMatch('ipad', 'iphone', 'ipod'),
		ios6: uaMatch('iphone os 6_'),
		ios7: uaMatch('iphone os 7_'),
		ipad: uaMatch('ipad'),
		ipod: uaMatch('ipod'),

		android: uaMatch('android'),
		isAndroidOs5: uaMatch('android 5'),
		isAndroidOs4_4: uaMatch('android 4.4'),
		isAndroidOs4_2: uaMatch('android 4.2'),
		isAndroidOs4_1: uaMatch('android 4.1'),
		isGalaxyNote:uaMatch('sc-02e','sc-01g','sc-05d','scl22','scl24','sc-01f'),
		isGalaxysTab: uaMatch('sc-01e'),
		isGalaxys2: uaMatch('isw11sc', 'sc-02c', 'sc-03d'),
		isGalaxys3: uaMatch('sc-03e', 'sc-06d', 'scl21'),
		isGalaxyNote2: uaMatch('sc-02e'),
		isGalaxys3a: uaMatch('sc-03e'),
		isGalaxyJ: uaMatch('sc-02f'),
		isXperia: uaMatch('is11s', 'is12s', 'so-01b', 'so-01c', 'so-01e', 'so-02e', 'so-03d', 'sol21', 'sol22'),
		isXperiaAX: uaMatch('so-01e'),
		isArrows: uaMatch('f-05d', 'f-10d', 'fjl'),
		isEluga: uaMatch('p-02e'),
		isINFOBAR_A02: uaMatch('htx21'),

		isNexus6: uaMatch('nexus 6'), // Nexus 6.
		isNexus: uaMatch('nexus 6','nexus 5'), // Nexus
		isNexus5x: uaMatch('nexus 5x'), // Nexus
		isSO_04E: uaMatch('so-04e'),
		isLowAnimeRate: uaMatch('201f','201m','202f','203sh','206sh','301f','302hw','302sh','303sh','403sc','404kc','asus_t00p','dm015k','f-01f','f-02e','f-02f','f-04e','f-05e','f-06e','fjl22','htl21','htl22','htl23','l-01e','l-04e','l-05d','l-05e','lgl24','lgv31','n-02e','n-03e','n-04e','n-06e','nexus 10','nexus 7','p-02e','p-03e','sc-01f','sc-01g','sc-02e','sc-02f','sc-03e','sc-04e','sc-06d','scl22','scl24','sh-02e','sh-02f','sh-04f','sh-05f','sh-06e','sh-08e','shl21','shl22','shl23','so-01e','so-04d','sol21','wx10k') //8レート
	};
	if (common.ua.ios) {
		common.ua.iosVersion = parseInt(navigator.userAgent.toLowerCase().
				split('os ')[1].substr(0, 1));

		if (uaMatch('iphone') && screen.availWidth == 480 &&
				screen.availHeight == 320) {
			common.ua.iphone4 = true;

		} else if (window.devicePixelRatio == 3) {
			common.ua.iphone6plus = true;
		}
	}

	uaMatch = null;

	common.setPlatForm = function(pageJson){
		if(pageJson && pageJson.currentPlatform){
			common.thisPlatform = pageJson.currentPlatform;
		}
	};

	// ------------------------------------------------------------------------.
	common.setStyle = function(style){
		common.doc.getElementById("headStyle").innerHTML = style;
	};
	//スタイルの追加
	common.addStyle = function(style){
		common.doc.getElementById("headStyle").innerHTML += style;
	};

	// ------------------------------------------------------------------------.
	// タッチ関連
	// ------------------------------------------------------------------------.
	var g_move_distance = 0;
	var g_move_span = 0;
	var g_move_span_limit = 16;
	var g_double_touch = 0;
	//toucheventの座標取得をひとつにまとめる
	var spanX = 0;
	var spanY = 0;
	var posX1 = 0;
	var posY1 = 0;
	var touchTime = 0;
	var timeSpan = 0;

	common.doc.addEventListener("touchstart",documentTouchStart,true);
	common.doc.addEventListener("touchend",documentTouchEnd,true);

	function documentTouchStart(e){
		g_move_distance = 0;
		g_move_span = 0;
		posX1 = e.changedTouches[0].clientX;
		posY1 = e.changedTouches[0].clientY;
		g_double_touch = e.touches.length;
	}
	function documentTouchEnd(e){
		spanX = posX1 - e.changedTouches[0].clientX;
		spanY = posY1 - e.changedTouches[0].clientY;
		spanX = (spanX < 0) ? -spanX : spanX;
		spanY = (spanY < 0) ? -spanY : spanY;
		g_move_span = (spanY - spanX > 0) ? spanY : spanX;
		if(e.touches.length < 1) g_double_touch = 0;
		//ダブルタップ禁止
		var nowTime = new Date().getTime();
		timeSpan = nowTime - touchTime;
		touchTime = nowTime;
	}

	// move中のイベントは果たして必要なのか？
	// if(common.ua.ios){
		common.doc.addEventListener("touchmove",documentTouchMove,{useCapture: true,passive: false});
	// }
	function documentTouchMove(e){
		// console.log(e);
		// console.log(g_move_distance);
		// console.log("----------");
		g_move_distance += 1;

		spanX = posX1 - e.changedTouches[0].clientX;
		spanY = posY1 - e.changedTouches[0].clientY;
		spanX = (spanX < 0) ? -spanX : spanX;
		spanY = (spanY < 0) ? -spanY : spanY;
		g_move_span = (spanY - spanX > 0) ? spanY : spanX;
		if(e.target.type === "range") return;
		e.preventDefault();
	}

	// アンドロイドのバックキーをおすまえにスクロールしてるとcommon.isScrolledが絶対にtrueになるため
	common.androidResetHandler = function(){
		g_move_distance = 0;
		g_move_span     = 0;
	};

	// ------------------------------------------------------------------------.

	common.isScrolled = function() {
		if(g_move_distance > 20) {
			// console.log("g_move_distance:",g_move_distance)
			return true;
		}
		return (g_move_span < g_move_span_limit)? false : true;
	};

	// Androidバックキー確認用
	common.isTouching   = function(){
		return (g_double_touch > 0) ? true : false;
	};

	// ダブルタップ判定処理
	common.isDoubleTouch = function(){
		return (g_double_touch > 1) ? true : false;
	};

	common.cgti = (function () { // commonGetTouchId. 端末によって効き具合が異なる.
		if (!common.ua.ios && !common.ua.android) {
			return 'click'; // pc browser.

		} else if (common.ua.isGalaxys2 || common.ua.isGalaxys3) {
			return 'click'; // !touchend.
		}

		return 'touchend'; // default. iOS=!click.
	})();

	// ------------------------------------------------------------------------.
	// popup
	// ------------------------------------------------------------------------.
	common.g_popup_instance = null;
	common.popupArea = common.doc.querySelector("#popupArea");
	$("#popupCurtain").on(common.cgti,function() {
		if(this.classList.contains('tapBlock')) return;
		if(common.g_popup_instance) {
			common.g_popup_instance.remove();
		}
	});

	common.PopupClass = function(json,temp,callback,closeEvent){
		var PopupModel = Backbone.Model.extend();

		if (common.g_popup_instance !== null) {
			common.g_popup_instance.remove();
		}

		common.g_popup_instance = this;

		this.popupView = null;
		this.temp = (temp) ? temp : common.doc.getElementById("popupTemp").textContent;
		json.canClose = (json.canClose === undefined) ? true : json.canClose;
		this.popupModel = new PopupModel(json);
		this.callback = callback;
		this.closeEvent = closeEvent;
		this.popupType = this.popupModel.get("popupType") || "typeA";
		this.exClass = this.popupModel.get("exClass") || "";
		this.simple  = (this.popupModel.get("simple")) ? "simpleAppear" : "";
		this.showCurtain = (this.popupModel.get("showCurtain") === undefined) ? true : this.popupModel.get("showCurtain");

		this.decideBtnLink = json.decideBtnLink;
		this.decideBtnEvent = json.decideBtnEvent;

		// console.log("Curtain",this.showCurtain);

		this.open();
	};

	common.PopupClass.prototype.open = function(){
		var me = this;
		var PageView = Backbone.View.extend({
			model : me.popupModel,
			className : "popupContent open " + this.popupType + " " + this.exClass + " " + this.simple,
			id : this.popupModel.get("popupId"),
			initialize : function(options) {
				this.template = _.template(me.temp);
			},
			events : function(){
				var eventObj = {};
				eventObj[common.cgti + " .popupCloseBtn"] = this.close;

				//アニメーション連鎖用
				eventObj.animationend          = this.nextAnimation;
				eventObj.webkitAnimationEnd    = this.nextAnimation;
				eventObj.webkitTransitionEnd   = this.nextAnimation;

				return eventObj;
			},
			render : function() {
				this.$el.html(this.template({model:this.model.toJSON()}));

				if(this.model.toJSON().decideBtnLink) {
					this.el.querySelector(".decideBtn").dataset.href = this.model.toJSON().decideBtnLink;
					common.addClass(this.el.querySelector(".decideBtn"),"linkBtn");
				}

				if(this.model.toJSON().decideBtnEvent) {
					var that = this;
					var btnElm = this.el.querySelector(".decideBtn");
					if(this.el.classList.contains("archiveMoveSelectPop")){
						btnElm = this.el.querySelectorAll(".decideBtn");
					}
					$(btnElm).on(common.cgti,function(e) {
						that.model.toJSON().decideBtnEvent(e);
					});
				}

				return this;
			},
			close : function(e){
				if(e) e.preventDefault();
				if(common.isScrolled()) return;
				common.removeClass(this.el,"open");
				common.addClass(this.el,"close");
				common.popupCloseBtn = true;
				if(common.helpPopup) common.helpPopup.removeHandler();
			},
			nextAnimation : function(e){
				if(e.currentTarget.classList.contains("close")){
					me.remove();
				}
			}
		});
		this.popupView = new PageView();

		//コンテンツ追加
		if(this.callback){
			// DOMの変更点を監視する
			var observer = new MutationObserver(function(){
				observer.disconnect();

				if(!me.callback || me.callback && typeof me.callback !== 'function') return;
				me.callback();
			});
			var observConfig = { attributes: false, childList: true, characterData: false };
			var observTarget = common.doc.getElementById("popupArea");
			observer.observe(observTarget, observConfig)
		}
		$("#popupArea").append(this.popupView.render().el);

		//カーテン
		if(this.showCurtain) {
			common.addClass(common.doc.getElementById("popupCurtain"),"show");
		}
		if(!this.canClose) {
			common.addClass(common.doc.getElementById("popupCurtain"),"tapBlock");
		}

		//width,height,top,left調節
		if(this.popupModel.get("param")){
			var param = this.popupModel.get("param");
			this.popupView.$el.find(".popupInner").css(param);
			param = null;
		}

		//callback！
		// if(this.callback) this.callback();
	};

	common.PopupClass.prototype.remove = function(){
		if(common.popupArea.className !== "") {
			var dataEvent = common.popupArea.className + "Close";
			var ev = new Event(dataEvent);
			common.popupArea.dispatchEvent(ev);

			common.popupArea.className = "";
		}

		common.doc.getElementById("popupCurtain").className = "";
		if(this.popupView) this.popupView.remove();
		if(this.popupModel) this.popupModel.clear();

		this.callback = null;
		this.popupView = null;
		this.popupModel = null;
		this.temp = null;
		common.g_popup_instance = null;
		if(this.closeEvent && common.popupCloseBtn) {
			if(typeof this.closeEvent == "function") {
				this.closeEvent();
			}
			if(typeof this.closeEvent == "object") {
				this.closeEvent[0](this.closeEvent[1]);
			}
		}
		this.closeEvent = null;
		common.popupCloseBtn = null;
	};

	// ------------------------------------------------------------------------.
	// Class
	// ------------------------------------------------------------------------.
	common.addClass = function(target,className){
		if(!target){
			// console.log("common.addClass error:"+target+" is none.");
			return;
		}
		if(Array.isArray(className)){
			for(var setClass in className){
				if(!target.classList.contains(className[setClass])){
					target.classList.add(className[setClass]);
				}else{
					// console.log("common.addClass alert:class["+className[setClass]+"] is allready setted.(element:"+target+")");
				}
			}
		}else{
			if(!target.classList.contains(className)){
				target.classList.add(className);
			}else{
				// console.log("common.addClass alert:class["+className+"] is allready setted.(element:"+target+")");
			}
		}
	};
	common.removeClass = function(target,className){
		if(!target){
			// console.log("common.removeClass error:"+target+" is none.");
			return;
		}
		if(Array.isArray(className)){
			for(var setClass in className){
				if(target.classList.contains(className[setClass])){
					target.classList.remove(className[setClass]);
				}else{
					// console.log("common.removeClass alert:class["+className[setClass]+"] is allready removed.(element:"+target+")");
				}
			}
		}else{
			if(target.classList.contains(className)){
				target.classList.remove(className);
			}else{
				// console.log("common.removeClass alert:class["+className+"] is allready removed.(element:"+target+")");
			}
		}
	};
	common.addClassId = function(targetId,className){
		if(!targetId){
			// console.log("common.addClass error:"+target+" is none.");
			return;
		}
		if(Array.isArray(className)){
			for(var setClass in className){
				if(!common.doc.getElementById(targetId).classList.contains(className[setClass])){
					common.doc.getElementById(targetId).classList.add(className[setClass]);
				}else{
					// console.log("common.addClass alert:class["+className[setClass]+"] is allready setted.(element:"+target+")");
				}
			}
		}else{
			if(!common.doc.getElementById(targetId).classList.contains(className)){
				common.doc.getElementById(targetId).classList.add(className);
			}else{
				// console.log("common.addClass alert:class["+className+"] is allready setted.(element:"+target+")");
			}
		}
	};
	common.removeClassId = function(targetId,className){
		if(!targetId){
			// console.log("common.removeClass error:"+target+" is none.");
			return;
		}
		if(Array.isArray(className)){
			for(var setClass in className){
				if(common.doc.getElementById(targetId).classList.contains(className[setClass])){
					common.doc.getElementById(targetId).classList.remove(className[setClass]);
				}else{
					// console.log("common.removeClass alert:class["+className[setClass]+"] is allready removed.(element:"+target+")");
				}
			}
		}else{
			if(common.doc.getElementById(targetId).classList.contains(className)){
				common.doc.getElementById(targetId).classList.remove(className);
			}else{
				// console.log("common.removeClass alert:class["+className+"] is allready removed.(element:"+target+")");
			}
		}
	};
	// ------------------------------------------------------------------------.
	// エラー処理
	// ------------------------------------------------------------------------.
	common.responseCheck = function(resp){
		if(resp.resultCode == "error"){
			this.errorFunc(resp.errorTxt,resp.errorLink);
			return false;
		}
		if(resp.resultCode == "redirect"){
			location.href = resp.pageLink;
			return false;
		}

		return true;
	};

	common.errorFunc = function(txt,url){
		$("#loading").css("display","none");
		//文言
		document.getElementById("commonJsErrorCautionText").textContent = txt;

		//ボタンイベント
		$("#commonJsErrorLinkBtn").on(cgti,errorLink);
		function errorLink(){
			$("#commonJsErrorLinkBtn").off(cgti,errorLink);
			//リンクがあれば飛ばす、なければ閉じる
			if(url){
				location.href = url;
			}else{
				popupClose("commonJsErrorPopup");
			}
		}
		popupStart("commonJsErrorPopup");
	};

	// ------------------------------------------------------------------------.
	// 合計石の取得
	// ------------------------------------------------------------------------.
	common.getTotalStone = function(){
		var uMoney = common.storage.userItemList.findWhere({itemId:"MONEY"});
		var pMoney = common.storage.userItemList.findWhere({itemId:"PRESENTED_MONEY"});
		var uQuantity = (uMoney) ? uMoney.get("quantity") : 0;
		var pQuantity = (pMoney) ? pMoney.get("quantity") : 0;
		var stoneArr = {"totalMoney":uQuantity+pQuantity,"userMoney":uQuantity,"presentedMoney":pQuantity};
		return stoneArr;
	};

	// ------------------------------------------------------------------------.
	// 有償無償石の消費計算
	// ------------------------------------------------------------------------.
	common.calcExpendStone = function(_args){
		var _quantity = _args.quantity; //消費数
		var _isPurchasedMoneyOnly = _args.isPurchasedMoneyOnly; //有償限定かどうか
		var _stoneArr = common.getTotalStone();
		var _remainStone = {};
		if(_isPurchasedMoneyOnly){ //有償限定の時
			if(_stoneArr.userMoney >= _quantity){ //有償石の消費
				_remainStone = {
					userMoney:_stoneArr.userMoney - _quantity,
					presentedMoney:_stoneArr.presentedMoney,
					totalMoney:_stoneArr.totalMoney - _quantity,
				};
			}else{ //石が足りない場合
				_remainStone = {
					userMoney:0,
					presentedMoney:0,
					totalMoney:_stoneArr.totalMoney - _quantity, //totalMoneyがマイナスになる
				};
			};
		}else{
			//無償石→有償石の順番に消費する
			if(_stoneArr.presentedMoney >= _quantity){ //無償石のみ消費
				_remainStone = {
					userMoney:_stoneArr.userMoney,
					presentedMoney:_stoneArr.presentedMoney - _quantity,
					totalMoney:_stoneArr.totalMoney - _quantity,
				};
			}else if(_stoneArr.totalMoney >= _quantity){ //有償石も消費
				var _expend = _stoneArr.presentedMoney - _quantity;
				_remainStone = {
					userMoney:_stoneArr.userMoney + _expend,
					presentedMoney:0,
					totalMoney:_stoneArr.totalMoney - _quantity,
				};
			}else{ //石が足りない場合
				_remainStone = {
					userMoney:0,
					presentedMoney:0,
					totalMoney:_stoneArr.totalMoney - _quantity, //totalMoneyがマイナスになる
				};
			};
		};
		return _remainStone;
	};

	// -------------------------------------------------------------------------.
	// スクロールバー表示用
	// -------------------------------------------------------------------------.
	common.scrollBarDisp = function(selector){
		if(common.ua.ios){
			require(['js/libs/iscroll5'],function() {

				if(!common.myScroll){
					//iScrollセット用
					common.myScroll = [];
					common.setScrollArray = [];
				}

				if(Array.isArray(selector)){
					for(var keys in selector){
						if(common.setScrollArray.indexOf(selector[keys]) === -1){
							common.myScroll[common.myScroll.length] =  new IScroll(selector[keys], {
								mouseWheel: true,
								scrollbars: true,
								fadeScrollbars: true
							});
							common.setScrollArray[common.setScrollArray.length] = selector[keys];
						}
					}
				}else{
					if(common.setScrollArray.indexOf(selector) === -1){
						common.myScroll[common.myScroll.length] = new IScroll(selector, {
							mouseWheel: true,
							scrollbars: true,
							fadeScrollbars: true
						});

						common.setScrollArray[common.setScrollArray.length] = selector;
					}
				}
			});
		}else{
			var scrollWrap = common.doc.getElementsByClassName("scrollBar");
			for(var i = 0,leng = scrollWrap.length;i<leng;i++){
				scrollWrap[i].style = "overflow-y:scroll;height:100%;";
			}
		}
	};

	common.scrollBarControl = function(action,scroll){
		if(!common.ua.ios || !common.myScroll) return;

		if(Array.isArray(common.myScroll)){
			for(var i = 0,leng = common.myScroll.length;i<leng;i++){
				if(action == "refresh"){
					common.myScroll[i].refresh();
					if(scroll) common.myScroll[i].scrollTo(0,0);
				}
				if(action == "destroy") common.myScroll[i].destroy();
			}
		}else{
			if(action == "refresh"){
				common.myScroll.refresh();
				if(scroll) common.myScroll.scrollTo(0,0);
			}
			if(action == "destroy") common.myScroll.destroy();
		}

		if(action == "destroy"){
			common.myScroll = null;
			common.setScrollArray = null;
		}
	};

	// ---------------------------------------
	// 戻る関連
	// ---------------------------------------
	common.backLinkHandler = function(){
		// アンドロイド戻るキー制御
		common.androidKeyForceStop = true;
		// console.log(common.historyArr)

		//万が一マイページやトップページだった場合
		if(common.location === "MyPage" || common.location === "" || common.location === "#/TopPage") return;
		if(common.tutorialId && common.tutorialId !== 'TU520') return;

		// 連打防止(1秒)
		if(common.backlinkTimer){
			var progress = (new Date()).getTime() - common.backlinkTimer;
			if(progress < 1001){
				common.androidKeyForceStop = false;
				return;
			}else{
				common.backlinkTimer = (new Date()).getTime();
			}
		}else{
			common.backlinkTimer = (new Date()).getTime();
		}

		// backlinkボタンにイベント登録されてる時は解除するまで遷移させない
		if(common.eventBackHandler) return;

		// console.log("backLinkHandler run -> common.tutorialId:",common.tutorialId," common.location:",common.location)

		var historyFlag = true;
		var notPushArr = [ // historyListにpushしない
			"QuestBackground",
			"GachaResult",
			"MemoriaComposeResult",
			"MemoriaEquip",
			"MemoriaSetEquip",
			"EventTrainingCharaSelect"
		];

		var nowHash = location.hash;
		_.each(notPushArr, function(key,index) {
			// console.log("nowHash",nowHash.split('/')[1])
			if(nowHash.indexOf(key) !== -1) {
				historyFlag = false;
			}
		});

		var notBackFlg = false;
		var notBackArr = [ // BackLinkをさせない
			"QuestBackground",
			"QuestResult",
			"ArenaResult",
			"MyPage"
		];
		_.each(notBackArr, function(key,index) {
			if(nowHash.indexOf(key) > -1) {
				notBackFlg = true;
			}
		});
		if(notBackFlg){
			common.androidKeyForceStop = false;
			return;
		}

		var historyResetFlg = false;
		var historyResetArr = [
			"CharaListTop",
			"MemoriaTop",
			"GachaTop",
			"MissionTop",
			"ShopTop",
			"FormationTop",
			"MainQuest",
			"ArenaTop",
			"CollectionTop",
			"ItemListTop",
			"Help",
			"ConfigTop",
			"PresentList",
			"EventDungeonMap"
		];
		_.each(historyResetArr, function(key,index) {
			if(nowHash.indexOf(key) > -1 && nowHash.split('/')[1] == key) {
				historyResetFlg = true;
			}
		});

		// backlinkのときは早めにスクロールバーを破棄する
		common.scrollBarControl("destroy");
		if(historyResetFlg) {
			common.historyArr = [];
			location.href = "#/MyPage";
			return;
		}
		var urlplus = "";
		if(historyFlag){
			common.locationPrev = common.historyArr[common.historyArr.length-1];
			common.historyArr.splice(common.historyArr.length-1,1);

			var now = common.historyArr[common.historyArr.length-1];

			//遷移
			if(common.historyArr.length > 1){
				if(common.doc.getElementById("sideMenu")){
					common.doc.querySelector("#sideMenu").className     = "";
				}
				common.tapBlock(true);

				// ガチャトップ＞履歴遷移対策
				if(location.hash.indexOf("PresentHistory") === -1){
					location.href = "#/"+common.historyArr[common.historyArr.length-1];
				}else{
					if(common.historyArr[common.historyArr.length-1].indexOf("GachaTop") > -1){
						if(common.gachaDisp) urlplus = "/"+common.gachaDisp;
						location.href = "#/GachaTop"+urlplus;
					}else{
						location.href = "#/"+common.historyArr[common.historyArr.length-1];
					}
				}

			}else{
				location.href = "#/MyPage";
			}
		}else{
			if(common.historyArr[common.historyArr.length-1]){
				if(common.doc.getElementById("sideMenu")){
					common.doc.querySelector("#sideMenu").className     = "";
				}
				common.tapBlock(true);

				// ガチャリザルトの場合は前のガチャに戻す
				if(location.hash.indexOf("GachaResult") !== -1){
					if(common.gachaDisp) urlplus = "/"+common.gachaDisp;
					location.href = "#/GachaTop"+urlplus;
				} else {
					location.href = "#/"+common.historyArr[common.historyArr.length-1];
				}
			}else{
				location.href = "#/MyPage";
			}
		}
	};

	// -----------------------------------------
	//	global view
	// -----------------------------------------
	var globalInit = false;

	// if loading is incompleted
	common.setGlobalView = function(options){
		if(!globalInit){
			setTimeout(function(){
				common.setGlobalView(options);
			},100);
		}
	};
	require(['GlobalView'],function(GlobalView) {
		globalInit = true;

		// overRide
		common.setGlobalView = function(options){
			if(common.historyArr[common.historyArr.length-1] === "LoginBonus") return;

				if(!common.globalMenuView){
					common.globalMenuView = new GlobalView(options);
				}else{
					common.globalMenuView.trigger("optionSet",options);
				}

				// common.globalMenuView.addCampaignBanner();
				common.globalMenuView.addCampaignBadge();
				common.globalMenuView.addEventBadge();
				common.globalMenuView.addRegularEventBadge();
				common.globalMenuView.addPatrolBadge();//パトロール
				if(location.hash === "#/MyPage"){
					common.addClass(common.doc.getElementById("sideMenu"),"anim");
				}
		};
	});

	// -----------------------------------------
	//	HelpPopup
	// -----------------------------------------
	common.setHelpPopup = function(param,title,callBack){
		common.tapBlock(true);
		require(['HelpPopup'],function(HelpPopup) {
			common.tapBlock(false);
			common.helpPopup = new HelpPopup(param,title,callBack);
		});
	};

	// -----------------------------------------
	//	itemUtil
	//
	//　itemCode(string) ：アイテムID
	//	isNoFrame(bool) ：_fがファイル目に入るかフラグ
	//
	//	return　アイコン画像パス
	// -----------------------------------------
	common.getIconImgPath = function(itemCode,isNoFrame){
		var imgPath = "";
		switch (itemCode) {
			case "RICHE": // カースチップ
				imgPath = "icon_cursechip";
				break;
			default:      // その他のアイテム
				var _itemCode = itemCode;
				// イベントアイテム用判定
				if (_itemCode.indexOf("EVENT_") > -1) {
					imgPath += "event/";
					if (_itemCode.indexOf("GROUPBATTLE") > -1 && _itemCode.indexOf("_COIN") > -1) {
						_itemCode = "event_groupbattle_coin";
					}else if (_itemCode.indexOf("TRAINING") > -1 && _itemCode.split("_").length < 4) {
						_itemCode = "event_training_potion";
					}else if (_itemCode.indexOf("ARENARANKING_EXCHANGE") < 0 && _itemCode.indexOf("ARENARANKING") > -1) {
						_itemCode = "event_arenaranking_1013_exchange_1";
					}
				} else if (_itemCode.indexOf("CAMPAIGN_") > -1) {
					imgPath += "campaign/";
				} else if (_itemCode.indexOf("GACHA_FREEBIE_") > -1) {
					var itemCodeArr = _itemCode.split("_");
					if (isNaN(itemCodeArr[2])) {
						imgPath += "gacha/";
						itemCodeArr.pop();
						_itemCode = itemCodeArr.join("_");
					}
					else {
						imgPath += "gacha_old/";
					}
				} else if (_itemCode.indexOf("SELECTABLE_MEMORIA_TICKET_") > -1) { //メモリア交換チケットの時
					var itemCodeArr = _itemCode.split("_");
					if (isNaN(itemCodeArr[3])) {
						imgPath += "gacha/";
						itemCodeArr.pop();
						_itemCode = itemCodeArr.join("_");
					}
				}
				imgPath += "icon_" + _itemCode.toLowerCase();
				break;
			}

		if (isNoFrame) {
			imgPath += ".png";
		}
		else {
			imgPath += "_f.png";
		}
		imgPath = "/magica/resource/image_web/common/icon/" + imgPath;

		return imgPath;
	};

	common.getRewardImgModel = function(rewardCode){
		var rewardModel = {};
		var rewardCodeArr = rewardCode.split("_");
		switch (rewardCodeArr[0]) {
			case "RICHE":
				rewardModel.imagePath = "main/riche";
				rewardModel.quantity = rewardCodeArr[rewardCodeArr.length-1];
				break;
			case "PIECE":
			case "MAXPIECE":
				rewardModel.quantity = rewardCodeArr[rewardCodeArr.length-1];
				rewardModel.nativeimgkey = "piece_" + rewardCodeArr[1];
				rewardModel.imagePath = "memoria/memoria_" + rewardCodeArr[1] + "_s";
				break;
			case "TITLE":
				rewardModel.quantity = rewardCodeArr[rewardCodeArr.length-1];
				rewardModel.imagePath = "main/title";
				break;
			case "GIFT":
				rewardModel.quantity = rewardCodeArr[rewardCodeArr.length-1];
				rewardModel.nativeimgkey = "gift_" + rewardCodeArr[1];
				rewardModel.imagePath = "gift/item_gift_" + rewardCodeArr[1];
				break;
			default:
				rewardModel.quantity = rewardCodeArr[rewardCodeArr.length-1];
				rewardCodeArr.shift();
				rewardCodeArr.pop();
				rewardModel.imagePath = ((rewardCodeArr.indexOf('EVENT_') > -1)? 'event':'main') + '/' + rewardCodeArr.join('_').toLowerCase();
			}
		return rewardModel;
	};

	// -----------------------------------------
	//	itemUtil
	//
	//	return
	//	key "itemCode"
	//	key "quantity"
	// -----------------------------------------
	common.itemSet = function(itemCode){

		if(itemCode == "MISS") return;
		//アイテムコードと数に分離する
		var itemType;
		var resultValue = {};
		var searchKeyArr = [
			"RICHE_",          // CC
			"CARD_",           // 魔法少女
			"PIECE_",          // メモリア
			"MAXPIECE_",       // メモリア（最大強化済み)
			"GIFT_",           // ギフト
			"EVENTITEM_",      // イベントアイテム
			"GACHAEVENTITEM_", // ガチャイベ用
			"GEM_",            // デスティニージェム
			"LIVE2D_",         // Live2d  個数なし
			"DOPPEL_",         // ドッペル 個数なし
			"FORMATIONSHEET_", // 魔法陣形 個数なし
			"EVENTEFFECT_",     // 特攻メモリアでアイテム増えた時に来る
			"ITEM_", // アイテム アイテム判定は最後にしておく
		];

		// console.log("itemCode",itemCode)

		_.each(searchKeyArr,function(key) {
			if(itemCode.indexOf(key) !== -1) {
				itemType = key.split("_")[0];
			}
		});

		var _itemCode = itemCode.split("_");
		var code;
		// console.log("itemType",itemType);
		switch(itemType) {
			case "RICHE" :
				resultValue.itemCode   = "riche";
				resultValue.quantity   = Number(_itemCode[_itemCode.length - 1]);
				resultValue.chestColor = "BRONZE";
				resultValue.rewardType = "RICHE";
				break;

			case "ITEM":
				code = "";
				resultValue.quantity = Number(_itemCode[_itemCode.length - 1]);

				_itemCode.shift();
				_itemCode.pop();
				_.each(_itemCode,function(key,index) {
					if(index !== 0) {
						key = "_" + key;
					}
					code += key;
				});
				resultValue.itemCode = code;

				var itemModel = common.storage.itemList.findWhere({"itemCode":code});

				var tcc = (itemModel) ? itemModel.toJSON().treasureChestColor : "BRONZE"
				if(tcc == "GOLD" || tcc == "SILVER" || tcc == "BRONZE") {
					resultValue.chestColor = tcc;
				} else if(tcc == "ADDED_DROP") {
					resultValue.chestColor = "ADDED_DROP";
				}

				resultValue.rewardType = "ITEM";

				break;

			case "GIFT":
				code = "";
				resultValue.quantity = Number(_itemCode[_itemCode.length - 1]);

				_itemCode.pop();
				_.each(_itemCode,function(key,index) {
					if(index !== 0) {
						key = "_" + key;
					}
					code += key;
				});
				resultValue.itemCode = "item_" + code.toLowerCase();
				var giftId = code.split("_")[1] | 0;
				var giftModel = common.storage.giftList.findWhere({"id":giftId});
				resultValue.chestColor = (giftModel) ? rankColor(giftModel.toJSON().rank) : "BRONZE";
				resultValue.giftModel = giftModel.toJSON();
				resultValue.rewardType = "GIFT";

				break;

			case "LIVE2D":
				_itemCode.pop();
				_itemCode.shift();
				resultValue.itemCode   =  _itemCode[0];
				resultValue.chestColor = "GOLD";
				resultValue.rewardType = "LIVE2D";

				break;

			case "DOPPEL":
				_itemCode.shift();
				resultValue.itemCode   = _itemCode[0];
				resultValue.chestColor = "GOLD";
				resultValue.rewardType = "DOPPEL";

				break;

			case "PIECE":
			case "MAXPIECE":
				// 念のため複数枚の場合
				if(Number(_itemCode[_itemCode.length - 1]) > 1){
					resultValue.quantity = Number(_itemCode[_itemCode.length - 1]);
				}

				_itemCode.pop();
				_itemCode.shift();
				resultValue.itemCode   = "memoria_" + _itemCode[0] + "_s";

				var pieceId = _itemCode[0] | 0;
				// console.log(common.storage.pieceList.toJSON())
				var pieceModel = common.storage.pieceList.findWhere({"pieceId":pieceId});
				resultValue.piece = pieceModel.attributes;//itemImageParsView用
				resultValue.chestColor = (pieceModel) ? rankColor(pieceModel.toJSON().rank) : "BRONZE";
				resultValue.rewardType = "PIECE";

				break;

			case "GEM":
				_itemCode.pop();
				_itemCode.shift();
				resultValue.itemCode   = "chara_" + _itemCode[0] + "_h";
				resultValue.chestColor = "GOLD";
				resultValue.rewardType = "GEM";

				break;

			case "EVENTEFFECT":
				_itemCode.pop();
				_itemCode.shift();
				_itemCode.shift();
				resultValue.effectItemCode = _itemCode.join("_");
				resultValue.rewardType = "EVENTEFFECT";

				break;

			case "CARD":
				var cardId    = _itemCode[1];
				var cardModel = common.storage.userCardList.findWhere({
					"cardId": Number(cardId)
				});
				resultValue.cardModel = cardModel.toJSON();
				//キャラ情報も取得しておく
				var charaModel;
				if(resultValue.cardModel){
					charaModel = common.storage.userCharaList.findWhere({
						charaId: Number(resultValue.cardModel.card.charaNo),
					});
				};
				resultValue.charaModel = charaModel.toJSON();
				resultValue.rewardType = "CARD";

				break;

			case "FORMATIONSHEET":
			case "EVENTITEM":
			case "GACHAEVENTITEM":
				break;
		}

		function rankColor(rank) {
			var _rank;
			if(String(rank).indexOf("RANK_") !== -1) {
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

		// console.log("common.itemSet:resultValue:",resultValue);

		return resultValue;
	};

	//ボックスガチャ用アイテム情報整形
	common.getRewardInfoForBogetGacha = function(_args){
		var _rewardInfo = _args.rewardInfo;
		//1つ目のkeyがタイプを表すという想定
		var _type;
		var _isGet = false;
		_.each(_rewardInfo, function(_val, _index, _list){
			if(!_isGet){
				_type = _index;
				_isGet = true;
			};
		});
		var _info = {};
		if(_type == 'gift'){
			var __gift = _rewardInfo.gift;
			_info.itemCode = 'item_'+__gift.id;
			_info.chestColor = common.getItemRankColor(__gift.rank);
			_info.giftModel = __gift;
			_info.rewardType = "GIFT";

		}else if(_type == 'item'){
			var __item = _rewardInfo.item;
			_info.itemCode = __item.itemCode;
			_info.chestColor = __item.treasureChestColor;
			_info.rewardType = "ITEM";
		
		}else if(_type == 'richeNum'){
			_info.itemCode   = "riche";
			_info.quantity   = _rewardInfo.richeNum;
			_info.chestColor = "BRONZE";
			_info.rewardType = "RICHE";
			
		};
		//個数はCC以外共通
		if(_type != 'richeNum'){
			_info.quantity = _rewardInfo.num;
		};
		return _info;
	};

	common.getItemRankColor = function(rank){
		var _rank;
		if(String(rank).indexOf("RANK_") !== -1) {
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
	};

	// -------------------------------------------
	// getApRemainTime
	//
	// return : AP回復までの秒数
	// -------------------------------------------
	common.getApRemainTime = function(apModelJson,maxApModelJson,currentTime){
		var remainPoint = maxApModelJson.point - apModelJson.point;
		if(remainPoint <= 0){
			return 0;
		}
		var sec = ((apModelJson.checkPeriod * remainPoint * 60) + (Date.parse(apModelJson.checkedAt) / 1000)) - (Date.parse(currentTime) / 1000);
		return sec;
	};

	// -------------------------------------------
	// scroll
	// common.scrollSet(親DOMのID,スクロールさせたいDOMのクラス)
	// 親DOM:高さの指定必須・overflow:hidden必須
	// 子DOM:overflowなどを指定しない・height:auto必須(念のためmin-height:100%もあるといい感じ)・will-change:transform;を付けると滑らか
	// -------------------------------------------
	common.scrollSet = function(ids,innerClass){
		//--------------------------------------------------------------------------
		// スクロール保存用変数の設定
		// common.scrollArr[ids+innerClass](以下array)に各情報を保存
		// array.targetId   = スクロールの親DOMのID
		// array.innerClass = スクロールさせたいDOMのclass
		// array.touchStartNum = 現在のスクロール位置
		// array.touchscrollCount = 上下へのスクロール量計算用
		// array.domHeight = 外的要素の高さ
		// array.limit = 上方向へのスクロール上限値
		// array.scrollBarHeight = スクロールバーの高さ
		// array.scrollbarPositionBase = スクロールバーの位置情報
		// array.touchScrollBarPosition = スクロールバーのタッチ開始位置
		//--------------------------------------------------------------------------

		// 対象DOMがないときはなにもしない
		if(!common.doc.getElementById(ids)) return;
		// 遅延+AndroidBack対策
		if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

		var thisPage = common.location;
		if(!common.scrollArr){
			common.scrollArr = {};
		}
		if(!common.scrollArr[ids+innerClass+thisPage]){
			common.scrollArr[ids+innerClass+thisPage] = {};
		}
		common.scrollArr[ids+innerClass+thisPage].targetId = ids;
		common.scrollArr[ids+innerClass+thisPage].innerClass = innerClass;
		common.scrollArr[ids+innerClass+thisPage].thisPage = thisPage;
		common.scrollArr[ids+innerClass+thisPage].scrollbarPositionBase = 0;
		common.scrollArr[ids+innerClass+thisPage].touchScrollBarPosition = 0;
		common.scrollArr[ids+innerClass+thisPage].stopVelocity = false;

		// iOSとandroidで滑らかに動くものへの切り分け
		var exceptionHash = ["MemoriaList","PieceArchive","RegularEventGroupBattleTop"];
		var rAF;
		var rAFStop;
		var step;
		var intervalFunc = false;
		if(common.ua.ios || exceptionHash.indexOf(common.location) < 0){
			rAF   = window.requestAnimationFrame        ||
					window.webkitRequestAnimationFrame  ||
					window.mozRequestAnimationFrame     ||
					window.oRequestAnimationFrame       ||
					window.msRequestAnimationFrame      ||
					function (callback){ intervalFunc = window.setInterval(callback, 17);};
			rAFStop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function(callback){ window.clearInterval(intervalFunc);intervalFunc = false;};
		// }else{
		// 	rAF = function(callback){ intervalFunc = window.setInterval(callback, 17);};
		// 	rAFStop = function(callback){ window.clearInterval(intervalFunc);intervalFunc = false;};
		}
		// 各初期値のセット
		common.scrollArr[ids+innerClass+thisPage].touchStartNum = 0;
		common.scrollArr[ids+innerClass+thisPage].scrollCount = 0;
		var startNum = 0;// タップしたときの位置
		var velocity = 0;// 慣性計算用
		var targetPos = 0;
		var touchEndTime = null;
		var velocityInterval;

		// スクロールする親DOM
		var scrollDom = common.doc.getElementById(ids);
		common.scrollArr[ids+innerClass+thisPage].domHeight = scrollDom.offsetHeight;

		// 実際にスクロールするDOM
		var scrollDomInner = common.doc.getElementById(ids).getElementsByClassName(innerClass)[0];
		common.scrollArr[ids+innerClass+thisPage].limit = scrollDomInner.offsetHeight;

		// フリップ動作用 画面高さ取得
		var displayHeight = common.doc.getElementsByTagName("body")[0].offsetHeight;

		// スクロールするDOMにセットされてるstyleSheetを保存する
		var alreadySetStyle = (scrollDomInner.style.cssText) ? scrollDomInner.style.cssText : "";
		common.scrollArr[ids+innerClass+thisPage].defaultCss = alreadySetStyle;

		// スクロール中か判断するフラグ
		var scrollFlg = false;

		// スクロールバー作る
		if(common.doc.getElementById(ids).getElementsByClassName("scrollIndicator").length < 1){
			var scrollElement = common.doc.createElement("div");
			var scrollInner   = common.doc.createElement("div");
			scrollElement.className = "scrollIndicator";
			scrollInner.className   = "scrollIndicatorInner";
			common.doc.getElementById(ids).appendChild(scrollElement);
			common.doc.getElementById(ids).getElementsByClassName("scrollIndicator")[0].appendChild(scrollInner);
		}
		// 万が一のために 親DOMのpositionがなにも設定されていなかった場合は強制的にrelativeを付ける
		if(window.getComputedStyle(common.doc.getElementById(ids)).position === "static"){
			common.doc.getElementById(ids).style.position = "relative";
		}
		if(window.getComputedStyle(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0]).position === "static"){
			common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].style.position = "relative";
		}
		var scrollBar = common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0];
		common.scrollArr[ids+innerClass+thisPage].scrollBarHeight = Math.round(common.scrollArr[ids+innerClass+thisPage].domHeight * common.scrollArr[ids+innerClass+thisPage].domHeight / common.scrollArr[ids+innerClass+thisPage].limit);
		scrollBar.style.height = common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + "px";

		//-------------------------------------------------
		// 実際に要素をスクロールさせるためのファンクション群
		// iOSはtranslateYでスクロールさせた方がスムーズ
		// Androidはtranslate3dでスクロールさせた方がスムーズ
		//-------------------------------------------------
		var isIOS = (common.ua.ios) ? true : false;
		var translateControler = function(num){
			// androidとiosで切り分け
			// スクロールバーも動かす
			// num = Math.round(num * 100) / 100;
			if(isIOS){
				scrollBarControlerIOS(num);
				return "-webkit-transform:translateY("+num+"px) translateZ(0);";
			}else{
				scrollBarControlerAndroid(num);
				return "-webkit-transform:translate3d(0,"+num+"px,0);";
			}
		};
		var scrollBarControlerIOS = function(num){
			// androidとiosで切り分け
			common.scrollArr[ids+innerClass+thisPage].scrollbarPositionBase = num;
			var scrollPosition = Math.round(-common.scrollArr[ids+innerClass+thisPage].domHeight * (num / (common.scrollArr[ids+innerClass+thisPage].limit)));
			scrollBar.style.cssText = "height:" + common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + "px;-webkit-transform:translateY("+scrollPosition+"px) translateZ(0);";
		};
		var scrollBarControlerAndroid = function(num){
			// androidとiosで切り分け
			common.scrollArr[ids+innerClass+thisPage].scrollbarPositionBase = num;
			var scrollPosition = Math.round(-common.scrollArr[ids+innerClass+thisPage].domHeight * (num / (common.scrollArr[ids+innerClass+thisPage].limit)));
			scrollBar.style.cssText = "height:" + common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + "px;-webkit-transform:translate3d(0,"+scrollPosition+"px,0);";
		};

		//------------------------------------------------
		// 慣性スクロールの計算式
		//------------------------------------------------
		var canScrollLength;
		var maxPosition;
		var scrollTimeset = function(){
			if(scrollFlg ||
			   !scrolling ||
			   !scrollDomInner ||
			   !common.doc.getElementById(ids) ||
			   !common.scrollArr ||
			   !common.scrollArr[ids+innerClass+thisPage] ||
			   common.scrollArr[ids+innerClass+thisPage].thisPage !== common.location ||
			   common.forceScrollFlag ||
			   common.scrollArr[ids+innerClass+thisPage].stopVelocity){
			   if (rAFStop) rAFStop(step);
				return;
			}
			// 遅延+AndroidBack対策
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

			var spanTime   = new Date().getTime() - touchEndTime;
			common.scrollArr[ids+innerClass+thisPage].touchStartNum = common.scrollArr[ids+innerClass+thisPage].scrollCount;
			common.scrollArr[ids+innerClass+thisPage].scrollCount = (common.scrollArr[ids+innerClass+thisPage].scrollCount + velocity) | 0;

			// 減衰値をかけて慣性を弱める(数字が大きいほど減衰率低め)
			// スクロールは最大1.7秒で完了させる
			var activeMagni = (1700 - spanTime) / 1700;
			velocity = ((velocity * activeMagni * 100) | 0) / 100;

			// 上端でも下端でもない場合
			if(common.scrollArr[ids+innerClass+thisPage].scrollCount < 0 && (-common.scrollArr[ids+innerClass+thisPage].scrollCount < canScrollLength)){
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].scrollCount);

			// スクロールの上端に届いた場合
			}else if(common.scrollArr[ids+innerClass+thisPage].scrollCount >= 0){
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(0);
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = 0;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				if (rAFStop) rAFStop(step);
				return;

			// スクロールの下端に届いた場合
			}else if(-common.scrollArr[ids+innerClass+thisPage].scrollCount >= canScrollLength){
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = maxPosition;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				if (rAFStop) rAFStop(step);
				return;
			}

			// refreshのタイミング次第があるので２度判定
			if(scrollFlg || !scrollDomInner || !common.doc.getElementById(ids) || !common.scrollArr[ids+innerClass+thisPage]){
				if (rAFStop) rAFStop(step);
				return;
			}

			// 1700ミリ秒以内は繰り返す
			var absVelocity = (velocity < 0) ? -velocity : velocity;
			if(spanTime < 1700 && absVelocity > 0){
				if(intervalFunc) return;
				if (rAF) step = rAF(scrollTimeset);
			}else{
				// スクロールバーをフェードアウトさせる
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				if (rAFStop) rAFStop(step);
			}
		};

		//------------------------------------------------
		// タッチ開始時の処理
		//------------------------------------------------
		var canMoveFlg = false;
		var popCheckFlg = false;
		var scrolling = false;
		var touchStartTime = null;
		var touchStartHandler = function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				if (rAFStop) rAFStop(step);
				return;
			}

			// 各種フラグの初期化
			canMoveFlg     = false;
			touchStartTime = null;
			scrollFlg      = true;
			scrolling      = false;
			popCheckFlg    = false;

			if(step && rAFStop){
				rAFStop(step);
			}

			// タップの開始位置を保存する
			startNum = e.changedTouches[0].clientY;

			// 慣性を0にする（慣性スクロール中に触った場合の処理)
			velocity = 0;

			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)||
			   common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;
			var thisPage = common.location;
			if(!common.scrollArr[ids+innerClass+thisPage] || common.location !== common.scrollArr[ids+innerClass+thisPage].thisPage) return;

			// スクロール用クラス
			common.addClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");

			// 慣性制御用クラス
			common.scrollArr[ids+innerClass+thisPage].stopVelocity = false;

			// スクロール可能距離の再計算
			canScrollLength = common.scrollArr[ids+innerClass+thisPage].limit - common.scrollArr[ids+innerClass+thisPage].domHeight;
			maxPosition     = -common.scrollArr[ids+innerClass+thisPage].limit + common.scrollArr[ids+innerClass+thisPage].domHeight;

			// ここまできてスクロール可能とする
			touchStartTime = new Date().getTime();
			canMoveFlg = true;
		};

		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchstart", touchStartHandler,true);
		// $("#"+ids+" ."+innerClass).on("touchstart",touchStartHandler);

		//-----------------------------------------------------
		// スワイプ中のイベント
		//-----------------------------------------------------
		var beforeTiming = null;
		var beforeScroll = 0;
		var touchMoveHandler = function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			// 遷移中なども発火しないように(基本アンドロイドキーが読み込みなどで効かない時はスクロールさせない)
			// 遅延+AndroidBack対策
			if(common.isDoubleTouch() ||
			   common.androidKeyForceStop ||
			   !canMoveFlg ||
			   !common.doc.getElementById(ids) ||
			   common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1){
			   	if (rAFStop) rAFStop(step);
				return;
			}


			// メモリアポップアップがある場合
			if(!popCheckFlg && common.detailPopup){
				popCheckFlg = true;
				if(common.doc.querySelectorAll("#memoriaDetailWrap #"+ids).length < 1){
					canMoveFlg = false;
				}
			}

			// スクロールバーを表示する

			// 計算用
			var nowScroll = common.scrollArr[ids+innerClass+thisPage].touchStartNum + (e.changedTouches[0].clientY - startNum);
			if(!scrolling){
				var absScroll = nowScroll < 0 ?  -nowScroll : nowScroll;
				if(absScroll < 10) return;
				common.addClass(scrollBar,"onScroll");
				scrolling = true;
			}

			e.preventDefault();

			// 加速度の保存
			beforeTiming = new Date().getTime();
			beforeScroll = nowScroll < 0 ?  -nowScroll : nowScroll;
			velocity = -((common.scrollArr[ids+innerClass+thisPage].scrollCount - nowScroll)) | 0;

			// スクロール量の保存
			common.scrollArr[ids+innerClass+thisPage].scrollCount = nowScroll | 0;

			// スクロール後位置によって処理が変わる
			if(common.scrollArr[ids+innerClass+thisPage].scrollCount < 0 && -common.scrollArr[ids+innerClass+thisPage].scrollCount < canScrollLength)
				// スクロール量だけスクロールさせる
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].scrollCount);
			if(common.scrollArr[ids+innerClass+thisPage].scrollCount >= 0){
				// 上端にくっついていた場合
				common.scrollArr[ids+innerClass+thisPage].scrollCount = 0;
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = 0;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(0);
				return;

			}else if(-common.scrollArr[ids+innerClass+thisPage].scrollCount >= canScrollLength){
				// 下端にくっついていた場合
				common.scrollArr[ids+innerClass+thisPage].scrollCount = maxPosition;
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = maxPosition;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].touchStartNum);
				return;
			}
		};
		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchmove", touchMoveHandler,true);
		// $("#"+ids+" ."+innerClass).on("touchmove",touchMoveHandler);

		//-------------------------------------------------------
		// タッチ終了時のイベント
		//-------------------------------------------------------
		var touchEndHandler = function(e){
			scrollFlg = false;
			if(!canMoveFlg){
				if (rAFStop) rAFStop(step);
				return;
			}
			canMoveFlg = false;
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				if (rAFStop) rAFStop(step);
				return;
			}
			// リンク後発火しないように
			if(!scrollDom ||
			   !scrollDomInner ||
			   !common.doc.getElementById(ids) ||
			   common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1 ||
			   !common.scrollArr[ids+innerClass+thisPage]||
			   common.scrollArr[ids+innerClass+thisPage].thisPage !== common.location){
			   	if (rAFStop) rAFStop(step);
				return;
			}

			if(common.scrollArr[ids+innerClass+thisPage].scrollCount < 0 && -common.scrollArr[ids+innerClass+thisPage].scrollCount < canScrollLength){
				// スクロールを話したタイミングの位置をスクロール位置に保存
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = common.scrollArr[ids+innerClass+thisPage].scrollCount;

				// 慣性保存タイミング
				var nowTiming = new Date().getTime();
				if(!beforeTiming || (nowTiming - beforeTiming) > 200){

					// 最終操作から200msを超えていた場合は慣性は０とする
					velocity = 0;

				}else if(beforeTiming && nowTiming - touchStartTime < 200){

					// 要素の大きさに応じて最大化速度を決定する
					// スワイプの時もここに入るので、最大化速度以上の加速度は出ない。
					// 基礎値:最大スクロール量*(親DOMの大きさ[表示される領域の高さ] / 最大スクロール量);
					// これより小さい場合はその加速度を仕様する
					var baseVal = common.scrollArr[ids+innerClass+thisPage].limit * (common.scrollArr[ids+innerClass+thisPage].domHeight / common.scrollArr[ids+innerClass+thisPage].limit);
					var factor1 = (e.changedTouches[0].clientY - startNum) < 0 ? -(e.changedTouches[0].clientY - startNum) : e.changedTouches[0].clientY - startNum;
					var factor2 = baseVal < 0 ? -baseVal : baseVal;
						baseVal = (factor1 > factor2) ?
								  (e.changedTouches[0].clientY - startNum > 0) ? baseVal : -baseVal :
									e.changedTouches[0].clientY - startNum;
					// 4で割ったくらいがちょうどいい
					velocity = (baseVal) / 4 | 0;
				}

				// 加速度チェック
				// 加速度が1より大きい場合は慣性スクロールを動かす
				var velocityAbs = velocity < 0 ? -velocity : velocity;
				if(velocityAbs > 1){
					touchEndTime = new Date().getTime();
					if (rAF) step = rAF(scrollTimeset);
				}else{
					common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
					common.removeClass(scrollBar,"onScroll");
				}
			// 上端にくっついていた場合
			}else if(common.scrollArr[ids+innerClass+thisPage].scrollCount >= 0){
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = 0;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
			// 下端にくっついていた場合
			}else if(-common.scrollArr[ids+innerClass+thisPage].scrollCount >= canScrollLength){
				common.scrollArr[ids+innerClass+thisPage].touchStartNum = maxPosition;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
			// 上端にくっついていた場合
			}
		};
		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchend", touchEndHandler,true);
		// $("#"+ids+" ."+innerClass).on("touchend",touchEndHandler);

		//----------------------------------------------------------
		// スクロールバーのタッチイベント
		//----------------------------------------------------------
		var barTouchStartHandler = function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				return;
			}
			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)) return;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

			//慣性は0に
			velocity = 0;
			if(common.scrollArr[ids+innerClass+thisPage].limit - common.scrollArr[ids+innerClass+thisPage].domHeight < 1) return;
			common.addClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
 			common.scrollArr[ids+innerClass+thisPage].touchScrollBarPosition	= e.changedTouches[0].clientY;
 			common.scrollArr[ids+innerClass+thisPage].touchScrollBarStartPosition = common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0].getBoundingClientRect().top - common.doc.getElementById(ids).getBoundingClientRect().top;

 			common.addClass(scrollBar,"onScroll");
		};
		common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0].addEventListener("touchstart", barTouchStartHandler);
		// $("#"+ids+" .scrollIndicatorInner").on("touchend",barTouchStartHandler);

		var barTouchMoveHandler = function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				return;
			}
			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)) return;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

			if(common.scrollArr[ids+innerClass+thisPage].limit - common.scrollArr[ids+innerClass+thisPage].domHeight < 1) return;

			e.preventDefault();
			var indecator = common.scrollArr[ids+innerClass+thisPage].domHeight;
			var val = -common.scrollArr[ids+innerClass+thisPage].touchScrollBarStartPosition - (e.changedTouches[0].clientY - common.scrollArr[ids+innerClass+thisPage].touchScrollBarPosition);

			if(indecator <= common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + (-1 * val)){
				common.scrollArr[ids+innerClass+thisPage].scrollCount = -1*(common.scrollArr[ids+innerClass+thisPage].limit - common.scrollArr[ids+innerClass+thisPage].domHeight);
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].scrollCount);

				return;
			}else if(val >= 0){
				common.scrollArr[ids+innerClass+thisPage].scrollCount = 0;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].scrollCount);

				return;
			}
			var pers = val / (indecator - common.scrollArr[ids+innerClass+thisPage].scrollBarHeight);
			common.scrollArr[ids+innerClass+thisPage].scrollCount = Math.round((common.scrollArr[ids+innerClass+thisPage].limit - common.scrollArr[ids+innerClass+thisPage].domHeight) * pers);
			scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArr[ids+innerClass+thisPage].scrollCount);

		};
		common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0].addEventListener("touchmove",barTouchMoveHandler);

		var barTouchEndHandler = function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				return;
			}
			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)) return;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

 			common.removeClass(scrollBar,"onScroll");
 			common.scrollArr[ids+innerClass+thisPage].touchStartNum = common.scrollArr[ids+innerClass+thisPage].scrollCount;
 			common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
		};
		common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0].addEventListener("touchend", barTouchEndHandler);
	};
	common.lastScrollCountX = 0; //前回のスクロール量
	common.scrollSetX = function(ids,innerClass){
		//-----------------------------------------------
		// 横スクロール用
		// 基本的には縦スクロールとやってることはそこまで変わらないので割愛
		//-----------------------------------------------
		//--------------------------------------------------------------------------
		// スクロール保存用変数の設定
		// common.scrollArr[ids+innerClass](以下array)に各情報を保存
		// array.targetId   = スクロールの親DOMのID
		// array.innerClass = スクロールさせたいDOMのclass
		// array.touchStartNum = 現在のスクロール位置
		// array.touchscrollCount = 上下へのスクロール量計算用
		// array.limit = 上方向へのスクロール上限値
		// array.scrollBarHeight = スクロールバーの高さ
		// array.scrollbarPositionBase = スクロールバーの位置情報
		// array.touchScrollBarPosition = スクロールバーのタッチ開始位置
		// array.scrollArrX[ids+innerClass].lastDom = 横幅判定用の最終DOMを持つ
		//--------------------------------------------------------------------------

		if(!common.doc.getElementById(ids)) return;
		// 遅延+AndroidBack対策
		if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

		if(!common.scrollArrX){
			common.scrollArrX = {};
		}
		if(!common.scrollArrX[ids+innerClass]){
			common.scrollArrX[ids+innerClass] = {};
		}else{
			var notDestroy = [
				"CharaListTop",
				"CharaListCompose",
				"CharaListComposeMagia",
				"CharaListCustomize",
				"CharaListEquip"
			];

			// キャラ系では、キャラ一覧は再セットさせない
			if(notDestroy.indexOf(common.location) > -1 &&
			   common.doc.getElementById(common.scrollArrX[ids+innerClass].targetId) &&
			   common.scrollArrX[ids+innerClass].targetId === "charaListScrollWrap"){
				return;
			}
		}
		common.scrollArrX[ids+innerClass].targetId = ids;
		common.scrollArrX[ids+innerClass].innerClass = innerClass;
		common.scrollArrX[ids+innerClass].scrollbarPositionBase = 0;
		common.scrollArrX[ids+innerClass].thisPage = common.location;

		// iOSとandroidで滑らかに動くものへの切り分け
		var rAF;
		var rAFStop;
		var step;
		if(common.ua.ios){
			rAF   = window.requestAnimationFrame        ||
					window.webkitRequestAnimationFrame  ||
					window.mozRequestAnimationFrame     ||
					window.oRequestAnimationFrame       ||
					window.msRequestAnimationFrame      ||
					function (callback) { window.setTimeout(callback, 10); };
			rAFStop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function (callback) { window.setTimeout(callback); };
		}else{
			rAF = function(callback){window.setTimeout(callback, 10);};
			rAFStop = function(callback){window.clearTimeout(callback);};
		}

		common.scrollArrX[ids+innerClass].touchStartNum = 0;
		var startNum = 0;
		common.scrollArrX[ids+innerClass].scrollCount = 0;
		var velocity = 0;
		var velocityInterval;
		var scrollDom = common.doc.getElementById(ids);
		var scrollDomInner = common.doc.getElementById(ids).getElementsByClassName(innerClass)[0];

		common.scrollArrX[ids+innerClass].scrollDomWidth = scrollDom.offsetWidth;
		var calcFactor = scrollDomInner.childNodes;

		// order対応
		var leng = calcFactor.length;
		var targetDom = calcFactor[leng-1];
		var checkNum  = targetDom.offsetLeft;
		while(leng > 0){
			leng = (leng - 1) | 0;
			if(calcFactor[leng].offsetLeft > checkNum){
				targetDom = calcFactor[leng];
				checkNum  = targetDom.offsetLeft;
			}
		}
		common.scrollArrX[ids+innerClass].lastDom = targetDom;
		common.scrollArrX[ids+innerClass].lastDomOffLeft = checkNum;
		common.scrollArrX[ids+innerClass].limit = common.scrollArrX[ids+innerClass].lastDomOffLeft + targetDom.offsetWidth + 10;
		// console.log(common.scrollArrX[ids+innerClass].limit);
		var alreadySetStyle = (scrollDomInner.style.cssText) ? scrollDomInner.style.cssText : "";
		common.scrollArrX[ids+innerClass].defaultCss = alreadySetStyle;
		var scrollFlg = false;

		// スクロールバー作る
		var scrollElement = common.doc.createElement("div");
		var scrollInner   = common.doc.createElement("div");
		scrollElement.className = "scrollIndicatorX";
		scrollInner.className   = "scrollIndicatorInnerX";
		common.doc.getElementById(ids).appendChild(scrollElement);
		common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorX")[0].appendChild(scrollInner);
		if(window.getComputedStyle(common.doc.getElementById(ids)).position === "static"){
			common.doc.getElementById(ids).style.position = "relative";
		}
		var scrollBar = common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInnerX")[0];
		common.scrollArrX[ids+innerClass].scrollBarWidth = Math.round(common.scrollArrX[ids+innerClass].scrollDomWidth * common.scrollArrX[ids+innerClass].scrollDomWidth / common.scrollArrX[ids+innerClass].limit);
		scrollBar.style.width = common.scrollArrX[ids+innerClass].scrollBarWidth + "px";

		var translateControler = function(num){
			// androidとiosで切り分け
			// スクロールバーも動かす
			num = Math.round(num * 100) / 100;
			scrollBarControler(num);
			if(common.storage.user && common.ua.ios){
				return "-webkit-transform:translateX("+num+"px) translateZ(0);";
			}else{
				return "-webkit-transform:translate3d("+num+"px,0,0);";
			}
		};
		var scrollBarControler = function(num){
			// androidとiosで切り分け
			common.scrollArrX[ids+innerClass].scrollbarPositionBase = num;
			var scrollPosition = Math.round(-common.scrollArrX[ids+innerClass].scrollDomWidth * (num / (common.scrollArrX[ids+innerClass].limit)));
			if(common.ua.ios){
				scrollBar.style.cssText = "width:" + common.scrollArrX[ids+innerClass].scrollBarWidth + "px;-webkit-transform:translateX("+scrollPosition+"px) translateZ(0);";
			}else{
				scrollBar.style.cssText = "width:" + common.scrollArrX[ids+innerClass].scrollBarWidth + "px;-webkit-transform:translate3d("+scrollPosition+"px,0,0);";
			}
		};

		var scrollTimeset = function(){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				rAFStop(step);
				return;
			}
			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)){
				rAFStop(step);
				return;
			}
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1){
				rAFStop(step);
				return;
			}

			var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;
			if(!scrollDom || !scrollDomInner || checkVelocity < 0.1 || scrollFlg || !common.doc.getElementById(ids) || !common.scrollArrX[ids+innerClass] || common.scrollArrX[ids+innerClass].thisPage !== common.location){
				rAFStop(step);
				return;
			}
			common.scrollArrX[ids+innerClass].scrollCount = common.scrollArrX[ids+innerClass].scrollCount + velocity;
			if(common.scrollArrX[ids+innerClass].scrollCount >= 0){
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(0);
				common.scrollArrX[ids+innerClass].scrollCount = Math.round(common.scrollArrX[ids+innerClass].scrollCount);
				common.scrollArrX[ids+innerClass].touchStartNum = 0;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				return;
			}else if(-common.scrollArrX[ids+innerClass].scrollCount >= common.scrollArrX[ids+innerClass].limit - common.scrollArrX[ids+innerClass].scrollDomWidth){
				common.scrollArrX[ids+innerClass].scrollCount = Math.round(common.scrollArrX[ids+innerClass].scrollCount);
				common.scrollArrX[ids+innerClass].touchStartNum = -common.scrollArrX[ids+innerClass].limit + common.scrollArrX[ids+innerClass].scrollDomWidth;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArrX[ids+innerClass].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				return;
			}
			scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArrX[ids+innerClass].scrollCount);

			if(!scrollDom || !scrollDomInner || checkVelocity < 0.1 || scrollFlg || !common.doc.getElementById(ids) || !common.scrollArrX[ids+innerClass]){
				return;
			}

			velocity = velocity * 0.950;
			common.scrollArrX[ids+innerClass].touchStartNum = common.scrollArrX[ids+innerClass].scrollCount;
			if(checkVelocity > 0.6){
				step = rAF(scrollTimeset);
			}else{
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
			}
		};

		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchstart", function(e){
			scrollFlg = true;
			// 他のタッチスタートと干渉してる可能性あるので非同期化
			var thisPage = common.location;
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				rAFStop(step);
				return;
			}

			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)) return;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

			// order対応
			targetDom = common.scrollArrX[ids+innerClass].lastDom;

			velocity = 0;
			common.scrollArrX[ids+innerClass].scrollCount = Math.round(common.scrollArrX[ids+innerClass].scrollCount);

			// 要素の中身がスクロール幅より狭い時はなにもしない
			if(common.scrollArrX[ids+innerClass].scrollDomWidth > common.scrollArrX[ids+innerClass].limit) return;

			common.addClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");

			startNum = e.changedTouches[0].clientX;
		});
		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchmove", function(e){
			e.preventDefault();
			// 2本指だった場合エラーを起こしていたので防ぐ
			// 遷移中なども発火しないように(基本アンドロイドキーが読み込みなどで効かない時はスクロールさせない)
			if(common.isDoubleTouch() || common.androidKeyForceStop){
				rAFStop(step);
				return;
			}

			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)){
				rAFStop(step);
				return;
			}
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1){
				rAFStop(step);
				return;
			}

			if(!scrollBar.classList.contains("onScroll")){
				common.addClass(scrollBar,"onScroll");
			}

			// 要素の中身がスクロール幅より狭い時はなにもしない
			if(common.scrollArrX[ids+innerClass].scrollDomWidth > common.scrollArrX[ids+innerClass].limit){
				rAFStop(step);
				return;
			}

			velocity = -(common.scrollArrX[ids+innerClass].scrollCount - (common.scrollArrX[ids+innerClass].touchStartNum + (e.changedTouches[0].clientX - startNum)));
			common.scrollArrX[ids+innerClass].scrollCount = common.scrollArrX[ids+innerClass].touchStartNum + (e.changedTouches[0].clientX - startNum);
			if(common.scrollArrX[ids+innerClass].scrollCount > 0){
				if(scrollDomInner.style.cssText !== alreadySetStyle + translateControler(0)) scrollDomInner.style.cssText = alreadySetStyle + translateControler(0);
				common.scrollArrX[ids+innerClass].scrollCount = 0;
				// common.scrollArrX[ids+innerClass].touchStartNum = 0;
				return;
			}else if(-common.scrollArrX[ids+innerClass].scrollCount >= common.scrollArrX[ids+innerClass].limit - common.scrollArrX[ids+innerClass].scrollDomWidth){
				common.scrollArrX[ids+innerClass].scrollCount = -common.scrollArrX[ids+innerClass].limit + common.scrollArrX[ids+innerClass].scrollDomWidth;
				common.scrollArrX[ids+innerClass].touchStartNum = -common.scrollArrX[ids+innerClass].limit + common.scrollArrX[ids+innerClass].scrollDomWidth;
				scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArrX[ids+innerClass].touchStartNum);
				return;
			}
			scrollDomInner.style.cssText = alreadySetStyle + translateControler(common.scrollArrX[ids+innerClass].scrollCount);
		},true);
		common.doc.getElementById(ids).getElementsByClassName(innerClass)[0].addEventListener("touchend", function(e){
			// 2本指だった場合エラーを起こしていたので防ぐ
			if(common.isDoubleTouch()){
				rAFStop(step);
				return;
			}
			scrollFlg = false;
			if(!scrollDom || !scrollDomInner || !common.doc.getElementById(ids) || !common.scrollArrX[ids+innerClass] || common.scrollArrX[ids+innerClass].thisPage !== common.location){
				rAFStop(step);
				return;
			}

			// 遅延+AndroidBack対策
			if(!common.doc.getElementById(ids)) return;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return;

			if(common.scrollArrX[ids+innerClass].scrollCount >= 0){
				common.scrollArrX[ids+innerClass].touchStartNum = 0;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
			}else if(-common.scrollArrX[ids+innerClass].scrollCount >= common.scrollArrX[ids+innerClass].limit - common.scrollArrX[ids+innerClass].scrollDomWidth){
				common.scrollArrX[ids+innerClass].touchStartNum = -common.scrollArrX[ids+innerClass].limit + common.scrollArrX[ids+innerClass].scrollDomWidth;
				common.removeClass(scrollBar,"onScroll");
				common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
			}else{
				common.scrollArrX[ids+innerClass].touchStartNum = common.scrollArrX[ids+innerClass].scrollCount;
				var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;
				if(checkVelocity > 1){
					step = rAF(scrollTimeset);
				}else{
					common.removeClass(scrollBar,"onScroll");
					common.removeClass(common.doc.getElementById(ids).getElementsByClassName(innerClass)[0],"scrollWillChange");
				}
			}
			//キャラリストだったら保存しておく
			if(common.scrollArrX[ids+innerClass].targetId === "charaListScrollWrap"){
				common.lastScrollCountX = common.scrollArrX[ids+innerClass].scrollCount;
			};
		},true);
		// 外部からスクロールを制御できる関数を設定する
		common.scrollArrX[ids+innerClass].setScroll = function(_args){
			var _scrollCountX = 0;
			if(_args.scrollCountX){
				_scrollCountX = _args.scrollCountX;
			};
			scrollDomInner.style.cssText = alreadySetStyle + translateControler(_scrollCountX);
			common.scrollArrX[ids+innerClass].touchStartNum = _scrollCountX;
		};
	};

	// 要素の大きさが変わったときとかに叩く
	// ids,innerClass は scrollSetで使ったものを指定すると、そのスクロールだけリフレッシュさせる。
	// forceTopはtrueで強制的に最上部にスクロールさせる
	// afterHide：手動では設定しない ページの表示が終わった時のリフレッシュか判断
	common.scrollRefresh = function(ids,innerClass,forceTop,afterHide){
		if(!common.scrollArr && !common.scrollArrX) return;
		var translateControler = function(num){
			// androidとiosで切り分け
			if(common.storage.user && common.ua.ios){
				return "-webkit-transform:translateY("+num+"px);";
			}else{
				return "-webkit-transform:translate3d(0,"+num+"px,0);";
			}
		};
		var translateControlerX = function(num){
			// androidとiosで切り分け
			if(common.storage.user && common.ua.ios){
				return "-webkit-transform:translateX("+num+"px);";
			}else{
				return "-webkit-transform:translate3d("+num+"px,0,0);";
			}
		};

		var thisPage = common.location;
		var domChecks = function(){
			if(!common.doc.getElementById(ids)) return false;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return false;
			if(common.scrollArr[ids+innerClass+thisPage].thisPage !== common.location) return false;
			return true;
		};

		var domChecksX = function(){
			if(!common.doc.getElementById(ids)) return false;
			if(common.doc.getElementById(ids).getElementsByClassName(innerClass).length < 1) return false;
			return true;
		};
		var scrollDom;
		var classNames;
		var scrollDomInner;
		var scrollBar;
		var scrollPosition;
		var scrollDom2;
		var scrollDom2Inner;
		var scrollBar2;
		var scrollPosition2;
		var calcFactor;

		if(ids && innerClass){
			if(common.scrollArr && common.scrollArr[ids+innerClass+thisPage]){
				if(!domChecks()){
					delete common.scrollArr[ids+innerClass+thisPage];
				}else{
					common.scrollArr[ids+innerClass+thisPage].stopVelocity = true;
					scrollDom = common.doc.getElementById(ids);
					var domHeight1     = scrollDom.offsetHeight;

					common.scrollArr[ids+innerClass+thisPage].domHeight = domHeight1;

					scrollDomInner = common.doc.getElementById(ids).getElementsByClassName(common.scrollArr[ids+innerClass+thisPage].innerClass)[0];
					var domHeightInner = scrollDomInner.offsetHeight;
					common.scrollArr[ids+innerClass+thisPage].limit = domHeightInner;

					scrollBar = common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0];
					scrollPosition = (!forceTop) ? Math.round(-domHeight1 * (common.scrollArr[ids+innerClass+thisPage].scrollbarPositionBase / (domHeightInner))) : 0;
					common.scrollArr[ids+innerClass+thisPage].scrollBarHeight = Math.round(domHeight1 * domHeight1 / domHeightInner);


					if(domHeightInner <= domHeight1 || forceTop){
						classNames = scrollDomInner.style.cssText;
						scrollDomInner.style.cssText = classNames + translateControler(0);
						common.scrollArr[ids+innerClass+thisPage].scrollCount = 0;
						common.scrollArr[ids+innerClass+thisPage].touchStartNum = 0;
					}
					if(scrollPosition + common.scrollArr[ids+innerClass+thisPage].scrollBarHeight >= domHeight1 && !forceTop){
						classNames = scrollDomInner.style.cssText;
						scrollDomInner.style.cssText = classNames + translateControler(-1*(domHeightInner - domHeight1));
						common.scrollArr[ids+innerClass+thisPage].scrollCount = -1*(domHeightInner - domHeight1);
					}
					if(scrollBar){
						if(common.ua.ios){
							scrollBar.style.cssText = "height:" + common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + "px;-webkit-transform:translateY("+scrollPosition+"px);";
						}else{
							scrollBar.style.cssText = "height:" + common.scrollArr[ids+innerClass+thisPage].scrollBarHeight + "px;-webkit-transform:translate3d(0,"+scrollPosition+"px,0);";
						}
					}

					// ページ最初のリフレッシュで定義されていた場合
					if(afterHide && common.forceScrollArr && common.forceScrollArr[ids+innerClass]){
						var setVal1 = common.forceScrollArr[ids+innerClass].split(",");
						common.forceScroll(ids,innerClass,setVal1[0],setVal1[1]);
						common.forceScrollArr[ids+innerClass] = undefined;
					}
				}
			}else if(common.scrollArrX && common.scrollArrX[ids+innerClass]){
				if(!domChecksX()){
					delete common.scrollArrX[ids+innerClass];
				}else{
					scrollDom = common.doc.getElementById(ids);
					common.scrollArrX[ids+innerClass].scrollDomWidth = scrollDom.offsetWidth;

					scrollDomInner = common.doc.getElementById(ids).getElementsByClassName(common.scrollArrX[ids+innerClass].innerClass)[0];
					calcFactor = scrollDomInner.childNodes;

					// order対応(DOMの後ろから確認)
					var leng0 = calcFactor.length;
					var targetDom0 = calcFactor[leng0-1];
					var checkLeft = targetDom0.offsetLeft;
					while(leng0 > 0){
						leng0 = (leng0 - 1) | 0;
						if(calcFactor[leng0].offsetLeft > checkLeft){
							targetDom0 = calcFactor[leng0];
							checkLeft  = targetDom0.offsetLeft
						}
					}
					common.scrollArrX[ids+innerClass].lastDom = targetDom0;
					common.scrollArrX[ids+innerClass].lastDomOffLeft = checkLeft;
					common.scrollArrX[ids+innerClass].limit = common.scrollArrX[ids+innerClass].lastDomOffLeft + targetDom0.offsetWidth + 10;

					scrollBar = common.doc.getElementById(ids).getElementsByClassName("scrollIndicatorInner")[0];
					scrollPosition = (!forceTop) ? Math.round(-common.scrollArrX[ids+innerClass].scrollDomWidth * (common.scrollArrX[ids+innerClass].scrollbarPositionBase / (common.scrollArrX[ids+innerClass].limit))) : 0;
					common.scrollArrX[ids+innerClass].scrollBarWidth = Math.round(common.scrollArrX[ids+innerClass].scrollDomWidth * common.scrollArrX[ids+innerClass].scrollDomWidth / common.scrollArrX[ids+innerClass].limit);

					var oneTimeForceTop = false;
					if(common.scrollArrX[ids+innerClass].scrollDomWidth > (common.scrollArrX[ids+innerClass].lastDomOffLeft + targetDom0.offsetWidth)){
						oneTimeForceTop = true;
						scrollPosition = 0;
					}

					if(common.scrollArrX[ids+innerClass].scrollBarWidth > common.scrollArrX[ids+innerClass].scrollDomWidth){
						common.scrollArrX[ids+innerClass].scrollBarWidth = common.scrollArrX[ids+innerClass].scrollDomWidth;
					}

					if(common.scrollArrX[ids+innerClass].limit <= common.scrollArrX[ids+innerClass].scrollDomWidth || forceTop || oneTimeForceTop){
						classNames = scrollDomInner.style.cssText;
						scrollDomInner.style.cssText = classNames + translateControlerX(0);
						common.scrollArrX[ids+innerClass].scrollCount = 0;
						common.scrollArrX[ids+innerClass].touchStartNum = 0;
					}
					if(scrollPosition + common.scrollArrX[ids+innerClass].scrollBarWidth >= common.scrollArrX[ids+innerClass].scrollDomWidth && !forceTop){
						classNames = scrollDomInner.style.cssText;
						scrollDomInner.style.cssText = classNames + translateControlerX(-1*(common.scrollArrX[ids+innerClass].limit - common.scrollArrX[ids+innerClass].scrollDomWidth));
						common.scrollArrX[ids+innerClass].scrollCount = -1*(common.scrollArrX[ids+innerClass].limit - common.scrollArrX[ids+innerClass].scrollDomWidth);
					}
					if(scrollBar){
						if(common.ua.ios){
							scrollBar.style.cssText = "width:" + common.scrollArrX[ids+innerClass].scrollBarWidth + "px;-webkit-transform:translateX("+scrollPosition+"px);";
						}else{
							scrollBar.style.cssText = "width:" + common.scrollArrX[ids+innerClass].scrollBarWidth + "px;-webkit-transform:translate3d("+scrollPosition+"px,0,0);";
						}
					}

					// ページ最初のリフレッシュで定義されていた場合
					if(afterHide && common.forceScrollXArr && common.forceScrollXArr[ids+innerClass]){
						var setVal3 = common.forceScrollXArr[ids+innerClass].split(",");
						common.forceScrollX(ids,innerClass,setVal3[0],setVal3[1]);
						common.forceScrollXArr[ids+innerClass] = undefined;
					}
				}
			}
		}else{
			var key;
			for(key in common.scrollArr){
				if(common.scrollArr[key].thisPage !== common.location){
					// 存在しなかったら削除する
					delete common.scrollArr[key];
				}else{
					scrollDom2 = common.doc.getElementById(common.scrollArr[key].targetId);
					if(!scrollDom2 || scrollDom2.getElementsByClassName(common.scrollArr[key].innerClass).length < 1){
						// 存在しなかったら削除する
						delete common.scrollArr[key];
					}else{
						common.scrollArr[key].stopVelocity = true;

						var scrollDom2Height = scrollDom2.offsetHeight;
						common.scrollArr[key].domHeight = scrollDom2Height;

						scrollDom2Inner = common.doc.getElementById(common.scrollArr[key].targetId).getElementsByClassName(common.scrollArr[key].innerClass)[0];
						common.scrollArr[key].limit = scrollDom2Inner.offsetHeight;

						scrollBar2 = common.doc.getElementById(common.scrollArr[key].targetId).getElementsByClassName("scrollIndicatorInner")[0];
						scrollPosition2 = (!forceTop) ? Math.round(-scrollDom2Height * (common.scrollArr[key].scrollbarPositionBase / (common.scrollArr[key].limit))) : 0;
						common.scrollArr[key].scrollBarHeight = Math.round(scrollDom2Height * scrollDom2Height / common.scrollArr[key].limit);

						if(common.scrollArr[key].limit <= scrollDom2Height || forceTop){
							classNames = scrollDom2Inner.style.cssText;
							scrollDom2Inner.style.cssText = classNames + translateControler(0);
							common.scrollArr[key].scrollCount = 0;
							common.scrollArr[key].touchStartNum = 0;
						}
						if(scrollPosition2 + common.scrollArr[key].scrollBarHeight >= scrollDom2Height && !forceTop){
							classNames = scrollDom2Inner.style.cssText;
							scrollDom2Inner.style.cssText = classNames + translateControler(-1*(common.scrollArr[key].limit - scrollDom2Height));
							common.scrollArr[key].scrollCount = -1*(common.scrollArr[key].limit - scrollDom2Height);

						}

						if(scrollBar2){
							if(common.scrollArr[key].scrollBarHeight !== Infinity){
								if(common.ua.ios){
									scrollBar2.style.cssText = "height:" + common.scrollArr[key].scrollBarHeight + "px;-webkit-transform:translateY("+scrollPosition2+"px);";
								}else{
									scrollBar2.style.cssText = "height:" + common.scrollArr[key].scrollBarHeight + "px;-webkit-transform:translate3d(0,"+scrollPosition2+"px,0);";
								}
							}else{
								common.scrollArr[key].scrollBarHeight = common.scrollArr[key].limit;
							}
						}
						// ページ最初のリフレッシュで定義されていた場合
						if(afterHide && common.forceScrollArr && common.forceScrollArr[common.scrollArr[key].targetId+common.scrollArr[key].innerClass]){
							var setVal2 = common.forceScrollArr[common.scrollArr[key].targetId+common.scrollArr[key].innerClass].split(",");
							common.forceScroll(common.scrollArr[key].targetId,common.scrollArr[key].innerClass,setVal2[0],setVal2[1]);
							common.forceScrollArr[common.scrollArr[key].targetId+common.scrollArr[key].innerClass] = undefined;
						}
					}
				}
			}
			for(key in common.scrollArrX){
				var notDestroy = [
					"CharaListTop",
					"CharaListCompose",
					"CharaListComposeMagia",
					"CharaListCustomize",
					"CharaListEquip"
				];

				// 上記ページ間の遷移では破棄させない(同じviewが滞在しつづける)
				if(notDestroy.indexOf(common.location) > -1 && notDestroy.indexOf(common.scrollArrX[key].thisPage) > -1 && common.doc.getElementById(common.scrollArrX[key].targetId)){
					common.scrollArrX[key].thisPage = common.location;
				}

				if(common.scrollArrX[key].thisPage !== common.location){
					delete common.scrollArrX[key];
				}else{
					scrollDom2 = common.doc.getElementById(common.scrollArrX[key].targetId);
					if(!scrollDom2 || scrollDom2.getElementsByClassName(common.scrollArrX[key].innerClass).length < 1){
						// 存在しなかったら削除する
						// console.log(common.scrollArr)
						if(common.scrollArr == undefined) return;
						delete common.scrollArr[key];
					}else{
						scrollDom2Inner = common.doc.getElementById(common.scrollArrX[key].targetId).getElementsByClassName(common.scrollArrX[key].innerClass)[0];
						calcFactor = scrollDom2Inner.childNodes;

						common.scrollArrX[key].scrollDomWidth = scrollDom2.offsetWidth;

						// order対応(DOMの後ろから確認)
						var leng = calcFactor.length;
						var targetDom = calcFactor[leng-1];
						var checkNum = targetDom.offsetLeft;
						while(leng > 0){
							leng = (leng - 1) | 0;
							if(calcFactor[leng].offsetLeft > checkNum){
								targetDom = calcFactor[leng];
								checkNum  = targetDom.offsetLeft;
							}
						}
						common.scrollArrX[key].lastDom = targetDom;
						var targetWidth = targetDom.offsetWidth;
						common.scrollArrX[key].lastDomOffLeft = checkNum;
						common.scrollArrX[key].limit = common.scrollArrX[key].lastDomOffLeft + targetWidth + 10;
						scrollBar2 = common.doc.getElementById(common.scrollArrX[key].targetId).getElementsByClassName("scrollIndicatorInnerX")[0];
						scrollPosition2 = (!forceTop) ? Math.round(-common.scrollArrX[key].scrollDomWidth * (common.scrollArrX[key].scrollbarPositionBase / (scrollDom2Inner.offsetWidth))) : 0;
						common.scrollArrX[key].scrollBarWidth = Math.round(common.scrollArrX[key].scrollDomWidth * common.scrollArrX[key].scrollDomWidth / common.scrollArrX[key].limit);

						var oneTimeForceTop2 = false;
						if(common.scrollArrX[key].scrollDomWidth > (common.scrollArrX[key].lastDomOffLeft + targetWidth)){
							oneTimeForceTop2 = true;
							scrollPosition2 = 0;
						}

						if(common.scrollArrX[key].scrollBarWidth > common.scrollArrX[key].scrollDomWidth){
							common.scrollArrX[key].scrollBarWidth = common.scrollArrX[key].scrollDomWidth;
						}


						if(scrollPosition2 + common.scrollArrX[key].scrollDomWidth >= common.scrollArrX[key].limit && !forceTop){
							classNames = scrollDom2Inner.style.cssText;
							scrollDom2Inner.style.cssText = classNames + translateControlerX(-1*(common.scrollArrX[key].limit - common.scrollArrX[key].scrollDomWidth));
							common.scrollArrX[key].scrollCount = -1*(common.scrollArrX[key].limit - common.scrollArrX[key].scrollDomWidth);
							common.scrollArrX[key].touchStartNum = -1*(common.scrollArrX[key].limit - common.scrollArrX[key].scrollDomWidth);
						}

						if(common.scrollArrX[key].limit <= common.scrollArrX[key].scrollDomWidth || forceTop || oneTimeForceTop2){
							classNames = scrollDom2Inner.style.cssText;
							scrollDom2Inner.style.cssText = classNames + translateControlerX(0);
							common.scrollArrX[key].scrollCount = 0;
							common.scrollArrX[key].touchStartNum = 0;
						}

						if(scrollBar2){
							if(common.ua.ios){
								scrollBar2.style.cssText = "width:" + common.scrollArrX[key].scrollBarWidth + "px;-webkit-transform:translateX("+scrollPosition2+"px);";
							}else{
								scrollBar2.style.cssText = "width:" + common.scrollArrX[key].scrollBarWidth + "px;-webkit-transform:translate3d("+scrollPosition2+"px,0,0);";
							}
						}

						// ページ最初のリフレッシュで定義されていた場合
						if(afterHide && common.forceScrollXArr && common.forceScrollXArr[common.scrollArrX[key].targetId+common.scrollArrX[key].innerClass]){
							var setVal4 = common.forceScrollXArr[common.scrollArrX[key].targetId+common.scrollArrX[key].innerClass].split(",");
							common.forceScrollX(common.scrollArrX[key].targetId,common.scrollArrX[key].innerClass,setVal4[0],setVal4[1]);
							common.forceScrollXArr[common.scrollArrX[key].targetId+common.scrollArrX[key].innerClass] = undefined;
						}
					}
				}
			}
		}
	};
	// 変数を破棄したい時に叩く。
	common.scrollDestroy = function(ids,innerClass){
		var thisPage = common.location;
		if(ids && common.scrollArr[ids+innerClass+thisPage]){
			if(!common.doc.getElementById(ids)){
				delete common.scrollArr[ids+innerClass+thisPage];
			}
		}else if(ids && common.scrollArrX[ids+innerClass]){
			if(!common.doc.getElementById(ids)){
				delete common.scrollArrX[ids+innerClass];
			}
		}else if(!ids){
			// スクロールを破棄しないページを用意
			var notDestroy = [
				"CharaListTop",
				"CharaListCompose",
				"CharaListComposeMagia",
				"CharaListCustomize",
				"CharaListEquip"
			];

			for(var key in common.scrollArr){
				delete common.scrollArr[key];
			}
			if(notDestroy.indexOf(common.location) === -1){
				for(var keyX in common.scrollArrX){
					delete common.scrollArrX[keyX];
				}
				common.scrollArrX = {};
			}
			common.scrollArr = {};
		}
		// 念のためリフレッシュ
		common.scrollRefresh();
	};

	// ページ読み込み時にターゲットしたスクロールまでスクロールさせたい場合に叩く
	common.forceScrollPreset = function(targetDomId,targetDomClass,toScrollHash,noneAnimation){
		if(!common.forceScrollArr) common.forceScrollArr = [];
		common.forceScrollArr[targetDomId+targetDomClass] = toScrollHash+","+noneAnimation;
		if(noneAnimation){
			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
		}
	};
	common.forceScrollXPreset = function(targetDomId,targetDomClass,toScrollHash,noneAnimation){
		// 横スクロール版
		if(!common.forceScrollXArr) common.forceScrollXArr = [];
		common.forceScrollXArr[targetDomId+targetDomClass] = toScrollHash+","+noneAnimation;
		if(noneAnimation){
			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
		}
	};

	// ターゲットした要素までスクロールさせたい場合に叩く
	common.forceScroll = function(targetDomId,targetDomClass,toScrollHash,noneAnimation){
		if(common.forceScrollFlag) return;
		common.forceScrollFlag = true;
		// 親DOMと子DOMと対象を確認して、いなければ何もしない
		var _idParent = common.doc.getElementById(targetDomId);
		if(!_idParent){
			common.forceScrollFlag = false;
			return;
		}
		var _classParent = _idParent.getElementsByClassName(targetDomClass)[0];
		if(!_classParent){
			common.forceScrollFlag = false;
			return;
		}
		var _target = common.doc.querySelectorAll('[data-scroll-hash="'+toScrollHash+'"]')[0];
		if(!_target){
			// 親要素はあるのにターゲットがないときは強制的に非表示解除する
			common.forceScrollFlag = false;
			common.removeClass(_classParent,"scrollForceInvisible");
			return;
		}

		// スクローラー制御用の準備
		var thisPage = common.location;
		// スクローラーがセットされていない時は何もしない
		if(!common.scrollArr[targetDomId+targetDomClass+thisPage]){
			common.forceScrollFlag = false;
			common.removeClass(_classParent,"scrollForceInvisible");
			return;
		}

		var scrollBar = _idParent.getElementsByClassName("scrollIndicatorInner")[0];

		// そのままだとちらつくので慣性スクロールさせる
		var rAF;
		var rAFStop;
		if(common.ua.ios){
			rAF   = window.requestAnimationFrame        ||
					window.webkitRequestAnimationFrame  ||
					window.mozRequestAnimationFrame     ||
					window.oRequestAnimationFrame       ||
					window.msRequestAnimationFrame      ||
					function (callback) { window.setTimeout(callback, 10); };
			rAFStop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function (callback) { window.setTimeout(callback); };
		}else{
			rAF = function(callback){window.setTimeout(callback, 10);};
			rAFStop = function(callback){window.clearTimeout(callback);};
		}
		var velocity = 0;
		var velocityFlg = false;
		var beforeDistance = null;
		var forceScrollTimeset = function(){
			if(!common.forceScrollFlag ||
			   !_idParent ||
			   !_classParent ||
			   checkVelocity < 0.1 ||
			   !common.doc.getElementById(targetDomId) ||
			   !common.scrollArr[targetDomId+targetDomClass+thisPage] ||
			   common.scrollArr[targetDomId+targetDomClass+thisPage].thisPage !== common.location){
			   	rAFStop(step);
				common.forceScrollFlag = false;
			   	common.removeClass(_classParent,"scrollForce");
				return;
			}
			// 遅延+AndroidBack対策
			if(_classParent.length < 1){
				common.forceScrollFlag = false;
				return;
			}

			// var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;
			common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount = common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount + velocity;
			checkVelocity = (velocity < 0) ? velocity * -1 : velocity;

			// スクロールの下端に届いた場合
			if(-common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount >= common.scrollArr[targetDomId+targetDomClass+thisPage].limit - _idParent.offsetHeight){
				common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount = Math.round(common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount);
				common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum = -common.scrollArr[targetDomId+targetDomClass+thisPage].limit + _idParent.offsetHeight;
				_classParent.style.cssText = common.scrollArr[targetDomId+targetDomClass+thisPage].defaultCss + translateControler(common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}
			_classParent.style.cssText = common.scrollArr[targetDomId+targetDomClass+thisPage].defaultCss + translateControler(common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount);

			// refreshのタイミング次第があるので２度判定
			if(!_idParent || !_classParent || !_idParent || !common.scrollArr[targetDomId+targetDomClass+thisPage]){
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}
			common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum = common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount;

			// 指定DOMに近づくまでほとんど減衰させないために、domとの距離を測る
			var distance = (-common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount) - (-targetPosition);
			distance = (distance < 0) ? distance * -1 : distance;
			// 開始位置と指定位置の30%に到達したら減衰させる
			var checkMoving = firstPosition + common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount;
			checkMoving = checkMoving / 100 * -30;
			if(distance < checkMoving){
				if(!velocityFlg){
					// 慣性値を残り距離の1/20とする
					if(velocity > 0){
						velocity = distance / 20;
					}else{
						velocity = distance / 20 * -1;
					}
					velocityFlg = true;
				}else{
					// 減衰値をかけて慣性を弱める(数字が大きいほど減衰率低め)
					velocity = velocity * 0.99;
				}
			}

			// 目標付近(3px圏内)に到達
			if(distance < 3 || (beforeDistance && beforeDistance < distance)){
				common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount = targetPosition;
				common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum = targetPosition;
				_classParent.style.cssText = common.scrollArr[targetDomId+targetDomClass+thisPage].defaultCss + translateControler(common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				velocityFlg = false;
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}else{
				// 目標位置に到達するまで繰り返す
				step = rAF(forceScrollTimeset);

				// 万が一暴走しないように
				// １個前のスクロール位置を記憶してこれより離れたら最終位置に移動させる
				beforeDistance = distance;
			}
		};
		var translateControler = function(num){
			// androidとiosで切り分け
			// スクロールバーも動かす
			num = Math.round(num * 100) / 100;
			scrollBarControler(num);
			if(common.ua.ios){
				return "-webkit-transform:translateY("+num+"px) translateZ(0);";
			}else{
				return "-webkit-transform:translate3d(0,"+num+"px,0);";
			}
		};
		var scrollBarControler = function(num){
			// androidとiosで切り分け
			common.scrollArr[targetDomId+targetDomClass+thisPage].scrollbarPositionBase = num;
			var scrollPosition = Math.round(-_idParent.offsetHeight * (num / (_classParent.offsetHeight)));
			if(common.ua.ios){
				scrollBar.style.cssText = "height:" + common.scrollArr[targetDomId+targetDomClass+thisPage].scrollBarHeight + "px;-webkit-transform:translateY("+scrollPosition+"px) translateZ(0);";
			}else{
				scrollBar.style.cssText = "height:" + common.scrollArr[targetDomId+targetDomClass+thisPage].scrollBarHeight + "px;-webkit-transform:translate3d(0,"+scrollPosition+"px,0);";
			}
		};

		// スクロール先の座標など計算
		var firstPosition  = common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum;
		var targetPosition = _target.offsetTop * -1 + 15;// 15px上にターゲット
		if(targetPosition > 0) targetPosition = 0;

		// 同じ場所ならそもそも何もしない
		if(firstPosition === targetPosition){
			common.forceScrollFlag = false;

			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			var forceClassRemoveA = function(){
				if(!common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0]) return;
				common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].removeEventListener("webkitAnimationEnd",forceClassRemoveA);
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			};
			common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].addEventListener("webkitAnimationEnd",forceClassRemoveA);

			common.removeClass(_classParent,"scrollForce");
			return;
		}
		common.addClass(_classParent,"scrollForce");

		// アニメーションなしの場合
		if(noneAnimation === "true" || noneAnimation === true){
			common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount = targetPosition;
			common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum = targetPosition;
			if(-common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount >= common.scrollArr[targetDomId+targetDomClass+thisPage].limit - _idParent.offsetHeight){
				common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount = Math.round(common.scrollArr[targetDomId+targetDomClass+thisPage].scrollCount);
				common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum = -common.scrollArr[targetDomId+targetDomClass+thisPage].limit + _idParent.offsetHeight;
			}
			_classParent.style.cssText = common.scrollArr[targetDomId+targetDomClass+thisPage].defaultCss + translateControler(common.scrollArr[targetDomId+targetDomClass+thisPage].touchStartNum);
			common.removeClass(scrollBar,"onScroll");
			velocityFlg = false;
			common.forceScrollFlag = false;
			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			var forceClassRemove = function(){
				if(!common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0]) return;
				common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].removeEventListener("webkitAnimationEnd",forceClassRemove);
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			};
			common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].addEventListener("webkitAnimationEnd",forceClassRemove);

			common.removeClass(_classParent,"scrollForce");
		}else{
		// アニメーションありの場合

			// スクロール先の座標から初期加速度を決定する(だいたい１秒で到達する計算がいいかな)
			var firstDistance = -firstPosition - (_target.offsetTop - 15);
			firstDistance = (firstDistance < 0) ? firstDistance : -firstDistance;
			velocity = firstDistance / 20;
			if(firstPosition < targetPosition){
				velocity = velocity * -1;
			}
			var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;

			var step = forceScrollTimeset();
		}
	};

	// ターゲットした要素までスクロールさせたい場合に叩く(横スクロール版)
	common.forceScrollX = function(targetDomId,targetDomClass,toScrollHash,noneAnimation){
		if(common.forceScrollFlag) return;
		common.forceScrollFlag = true;
		// 親DOMと子DOMと対象を確認して、いなければ何もしない
		var _idParent = common.doc.getElementById(targetDomId);
		if(!_idParent) return;
		var _classParent = _idParent.getElementsByClassName(targetDomClass)[0];
		if(!_classParent) return;
		var _target = common.doc.querySelectorAll('[data-scroll-hash="'+toScrollHash+'"]')[0];
		if(!_target) return;

		// スクローラー制御用の準備
		var thisPage = common.location;
		// スクローラーがセットされていない時は何もしない
		if(!common.scrollArrX[targetDomId+targetDomClass]) return;

		var scrollBar = _idParent.getElementsByClassName("scrollIndicatorInnerX")[0];

		// そのままだとちらつくので慣性スクロールさせる
		var rAF;
		var rAFStop;
		if(common.ua.ios){
			rAF   = window.requestAnimationFrame        ||
					window.webkitRequestAnimationFrame  ||
					window.mozRequestAnimationFrame     ||
					window.oRequestAnimationFrame       ||
					window.msRequestAnimationFrame      ||
					function (callback) { window.setTimeout(callback, 10); };
			rAFStop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function (callback) { window.setTimeout(callback); };
		}else{
			rAF = function(callback){window.setTimeout(callback, 10);};
			rAFStop = function(callback){window.clearTimeout(callback);};
		}
		var velocity = 0;
		var velocityFlg = false;
		var beforeDistance = null;
		var forceScrollTimeset = function(){
			if(!common.forceScrollFlag ||
			   !_idParent ||
			   !_classParent ||
			   checkVelocity < 0.1 ||
			   !common.doc.getElementById(targetDomId) ||
			   !common.scrollArrX[targetDomId+targetDomClass]){
			   	rAFStop(step);
			   common.removeClass(_classParent,"scrollForce");
				return;
			}
			// 遅延+AndroidBack対策
			if(_classParent.length < 1){
				common.forceScrollFlag = false;
				return;
			}

			// var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;
			common.scrollArrX[targetDomId+targetDomClass].scrollCount = common.scrollArrX[targetDomId+targetDomClass].scrollCount + velocity;
			checkVelocity = (velocity < 0) ? velocity * -1 : velocity;

			// スクロールの下端に届いた場合
			if(-common.scrollArrX[targetDomId+targetDomClass].scrollCount >= common.scrollArrX[targetDomId+targetDomClass].limit - _idParent.offsetWidth){
				common.scrollArrX[targetDomId+targetDomClass].scrollCount = Math.round(common.scrollArrX[targetDomId+targetDomClass].scrollCount);
				common.scrollArrX[targetDomId+targetDomClass].touchStartNum = -common.scrollArrX[targetDomId+targetDomClass].limit + _idParent.offsetWidth;
				_classParent.style.cssText = common.scrollArrX[targetDomId+targetDomClass].defaultCss + translateControler(common.scrollArrX[targetDomId+targetDomClass].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}
			_classParent.style.cssText = common.scrollArrX[targetDomId+targetDomClass].defaultCss + translateControler(common.scrollArrX[targetDomId+targetDomClass].scrollCount);

			// refreshのタイミング次第があるので２度判定
			if(!_idParent || !_classParent || !_idParent || !common.scrollArrX[targetDomId+targetDomClass]){
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}
			common.scrollArrX[targetDomId+targetDomClass].touchStartNum = common.scrollArrX[targetDomId+targetDomClass].scrollCount;

			// 指定DOMに近づくまでほとんど減衰させないために、domとの距離を測る
			var distance = (-common.scrollArrX[targetDomId+targetDomClass].scrollCount) - (-targetPosition);
			distance = (distance < 0) ? distance * -1 : distance;
			// 開始位置と指定位置の30%に到達したら減衰させる
			var checkMoving = firstPosition + common.scrollArrX[targetDomId+targetDomClass].scrollCount;
			checkMoving = checkMoving / 100 * -30;
			if(distance < checkMoving){
				if(!velocityFlg){
					// 慣性値を残り距離の1/20とする
					if(velocity > 0){
						velocity = distance / 20;
					}else{
						velocity = distance / 20 * -1;
					}
					velocityFlg = true;
				}else{
					// 減衰値をかけて慣性を弱める(数字が大きいほど減衰率低め)
					velocity = velocity * 0.99;
				}
			}

			// 目標付近(3px圏内)に到達
			if(distance < 3 || (beforeDistance && beforeDistance < distance)){
				common.scrollArrX[targetDomId+targetDomClass].scrollCount = targetPosition;
				common.scrollArrX[targetDomId+targetDomClass].touchStartNum = targetPosition;
				_classParent.style.cssText = common.scrollArrX[targetDomId+targetDomClass].defaultCss + translateControler(common.scrollArrX[targetDomId+targetDomClass].touchStartNum);
				common.removeClass(scrollBar,"onScroll");
				velocityFlg = false;
				common.forceScrollFlag = false;
				common.removeClass(_classParent,"scrollForce");
				return;
			}else{
				// 目標位置に到達するまで繰り返す
				step = rAF(forceScrollTimeset);

				// 万が一暴走しないように
				// １個前のスクロール位置を記憶してこれより離れたら最終位置に移動させる
				beforeDistance = distance;
			}
		};
		var translateControler = function(num){
			// androidとiosで切り分け
			// スクロールバーも動かす
			num = Math.round(num * 100) / 100;
			scrollBarControler(num);
			if(common.ua.ios){
				return "-webkit-transform:translateX("+num+"px) translateZ(0);";
			}else{
				return "-webkit-transform:translate3d("+num+"px,0,0);";
			}
		};
		var scrollBarControler = function(num){
			// androidとiosで切り分け
			common.scrollArrX[targetDomId+targetDomClass].scrollbarPositionBase = num;
			var scrollPosition = Math.round(-_idParent.offsetWidth * (num / (_classParent.offsetWidth)));
			if(common.ua.ios){
				scrollBar.style.cssText = "height:" + common.scrollArrX[targetDomId+targetDomClass].scrollBarHeight + "px;-webkit-transform:translateY("+scrollPosition+"px) translateZ(0);";
			}else{
				scrollBar.style.cssText = "height:" + common.scrollArrX[targetDomId+targetDomClass].scrollBarHeight + "px;-webkit-transform:translate3d(0,"+scrollPosition+"px,0);";
			}
		};

		// スクロール先の座標など計算
		var firstPosition  = common.scrollArrX[targetDomId+targetDomClass].touchStartNum;
		var targetPosition = _target.offsetLeft * -1 + 15;// 15px左にターゲット
		if(targetPosition > 0) targetPosition = 0;

		// 同じ場所ならそもそも何もしない
		if(firstPosition === targetPosition){
			common.forceScrollFlag = false;
			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			var forceClassRemoveA = function(){
				if(!common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0]) return;
				common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].removeEventListener("webkitAnimationEnd",forceClassRemoveA);
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			};
			common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].addEventListener("webkitAnimationEnd",forceClassRemoveA);

			common.removeClass(_classParent,"scrollForce");
			return;
		}
		common.addClass(_classParent,"scrollForce");

		// アニメーションなしの場合
		if(noneAnimation === "true" || noneAnimation === true){
			common.scrollArrX[targetDomId+targetDomClass].scrollCount = targetPosition;
			common.scrollArrX[targetDomId+targetDomClass].touchStartNum = targetPosition;
			if(-common.scrollArrX[targetDomId+targetDomClass].scrollCount >= common.scrollArrX[targetDomId+targetDomClass].limit - _idParent.offsetWidth){
				common.scrollArrX[targetDomId+targetDomClass].scrollCount = Math.round(common.scrollArrX[targetDomId+targetDomClass].scrollCount);
				common.scrollArrX[targetDomId+targetDomClass].touchStartNum = -common.scrollArrX[targetDomId+targetDomClass].limit + _idParent.offsetWidth;
			}
			_classParent.style.cssText = common.scrollArrX[targetDomId+targetDomClass].defaultCss + translateControler(common.scrollArrX[targetDomId+targetDomClass].touchStartNum);
			common.removeClass(scrollBar,"onScroll");
			velocityFlg = false;
			common.forceScrollFlag = false;
			common.addClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			var forceClassRemove = function(){
				if(!common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0]) return;
				common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].removeEventListener("webkitAnimationEnd",forceClassRemove);
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"scrollForceInvisible");
				common.removeClass(common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0],"fadeIn");
			};
			common.doc.getElementById(targetDomId).getElementsByClassName(targetDomClass)[0].addEventListener("webkitAnimationEnd",forceClassRemove);

			common.removeClass(_classParent,"scrollForce");
		}else{
		// アニメーションありの場合

			// スクロール先の座標から初期加速度を決定する(だいたい１秒で到達する計算がいいかな)
			var firstDistance = -firstPosition - (_target.offsetLeft - 15);
			firstDistance = (firstDistance < 0) ? firstDistance : -firstDistance;
			velocity = firstDistance / 20;
			if(firstPosition < targetPosition){
				velocity = velocity * -1;
			}
			var checkVelocity = (velocity < 0) ? velocity * -1 : velocity;

			var step = forceScrollTimeset();
		}
	};

	//-----------------------------------------------------
	// NativeKeyboard呼び出し用共通ファンクション
	// @inputId {str}   - 入力対象のinputのid(必須)
	// @maxLength {int} - 最大文字数(とりあえずなかった場合50にしておく)(制限を設けない場合は-1を渡す)
	// @inputType {int} - キーボード初期表示 0:日本語(default) 1:英数字
	// @callback        - 終了後にcallbackさせたい場合の関数
	//-----------------------------------------------------
	common.nativeKeyBoard = function(inputId,maxLength,inputType,inputCountId,callback){
		if(!inputId) return;
		if(!maxLength) maxLength = 50;
		if(!inputType) inputType = 0;
		if(maxLength < 0) maxLength = 0;

		// このファイルの先頭でcommandを呼ぶと実行順でエラー起こすのでここでrequireする
		require(["command"],function(cmd){
			var nativeKeyBoard =function(e){
				e.preventDefault();
				if(common.isScrolled()) return;
				// 2本指だった場合エラーを起こしていたので防ぐ
				if(common.isDoubleTouch()) return;
				if(!common.doc.getElementById(inputId)) return;
				if(!window.isBrowser) common.tapBlock(true);

				// ネイティブコールバック用
				$('#commandDiv').on("nativeCallback",function(e,res){
					$('#commandDiv').off();
					common.tapBlock(false);
					if(!common.doc.getElementById(inputId)) return;

					if(res.resultCode === "error"){
						var popup = new common.PopupClass({
							title:res.title,
							content:res.errorTxt,
							closeBtnText:"OK"
						});
						return;
					}

					var val = res.text;
					var textNum = (val && val.length) ? val.length : 0;
					if(maxLength && maxLength > 0){
						if(textNum > maxLength) val = val.substr(0,maxLength);
					}
					common.doc.getElementById(inputId).value = val;
					if(inputCountId && common.doc.getElementById(inputCountId)){
						common.doc.getElementById(inputCountId).textContent = textNum;
					}
					if(callback){
						callback();
					}
				});

				var inputedText = common.doc.getElementById(inputId).value;
				cmd.openKeyBoard(inputedText,maxLength,inputType);

				common.doc.getElementById(inputId).removeEventListener(common.cgti,nativeKeyBoard);
				common.doc.getElementById(inputId).removeAttribute("readonly");

				if(inputCountId){
					common.doc.getElementById(inputId).addEventListener("keyup",function(){
						var valLocal = common.doc.getElementById(inputId).value;
						var textNumLocal = (valLocal && valLocal.length) ? valLocal.length : 0;
						if(maxLength > 0 && textNumLocal > maxLength){
							valLocal = valLocal.substr(0,maxLength);
							common.doc.getElementById(inputId).value = valLocal;
						}
						common.doc.getElementById(inputCountId).textContent = textNumLocal;
					});
				}

				if (window.isBrowser) nativeCallback({"text":""});
			};
			common.doc.getElementById(inputId).addEventListener(common.cgti,nativeKeyBoard);
		});
	};

	//--------------------------------
	// 汎用拡大画像view
	// imgタグ以外では稼働させない。
	//--------------------------------
	common.imageZoomView = function(e){
		var current = e.currentTarget;
		if(current.tagName !== "IMG" && current.tagName !== "img") return;

		var zoomView = Backbone.View.extend({
			id:"overImageZoom",
			events: function() {
				var evtObj = {};
				evtObj[common.cgti] = this.removeView;
				return evtObj;
			},
			initialize : function(options) {
				common.androidKeyForceStop = true;
				common.addClass(common.doc.getElementById("curtain"),"show");
				this.createDom();
			},
			render : function() {
				var setImage = common.doc.createElement("img");
				setImage.src = current.src;
				this.el.appendChild(setImage);
				return this.el;
			},
			createDom : function(){
				common.doc.getElementById("overlapContainer").appendChild(this.render());
				common.doc.getElementById("overlapContainer").style.zIndex = "1000001";
			},
			removeView : function(){
				common.removeClass(common.doc.getElementById("curtain"),"show");
				common.androidKeyForceStop = false;
				common.doc.getElementById("overlapContainer").style.zIndex = "";
				this.off();
				this.remove();
			}
		});

		var view = new zoomView();
	};

	// ランキングイベント開催中か判断
	// ランクマッチイベントも開催中か判断する
	// eventList: pageJson.eventList
	// regularEventList: pageJson.regularEventList
	common.isRankingRunning = function(_args){
		var _eventList = _args.eventList;
		var _regularEventList = _args.regularEventList;
		var rankingRunning = false;
		var rankingEvent = _.findWhere(_eventList,{eventType:"ARENARANKING"});
		var rankMatch = _.findWhere(_regularEventList,{regularEventType:"ARENARANKMATCH"});
		if(rankingEvent){ //開催されているイベントタイプを入れる
			rankingRunning = 'ARENARANKING';
		}else if(rankMatch){
			rankingRunning = 'ARENARANKMATCH';
		};
		return rankingRunning;
	};

	// ピリオド区切りのバージョン比較（verがtarget以上かどうか）
	common.compareVersion = function(ver,target){
		var ret = false;
		if (ver !== target) {
			var a = ver.split('.');
			var b = target.split('.');
			var len = Math.min(a.length,b.length);
			for (var i = 0; i < len; i++) {
				if (parseInt(a[i]) > parseInt(b[i])) {
					ret = true;
					break;
				} else if (parseInt(a[i]) < parseInt(b[i])) {
					ret = false;
				}
			}
		} else {
			ret = true;
		}
		return ret;
	};

	// トースト通知ファンクション
	var toastShowFlg = false;
	common.toastStop  = false;
	common.toastQueue = [];
	common.toastAppear = function(type){
		if(toastShowFlg) return;
		toastShowFlg = true;
		// typeで通知内文言を変える（今は固定値
		var message;
		switch(type){
			case "title" :
				message = "新しい称号を獲得しました";
				break;
			default :
				break;
		}

		if(common.toastStop){
			common.toastQueue.push(message);
			return;
		}

		common.doc.getElementById("toastPushArea").textContent = message;
		$("#toastPushArea").on("webkitAnimationEnd",function(){
			$("#toastPushArea").off();
			common.removeClassId("toastPushArea","show");
			common.doc.getElementById("toastPushArea").textContent = "";
			toastShowFlg = false;
		});
		common.addClassId("toastPushArea","show");
	};

	// トースト遅延発火ファンクション
	// howto use
	// トースト通知を止めたいタイミングでcommon.toastStop = trueにする
	// 再開したいタイミングでcommon.toastStop = falseにして↓のファンクションを叩く(たまってるQueすべてが表示される)
	common.toastTriggerAppear = function(){
		if(common.toastQueue.length < 1) return;
		toastShowFlg = true;

		common.doc.getElementById("toastPushArea").textContent = common.toastQueue[0];
		$("#toastPushArea").on("webkitAnimationEnd",function(){
			$("#toastPushArea").off();
			common.removeClassId("toastPushArea","show");

			common.toastQueue.splice(0,1);
			if(common.toastQueue.length < 1){
				common.doc.getElementById("toastPushArea").textContent = "";
				toastShowFlg = false;
			}else{
				setTimeout(function(){
					common.toastTriggerAppear();
				},500);
			}

		});
		common.addClassId("toastPushArea","show");
	}

	// 称号リストオブザーバー設定ファンクション
	var bindFlg = false;
	common.setTitleCollectionObserved = function(){
		if(!common.storage.userTitleList) return;
		if(bindFlg) return;
		bindFlg = true;
		var toastLaunch = function(){
			common.toastAppear("title");
		};
		common.storage.userTitleList.on("add",toastLaunch);
	};

	// 指定属性の属性強化値を取得
	common.getTargetComposeAttribute = function(_args){
		var _attributeId = _args.attributeId;
		var _userStatusList = false;
		if(_args.userStatusList){ //自分ではない userStatusList がある時
			_userStatusList = _args.userStatusList;
		};
		var _composeAttribute = {
			attributeId: "NONE",
			composed: {
				ATTACK: 0,
				DEFENSE: 0,
				HP: 0,
			},
		};
		var _typeList = [
			'HP',
			'ATTACK',
			'DEFENSE',
		];
		if(!_userStatusList && common.storage.userStatusList){
			_userStatusList = common.storage.userStatusList.toJSON();
		}else if(!_attributeId){
			// 属性が存在しなければそのまま返す
			return _composeAttribute;
		};
		_.each(_userStatusList, function(_val, _index, _list){
			if(~_val.statusId.indexOf(_attributeId)){ //指定属性の時
				_composeAttribute.attributeId = _attributeId;
				_.each(_typeList, function(_val2, _index2, _list2){
					if(~_val.statusId.indexOf(_val2)){
						_composeAttribute.composed[_val2] = _val.point;
					};
				});
			};
		});
		return _composeAttribute;
	};//getTargetComposeAttribute

	// 「＠（大文字）」を改行に変換する
	common.convertTextBr = function(_args){
		var _text = _args.text;
		var _convertText = '';
		// 変換する
		_convertText = _text.replace(/＠/g, "<br>");
		return _convertText;
	};//convertTextBr

	//利用規約に同意したかどうかを確認する関数
	common.consentRulesFunctions = function(_args){
		var _obj = {};
		var _checkId = 'checkConsentRulesTime';
		//同意した時間を保存する
		_obj.setTime = function(_args){
			var __currentTime = _args.currentTime;
			localStorage.setItem(_checkId, __currentTime);
		};
		//同意したかどうかを取得する
		_obj.isConsentRules = function(_args){
			var __currentTime = _args.currentTime;
			var __isConsent = false;
			var __consentTime = localStorage.getItem(_checkId);
			var __checkTime = '2024/05/31 15:10:00'; //規約同意時間の設定
			//指定時間より前はチェックしない
			if(
				common.getStatusTargetTermInCurrentTime({
					startAt: '2020/01/01 00:00:00',
					endAt: __checkTime,
					currentTime: __currentTime,
				})
			){
				__isConsent = true;
			};
			//同意時間が存在していて、かつ指定時間以降の時
			if(
				__consentTime && 
				common.getStatusTargetTermInCurrentTime({
					startAt: __checkTime,
					endAt: '2200/01/01 00:00:00',
					currentTime: __consentTime,
				})
			){
				__isConsent = true;
			};
			return __isConsent;
		};
		return _obj;
	};//consentRulesFunctions

	return common;
});
