
(function(){
	//console block
	if(g_production_flag){
		console.log = function(){};
	}

	var doc = document;
//変数格納
	g_body = doc.getElementsByTagName("body")[0];

//doc.touch
	//toucheventの座標取得をひとつにまとめる
	var spanX = 0;
	var spanY = 0;
	var posX1 = 0;
	var posY1 = 0;

	/*var doubleTouchFlag = false;
	var doubleTouchTimer;*/

	doc.addEventListener("touchstart",documentTouchStart,true);
	if(ua.ios){
		doc.addEventListener("touchmove",documentTouchMove,true);
	}
	doc.addEventListener("touchend",documentTouchEnd,true);

	var touchTime = 0;
	var timeSpan = 0;
	function documentTouchStart(e){
		g_move_span = 0;
		posX1 = e.changedTouches[0].clientX;
		posY1 = e.changedTouches[0].clientY;
		g_window_posY = doc.body.scrollTop;
	}
	function documentTouchMove(e){
		spanX = posX1 - e.changedTouches[0].clientX;
		spanY = posY1 - e.changedTouches[0].clientY;
		spanX = (spanX < 0) ? -spanX : spanX;
		spanY = (spanY < 0) ? -spanY : spanY;
		g_move_span = (spanY - spanX > 0) ? spanY : spanX;
	}
	function documentTouchEnd(e){
		spanX = posX1 - e.changedTouches[0].clientX;
		spanY = posY1 - e.changedTouches[0].clientY;
		spanX = (spanX < 0) ? -spanX : spanX;
		spanY = (spanY < 0) ? -spanY : spanY;
		g_move_span = (spanY - spanX > 0) ? spanY : spanX;

		//ダブルタップ禁止
		var nowTime = new Date().getTime();
		timeSpan = nowTime - touchTime;
		touchTime = nowTime;
	}

//popup
	var bannerAreaLinkStop = doc.getElementById("bannerAreaLinkStop");
	var popupOpen = function(e){

		e.preventDefault();
		if(g_move_span < g_move_span_limit){

			var btnID = e.currentTarget.getAttribute("data-id");
			var delay = e.currentTarget.getAttribute("data-delay");

			//カスタムイベント
			var customEvent = doc.createEvent("HTMLEvents");
			customEvent.initEvent(btnID, true, false);
			var result = this.dispatchEvent(customEvent);

			if(delay){
				var delaytime = parseInt(delay);
				setTimeout( function(){popupStart(btnID);} , delaytime );
			}else{
				popupStart(btnID);
			}
		}
	};

	$(document).on(cgti,".popupBtn",popupOpen);

//headFoot
	function commonInit(){

		//BGM
		mediaPlayBgm();

		//声止める
		gMediaPlayer.stopVOICE();

		//SE止める
		gMediaPlayer.stopSE();


		/*
		* ステータスパネルが最初からあるページを
		* 地味にグローバルに記憶しておく
		上記を元に、ポップアップが閉じるときに、表示を消すかどうか、判断させてください。
		*/
		g_showStatusPanel = (doc.getElementById("statusPanelOpen")) ? true : false;

		//ステータスパネルの表示設定
		var statusMenu = doc.getElementById("statusMenu");
		if(statusMenu){
			StatusFunc.statusApTimeStart();
			if(gMediaPlayer.apRemain){
				gMediaPlayer.apRemain(doc.getElementById("menuStatusApMaxTime").innerText);
			}

		}

		//グローバルメニューのアニメーション登録（z-inde周りの）
		var popup_common_menu = doc.getElementById("popup_common_menu");
		var globalHomeBtn = doc.getElementById("globalHomeBtn");

		//フッターのナビ（騎士団戦）があればタイマー開始
		if(doc.getElementById("common_menu_btn_wrap")){
			menuGvgTimeSet();

			//マーキー対応
			var common_menu_marquee = doc.getElementById("common_menu_marquee");
			var marqueeListLeng = common_menu_marquee.querySelectorAll(".marqueeList").length;

			if(marqueeListLeng == 0){
				common_menu_marquee.style.display = "none";
			}

			var globalMenuCloseBtn = doc.getElementById("globalMenuCloseBtn");
			var btnTime;
			var contentInner = doc.getElementById("bannerWrap").querySelectorAll(".contentInner");
			var totalH = 0;


			//開くボタン
			//新UnitQuestTop、新UnitGVGTop、新AbilitySetの、ホームボタンで保存昨日があるため、
			//CardBasePageの時はイベント登録しない！
			if(!doc.getElementById("CardBasePage") || !doc.getElementById("EventBCBasePage")){
				doc.getElementById("globalMenuBtn").addEventListener(cgti,function(){
					if(isScrolled()) return;

					//カスタムイベント
					var customEvent = doc.createEvent("HTMLEvents");
					customEvent.initEvent("globalMenuOpen", true, false);
					var result = popup_common_menu.dispatchEvent(customEvent);

					gMediaPlayer.playSE("se_kettei02");
					popup_common_menu.className = "show";
					clearTimeout(btnTime);
					btnTime = setTimeout(function(){
						globalMenuCloseBtn.style.pointerEvents = "auto";
					},100);

					//マーキー対応
					if(marqueeListLeng != 0){
						common_menu_marquee.className = "show_0";
					}

					//バナーの細かいレイアウト調節
					if(totalH == 0){
						for(var i = 0 ; i<contentInner.length;i++){
							totalH += $(contentInner[i]).height();
						}
						if(totalH >= 400){
							contentInner[0].style.marginBottom = "10px";
						}
					}
				});
			}

			//閉じるボタン
			globalMenuCloseBtn.addEventListener(cgti,function(){
				if(isScrolled()) return;

				//閉じるイベント
				var customEvent = doc.createEvent("HTMLEvents");
				customEvent.initEvent("globalMenuClose", true, false);
				var result = popup_common_menu.dispatchEvent(customEvent);

				gMediaPlayer.playSE("se_kettei02");
				popup_common_menu.className = "";
				popup_gMenuBtn.openFlag = false;
				global_other_link_btns.className = "";
				clearTimeout(btnTime);
				btnTime = setTimeout(function(){
					globalMenuCloseBtn.style.pointerEvents = "none";
				},100);
			});

			//元その他ボタンイベント登録
			var popup_gMenuBtn = doc.getElementById("popup_gMenuBtn");
			popup_gMenuBtn.openFlag = false;
			popup_gMenuBtn.addEventListener(cgti,function(){
				if(isScrolled()) return;
				gMediaPlayer.playSE("se_kettei02");
				if(this.openFlag){
					global_other_link_btns.className = "";
				}else{
					global_other_link_btns.className = "show";
				}
				this.openFlag = !this.openFlag;
			});
		}
	}

	if(commonLocal){
		commonLocal.ajaxLoadComp(commonInit);
	}else{
		commonInit();
	}


//音イベント設定
	$(document).on("touchend", ".se_decide", mediaSE_decide);
	$(document).on("touchend", ".se_select", mediaSE_select);
	$(document).on("touchend", ".se_ng", mediaSE_ng);
	$(document).on("touchend", ".se_cancel", mediaSE_cancel);

	function mediaSE_decide(e) {
		if (g_move_span < g_move_span_limit) {
			gMediaPlayer.playSE("se_kettei01");
		}
	};
	function mediaSE_select(e) {
		if (g_move_span < g_move_span_limit) {
			gMediaPlayer.playSE("se_kettei02");
		}
	};
	function mediaSE_cancel(e) {
		if (g_move_span < g_move_span_limit) {
			gMediaPlayer.playSE("se_cancel");
		}
	};
	function mediaSE_ng(e) {
		if (g_move_span < g_move_span_limit) {
			gMediaPlayer.playSE("sys_ng");
		}
	};


//SARI
	//ボタンアニメーション
	// if(ua.ios){
	// 	$(document).on("touchstart",".btnBlue,.btnGreen,.btnRed,.btnPurple,.btnYellow" , btnAnimationStart);
	// 	$(document).on("webkitAnimationEnd",".btnBlue,.btnGreen,.btnRed,.btnPurple,.btnYellow" , btnAnimationEnd);
	// }

	var ios8_4_1 = false;
	if(navigator.userAgent.indexOf("OS 8_4_1") != -1){
		ios8_4_1 = true;
	}

	$(document).on("touchstart",".SARI" , sariTouchStart);
	$(document).on("touchend",".SARI" ,sariTouchEnd);

	function sariTouchStart(e){
		//ios8.4.1バグ対応、
		if(!ios8_4_1){
			$(this).addClass("hover");
		}
	}

	function sariTouchEnd(e){
		//ios8.4.1バグ対応、
		if(!ios8_4_1){
			$(this).removeClass("hover");

			if(this.tagName == "A" || this.tagName == "BUTTON" || this.tagName == "INPUT"){
				if(timeSpan < 500){
					e.preventDefault();
					return false;
				}
			}
		}
	}

	//iPhoneSafariバグ対応
	//スクロールしないと背景が出ない件
	if(ua.ios){
		//イベント登録したくないので、ページ表示時に発動
		doc.addEventListener('DOMContentLoaded', function() {
			setTimeout(scrollBy, 100, 0, 1);
		});
	}

	//2重送信対応
	var CLB = document.getElementsByClassName("CLB");
	var CLBFlag = 0;
	if(CLB){
		for(i = 0; i < CLB.length; i++){
			CLB[i].addEventListener(cgti,function(e){
				if(g_move_span > g_move_span_limit) return;
				if(CLBFlag === 0){
					CLBFlag = 1;
					var url = this.getAttribute("data-href").replace(/&amp;/g,"&");
					location.href = url;
				}
			});
		}
	}

	//###########################
	//wkwebview対応 jqueryのajaxグローバルイベントに
	//ヘッダを無理やり突っ込む
	//###########################
	//通常のajaxでも動くかテストする為にいれてみます。
	// gMediaPlayer.getRequestHeader();

	//全てのjqueryAjaxのリクエスト前に、g_snsとg_tokenを突っ込む
	// $(document).ajaxSend(function(e,xhr,settings){
	// 	console.log("settings.type",settings.type);
	// 	if(settings.type == "POST" && !g_production_flag){
	// 		if(g_token){
	// 			xhr.setRequestHeader("USER_TOKEN_JCRRJ98EBK" , g_token);
	// 		}
	// 		if(g_sns && !g_token){
	// 			xhr.setRequestHeader("USER_ID_FBA9X88MAE" , g_sns);
	// 		}

	// 		g_token = null;
	// 		g_sns = null;
	// 	}
	// });
})();
