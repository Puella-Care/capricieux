define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	//'text!template/user/AnnounceTemp.html',
	//'text!template/user/AnnounceTempMainte.html',
	'command'
], function (_,
	Backbone,
	common,
	ajaxControl,
	//announceTemp,
	//announceTempMainte,
	cmd) {
	'use strict';

	// ------------------------------------------------------------------------.
	// アナウンスView
	// ------------------------------------------------------------------------.
	var newsList;
	var textField;
	var announceTab;
	var AnnounceView = Backbone.View.extend({
		events: function(){
			var evtObj = {};
			if (window.isBrowser) {
				evtObj[common.cgti + " .debugBtn"]      = this.debugBtn;
				evtObj[common.cgti + " .debugOpenBtn"]  = this.debugOpenBtn;
				evtObj[common.cgti + " .debugCloseBtn"] = this.debugCloseBtn;
				evtObj[common.cgti + " .debugClearBtn"] = this.debugClearBtn;
			}

			evtObj[common.cgti + " .titleList"]      = this.openText;
			evtObj[common.cgti + " .bannerAnnounce"] = this.openText;
			evtObj[common.cgti + " .otherNews"]      = this.openText;
			evtObj[common.cgti + " .bannerLinkBtn"]  = this.bannerLink;
			evtObj[common.cgti + " .newsClose.btn"]  = this.closeText;
			evtObj[common.cgti + " .announceBtn"]    = this.categoryToggle;
			evtObj[common.cgti + " .andMoreBtn"]     = this.andMore;
			evtObj[common.cgti + " .announcePassport"]  = this.passPortAnnounce;
			evtObj[common.cgti + " .outerLink"]         = this.outerLink;
			evtObj[common.cgti + " .announceTextLink"]  = this.announceTextLink;
			evtObj[common.cgti + " .announceOuterLink"] = this.outerLink;
			evtObj[common.cgti + " .separateOuterLink"] = this.separateOuterLink;
			evtObj[common.cgti + " .noticeText"] = this.tapNoticeText;

			return evtObj;
		},
		initialize: function(option) {
			this.listenTo(this,"removeView",this.removeView);

			// 各JSONをパースして使える状態にする。
			this.model = JSON.parse(option.announcementJson);
			this.bannerModel = JSON.parse(option.bannerJson);

			this.currentCategory = "NEW";

			// マイページのお知らせポップアップか
			// それともメンテナンス画面のお知らせポップアップか
			// 使うものを判断する。
			if(common.historyArr[common.historyArr.length-1] !== "Maintenance"){
				// 最後に見たお知らせの最終取得日を取得する(Newマーク用)
				this.readDay = (common.storage.gameUser.get("announcementViewAt")) ? Date.parse(common.storage.gameUser.get("announcementViewAt")) : -1;
				this.template = _.template(
					common.doc.getElementById('tempAnnounceTemp').innerText
				);

				// 現在の時間（終了済み、開催前は出さないように)
				this.currentTime = ajaxControl.getPageJson().currentTime;
			}else{
				// メンテナンスの場合は既読IDがとれないので無限とする
				this.readDay = Infinity;

				this.template = _.template(
					common.doc.getElementById('tempAnnounceTempMainte').innerText
				);

				// メンテ時はレスポンスヘッダーから時間を取得する
				// var getUTCDateByServer = function(){
				// 	var r;
				// 	return (r = new XMLHttpRequest()) ? (r.open('HEAD', '#', false), r.send(null), new Date(r.getResponseHeader('Date'))) : null;
				// };
				// if(!window.isLocal){
				// 	this.currentTime = getUTCDateByServer();
				// }else{
					// ローカルデバッグ用
					var nowIs = new Date();
					this.currentTime = nowIs.getFullYear()+"/"+(nowIs.getMonth()+1)+"/"+nowIs.getDate()+" "+nowIs.getHours()+":"+nowIs.getMinutes()+":"+nowIs.getSeconds();
				// }
			}

			// add:未開放のお知らせを使用するmodelから省く
			var that = this;
			//debug
			if(window.isLocal && window.isDebug){
				this.currentTime = "2017-11-20 20:00:00";
			}

			this.model = _.filter(this.model,function(model){
				return Date.parse(model.startAt.replace(/-/g,"/")) <= Date.parse(that.currentTime);
			});
			this.model      = _.sortBy(this.model,function(model){ return model.startAt;});
			this.newestList = _.sortBy(this.model,function(model){ return model.sortKey * -1;});
			this.render();


			common.scrollSet("scrollTextWrap","newsField");
			common.scrollSet("newsScrollWarp","announceTitle");

			// メンテじゃなかった場合の処理
			if(common.historyArr[common.historyArr.length-1] !== "Maintenance"){
				// commonBannerを増やす
				common.scrollSet("announceBannerArea","scrollBar");
			}

			// バナーなどで初期表示IDがあった場合初期表示する
			if(option.firstViewNews){
				this.openTextFirst(option.firstViewNews);
			}

			// イベントIDがあるときはイベントのお知らせを開く
			if(option.targetEvent){
				this.openTextEvent(option.targetEvent);
			}

			// キャンペーンIDがあるときはキャンペーンのお知らせを開く
			if(option.targetCampaign){
				this.openTextCampaign(option.targetCampaign);
			}

			// 引数にannounceDataを持っているときは直接開く
			if(option.announceData){
				this.openTargetAnnounce(option.announceData);
			}
		},
		render: function() {
			// ソートキー順に並び替える（お知らせは降順、バナーは昇順)
			var newList = _.sortBy(this.model,function(model){ return model.sortKey * -1;});
			var bannerList = _.sortBy(this.bannerModel,function(model){ return model.sortKey;});

			// 新着のお知らせを調べる(マイページのみ)
			var newFlg = [];
			var platForm = (!common.thisPlatform) ? (common.ua.android) ? "ANDROID" :
			 										(common.ua.ios)     ? "IOS" :
			 										(!window.isDebug)   ? "DMM" :
			 										"IOS" :
			 										common.thisPlatform;

			//console.log("platForm",platForm);

			// 別のとこでも使うことになったのでthisにも格納
			this.platForm = platForm;

			if(common.historyArr[common.historyArr.length-1] !== "Maintenance"){
				var newListLeng = this.newestList.length;
				var i=0;
				var newCateCheckTime = Date.parse(ajaxControl.getPageJson().currentTime);
				while(i<newListLeng){
					// iOSのDate.parseバグ対策
					var cateStart = this.newestList[i].startAt.replace(/-/g,"/");
					var cateEnd   = this.newestList[i].endAt.replace(/-/g,"/");
					if(newCateCheckTime >= Date.parse(cateStart) && Date.parse(cateStart) > this.readDay && Date.parse(cateEnd) > newCateCheckTime){
						if(newFlg.indexOf(this.newestList[i].category) < 0){
							// 両端末対応記事だった場合
							if(this.newestList[i].displayOs && this.newestList[i].displayOs === "ALL"){
								newFlg.push(this.newestList[i].category);
							// iOS/Androidの分岐
							}else if((this.newestList[i].displayOs && this.newestList[i].displayOs === platForm)){

									// 条件を達成した場合はループを終了
									newFlg.push(this.newestList[i].category);
							}
						}
						if(newFlg.length === 3) i = newListLeng;
					}
					i++;
				}

				if(newFlg.length > 0){
					if(newFlg.indexOf("NEW") > -1){
						this.currentCategory = "NEW";
					}else if(newFlg.indexOf("MNT") > -1){
						this.currentCategory = "MNT";
					}else if(newFlg.indexOf("UPD") > -1){
						this.currentCategory = "UPD";
					}
				}
			}

			// メンテページじゃない場合はバナー固定表示関連を追加する
			var addShowFlg = {};
			if(common.location !== "Maintenance"){
				// 曜日クエストの確認
				// todayWeek(0:日,1:月,2:火,3:水……6:土)
				var currentTime = Date.parse(ajaxControl.getPageJson().currentTime);
				var todayWeek   = new Date(currentTime).getDay();
				addShowFlg.week = todayWeek;

				// マギアパスポート購入中かの判断
				var gameUser = (common.storage.gameUser) ? common.storage.gameUser.toJSON() : ajaxControl.getPageJson().gameUser;
				if(gameUser.passportExpiredAt){
					var left = Math.floor((Date.parse(gameUser.passportExpiredAt) - currentTime) / 1000 / 60 / 60 / 24);
					addShowFlg.passport = (left > -1) ? false : true;
				}else{
					addShowFlg.passport = true;
				}
				// マギアパスポート強制非表示
				addShowFlg.passport = false;

				// スタートダッシュガチャの期間中かどうか
				if(gameUser.startdashGachaExpiredAt){
					var startLeft = Math.floor((Date.parse(gameUser.startdashGachaExpiredAt) - currentTime));
					addShowFlg.startDashGacha = (startLeft > 0) ? true : false;
				}else{
					addShowFlg.startDashGacha = false;
				}
				if(gameUser.startdashMemoriaGachaExpiredAt){
					var startLeft = Math.floor((Date.parse(gameUser.startdashMemoriaGachaExpiredAt) - currentTime));
					addShowFlg.startDashGachaMemoria = (startLeft > 0) ? true : false;
				}else{
					addShowFlg.startDashGachaMemoria = false;
				}

				// スタートダッシュキャンペーンの期間中かどうか
				addShowFlg.startDashCampaign = false;
				if(gameUser.startdashCampaignExpiredAt){
					var endDate = new Date(gameUser.startdashCampaignExpiredAt);

					var left = Math.floor(endDate.getTime() - currentTime);
					if (left > 0) {
						var campaignData = _.findWhere(ajaxControl.getPageJson().campaignList,{ campaignType:"STARTDASH" });
						if(campaignData) {
							addShowFlg.startDashCampaign = true;
							addShowFlg.startDashCampaignContent = {};
							addShowFlg.startDashCampaignContent.campaignId = campaignData.id;
							addShowFlg.startDashCampaignContent.endDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes();

							var campaignNews = _.findWhere(this.model,{campaignId:(campaignData.id | 0)});
							if (campaignNews) {
								addShowFlg.startDashCampaignContent.campaignNewsId = campaignNews.id;
							}
						}
					}
				}
			}
			this.$el.html(this.template({
											model:this.newestList,
											newFlg:newFlg,
											readDay:this.readDay,
											banner:bannerList,
											addShow:addShowFlg,
											currentTime:this.currentTime,
											userAgent:platForm
										}));
			this.el.style.width = "100%";
			this.el.style.height = "100%";
			this.el.style.position = "relative";
			common.doc.getElementById("popupArea").getElementsByClassName("popupTextArea")[0].appendChild(this.el);


			newsList = common.doc.getElementById("popupArea").getElementsByClassName("announceTitle")[0];
			textField = common.doc.getElementById("popupArea").getElementsByClassName("newsField")[0];
			announceTab = common.doc.getElementById("announceTab");

			// 初期表示のお知らせを表示状態にする
			common.addClass(announceTab.getElementsByClassName(this.currentCategory)[0],"current");
			newsList.classList.add(this.currentCategory);

			// マイページだった場合
			if(common.historyArr[common.historyArr.length-1] !== "Maintenance"){
				// 最新の既読IDをAPIに投げる
				// 既読を取るときはid順に並べて後ろからループさせる
				var sortedLength = this.model.length;
				var checkVal = -1;
				var checkCurrentTime = Date.parse(ajaxControl.getPageJson().currentTime);
				while(sortedLength > 0){
					sortedLength--;

					// iOSのDate.parseバグ対策
					var startAt = this.model[sortedLength].startAt.replace(/-/g,"/");
					var endAt   = this.model[sortedLength].endAt.replace(/-/g,"/");

					//既読よりIDが大きいかつ現在表示のお知らせのみ確認
					if(checkCurrentTime >= Date.parse(startAt) && Date.parse(startAt) > this.readDay && Date.parse(endAt) > checkCurrentTime){
						// 条件を達成した場合はループを終了
						checkVal = this.model[sortedLength].id;
						sortedLength = 0;
					}
				}

				// ローカルではエラー起こすので実行しない
				if(checkVal > -1 && !window.isLocal){
					var callback = function(res){
						common.responseSetStorage(res);
					};
					ajaxControl.ajaxSimpleGet(common.linkList.readAnnounce,"",callback);
				}
			}
		},
		tapNoticeText : function(e) {
			e.preventDefault();
			if(common.isScrolled()) return;
			//お知らせ内容取得
			var __tempList = {
				Notice01: common.doc.getElementById("tempAnnounceNotice01").innerText,
				Notice02: common.doc.getElementById("tempAnnounceNotice02").innerText,
			}
			var _temp = (function(){
				return __tempList[e.currentTarget.dataset.id];
			})();
			var _title = $(e.currentTarget).text();
			common.targetAnnounceOpen({
				announceData: {
					subject: _title,
					startAt: '2024-7-31 00:00:00',
					text: _temp,
				},
			});
		},
		debugBtn: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var announceList = common.doc.getElementsByClassName("announceList")[0];
			var announceText = common.doc.getElementsByClassName("announceText")[0];
			var announceDebug = common.doc.getElementsByClassName("announceDebug")[0];

			announceList.classList.add("none");
			announceText.classList.add("none");
			announceDebug.classList.remove("none");
		},
		debugOpenBtn: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var title = common.doc.getElementById("taTitle").value;
			var text = common.doc.getElementById("taText").value;

			var currentTime = ajaxControl.getPageJson().currentTime;
			currentTime = currentTime.split(" ")[0];
			currentTime = currentTime.replace(/\//g,"-");

			var debugModel = {
				"id": 987654321,
				"displayOs": "ALL",
				"category": "NEW",
				"subject": title,
				"text": text,
				"htmlPath": "",
				"imgPath": "",
				"startAt": currentTime + " 00:00:00",
				"endAt": currentTime + " 23:59:59",
				"sortKey": 10,
				"createdAt": "2017-09-22 20:07:44"
			};
			this.model.unshift(debugModel);

			this.openTextFirst(987654321);
			var announceDebug = common.doc.getElementsByClassName("announceDebug")[0];
			announceDebug.classList.add("none");
		},
		debugCloseBtn: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var announceList = common.doc.getElementsByClassName("announceList")[0];
			var announceDebug = common.doc.getElementsByClassName("announceDebug")[0];

			announceDebug.classList.add("none");
			announceList.classList.remove("none");
		},
		debugClearBtn: function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			common.doc.getElementById("taTitle").value = "";
			common.doc.getElementById("taText").value = "";
		},
		openText: function(e){
			//-------------------------------
			//	お知らせの詳細を開く
			//-------------------------------
			e.preventDefault();
			if(common.isScrolled()) return;

			// 該当のお知らせを検索する
			var currentNews = _.findWhere(this.model,{id:(e.currentTarget.getAttribute("data-newsId") | 0)});

			// なければ開かない（バナー対策)
			if(!currentNews) return;

			// imgPathが指定されていたらDOMを作る
			var imgs = "";
			if(currentNews.imgPath){
				imgs = '<div class="newsImage announceImg"><img src="'+resDir+currentNews.imgPath+'"></div>';
			}

			textField.getElementsByClassName("newsTextField")[0].innerHTML = imgs + currentNews.text;

			if(this.platForm === "DMM" && textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM")){
				var _dmm = textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM");
				var _domCount = 0;
				while(_dmm[_domCount]){
					common.addClass(_dmm[_domCount],"hide");
					_domCount = (_domCount + 1) | 0;
				}
			}

			cmd.getBaseData(common.getNativeObj());

			// 画像サイズ指定なしでも正しくスクロールさせるために
			var images = common.doc.getElementById("scrollTextWrap").getElementsByClassName('announceImg');
			var count  = 0;
			for (var i = 0; i < images.length; i++) {
			    var img = new Image();
			    img.onload = function() {
			        count++;
			        if(count >= images.length){
			        	common.scrollRefresh("scrollTextWrap","newsField",true);
			        }
			    };
			    img.src = images[i].src;
			}

			// 日付の整形＆タイトルの表示
			var dispDate = currentNews.startAt.split("-");

			var replaceTitle = currentNews.subject.replace(/(<br>|<br \/>|<br\/>)/gi, '');
			common.doc.getElementById("announceTitle").getElementsByClassName("announceMultiLine")[0].innerHTML = replaceTitle;
			var cate;
			switch(currentNews.category){
				case "NEW" : cate = "お知らせ";    break;
				case "MNT" : cate = "メンテナンス"; break;
				case "UPD" : cate = "アップデート"; break;
				default : cate = "お知らせ"; break;
			}
			common.doc.getElementById("categoryBanner").innerText = cate;
			common.doc.getElementById("innerDate").innerText = Number(dispDate[1]) +"/"+ Number(dispDate[2].split(" ")[0]);

			// 表示非表示の切替
			common.doc.getElementsByClassName("announceList")[0].classList.add("none");
			common.doc.getElementsByClassName("announceText")[0].classList.remove("none");
			textField.classList.add("on");
			newsList.classList.add("off");
			var miniClose = common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0];
			miniClose.classList.add("on");

			// 右上の閉じるボタンでも閉じるようにイベント登録
			miniClose.addEventListener(common.cgti, this.closeText, false);

			// スクロールをトップに戻す
			common.scrollRefresh("scrollTextWrap","newsField",true);
		},
		openTextFirst: function(newsId){
			//-------------------------------
			//	お知らせの詳細を開く(初期表示版)
			//-------------------------------

			// 該当のお知らせを検索する
			var currentNews = _.findWhere(this.model,{id:(newsId | 0)});

			// なければ開かない（バナー対策)
			if(!currentNews){
				return;
			}

			var checkCurrentTime = Date.parse(ajaxControl.getPageJson().currentTime);

			// そのお知らせが表示始まってるかもチェックする
			// iOSのDate.parseバグ対策
			var startAt = currentNews.startAt.replace(/-/g,"/");
			var endAt   = currentNews.endAt.replace(/-/g,"/");

			if(checkCurrentTime < Date.parse(startAt) && Date.parse(endAt) <= checkCurrentTime) return;

			// imgPathが指定されていたらDOMを作る
			var imgs = "";
			if(currentNews.imgPath){
				imgs = '<div class="newsImage announceImg"><img src="'+resDir+currentNews.imgPath+'"></div>';
			}

			textField.getElementsByClassName("newsTextField")[0].innerHTML = imgs + currentNews.text;

			if(this.platForm === "DMM" && textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM")){
				var _dmm = textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM");
				var _domCount = 0;
				while(_dmm[_domCount]){
					common.addClass(_dmm[_domCount],"hide");
					_domCount = (_domCount + 1) | 0;
				}
			}

			cmd.getBaseData(common.getNativeObj());

			// 画像サイズ指定なしでも正しくスクロールさせるために
			var images = common.doc.getElementById("scrollTextWrap").getElementsByClassName('announceImg');
			var count  = 0;
			for (var i = 0; i < images.length; i++) {
			    var img = new Image();
			    img.onload = function() {
			        count++;
			        if(count >= images.length){
			        	common.scrollRefresh("scrollTextWrap","newsField",true);
			        }
			    };
			    img.src = images[i].src;
			}

			// 日付の整形＆タイトルの表示
			var dispDate = currentNews.startAt.split("-");

			var replaceTitle = currentNews.subject.replace(/(<br>|<br \/>|<br\/>)/gi, '');
			common.doc.getElementById("announceTitle").getElementsByClassName("announceMultiLine")[0].innerHTML = replaceTitle;
			var cate;
			switch(currentNews.category){
				case "NEW" : cate = "お知らせ";    break;
				case "MNT" : cate = "メンテナンス"; break;
				case "UPD" : cate = "アップデート"; break;
				default : cate = "お知らせ"; break;
			}
			common.doc.getElementById("categoryBanner").innerText = cate;
			common.doc.getElementById("innerDate").innerText = Number(dispDate[1]) +"/"+ Number(dispDate[2].split(" ")[0]);

			// 表示非表示の切替
			common.doc.getElementsByClassName("announceList")[0].classList.add("none");
			common.doc.getElementsByClassName("announceText")[0].classList.remove("none");
			textField.classList.add("on");
			newsList.classList.add("off");
			var miniClose = common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0];
			miniClose.classList.add("on");

			// 右上の閉じるボタンでも閉じるようにイベント登録
			miniClose.addEventListener(common.cgti, this.closeText, false);

			// スクロールをトップに戻す
			common.scrollRefresh("scrollTextWrap","newsField",true);
		},
		openTextEvent: function(eventId){
			//-------------------------------
			//	お知らせの詳細を開く(イベントの遊び方)
			//-------------------------------

			// 該当のお知らせを検索する
			var currentNews = _.findWhere(this.model,{eventId:(eventId | 0)});

			// なければ開かない（バナー対策)
			if(!currentNews) return;

			var checkCurrentTime = Date.parse(ajaxControl.getPageJson().currentTime);

			// そのお知らせが表示始まってるかもチェックする
			// iOSのDate.parseバグ対策
			// イベントのときはとりあえずお知らせ表示の確認はしない
			// var startAt = currentNews.startAt.replace(/-/g,"/");
			// var endAt   = currentNews.endAt.replace(/-/g,"/");

			// if(checkCurrentTime < Date.parse(startAt) && Date.parse(endAt) <= checkCurrentTime) return;

			// imgPathが指定されていたらDOMを作る
			var imgs = "";
			if(currentNews.imgPath){
				imgs = '<div class="newsImage announceImg"><img src="'+resDir+currentNews.imgPath+'"></div>';
			}

			textField.getElementsByClassName("newsTextField")[0].innerHTML = imgs + currentNews.text;

			if(this.platForm === "DMM" && textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM")){
				var _dmm = textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM");
				var _domCount = 0;
				while(_dmm[_domCount]){
					common.addClass(_dmm[_domCount],"hide");
					_domCount = (_domCount + 1) | 0;
				}
			}

			cmd.getBaseData(common.getNativeObj());

			// 画像サイズ指定なしでも正しくスクロールさせるために
			var images = common.doc.getElementById("scrollTextWrap").getElementsByClassName('announceImg');
			var count  = 0;
			for (var i = 0; i < images.length; i++) {
			    var img = new Image();
			    img.onload = function() {
			        count++;
			        if(count >= images.length){
			        	common.scrollRefresh("scrollTextWrap","newsField",true);
			        }
			    };
			    img.src = images[i].src;
			}

			// 日付の整形＆タイトルの表示
			var dispDate = currentNews.startAt.split("-");

			var replaceTitle = currentNews.subject.replace(/(<br>|<br \/>|<br\/>)/gi, '');
			common.doc.getElementById("announceTitle").getElementsByClassName("announceMultiLine")[0].innerHTML = replaceTitle;
			var cate;
			switch(currentNews.category){
				case "NEW" : cate = "お知らせ";    break;
				case "MNT" : cate = "メンテナンス"; break;
				case "UPD" : cate = "アップデート"; break;
				default : cate = "お知らせ"; break;
			}
			common.doc.getElementById("categoryBanner").innerText = cate;
			common.doc.getElementById("innerDate").innerText = Number(dispDate[1]) +"/"+ Number(dispDate[2].split(" ")[0]);

			// 表示非表示の切替
			common.doc.getElementsByClassName("announceList")[0].classList.add("none");
			common.doc.getElementsByClassName("announceText")[0].classList.remove("none");
			textField.classList.add("on");
			newsList.classList.add("off");
			var miniClose = common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0];
			miniClose.classList.add("on");

			// イベントの遊び方のときはポップアップ閉じるボタンに
			var eventCloseFunc = function(){
				common.g_popup_instance.popupView.close();
			};
			miniClose.addEventListener(common.cgti, eventCloseFunc, false);

			// 戻るボタンを閉じるボタンにする
			var btn = common.doc.getElementsByClassName("newsClose")[0];
			btn.innerText = "閉じる";
			common.addClass(btn,"eventClose");
			common.removeClass(btn,"newsClose");
			btn.addEventListener(common.cgti, eventCloseFunc, false);

			// スクロールをトップに戻す
			common.scrollRefresh("scrollTextWrap","newsField",true);
		},
		openTextCampaign: function(campaignId){
			//-------------------------------
			//	お知らせの詳細を開く(キャンペーン)
			//-------------------------------

			// 該当のお知らせを検索する
			var currentNews = _.findWhere(this.model,{campaignId:(campaignId | 0)});

			// なければ開かない（バナー対策)
			if(!currentNews) return;

			// imgPathが指定されていたらDOMを作る
			var imgs = "";
			if(currentNews.imgPath){
				imgs = '<div class="newsImage announceImg"><img src="'+resDir+currentNews.imgPath+'"></div>';
			}

			textField.getElementsByClassName("newsTextField")[0].innerHTML = imgs + currentNews.text;

			if(this.platForm === "DMM" && textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM")){
				var _dmm = textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM");
				var _domCount = 0;
				while(_dmm[_domCount]){
					common.addClass(_dmm[_domCount],"hide");
					_domCount = (_domCount + 1) | 0;
				}
			}

			cmd.getBaseData(common.getNativeObj());

			// 画像サイズ指定なしでも正しくスクロールさせるために
			var images = common.doc.getElementById("scrollTextWrap").getElementsByClassName('announceImg');
			var count  = 0;
			for (var i = 0; i < images.length; i++) {
			    var img = new Image();
			    img.onload = function() {
			        count++;
			        if(count >= images.length){
			        	common.scrollRefresh("scrollTextWrap","newsField",true);
			        }
			    };
			    img.src = images[i].src;
			}

			// 日付の整形＆タイトルの表示
			var dispDate = currentNews.startAt.split("-");

			var replaceTitle = currentNews.subject.replace(/(<br>|<br \/>|<br\/>)/gi, '');
			common.doc.getElementById("announceTitle").getElementsByClassName("announceMultiLine")[0].innerHTML = replaceTitle;
			var cate;
			switch(currentNews.category){
				case "NEW" : cate = "お知らせ";    break;
				case "MNT" : cate = "メンテナンス"; break;
				case "UPD" : cate = "アップデート"; break;
				default : cate = "お知らせ"; break;
			}
			common.doc.getElementById("categoryBanner").innerText = cate;
			common.doc.getElementById("innerDate").innerText = Number(dispDate[1]) +"/"+ Number(dispDate[2].split(" ")[0]);

			// 表示非表示の切替
			common.doc.getElementsByClassName("announceList")[0].classList.add("none");
			common.doc.getElementsByClassName("announceText")[0].classList.remove("none");
			textField.classList.add("on");
			newsList.classList.add("off");
			var miniClose = common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0];
			miniClose.classList.add("on");

			// イベントの遊び方のときはポップアップ閉じるボタンに
			var eventCloseFunc = function(){
				common.g_popup_instance.popupView.close();
			};
			miniClose.addEventListener(common.cgti, eventCloseFunc, false);

			// 戻るボタンを閉じるボタンにする
			var btn = common.doc.getElementsByClassName("newsClose")[0];
			btn.innerText = "閉じる";
			common.addClass(btn,"eventClose");
			common.removeClass(btn,"newsClose");
			btn.addEventListener(common.cgti, eventCloseFunc, false);

			// スクロールをトップに戻す
			common.scrollRefresh("scrollTextWrap","newsField",true);
		},
		closeText: function(e){
			//----------------------------------
			// お知らせ詳細を閉じる
			//----------------------------------
			e.preventDefault();
			if(common.isScrolled()) return;

			// 表示の切替関連
			common.doc.getElementsByClassName("announceList")[0].classList.remove("none");
			common.doc.getElementsByClassName("announceText")[0].classList.add("none");
			textField.classList.remove("on");
			newsList.classList.remove("off");
			textField.getElementsByClassName("newsTextField")[0].innerHTML = "";
			common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0].classList.remove("on");

			// スクロールをリフレッシュ
			if(!window.isLocal && common.historyArr[common.historyArr.length-1] !== "Maintenance") common.scrollRefresh("announceBannerArea","scrollBar");
			common.scrollRefresh("newsScrollWarp","announceTitle");
		},
		bannerLink : function(e){
			//---------------------------------
			// リンク付きバナーをタップしたときに遷移
			// ※ポップアップの問題などでready.showさせてから遅延発火させる
			//---------------------------------

			e.preventDefault();
			if(common.isScrolled()) return;

			// リンク先と現在が同一ページだった場合はポップアップを閉じるだけにする
			if(location.hash.indexOf(e.currentTarget.dataset.href) > -1){
				common.g_popup_instance.popupView.close();
				return;
			}

			common.ready.show();

			setTimeout(function(){
				location.href = e.currentTarget.dataset.href;
			},500);
		},
		categoryToggle: function(e){
			//----------------------------------
			// お知らせのカテゴリーを切り替える
			//----------------------------------
			e.preventDefault();
			if(common.isScrolled()) return;
			if(this.currentCategory === e.currentTarget.getAttribute("data-category")) return;

			// 新しいカテゴリーに切り替える
			var newCategory = e.currentTarget.getAttribute("data-category");
			common.removeClass(announceTab.getElementsByClassName(this.currentCategory)[0],"current");
			newsList.classList.remove(this.currentCategory);
			common.addClass(announceTab.getElementsByClassName(newCategory)[0],"current");
			newsList.classList.add(newCategory);

			// 新しいカテゴリを保存する
			this.currentCategory = newCategory;

			// スクローラーをリフレッシュする
			common.scrollRefresh("newsScrollWarp","announceTitle",true);

		},
		andMore : function(e){
			// 過去のお知らせを展開
			e.preventDefault();
			if(common.isScrolled()) return;

			common.addClass(common.doc.getElementById("newsScrollWarp").getElementsByClassName("scrollBar")[0],"moreDisp");
			common.scrollRefresh();

		},
		passPortAnnounce : function(e){
			// globalmenuviewから課金石購入ポップアップを呼び出す
			e.preventDefault();
			if(common.isScrolled()) return;
			common.globalMenuView.moneyPopup(e);
		},
		outerLink : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;

			var uri = e.currentTarget.dataset.outlink;
			if(!uri) return;
			cmd.browserOpen(uri);
		},
		separateOuterLink : function(e){
			// OS切り分けリンクボタン
			e.preventDefault();
			if(common.isScrolled()) return;
			var linkUrl = (common.ua.android) ? e.currentTarget.dataset.androidUrl : e.currentTarget.dataset.iosUrl;

			if(!linkUrl) return;
			cmd.browserOpen(linkUrl);
		},
		announceTextLink : function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			if(common.historyArr[common.historyArr.length-1] !== "Maintenance"){
				var target = e.currentTarget.dataset.href;
				if(!target) return;

				// リンク先と現在が同一ページだった場合はポップアップを閉じるだけにする
				if(location.hash.indexOf(e.currentTarget.dataset.href) > -1){
					common.g_popup_instance.popupView.close();
					return;
				}

				location.href = target;
			}
		},
		openTargetAnnounce: function(announceData){
			// 該当のお知らせを挿入
			var currentNews = announceData;

			// なければ開かない（バナー対策)
			if(!currentNews) return;

			textField.getElementsByClassName("newsTextField")[0].innerHTML = currentNews.text;

			if(this.platForm === "DMM" && textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM")){
				var _dmm = textField.getElementsByClassName("newsTextField")[0].getElementsByClassName("notDMM");
				var _domCount = 0;
				while(_dmm[_domCount]){
					common.addClass(_dmm[_domCount],"hide");
					_domCount = (_domCount + 1) | 0;
				}
			}

			cmd.getBaseData(common.getNativeObj());

			// 画像サイズ指定なしでも正しくスクロールさせるために
			var images = common.doc.getElementById("scrollTextWrap").getElementsByClassName('announceImg');
			var count  = 0;
			for (var i = 0; i < images.length; i++) {
			    var img = new Image();
			    img.onload = function() {
			        count++;
			        if(count >= images.length){
			        	common.scrollRefresh("scrollTextWrap","newsField",true);
			        }
			    };
			    img.src = images[i].src;
			}

			// 日付の整形＆タイトルの表示
			var dispDate = currentNews.startAt.split("-");

			var replaceTitle = currentNews.subject.replace(/(<br>|<br \/>|<br\/>)/gi, '');
			common.doc.getElementById("announceTitle").getElementsByClassName("announceMultiLine")[0].innerHTML = replaceTitle;
			var cate = "お知らせ";
			common.doc.getElementById("categoryBanner").innerText = cate;
			common.doc.getElementById("innerDate").innerText = Number(dispDate[1]) +"/"+ Number(dispDate[2].split(" ")[0]);

			// 表示非表示の切替
			common.doc.getElementsByClassName("announceList")[0].classList.add("none");
			common.doc.getElementsByClassName("announceText")[0].classList.remove("none");
			textField.classList.add("on");
			newsList.classList.add("off");
			var miniClose = common.doc.getElementById("popupArea").getElementsByClassName("newsCloseMini")[0];
			miniClose.classList.add("on");

			// イベントの遊び方のときはポップアップ閉じるボタンに
			var eventCloseFunc = function(){
				common.g_popup_instance.popupView.close();
			};
			miniClose.addEventListener(common.cgti, eventCloseFunc, false);

			// 戻るボタンを閉じるボタンにする
			var btn = common.doc.getElementsByClassName("newsClose")[0];
			btn.innerText = "閉じる";
			common.addClass(btn,"eventClose");
			common.removeClass(btn,"newsClose");
			btn.addEventListener(common.cgti, eventCloseFunc, false);

			// スクロールをトップに戻す
			common.scrollRefresh("scrollTextWrap","newsField",true);
		},
		removeView: function() {
			this.off();
			this.remove();
		}
	});

	return AnnounceView;
});
